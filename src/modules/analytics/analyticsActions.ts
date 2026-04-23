import { createAsyncThunk } from '@reduxjs/toolkit'
import { calculateUsagePrediction, UsagePrediction } from './engine/PredictionEngine'
import { RootState } from '@dwwp/store'
import {
  generateInsight,
  sendChatMessage,
  AIInsight,
  ChatMessage,
} from './engine/Wateraiservice'

// ─── Helper: Extract historical month totals ──────────────────────────────────

function extractHistoricalTotals(
  months: Record<string, number> | undefined
): Record<string, number> {
  if (!months) return {}
  return Object.fromEntries(
    Object.entries(months).map(([key, total]) => [key, total ?? 0])
  )
}

// ─── Helper: Sum addon liters for a specific month ────────────────────────────
//
// Addon shape (from payment slice):
//   { id, qty, amount, refill, forMonth, status, ... }
//
// Rules:
//   - Only count addons where status === 'Completed'
//   - Only count addons where forMonth === currentMonthId
//   - `refill` is the total liters for that transaction (not qty * refill)
//   - Skip records where qty === 0 (historical/migrated placeholders)

function sumAddonLitersForMonth(
  addons: any[],
  currentMonthId: string
): number {
  if (!addons?.length) return 0

  return addons
    .filter(
      (txn) =>
        txn.forMonth === currentMonthId &&
        txn.status === 'Completed' &&
        txn.qty > 0
    )
    .reduce((acc, txn) => acc + (txn.refill ?? 0), 0)
}

// ─── Empty prediction fallback (used when no data yet) ───────────────────────

function emptyPrediction(): UsagePrediction {
  return {
    projectedMonthlyUsage: 0,
    riskLevel: 'safe',
    riskPercentage: 0,
    currentUsage: 0,
    effectiveLimit: 0,
    expectedByNow: 0,
    paceRatio: 0,
    daysElapsed: new Date().getDate(),
    daysRemaining: 30 - new Date().getDate(),
    projectedDailyAverage: 0,
    seasonalFactor: 1,
    season: 'Unknown',
    festivePeriod: null,
    historicalDailyAverage: 0,
    currentDailyAverage: 0,
    trend: 'stable',
    trendMagnitude: 0,
    alerts: [],
    confidence: 0,
    dataQuality: 'low',
    lastUpdated: new Date().toISOString(),
  }
}

// ─── calculatePrediction ──────────────────────────────────────────────────────

export const calculatePrediction = createAsyncThunk<
  UsagePrediction,
  void,
  { state: RootState; rejectValue: string }
>(
  'analytics/calculatePrediction',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()

      const currentMonthId = state.usage.currentMonthId
      const currentMonth = currentMonthId ? state.usage.months?.[currentMonthId] : null

      // No current month data yet — return empty prediction, don't throw
      if (!currentMonthId || !currentMonth) {
        return emptyPrediction()
      }

      const currentUsage: number = (() => {
        // currentMonth.total from the listener already includes today's usage.
        // But if todayUsage was updated more recently (e.g. separate fetch on cold
        // start), we ensure we use the freshest data by taking the max.
        const monthTotal: number = currentMonth.total ?? 0
        const todayUsage: number = state.usage.todayUsage ?? 0
        const days = currentMonth.days ?? {}
        const todayKey = (() => {
          const d = new Date()
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${day}`
        })()
        const todayInSnapshot: number = days[todayKey] ?? 0

        // If live todayUsage > what's in the snapshot, adjust upward
        if (todayUsage > todayInSnapshot) {
          return monthTotal - todayInSnapshot + todayUsage
        }
        return monthTotal
      })()

      // Use the admin-configured limit (same source as selectCurrentMonthLimit)
      // Falls back to currentMonth.limit, then to 2000
      const monthlyLimit: number =
        state.dashboard?.limitConfig?.regular ??
        state.dashboard?.currentMonth?.limit ??
        2000

      // ── Addon liters for this month only ────────────────────────────────────
      const addons: any[] = state.payment?.addons ?? []
      const addonLiters = sumAddonLitersForMonth(addons, currentMonthId)

      // ── Historical months { '2025-03': 2840, '2025-02': 3100, ... } ─────────
      // Exclude the current month from history (it's not complete yet)
      const allMonths = extractHistoricalTotals(state.usage.allTimeMonths)
      const historicalMonths = Object.fromEntries(
        Object.entries(allMonths).filter(([key]) => key !== currentMonthId)
      )

      // ── Run the engine ───────────────────────────────────────────────────────
      const prediction = calculateUsagePrediction(
        currentUsage,
        monthlyLimit,
        addonLiters,
        historicalMonths
      )

      return prediction
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to calculate prediction')
    }
  }
)

// ─── recalculateHistoricalPredictions ────────────────────────────────────────

export const recalculateHistoricalPredictions = createAsyncThunk<
  Record<string, UsagePrediction>,
  void,
  { state: RootState; rejectValue: string }
>(
  'analytics/recalculateHistorical',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const monthlyLimit: number =
        state.dashboard?.limitConfig?.regular ??
        state.dashboard?.currentMonth?.limit ??
        2000
      const historicalMonths = extractHistoricalTotals(state.usage.allTimeMonths)

      const predictions: Record<string, UsagePrediction> = {}

      for (const [monthKey, totalUsage] of Object.entries(historicalMonths)) {
        // For completed months, actual usage IS the projection
        // Use the engine with daysRemaining=0 effectively by passing full month usage
        // We build a minimal but type-safe prediction for historical display
        const riskPercentage = Math.round((totalUsage / Math.max(monthlyLimit, 1)) * 100)
        const riskLevel =
          riskPercentage >= 95 ? 'critical' : riskPercentage >= 78 ? 'warning' : 'safe'
        const dailyAvg = Math.round(totalUsage / 30)

        predictions[monthKey] = {
          projectedMonthlyUsage: totalUsage,
          riskLevel,
          riskPercentage,
          currentUsage: totalUsage,
          effectiveLimit: monthlyLimit,
          expectedByNow: monthlyLimit,
          paceRatio: Math.round((totalUsage / Math.max(monthlyLimit, 1)) * 100) / 100,
          daysElapsed: 30,
          daysRemaining: 0,
          projectedDailyAverage: dailyAvg,
          seasonalFactor: 1,
          season: 'Historical',
          festivePeriod: null,
          historicalDailyAverage: dailyAvg,
          currentDailyAverage: dailyAvg,
          trend: 'stable',
          trendMagnitude: 0,
          alerts: [],
          confidence: 100,
          dataQuality: 'high',
          lastUpdated: new Date().toISOString(),
        }
      }

      return predictions
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to recalculate predictions')
    }
  }
)

// ─── fetchAIInsight ──────────────────────────────────────────────────────────

export const fetchAIInsight = createAsyncThunk<
  AIInsight,
  void,
  { state: RootState; rejectValue: string }
>(
  'analytics/fetchAIInsight',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const prediction = state.analytics.currentPrediction

      if (!prediction) {
        return rejectWithValue('No prediction data available yet')
      }

      const insight = await generateInsight(prediction)
      return insight
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to generate AI insight')
    }
  }
)

// ─── sendAIChatMessage ───────────────────────────────────────────────────────

export const sendAIChatMessage = createAsyncThunk<
  { userMessage: string; aiReply: string },
  string,
  { state: RootState; rejectValue: string }
>(
  'analytics/sendAIChatMessage',
  async (userMessage, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const prediction = state.analytics.currentPrediction

      if (!prediction) {
        return rejectWithValue('No prediction data available')
      }

      const history: ChatMessage[] = state.analytics.chatHistory ?? []

      const aiReply = await sendChatMessage(prediction, history, userMessage)
      return { userMessage, aiReply }
    } catch (error: any) {
      let message = error.message ?? 'Failed to get AI response'
      if (message.includes('429') || message.includes('quota')) {
        message = "AI is currently busy. Please wait a few seconds before asking another question."
      }
      return rejectWithValue(message)
    }
  }
)
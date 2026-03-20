import { createAsyncThunk } from '@reduxjs/toolkit'
import { calculateUsagePrediction, UsagePrediction } from "./engine/Predictionengine ";
import { RootState } from '@dwwp/store';

// ─── Helper: Convert usage months to { monthKey: total } ─────────────────────
function extractHistoricalTotals(
    months: Record<string, { total: number }> | undefined
): Record<string, number> {
    if (!months) return {}
    return Object.fromEntries(
        Object.entries(months).map(([key, month]) => [key, month.total ?? 0])
    )
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────
export const calculatePrediction = createAsyncThunk<
    UsagePrediction,
    void,
    { state: RootState; rejectValue: string }
>('analytics/calculatePrediction',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState()

            // Current month data
            const currentMonthId = state.usage.currentMonthId
            if (!currentMonthId) {
                throw new Error('No current month selected')
            }

            const currentMonth = state.usage.months?.[currentMonthId]
            const currentUsage = currentMonth?.total ?? 0

            const monthlyLimit = state.dashboard?.currentMonth?.limit ?? 2000

            // Historical months (convert objects to totals)
            const historicalMonths = extractHistoricalTotals(state.usage.months)

            const allTimeDaysTotal = state.usage.allTimeDaysTotal ?? 0

            // Addons applied to the current month
            const addons = state.payment?.addons ?? []
            const totalAddons = addons
                .filter((txn: any) => txn.forMonth === currentMonthId)
                .reduce((acc: number, item: any) => acc + (item.qty * item.refill || 0), 0)

            const effectiveLimit = monthlyLimit + totalAddons

            // Calculate prediction
            const prediction = calculateUsagePrediction(
                currentUsage,
                monthlyLimit,
                historicalMonths,
                allTimeDaysTotal,
                effectiveLimit
            )

            return prediction
        } catch (error: any) {
            return rejectWithValue(error.message ?? 'Failed to calculate prediction')
        }
    })

export const recalculateHistoricalPredictions = createAsyncThunk<
    Record<string, UsagePrediction>,
    void,
    { state: RootState; rejectValue: string }
>('analytics/recalculateHistorical', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState()
        const monthlyLimit = state.dashboard?.currentMonth?.limit ?? 2000
        const historicalMonths = extractHistoricalTotals(state.usage.months)

        const predictions: Record<string, UsagePrediction> = {}

        // For each historical month, create a simple prediction
        for (const [monthKey, totalUsage] of Object.entries(historicalMonths)) {
            const riskPercentage = (totalUsage / monthlyLimit) * 100
            const riskLevel = riskPercentage > 95 ? 'critical' : riskPercentage > 75 ? 'warning' : 'safe'

            predictions[monthKey] = {
                projectedMonthlyUsage: totalUsage,
                projectedEndOfMonth: totalUsage,
                riskLevel,
                riskPercentage,
                currentUsage: totalUsage,
                expectedByNow: monthlyLimit,
                paceRatio: totalUsage / monthlyLimit,
                daysRemaining: 0,
                projectedDailyAverage: totalUsage / 30,
                seasonalFactor: 1,
                season: 'Historical',
                isFestiveDay: false,
                averageDailyUsage: totalUsage / 30,
                trend: 'stable',
                trendMagnitude: 0,
                alerts: [],
                confidence: 100,
                lastUpdated: new Date().toISOString(),
            }
        }

        return predictions
    } catch (error: any) {
        return rejectWithValue(error.message ?? 'Failed to recalculate predictions')
    }
})

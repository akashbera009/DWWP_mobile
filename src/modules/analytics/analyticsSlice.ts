import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@dwwp/store'
import { UsagePrediction } from './engine/PredictionEngine'
import { AIInsight, ChatMessage } from './engine/Wateraiservice'
import {
  calculatePrediction,
  recalculateHistoricalPredictions,
  fetchAIInsight,
  sendAIChatMessage,
} from './analyticsActions'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalyticsState {
  // Prediction
  currentPrediction: UsagePrediction | null
  predictions: Record<string, UsagePrediction> // monthKey -> prediction
  isLoading: boolean
  error: string | null
  lastCalculated: string | null
  cacheExpiry: number // Timestamp when cache expires (6 hours)

  // AI Insight
  aiInsight: AIInsight | null
  aiInsightLoading: boolean
  aiInsightError: string | null

  // AI Chat
  chatHistory: ChatMessage[]
  chatLoading: boolean
  chatError: string | null
  isChatOpen: boolean
}

const initialState: AnalyticsState = {
  currentPrediction: null,
  predictions: {},
  isLoading: false,
  error: null,
  lastCalculated: null,
  cacheExpiry: 0,

  aiInsight: null,
  aiInsightLoading: false,
  aiInsightError: null,

  chatHistory: [],
  chatLoading: false,
  chatError: null,
  isChatOpen: false,
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setPrediction: (state, action: PayloadAction<UsagePrediction>) => {
      state.currentPrediction = action.payload
      state.lastCalculated = new Date().toISOString()
      state.cacheExpiry = Date.now() + 6 * 60 * 60 * 1000
    },

    clearCache: (state) => {
      state.cacheExpiry = 0
    },

    clearAnalytics: (state) => {
      state.currentPrediction = null
      state.predictions = {}
      state.error = null
      state.lastCalculated = null
      state.cacheExpiry = 0
      state.aiInsight = null
      state.chatHistory = []
    },

    // ── AI Chat reducers ──────────────────────────────────────────────────────
    toggleChat: (state) => {
      state.isChatOpen = !state.isChatOpen
    },

    openChat: (state) => {
      state.isChatOpen = true
    },

    closeChat: (state) => {
      state.isChatOpen = false
    },

    clearChatHistory: (state) => {
      state.chatHistory = []
      state.chatError = null
    },

    clearAIInsight: (state) => {
      state.aiInsight = null
      state.aiInsightError = null
    },
  },
  extraReducers: (builder) => {
    // ── Calculate Prediction ──────────────────────────────────────────────────
    builder
      .addCase(calculatePrediction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(calculatePrediction.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPrediction = action.payload
        state.lastCalculated = new Date().toISOString()
        state.cacheExpiry = Date.now() + 6 * 60 * 60 * 1000
      })
      .addCase(calculatePrediction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? 'Failed to calculate prediction'
      })

    // ── Recalculate Historical ────────────────────────────────────────────────
    builder
      .addCase(recalculateHistoricalPredictions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(recalculateHistoricalPredictions.fulfilled, (state, action) => {
        state.isLoading = false
        state.predictions = action.payload
      })
      .addCase(recalculateHistoricalPredictions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? 'Failed to recalculate predictions'
      })

    // ── AI Insight ────────────────────────────────────────────────────────────
    builder
      .addCase(fetchAIInsight.pending, (state) => {
        state.aiInsightLoading = true
        state.aiInsightError = null
      })
      .addCase(fetchAIInsight.fulfilled, (state, action) => {
        state.aiInsightLoading = false
        state.aiInsight = action.payload
      })
      .addCase(fetchAIInsight.rejected, (state, action) => {
        state.aiInsightLoading = false
        state.aiInsightError = action.payload ?? 'Failed to generate insight'
      })

    // ── AI Chat ──────────────────────────────────────────────────────────────
    builder
      .addCase(sendAIChatMessage.pending, (state, action) => {
        state.chatLoading = true
        state.chatError = null
        // Optimistically add user message to history
        state.chatHistory.push({
          role: 'user',
          content: action.meta.arg,
        })
      })
      .addCase(sendAIChatMessage.fulfilled, (state, action) => {
        state.chatLoading = false
        // Add AI reply to history
        state.chatHistory.push({
          role: 'model',
          content: action.payload.aiReply,
        })
      })
      .addCase(sendAIChatMessage.rejected, (state, action) => {
        state.chatLoading = false
        state.chatError = action.payload ?? 'Failed to get AI response'
        // Remove the optimistically added user message on failure
        if (state.chatHistory.length > 0) {
          const last = state.chatHistory[state.chatHistory.length - 1]
          if (last.role === 'user') {
            state.chatHistory.pop()
          }
        }
      })
  },
})

// ─── Exports ──────────────────────────────────────────────────────────────────
export const {
  setPrediction,
  clearCache,
  clearAnalytics,
  toggleChat,
  openChat,
  closeChat,
  clearChatHistory,
  clearAIInsight,
} = analyticsSlice.actions
export default analyticsSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentPrediction = (state: RootState) => state.analytics?.currentPrediction

export const selectPredictionRiskLevel = (state: RootState) =>
  state.analytics?.currentPrediction?.riskLevel

export const selectProjectedMonthlyUsage = (state: RootState) =>
  state.analytics?.currentPrediction?.projectedMonthlyUsage

export const selectPredictionAlerts = (state: RootState) =>
  state.analytics?.currentPrediction?.alerts ?? []

export const selectShouldRecalculatePrediction = (state: RootState) => {
  const now = Date.now()
  const expiry = state.analytics?.cacheExpiry ?? 0
  return now > expiry
}

export const selectPredictionConfidence = (state: RootState) =>
  state.analytics?.currentPrediction?.confidence ?? 0

export const selectPredictionIsLoading = (state: RootState) => state.analytics?.isLoading ?? false

// ── AI selectors ──────────────────────────────────────────────────────────────
export const selectAIInsight = (state: RootState) => state.analytics?.aiInsight
export const selectAIInsightLoading = (state: RootState) => state.analytics?.aiInsightLoading ?? false
export const selectAIInsightError = (state: RootState) => state.analytics?.aiInsightError

export const selectChatHistory = (state: RootState) => state.analytics?.chatHistory ?? []
export const selectChatLoading = (state: RootState) => state.analytics?.chatLoading ?? false
export const selectChatError = (state: RootState) => state.analytics?.chatError
export const selectIsChatOpen = (state: RootState) => state.analytics?.isChatOpen ?? false
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@dwwp/store'
import { UsagePrediction } from './engine/Predictionengine '
import { calculatePrediction, recalculateHistoricalPredictions } from './analyticsActions'
// ─── Types ────────────────────────────────────────────────────────────────────
export interface AnalyticsState {
  currentPrediction: UsagePrediction | null
  predictions: Record<string, UsagePrediction> // monthKey -> prediction
  isLoading: boolean
  error: string | null
  lastCalculated: string | null
  cacheExpiry: number // Timestamp when cache expires (6 hours)
}

const initialState: AnalyticsState = {
  currentPrediction: null,
  predictions: {},
  isLoading: false,
  error: null,
  lastCalculated: null,
  cacheExpiry: 0,
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
    },
  },
  extraReducers: (builder) => {
    // Calculate Prediction
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

    // Recalculate Historical
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
  },
})

// ─── Exports ──────────────────────────────────────────────────────────────────
export const { setPrediction, clearCache, clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer

// ─── Selectors (with proper optional chaining) ───────────────────────────────
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
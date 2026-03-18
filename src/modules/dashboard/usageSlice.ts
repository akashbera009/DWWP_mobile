// usageSlice.ts  
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MonthUsage, usageInitialState } from '@dwwp/modals'
import { fetchAllTimeDays, fetchAllTimeMonths, fetchTodayUsage, listenCurrentMonth, stopCurrentMonthListener } from './usageActions'

const usageSlice = createSlice({
  name: "usage",
  initialState: usageInitialState,

  // ── Synchronous reducers ─────────────────────
  reducers: {
    /** Upsert a full month into the cache */
    setMonth(state, action: PayloadAction<MonthUsage>) {
      const month = action.payload
      state.months[month.monthId] = month
    },

    /** Update today's usage (from snapshot or one-off fetch) */
    setTodayUsage(state, action: PayloadAction<number>) {
      state.todayUsage = action.payload
    },

    /** Set which month is considered "current" */
    setCurrentMonth(state, action: PayloadAction<string>) {
      state.currentMonthId = action.payload
    },

    /** Replace the full per-month totals map */
    setAllTimeMonths(
      state,
      action: PayloadAction<Record<string, number>>
    ) {
      state.allTimeMonths = action.payload
    },

    /** Set the grand total across all past days */
    setAllTimeDaysTotal(state, action: PayloadAction<number>) {
      state.allTimeDaysTotal = action.payload
    },

    /** Mark whether historical data has been fetched */
    setHistoryLoaded(state, action: PayloadAction<boolean>) {
      state.historyLoaded = action.payload
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },

    /** Full reset — call on logout */
    resetUsage() {
      return usageInitialState
    },
  },

  // ── Async thunk lifecycle reducers ───────────
  extraReducers: (builder) => {
    // ── listenCurrentMonth ──────────────────────
    builder
      .addCase(listenCurrentMonth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(listenCurrentMonth.fulfilled, (state) => {
        // Listener registered — actual data arrives via setMonth/setTodayUsage
        state.loading = false
      })
      .addCase(listenCurrentMonth.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to start listener'
      })

    // ── stopCurrentMonthListener ────────────────
    builder
      .addCase(stopCurrentMonthListener.fulfilled, () => {
        // Nothing to update in state; listener is stopped
      })

    // ── fetchTodayUsage ─────────────────────────
    builder
      .addCase(fetchTodayUsage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTodayUsage.fulfilled, (state, action) => {
        state.loading = false
        state.todayUsage = action.payload ?? 0
      })
      .addCase(fetchTodayUsage.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to fetch today usage'
      })

    // ── fetchAllTimeMonths ──────────────────────
    builder
      .addCase(fetchAllTimeMonths.pending, (state) => {
        state.loading = true
        state.error = null
        state.historyLoaded = false // reset while re-fetching
      })
      .addCase(fetchAllTimeMonths.fulfilled, (state, action) => {
        state.loading = false
        state.allTimeMonths = action.payload ?? {}
        state.historyLoaded = true
      })
      .addCase(fetchAllTimeMonths.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to fetch history'
      })

    // ── fetchAllTimeDays ────────────────────────
    builder
      .addCase(fetchAllTimeDays.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllTimeDays.fulfilled, (state, action) => {
        state.loading = false
        state.allTimeDaysTotal = action.payload ?? 0
      })
      .addCase(fetchAllTimeDays.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to fetch all-time days'
      })
  },
})

export const {
  setMonth,
  setTodayUsage,
  setCurrentMonth,
  setAllTimeMonths,
  setAllTimeDaysTotal,
  setHistoryLoaded,
  setError,
  setLoading,
  resetUsage,
} = usageSlice.actions

export default usageSlice.reducer
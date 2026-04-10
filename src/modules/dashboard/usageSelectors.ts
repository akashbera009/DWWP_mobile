// ─────────────────────────────────────────────
//  usageSelectors.ts
//  Memoised selectors for usage state.
//  Import into your components / hooks instead of reading state directly.
// ─────────────────────────────────────────────

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

// ── Base selector ─────────────────────────────
const selectUsage = (state: RootState) => state.usage

// ── Primitive selectors ───────────────────────
export const selectCurrentMonthId = (state: RootState) =>
  state.usage.currentMonthId

export const selectTodayUsage = (state: RootState) =>
  state.usage.todayUsage

export const selectAllTimeMonths = (state: RootState) =>
  state.usage.allTimeMonths

export const selectAllTimeDaysTotal = (state: RootState) =>
  state.usage.allTimeDaysTotal

export const selectHistoryLoaded = (state: RootState) =>
  state.usage.historyLoaded

export const selectUsageLoading = (state: RootState) =>
  state.usage.loading

export const selectUsageError = (state: RootState) =>
  state.usage.error

// ── Current month data ────────────────────────

/** Returns the full MonthUsage object for the current month, or undefined */
export const selectCurrentMonth = createSelector(
  selectUsage,
  (usage) =>
    usage.currentMonthId ? usage.months[usage.currentMonthId] : undefined
)

/** Current month total liters */
export const selectCurrentMonthTotal = createSelector(
  selectCurrentMonth,
  (month) => month?.total ?? 0
)

/** Current month daily map for charts */
export const selectCurrentMonthDays = createSelector(
  selectCurrentMonth,
  (month) => month?.days ?? {}
)

/** Current month usage limit */

const selectConfig = (state: RootState) => state.dashboard
export const selectCurrentConfig = createSelector(
  selectConfig,
  (config) => config?.limitConfig?.regular ?? null
)
export const selectCurrentMonthLimit = createSelector(
  selectCurrentConfig,
  (limit) => limit ?? null
)

/** True if limit is exceeded this month */
export const selectLimitExceeded = createSelector(
  selectCurrentMonth,
  (month) => month?.limitExceeded ?? false
)

// ── All-time aggregates ───────────────────────

/**
 * Grand total across all past months + current month total.
 * Useful for a "lifetime usage" stat card.
 */
export const selectLifetimeTotal = createSelector(
  selectAllTimeDaysTotal,
  selectCurrentMonthTotal,
  (historical, current) => historical + current
)

/**
 * Sorted array of past months for a history chart.
 * Returns [{ monthId: "YYYY-MM", total: number }] ascending by month.
 */
export const selectMonthlyHistory = createSelector(
  selectAllTimeMonths,
  (allTimeMonths) =>
    Object.entries(allTimeMonths)
      .map(([monthId, total]) => ({ monthId, total }))
      .sort((a, b) => a.monthId.localeCompare(b.monthId))
)

/**
 * Current month daily usage as a sorted array for charts.
 * Returns [{ date: "YYYY-MM-DD", liters: number }] ascending.
 */
export const selectDailyChartData = createSelector(
  selectCurrentMonthDays,
  (days) =>
    Object.entries(days)
      .map(([date, liters]) => ({ date, liters }))
      .sort((a, b) => a.date.localeCompare(b.date))
)
// /**
//  * store/slices/analyticsSlice.ts
//  *
//  * Historical usage data across multiple months.
//  * Lazy-loads months only when needed — skips re-fetch if already loaded.
//  *
//  * Firebase paths:
//  *   users/{email}/monthlyUsages/{YYYY-MM}          → MonthData
//  *   users/{email}/monthlyUsages/{YYYY-MM}/addon/   → AddonEntry[]
//  *   users/{email}/monthlyUsages/{YYYY-MM}/payment/ → PaymentRecord
//  */

// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
// import firestore from '@react-native-firebase/firestore'
// import type { RootState } from '../index'

// // ─── Types ────────────────────────────────────────────────────────────────────
// export interface MonthData {
//     monthKey: string
//     limit: number
//     limitExceeded: boolean
//     isMonthFinish: boolean
//     dailyUsages: Record<string, number>
//     totalConsumed: number
// }

// export interface AddonEntry {
//     id: string
//     qty: number    // liters added
//     amount: number    // ₹ paid
//     addon_date: string    // ISO
//     razor_pay_id: string
//     status: string
// }

// interface AnalyticsState {
//     months: Record<string, MonthData>      // keyed by "YYYY-MM"
//     addons: Record<string, AddonEntry[]>   // keyed by "YYYY-MM"
//     loadedMonths: string[]                       // months already fetched
//     selectedMonth: string                        // which month user is viewing
//     isLoading: boolean
//     error: string | null
// }

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// function getPastMonthKeys(count: number): string[] {
//     const keys: string[] = []
//     const now = new Date()
//     for (let i = 0; i < count; i++) {
//         const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
//         keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
//     }
//     return keys
// }

// function sumDailyUsages(usages: Record<string, number>): number {
//     return Object.values(usages).reduce((s, v) => s + v, 0)
// }

// function parseMonthDoc(monthKey: string, data: Record<string, any>): MonthData {
//     const metaKeys = ['limit', 'limitExceeded', 'isMonthFinish', 'payment', 'addon']
//     const dailyUsages: Record<string, number> = {}
//     Object.entries(data).forEach(([k, v]) => {
//         if (!metaKeys.includes(k) && typeof v === 'number') dailyUsages[k] = v
//     })
//     return {
//         monthKey,
//         limit: data.limit ?? 0,
//         limitExceeded: data.limitExceeded ?? false,
//         isMonthFinish: data.isMonthFinish ?? false,
//         dailyUsages,
//         totalConsumed: sumDailyUsages(dailyUsages),
//     }
// }

// // ─── Thunks ───────────────────────────────────────────────────────────────────

// /**
//  * fetchMonth
//  * Lazy-loads a single month. Skips if already in loadedMonths.
//  */
// export const fetchMonth = createAsyncThunk<
//     MonthData,
//     { email: string; monthKey: string },
//     { rejectValue: string; state: RootState }
// >('analytics/fetchMonth', async ({ email, monthKey }, { rejectWithValue, getState }) => {
//     try {
//         // Skip if already loaded
//         if (getState().analytics.loadedMonths.includes(monthKey)) {
//             return getState().analytics.months[monthKey]
//         }

//         const snap = await firestore()
//             .collection('users').doc(email)
//             .collection('monthlyUsages').doc(monthKey)
//             .get()

//         return parseMonthDoc(monthKey, snap.data() ?? {})
//     } catch (e: any) {
//         return rejectWithValue(e.message ?? `Failed to fetch ${monthKey}.`)
//     }
// })

// /**
//  * fetchMonthAddons
//  * Pulls addon subcollection for a specific month.
//  */
// export const fetchMonthAddons = createAsyncThunk<
//     { monthKey: string; addons: AddonEntry[] },
//     { email: string; monthKey: string },
//     { rejectValue: string }
// >('analytics/fetchMonthAddons', async ({ email, monthKey }, { rejectWithValue }) => {
//     try {
//         const snap = await firestore()
//             .collection('users').doc(email)
//             .collection('monthlyUsages').doc(monthKey)
//             .collection('addon')
//             .get()

//         const addons: AddonEntry[] = snap.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data(),
//         } as AddonEntry))

//         return { monthKey, addons }
//     } catch (e: any) {
//         return rejectWithValue(e.message ?? 'Failed to fetch addons.')
//     }
// })

// /**
//  * fetchLast6Months
//  * Batch-fetches last 6 months for chart display on dashboard.
//  * Each month is fetched only if not already in store.
//  */
// export const fetchLast6Months = createAsyncThunk<
//     MonthData[],
//     { email: string },
//     { rejectValue: string; state: RootState }
// >('analytics/fetchLast6Months', async ({ email }, { rejectWithValue, getState }) => {
//     try {
//         const monthKeys = getPastMonthKeys(6)
//         const loadedMonths = getState().analytics.loadedMonths
//         const toFetch = monthKeys.filter(k => !loadedMonths.includes(k))

//         const results = await Promise.all(
//             toFetch.map(async (monthKey) => {
//                 const snap = await firestore()
//                     .collection('users').doc(email)
//                     .collection('monthlyUsages').doc(monthKey)
//                     .get()
//                 return parseMonthDoc(monthKey, snap.data() ?? {})
//             })
//         )

//         // Merge already-loaded months with newly fetched
//         const existing = monthKeys
//             .filter(k => loadedMonths.includes(k))
//             .map(k => getState().analytics.months[k])
//             .filter(Boolean)

//         return [...existing, ...results]
//     } catch (e: any) {
//         return rejectWithValue(e.message ?? 'Failed to fetch usage history.')
//     }
// })

// /**
//  * clearOldMonths
//  * Evicts months older than `keepCount` to keep the store lean.
//  */
// export const clearOldMonths = createAsyncThunk<string[], { keepCount?: number }, { state: RootState }>(
//     'analytics/clearOldMonths',
//     async ({ keepCount = 3 }, { getState }) => {
//         const allKeys = getState().analytics.loadedMonths
//         const sortedKeys = [...allKeys].sort().reverse()           // newest first
//         return sortedKeys.slice(keepCount)                          // keys to evict
//     }
// )

// // ─── Initial state ────────────────────────────────────────────────────────────
// const now = new Date()
// const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

// const initialState: AnalyticsState = {
//     months: {},
//     addons: {},
//     loadedMonths: [],
//     selectedMonth: currentMonthKey,
//     isLoading: false,
//     error: null,
// }

// // ─── Slice ────────────────────────────────────────────────────────────────────
// const analyticsSlice = createSlice({
//     name: 'analytics',
//     initialState,
//     reducers: {
//         setSelectedMonth: (state, action: PayloadAction<string>) => {
//             state.selectedMonth = action.payload
//         },
//         clearAnalyticsError: (state) => { state.error = null },
//         resetAnalytics: () => initialState,
//     },

//     extraReducers: (builder) => {
//         // fetchMonth
//         builder
//             .addCase(fetchMonth.pending, (state) => { state.isLoading = true; state.error = null })
//             .addCase(fetchMonth.fulfilled, (state, { payload }) => {
//                 state.isLoading = false
//                 state.months[payload.monthKey] = payload
//                 if (!state.loadedMonths.includes(payload.monthKey)) {
//                     state.loadedMonths.push(payload.monthKey)
//                 }
//             })
//             .addCase(fetchMonth.rejected, (state, { payload }) => {
//                 state.isLoading = false
//                 state.error = payload ?? 'Failed to load month.'
//             })

//         // fetchMonthAddons
//         builder
//             .addCase(fetchMonthAddons.pending, (state) => { state.isLoading = true })
//             .addCase(fetchMonthAddons.fulfilled, (state, { payload }) => {
//                 state.isLoading = false
//                 state.addons[payload.monthKey] = payload.addons
//             })
//             .addCase(fetchMonthAddons.rejected, (state, { payload }) => {
//                 state.isLoading = false
//                 state.error = payload ?? 'Failed to load addons.'
//             })

//         // fetchLast6Months
//         builder
//             .addCase(fetchLast6Months.pending, (state) => { state.isLoading = true; state.error = null })
//             .addCase(fetchLast6Months.fulfilled, (state, { payload }) => {
//                 state.isLoading = false
//                 payload.forEach(month => {
//                     state.months[month.monthKey] = month
//                     if (!state.loadedMonths.includes(month.monthKey)) {
//                         state.loadedMonths.push(month.monthKey)
//                     }
//                 })
//             })
//             .addCase(fetchLast6Months.rejected, (state, { payload }) => {
//                 state.isLoading = false
//                 state.error = payload ?? 'Failed to load history.'
//             })

//         // clearOldMonths
//         builder
//             .addCase(clearOldMonths.fulfilled, (state, { payload: toEvict }) => {
//                 toEvict.forEach(key => {
//                     delete state.months[key]
//                     delete state.addons[key]
//                     state.loadedMonths = state.loadedMonths.filter(k => k !== key)
//                 })
//             })
//     },
// })

// export const {
//     setSelectedMonth,
//     clearAnalyticsError,
//     resetAnalytics,
// } = analyticsSlice.actions

// export default analyticsSlice.reducer

// // ─── Selectors ────────────────────────────────────────────────────────────────
// export const selectAllMonths = (s: RootState) => s.analytics.months
// export const selectSelectedMonth = (s: RootState) => s.analytics.selectedMonth
// export const selectLoadedMonths = (s: RootState) => s.analytics.loadedMonths
// export const selectAnalyticsLoading = (s: RootState) => s.analytics.isLoading
// export const selectAnalyticsError = (s: RootState) => s.analytics.error

// export const selectMonth = (monthKey: string) => (s: RootState): MonthData | undefined =>
//     s.analytics.months[monthKey]

// export const selectAddonsForMonth = (monthKey: string) => (s: RootState): AddonEntry[] =>
//     s.analytics.addons[monthKey] ?? []

// // For the bar chart — returns last N months sorted oldest → newest
// export const selectChartData = (count = 6) => (s: RootState) => {
//     return Object.values(s.analytics.months)
//         .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
//         .slice(-count)
//         .map(m => ({ month: m.monthKey.slice(5), value: m.totalConsumed }))
// }
// /**
//  * store/slices/appConfigSlice.ts
//  *
//  * Fetches pricing and quota limits from the admin Firestore document.
//  * These values are needed by ALL users for:
//  *   - Displaying quota (dashboard)
//  *   - Calculating bill amount (dashboard + payment)
//  *   - Penalty vs regular rate logic
//  *
//  * Firebase path:
//  *   admin/{ADMIN_DOC}
//  *     ├── limit: { max: number, penalty: number, regular: number }
//  *     └── price: { penaltyPrice: number, regularPrice: number }
//  *
//  * Persisted in MMKV so bill calculations work offline with last-known values.
//  *
//  * Usage:
//  *   dispatch(fetchAppConfig())          ← call once after login
//  *   const limits = useAppSelector(selectLimits)
//  *   const prices = useAppSelector(selectPrices)
//  *   const bill   = useAppSelector(selectBillForLiters(consumed))
//  */

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import firestore from '@react-native-firebase/firestore'
// import type { RootState } from '../oldindex'

// const ADMIN_DOC = 'adminConfig'   // ← your actual Firestore admin document ID

// // ─── Types ────────────────────────────────────────────────────────────────────
// export interface AppLimits {
//     max: number   // absolute ceiling (liters) — no one can exceed this
//     penalty: number   // liters beyond which penalty rate kicks in
//     regular: number   // standard monthly allocation (liters)
// }

// export interface AppPrices {
//     regularPrice: number   // ₹ per liter for regular usage
//     penaltyPrice: number   // ₹ per liter after penalty threshold
// }

// interface AppConfigState {
//     limits: AppLimits | null
//     prices: AppPrices | null
//     syncedAt: number | null      // last successful fetch timestamp
//     isLoading: boolean
//     error: string | null
// }

// // ─── Thunk ────────────────────────────────────────────────────────────────────

// /**
//  * fetchAppConfig
//  *
//  * Call this once right after login (and optionally on app resume).
//  * Pulls limits + prices from admin Firestore doc.
//  * You can add your own logic later — this just handles the fetch + store.
//  */
// export const fetchAppConfig = createAsyncThunk<
//     { limits: AppLimits; prices: AppPrices },
//     void,
//     { rejectValue: string }
// >(
//     'appConfig/fetch',
//     async (_, { rejectWithValue }) => {
//         try {
//             const snap = await firestore()
//                 .collection('admin')
//                 .doc(ADMIN_DOC)
//                 .get()

//             const data = snap.data()
//             if (!data) throw new Error('Admin config not found in Firestore.')

//             return {
//                 limits: data.limit as AppLimits,
//                 prices: data.price as AppPrices,
//             }
//         } catch (e: any) {
//             return rejectWithValue(e.message ?? 'Failed to fetch app config.')
//         }
//     }
// )

// // ─── Initial state ────────────────────────────────────────────────────────────
// const initialState: AppConfigState = {
//     limits: null,
//     prices: null,
//     syncedAt: null,
//     isLoading: false,
//     error: null,
// }

// // ─── Slice ────────────────────────────────────────────────────────────────────
// const appConfigSlice = createSlice({
//     name: 'appConfig',
//     initialState,
//     reducers: {
//         clearConfigError: (state) => { state.error = null },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchAppConfig.pending, (state) => {
//                 state.isLoading = true
//                 state.error = null
//             })
//             .addCase(fetchAppConfig.fulfilled, (state, { payload }) => {
//                 state.isLoading = false
//                 state.limits = payload.limits
//                 state.prices = payload.prices
//                 state.syncedAt = Date.now()
//             })
//             .addCase(fetchAppConfig.rejected, (state, { payload }) => {
//                 state.isLoading = false
//                 state.error = payload ?? 'Config fetch failed.'
//                 // Note: persisted values from MMKV are still available
//                 // even if this fetch fails — so UI won't break offline
//             })
//     },
// })

// export const { clearConfigError } = appConfigSlice.actions
// export default appConfigSlice.reducer

// // ─── Selectors ────────────────────────────────────────────────────────────────
// export const selectLimits = (s: RootState) => s.appConfig.limits
// export const selectPrices = (s: RootState) => s.appConfig.prices
// export const selectConfigSyncedAt = (s: RootState) => s.appConfig.syncedAt
// export const selectConfigLoading = (s: RootState) => s.appConfig.isLoading
// export const selectConfigError = (s: RootState) => s.appConfig.error

// /**
//  * selectBillForLiters(consumed)
//  *
//  * Derived selector — pass consumed liters, returns ₹ bill amount.
//  * Uses persisted prices so works offline.
//  *
//  * Usage:
//  *   const bill = useAppSelector(selectBillForLiters(totalConsumed))
//  */
// export const selectBillForLiters = (consumed: number) => (s: RootState): number => {
//     const { prices, limits } = s.appConfig
//     if (!prices || !limits) return 0

//     const regularUsage = Math.min(consumed, limits.penalty)
//     const penaltyUsage = Math.max(consumed - limits.penalty, 0)

//     return (regularUsage * prices.regularPrice) + (penaltyUsage * prices.penaltyPrice)
// }
// /**
//  * addonsSlice
//  *
//  * Handles purchasing additional water packs (addon flow).
//  * Called after Razorpay confirms payment for a plan.
//  *
//  * Firebase path:
//  *   users/{userEmail}/monthlyUsages/{YYYY-MM}/addon/{razor_pay_id}
//  *
//  * Thunks:
//  *   purchaseAddon   — write addon record to Firestore after Razorpay success
//  *   fetchAddons     — fetch all addon docs for current month (for the plan history)
//  */

// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import {
//   collection,
//   doc,
//   setDoc,
//   getDocs,
// } from 'firebase/firestore';
// import { db } from '@dwwp/firebase/config';
// import { getCurrentMonthKey, getUserEmail } from '@dwwp/utils/helpers';
// import type { RootState } from '../store';

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface AddonRecord {
//   id: string;
//   addon_date: string;
//   amount: number;
//   qty: number; // litres purchased
//   refill: number;       // how many pack units
//   razor_pay_id: string;
//   status: 'Completed';
// }

// export interface AddonsState {
//   items: AddonRecord[];
//   purchaseStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
//   fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
//   /** Total litres added this month via addons */
//   totalAddonLitres: number;
// }

// // ─── Initial state ────────────────────────────────────────────────────────────

// const initialState: AddonsState = {
//   items: [],
//   purchaseStatus: 'idle',
//   fetchStatus: 'idle',
//   error: null,
//   totalAddonLitres: 0,
// };

// // ─── Thunks ───────────────────────────────────────────────────────────────────

// /**
//  * purchaseAddon
//  * Called by PlanSelector after Razorpay payment is confirmed.
//  * Writes a new doc under addon/ keyed by razorPayId.
//  */
// export const purchaseAddon = createAsyncThunk<
//   AddonRecord,
//   {
//     razorPayId: string;
//     amount: number;
//     qty: number; // litres = plan.volume * qty
//     refill: number;       // qty (number of packs)
//   },
//   { rejectValue: string }
// >('addons/purchaseAddon', async (
//   { razorPayId, amount, qty, refill },
//   { rejectWithValue }
// ) => {
//   try {
//     const userEmail = getUserEmail();
//     const monthKey = getCurrentMonthKey();
//     const now = new Date().toISOString();

//     const addonRef = doc(
//       db,
//       'users', userEmail,
//       'monthlyUsages', monthKey,
//       'addon', razorPayId
//     );

//     const record: AddonRecord = {
//       id: razorPayId,
//       addon_date: now,
//       amount,
//       qty,
//       refill,
//       razor_pay_id: razorPayId,
//       status: 'Completed',
//     };

//     // Omit `id` from what we write — Firestore doesn't need it in the doc body
//     const { id: _id, ...writeData } = record;
//     await setDoc(addonRef, writeData);

//     return record;
//   } catch (err: unknown) {
//     return rejectWithValue((err as Error).message ?? 'Addon purchase failed');
//   }
// });

// /**
//  * fetchAddons
//  * Loads all addon docs for the current month.
//  */
// export const fetchAddons = createAsyncThunk<
//   AddonRecord[],
//   { monthKey?: string } | void,
//   { rejectValue: string }
// >('addons/fetchAddons', async (args, { rejectWithValue }) => {
//   try {
//     const userEmail = getUserEmail();
//     const monthKey = args?.monthKey ?? getCurrentMonthKey();

//     const addonColRef = collection(
//       db, 'users', userEmail, 'monthlyUsages', monthKey, 'addon'
//     );
//     const snap = await getDocs(addonColRef);

//     return snap.docs.map((d) => ({
//       id: d.id,
//       ...(d.data() as Omit<AddonRecord, 'id'>),
//     }));
//   } catch (err: unknown) {
//     return rejectWithValue((err as Error).message ?? 'Failed to fetch addons');
//   }
// });

// // ─── Slice ────────────────────────────────────────────────────────────────────

// const addonsSlice = createSlice({
//   name: 'addons',
//   initialState,
//   reducers: {
//     resetPurchaseStatus(state) {
//       state.purchaseStatus = 'idle';
//       state.error = null;
//     },
//     resetAddons() {
//       return initialState;
//     },
//   },
//   extraReducers: (builder) => {
//     // ── purchaseAddon ──
//     builder
//       .addCase(purchaseAddon.pending, (state) => {
//         state.purchaseStatus = 'loading';
//         state.error = null;
//       })
//       .addCase(purchaseAddon.fulfilled, (state, action) => {
//         state.purchaseStatus = 'succeeded';
//         state.items.unshift(action.payload); // prepend — newest first
//         state.totalAddonLitres += action.payload.qty;
//       })
//       .addCase(purchaseAddon.rejected, (state, action) => {
//         state.purchaseStatus = 'failed';
//         state.error = action.payload ?? 'Purchase failed';
//       });

//     // ── fetchAddons ──
//     builder
//       .addCase(fetchAddons.pending, (state) => {
//         state.fetchStatus = 'loading';
//         state.error = null;
//       })
//       .addCase(fetchAddons.fulfilled, (state, action) => {
//         state.fetchStatus = 'succeeded';
//         state.items = action.payload;
//         state.totalAddonLitres = action.payload.reduce(
//           (sum, a) => sum + a.qty, 0
//         );
//       })
//       .addCase(fetchAddons.rejected, (state, action) => {
//         state.fetchStatus = 'failed';
//         state.error = action.payload ?? 'Failed to fetch addons';
//       });
//   },
// });

// export const { resetPurchaseStatus, resetAddons } = addonsSlice.actions;
// export default addonsSlice.reducer;

// // ─── Selectors ────────────────────────────────────────────────────────────────

// export const selectAddons = (state: RootState) => state.addons.items;
// export const selectAddonFetchStatus = (state: RootState) => state.addons.fetchStatus;
// export const selectPurchaseStatus = (state: RootState) => state.addons.purchaseStatus;
// export const selectAddonsError = (state: RootState) => state.addons.error;
// export const selectTotalAddonLitres = (state: RootState) => state.addons.totalAddonLitres;
// export const selectAddonCount = (state: RootState) => state.addons.items.length;
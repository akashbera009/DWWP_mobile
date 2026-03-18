// /**
//  * billingSlice
//  *
//  * Handles everything related to the current month's bill.
//  *
//  * Firebase path:
//  *   users/{userEmail}/monthlyUsages/{YYYY-MM}
//  *
//  * Thunks:
//  *   fetchCurrentBill     — load current month doc
//  *   payCurrentBill       — write payment sub-doc, set isPaid = true
//  *   fetchMonthlyUsages   — load a specific past month (for analytics)
//  */

// import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import {
//   doc,
//   getDoc,
//   getDocs,
//   collection,
//   setDoc,
// } from 'firebase/firestore';
// import { db } from '@dwwp/firebase/config';          // your firebase init
// import { getCurrentMonthKey, getUserEmail } from '@dwwp/utils/helpers'; // e.g. "2026-03"
// import type { RootState } from '../store';

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface DailyUsageMap {
//   [date: string]: number; // "2026-03-01": 12.4
// }

// export interface BillPaymentRecord {
//   amount: number;
//   date: string;
//   forMonth: string;
//   razor_pay_id: string;
//   status: 'pending' | 'Completed';
//   timeStamp: string;
// }

// export interface CurrentBill {
//   monthKey: string;           // "2026-03"
//   limit: number;
//   isMonthFinish: boolean;
//   limitExceeded: boolean;
//   isPaid: boolean;
//   totalUsage: number;         // sum of all daily values
//   dailyUsages: DailyUsageMap;
//   payment: BillPaymentRecord | null;
//   amount: number;             // computed: totalUsage * pricePerLitre
//   dueDate: string;            // last day of the month
// }

// export interface BillingState {
//   currentBill: CurrentBill | null;
//   fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
//   payStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
// }

// // ─── Initial state ────────────────────────────────────────────────────────────

// const initialState: BillingState = {
//   currentBill: null,
//   fetchStatus: 'idle',
//   payStatus: 'idle',
//   error: null,
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// /** Sum all YYYY-MM-DD keys in the month doc */
// const sumDailyUsage = (data: Record<string, unknown>): number => {
//   return Object.entries(data).reduce((acc, [key, val]) => {
//     if (/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof val === 'number') {
//       return acc + val;
//     }
//     return acc;
//   }, 0);
// };

// /** Extract only YYYY-MM-DD entries */
// const extractDailyUsages = (data: Record<string, unknown>): DailyUsageMap => {
//   return Object.fromEntries(
//     Object.entries(data).filter(
//       ([key, val]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && typeof val === 'number'
//     )
//   ) as DailyUsageMap;
// };

// /** Last day of a given YYYY-MM string */
// const getLastDayOfMonth = (monthKey: string): string => {
//   const [year, month] = monthKey.split('-').map(Number);
//   const lastDay = new Date(year, month, 0).getDate();
//   return `${monthKey}-${String(lastDay).padStart(2, '0')}`;
// };

// // ─── Thunks ───────────────────────────────────────────────────────────────────

// /**
//  * fetchCurrentBill
//  * Loads the current month's usage document + payment subcollection.
//  */
// export const fetchCurrentBill = createAsyncThunk<
//   CurrentBill,
//   void,
//   { rejectValue: string }
// >('billing/fetchCurrentBill', async (_, { rejectWithValue }) => {
//   try {
//     const userEmail = getUserEmail();
//     const monthKey = getCurrentMonthKey(); // e.g. "2026-03"

//     // 1. Fetch main month doc
//     const monthDocRef = doc(db, 'users', userEmail, 'monthlyUsages', monthKey);
//     const monthSnap = await getDoc(monthDocRef);

//     if (!monthSnap.exists()) {
//       // No bill yet for this month — return empty state
//       return {
//         monthKey,
//         limit: 0,
//         isMonthFinish: false,
//         limitExceeded: false,
//         isPaid: false,
//         totalUsage: 0,
//         dailyUsages: {},
//         payment: null,
//         amount: 0,
//         dueDate: getLastDayOfMonth(monthKey),
//       };
//     }

//     const data = monthSnap.data() as Record<string, unknown>;
//     const totalUsage = sumDailyUsage(data);

//     // 2. Fetch payment subcollection
//     const paymentColRef = collection(monthDocRef, 'payment');
//     const paymentSnap = await getDocs(paymentColRef);
//     let payment: BillPaymentRecord | null = null;

//     if (!paymentSnap.empty) {
//       payment = paymentSnap.docs[0].data() as BillPaymentRecord;
//     }

//     // 3. Compute amount — you can hook this into admin price if needed
//     //    For now it uses the raw usage × regularPrice placeholder
//     const isPaid = payment?.status === 'Completed';

//     return {
//       monthKey,
//       limit: (data.limit as number) ?? 0,
//       isMonthFinish: (data.isMonthFinish as boolean) ?? false,
//       limitExceeded: (data.limitExceeded as boolean) ?? false,
//       isPaid,
//       totalUsage,
//       dailyUsages: extractDailyUsages(data),
//       payment,
//       amount: totalUsage, // raw litres — multiply by price in selector if needed
//       dueDate: getLastDayOfMonth(monthKey),
//     };
//   } catch (err: unknown) {
//     return rejectWithValue((err as Error).message ?? 'Failed to fetch bill');
//   }
// });

// /**
//  * payCurrentBill
//  * Writes a payment record into payment/payment_details and marks
//  * it as 'Completed'. Called after Razorpay confirms success.
//  */
// export const payCurrentBill = createAsyncThunk<
//   BillPaymentRecord,
//   { razorPayId: string; amount: number },
//   { state: RootState; rejectValue: string }
// >('billing/payCurrentBill', async ({ razorPayId, amount }, {rejectWithValue }) => {
//   try {
//     const userEmail = getUserEmail();
//     const monthKey = getCurrentMonthKey();

//     const paymentRef = doc(
//       db,
//       'users', userEmail,
//       'monthlyUsages', monthKey,
//       'payment', 'payment_details'
//     );

//     const now = new Date().toISOString();
//     const record: BillPaymentRecord = {
//       amount,
//       date: now,
//       forMonth: monthKey,
//       razor_pay_id: razorPayId,
//       status: 'Completed',
//       timeStamp: now,
//     };

//     await setDoc(paymentRef, record);

//     return record;
//   } catch (err: unknown) {
//     return rejectWithValue((err as Error).message ?? 'Payment write failed');
//   }
// });

// // ─── Slice ────────────────────────────────────────────────────────────────────

// const billingSlice = createSlice({
//   name: 'billing',
//   initialState,
//   reducers: {
//     resetPayStatus(state) {
//       state.payStatus = 'idle';
//       state.error = null;
//     },
//     resetBillingState() {
//       return initialState;
//     },
//   },
//   extraReducers: (builder) => {
//     // ── fetchCurrentBill ──
//     builder
//       .addCase(fetchCurrentBill.pending, (state) => {
//         state.fetchStatus = 'loading';
//         state.error = null;
//       })
//       .addCase(fetchCurrentBill.fulfilled, (state, action) => {
//         state.fetchStatus = 'succeeded';
//         state.currentBill = action.payload;
//       })
//       .addCase(fetchCurrentBill.rejected, (state, action) => {
//         state.fetchStatus = 'failed';
//         state.error = action.payload ?? 'Unknown error';
//       });

//     // ── payCurrentBill ──
//     builder
//       .addCase(payCurrentBill.pending, (state) => {
//         state.payStatus = 'loading';
//         state.error = null;
//       })
//       .addCase(payCurrentBill.fulfilled, (state, action) => {
//         state.payStatus = 'succeeded';
//         if (state.currentBill) {
//           state.currentBill.payment = action.payload;
//           state.currentBill.isPaid = true;
//         }
//       })
//       .addCase(payCurrentBill.rejected, (state, action) => {
//         state.payStatus = 'failed';
//         state.error = action.payload ?? 'Payment failed';
//       });
//   },
// });

// export const { resetPayStatus, resetBillingState } = billingSlice.actions;
// export default billingSlice.reducer;

// // ─── Selectors ────────────────────────────────────────────────────────────────

// export const selectCurrentBill = (state: RootState) => state.billing.currentBill;
// export const selectBillFetchStatus = (state: RootState) => state.billing.fetchStatus;
// export const selectPayStatus = (state: RootState) => state.billing.payStatus;
// export const selectBillingError = (state: RootState) => state.billing.error;
// export const selectIsBillPaid = (state: RootState) => state.billing.currentBill?.isPaid ?? false;
// export const selectTotalUsage = (state: RootState) => state.billing.currentBill?.totalUsage ?? 0;
// export const selectDailyUsages = (state: RootState) => state.billing.currentBill?.dailyUsages ?? {};
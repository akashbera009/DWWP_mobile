/**
 * transactionsSlice
 *
 * Handles fetching the full transaction history for a given month.
 * Merges both the payment/ and addon/ subcollections into a unified list.
 *
 * Firebase paths:
 *   users/{userEmail}/monthlyUsages/{YYYY-MM}/payment/payment_details
 *   users/{userEmail}/monthlyUsages/{YYYY-MM}/addon/{addon_id}
 *
 * Thunks:
 *   fetchTransactions      — load merged payment + addon records for a month
 *   fetchAddonTransactions — load only addons (used in PlanSelector history)
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  collection,
  doc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from '@dwwp/firebase/config';
import { getCurrentMonthKey, getUserEmail } from '@dwwp/utils/helpers';
import type { RootState } from '../store';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = 'bill' | 'addon' | 'refund';
export type TransactionStatus = 'Completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  razorPayId?: string;
  forMonth?: string;
}

export interface TransactionsState {
  items: Transaction[];
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  /** Which month is currently loaded */
  loadedMonth: string | null;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: TransactionsState = {
  items: [],
  fetchStatus: 'idle',
  error: null,
  loadedMonth: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * fetchTransactions
 * Merges the payment doc and all addon docs for a given month
 * into a unified, sorted Transaction array.
 */
export const fetchTransactions = createAsyncThunk<
  { transactions: Transaction[]; monthKey: string },
  { monthKey?: string } | void,
  { rejectValue: string }
>('transactions/fetchTransactions', async (args, { rejectWithValue }) => {
  try {
    const userEmail = getUserEmail();
    const monthKey = args?.monthKey ?? getCurrentMonthKey();
    const monthDocRef = doc(db, 'users', userEmail, 'monthlyUsages', monthKey);

    // ── 1. Fetch bill payment ──
    const paymentColRef = collection(monthDocRef, 'payment');
    const paymentSnap = await getDocs(paymentColRef);

    const billTransactions: Transaction[] = paymentSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: `bill_${d.id}`,
        type: 'bill' as TransactionType,
        title: `Monthly Bill — ${monthKey}`,
        subtitle: `Payment ID: ${data.razor_pay_id ?? '—'}`,
        amount: data.amount ?? 0,
        date: formatDate(data.date ?? data.timeStamp),
        status: (data.status as TransactionStatus) ?? 'pending',
        razorPayId: data.razor_pay_id,
        forMonth: data.forMonth,
      };
    });

    // ── 2. Fetch addons ──
    const addonColRef = collection(monthDocRef, 'addon');
    const addonSnap = await getDocs(addonColRef);

    const addonTransactions: Transaction[] = addonSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: `addon_${d.id}`,
        type: 'addon' as TransactionType,
        title: `Water Pack +${data.quantityDone ?? 0}L`,
        subtitle: `Refilled ${data.refill ?? 1}x  •  ${data.razor_pay_id ?? ''}`,
        amount: data.amount ?? 0,
        date: formatDate(data.addon_date),
        status: (data.status as TransactionStatus) ?? 'Completed',
        razorPayId: data.razor_pay_id,
        forMonth: monthKey,
      };
    });

    // ── 3. Merge & sort newest first ──
    const all = [...billTransactions, ...addonTransactions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { transactions: all, monthKey };
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message ?? 'Failed to fetch transactions');
  }
});

/**
 * fetchAddonTransactions
 * Fetches only addon records — used when opening the addon/plan history tab.
 */
export const fetchAddonTransactions = createAsyncThunk<
  Transaction[],
  { monthKey?: string } | void,
  { rejectValue: string }
>('transactions/fetchAddonTransactions', async (args, { rejectWithValue }) => {
  try {
    const userEmail = getUserEmail();
    const monthKey = args?.monthKey ?? getCurrentMonthKey();
    const addonColRef = collection(
      db, 'users', userEmail, 'monthlyUsages', monthKey, 'addon'
    );
    const snap = await getDocs(addonColRef);

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: `addon_${d.id}`,
        type: 'addon' as TransactionType,
        title: `Water Pack +${data.quantityDone ?? 0}L`,
        subtitle: `Refilled ${data.refill ?? 1}x`,
        amount: data.amount ?? 0,
        date: formatDate(data.addon_date),
        status: (data.status as TransactionStatus) ?? 'Completed',
        razorPayId: data.razor_pay_id,
        forMonth: monthKey,
      };
    });
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message ?? 'Failed to fetch addons');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    resetTransactions() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ── fetchTransactions ──
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.items = action.payload.transactions;
        state.loadedMonth = action.payload.monthKey;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload ?? 'Unknown error';
      });

    // ── fetchAddonTransactions — append without replacing bill records ──
    builder
      .addCase(fetchAddonTransactions.fulfilled, (state, action) => {
        // Replace only addon entries, keep bill entries intact
        const nonAddons = state.items.filter((t) => t.type !== 'addon');
        state.items = [...nonAddons, ...action.payload].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
  },
});

export const { resetTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAllTransactions = (state: RootState) => state.transactions.items;
export const selectTransactionsFetchStatus = (state: RootState) => state.transactions.fetchStatus;
export const selectTransactionsError = (state: RootState) => state.transactions.error;
export const selectLoadedMonth = (state: RootState) => state.transactions.loadedMonth;

/** Only bill payments */
export const selectBillTransactions = (state: RootState) =>
  state.transactions.items.filter((t) => t.type === 'bill');

/** Only addon purchases */
export const selectAddonTransactions = (state: RootState) =>
  state.transactions.items.filter((t) => t.type === 'addon');

/** Total spent this month (sum of all Completed transactions) */
export const selectTotalSpentThisMonth = (state: RootState) =>
  state.transactions.items
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
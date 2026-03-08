/**
 * store/slices/paymentSlice.ts
 *
 * Handles Razorpay payments and addon (water recharge) purchases.
 *
 * Firebase paths:
 *   users/{email}/monthlyUsages/{YYYY-MM}/payment/payment_details
 *     ├── amount:       number
 *     ├── date:         string (ISO)
 *     ├── forMonth:     string (YYYY-MM)
 *     ├── razor_pay_id: string
 *     ├── status:       "pending" | "Completed"
 *     └── timeStamp:    string (ISO)
 *
 *   users/{email}/monthlyUsages/{YYYY-MM}/addon/{id}
 *     ├── quantityDone: number   (liters purchased)
 *     ├── amount:       number   (₹)
 *     ├── addon_date:   string   (ISO)
 *     ├── razor_pay_id: string
 *     ├── refill:       number
 *     └── status:       "Completed"
 *
 * Note: actual Razorpay order creation + webhook verification should happen
 * on your backend / Firebase Cloud Function. This slice handles:
 *   - Fetching payment + addon history from Firestore
 *   - Tracking in-progress payment state for the UI
 *   - Refreshing dashboard after a successful recharge
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import firestore from '@react-native-firebase/firestore'
import type { RootState } from '../index'
import { fetchCurrentMonth } from './dashboardSlice'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PaymentRecord {
    amount: number
    date: string
    forMonth: string
    razorPayId: string
    status: 'pending' | 'Completed'
    timeStamp: string
}

export interface AddonRecord {
    id: string
    quantityDone: number
    amount: number
    addon_date: string
    razor_pay_id: string
    refill: number
    status: string
}

type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed'

interface PaymentState {
    payments: PaymentRecord[]
    addons: AddonRecord[]       // current month addons
    pendingPaymentId: string | null       // Razorpay order ID in progress
    lastPaymentStatus: PaymentStatus
    isProcessing: boolean
    isLoading: boolean
    error: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getCurrentMonthKey(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * fetchPaymentHistory
 * Pulls the payment_details document for a given month.
 */
export const fetchPaymentHistory = createAsyncThunk<
    PaymentRecord[],
    { email: string; monthKey?: string },
    { rejectValue: string }
>('payment/fetchHistory', async ({ email, monthKey }, { rejectWithValue }) => {
    try {
        const mk = monthKey ?? getCurrentMonthKey()
        const snap = await firestore()
            .collection('users').doc(email)
            .collection('monthlyUsages').doc(mk)
            .collection('payment').doc('payment_details')
            .get()

        const data = snap.data()
        if (!data) return []

        // payment_details is a single doc — wrap in array for uniform state shape
        return [{
            amount: data.amount,
            date: data.date,
            forMonth: data.forMonth,
            razorPayId: data.razor_pay_id,
            status: data.status,
            timeStamp: data.timeStamp,
        } as PaymentRecord]
    } catch (e: any) {
        return rejectWithValue(e.message ?? 'Failed to fetch payment history.')
    }
})

/**
 * fetchCurrentMonthAddons
 * Pulls all addon documents for the current month.
 */
export const fetchCurrentMonthAddons = createAsyncThunk<
    AddonRecord[],
    { email: string; monthKey?: string },
    { rejectValue: string }
>('payment/fetchAddons', async ({ email, monthKey }, { rejectWithValue }) => {
    try {
        const mk = monthKey ?? getCurrentMonthKey()
        const snap = await firestore()
            .collection('users').doc(email)
            .collection('monthlyUsages').doc(mk)
            .collection('addon')
            .get()

        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as AddonRecord))
    } catch (e: any) {
        return rejectWithValue(e.message ?? 'Failed to fetch addons.')
    }
})

/**
 * confirmAddonPayment
 * Called after Razorpay payment succeeds on the client.
 * Writes the addon record to Firestore, then refreshes the dashboard month data.
 *
 * In production: move verification to a Cloud Function.
 * This thunk assumes payment is already verified and just records it.
 */
export const confirmAddonPayment = createAsyncThunk<
    AddonRecord,
    {
        email: string
        razorPayId: string
        amount: number
        quantityDone: number    // liters purchased
        refill: number
    },
    { rejectValue: string; state: RootState }
>('payment/confirmAddon', async (
    { email, razorPayId, amount, quantityDone, refill },
    { rejectWithValue, dispatch }
) => {
    try {
        const monthKey = getCurrentMonthKey()
        const addonData = {
            quantityDone,
            amount,
            addon_date: new Date().toISOString(),
            razor_pay_id: razorPayId,
            refill,
            status: 'Completed',
        }

        // Write addon record
        await firestore()
            .collection('users').doc(email)
            .collection('monthlyUsages').doc(monthKey)
            .collection('addon').doc(razorPayId)
            .set(addonData)

        // Refresh dashboard month data to reflect new limit
        dispatch(fetchCurrentMonth({ email, force: true }))

        return { id: razorPayId, ...addonData } as AddonRecord
    } catch (e: any) {
        return rejectWithValue(e.message ?? 'Failed to confirm payment.')
    }
})

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState: PaymentState = {
    payments: [],
    addons: [],
    pendingPaymentId: null,
    lastPaymentStatus: 'idle',
    isProcessing: false,
    isLoading: false,
    error: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        // Call when Razorpay modal opens
        setPaymentPending: (state, action: PayloadAction<string>) => {
            state.pendingPaymentId = action.payload
            state.isProcessing = true
            state.lastPaymentStatus = 'pending'
            state.error = null
        },

        // Call if user dismisses Razorpay modal without paying
        cancelPayment: (state) => {
            state.pendingPaymentId = null
            state.isProcessing = false
            state.lastPaymentStatus = 'idle'
        },

        // Call on Razorpay failure callback
        setPaymentFailed: (state, action: PayloadAction<string>) => {
            state.pendingPaymentId = null
            state.isProcessing = false
            state.lastPaymentStatus = 'failed'
            state.error = action.payload
        },

        resetPaymentStatus: (state) => {
            state.lastPaymentStatus = 'idle'
            state.pendingPaymentId = null
            state.isProcessing = false
            state.error = null
        },

        clearPaymentError: (state) => { state.error = null },

        resetPayment: () => initialState,
    },

    extraReducers: (builder) => {
        // fetchPaymentHistory
        builder
            .addCase(fetchPaymentHistory.pending, (state) => { state.isLoading = true; state.error = null })
            .addCase(fetchPaymentHistory.fulfilled, (state, { payload }) => {
                state.isLoading = false
                state.payments = payload
            })
            .addCase(fetchPaymentHistory.rejected, (state, { payload }) => {
                state.isLoading = false
                state.error = payload ?? 'Failed to load payments.'
            })

        // fetchCurrentMonthAddons
        builder
            .addCase(fetchCurrentMonthAddons.pending, (state) => { state.isLoading = true })
            .addCase(fetchCurrentMonthAddons.fulfilled, (state, { payload }) => {
                state.isLoading = false
                state.addons = payload
            })
            .addCase(fetchCurrentMonthAddons.rejected, (state, { payload }) => {
                state.isLoading = false
                state.error = payload ?? 'Failed to load addons.'
            })

        // confirmAddonPayment
        builder
            .addCase(confirmAddonPayment.pending, (state) => { state.isProcessing = true })
            .addCase(confirmAddonPayment.fulfilled, (state, { payload }) => {
                state.isProcessing = false
                state.pendingPaymentId = null
                state.lastPaymentStatus = 'success'
                state.addons.unshift(payload)   // prepend newest addon
            })
            .addCase(confirmAddonPayment.rejected, (state, { payload }) => {
                state.isProcessing = false
                state.lastPaymentStatus = 'failed'
                state.error = payload ?? 'Payment confirmation failed.'
            })
    },
})

export const {
    setPaymentPending,
    cancelPayment,
    setPaymentFailed,
    resetPaymentStatus,
    clearPaymentError,
    resetPayment,
} = paymentSlice.actions

export default paymentSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectPayments = (s: RootState) => s.payment.payments
export const selectAddons = (s: RootState) => s.payment.addons
export const selectPendingPaymentId = (s: RootState) => s.payment.pendingPaymentId
export const selectLastPaymentStatus = (s: RootState) => s.payment.lastPaymentStatus
export const selectIsProcessing = (s: RootState) => s.payment.isProcessing
export const selectPaymentLoading = (s: RootState) => s.payment.isLoading
export const selectPaymentError = (s: RootState) => s.payment.error

// Total addon liters purchased this month
export const selectTotalAddonLiters = (s: RootState) =>
    s.payment.addons.reduce((sum, a) => sum + a.quantityDone, 0)

// Total ₹ spent on addons this month
export const selectTotalAddonSpend = (s: RootState) =>
    s.payment.addons.reduce((sum, a) => sum + a.amount, 0)
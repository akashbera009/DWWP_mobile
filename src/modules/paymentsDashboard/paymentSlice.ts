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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { confirmAddonPayment, fetchAllPaymentsAndAddons } from './paymentAction'
import { FetchAllMonthsPayload, PaymentInitialState } from '@dwwp/modals'


// ─── Slice ────────────────────────────────────────────────────────────────────
const paymentSlice = createSlice({
    name: 'payment',
    initialState: PaymentInitialState,
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

        resetPayment: () => PaymentInitialState,
    },

    extraReducers: (builder) => {
        // fetchAllPaymentsAndAddons
        builder
            .addCase(fetchAllPaymentsAndAddons.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchAllPaymentsAndAddons.fulfilled, (state, action: PayloadAction<FetchAllMonthsPayload>) => {
                state.isLoading = false
                state.error = null

                state.payments = action.payload.payments
                state.addons = action.payload.addons
                state.transactionHistory = action.payload.transactionHistory
            })
            .addCase(fetchAllPaymentsAndAddons.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? action.error?.message ?? 'Unknown error'
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
// export const selectPayments = (s: RootState) => s.payment.payments
// export const selectAddons = (s: RootState) => s.payment.addons
// export const selectPendingPaymentId = (s: RootState) => s.payment.pendingPaymentId
// export const selectLastPaymentStatus = (s: RootState) => s.payment.lastPaymentStatus
// export const selectIsProcessing = (s: RootState) => s.payment.isProcessing
// export const selectPaymentLoading = (s: RootState) => s.payment.isLoading
// export const selectPaymentError = (s: RootState) => s.payment.error

// Total addon liters purchased this month
// export const selectTotalAddonLiters = (s: RootState) =>
//     s.payment.addons.reduce((sum, a) => sum + a.quantityDone, 0)

// // Total ₹ spent on addons this month
// export const selectTotalAddonSpend = (s: RootState) =>
//     s.payment.addons.reduce((sum, a) => sum + a.amount, 0)
import { createAsyncThunk } from '@reduxjs/toolkit'
import firestore from '@react-native-firebase/firestore'
import type { RootState } from '../../store/index'
import { fetchCurrentMonth } from '@dwwp/modules/dashboard/dashboardActions'
import { AddonRecord,FetchAllMonthsPayload,PaymentRecord } from '@dwwp/modals'
import { getCurrentMonthKey, normalizeTimestamp, toNumber } from '@dwwp/utils/commonFunctions'

/**
 * fetchPaymentHistory
 * Pulls the payment_details document for a given month.
 */
export const fetchAllPaymentsAndAddons = createAsyncThunk<
    FetchAllMonthsPayload,
    { email: string },
    { rejectValue: string }
>('payment/fetchAllHistory', async ({ email }, { rejectWithValue }) => {
    try {
        if (!email) return rejectWithValue('email is required')

        const monthsColRef = firestore()
            .collection('users')
            .doc(email)
            .collection('monthlyUsages')

        // 1) list all month docs (their ids are the month keys e.g. '2025-11')
        const monthsSnap = await monthsColRef.get()
        if (monthsSnap.empty) {
            // no months -> return empty payload
            return {
                payments: [],
                addons: [],
                transactionHistory: { paymentsHistory: [], addonsHistory: [] },
            }
        }

        // 2) for each month doc id, fetch payment/payment_details and addon collection
        const monthFetchers = monthsSnap.docs.map(async (monthDoc) => {
            const monthKey = monthDoc.id

            // Payment doc
            const paymentDocRef = monthsColRef.doc(monthKey).collection('payment').doc('payment_details')
            const paymentSnap = await paymentDocRef.get()

            let paymentRecord: PaymentRecord | null = null
            if (paymentSnap.exists()) {
                const p: any = paymentSnap.data() ?? {}
                paymentRecord = {
                    amount: toNumber(p.amount, 0),
                    date: p.date ?? null,
                    forMonth: p.forMonth ?? monthKey,
                    razorPayId: p.razor_pay_id ?? p.razorPayId ?? '',
                    status: p.status ?? '',
                    timeStamp: normalizeTimestamp(p.timeStamp),
                }
            }

            // Addon docs (may be zero)
            const addonColRef = monthsColRef.doc(monthKey).collection('addon')
            const addonSnap = await addonColRef.get()
            const addonRecords: AddonRecord[] = []
            addonSnap.forEach((d) => {
                const docData: any = d.data() ?? {}
                addonRecords.push({
                    id: d.id,
                    quantityDone: Number(docData.quantityDone ?? 0),
                    amount: toNumber(docData.amount, 0),
                    addon_date: normalizeTimestamp(docData.addon_date),
                    razor_pay_id: docData.razor_pay_id ?? docData.razorPayId ?? '',
                    refill: Number(docData.refill ?? 0),
                    status: docData.status ?? null,
                })
            })

            return { monthKey, paymentRecord, addonRecords }
        })

        // Run all month fetches in parallel
        const monthsResults = await Promise.all(monthFetchers)

        // Flatten results
        const payments: PaymentRecord[] = []
        const addons: AddonRecord[] = []
        monthsResults.forEach((res) => {
            if (res.paymentRecord) payments.push(res.paymentRecord)
            if (res.addonRecords && res.addonRecords.length) {
                // optionally attach forMonth to addons (if you want)
                res.addonRecords.forEach((a) => {
                    // if you want forMonth available on addons, add it here:
                    // (casting to any because AddonRecord doesn't have forMonth in your type)
                    ; (a as any).forMonth = res.monthKey
                    addons.push(a)
                })
            }
        })

        // Optional: sort payments & addons by timeStamp descending (newest first)
        const sortByTimestampDesc = <T extends { timeStamp?: string | null }>(arr: T[]) =>
            arr.sort((a, b) => {
                const ta = (a.timeStamp ?? '') || ''
                const tb = (b.timeStamp ?? '') || ''
                return tb.localeCompare(ta) // ISO strings sort lexicographically
            })

        // Sort payments (if you need)
        sortByTimestampDesc(payments as any)

        // For addons we used addon_date; ensure addon_date -> timeStamp for sorting or use addon_date
        addons.sort((a, b) => {
            const ta = (a.addon_date ?? '') as string
            const tb = (b.addon_date ?? '') as string
            return tb.localeCompare(ta)
        })

        const payload: FetchAllMonthsPayload = {
            payments,
            addons,
            transactionHistory: {
                paymentsHistory: payments,
                addonsHistory: addons,
            },
        }

        return payload
    } catch (e: any) {
        const msg = e?.message ?? e?.code ?? 'Failed to fetch payments & addons across months.'
        return rejectWithValue(msg)
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
        const monthKeyString = monthKey ?? getCurrentMonthKey()
        const snap = await firestore()
            .collection('users').doc(email)
            .collection('monthlyUsages').doc(monthKeyString)
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

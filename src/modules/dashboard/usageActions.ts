// ─────────────────────────────────────────────
//  usageAction.ts
//  All createAsyncThunk actions for usage data.
//  Depends on: React Native Firebase (@react-native-firebase/firestore)
// ─────────────────────────────────────────────

import { createAsyncThunk } from '@reduxjs/toolkit'
import firestore from '@react-native-firebase/firestore'

import {
    setMonth,
    setTodayUsage,
    setCurrentMonth,
    setAllTimeMonths,
    setAllTimeDaysTotal,
    setHistoryLoaded,
} from './usageSlice'
import { MonthUsage } from '@dwwp/modals'
import { hasListener, registerListener, stopListener } from './usageListener'
import { extractDayFields, getCurrentMonthKey, getTodayKey, isPastMonth, sumDays } from '@dwwp/utils/commonFunctions'

// ─── helpers ────────────────────────────────

function monthsCollection(userEmail: string) {
    return firestore()
        .collection('users')
        .doc(userEmail)
        .collection('monthlyUsages')
}

function parseMonthDoc(
    monthId: string,
    data: Record<string, unknown>
): MonthUsage {
    const days = extractDayFields(data)
    const total =
        typeof data.totalUsage === 'number' ? data.totalUsage : sumDays(days)
    return {
        monthId,
        days,
        total,
        limit: typeof data.limit === 'number' ? data.limit : undefined,
        limitExceeded:
            typeof data.limitExceeded === 'boolean' ? data.limitExceeded : undefined,
        isMonthFinish:
            typeof data.isMonthFinish === 'boolean' ? data.isMonthFinish : undefined,
        lastUpdated: Date.now(),
    }
}

// ─── 1. listenCurrentMonth ───────────────────

/**
 * Starts a realtime Firestore listener on the current month doc.
 * Dispatches setMonth + setTodayUsage on every snapshot.
 * The fulfilled state only means the listener was *registered*, not that
 * data has arrived — data arrives asynchronously via dispatched actions.
 *
 * Safe to call multiple times — duplicate listeners are prevented.
 */
export const listenCurrentMonth = createAsyncThunk(
    'usage/listenCurrentMonth',
    async (userEmail: string, { dispatch }) => {
        if (hasListener(userEmail)) return // already listening

        const monthId = getCurrentMonthKey()
        dispatch(setCurrentMonth(monthId))

        const unsubscribe = monthsCollection(userEmail)
            .doc(monthId)
            .onSnapshot(
                (snapshot) => {
                    if (!snapshot.exists) return
                    console.log('snapshot exists:', snapshot.exists)
                    console.log('snapshot data:', JSON.stringify(snapshot.data()))  // ← add this

                    const data = snapshot.data() as Record<string, unknown>
                    const month = parseMonthDoc(monthId, data)

                    dispatch(setMonth(month))

                    const todayKey = getTodayKey()
                    dispatch(setTodayUsage(month.days[todayKey] ?? 0))
                },
                (error) => {
                    console.error('[listenCurrentMonth] snapshot error:', error)
                }
            )

        registerListener(userEmail, unsubscribe)
        return monthId
    }
)

// ─── 2. stopCurrentMonthListener ────────────

/**
 * Unsubscribes the realtime listener for the current month.
 */
export const stopCurrentMonthListener = createAsyncThunk(
    'usage/stopCurrentMonthListener',
    async (userEmail: string) => {
        stopListener(userEmail)
    }
)

// ─── 3. fetchTodayUsage ──────────────────────

/**
 * One-off get() for today's usage from the current month doc.
 * Useful on cold start before the realtime listener fires.
 */
export const fetchTodayUsage = createAsyncThunk(
    'usage/fetchTodayUsage',
    async (userEmail: string, { dispatch }) => {
        const monthId = getCurrentMonthKey()
        const snap = await monthsCollection(userEmail).doc(monthId).get()

        if (!snap.exists) return 0

        const data = snap.data() as Record<string, unknown>
        const days = extractDayFields(data)
        const todayKey = getTodayKey()
        const value = days[todayKey] ?? 0

        dispatch(setTodayUsage(value))
        return value
    }
)

// ─── 4. fetchAllTimeMonths ───────────────────

/**
 * One-time fetch of all past months (months before the current month).
 * Builds a summary map of { "YYYY-MM": totalLiters }.
 * Sets historyLoaded = true on success so this is never re-run on startup.
 *
 * To re-fetch (e.g. pull-to-refresh), dispatch this again from UI — the
 * slice will reset historyLoaded before starting.
 */
export const fetchAllTimeMonths = createAsyncThunk(
    'usage/fetchAllTimeMonths',
    async (userEmail: string, { dispatch }) => {
        const snapshot = await monthsCollection(userEmail).get()

        const allTimeMonths: Record<string, number> = {}

        snapshot.forEach((doc) => {
            const monthId = doc.id
            if (!isPastMonth(monthId)) return // skip current/future month

            const data = doc.data() as Record<string, unknown>
            const total =
                typeof data.totalUsage === 'number'
                    ? data.totalUsage
                    : sumDays(extractDayFields(data))

            allTimeMonths[monthId] = total
        })

        dispatch(setAllTimeMonths(allTimeMonths))
        dispatch(setHistoryLoaded(true))
        return allTimeMonths
    }
)

// ─── 5. fetchAllTimeDays ─────────────────────

/**
 * One-time fetch that sums every individual day field across all past months.
 * Use when you need a grand total across all time (e.g. a lifetime usage stat).
 *
 * NOTE: For large histories (many years), consider paginating this query
 * or deriving it from fetchAllTimeMonths totals instead.
 */
export const fetchAllTimeDays = createAsyncThunk(
    'usage/fetchAllTimeDays',
    async (userEmail: string, { dispatch }) => {
        const snapshot = await monthsCollection(userEmail).get()

        let grandTotal = 0

        snapshot.forEach((doc) => {
            if (!isPastMonth(doc.id)) return // skip current month
            const data = doc.data() as Record<string, unknown>
            grandTotal += sumDays(extractDayFields(data))
        })

        dispatch(setAllTimeDaysTotal(grandTotal))
        return grandTotal
    }
)
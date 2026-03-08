/**
 * store/slices/dashboardSlice.ts
 *
 * Handles everything under users/{email} in Firestore:
 *
 *   servoState       – real-time (Firestore listener, NOT persisted)
 *   lastSeen         – real-time (Firestore listener, NOT persisted)
 *   userDetails      – static profile info (persisted)
 *   currentMonth     – this month's usage data (persisted as cache)
 *   notifications    – from users/{email}/notification field (persisted)
 *   broadcasts       – from admin doc broadcast.msg (persisted)
 *
 * Real-time listener (servoState + lastSeen) lives in deviceService.ts
 * outside Redux — it dispatches setServoState / setLastSeen into the store.
 * This avoids memory leaks from putting onSnapshot inside a thunk.
 *
 * Firebase paths:
 *   users/{email}
 *     ├── servoState:    boolean
 *     ├── lastSeen:      number (ms timestamp)
 *     ├── notification:  string
 *     ├── userDetails:   map
 *     └── monthlyUsages/{YYYY-MM}
 *             ├── {YYYY-MM-DD}: number
 *             ├── limit:          number
 *             ├── limitExceeded:  boolean
 *             └── isMonthFinish:  boolean
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import firestore from '@react-native-firebase/firestore'
import type { RootState } from '../index'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserDetails {
    fullName: string
    mobileNo: string
    emailId: string
    address: string
    accountNumber: string
    consumerNumber: string
    meterNumber: string
    supplyZone: string
}

export interface CurrentMonth {
    monthKey: string
    limit: number
    limitExceeded: boolean
    isMonthFinish: boolean
    dailyUsages: Record<string, number>
    totalConsumed: number
}

export interface BroadcastMsg {
    icon: string
    message: string
    timestamp: string
}

interface DashboardState {
    servoState: boolean
    lastSeen: number | null
    deviceOnline: boolean
    userDetails: UserDetails | null
    currentMonth: CurrentMonth | null
    notification: string
    broadcasts: BroadcastMsg[]
    lastSyncedAt: number | null
    isLoading: boolean
    error: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STALE_MS = 15 * 60 * 1000

function getCurrentMonthKey(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function sumDailyUsages(usages: Record<string, number>): number {
    return Object.values(usages).reduce((s, v) => s + v, 0)
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchUserDocument = createAsyncThunk<
    { userDetails: UserDetails; notification: string },
    { email: string },
    { rejectValue: string }
>('dashboard/fetchUserDocument', async ({ email }, { rejectWithValue }) => {
    try {
        const snap = await firestore().collection('users').doc(email).get()
        const data = snap.data()
        if (!data) throw new Error('User document not found.')
        return {
            userDetails: data.userDetails as UserDetails,
            notification: data.notification ?? '',
        }
    } catch (e: any) {
        return rejectWithValue(e.message ?? 'Failed to fetch user document.')
    }
})

export const fetchCurrentMonth = createAsyncThunk<
    CurrentMonth,
    { email: string; force?: boolean },
    { rejectValue: string; state: RootState }
>('dashboard/fetchCurrentMonth', async ({ email, force }, { rejectWithValue, getState }) => {
    try {
        const { lastSyncedAt, currentMonth } = getState().dashboard
        const isStale = !lastSyncedAt || (Date.now() - lastSyncedAt) > STALE_MS
        if (!force && !isStale && currentMonth) return currentMonth

        const monthKey = getCurrentMonthKey()
        const snap = await firestore()
            .collection('users').doc(email)
            .collection('monthlyUsages').doc(monthKey)
            .get()

        const data = snap.data() ?? {}
        const metaKeys = ['limit', 'limitExceeded', 'isMonthFinish', 'payment', 'addon']
        const dailyUsages: Record<string, number> = {}

        Object.entries(data).forEach(([k, v]) => {
            if (!metaKeys.includes(k) && typeof v === 'number') dailyUsages[k] = v
        })

        return {
            monthKey,
            limit: data.limit ?? 0,
            limitExceeded: data.limitExceeded ?? false,
            isMonthFinish: data.isMonthFinish ?? false,
            dailyUsages,
            totalConsumed: sumDailyUsages(dailyUsages),
        }
    } catch (e: any) {
        return rejectWithValue(e.message ?? 'Failed to fetch month data.')
    }
})

export const updateServoState = createAsyncThunk<
    boolean,
    { email: string; newState: boolean },
    { rejectValue: string; state: RootState }
>('dashboard/updateServoState', async ({ email, newState }, { rejectWithValue, getState, dispatch }) => {
    const prevState = getState().dashboard.servoState
    dispatch(dashboardSlice.actions.setServoState(newState))   // optimistic

    try {
        await firestore().collection('users').doc(email).update({ servoState: newState })
        return newState
    } catch (e: any) {
        dispatch(dashboardSlice.actions.setServoState(prevState))   // rollback
        return rejectWithValue(e.message ?? 'Failed to update servo state.')
    }
})

export const fetchBroadcasts = createAsyncThunk<
    BroadcastMsg[],
    void,
    { rejectValue: string }
>('dashboard/fetchBroadcasts', async (_, { rejectWithValue }) => {
    try {
        const snap = await firestore().collection('admin').doc('adminConfig').get()
        return (snap.data()?.broadcast?.msg ?? []) as BroadcastMsg[]
    } catch (e: any) {
        return rejectWithValue(e.message ?? 'Failed to fetch broadcasts.')
    }
})

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState: DashboardState = {
    servoState: false,
    lastSeen: null,
    deviceOnline: false,
    userDetails: null,
    currentMonth: null,
    notification: '',
    broadcasts: [],
    lastSyncedAt: null,
    isLoading: false,
    error: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // Dispatched by deviceService.ts real-time listener
        setServoState: (state, action: PayloadAction<boolean>) => {
            state.servoState = action.payload
        },

        // Dispatched by deviceService.ts real-time listener
        setLastSeen: (state, action: PayloadAction<number>) => {
            state.lastSeen = action.payload
            state.deviceOnline = (Date.now() - action.payload) < 15_000
        },

        // Call every 5s via setInterval to keep deviceOnline accurate
        refreshDeviceOnline: (state) => {
            if (state.lastSeen !== null) {
                state.deviceOnline = (Date.now() - state.lastSeen) < 15_000
            }
        },

        clearDashboardError: (state) => { state.error = null },

        resetDashboard: () => initialState,
    },

    extraReducers: (builder) => {
        // fetchUserDocument
        builder
            .addCase(fetchUserDocument.pending, (state) => { state.isLoading = true; state.error = null })
            .addCase(fetchUserDocument.fulfilled, (state, { payload }) => {
                state.isLoading = false
                state.userDetails = payload.userDetails
                state.notification = payload.notification
            })
            .addCase(fetchUserDocument.rejected, (state, { payload }) => {
                state.isLoading = false
                state.error = payload ?? 'Failed to load user.'
            })

        // fetchCurrentMonth
        builder
            .addCase(fetchCurrentMonth.pending, (state) => { state.isLoading = true; state.error = null })
            .addCase(fetchCurrentMonth.fulfilled, (state, { payload }) => {
                state.isLoading = false
                state.currentMonth = payload
                state.lastSyncedAt = Date.now()
            })
            .addCase(fetchCurrentMonth.rejected, (state, { payload }) => {
                state.isLoading = false
                state.error = payload ?? 'Failed to load month data.'
            })

        // updateServoState — optimistic, rollback handled inside thunk
        builder
            .addCase(updateServoState.rejected, (state, { payload }) => {
                state.error = payload ?? 'Servo update failed.'
            })

        // fetchBroadcasts
        builder
            .addCase(fetchBroadcasts.fulfilled, (state, { payload }) => {
                state.broadcasts = payload
            })
    },
})

export const {
    setServoState,
    setLastSeen,
    refreshDeviceOnline,
    clearDashboardError,
    resetDashboard,
} = dashboardSlice.actions

export default dashboardSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectServoState = (s: RootState) => s.dashboard.servoState
export const selectLastSeen = (s: RootState) => s.dashboard.lastSeen
export const selectDeviceOnline = (s: RootState) => s.dashboard.deviceOnline
export const selectUserDetails = (s: RootState) => s.dashboard.userDetails
export const selectCurrentMonth = (s: RootState) => s.dashboard.currentMonth
export const selectNotification = (s: RootState) => s.dashboard.notification
export const selectBroadcasts = (s: RootState) => s.dashboard.broadcasts
export const selectDashLoading = (s: RootState) => s.dashboard.isLoading
export const selectDashError = (s: RootState) => s.dashboard.error
export const selectLimitExceeded = (s: RootState) => s.dashboard.currentMonth?.limitExceeded ?? false
export const selectRemainingLiters = (s: RootState) => {
    const m = s.dashboard.currentMonth
    return m ? Math.max(m.limit - m.totalConsumed, 0) : 0
}
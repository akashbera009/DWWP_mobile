
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DashboardState } from "@dwwp/modals"
import {
    fetchUserDocument,
    fetchCurrentMonth,
    fetchBroadcasts,
    updateServoState,
    fetchAdminConfig,
} from "./dashboardActions"
import { RootState } from "@dwwp/store"

const initialState: DashboardState = {
    servoState: false,
    lastSeen: null,
    deviceOnline: false,
    userDetails: null,
    currentMonth: null,
    notification: "",
    broadcasts: [],

    limitConfig: null,
    priceConfig: null,

    lastSyncedAt: null,
    isLoading: false,
    error: null,
}
const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {

        setServoState: (state, action: PayloadAction<boolean>) => {
            state.servoState = action.payload
        },

        setLastSeen: (state, action: PayloadAction<number>) => {
            state.lastSeen = action.payload
            state.deviceOnline = Date.now() - action.payload < 15000
        },

        refreshDeviceOnline: (state) => {
            if (state.lastSeen !== null) {
                state.deviceOnline = Date.now() - state.lastSeen < 15000
            }
        },

        clearDashboardError: (state) => {
            state.error = null
        },

        resetDashboard: () => initialState,
    },

    extraReducers: (builder) => {

        // fetchUserDocument
        builder.addCase(fetchUserDocument.pending, (state) => {
            state.isLoading = true
        })

        builder.addCase(fetchUserDocument.fulfilled, (state, action) => {
            state.isLoading = false
            state.userDetails = action.payload.userDetails
            state.notification = action.payload.notification
        })

        builder.addCase(fetchUserDocument.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload ?? "Failed to load user"
        })

        //  fetchCurrentMonth
        builder
            .addCase(fetchCurrentMonth.pending, (state) => {
                state.isLoading = true
                state.error = null
            })

            .addCase(fetchCurrentMonth.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentMonth = action.payload
                state.lastSyncedAt = Date.now()
            })

            .addCase(fetchCurrentMonth.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? "Failed to load month data."
            })

        //  updateServoState
        builder
            .addCase(updateServoState.rejected, (state, action) => {
                state.error = action.payload ?? "Servo update failed."
            })
        // broadcast 
        builder
            .addCase(fetchBroadcasts.pending, (state) => {
                state.isLoading = true
            })

            .addCase(fetchBroadcasts.fulfilled, (state, action) => {
                state.isLoading = false
                state.broadcasts = action.payload
            })

            .addCase(fetchBroadcasts.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? "Failed to fetch broadcasts"
            })


            // admin configs like limits and price 
            .addCase(fetchAdminConfig.pending, (state) => {
                state.isLoading = true
                state.error = null
            })

            .addCase(fetchAdminConfig.fulfilled, (state, action) => {

                state.isLoading = false

                state.broadcasts = action.payload.broadcasts
                state.limitConfig = action.payload.limit
                state.priceConfig = action.payload.price

            })

            .addCase(fetchAdminConfig.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? "Failed to fetch admin config"
            })
    }

})

export const {
    setServoState,
    setLastSeen,
    refreshDeviceOnline,
    clearDashboardError,
    resetDashboard,
} = dashboardSlice.actions

export default dashboardSlice.reducer
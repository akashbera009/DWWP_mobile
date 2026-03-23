
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Broadcast, DashboardInitialState } from "@dwwp/modals"
import {
    fetchUserDetails,
    fetchCurrentMonth,
    // fetchBroadcasts,
    fetchAdminConfig,
} from "./dashboardActions"


const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: DashboardInitialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null
        },
        addBroadcast(state, action: PayloadAction<Broadcast>) {
            state.broadcasts.unshift(action.payload)
        },
        resetDashboard: () => DashboardInitialState,
    },

    extraReducers: (builder) => {

        // fetchUserDetails
        builder.addCase(fetchUserDetails.pending, (state) => {
            state.isLoading = true
        })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                state.isLoading = false
                state.userDetails = action.payload.userDetails
                state.notification = action.payload.notification
            })

            .addCase(fetchUserDetails.rejected, (state, action) => {
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
            })

            .addCase(fetchCurrentMonth.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? "Failed to load month data."
            })


        // builder
        //     .addCase(fetchBroadcasts.pending, (state) => {
        //         state.isLoading = true
        //     })

        //     .addCase(fetchBroadcasts.fulfilled, (state, action) => {
        //         state.isLoading = false
        //         state.broadcasts = action.payload
        //     })

        //     .addCase(fetchBroadcasts.rejected, (state, action) => {
        //         state.isLoading = false
        //         state.error = action.payload ?? "Failed to fetch broadcasts"
        //     })


        // admin configs like limits and price 
        builder
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
    clearDashboardError,
    addBroadcast,
    resetDashboard,
} = dashboardSlice.actions

export default dashboardSlice.reducer
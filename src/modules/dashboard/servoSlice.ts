
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { servoInitialState } from "@dwwp/modals"
import { fetchServoState, updateServoState } from "./servoActions"

const servoSlice = createSlice({
    name: "servo",
    initialState: servoInitialState,
    reducers: {

        setServoState: (state, action: PayloadAction<boolean>) => {
            state.servoState = action.payload
        },

        setLastSeen: (state, action: PayloadAction<number>) => {
            state.lastSeen = action.payload
            // state.deviceOnline = Date.now() - action.payload < 15000
        },

        refreshDeviceOnline: (state) => {
            if (state.lastSeen !== null) {
                // state.deviceOnline = Date.now() - state.lastSeen < 15000
            }
        },
    },

    extraReducers: (builder) => {
        //  updateServoState
        builder
            .addCase(updateServoState.fulfilled, (state, action) => {
                state.servoState = action.meta.arg.newState
                state.error = null
            })
            .addCase(updateServoState.rejected, (state, action) => {
                state.error = action.payload ?? "Servo update failed."
            })
        builder
            .addCase(fetchServoState.pending, state => {
                state.isLoading = true
            })

            .addCase(fetchServoState.fulfilled, (state, action) => {
                state.isLoading = false
                state.servoState = action.payload.servoState
                state.lastSeen = action.payload.lastSeen
            })

            .addCase(fetchServoState.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? "Unknown error"
            })
    }

})

export const {
    setServoState,
    setLastSeen,
    refreshDeviceOnline,
} = servoSlice.actions

export default servoSlice.reducer
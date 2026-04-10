
import { createAsyncThunk } from "@reduxjs/toolkit"
import firestore from "@react-native-firebase/firestore"
import { RootState } from "@dwwp/store"
import { CurrentMonth, BroadcastMsg, UserDetails, LimitConfig, PriceConfig } from "@dwwp/modals"
import { showErrorSnackbar } from "@dwwp/utils/showSnackBar"
import { getCurrentMonthKey, sumDailyUsages } from "@dwwp/utils/commonFunctions"

// Fetch User Document
export const fetchUserDetails = createAsyncThunk<
    { userDetails: UserDetails; notification: string },
    { email: string },
    { rejectValue: string }
>("dashboard/fetchUserDetails", async ({ email }, { rejectWithValue }) => {
    try {
        const snap = await firestore().collection("users").doc(email).get()
        const data = snap.data()
        if (!data) throw new Error("User document not found.")

        return {
            userDetails: data.userDetails,
            notification: data.notification ?? "",
        }
    } catch (e: any) {
        showErrorSnackbar(e.message ?? "Failed to fetch user document.")
        return rejectWithValue(e.message ?? "Failed to fetch user document.")
    }
})

// Fetch Month Data
export const fetchCurrentMonth = createAsyncThunk<
    CurrentMonth,
    { email: string; force?: boolean },
    { rejectValue: string; state: RootState }
>("dashboard/fetchCurrentMonth", async ({ email, force }, { getState, rejectWithValue }) => {

    try {

        const { currentMonth } = getState().dashboard

        // const isStale =
        //     !lastSyncedAt || Date.now() - lastSyncedAt > STALE_MS

        // if (!force && !isStale && currentMonth) return currentMonth
        if (!force && currentMonth) return currentMonth

        const monthKey = getCurrentMonthKey()

        const snap = await firestore()
            .collection("users")
            .doc(email)
            .collection("monthlyUsages")
            .doc(monthKey)
            .get()

        const data = snap.data() ?? {}

        const metaKeys = ["limit", "limitExceeded", "isMonthFinish"]
        const dailyUsages: Record<string, number> = {}

        Object.entries(data).forEach(([k, v]) => {
            if (!metaKeys.includes(k) && typeof v === "number")
                dailyUsages[k] = v
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
        showErrorSnackbar(e.message ?? "Failed to fetch month data.")
        return rejectWithValue(e.message ?? "Failed to fetch month data.")
    }

})


// // broadcast 
// export const fetchBroadcasts = createAsyncThunk<
//     BroadcastMsg[],
//     void,
//     { rejectValue: string }
// >(
//     "dashboard/fetchBroadcasts",
//     async (_, { rejectWithValue }) => {
//         try {
//             const snap = await firestore()
//                 .collection("admin")
//                 .doc("broadcast")
//                 .get()

//             const broadcasts = snap.data() ?? []

//             return broadcasts as BroadcastMsg[]
//         } catch (e: any) {
//             return rejectWithValue(
//                 e.message ?? "Failed to fetch broadcasts."
//             )
//         }
//     }
// )

// admin configs like limits and price 
export const fetchAdminConfig = createAsyncThunk<
    {
        broadcasts: BroadcastMsg[]
        limit: LimitConfig
        price: PriceConfig
    },
    void,
    { rejectValue: string }
>(
    "dashboard/fetchAdminConfig",
    async (_, { rejectWithValue }) => {
        try {

            const limitSnap = await firestore()
                .collection("admin")
                .doc("limit")
                .get()

            const priceSnap = await firestore()
                .collection("admin")
                .doc("price")
                .get()

            const broadcastSnap = await firestore()
                .collection("admin")
                .doc("broadcast")
                .get()

            return {
                limit: limitSnap.data() as LimitConfig,
                price: priceSnap.data() as PriceConfig,
                broadcasts: broadcastSnap.data()?.msg ?? [],
            }

        } catch (e: any) {
             showErrorSnackbar( e.message ?? "Failed to fetch admin config")
            return rejectWithValue(
                e.message ?? "Failed to fetch admin config"
            )
        }
    }
)
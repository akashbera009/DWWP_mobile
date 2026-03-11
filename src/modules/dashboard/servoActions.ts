
import { createAsyncThunk } from "@reduxjs/toolkit"
import firestore from "@react-native-firebase/firestore"
import { RootState } from "@dwwp/store";
import { showErrorSnackbar } from "@dwwp/utils/showSnackBar";

// fetch servo state 
export const fetchServoState = createAsyncThunk<
  {
    servoState: boolean
    lastSeen: number | null
  },
  { email: string },
  { rejectValue: string; state: RootState }
>(
  "servo/fetchServoState",
  async ({ email }, { rejectWithValue }) => {
    try {
      const snap = await firestore()
        .collection("users")
        .doc(email)
        .get()

      const data = snap.data()

      if (!data) {
        throw new Error("User document not found")
      }

      return {
        servoState: data.servoState,
        lastSeen: data.lastSeen ?? null,
      }

    } catch (e: any) {
      showErrorSnackbar(e.message ?? "Servo Fetch failed.")
      return rejectWithValue(e.message ?? "Servo Fetch failed.")
    }
  }
)

// Servo Update
export const updateServoState = createAsyncThunk<
    boolean,
    { email: string; newState: boolean },
    { rejectValue: string; state: RootState }
>("servo/updateServoState", async ({ email, newState }, { getState, dispatch, rejectWithValue }) => {
    const prevState = getState().servo.servoState
    dispatch({ type: "servo/setServoState", payload: newState })
    try {
        await firestore().collection("users").doc(email).update({
            servoState: newState,
        })

        return newState
    } catch (e: any) {
        showErrorSnackbar(e.message ?? "Servo update failed.")
        dispatch({ type: "servo/setServoState", payload: prevState })
        return rejectWithValue(e.message ?? "Servo update failed.")
    }

})
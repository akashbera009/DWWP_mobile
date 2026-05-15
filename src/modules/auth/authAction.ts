import { createAsyncThunk } from "@reduxjs/toolkit"

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "@react-native-firebase/auth";

import firestore from "@react-native-firebase/firestore"

import { persistor } from "@dwwp/store"

import { AuthUser, EditProfilePayload, RegisterPayload } from '@dwwp/modals'
import { clearAll } from "@dwwp/utils/mmkvStorage"
import { showInfoSnackbar } from "@dwwp/utils/showSnackBar";
import { Dispatch } from 'redux';
import { updateDashboardProfileImage } from "../dashboard/dashboardSlice";
import { stopAllListeners } from "../dashboard/usageListener";

export const loginWithEmail = createAsyncThunk<
    AuthUser,
    { email: string; password: string },
    { rejectValue: string }
>(
    "auth/loginWithEmail",
    async ({ email, password }, { rejectWithValue }) => {

        try {
            const cred = await signInWithEmailAndPassword(
                getAuth(),
                email,
                password
            );
            return {
                uid: cred.user.uid,
                email,
            }
        } catch (e: any) {
            const msg =
                e.code === "auth/user-not-found"
                    ? "No account found with this email."
                    : e.code === "auth/wrong-password"
                        ? "Incorrect password."
                        : e.code === "auth/invalid-email"
                            ? "Invalid email address."
                            : e.code === "auth/too-many-requests"
                                ? "Too many attempts. Try again later."
                                : e.message ?? "Login failed."

            return rejectWithValue(msg)
        }
    }
)
// ─── Register ─────────────────────────────────────────────────────────────────

export const registerWithEmail = createAsyncThunk<
    AuthUser,
    RegisterPayload,
    { rejectValue: string }
>(
    "auth/registerWithEmail",
    async ({ name, email, address, aadhaar, mobile, password }, { rejectWithValue }) => {
        try {
            // 1. Create Firebase Auth user
            const cred = await createUserWithEmailAndPassword(getAuth(), email, password);
            const uid = cred.user.uid;

            // 2. Save profile to Firestore under /users/{uid}
            await firestore().collection("users").doc(uid).set({
                uid,
                name,
                email,
                address,
                aadhaar,        // store hashed / encrypted in production
                mobile,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            return {
                uid,
                email,
                name,
            };
        } catch (e: any) {
            const msg =
                e.code === "auth/email-already-in-use"
                    ? "An account with this email already exists."
                    : e.code === "auth/invalid-email"
                        ? "Invalid email address."
                        : e.code === "auth/weak-password"
                            ? "Password is too weak. Use at least 8 characters."
                            : e.message ?? "Registration failed.";
            return rejectWithValue(msg);
        }
    }
);


// edit profile
export const updateProfile = createAsyncThunk<
    EditProfilePayload,
    EditProfilePayload,
    { rejectValue: string }
>(
    "editProfile/updateProfile",
    async (payload, { rejectWithValue }) => {
        try {
            const uid = getAuth().currentUser?.uid
            if (!uid) return rejectWithValue("User not authenticated.")

            await firestore().collection("users").doc(uid).update({
                name: payload.fullName,
                mobile: payload.mobileNo,
                address: payload.address,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            })

            showInfoSnackbar("Profile updated successfully")
            return payload
        } catch (e: any) {
            return rejectWithValue(e.message ?? "Failed to update profile.")
        }
    }
)

// update profile 
export const updateProfileImage = (imageUrl: string, userId: string) => {
    return async (dispatch: Dispatch) => {
        try {
            await firestore()
                .collection('users')
                .doc(userId)
                .update({
                    'userDetails.profileImage': imageUrl,
                });

            //   dispatch({
            //     type: 'UPDATE_PROFILE_IMAGE',
            //     payload: imageUrl,
            //   });
            dispatch(updateDashboardProfileImage(imageUrl));

        } catch (error) {
            console.error('Firebase update failed', error);
        }
    };
};

export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        // Stop all active Firestore listeners BEFORE signing out.
        // Without this the onSnapshot callbacks continue firing on a
        // de-authenticated connection, causing permission errors and
        // stale dispatches into a cleared store.
        stopAllListeners()
        await getAuth().signOut()
        await persistor.purge()
        await clearAll()
        showInfoSnackbar('Logged Out successfully')
    }
)
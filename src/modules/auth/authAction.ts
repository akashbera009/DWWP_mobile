import { createAsyncThunk } from "@reduxjs/toolkit"

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "@react-native-firebase/auth";

import firestore from "@react-native-firebase/firestore"

import { persistor } from "@dwwp/store"

import { AuthUser, RegisterPayload } from '@dwwp/modals'
import { clearAll } from "@dwwp/utils/mmkvStorage"
import { showInfoSnackbar } from "@dwwp/utils/showSnackBar";

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

export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        await getAuth().signOut()
        await persistor.purge()
        await clearAll()
        showInfoSnackbar('Logged Out successfully')
    }
)
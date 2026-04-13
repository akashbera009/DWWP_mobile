import { createSlice } from "@reduxjs/toolkit"
import { AuthState } from "@dwwp/modals/index"
import { loginWithEmail, updateProfile, logout, registerWithEmail } from "./authAction"

const initialState: AuthState & { success?: boolean } = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  success: false
}

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {

    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    clearEditProfileState: (state) => {
      state.error = null
      state.success = false
    },
    sessionExpired: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = "Session expired. Please log in again."
    },

  },

  extraReducers: builder => {

    builder

      // login
      .addCase(loginWithEmail.pending, state => {
        state.isLoading = true
        state.error = null
      })

      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })

      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? "Login failed"
      })

      // ── Register ────────────────────────────────────────────────────────────

      .addCase(registerWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Registration failed.";
      })

    // edit profile 
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = false
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.isLoading = false
        state.success = true
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? "Update failed."
      })

    // logout
    builder
      .addCase(logout.fulfilled, state => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        state.success = false
      })

  },
})

export const { clearError, sessionExpired, clearSuccess, clearEditProfileState } = authSlice.actions

export default authSlice.reducer
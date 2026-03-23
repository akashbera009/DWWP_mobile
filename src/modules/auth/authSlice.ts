import { createSlice } from "@reduxjs/toolkit"
import { AuthState } from "@dwwp/modals/index"
import { loginWithEmail, logout, registerWithEmail } from "./authAction"

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {

    clearError: (state) => {
      state.error = null
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


      // logout
      .addCase(logout.fulfilled, state => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })

  },
})

export const { clearError, sessionExpired } = authSlice.actions

export default authSlice.reducer
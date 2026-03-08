export interface AuthUser {
  uid: string
  email: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface RegisterPayload {
  name: string;
  email: string;
  address: string;
  aadhaar: string;
  mobile: string;
  password: string;
}


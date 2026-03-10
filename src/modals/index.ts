// authTypes
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

// dashboardTypes
export interface UserDetails {
    fullName: string
    mobileNo: string
    emailId: string
    address: string
    accountNumber: string
    consumerNumber: string
    meterNumber: string
    supplyZone: string
}

export interface CurrentMonth {
    monthKey: string
    limit: number
    limitExceeded: boolean
    isMonthFinish: boolean
    dailyUsages: Record<string, number>
    totalConsumed: number
}

export interface BroadcastMsg {
    icon: string
    message: string
    timestamp: string
}

export interface DashboardState {
    servoState: boolean
    lastSeen: number | null
    deviceOnline: boolean

    userDetails: UserDetails | null
    currentMonth: CurrentMonth | null

    notification: string
    broadcasts: BroadcastMsg[]

    limitConfig: LimitConfig | null
    priceConfig: PriceConfig | null

    lastSyncedAt: number | null
    isLoading: boolean
    error: string | null
}

// admin limits and prices 
export interface LimitConfig {
    max: number
    penalty: number
    regular: number
}

export interface PriceConfig {
    penaltyPrice: number
    regularPrice: number
}


//  payment
export interface PaymentRecord {
  amount: number
  date: string | null
  forMonth: string
  razorPayId: string
  status: 'pending' | 'Completed' | string
  timeStamp: string | null
}

export interface AddonRecord {
  id: string
  quantityDone: number
  amount: number
  addon_date: string | null
  razor_pay_id: string
  refill: number
  status: string | null
}

type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed'
interface PaymentState {
  payments: PaymentRecord[]
  addons: AddonRecord[]
  transactionHistory: {
    paymentsHistory: PaymentRecord[]
    addonsHistory: AddonRecord[]
  }
  pendingPaymentId: string | null
  lastPaymentStatus: PaymentStatus
  isProcessing: boolean
  isLoading: boolean
  error: string | null
}

export const PaymentInitialState: PaymentState = {
  payments: [],
  addons: [],
  transactionHistory: { paymentsHistory: [], addonsHistory: [] },
  pendingPaymentId: null,
  lastPaymentStatus: 'idle',
  isProcessing: false,
  isLoading: false,
  error: null,
}

/* ---- payload returned by thunk ---- */
export type FetchAllMonthsPayload = {
  payments: PaymentRecord[]     // flattened across all months
  addons: AddonRecord[]         // flattened across all months
  transactionHistory: {
    paymentsHistory: PaymentRecord[]
    addonsHistory: AddonRecord[]
  }
}

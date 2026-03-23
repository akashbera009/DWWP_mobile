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
export interface Broadcast {
  icon: string
  message: string
  timestamp: string
}
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
  userDetails: UserDetails | null
  currentMonth: CurrentMonth | null

  notification: string
  broadcasts: BroadcastMsg[]

  limitConfig: LimitConfig | null
  priceConfig: PriceConfig | null

  isLoading: boolean
  error: string | null
}
export const DashboardInitialState: DashboardState = {
  userDetails: null,
  currentMonth: null,
  notification: "",
  broadcasts: [],

  limitConfig: null,
  priceConfig: null,

  isLoading: true,
  error: null,
}
// servo state 
export type servoStateType = {
  servoState: boolean
  lastSeen: number | null

  isLoading: boolean
  error: string | null
}
export const servoInitialState: servoStateType = {
  servoState: false,
  lastSeen: null,

  isLoading: false,
  error: null,
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

// consumption 
type DayUsageMap = {
  [date: string]: number
}

export type MonthUsage = {
  monthId: string          // "YYYY-MM"
  days: DayUsageMap
  total: number
  limit?: number
  limitExceeded?: boolean
  isMonthFinish?: boolean
  lastUpdated?: number     // unix ms — when this was last fetched/updated
}
export type usageType = {
  months: Record<string, MonthUsage>
  currentMonthId: string | null
  todayUsage: number
  allTimeMonths: Record<string, number>
  allTimeDaysTotal: number
  historyLoaded: boolean

  loading: boolean
  error: string | null
}
export const usageInitialState: usageType = {
  months: {},
  currentMonthId: null,
  todayUsage: 0,
  allTimeMonths: {},
  allTimeDaysTotal: 0,
  historyLoaded: false,
  loading: false,
  error: null,
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
  qty: number
  amount: number
  addon_date: string | null
  razor_pay_id: string
  refill: number
  forMonth?:string 
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


// User Notification Types
export interface UserNotification {
  id: string
  type: 'payment' | 'refill' | 'limit_exceeded' | 'addon_completed' | 'system'| string
  title: string
  message: string
  amount?: number
  qty?: number
  razorPayId?: string
  status: 'Completed' | 'Pending' | 'Failed' | string
  icon: string
  timestamp: string
  createdAt: string
  read: boolean
}
export interface NotificationPayload {
  type: UserNotification['type']
  title: string
  message: string
  data?: {
    qty?: number
    amount?: number
    razorPayId?: string
    refill?: number
    status?: string
  }
}
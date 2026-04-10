import { RootState } from "@dwwp/store";
import colors from "./colors";
import mmkvStorage from "./mmkvStorage";

const USER_KEY = "APP_USER";
const USER_EMAIL = 'USER_EMAIL'

export type StoredUser = {
  uid: string;
  email: string;
};

export const saveUser = async (uid: string, email: string) => {
  const user: StoredUser = { uid, email };

  await mmkvStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};
export const getStoredUser = async (): Promise<StoredUser | null> => {
  const user = await mmkvStorage.getItem(USER_KEY);

  if (!user) return null;

  return JSON.parse(user);
};
export const getStoredUserEmail = async (): Promise<string | null> => {
  const userEmail = await mmkvStorage.getItem(USER_EMAIL);

  if (!userEmail) return null;

  return userEmail;
};
export const removeStoredUser = async () => {
  await mmkvStorage.removeItem(USER_KEY);
};



export function getDaysInMonth(monthLabel: string): number {
  // monthLabel like "January 2025" or current month
  try {
    const d = new Date(monthLabel)
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  } catch { return 30 }
}


export function getTrend(consumed: number, limit: number, dayOfMonth: number, daysInMonth: number): {
  label: string; color: string; icon: string
} {
  const expected = (dayOfMonth / daysInMonth) * limit
  const ratio = consumed / Math.max(expected, 1)
  if (ratio > 1.20) return { label: 'Overpacing — may exceed quota', color: colors.error, icon: '⚡' }
  if (ratio > 1.05) return { label: 'Slightly above pace', color: colors.warning, icon: '⚠️' }
  if (ratio < 0.80) return { label: 'Well under pace — great!', color: colors.success, icon: '✅' }
  return { label: 'On track for the month', color: colors.activeDot, icon: '📊' }
}


export const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(2)}kL` : `${Math.round(n)}L`
export const fmtD = (n: number) => `${n.toFixed(1)}L`


export function getCurrentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
export const getToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function sumDailyUsages(usages: Record<string, number>): number {
  return Object.values(usages).reduce((s, v) => s + v, 0)
}
const months: string[] = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];
export const getShortMonthNameByMonthKey = (monthKey: string) => {
  const monthId: number = Number(monthKey.split('-')[1]) - 1;;
  const yearName = monthKey.split('-')[0].split('').slice(-2).join('')
  return `${months[monthId].slice(0, 3)+'-'+ yearName}`
}
// for paymnetss 
export const normalizeTimestamp = (t: any): string | null => {
  if (!t) return null
  if (typeof t?.toDate === 'function') return t.toDate().toISOString()
  if (typeof t === 'object' && typeof t.seconds === 'number')
    return new Date(t.seconds * 1000).toISOString()
  if (typeof t === 'string') return t
  try {
    return new Date(t).toISOString()
  } catch {
    return String(t)
  }
}

export const toNumber = (v: any, fallback = 0): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^0-9.-]+/g, '')) // strip currency characters if any
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

// servo state 
export const selectDeviceOnline = (state: RootState) => {
  const lastSeen = state.servo.lastSeen

  if (!lastSeen) return false

  const diff = Date.now() - new Date(lastSeen).getTime()

  return diff < 30000
}


// usages util 

export function getTodayKey(): string {
  const d = new Date()
  return formatDateKey(d)
}

/**
 * Formats a Date to "YYYY-MM-DD"
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Formats a Date to "YYYY-MM"
 */
export function formatMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * Extracts all day fields from a raw Firestore month document.
 * Day fields match the pattern "YYYY-MM-DD"; everything else is metadata.
 */
export function extractDayFields(
  data: Record<string, unknown>
): Record<string, number> {
  const dayRegex = /^\d{4}-\d{2}-\d{2}$/
  const days: Record<string, number> = {}
  if( data === null || typeof data !== 'object') return days
  for (const [key, val] of Object.entries(data)) {
    if (dayRegex.test(key) && typeof val === 'number') {
      days[key] = val
    }
  }
  return days
}

/**
 * Sums all values in a DayUsageMap.
 */
export function sumDays(days: Record<string, number>): number {
  return Object.values(days).reduce((acc, v) => acc + v, 0)
}

/**
 * Returns true if the given monthId is strictly before the current month.
 * Used to filter history-only months.
 */
export function isPastMonth(monthId: string): boolean {
  return monthId < getCurrentMonthKey()
}
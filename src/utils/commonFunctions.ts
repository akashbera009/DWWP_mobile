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


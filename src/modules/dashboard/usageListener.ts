// ─────────────────────────────────────────────
//  usageListeners.ts
//  Module-level map that holds Firestore unsubscribe functions.
//  We intentionally do NOT store these in Redux state because
//  functions are not serialisable.
// ─────────────────────────────────────────────

const listeners = new Map<string, () => void>()

/**
 * Canonical key format: "<userEmail>:currentMonth"
 */
function listenerKey(userEmail: string): string {
  return `${userEmail}:currentMonth`
}

/**
 * Returns true if a live listener is already running for this user.
 */
export function hasListener(userEmail: string): boolean {
  return listeners.has(listenerKey(userEmail))
}

/**
 * Registers an unsubscribe function for a user's current-month listener.
 * Automatically removes any previous listener for the same user first.
 */
export function registerListener(
  userEmail: string,
  unsubscribe: () => void
): void {
  stopListener(userEmail) // safety: clean up any stale listener
  listeners.set(listenerKey(userEmail), unsubscribe)
}

/**
 * Calls the stored unsubscribe and removes the entry from the map.
 * Safe to call even if no listener exists.
 */
export function stopListener(userEmail: string): void {
  const key = listenerKey(userEmail)
  const unsub = listeners.get(key)
  if (unsub) {
    unsub()
    listeners.delete(key)
  }
}

/**
 * Stops ALL active listeners (e.g. on logout).
 */
export function stopAllListeners(): void {
  listeners.forEach((unsub) => unsub())
  listeners.clear()
}
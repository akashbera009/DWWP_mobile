import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { NotificationService } from '@dwwp/utils/firebaseNotificationUpdate'
import { setNotifications } from './Notificationslice'

/**
 * Custom hook to set up real-time notification listener
 * Call this in your main app component or a notification context
 */
export const useNotificationListener = (email?: string) => {
    const dispatch = useAppDispatch()
    // const currentEmail = useAppSelector(state => state?.dashboard.userDetails?.email)
    const currentEmail = useAppSelector(state => state?.dashboard.userDetails?.emailId)
    const userEmail = email || currentEmail

    useEffect(() => {
        if (!userEmail) return

        // Guard: prevents the snapshot callback from dispatching into Redux
        // after this hook has unmounted (stale closure protection).
        let active = true
        let unsubscribe: (() => void) | null = null

        try {
            unsubscribe = NotificationService.listenToUserNotifications(
                userEmail,
                notifications => {
                    if (!active) return
                    // Replace the entire notification list at once.
                    // This prevents duplicate accumulation.
                    dispatch(setNotifications(notifications))
                },
                error => {
                    console.error('Notification listener error:', error)
                }
            )
        } catch (error) {
            console.error('Failed to set up notification listener:', error)
        }

        // Cleanup on unmount: disable the guard first, then unsubscribe
        // so any in-flight snapshot callback is a no-op.
        return () => {
            active = false
            unsubscribe?.()
        }
    }, [userEmail, dispatch])
}

/**
 * Alternative hook: Direct notification service without Redux
 * Use this if you want to manage notifications outside of Redux
 */
export const useDirectNotificationListener = (
    email: string,
    callback: (notifications: any[]) => void
) => {
    useEffect(() => {
        if (!email) return

        const unsubscribe = NotificationService.listenToUserNotifications(
            email,
            callback,
            error => {
                console.error('Notification listener error:', error)
            }
        )

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [email, callback])
}
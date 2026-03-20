import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { NotificationService } from '@dwwp/utils/firebaseNotificationUpdate'
import { addNotification, setUnreadCount } from './Notificationslice'

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

        let unsubscribe: (() => void) | null = null

        try {
            // Set up real-time listener
            unsubscribe = NotificationService.listenToUserNotifications(
                userEmail,
                notifications => {
                    // Update the entire notification list
                    notifications.forEach((notification, index) => {
                        if (index === 0) {
                            // For the first (newest) notification, add it
                            dispatch(addNotification(notification))
                        }
                    })

                    // Update unread count
                    const unreadCount = notifications.filter(n => !n.read).length
                    dispatch(setUnreadCount(unreadCount))
                },
                error => {
                    console.error('Notification listener error:', error)
                }
            )
        } catch (error) {
            console.error('Failed to set up notification listener:', error)
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
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
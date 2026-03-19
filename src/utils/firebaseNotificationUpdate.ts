import firestore from '@react-native-firebase/firestore'
import { UserNotification, NotificationPayload } from '@dwwp/modals'

export class NotificationService {
    /**
     * Save a user notification to Firestore
     */
    static async createUserNotification(
        email: string,
        payload: NotificationPayload
    ): Promise<string> {
        try {
            const timestamp = new Date().toISOString()
            const docId = `notification_${Date.now()}`

            const notification: Omit<UserNotification, 'id'> = {
                type: payload?.type,
                title: payload?.title,
                message: payload?.message,
                status: payload?.data?.status || 'Completed',
                icon: this.getIconForType(payload.type),
                timestamp,
                createdAt: timestamp, // ✅ Use ISO string, not new Date()
                read: false,
                amount: payload?.data?.amount,
                qty: payload?.data?.qty,
                razorPayId: payload?.data?.razorPayId,
            }

            await firestore()
                .collection('users')
                .doc(email)
                .collection('user_notification')
                .doc(docId)
                .set(notification)

            return docId
        } catch (error) {
            console.error('Error creating notification:', error)
            throw error
        }
    }

    /**
     * Fetch all user notifications
     */
    static async getUserNotifications(
        email: string,
        limit: number = 50
    ): Promise<UserNotification[]> {
        try {
            const snapshot = await firestore()
                .collection('users')
                .doc(email)
                .collection('user_notification')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get()

            return snapshot.docs.map(doc => {
                const data = doc.data()

                // Handle createdAt - it should be stored as an ISO string
                let createdAt = data.createdAt

                // If it's not a string, try to convert it
                if (typeof createdAt !== 'string') {
                    try {
                        // Check if it's a Firestore Timestamp object
                        if (createdAt && typeof createdAt.toDate === 'function') {
                            createdAt = createdAt.toDate().toISOString()
                        } else {
                            createdAt = new Date().toISOString()
                        }
                    } catch (e) {
                        createdAt = new Date().toISOString()
                    }
                }

                return {
                    id: doc.id,
                    ...data,
                    createdAt,
                } as UserNotification
            })
        } catch (error) {
            console.error('Error fetching notifications:', error)
            throw error
        }
    }

    /**
     * Listen to real-time user notifications
     */
    static listenToUserNotifications(
        email: string,
        callback: (notifications: UserNotification[]) => void,
        onError?: (error: Error) => void
    ) {
        try {
            const unsubscribe = firestore()
                .collection('users')
                .doc(email)
                .collection('user_notification')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .onSnapshot(
                    snapshot => {
                        const notifications = snapshot.docs.map(doc => {
                            const data = doc.data()

                            // Handle createdAt - it should be stored as an ISO string
                            let createdAt = data.createdAt

                            // If it's not a string, try to convert it
                            if (typeof createdAt !== 'string') {
                                try {
                                    // Check if it's a Firestore Timestamp object
                                    if (createdAt && typeof createdAt.toDate === 'function') {
                                        createdAt = createdAt.toDate().toISOString()
                                    } else {
                                        createdAt = new Date().toISOString()
                                    }
                                } catch (e) {
                                    createdAt = new Date().toISOString()
                                }
                            }

                            return {
                                id: doc.id,
                                ...data,
                                createdAt,
                            } as UserNotification
                        })
                        callback(notifications)
                    },
                    error => {
                        console.error('Error listening to notifications:', error)
                        onError?.(error as Error)
                    }
                )
            return unsubscribe
        } catch (error) {
            console.error('Error setting up notification listener:', error)
            throw error
        }
    }

    /**
     * Mark notification as read
     */
    static async markNotificationAsRead(
        email: string,
        notificationId: string
    ): Promise<void> {
        try {
            await firestore()
                .collection('users')
                .doc(email)
                .collection('user_notification')
                .doc(notificationId)
                .update({ read: true })
        } catch (error) {
            console.error('Error marking notification as read:', error)
            throw error
        }
    }

    /**
     * Delete a notification
     */
    static async deleteNotification(
        email: string,
        notificationId: string
    ): Promise<void> {
        try {
            await firestore()
                .collection('users')
                .doc(email)
                .collection('user_notification')
                .doc(notificationId)
                .delete()
        } catch (error) {
            console.error('Error deleting notification:', error)
            throw error
        }
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(email: string): Promise<number> {
        try {
            const snapshot = await firestore()
                .collection('users')
                .doc(email)
                .collection('user_notification')
                .where('read', '==', false)
                .get()
            return snapshot.size
        } catch (error) {
            console.error('Error fetching unread count:', error)
            throw error
        }
    }

    /**
     * Helper: Get icon based on notification type
     */
    private static getIconForType(type: UserNotification['type']): string {
        const icons: Record<UserNotification['type'], string> = {
            payment: '💳',
            refill: '🔄',
            limit_exceeded: '⚠️',
            addon_completed: '✅',
            system: 'ℹ️',
        }
        return icons[type] || 'ℹ️'
    }
}
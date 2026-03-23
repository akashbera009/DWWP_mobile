/**
 * Notification Utility Functions
 * Various helpers for managing notifications
 */

import firestore from '@react-native-firebase/firestore'
import { UserNotification } from '@dwwp/modals'

/**
 * Archive old notifications (cleanup utility)
 * Run periodically to keep notification collection clean
 */
export async function archiveOldNotifications(email: string, daysOld: number = 90) {
    try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysOld)

        const oldNotifications = await firestore()
            .collection('users')
            .doc(email)
            .collection('user_notification')
            .where('createdAt', '<', cutoffDate)
            .get()

        // Delete in batches (Firestore limitation)
        const batch = firestore().batch()
        oldNotifications.docs.forEach((doc, index) => {
            batch.delete(doc.ref)
            if ((index + 1) % 500 === 0) {
                batch.commit()
                // Create new batch for next 500
            }
        })

        if (oldNotifications.docs.length % 500 !== 0) {
            await batch.commit()
        }

        console.log(`Archived ${oldNotifications.docs.length} old notifications for ${email}`)
        return oldNotifications.docs.length
    } catch (error) {
        console.error('Error archiving old notifications:', error)
        throw error
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(email: string): Promise<number> {
    try {
        const unreadNotifications = await firestore()
            .collection('users')
            .doc(email)
            .collection('user_notification')
            .where('read', '==', false)
            .get()

        const batch = firestore().batch()
        unreadNotifications.docs.forEach(doc => {
            batch.update(doc.ref, { read: true })
        })

        await batch.commit()

        console.log(`Marked ${unreadNotifications.docs.length} notifications as read`)
        return unreadNotifications.docs.length
    } catch (error) {
        console.error('Error marking all as read:', error)
        throw error
    }
}

/**
 * Get notifications by type
 */
export async function getNotificationsByType(
    email: string,
    type: UserNotification['type'],
    limit: number = 20
): Promise<UserNotification[]> {
    try {
        const snapshot = await firestore()
            .collection('users')
            .doc(email)
            .collection('user_notification')
            .where('type', '==', type)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get()

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as UserNotification))
    } catch (error) {
        console.error(`Error fetching ${type} notifications:`, error)
        throw error
    }
}

/**
 * Delete notifications by type
 */
export async function deleteNotificationsByType(
    email: string,
    type: UserNotification['type']
): Promise<number> {
    try {
        const notifications = await firestore()
            .collection('users')
            .doc(email)
            .collection('user_notification')
            .where('type', '==', type)
            .get()

        const batch = firestore().batch()
        notifications.docs.forEach(doc => {
            batch.delete(doc.ref)
        })

        await batch.commit()

        console.log(`Deleted ${notifications.docs.length} ${type} notifications`)
        return notifications.docs.length
    } catch (error) {
        console.error(`Error deleting ${type} notifications:`, error)
        throw error
    }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(email: string): Promise<{
    totalCount: number
    unreadCount: number
    typeBreakdown: Record<string, number>
}> {
    try {
        const allNotifications = await firestore()
            .collection('users')
            .doc(email)
            .collection('user_notification')
            .get()

        const stats = {
            totalCount: allNotifications.docs.length,
            unreadCount: 0,
            typeBreakdown: {} as Record<string, number>,
        }

        allNotifications.docs.forEach(doc => {
            const data = doc.data()

            // Count unread
            if (!data.read) {
                stats.unreadCount++
            }

            // Count by type
            const type = data.type || 'unknown'
            stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1
        })

        return stats
    } catch (error) {
        console.error('Error getting notification stats:', error)
        throw error
    }
}

/**
 * Create a batch of notifications (for admin use)
 */
export async function createBatchNotifications(
    email: string,
    notifications: Array<{
        type: UserNotification['type']
        title: string
        message: string
        data?: any
    }>
): Promise<string[]> {
    try {
        const docIds: string[] = []

        for (const notif of notifications) {
            const docId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            await firestore()
                .collection('users')
                .doc(email)
                .collection('user_notification')
                .doc(docId)
                .set({
                    type: notif.type,
                    title: notif.title,
                    message: notif.message,
                    status: 'Completed',
                    icon: getIconForType(notif.type),
                    timestamp: new Date().toISOString(),
                    createdAt: new Date(),
                    read: false,
                    ...notif.data,
                })

            docIds.push(docId)
        }

        return docIds
    } catch (error) {
        console.error('Error creating batch notifications:', error)
        throw error
    }
}

/**
 * Export notifications to CSV/JSON (for data export)
 */
export async function exportNotifications(
    email: string,
    format: 'json' | 'csv' = 'json'
): Promise<string> {
    try {
        const notifications = await firestore()
            .collection('users')
            .doc(email)
            .collection('user_notification')
            .orderBy('createdAt', 'desc')
            .get()

        const data = notifications.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }))

        if (format === 'json') {
            return JSON.stringify(data, null, 2)
        } else {
            // CSV format
            const headers = ['ID', 'Type', 'Title', 'Message', 'Status', 'CreatedAt', 'Read']
            const rows = data.map((n :any)=> [
                n.id,
                n.type,
                n.title,
                n.message,
                n.status,
                n.createdAt,
                n.read,
            ])

            const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
            return csv
        }
    } catch (error) {
        console.error('Error exporting notifications:', error)
        throw error
    }
}

/**
 * Helper function to get icon based on notification type
 */
function getIconForType(type: UserNotification['type']): string {
    const icons: Record<UserNotification['type'], string> = {
        payment: '💳',
        refill: '🔄',
        limit_exceeded: '⚠️',
        addon_completed: '✅',
        system: 'ℹ️',
    }
    return icons[type] || 'ℹ️'
}

/**
 * Search notifications by message
 */
export async function searchNotifications(
    email: string,
    searchTerm: string
): Promise<UserNotification[]> {
    try {
        const allNotifications = await firestore()
            .collection('users')
            .doc(email)
            .collection('user_notification')
            .orderBy('createdAt', 'desc')
            .get()

        const filtered = allNotifications.docs
            .filter(doc => {
                const data = doc.data()
                const searchLower = searchTerm.toLowerCase()
                return (
                    data.title?.toLowerCase().includes(searchLower) ||
                    data.message?.toLowerCase().includes(searchLower)
                )
            })
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            } as UserNotification))

        return filtered
    } catch (error) {
        console.error('Error searching notifications:', error)
        throw error
    }
}

/**
 * Get notification preferences/settings for user (optional)
 */
export async function getNotificationPreferences(
    email: string
): Promise<{
    enablePaymentNotifications: boolean
    enableRefillNotifications: boolean
    enableSystemNotifications: boolean
    enablePushNotifications: boolean
}> {
    try {
        const userDoc = await firestore()
            .collection('users')
            .doc(email)
            .collection('settings')
            .doc('notifications')
            .get()

        if (userDoc?.exists()) {
            return userDoc.data() as any
        }

        // Return defaults if not set
        return {
            enablePaymentNotifications: true,
            enableRefillNotifications: true,
            enableSystemNotifications: true,
            enablePushNotifications: true,
        }
    } catch (error) {
        console.error('Error getting notification preferences:', error)
        throw error
    }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    email: string,
    preferences: {
        enablePaymentNotifications?: boolean
        enableRefillNotifications?: boolean
        enableSystemNotifications?: boolean
        enablePushNotifications?: boolean
    }
): Promise<void> {
    try {
        await firestore()
            .collection('users')
            .doc(email)
            .collection('settings')
            .doc('notifications')
            .set(preferences, { merge: true })
    } catch (error) {
        console.error('Error updating notification preferences:', error)
        throw error
    }
}
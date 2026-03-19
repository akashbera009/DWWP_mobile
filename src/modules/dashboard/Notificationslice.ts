import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { UserNotification } from '@dwwp/modals'
import { NotificationService } from '../../utils/FirebaseNotificationUpdate'

export interface NotificationState {
    userNotifications: UserNotification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
}

const initialState: NotificationState = {
    userNotifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
}

/**
 * Async thunk to fetch user notifications
 */
export const fetchUserNotifications = createAsyncThunk<
    UserNotification[],
    string, // email
    { rejectValue: string }
>('notification/fetchUserNotifications', async (email, { rejectWithValue }) => {
    try {
        const notifications = await NotificationService.getUserNotifications(email)
        return notifications
    } catch (error: any) {
        return rejectWithValue(error.message ?? 'Failed to fetch notifications')
    }
})

/**
 * Async thunk to mark notification as read
 */
export const markNotificationAsRead = createAsyncThunk<
    void,
    { email: string; notificationId: string },
    { rejectValue: string }
>(
    'notification/markAsRead',
    async ({ email, notificationId }, { rejectWithValue }) => {
        try {
            await NotificationService.markNotificationAsRead(email, notificationId)
        } catch (error: any) {
            return rejectWithValue(error.message ?? 'Failed to mark as read')
        }
    }
)

/**
 * Async thunk to delete notification
 */
export const deleteNotification = createAsyncThunk<
    string, // returns the deleted notification ID
    { email: string; notificationId: string },
    { rejectValue: string }
>(
    'notification/delete',
    async ({ email, notificationId }, { rejectWithValue }) => {
        try {
            await NotificationService.deleteNotification(email, notificationId)
            return notificationId
        } catch (error: any) {
            return rejectWithValue(error.message ?? 'Failed to delete notification')
        }
    }
)

/**
 * Async thunk to get unread count
 */
export const fetchUnreadCount = createAsyncThunk<
    number,
    string, // email
    { rejectValue: string }
>('notification/fetchUnreadCount', async (email, { rejectWithValue }) => {
    try {
        const count = await NotificationService.getUnreadCount(email)
        return count
    } catch (error: any) {
        return rejectWithValue(error.message ?? 'Failed to fetch unread count')
    }
})

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        /**
         * Add a new notification to the state (for real-time updates)
         */
        addNotification: (state, action: PayloadAction<UserNotification>) => {
            state.userNotifications.unshift(action.payload)
            if (!action.payload.read) {
                state.unreadCount += 1
            }
        },

        /**
         * Update a notification in the state
         */
        updateNotification: (state, action: PayloadAction<UserNotification>) => {
            const index = state.userNotifications.findIndex(n => n.id === action.payload.id)
            if (index !== -1) {
                const wasUnread = !state.userNotifications[index].read
                const isNowUnread = !action.payload.read
                if (wasUnread && !isNowUnread) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                }
                state.userNotifications[index] = action.payload
            }
        },

        /**
         * Clear all notifications
         */
        clearNotifications: state => {
            state.userNotifications = []
            state.unreadCount = 0
        },

        /**
         * Set unread count
         */
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload
        },
    },

    extraReducers: builder => {
        // Fetch user notifications
        builder
            .addCase(fetchUserNotifications.pending, state => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchUserNotifications.fulfilled, (state, action) => {
                state.isLoading = false
                state.userNotifications = action.payload
                state.unreadCount = action.payload.filter(n => !n.read).length
            })
            .addCase(fetchUserNotifications.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload || 'Failed to fetch notifications'
            })

        // Mark as read
        builder
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                // Note: the actual update happens via real-time listener
                // This is just to update local state optimistically
                const notificationId = (action.meta.arg as any).notificationId
                const notification = state.userNotifications.find(n => n.id === notificationId)
                if (notification && !notification.read) {
                    notification.read = true
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.error = action.payload || 'Failed to mark as read'
            })

        // Delete notification
        builder
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const index = state.userNotifications.findIndex(n => n.id === action.payload)
                if (index !== -1) {
                    const notification = state.userNotifications[index]
                    if (!notification.read) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1)
                    }
                    state.userNotifications.splice(index, 1)
                }
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete notification'
            })

        // Fetch unread count
        builder
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload
            })
            .addCase(fetchUnreadCount.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch unread count'
            })
    },
})

export const {
    addNotification,
    updateNotification,
    clearNotifications,
    setUnreadCount,
} = notificationSlice.actions

export default notificationSlice.reducer
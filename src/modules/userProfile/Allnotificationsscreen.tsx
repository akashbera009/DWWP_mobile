import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    RefreshControl,
    StatusBar,
    FlatList,
} from 'react-native'

import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { BroadcastMsg, UserNotification } from '@dwwp/modals'
import {
    markNotificationAsRead,
    deleteNotification,
    fetchUserNotifications
} from '../dashboard/Notificationslice'
import { CustomHeader } from '@dwwp/components/CustomHeader'

// ─── Types ────────────────────────────────────────────────────────────────────
type CombinedNotification = (BroadcastMsg & { notificationType: 'broadcast'; id: string, type?: string })
    | (UserNotification & { notificationType: 'user' })

type FilterType = 'all' | 'unread' | 'broadcasts' | 'activity'

// ─── Helper Functions ─────────────────────────────────────────────────────────
const formatTimestamp = (timestamp: string): string => {
    try {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`

        return date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return 'Recently'
    }
}

const getNotificationColor = (
    type: string
): { bg: string; text: string; border: string } => {
    const colorMap: Record<
        string,
        { bg: string; text: string; border: string }
    > = {
        payment: {
            bg: '#4CAF5015',
            text: '#4CAF50',
            border: '#4CAF5030',
        },
        refill: {
            bg: '#2196F315',
            text: '#2196F3',
            border: '#2196F330',
        },
        limit_exceeded: {
            bg: '#FF980015',
            text: '#FF9800',
            border: '#FF980030',
        },
        addon_completed: {
            bg: '#4CAF5015',
            text: '#4CAF50',
            border: '#4CAF5030',
        },
        system: {
            bg: '#9C27B015',
            text: '#9C27B0',
            border: '#9C27B030',
        },
        broadcast: {
            bg: colors.primaryLight + '30',
            text: colors.primary,
            border: colors.primary + '30',
        },
    }

    return colorMap[type] || colorMap.system
}

// ─── Notification Card Component ───────────────────────────────────────────
interface NotificationCardProps {
    notification: CombinedNotification
    onPress: () => void
    onDelete: () => void
    type?: string
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onPress,
    onDelete,
}) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            friction: 8,
        }).start()
    }

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
        }).start()
    }

    const isUser = notification.notificationType === 'user'
    const isUnread = isUser && !notification.read
    const colorScheme = getNotificationColor(notification.type || 'broadcast')
    const icon = notification.icon || '📬'
    const title = 'title' in notification ? notification.title : notification.message
    const message = isUser && 'title' in notification ? notification.message : undefined

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.6}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={styles.cardTouchable}
            >
                <View
                    style={[
                        styles.card,
                        {
                            borderLeftColor: colorScheme.text,
                            backgroundColor: colorScheme.bg,
                            borderColor: colorScheme.border,
                        },
                    ]}
                >
                    {/* Icon Container */}
                    <View style={[styles.iconContainer, { backgroundColor: colorScheme.bg }]}>
                        <Text style={styles.icon}>{icon}</Text>
                        {isUnread && <View style={styles.unreadDot} />}
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Text
                                style={[
                                    styles.title,
                                    isUnread && styles.titleUnread,
                                ]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                            {isUser && isUnread && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>New</Text>
                                </View>
                            )}
                        </View>

                        {message && (
                            <Text style={styles.message} numberOfLines={2}>
                                {message}
                            </Text>
                        )}

                        {/* Footer: Amount + Timestamp */}
                        <View style={styles.footer}>
                            {isUser && 'amount' in notification && notification.amount && (
                                <Text style={[styles.amount, { color: colorScheme.text }]}>
                                    ₹{notification.amount}
                                </Text>
                            )}
                            <Text style={styles.timestamp}>
                                {formatTimestamp(notification.timestamp)}
                            </Text>
                        </View>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={onDelete}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}

// ─── Empty State Component ─────────────────────────────────────────────────
const EmptyState: React.FC<{ filter: FilterType }> = ({ filter }) => (
    <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>
            {filter === 'unread' ? '📭' : '✨'}
        </Text>
        <Text style={styles.emptyStateTitle}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
        </Text>
        <Text style={styles.emptyStateText}>
            {filter === 'unread'
                ? 'You have no unread notifications'
                : 'Check back later for updates'}
        </Text>
    </View>
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const AllNotificationsScreen: React.FC = () => {
    const dispatch = useAppDispatch()

    // Redux state
    const userEmail = useAppSelector(s => s?.dashboard?.userDetails?.emailId)
    const userNotifications = useAppSelector(s => s?.notification?.userNotifications || [])
    const isLoading = useAppSelector(s => s?.notification?.isLoading || false)
    const broadcasts = useAppSelector(s => s?.dashboard?.broadcasts || [])
    const unreadCount = useAppSelector(s => s?.notification?.unreadCount || 0)

    // Local state
    const [filter, setFilter] = useState<FilterType>('all')
    const [refreshing, setRefreshing] = useState(false)

    // Combine notifications
    const combinedNotifications: CombinedNotification[] = [
        ...userNotifications.map(n => ({ ...n, notificationType: 'user' as const })),
        ...broadcasts.map((b, idx) => ({
            ...b,
            id: `broadcast_${idx}`,
            notificationType: 'broadcast' as const,
        })),
    ].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return timeB - timeA
    })

    // Filter notifications
    const getFilteredNotifications = (): CombinedNotification[] => {
        switch (filter) {
            case 'unread':
                return combinedNotifications.filter(
                    n => n.notificationType === 'user' && !n.read
                )
            case 'broadcasts':
                return combinedNotifications.filter(n => n.notificationType === 'broadcast')
            case 'activity':
                return combinedNotifications.filter(n => n.notificationType === 'user')
            default:
                return combinedNotifications
        }
    }

    const filteredNotifications = getFilteredNotifications()

    // Handlers
    const handleRefresh = async () => {
        setRefreshing(true)
        if (userEmail) {
            await dispatch(fetchUserNotifications(userEmail))
        }
        setRefreshing(false)
    }

    const handleMarkRead = (notification: CombinedNotification) => {
        if (
            notification.notificationType === 'user' &&
            !notification.read &&
            userEmail
        ) {
            dispatch(
                markNotificationAsRead({
                    email: userEmail,
                    notificationId: notification.id,
                })
            )
        }
    }

    const handleDelete = (notification: CombinedNotification) => {
        if (notification.notificationType === 'user' && userEmail) {
            dispatch(
                deleteNotification({
                    email: userEmail,
                    notificationId: notification.id,
                })
            )
        }
    }

    // Load notifications on mount
    useEffect(() => {
        if (userEmail) {
            dispatch(fetchUserNotifications(userEmail))
        }
    }, [userEmail, dispatch])

    // Render
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <CustomHeader
                screenName={`Notification Center`}
            />
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {(['all', 'unread', 'broadcasts', 'activity'] as FilterType[]).map(
                        tab => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.filterTab,
                                    filter === tab && styles.filterTabActive,
                                ]}
                                onPress={() => setFilter(tab)}
                            >
                                <Text
                                    style={[
                                        styles.filterTabText,
                                        filter === tab && styles.filterTabTextActive,
                                    ]}
                                >
                                    {tab === 'all'
                                        ? 'All'
                                        : tab === 'unread'
                                            ? 'Unread'
                                            : tab === 'broadcasts'
                                                ? 'Updates'
                                                : 'Activity'}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </ScrollView>
            </View>

            {/* Notifications List */}
            {filteredNotifications.length > 0 ? (
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={(item, idx) =>
                        item.notificationType === 'user'
                            ? item.id
                            : `broadcast_${idx}`
                    }
                    renderItem={({ item }) => (
                        <NotificationCard
                            notification={item}
                            onPress={() => handleMarkRead(item)}
                            onDelete={() => handleDelete(item)}
                        />
                    )}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                />
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                    contentContainerStyle={styles.emptyContainer}
                >
                    <EmptyState filter={filter} />
                </ScrollView>
            )}
        </View>
    )
}

export default AllNotificationsScreen

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header
    header: {
        paddingHorizontal: normalize(20),
        paddingTop: normalize(16),
        paddingBottom: normalize(8),
        backgroundColor: colors.background,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        marginBottom: normalize(4),
    },
    headerTitle: {
        fontFamily: fonts.Bold,
        fontSize: normalize(24),
        color: colors.black,
    },
    headerSubtitle: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        borderRadius: normalize(12),
        paddingHorizontal: normalize(8),
        paddingVertical: normalize(2),
        minWidth: normalize(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadgeText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(11),
        color: colors.white,
    },

    // Filter Tabs
    filterContainer: {
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(20),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterTab: {
        paddingVertical: normalize(8),
        paddingHorizontal: normalize(14),
        marginRight: normalize(8),
        borderRadius: normalize(8),
        backgroundColor: colors.inputBackground,
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterTabText: {
        fontFamily: fonts.Medium,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
    },
    filterTabTextActive: {
        color: colors.white,
        fontFamily: fonts.SemiBold,
    },

    // Notification Card
    cardContainer: {
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(8),
    },
    cardTouchable: {
        borderRadius: normalize(12),
        overflow: 'hidden',
    },
    card: {
        flexDirection: 'row',
        padding: normalize(12),
        borderRadius: normalize(12),
        borderWidth: 1,
        borderLeftWidth: 4,
        gap: normalize(10),
        alignItems: 'flex-start',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(10),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    icon: {
        fontSize: normalize(20),
    },
    unreadDot: {
        position: 'absolute',
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: colors.primary,
        top: -normalize(3),
        right: -normalize(3),
        borderWidth: 2,
        borderColor: colors.white,
    },

    // Card Content
    content: {
        flex: 1,
        gap: normalize(4),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(6),
        justifyContent: 'space-between',
    },
    title: {
        fontFamily: fonts.Medium,
        fontSize: normalize(13),
        color: colors.black,
        flex: 1,
    },
    titleUnread: {
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
    },
    badge: {
        backgroundColor: colors.primary,
        borderRadius: normalize(4),
        paddingHorizontal: normalize(6),
        paddingVertical: normalize(2),
    },
    badgeText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(10),
        color: colors.white,
    },
    message: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
        lineHeight: normalize(16),
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        marginTop: normalize(2),
    },
    amount: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
    },
    timestamp: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: colors.neutralBodyText,
    },

    // Delete Button
    deleteBtn: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(12),
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtnText: {
        fontSize: normalize(12),
        color: colors.neutralBodyText,
        fontWeight: '600',
    },

    // List
    listContent: {
        paddingVertical: normalize(8),
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: normalize(60),
    },
    emptyStateIcon: {
        fontSize: normalize(56),
        marginBottom: normalize(12),
    },
    emptyStateTitle: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(16),
        color: colors.black,
        marginBottom: normalize(4),
    },
    emptyStateText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
    },
})
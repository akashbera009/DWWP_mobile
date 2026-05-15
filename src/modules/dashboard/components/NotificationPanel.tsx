import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'

import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { BroadcastMsg, UserNotification } from '@dwwp/modals'
import { fetchUserNotifications } from '../Notificationslice'
import { MainStackParamList } from '@dwwp/utils/types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { screenNames } from '@dwwp/utils/screenNames'
type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useAppDispatch()
    const navigation = useNavigation<MainStackNavigationProp>();

    // Admin broadcasts
    const [broadcasts, setBroadcasts] = useState<BroadcastMsg[] | null>([])
    const broadcastSelector = useAppSelector(state => state?.dashboard.broadcasts)

    // User notifications
    const [userNotifications, setUserNotifications] = useState<UserNotification[] | null>([])
    const userNotificationsSelector = useAppSelector(state => state?.notification.userNotifications)
    const userEmail = useAppSelector(state => state?.dashboard.userDetails?.emailId)

    // Combined view
    const [activeTab, setActiveTab] = useState<'all' | 'broadcasts' | 'notifications'>('all')

    useEffect(() => {
        if (broadcastSelector?.length !== 0) {
            setBroadcasts(broadcastSelector)
        }
    }, [broadcastSelector])

    useEffect(() => {
        if (userNotificationsSelector?.length !== 0) {
            setUserNotifications(userNotificationsSelector)
        }
    }, [userNotificationsSelector])

    // Fetch user notifications on mount
    useEffect(() => {
        if (userEmail) {
            dispatch(fetchUserNotifications(userEmail))
        }
    }, [userEmail, dispatch])

    const allNotifications = [
        ...(broadcasts || []).map(b => ({
            ...b,
            notificationType: 'broadcast' as const,
        })),
        ...(userNotifications || []).map(n => ({
            ...n,
            notificationType: 'user' as const,
        })),
    ].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return timeB - timeA
    })

    const totalCount = allNotifications.length
    const unreadCount = (userNotifications || []).filter(n => !n.read).length

    const getFilteredNotifications = () => {
        switch (activeTab) {
            case 'broadcasts':
                return allNotifications.filter(n => n.notificationType === 'broadcast')
            case 'notifications':
                return allNotifications.filter(n => n.notificationType === 'user')
            default:
                return allNotifications
        }
    }

    const filteredNotifications = getFilteredNotifications()

    const getNotificationColor = (notification: any) => {
        if (notification.notificationType === 'broadcast') {
            return colors.activeDot
        }

        // Color based on user notification type
        const typeColors: Record<string, string> = {
            payment: colors.success || '#4CAF50',
            refill: colors.info || '#2196F3',
            limit_exceeded: colors.warning || '#FF9800',
            addon_completed: colors.success || '#4CAF50',
            system: colors.activeDot,
        }
        return typeColors[notification.type] || colors.activeDot
    }

    const formatTimestamp = (timestamp: string) => {
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

        return date.toLocaleDateString()
    }
    return (
        <View style={styles.dropdownPanel}>
            <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Notifications</Text>
                <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{filteredNotifications?.length}</Text>
                </View>
            </View>

            <View style={styles.scrollviewWrapper}>
                {/* <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: vh(300) }}
                    contentContainerStyle={{ paddingBottom: vh(12) }}
                >
                    {filteredNotifications?.map((n: BroadcastMsg, id: number) => (
                        <View key={id} style={styles.notifRow}>
                            <View
                                style={[
                                    styles.notifIconBox,
                                    { backgroundColor: `${colors.activeDot}18` },
                                ]}
                            >
                                <Text style={{ fontSize: 15 }}>{n.icon}</Text>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.notifTitle}>{n.message}</Text>
                                <Text style={styles.notifTime}>{n.timestamp}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView> */}
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={(item, index) => `${index}`}
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: vh(300) }}
                    contentContainerStyle={{ paddingBottom: vh(12) }}
                    renderItem={({ item, index }) => (
                        <View style={styles.notifRow}>
                            <View
                                style={[
                                    styles.notifIconBox,
                                    { backgroundColor: `${getNotificationColor(item)}18` },
                                ]}
                            >
                                <Text style={{ fontSize: 15 }}>{item.icon}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.notifTitle}>{item.message}</Text>
                                <Text style={styles.notifTime}>{formatTimestamp(item.timestamp)}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', paddingVertical: vh(20) }}>
                            <Text style={{ color: colors.calendarDayDisabled, fontStyle: 'italic' }}>
                                No notifications
                            </Text>
                        </View>
                    }
                />
            </View>

            <TouchableOpacity onPress={() => {
                onClose?.()
                navigation.navigate(screenNames.AllNotifications)
            }} style={styles.dropdownFooter}>
                <Text style={styles.dropdownFooterText}>View All</Text>
            </TouchableOpacity>
        </View>
    )
}

export default NotificationPanel

const styles = StyleSheet.create({
    dropdownPanel: {
        position: 'absolute',
        top: normalize(50),
        right: vw(12),
        width: vw(270),
        backgroundColor: colors.white,
        borderRadius: normalize(18),
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        zIndex: 400,
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: normalize(14),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dropdownTitle: {
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        color: colors.neutralBlack,
    },
    dropdownFooter: {
        padding: normalize(12),
        alignItems: 'center',
    },
    dropdownFooterText: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
        color: colors.primary,
    },
    scrollviewWrapper: {
        maxHeight: vh(300)
    },
    notifBadge: {
        width: normalize(20),
        height: normalize(20),
        borderRadius: normalize(10),
        backgroundColor: colors.activeDot,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifBadgeText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(10),
        color: colors.white,
    },
    notifRow: {
        flexDirection: 'row',
        gap: normalize(10),
        padding: normalize(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'flex-start',
    },
    notifIconBox: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifTitle: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
        color: colors.neutralBlack,
    },
    notifDesc: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: colors.neutralBodyText,
        marginTop: vh(1),
    },
    notifTime: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: colors.neutralBodyText,
        marginTop: vh(2),
    },

})
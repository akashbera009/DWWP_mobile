import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'

import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { useAppSelector } from '@dwwp/store/hooks'
import { BroadcastMsg } from '@dwwp/modals'

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
    const [notifications, setNoticications] = useState<BroadcastMsg[] | null>([])
    const notificationSelector = useAppSelector(state => state?.dashboard.broadcasts)
    useEffect(() => {
        if (notificationSelector?.length !== 0) {
            setNoticications(notificationSelector)
        } else return
    }, [notificationSelector])
    return (
        <View style={styles.dropdownPanel}>
            <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Notifications</Text>
                <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{notifications?.length}</Text>
                </View>
            </View>

            <View style={styles.scrollviewWrapper}>
                <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                >
                    {notifications?.map((n: BroadcastMsg, id: number) => (
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
                </ScrollView>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.dropdownFooter}>
                <Text style={styles.dropdownFooterText}>View All</Text>
            </TouchableOpacity>
        </View>
    )
}

export default NotificationPanel

const styles = StyleSheet.create({
    dropdownPanel: {
        position: 'absolute',
        top: normalize(90),
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
        flex: 1,
        maxHeight: vh(200)
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
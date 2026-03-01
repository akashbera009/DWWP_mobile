import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import colors from '@dwwp/utils/colors'
import { localImages } from '@dwwp/utils/localimages'
import fonts from '@dwwp/utils/fonts'

type UserNotificationTabPropType = {
    isNotificationTabOpen: boolean;
    onOpen: () => void
    onClose: () => void
}
type notificationType = {
    title: string,
    subTitle: string,
    timeStamp: string
}
const NotificationComponent = ({ isNotificationTabOpen, onOpen, onClose }: UserNotificationTabPropType) => {
    const [isUnreadNotification, setIsUnreadNotification] = useState<number>(0)
    const [notifications, setNotifcations] = useState<notificationType[]>([])

    useEffect(() => {
        const dummyNotifications: notificationType[] = [
            {
                title: "New Order Received",
                subTitle: "Order #1234 has been placed successfully.",
                timeStamp: "2 min ago"
            },
            {
                title: "Payment Successful",
                subTitle: "Your payment of $240 was processed.",
                timeStamp: "10 min ago"
            },
            {
                title: "Profile Updated",
                subTitle: "Your profile information was updated.",
                timeStamp: "1 hour ago"
            },
            {
                title: "New Message",
                subTitle: "You received a new message from Admin.",
                timeStamp: "2 hours ago"
            },
            {
                title: "Weekly Report",
                subTitle: "Your weekly analytics report is ready.",
                timeStamp: "Yesterday"
            }
        ];

        setNotifcations(dummyNotifications);
        setIsUnreadNotification(dummyNotifications.length);
    }, []);

    return (
        <View>
            <Pressable
                onPress={() => { isNotificationTabOpen ? onClose?.() : onOpen?.() }}>
                <Image source={localImages.bell_full}
                    style={styles.notificationIcon} />
                {isUnreadNotification !== 0 && (
                    <Text style={styles.unreadNotificaiton}>{isUnreadNotification}</Text>
                )}
            </Pressable>
            {isNotificationTabOpen && (
                <Modal
                    transparent
                    animationType='none'
                    visible={isNotificationTabOpen}>
                    <Pressable style={styles.overlay} onPress={onClose}>
                        <View
                            style={styles.expandedNotificationView}
                        >
                            <Pressable onPress={onClose}>
                                <Image source={localImages.close} style={styles.close} />
                            </Pressable>
                            <View style={styles.notificationListContainer}>
                                {notifications.length === 0 ? (
                                    <Text>No Notifications</Text>
                                ) : (
                                    notifications.map((item, index) => (
                                        <View key={index} style={styles.notificationItem}>
                                            <View style={styles.firstline}>
                                                <Text style={styles.notificationTitle}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.notificationTime}>
                                                    {item.timeStamp}
                                                </Text>
                                            </View>

                                            <Text style={styles.notificationSubTitle}>
                                                {item.subTitle}
                                            </Text>

                                        </View>
                                    ))
                                )}
                            </View>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    )
}

export default NotificationComponent

const styles = StyleSheet.create({
    notificationIcon: {
        height: vh(22),
        width: vw(22),
        tintColor: colors.white,
        marginHorizontal: normalize(16)
    },
    unreadNotificaiton: {
        fontSize: normalize(14),
        color: colors.warning,
        fontFamily: fonts.Regular,
        position: 'absolute',
        top: vh(-10),
        left: vw(32)
    },
    overlay: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-end",
        paddingTop: vh(50),
        paddingRight: vw(16),
    },
    close: {
        height: vh(12),
        width: vh(12),
        position: 'absolute',
        right: vw(10),
        top: vh(10)
    },
    expandedNotificationView: {
        backgroundColor: colors.white,
        padding: vh(12),
        minWidth: vw(210),
        minHeight: vh(100),
        borderRadius: normalize(10),
        elevation: 10,
    },
    notificationListContainer: {
        marginTop: vh(25),
        maxWidth: vw(400),
    },
    notificationItem: {
        marginBottom: vh(5),
        paddingBottom: vh(10),
        borderBottomWidth: normalize(0.5),
        borderBottomColor: colors.darkGray
    },
firstline:{
    flexDirection : 'row',
    alignItems:'center',
    justifyContent : 'space-between'
},
    notificationTitle: {
        fontSize: normalize(14),
        fontFamily: fonts.SemiBold,
        marginBottom: vh(4)
    },

    notificationSubTitle: {
        fontSize: normalize(12),
        color: colors.darkGrey,
        marginBottom: vh(4),
        fontFamily: fonts.light
    },

    notificationTime: {
        marginHorizontal : vw(10),
        fontSize: normalize(10),
        color: colors.placeholderText,
        fontFamily: fonts.ExtraLight
    },
})
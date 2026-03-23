import { Image, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import React, { useEffect, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient';
// utils 
import fonts from '@dwwp/utils/fonts'
import { strings } from '@dwwp/utils/strings';
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { localImages } from '@dwwp/utils/localimages';
import colors from '@dwwp/utils/colors'
// component 
import Avatar from './Avatar';

type HeaderProps = {
    activeTab: number,
    handleSetActivetab: (tab: number) => void,
    handleProfileOpen: () => void
    handleProfileClose: () => void
    handleNotifOpen: () => void
    handleNotifClose: () => void
}
const tabs = ['overview', 'device', 'usages']
const springConfig = {
    damping: 5,      // lower = more oscillation
    stiffness: 90,
    mass: .5,
}
const Header = ({
    activeTab,
    handleSetActivetab,
    handleProfileOpen,
    handleProfileClose,
    handleNotifOpen,
    handleNotifClose
}: HeaderProps) => {
    const [tabBarWidth, setTabBarWidth] = useState<number>(0)
    const indicatorTranslateX = useSharedValue(0)

    // update indicator when activeTab or tabBarWidth changes
    useEffect(() => {
        if (!tabBarWidth) return
        const indicatorWidth = tabBarWidth / tabs.length
        const to = indicatorWidth * activeTab
        // animate with spring for bounce
        indicatorTranslateX.value =  
        withSpring(to, springConfig)
        // withTiming(indicatorWidth * activeTab , {duration: 100})
    }, [activeTab, tabBarWidth, indicatorTranslateX])

    const onTabBarLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width
        // we want to set it only once (or when orientation changes)
        setTabBarWidth(w)
        // ensure indicator snaps to current tab if width was previously 0
        const indicatorWidth = w / tabs.length
        indicatorTranslateX.value =
        withSpring(indicatorWidth * activeTab, springConfig)
        //  withTiming(indicatorWidth * activeTab , {duration: 100})
    }

    const indicatorWidth = tabBarWidth ? tabBarWidth / tabs.length : 0

    const indicatorAnimStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: indicatorTranslateX.value }
            ]
        }
    })

    const handleProfileTap = () => {
        handleProfileOpen()
        handleNotifClose()
    }
    const handleNotificationTap = () => {
        handleNotifOpen()
        handleProfileClose()
    }
    return (
        <LinearGradient
            colors={[colors.primaryDark, colors.primary]}
            start={{ x: 1, y: 1 }} end={{ x: 1, y: 0 }}
            style={styles.header}
        >
            {/* Logo + Actions */}
            <View style={styles.headerTop}>
                <View style={styles.logoRow}>
                    <View style={styles.logoIconBox}>
                        <Image source={localImages.dwwp_logo} style={styles.logo} />
                    </View>
                    <Text style={styles.logoText}>{strings.dwwp}</Text>
                </View>
                <View style={styles.headerActions}>
                    {/* Notification Bell */}
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={handleNotificationTap}
                    >
                        <Image source={localImages.bell_full}
                            style={styles.notificationIcon}
                        />
                        <View style={styles.notifIndicator} />
                    </TouchableOpacity>

                    {/* Avatar */}
                    <TouchableOpacity
                        style={styles.userPressButton}
                        onPress={handleProfileTap}
                    >
                        <Avatar name="Akash Bera" size={36} />
                        <Image source={localImages.downarrow}
                            style={styles.downarrow}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabBarWrapper} onLayout={onTabBarLayout}>
                {/* Animated sliding background indicator */}
                {indicatorWidth > 0 && (
                    <Animated.View
                        style={[
                            styles.indicator,
                            {
                                width: indicatorWidth,
                            },
                            indicatorAnimStyle
                        ]}
                    />
                )}

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {tabs.map((tab, idx) => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tabPress}
                            activeOpacity={0.8}
                            onPress={() => handleSetActivetab(idx)}
                        >
                            <View style={styles.tab}>
                                <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </LinearGradient>
    )
}

export default Header

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: vw(16),
        paddingBottom: vh(12),
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: vh(14),
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: vw(8),
    },
    logoIconBox: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(10),
        backgroundColor: colors.whiteLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: normalize(34),
        height: normalize(34),
        resizeMode: 'contain',
        borderRadius:normalize(8)
    },
    logoText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(22),
        color: colors.white,
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: vw(10),
    },
    headerIconBtn: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(12),
        backgroundColor: colors.whiteLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationIcon: {
        height: vh(20),
        width: vw(20),
        tintColor: colors.white,
        marginHorizontal: normalize(16)
    },
    notifIndicator: {
        position: 'absolute',
        top: normalize(7),
        right: normalize(7),
        width: normalize(8),
        height: normalize(8),
        borderRadius: normalize(4),
        backgroundColor: colors.error,
        borderWidth: 1.5,
        borderColor: colors.primary,
        zIndex: 0,
    },
    userPressButton: {
        borderWidth: normalize(1),
        borderRadius: normalize(20),
        borderColor: colors.border,
        padding: normalize(2),
        flexDirection: 'row',
        alignItems: 'center'
    },
    downarrow: {
        height: vh(16),
        width: vh(16),
        tintColor: colors.white,
        margin: normalize(6)
    },

    // Tab Bar
    tabBarWrapper: {
        height: vh(44),
        position: 'relative',
        borderRadius: normalize(12),
        overflow: 'hidden'
    },
    tabBar: {
        position: 'absolute',
        flexDirection: 'row',
        gap: vw(6),
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 20
    },
    tabPress: {
        flex: 1
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vh(8)
    },
    tabText: {
        fontFamily: fonts.Medium,
        fontSize: normalize(14),
        color: colors.placeholderText,
    },
    tabTextActive: {
        fontFamily: fonts.Bold,
        color: colors.white,
    },
    indicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.indicatorBackgroundColor,
        borderRadius: normalize(12)
    }
})
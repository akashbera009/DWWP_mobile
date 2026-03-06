import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Avatar from './Avatar';
import LinearGradient from 'react-native-linear-gradient';
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { strings } from '@dwwp/utils/strings';
import { localImages } from '@dwwp/utils/localimages';
import colors from '@dwwp/utils/colors'
type HeaderProps = {
    activeTab: 'overview' | 'device' | 'usages',
    setActiveTab: (tab: 'overview' | 'device' | 'usages') => void,
    setProfileOpen: (open: any) => void,
    setNotifOpen: (open: any) => void,
}
const Header = ({ activeTab, setActiveTab, setProfileOpen, setNotifOpen }: HeaderProps) => {
    return (
        <LinearGradient
            colors={[colors.primaryDark , colors.primary ]}
            start={{ x: 1, y: 1}} end={{ x: 1, y: 0 }}
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
                        onPress={() => { setNotifOpen((p: any) => !p); setProfileOpen(false) }}
                    >
                        <Image source={localImages.bell_full}
                            style={styles.notificationIcon}
                        />
                        <View style={styles.notifIndicator} />
                    </TouchableOpacity>

                    {/* Avatar */}
                    <TouchableOpacity
                        style={styles.userPressButton}
                        onPress={() => { setProfileOpen((p: any) => !p); setNotifOpen(false) }}
                    >
                        <Avatar name="Akash Bera" size={36} />
                        <Image source={localImages.downarrow}
                            style={styles.downarrow}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {(['overview', 'device', 'usages'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </LinearGradient>
    )
}

export default Header

const styles = StyleSheet.create({

    // Header
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
        paddingTop: vh(6),
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
        backgroundColor: 'rgba(50,194,202,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: normalize(22),
        height: normalize(22),
        resizeMode: 'contain',
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
        backgroundColor: 'rgba(255,255,255,0.12)',
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
    headerName: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: colors.white,
        marginHorizontal: vw(8),
    },
    headerRole: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: 'rgba(255,255,255,0.65)',
    },

    // Tab Bar
    tabBar: {
        flexDirection: 'row',
        gap: vw(6),
    },
    tab: {
        flex: 1,
        paddingVertical: vh(7),
        borderRadius: normalize(10),
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    tabText: {
        fontFamily: fonts.Medium,
        fontSize: normalize(12),
        color: 'rgba(255,255,255,0.55)',
    },
    tabTextActive: {
        fontFamily: fonts.Bold,
        color: colors.white,
    },
})
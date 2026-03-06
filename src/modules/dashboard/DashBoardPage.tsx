import React, { useState } from 'react'
import {
    View, StyleSheet, ScrollView,
    Pressable,
    RefreshControl,
} from 'react-native'

import { Portal } from '@gorhom/portal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// utils 
import { vh, vw } from '@dwwp/utils/dimensions'
import { showSnackbar } from '@dwwp/utils/showSnackBar'
import colors from '@dwwp/utils/colors'

// components
import FixedCharges from './FixedCharges'
import WelcomeBanner from './WelcomeBanner'
import HeroSummaryCard from './HeroSummaryCard'
import UsageChart from './components/UsageChart'
import StatGrid from './StatGrid'
import Header from './components/Header'
import ProfilePanel from './components/ProfilePanel'
import NotificationPanel from './components/NotificationPanel'

import SwitchModal from './components/SwitchModal'
import DeviceSection from './DeviceSection'


// ─── Mock Data ────────────────────────────────────────────────────────────────
const DEVICES_INITIAL = [
    { id: 1, name: 'Pump Station #1', status: 'online', load: 74, location: 'Zone A' },
    { id: 2, name: 'Main Controller', status: 'online', load: 42, location: 'Zone B' },
    { id: 3, name: 'Servo Unit #4', status: 'offline', load: 0, location: 'Zone C' },
    { id: 4, name: 'Flow Sensor', status: 'online', load: 91, location: 'Zone A' },
]

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashBoardPage = () => {
    const [notifOpen, setNotifOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [deviceList, setDeviceList] = useState(DEVICES_INITIAL)
    const [activeTab, setActiveTab] = useState<'overview' | 'device' | 'usages'>('overview')
    const [refreshing, setRefreshing] = React.useState(false);

    const [servoState, setServoState] = useState<boolean>(false)
    const [lastSeen, setLastSeen] = useState<number | undefined>(undefined)
    const [limitExceeded, setLimitExceeded] = useState<boolean>(false)
    const [isSwitchOpen, setIsSwitchOpen] = useState<boolean>(false)

    const { top } = useSafeAreaInsets()
    const onlineCount = deviceList.filter(d => d.status === 'online').length

    const closeDropdowns = () => { setNotifOpen(false); setProfileOpen(false) }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            showSnackbar({ message: 'Data refreshed!', type: 'success' })
            setRefreshing(false);
        }, 1000);
    }, []);

    // Derive device online level from lastSeen
    const deviceOffline = lastSeen !== undefined
        ? Math.floor((Date.now() - lastSeen) / 1000) > 60
        : false

    return (
        <View style={[styles.safeArea, { paddingTop: top, }]} >

            {/* ── Header ── */}
            <Header activeTab={activeTab} setActiveTab={setActiveTab} setProfileOpen={setProfileOpen} setNotifOpen={setNotifOpen} />

            {/* ── Dropdowns ── */}
            {notifOpen && (
                <Portal hostName="safe">
                    <Pressable style={styles.dropdownBackdrop} onPress={closeDropdowns}>
                        <NotificationPanel onClose={closeDropdowns} />
                    </Pressable>
                </Portal>
            )}
            {profileOpen && (
                <Portal hostName="safe">
                    <Pressable style={styles.dropdownBackdrop} onPress={closeDropdowns}>
                        <ProfilePanel onClose={closeDropdowns} />
                    </Pressable>
                </Portal>
            )}
            {/* ── Switch Modal ── */}
            {isSwitchOpen && (
                <SwitchModal
                    servoState={servoState}
                    onToggle={(next) => {
                        setServoState(next)
                        // TODO: write to Firebase:
                        // firestore().doc(`users/${email}`).update({ servoState: next })
                    }}
                    onClose={() => setIsSwitchOpen(false)}
                    quotaExceeded={limitExceeded}
                    deviceOffline={deviceOffline}
                />
            )}

            {/* ── Scrollable Content ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* Welcome Row */}
                <WelcomeBanner userName={'Akash Bera'} />

                {/* Hero Summary Card */}
                <HeroSummaryCard onlineCount={onlineCount} total={deviceList.length} />

                {/* 2×2 Stat Grid */}
                <StatGrid />

                {/* Usage Chart */}
                <UsageChart />

                {/* Fixed Charges */}
                <FixedCharges />

                {/* Device Control */}
                <DeviceSection lastSeen={lastSeen} servoState={servoState} setIsSwitchOpen={() => setIsSwitchOpen(true)} />

            </ScrollView >


        </View >
    )
}

export default DashBoardPage

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    dropdownBackdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 300,
    },
    // Scroll
    scroll: {
        flex: 1,
        backgroundColor: colors.overlayBackground,
    },
    scrollContent: {
        paddingHorizontal: vw(16),
        paddingTop: vh(16),
        paddingBottom: vh(90),
        gap: vh(14),
    },

})
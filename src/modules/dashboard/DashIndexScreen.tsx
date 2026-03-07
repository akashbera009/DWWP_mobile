import React, { useCallback, useEffect, useState } from 'react'
import {
    View, StyleSheet, ScrollView,
    Pressable,
    RefreshControl,
} from 'react-native'

import { Portal } from '@gorhom/portal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// utils 
import { screenWidth, vh, vw } from '@dwwp/utils/dimensions'
import { showSnackbar } from '@dwwp/utils/showSnackBar'
import colors from '@dwwp/utils/colors'
import { getStoredUserEmail } from '@dwwp/utils/commonFunctions'

// components
import FixedCharges from './FixedCharges'
import WelcomeBanner from './WelcomeBanner'
import HeroSummaryCard from './HeroSummaryCard'
import UsageChart from './components/UsageChart'
import StatGrid from './StatGrid'
import Header from './components/Header'
import ProfilePanel from './components/ProfilePanel'
import NotificationPanel from './components/NotificationPanel'
import ControlSwitchModal from './components/ControlSwitchModal'
import DeviceSection from './DeviceSection'
import DashBoardPage from './DashBoardPage'

const SCREEN_WIDTH = screenWidth
// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashIndexScreen = () => {
    const [userEmail, setUserEmail] = useState<string>('')
    const [notifOpen, setNotifOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'device' | 'usages'>('overview')
    const [refreshing, setRefreshing] = React.useState(false);

    const [servoState, setServoState] = useState<boolean>(false)
    const [lastSeen, setLastSeen] = useState<number | undefined>(undefined)
    const [limitExceeded, setLimitExceeded] = useState<boolean>(false)
    const [isSwitchOpen, setIsSwitchOpen] = useState<boolean>(false)

    const { top } = useSafeAreaInsets()

    const closeDropdowns = useCallback(() => { setNotifOpen(false); setProfileOpen(false) }, [])

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            showSnackbar({ message: 'Data refreshed!', type: 'success' })
            setRefreshing(false);
        }, 1000);
    }, []);
    useEffect(() => {
        const unsubscriber = setInterval(() => {
            const timer = Date.now()
            setLastSeen(timer)
        }, 10000)
        return () => clearInterval(unsubscriber)
    }, [])
    // Derive device online level from lastSeen
    const deviceOffline = lastSeen !== undefined
        ? Math.floor((Date.now() - lastSeen) / 1000) > 60
        : false

    useEffect(() => {
        const getUser = async () => {
            const userEmail = await getStoredUserEmail()
            if (!userEmail) {
                return
            } else {
                console.log('dashboard page ', userEmail);
                setUserEmail(userEmail)
            }
        }
        getUser()
    }, [])
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
                <ControlSwitchModal
                    userId={userEmail}
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

            <ScrollView
                horizontal
                pagingEnabled
                

            >
                <View style={styles.page}>
                    <DashBoardPage />
                </View>

                <View style={styles.page}>
                    <DashBoardPage />
                </View>


            </ScrollView>


        </View >
    )
}

export default DashIndexScreen

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
    page: {
        width: SCREEN_WIDTH
    }
})
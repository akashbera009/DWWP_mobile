import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    View, StyleSheet, ScrollView,
    Pressable,
} from 'react-native'

import { Portal } from '@gorhom/portal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// utils 
import { screenWidth, vh, vw } from '@dwwp/utils/dimensions'
import { showSnackbar } from '@dwwp/utils/showSnackBar'
import colors from '@dwwp/utils/colors'
import { getStoredUserEmail } from '@dwwp/utils/commonFunctions'

// components
import Header from './components/Header'
import ProfilePanel from './components/ProfilePanel'
import NotificationPanel from './components/NotificationPanel'
import ControlSwitchModal from './components/ControlSwitchModal'
import DeviceSection from './DeviceSection'
import DashBoardPage from './DashBoardPage'
import UsageChart from './components/UsageChart'

const SCREEN_WIDTH = screenWidth
// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashIndexScreen = () => {
    const [userEmail, setUserEmail] = useState<string>('')
    const [notifOpen, setNotifOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<number>(0)

    const [servoState, setServoState] = useState<boolean>(false)
    const [lastSeen, setLastSeen] = useState<number | undefined>(undefined)
    const [limitExceeded, setLimitExceeded] = useState<boolean>(false)
    const [isSwitchOpen, setIsSwitchOpen] = useState<boolean>(false)

    const scrolRef = useRef<ScrollView | null>(null)
    const { top } = useSafeAreaInsets()

    const closeDropdowns = useCallback(() => { setNotifOpen(false); setProfileOpen(false) }, [])
    const handleNotifOpen = useCallback(() => { setNotifOpen(true) }, [])
    const handleNotifClose = useCallback(() => { setNotifOpen(false) }, [])
    const handleProfileOpen = useCallback(() => { setProfileOpen(true) }, [])
    const handleProfileClose = useCallback(() => { setProfileOpen(false) }, [])
    const handleSetActivetab = useCallback(
        (idx: number) => {
            setActiveTab(idx)
            scrolRef?.current?.scrollTo({
                y: screenWidth * idx,
                animated: true
            })
            console.log('should  have to scroll to ', screenWidth * idx);

        }, []
    )

    // demo online status checking
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
            <Header
                activeTab={activeTab}
                handleSetActivetab={handleSetActivetab}
                handleProfileOpen={handleProfileOpen}
                handleProfileClose={handleProfileClose}
                handleNotifOpen={handleNotifOpen}
                handleNotifClose={handleNotifClose}
            />

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
                ref={scrolRef}
                horizontal
                pagingEnabled
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                onMomentumScrollEnd={(e) => {
                    const nextIdx = Math.round(e.nativeEvent.contentOffset.x / screenWidth)
                    setActiveTab(nextIdx)
                }}
            >
                <View style={styles.page}>
                    <DashBoardPage
                        lastSeen={lastSeen}
                        servoState={servoState}
                        setIsSwitchOpen={() => setIsSwitchOpen(true)}
                    />
                </View>

                <View style={styles.page2}>
                    <DeviceSection
                        lastSeen={lastSeen}
                        servoState={servoState}
                        setIsSwitchOpen={() => setIsSwitchOpen(true)}
                    />
                </View>
                <View style={styles.page2}>
                    <UsageChart />
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
    scrollView: {
        flex: 1,
        backgroundColor: colors.overlayBackground
    },
    page: {
        width: SCREEN_WIDTH,
    },
    page2: {
        width: SCREEN_WIDTH,
        marginTop: vh(16),
        paddingHorizontal: vw(8),
    },
})
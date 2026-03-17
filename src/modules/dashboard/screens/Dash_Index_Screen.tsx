import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    View, StyleSheet, ScrollView,
    Pressable,
    StatusBar,
} from 'react-native'

import { Portal } from '@gorhom/portal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// utils 
import { screenWidth, vh, vw } from '@dwwp/utils/dimensions'
import colors from '@dwwp/utils/colors'

// components
import Header from '../components/Header'
import ProfilePanel from '../components/ProfilePanel'
import NotificationPanel from '../components/NotificationPanel'
import ControlSwitchModal from '../components/ControlSwitchModal'
import DeviceSection from '../components/DeviceSection'
import DashBoardPage from './DashBoardPage'
import Usages_Tab, { MOCK_ADDONS, MOCK_MONTH_DATA } from './Usages_Tab'

// redux
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { fetchAdminConfig, fetchCurrentMonth, fetchUserDetails } from '../dashboardActions'
import { fetchServoState } from '../servoActions'
import DashboardSkeleton from '@dwwp/components/DashboardSkeleton'
import { fetchAllTimeDays, fetchAllTimeMonths, fetchTodayUsage, listenCurrentMonth, stopCurrentMonthListener } from '../usageActions'
import Device_Info_Tab from './Device_Info_Tab'

const SCREEN_WIDTH = screenWidth
// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dash_Index_Screen = () => {
    const dispatch = useAppDispatch()
    // loading state 
    const [notifOpen, setNotifOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<number>(0)

    const email = useAppSelector((state) => state.auth.user?.email)
    const { isLoading: dashboardIsLoading } = useAppSelector(
        state => state.dashboard
    )


    // fetching the important data first 
    const fetchDashboardData = useCallback(() => {
        if (!email) return
        dispatch(fetchUserDetails({ email }))
        dispatch(fetchCurrentMonth({ email }))
        dispatch(fetchAdminConfig())

    }, [email])

    useEffect(() => {
        if (!email) return
        fetchDashboardData()
        return () => {
            dispatch(stopCurrentMonthListener(email))
        }
    }, [email, fetchDashboardData])

    // next stage data which are auxuliary for dashboard  
    const fetchAdditionalData = () => {
        if (!email) return
        dispatch(fetchTodayUsage(email))
        dispatch(fetchServoState({ email }))
        dispatch(fetchAllTimeMonths(email))
        dispatch(fetchAllTimeDays(email))
        dispatch(listenCurrentMonth(email))
    }
    useEffect(() => {
        if (!email) return
        const timer = setTimeout(() => {
            fetchAdditionalData()
        }, 1500);
        return () => clearTimeout(timer)
    }, [email, fetchAdditionalData])


    const [isSwitchOpen, setIsSwitchModalOpen] = useState<boolean>(false)

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
                x: screenWidth * idx,
                animated: true
            })
        }, []
    )

    return (
        <View style={[styles.safeArea, { paddingTop: top, }]} >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
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

                        {/* This prevents closing when touching inside */}
                        <Pressable onPress={() => { }}>
                            <NotificationPanel onClose={closeDropdowns} />
                        </Pressable>

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
                    onClose={() => setIsSwitchModalOpen(false)}
                />
            )}
            {dashboardIsLoading ?
                <DashboardSkeleton />
                :
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
                            setIsSwitchModalOpen={() => setIsSwitchModalOpen(true)}
                            refreshDashboard={fetchDashboardData}
                        />
                    </View>

                    <View style={styles.page2}>
                        {/* <DeviceSection
                            setIsSwitchModalOpen={() => setIsSwitchModalOpen(true)}
                        /> */}
                        <Device_Info_Tab />
                    </View>

                    <View style={styles.page2}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Usages_Tab />
                        </ScrollView>
                    </View>

                </ScrollView>

            }
        </View >
    )
}

export default Dash_Index_Screen

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
        // paddingTop: vh(16),
        paddingHorizontal: vw(8),
    },
})
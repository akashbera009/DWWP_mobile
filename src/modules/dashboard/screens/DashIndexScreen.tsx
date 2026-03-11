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
import { getStoredUserEmail } from '@dwwp/utils/commonFunctions'

// components
import Header from '../components/Header'
import ProfilePanel from '../components/ProfilePanel'
import NotificationPanel from '../components/NotificationPanel'
import ControlSwitchModal from '../components/ControlSwitchModal'
import DeviceSection from '../components/DeviceSection'
import DashBoardPage from '../components/DashBoardPage'
import MonthlyUsageDetail, { MOCK_ADDONS, MOCK_MONTH_DATA } from '../components/Monthlyusagedetail'

// redux
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { fetchAdminConfig, fetchCurrentMonth, fetchUserDetails } from '../dashboardActions'
import { fetchServoState } from '../servoActions'
import DashboardSkeleton from '@dwwp/components/DashboardSkeleton'
import { fetchAllTimeDays, fetchAllTimeMonths, fetchTodayUsage, listenCurrentMonth, stopCurrentMonthListener } from '../usageActions'
import { selectCurrentMonthLimit, selectCurrentMonthTotal, selectDailyChartData, selectLifetimeTotal, selectLimitExceeded, selectTodayUsage, selectUsageError, selectUsageLoading } from '../usageSelectors'

const SCREEN_WIDTH = screenWidth
// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashIndexScreen = () => {
    const dispatch = useAppDispatch()
    // loading state 
    const [userEmail, setUserEmail] = useState<string>('')
    const [notifOpen, setNotifOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<number>(0)

    const email = useAppSelector((state) => state.auth.user?.email)
    const servoState = useAppSelector((state) => state.servo?.servoState)
    const { isLoading: dashboardIsLoading } = useAppSelector(
        state => state.dashboard
    )

    const fetchDashboardData = useCallback(() => {
        if (!email) return
        dispatch(fetchUserDetails({ email }))
        dispatch(fetchCurrentMonth({ email }))

        dispatch(fetchAllTimeMonths(email))
        dispatch(fetchAllTimeDays(email))
        dispatch(fetchTodayUsage(email))
        dispatch(listenCurrentMonth(email))

        dispatch(fetchServoState({ email }))
        dispatch(fetchAdminConfig())
    }, [email])


    const todayUsage = useAppSelector(selectTodayUsage)
    const monthTotal = useAppSelector(selectCurrentMonthTotal)
    const monthLimit = useAppSelector(selectCurrentMonthLimit)
    const limitExceeded = useAppSelector(selectLimitExceeded)
    const dailyData = useAppSelector(selectDailyChartData)
    const lifetimeTotal = useAppSelector(selectLifetimeTotal)
    const loading = useAppSelector(selectUsageLoading)
    const error = useAppSelector(selectUsageError)

    const a = useAppSelector(state => state.usage.allTimeDaysTotal)
    console.log(todayUsage, monthTotal);

    useEffect(() => {
        if (!email) return
        fetchDashboardData()
        return () => {
            dispatch(stopCurrentMonthListener(email))
        }
    }, [email, fetchDashboardData])

    // const [servoState, setServoState] = useState<boolean>(false)
    const [lastSeen, setLastSeen] = useState<number | undefined>(undefined)
    // const [limitExceeded, setLimitExceeded] = useState<boolean>(false)
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
                x: screenWidth * idx,
                animated: true
            })
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
                setUserEmail(userEmail)
            }
        }
        getUser()
    }, [])
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
                    onClose={() => setIsSwitchOpen(false)}
                    quotaExceeded={limitExceeded}
                    deviceOffline={deviceOffline}
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
                            lastSeen={lastSeen}
                            servoState={servoState}
                            setIsSwitchOpen={() => setIsSwitchOpen(true)}
                            refreshDashboard={fetchDashboardData}
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
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <MonthlyUsageDetail monthData={MOCK_MONTH_DATA} addons={MOCK_ADDONS} />
                        </ScrollView>
                    </View>

                </ScrollView>

            }
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
        // paddingTop: vh(16),
        paddingHorizontal: vw(8),
    },
})
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    View, Text, StyleSheet, ScrollView,
    Pressable,
    StatusBar,
    TouchableOpacity,
} from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { Portal } from '@gorhom/portal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// utils 
import { screenWidth, vw } from '@dwwp/utils/dimensions'
import colors from '@dwwp/utils/colors'

// components
import Header from '../components/Header'
import ProfilePanel from '../components/ProfilePanel'
import NotificationPanel from '../components/NotificationPanel'
import ControlSwitchModal from '../components/ControlSwitchModal'
import DashBoardPage from './DashBoardPage'
import Usages_Tab from './Usages_Tab'

// redux
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { fetchAdminConfig, fetchCurrentMonth, fetchUserDetails } from '../dashboardActions'
import { fetchServoState, updateServoState } from '../servoActions'
import DashboardSkeleton from '@dwwp/components/DashboardSkeleton'
import { fetchAllTimeDays, fetchAllTimeMonths, fetchTodayUsage, listenCurrentMonth, stopCurrentMonthListener } from '../usageActions'
import Device_Info_Tab from './Device_Info_Tab'
import { fetchAllPaymentsAndAddons } from '@dwwp/modules/paymentsDashboard/paymentAction'
import { fetchUserNotifications } from '../Notificationslice'


import { selectCurrentMonthLimit, selectCurrentMonthTotal } from '../usageSelectors';
import { getCurrentMonthKey } from '@dwwp/utils/commonFunctions';
import LimitWarningBanner from '@dwwp/modules/analytics/components/LimitWarningBanner';
import { openChat, selectIsChatOpen, selectCurrentPrediction, selectShouldRecalculatePrediction } from '@dwwp/modules/analytics/analyticsSlice';
import { calculatePrediction } from '@dwwp/modules/analytics/analyticsActions';
import AIChatSheet from '@dwwp/modules/analytics/components/AIChatSheet';
import { normalize, vh } from '@dwwp/utils/dimensions';

const SCREEN_WIDTH = screenWidth
// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dash_Index_Screen = () => {
    const dispatch = useAppDispatch()
    const isChatOpen = useAppSelector(selectIsChatOpen)
    // loading state 
    const [notifOpen, setNotifOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<number>(0)

    const email = useAppSelector((state) => state.auth.user?.email)
    const { isLoading: dashboardIsLoading } = useAppSelector(
        state => state.dashboard
    )
    const prediction = useAppSelector(selectCurrentPrediction)
    const shouldRecalculate = useAppSelector(selectShouldRecalculatePrediction)
    const isPredictionLoading = useAppSelector(state => state.analytics.isLoading)

    // In your component:
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';  // ← runs entirely on UI thread, never touches JS
            scrollX.value = event.contentOffset.x;
        },
    });

    // fetching the important data first 
    const fetchDashboardData = useCallback(() => {
        if (!email) return
        dispatch(fetchUserDetails({ email }))
        dispatch(fetchCurrentMonth({ email }))
        dispatch(fetchAdminConfig())
        dispatch(fetchUserNotifications(email))
        dispatch(fetchTodayUsage(email))
        dispatch(fetchServoState({ email }))
        dispatch(fetchAllTimeDays(email))
        dispatch(fetchAllTimeMonths(email))
        dispatch(fetchAllPaymentsAndAddons({ email }))
    }, [email, dispatch])

    // Set up real-time listener
    useEffect(() => {
        if (!email) return
        dispatch(listenCurrentMonth(email))
        return () => {
            dispatch(stopCurrentMonthListener(email))
        }
    }, [email, dispatch])

    // Initial data fetch
    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    // Refresh data function
    const refreshData = useCallback(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    // Initialize AI Context automatically in background
    useEffect(() => {
        if (!dashboardIsLoading && !isPredictionLoading && (shouldRecalculate || !prediction)) {
            dispatch(calculatePrediction())
        }
    }, [dispatch, dashboardIsLoading, isPredictionLoading, shouldRecalculate, prediction])

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

    // home screen message showing for limitd exceeded
    const userId = useAppSelector(s => s.auth?.user?.email) ?? ''
    const monthLimit = useAppSelector(selectCurrentMonthLimit)
    const addons = useAppSelector(s => s.payment?.addons)
    const thisMonthKey = getCurrentMonthKey()
    const addedLimit = useMemo(() => {
        if (!addons) return 0

        return addons
            .filter(txn => txn?.forMonth === thisMonthKey)
            .reduce((sum, item) => sum + (item?.refill), 0)
    }, [addons, thisMonthKey])
    const effectiveLimit = useMemo(() => {
        return (monthLimit || 0) + addedLimit
    }, [monthLimit, addedLimit])

    const monthTotal = useAppSelector(selectCurrentMonthTotal)
    const currentServoState = useAppSelector(state => state.servo.servoState)

    useEffect(() => {
        // ONLY trigger cutoff if the limit has actually loaded (is not null)
        // and usage has exceeded it.
        if (monthLimit !== null && effectiveLimit <= monthTotal && currentServoState !== false) {
            console.log('Usage limit reached. Water supply', monthTotal, effectiveLimit);
            dispatch(updateServoState({ email: userId, newState: false }))
        }
    }, [effectiveLimit, monthTotal, currentServoState, userId, monthLimit, dispatch])
    // Add this state
    const [bannerDismissed, setBannerDismissed] = useState(false)
    const showLimitBanner = monthTotal > effectiveLimit && !bannerDismissed

    return (
        <View style={[styles.safeArea, { paddingTop: top, }]} >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* ── Header ── */}
            <Header
                activeTab={activeTab}
                scrollX={scrollX}
                handleSetActivetab={handleSetActivetab}
                handleProfileOpen={handleProfileOpen}
                handleProfileClose={handleProfileClose}
                handleNotifOpen={handleNotifOpen}
                handleNotifClose={handleNotifClose}
            />

            {/* ── Limit Warning Banner ── */}
            {showLimitBanner && (
                <LimitWarningBanner
                    onClose={() => setBannerDismissed(true)}
                />
            )}
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
                <Animated.ScrollView
                    ref={scrolRef}
                    horizontal
                    pagingEnabled
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                    onScroll={scrollHandler}
                    onMomentumScrollEnd={(e) => {
                        const nextIdx = Math.round(e.nativeEvent.contentOffset.x / screenWidth)
                        setActiveTab(nextIdx)
                    }}
                >
                    <View style={styles.page}>
                        <DashBoardPage
                            setIsSwitchModalOpen={() => setIsSwitchModalOpen(true)}
                            refreshDashboard={refreshData}
                            handleSetActivetab={handleSetActivetab}
                        />
                    </View>

                    <View style={styles.page2}>
                        <Device_Info_Tab />
                    </View>

                    <View style={styles.page2}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Usages_Tab />
                        </ScrollView>
                    </View>

                </Animated.ScrollView>

            }

            {/* Floating Chatbot Button */}
            {!dashboardIsLoading && !isChatOpen && (
                <TouchableOpacity
                    style={styles.fabContainer}
                    onPress={() => dispatch(openChat())}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabIcon}>✨</Text>
                </TouchableOpacity>
            )}

            {/* AI Chat Bottom Sheet */}
            <AIChatSheet />
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
    fabContainer: {
        position: 'absolute',
        bottom: vh(20),
        right: vw(20),
        width: normalize(56),
        height: normalize(56),
        borderRadius: normalize(28),
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 100,
    },
    fabIcon: {
        fontSize: normalize(24),
        color: '#FFFFFF',
    },
})
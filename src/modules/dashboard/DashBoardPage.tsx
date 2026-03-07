import React, { useCallback, useEffect, useState } from 'react'
import {
    View, StyleSheet, ScrollView,
    RefreshControl,
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
// utils 
import { vh, vw } from '@dwwp/utils/dimensions'
import { showSnackbar } from '@dwwp/utils/showSnackBar'
import { getStoredUserEmail } from '@dwwp/utils/commonFunctions'

// components
import FixedCharges from './FixedCharges'
import WelcomeBanner from './WelcomeBanner'
import HeroSummaryCard from './HeroSummaryCard'
import UsageChart from './components/UsageChart'
import StatGrid from './StatGrid'
import DeviceSection from './DeviceSection'

type DashBoardPagePropsType = {
    lastSeen: number | undefined;
    servoState: boolean;
    setIsSwitchOpen: () => void
}
// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashBoardPage = ({ lastSeen, servoState, setIsSwitchOpen }: DashBoardPagePropsType) => {
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            showSnackbar({ message: 'Data refreshed!', type: 'success' })
            setRefreshing(false);
        }, 1000);
    }, []);

    return (
        <View
            style={styles.container}
        >
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
                <HeroSummaryCard onlineCount={2} total={4} />

                {/* 2×2 Stat Grid */}
                <StatGrid />

                {/* Usage Chart */}
                <UsageChart />

                {/* Fixed Charges */}
                <FixedCharges />

                {/* Device Control */}
                <DeviceSection
                    lastSeen={lastSeen}
                    servoState={servoState}
                    setIsSwitchOpen={() => setIsSwitchOpen()}
                />

            </ScrollView >
        </View >
    )
}

export default DashBoardPage

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dropdownBackdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 300,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: vw(16),
        paddingTop: vh(16),
        paddingBottom: vh(90),
        gap: vh(14),
    },

})
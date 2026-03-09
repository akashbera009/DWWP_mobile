import React, { useCallback } from 'react'
import {
    View, StyleSheet, ScrollView,
    RefreshControl,
} from 'react-native'

// utils 
import { vh, vw } from '@dwwp/utils/dimensions'
import { showSnackbar } from '@dwwp/utils/showSnackBar'

// components
import FixedCharges from './FixedCharges'
import WelcomeBanner from './WelcomeBanner'
import HeroSummaryCard from './HeroSummaryCard'
import UsageChart from './UsageChart'
import StatGrid from './StatGrid'
import DeviceSection from './DeviceSection'
import { Text } from 'react-native-gesture-handler'

type DashBoardPagePropsType = {
    lastSeen: number | undefined;
    servoState: boolean;
    setIsSwitchOpen: () => void
    refreshDashboard: () => void
}
// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashBoardPage = ({ lastSeen, servoState, setIsSwitchOpen ,refreshDashboard }: DashBoardPagePropsType) => {
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refreshDashboard()
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
                <HeroSummaryCard />

                {/* 2×2 Stat Grid */}
                <StatGrid />

                {/* Device Control */}
                <DeviceSection
                    lastSeen={lastSeen}
                    servoState={servoState}
                    setIsSwitchOpen={() => setIsSwitchOpen()}
                />

                {/* Usage Chart */}
                <UsageChart />

                {/* Fixed Charges */}
                <FixedCharges />

                <Text>  Quick Links</Text>
                <Text>  Reiase Complaint</Text>
                <Text>  Give Feedback</Text>
                <Text>  Do a Quick Recharge </Text>
                <Text>  Pay Dues </Text>

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
        paddingBottom: vh(40),
        gap: vh(14),
    },

})
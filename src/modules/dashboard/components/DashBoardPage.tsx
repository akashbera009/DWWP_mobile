import React, { useCallback } from 'react'
import {
    View, StyleSheet, ScrollView,
    RefreshControl,
    TouchableOpacity,
    Text, Image
} from 'react-native'

// utils 
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { showSnackbar } from '@dwwp/utils/showSnackBar'

// components
import FixedCharges from './FixedCharges'
import WelcomeBanner from './WelcomeBanner'
import HeroSummaryCard from './HeroSummaryCard'
import UsageChart from './UsageChart'
import StatGrid from './StatGrid'
import DeviceSection from './DeviceSection'
import colors from '@dwwp/utils/colors'
import fonts from '@dwwp/utils/fonts'
import { localImages } from '@dwwp/utils/localimages'
import { strings } from '@dwwp/utils/strings'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BottomTabParamList, MainStackParamList } from '@dwwp/utils/types'
import { useNavigation } from '@react-navigation/native'
import { screenNames } from '@dwwp/utils/screenNames'
import QuickLinks from './Quicklinks'

type DashBoardPagePropsType = {
    setIsSwitchModalOpen: () => void
    refreshDashboard: () => void
}

type BottomStackNavigation = NativeStackNavigationProp<BottomTabParamList>;

const DashBoardPage = ({ setIsSwitchModalOpen, refreshDashboard }: DashBoardPagePropsType) => {
    const [refreshing, setRefreshing] = React.useState(false);
    const bottomStackNavigation = useNavigation<BottomStackNavigation>()

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refreshDashboard()
        setTimeout(() => {
            showSnackbar({ message: 'Data refreshed!', type: 'success' })
            setRefreshing(false);
        }, 1000);
    }, []);

    const handleViewMonthlyUsagesPress = () => {
        bottomStackNavigation.navigate(screenNames.AnalyticsPage)
    } 
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
                <WelcomeBanner/>

                {/* Hero Summary Card */}
                <HeroSummaryCard />

                {/* 2×2 Stat Grid */}
                <StatGrid />

                {/* Device Control */}
                <DeviceSection
                    setIsSwitchModalOpen={() => setIsSwitchModalOpen()}
                />

                {/* Usage Chart */}
                <View style={styles.card}>
                    <UsageChart />
                    <TouchableOpacity
                        onPress={handleViewMonthlyUsagesPress}
                        style={styles.viewAllContainer}>
                        <Text style={styles.viewAll}>{strings.viewUsagesAnalytics}</Text>
                        <Image source={localImages.back} style={styles.backArrow} />
                    </TouchableOpacity>
                </View>

                {/* Fixed Charges */}
                <FixedCharges />

             <QuickLinks/>

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
    card: {
        backgroundColor: colors.white,
        borderRadius: normalize(20),
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    viewAllContainer: {
        marginHorizontal: vw(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: normalize(2),
        borderTopColor: colors.border,
        paddingVertical: vh(6)
    },
    viewAll: {
        color: colors.primary,
        fontSize: normalize(14),
        fontFamily: fonts.Medium
    },
    backArrow: {
        height: vh(10),
        width: vh(16),
        marginHorizontal: vw(8),
        tintColor: colors.primary,
        transform: [{ rotate: '180deg' }]
    },
})
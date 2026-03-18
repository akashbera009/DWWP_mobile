import React, { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useAppSelector } from '@dwwp/store/hooks'
import { normalize, vh } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'

const C = {
    primary: '#2B6568',
    primaryDark: '#1e4a4d',
    primaryLight: 'rgba(43,101,104,0.10)',
    primaryBorder: 'rgba(43,101,104,0.18)',
    cyan: '#32C2CA',
    cyanBg: 'rgba(50,194,202,0.10)',
    cyanBorder: 'rgba(50,194,202,0.22)',
    white: '#FFFFFF',
    black: '#041617',
    body: '#6A7C92',
    border: '#E1E8ED',
    bg: '#F4F7F8',
    card: '#FFFFFF',
    error: '#E74C3C',
    errorBg: 'rgba(231,76,60,0.08)',
    errorBorder: 'rgba(231,76,60,0.20)',
    warning: '#F39C12',
    warningBg: 'rgba(243,156,18,0.08)',
    warningBorder: 'rgba(243,156,18,0.22)',
    success: '#27AE60',
    successBg: 'rgba(39,174,96,0.08)',
    successBorder: 'rgba(39,174,96,0.20)',
    inputBg: '#EFF2F5',
    shadow: 'rgba(43,101,104,0.10)',
    purple: '#7B68EE',
    purpleBg: 'rgba(123,104,238,0.10)',
}
/**
 * UsageSnapshotCard
 * Shows today's usage + monthly progress bar inline on Device tab.
 * All data from Redux usage slice.
 */
export const UsageSnapshotCard: React.FC = () => {
    const { todayUsage, allTimeDaysTotal, currentMonthId, months } = useAppSelector(s => s?.usage)

    // ── derive values ──────────────────────────────────────────────────────────
    const MONTHLY_LIMIT = useAppSelector(s => s?.dashboard?.limitConfig?.regular)
    if (currentMonthId === null) return
    const currentMonthUsage = months?.[currentMonthId]?.total ?? 0
    const lastMonthKeys = Object.keys(months ?? {}).sort()
    const prevMonthId = lastMonthKeys[lastMonthKeys.length - 2]
    const lastMonthUsage = months?.[prevMonthId]?.total ?? 0
    if (MONTHLY_LIMIT === undefined) return
    const usagePct = Math.min((currentMonthUsage / MONTHLY_LIMIT) * 100, 100)
    const barColor = usagePct >= 90 ? C.error : usagePct >= 70 ? C.warning : C.primary

    // ── bar animation ──────────────────────────────────────────────────────────
    const barAnim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.timing(barAnim, {
            toValue: usagePct,
            duration: 800,
            useNativeDriver: false,
        }).start()
    }, [usagePct , barAnim])

    const barWidth = barAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    })

    return (
        <View style={styles.card}>

            {/* Row 1 — month label + today badge */}
            <View style={styles.topRow}>
                <Text style={styles.monthLabel}>{formatMonthId(currentMonthId)}</Text>
                <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Today: </Text>
                    <Text style={styles.todayVal}>{todayUsage.toLocaleString()} L</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.barBg}>
                <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]} />
            </View>

            {/* Usage numbers under bar */}
            <View style={styles.barLabels}>
                <Text style={styles.barLabelText}>
                    <Text style={styles.barLabelVal}>{Math.round(currentMonthUsage).toLocaleString()} L</Text> used
                </Text>
                <Text style={styles.barLabelText}>
                    <Text style={[styles.barLabelVal, { color: barColor }]}>{Math.round(usagePct)}%</Text> of {MONTHLY_LIMIT.toLocaleString()} L
                </Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
                <StatItem label="All time" value={`${(allTimeDaysTotal / 1000).toFixed(1)}k L`} />
                <View style={styles.statDivider} />
                <StatItem label="Last month" value={`${Math.round(lastMonthUsage).toLocaleString()} L`} />
                <View style={styles.statDivider} />
                <StatItem label="Avg / day" value={`~${Math.round(currentMonthUsage / new Date().getDate())} L`} />
            </View>

        </View>
    )
}

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={styles.statItem}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
)

function formatMonthId(id: string): string {
    if (!id) return ''
    const [year, month] = id.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    card: {
        backgroundColor: C.white,
        borderRadius: normalize(20),
        padding: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: normalize(12),
    },
    monthLabel: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(14),
        color: C.black,
    },
    todayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.primaryLight,
        borderRadius: normalize(20),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(4),
    },
    todayText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.primary,
    },
    todayVal: {
        fontFamily: fonts.Bold,
        fontSize: normalize(11),
        color: C.primary,
    },

    // Bar
    barBg: {
        height: normalize(6),
        backgroundColor: C.border,
        borderRadius: normalize(6),
        overflow: 'hidden',
        marginBottom: normalize(8),
    },
    barFill: {
        height: '100%',
        borderRadius: normalize(6),
    },
    barLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: normalize(14),
    },
    barLabelText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.black,
    },
    barLabelVal: {
        fontFamily: fonts.SemiBold,
        color: C.black,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.bg,
        borderRadius: normalize(12),
        paddingVertical: normalize(10),
        paddingHorizontal: normalize(6),
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: vh(3),
    },
    statDivider: {
        width: 1,
        height: normalize(28),
        backgroundColor: C.border,
    },
    statLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: C.black,
    },
    statValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: C.black,
    },
})
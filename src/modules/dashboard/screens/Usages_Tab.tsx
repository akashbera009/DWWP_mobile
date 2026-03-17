/**
 * MonthlyUsageDetail.tsx
 *
 * Full-screen monthly water usage breakdown.
 *
 * Firebase fields consumed:
 *   monthlyUsages/{YYYY-MM}/
 *     limit            – base monthly quota (liters)
 *     limitExceeded    – boolean
 *     isMonthFinish    – boolean
 *     {YYYY-MM-DD}     – number (daily liters)
 *
 *   monthlyUsages/{YYYY-MM}/addon/{id}/
 *     quantityDone     – liters added
 *     amount           – ₹ paid
 *     addon_date       – ISO timestamp
 *     razor_pay_id     – string
 *     status           – "Completed"
 *
 * Usage:
 *   <MonthlyUsageDetail
 *       monthData={monthData}
 *       addons={addons}
 *       onBack={() => navigation.goBack()}
 *   />
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    View, Text, StyleSheet,
    TouchableOpacity, Animated, Easing, Image,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import LinearGradient from 'react-native-linear-gradient'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
// import Mini_Monthly_Usage_Chart from './Mini_Monthly_Usage_Chart'
import { localImages } from '@dwwp/utils/localimages'
import { fmt, getCurrentMonthKey } from '@dwwp/utils/commonFunctions'
import { useAppSelector } from '@dwwp/store/hooks'
import { CustomButton } from '@dwwp/components/CustomButton'
import { navigationRef } from '@dwwp/utils/navigationService'
import { screenNames } from '@dwwp/utils/screenNames'

// ─── Theme ────────────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AddonEntry {
    id: string
    quantityDone: number   // liters added
    amount: number   // ₹ paid
    addon_date: string   // ISO
    razor_pay_id: string
    status: string
}

export interface MonthData {
    limit: number                    // base monthly quota (liters)
    limitExceeded: boolean
    isMonthFinish: boolean
    dailyUsages: Record<string, number>    // { "2025-01-04": 18.5, ... }
}

interface Props {
    // monthData: MonthData
    // addons?: AddonEntry[]
    // monthLabel?: string                      // e.g. "January 2025"
    // onBack?: () => void
}

// ─── Animated progress bar ────────────────────────────────────────────────────
interface ProgressBarProps {
    pct: number        // 0–1
    color: string
    trackColor?: string
    height?: number
    delay?: number
    shimmer?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    pct, color, trackColor = C.inputBg, height = normalize(10), delay = 0, shimmer = false,
}) => {
    const anim = useRef(new Animated.Value(0)).current
    const shimAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(anim, {
            toValue: Math.min(pct, 1),
            duration: 900,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start()

        if (shimmer) {
            Animated.loop(
                Animated.timing(shimAnim, {
                    toValue: 1, duration: 1800,
                    easing: Easing.linear, useNativeDriver: false,
                })
            ).start()
        }
    }, [pct])

    const barWidth = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    })
    const shimX = shimAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-40%', '140%'],
    })

    return (
        <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height }]}>
            <Animated.View style={[styles.fill, { width: barWidth, height, backgroundColor: color, borderRadius: height, overflow: 'hidden' }]}>
                {shimmer && (
                    <Animated.View style={[styles.shimmer, { left: shimX }]} />
                )}
            </Animated.View>
        </View>
    )
}

// ─── Circular arc gauge ───────────────────────────────────────────────────────
interface GaugeProps {
    pct: number    // 0–1
    size: number
    color: string
    label: string
    value: string
}
const CircleGauge = ({ pct, size, color, label, value }: GaugeProps) => {
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const progress = Math.min(Math.max(pct, 0), 1)
    const strokeDashoffset = circumference * (1 - progress)

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle
                    stroke="#EAEFF2"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <Circle
                    stroke={color}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="90"
                    origin={`${size / 2}, ${size / 2}`}
                    scale={-1}
                />
            </Svg>

            {/* Center text */}
            <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color }}>
                    {value}
                </Text>
                <Text style={{ fontSize: 12, color: '#6A7C92' }}>
                    {label}
                </Text>
            </View>
        </View>
    )
}


// ─── Addon card ───────────────────────────────────────────────────────────────
interface AddonCardProps {
    addon: AddonEntry
    consumedFromAddon: number
    index: number
}

const AddonCard: React.FC<AddonCardProps> = ({ addon, consumedFromAddon, index }) => {
    const usedPct = Math.min(consumedFromAddon / Math.max(addon.quantityDone, 1), 1)
    const left = Math.max(addon.quantityDone - consumedFromAddon, 0)
    const date = new Date(addon.addon_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

    return (
        <View style={styles.addonCard}>
            {/* Left accent */}
            <LinearGradient
                colors={[C.purple, C.cyan]}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={styles.addonAccent}
            />
            <View style={styles.addonBody}>
                {/* Top row */}
                <View style={styles.addonTopRow}>
                    <View style={styles.addonIconBox}>
                        <Text style={{ fontSize: normalize(16) }}>💳</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.addonTitle}>Addon #{index + 1}  ·  +{fmt(addon.quantityDone)}</Text>
                        <Text style={styles.addonMeta}>{date}  ·  ₹{addon.amount}  ·  {addon.razor_pay_id.slice(-8)}</Text>
                    </View>
                    <View style={[styles.addonStatusPill, {
                        backgroundColor: addon.status === 'Completed' ? C.successBg : C.warningBg,
                        borderColor: addon.status === 'Completed' ? C.successBorder : C.warningBorder,
                    }]}>
                        <Text style={[styles.addonStatusText, {
                            color: addon.status === 'Completed' ? C.success : C.warning
                        }]}>{addon.status}</Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.addonProgress}>
                    <ProgressBar pct={usedPct} color={C.purple} delay={200 + index * 100} height={normalize(7)} />
                    <View style={styles.addonProgressLabels}>
                        <Text style={styles.addonProgressUsed}>{fmt(consumedFromAddon)} used</Text>
                        <Text style={styles.addonProgressLeft}>{fmt(left)} left</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
const Usages_Tab = () => {
    const monthKeyId = getCurrentMonthKey()

    const monthData = useAppSelector(s => s.usage?.months?.[monthKeyId] ?? {})
    const addons = useAppSelector(s => s.payment.addons ?? [])
    const todayUse = useAppSelector(s => s.usage.todayUsage ?? 0)

    const monthLimit = monthData?.limit ?? 0

    // ── Derived values ────────────────────────────────────────────────────────
    const {
        totalConsumed,
        totalAddonLiters,
        effectiveLimit,
        baseConsumed,
        addonConsumed,
        remaining,
        overUsed,
        basePct,
        overallPct,
        filteredAddons
    } = useMemo(() => {

        const days = monthData?.days ?? {}

        // daily usage
        const daySum = Object.values(days).reduce((s, v) => s + v, 0)

        const totalConsumed = daySum + todayUse

        // filter addons for current month
        const filteredAddons = addons.filter((a: any) => a.forMonth === monthKeyId)

        // addon liters
        const totalAddonLiters = filteredAddons.reduce(
            (s, a) => s + (a.quantityDone ?? 0) * (a.refill ?? 0),
            0
        )

        const effectiveLimit = monthLimit + totalAddonLiters

        const baseConsumed = Math.min(totalConsumed, monthLimit)

        const addonConsumed = Math.max(totalConsumed - monthLimit, 0)

        const remaining = Math.max(effectiveLimit - totalConsumed, 0)

        const overUsed = Math.max(totalConsumed - effectiveLimit, 0)

        const basePct = Math.min(baseConsumed / Math.max(monthLimit, 1), 1)

        const overallPct = Math.min(totalConsumed / Math.max(effectiveLimit, 1), 1)

        return {
            totalConsumed,
            totalAddonLiters,
            effectiveLimit,
            baseConsumed,
            addonConsumed,
            remaining,
            overUsed,
            basePct,
            overallPct,
            filteredAddons
        }

    }, [monthData, todayUse, addons, monthKeyId])

    const [baseQuotaCollapse, setBaseQuotaCollapse] = useState<boolean>(false)
    const [addonSectionCollapse, setAddonSectionCollapse] = useState<boolean>(true)

    // Per-addon consumed (waterfall: base limit consumed first, then addons in order)
    let remaining_to_assign = addonConsumed

    const addonConsumedArr = filteredAddons.map(a => {

        const addonLiters = (a.quantityDone ?? 0) * (a.refill ?? 0)

        const consumed = Math.min(remaining_to_assign, addonLiters)

        remaining_to_assign = Math.max(remaining_to_assign - consumed, 0)

        return consumed
    })

    // Status
    const statusColor =
        monthData.limitExceeded
            ? C.error
            : overallPct > 0.85
                ? C.warning
                : C.success

    // Header scroll for parallax feel
    const scrollY = useRef(new Animated.Value(0)).current

    const headerH = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [normalize(160), normalize(100)],
        extrapolate: 'clamp'
    })
    return (
        <View style={styles.screen}>

            {/* ── Scrollable content ── */}
            <Animated.ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >

                {/* ── Hero summary card ── */}
                <LinearGradient
                    colors={monthData.limitExceeded
                        ? ['#3a1a1a', '#2a1010']
                        : [C.primary, C.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    {/* Blob */}
                    <View style={styles.heroBlob} />

                    {/* Three summary numbers */}
                    <View style={styles.heroNumbers}>
                        <View style={styles.heroNumItem}>
                            <Text style={styles.heroNumValue}>{fmt(totalConsumed)}</Text>
                            <Text style={styles.heroNumLabel}>Consumed</Text>
                        </View>
                        <View style={styles.heroNumDivider} />
                        <View style={styles.heroNumItem}>
                            <Text style={styles.heroNumValue}>{fmt(effectiveLimit)}</Text>
                            <Text style={styles.heroNumLabel}>Total Quota</Text>
                        </View>
                        <View style={styles.heroNumDivider} />
                        <View style={styles.heroNumItem}>
                            <Text style={[styles.heroNumValue, {
                                color: overUsed > 0 ? '#ff6b6b' : C.cyan
                            }]}>
                                {overUsed > 0 ? `-${fmt(overUsed)}` : fmt(remaining)}
                            </Text>
                            <Text style={styles.heroNumLabel}>{overUsed > 0 ? 'Over Limit' : 'Remaining'}</Text>
                        </View>
                    </View>

                    {/* Overall progress bar */}
                    <View style={styles.heroBarArea}>
                        <View style={styles.heroBarTrack}>
                            <Animated.View style={[styles.heroBarBase, {
                                width: `${basePct * 100}%`,
                            }]} />
                            {addonConsumed > 0 && (
                                <View style={[styles.heroBarAddon, {
                                    width: `${Math.min(addonConsumed / effectiveLimit, 1) * 100}%`,
                                }]} />
                            )}
                        </View>
                        <View style={styles.heroBarLegend}>
                            <View style={styles.heroLegendItem}>
                                <View style={[styles.legendDot, { backgroundColor: C.cyan }]} />
                                <Text style={styles.legendText}>Base quota</Text>
                            </View>
                            {addons.length > 0 && (
                                <View style={styles.heroLegendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: C.purple }]} />
                                    <Text style={styles.legendText}>Addon usage</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Pct label */}
                    <Text style={styles.heroPct}>
                        {(overallPct * 100).toFixed(1)}% of total quota used
                    </Text>
                </LinearGradient>


                {/* ── Base quota card ── */}
                <TouchableOpacity
                    onPress={() => setBaseQuotaCollapse(prev => !prev)}
                    style={styles.sectionLabel}>
                    <Text style={styles.sectionLabelText}>Base Quota</Text>
                    <Image source={localImages.downarrow} style={baseQuotaCollapse ? styles.baseQuotaCollapse : styles.baseQuotaExpand} />
                </TouchableOpacity>
                {!baseQuotaCollapse && (
                    <View style={styles.card}>
                        {/* Gauge + stats side by side */}
                        <View style={styles.quotaRow}>
                            <CircleGauge
                                pct={basePct}
                                size={normalize(110)}
                                color={basePct >= 1 ? C.error : basePct > 0.8 ? C.warning : C.cyan}
                                value={`${(basePct * 100).toFixed(0)}%`}
                                label="used"
                            />
                            <View style={styles.quotaStats}>
                                <View style={styles.quotaStatRow}>
                                    <View style={[styles.quotaStatDot, { backgroundColor: C.cyan }]} />
                                    <View>
                                        <Text style={styles.quotaStatVal}>{fmt(baseConsumed)}</Text>
                                        <Text style={styles.quotaStatLbl}>Consumed from base</Text>
                                    </View>
                                </View>
                                <View style={styles.quotaStatRow}>
                                    <View style={[styles.quotaStatDot, { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border }]} />
                                    <View>
                                        <Text style={styles.quotaStatVal}>{fmt(monthLimit)}</Text>
                                        <Text style={styles.quotaStatLbl}>Base allocation</Text>
                                    </View>
                                </View>
                                <View style={styles.quotaStatRow}>
                                    <View style={[styles.quotaStatDot, { backgroundColor: baseConsumed >= monthLimit ? C.error : C.success }]} />
                                    <View>
                                        <Text style={[styles.quotaStatVal, {
                                            color: baseConsumed >= monthLimit ? C.error : C.success
                                        }]}>
                                            {baseConsumed >= monthLimit ? 'Exhausted' : fmt(monthLimit - baseConsumed) + ' left'}
                                        </Text>
                                        <Text style={styles.quotaStatLbl}>Base remaining</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Segmented bar */}
                        <View style={styles.segmentedBarWrap}>
                            <ProgressBar
                                pct={basePct}
                                color={basePct >= 1 ? C.error : basePct > 0.8 ? C.warning : C.cyan}
                                height={normalize(12)}
                                shimmer={basePct < 1}
                            />
                            <View style={styles.barEndLabels}>
                                <Text style={styles.barEndLabel}>0L</Text>
                                <Text style={styles.barEndLabel}>{fmt(monthLimit)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* ── Addon cards ── */}
                {addons.length > 0 && (
                    <>
                        <TouchableOpacity
                            style={styles.sectionLabel}
                            onPress={() => setAddonSectionCollapse(prev => !prev)}>
                            <Text style={styles.sectionLabelText}>Recharge Addons</Text>
                            <Image source={localImages.downarrow} style={!addonSectionCollapse ? styles.baseQuotaCollapse : styles.baseQuotaExpand} />
                            <View style={styles.sectionLine} />
                            <View style={styles.addonCountPill}>
                                <Text style={styles.addonCountText}>{addons.length}</Text>
                            </View>
                        </TouchableOpacity>

                        {addonSectionCollapse && (
                            <>
                                {/* Combined addon summary */}
                                <View style={[styles.card, styles.addonSummaryCard]}>
                                    <View style={styles.addonSummaryRow}>
                                        <View style={[styles.addonSummaryIcon, { backgroundColor: C.purpleBg }]}>
                                            <Text style={{ fontSize: normalize(20) }}>💳</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.addonSummaryTitle}>
                                                +{fmt(totalAddonLiters)} total addon quota
                                            </Text>
                                            <Text style={styles.addonSummaryMeta}>
                                                {addons.length} recharge{addons.length > 1 ? 's' : ''}  ·  ₹{addons.reduce((s, a) => s + a.amount, 0)} total paid
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.addonSummaryConsumed}>{fmt(addonConsumed)}</Text>
                                            <Text style={styles.addonSummaryConsumedLbl}>used</Text>
                                        </View>
                                    </View>
                                    <ProgressBar
                                        pct={addonConsumed / Math.max(totalAddonLiters, 1)}
                                        color={C.purple}
                                        height={normalize(8)}
                                        delay={150}
                                    />
                                </View>

                                {/* Individual addon cards */}
                                {addons.slice(0, 5).map((addon, i) => (
                                    <AddonCard
                                        key={addon.id}
                                        addon={addon as any}
                                        consumedFromAddon={addonConsumedArr[i]}
                                        index={i}
                                    />
                                ))}
                                <CustomButton
                                    title='View all'
                                    variant='secondary'
                                    onPress={() => navigationRef?.current?.getParent()?.navigate(screenNames.FullPaymantHistory)}
                                />
                            </>
                        )}
                    </>
                )}
                {/* 
                <ScrollView
                    horizontal
                    pagingEnabled
                > 
                    <View style={{ width: screenWidth - 20 }}>
                        <View style={styles.sectionLabel}>
                            <Text style={styles.sectionLabelText}>Daily Breakdown</Text>
                            <View style={styles.sectionLine} />
                            <Text style={styles.sectionLabelMeta}>avg {fmtD(avgDay)}/day</Text>
                        </View>

                        <View style={[styles.card, { paddingBottom: normalize(10) }]}>
                            <View style={styles.chartHeader}>
                                <View style={styles.chartLegendRow}>
                                    <View style={[styles.legendDot, { backgroundColor: C.cyan }]} />
                                    <Text style={styles.legendText}>Normal</Text>
                                    <View style={[styles.legendDot, { backgroundColor: C.warning, marginLeft: normalize(10) }]} />
                                    <Text style={styles.legendText}>Above avg</Text>
                                    <View style={[styles.legendDot, { backgroundColor: C.error, marginLeft: normalize(10) }]} />
                                    <Text style={styles.legendText}>High</Text>
                                    <View style={[styles.legendDot, { backgroundColor: C.primary, marginLeft: normalize(10) }]} />
                                    <Text style={styles.legendText}>Today</Text>
                                </View>
                            </View>

                            <Text style={styles.avgLineLabel}>── avg {fmtD(avgDay)}</Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayChartScroll}>
                                <View style={styles.dayChartInner}>
                                    {entries.map(([dateStr, val]) => {
                                        const day = dateStr.slice(-2)
                                        return (
                                            <DayBar
                                                key={dateStr}
                                                day={day}
                                                value={val}
                                                max={maxDay}
                                                isToday={dateStr === today}
                                                avg={avgDay}
                                            />
                                        )
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                    <Mini_Monthly_Usage_Chart />

                </ScrollView> */}

                <View style={{ height: vh(30) }} />
            </Animated.ScrollView>
        </View>
    )
}

export default Usages_Tab

// ─── Mock data for dev/preview ─────────────────────────────────────────────
export const MOCK_MONTH_DATA: MonthData = {
    limit: 800,
    limitExceeded: false,
    isMonthFinish: false,
    dailyUsages: {
        '2025-01-01': 22, '2025-01-02': 18, '2025-01-03': 31,
        '2025-01-04': 27, '2025-01-05': 19, '2025-01-06': 35,
        '2025-01-07': 24, '2025-01-08': 20, '2025-01-09': 28,
        '2025-01-10': 42, '2025-01-11': 16, '2025-01-12': 23,
        '2025-01-13': 38, '2025-01-14': 25, '2025-01-15': 19,
    },
}
export const monthData = [
    { day: "2026-03-01", value: 167 },
    { day: "2026-03-02", value: 140 },
    { day: "2026-03-03", value: 158 },
    { day: "2026-03-04", value: 172 },
    { day: "2026-03-05", value: 149 },
    { day: "2026-03-06", value: 181 },
    { day: "2026-03-07", value: 193 },
    { day: "2026-03-08", value: 160 },
    { day: "2026-03-09", value: 174 },
    { day: "2026-03-10", value: 188 },
    { day: "2026-03-11", value: 155 },
    { day: "2026-03-12", value: 169 },
    { day: "2026-03-13", value: 177 },
    { day: "2026-03-14", value: 162 },
    { day: "2026-03-15", value: 185 },
    { day: "2026-03-16", value: 191 },
    { day: "2026-03-17", value: 170 },
    { day: "2026-03-18", value: 164 },
    { day: "2026-03-19", value: 179 },
    { day: "2026-03-20", value: 187 },
    { day: "2026-03-21", value: 173 },
    { day: "2026-03-22", value: 166 },
    { day: "2026-03-23", value: 182 },
    { day: "2026-03-24", value: 195 },
    { day: "2026-03-25", value: 176 },
    { day: "2026-03-26", value: 168 },
    { day: "2026-03-27", value: 184 },
    { day: "2026-03-28", value: 190 },
    { day: "2026-03-29", value: 171 },
    { day: "2026-03-30", value: 178 }
];
export const MOCK_ADDONS: AddonEntry[] = [
    {
        id: 'addon_1', quantityDone: 200, amount: 120,
        addon_date: '2025-01-10T14:30:00.000Z',
        razor_pay_id: 'pay_Rdck9DTiXfX5vm', status: 'Completed',
    },
    {
        id: 'addon_2', quantityDone: 100, amount: 60,
        addon_date: '2025-01-13T09:15:00.000Z',
        razor_pay_id: 'pay_Xmrt4ABcYz2wqP', status: 'Completed',
    },
]

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    // Header
    header: {
        overflow: 'hidden',
        justifyContent: 'flex-end',
        paddingHorizontal: normalize(20),
        paddingBottom: normalize(16),
    },
    backBtn: {
        position: 'absolute',
        top: normalize(16), left: normalize(16),
        width: normalize(34), height: normalize(34),
        borderRadius: normalize(17),
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
    },
    backBtnText: {
        color: C.white, fontSize: normalize(18), fontFamily: fonts.Bold,
    },
    headerContent: {
        marginBottom: normalize(10),
    },
    headerTitle: {
        fontFamily: fonts.Bold, fontSize: normalize(22), color: C.white,
    },
    headerSub: {
        fontFamily: fonts.Regular, fontSize: normalize(13),
        color: 'rgba(255,255,255,0.70)', marginTop: vh(2),
    },
    headerPill: {
        position: 'absolute', top: normalize(16), right: normalize(16),
        flexDirection: 'row', alignItems: 'center', gap: normalize(5),
        paddingHorizontal: normalize(10), paddingVertical: normalize(4),
        borderRadius: normalize(20), borderWidth: 1,
    },
    headerPillDot: {
        width: normalize(6), height: normalize(6), borderRadius: normalize(3),
    },
    headerPillText: {
        fontFamily: fonts.Bold, fontSize: normalize(11),
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: normalize(16), paddingTop: normalize(16),
    },

    // Hero card
    heroCard: {
        borderRadius: normalize(22), padding: normalize(20),
        marginBottom: normalize(12), overflow: 'hidden',
    },
    heroBlob: {
        position: 'absolute', top: -normalize(40), right: -normalize(30),
        width: normalize(180), height: normalize(180), borderRadius: normalize(90),
        backgroundColor: 'rgba(50,194,202,0.08)',
    },
    heroNumbers: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: normalize(20),
    },
    heroNumItem: { flex: 1, alignItems: 'center', gap: vh(3) },
    heroNumDivider: {
        width: 1, height: normalize(36), backgroundColor: 'rgba(255,255,255,0.15)',
    },
    heroNumValue: {
        fontFamily: fonts.Bold, fontSize: normalize(20), color: C.white,
        textAlign: 'center',
    },
    heroNumLabel: {
        fontFamily: fonts.Regular, fontSize: normalize(10),
        color: 'rgba(255,255,255,0.60)', textAlign: 'center',
    },
    heroBarArea: { marginBottom: normalize(8) },
    heroBarTrack: {
        height: normalize(10), backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: normalize(10), overflow: 'hidden', flexDirection: 'row',
    },
    heroBarBase: {
        height: '100%', backgroundColor: C.cyan, borderRadius: normalize(10),
    },
    heroBarAddon: {
        height: '100%', backgroundColor: C.purple,
    },
    heroBarLegend: {
        flexDirection: 'row', gap: normalize(14), marginTop: normalize(8),
    },
    heroLegendItem: { flexDirection: 'row', alignItems: 'center', gap: normalize(5) },
    heroPct: {
        fontFamily: fonts.Regular, fontSize: normalize(11),
        color: 'rgba(255,255,255,0.55)', textAlign: 'right',
    },
    legendDot: {
        width: normalize(8), height: normalize(8), borderRadius: normalize(4),
    },
    legendText: {
        fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body,
    },

    // Section labels
    sectionLabel: {
        flexDirection: 'row', alignItems: 'center',
        gap: normalize(10), marginBottom: normalize(10), marginTop: normalize(6),
    },
    sectionLabelText: {
        fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black, flexShrink: 0,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: C.border },
    sectionLabelMeta: {
        fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body, flexShrink: 0,
    },
    addonCountPill: {
        width: normalize(20), height: normalize(20), borderRadius: normalize(10),
        backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center',
    },
    addonCountText: {
        fontFamily: fonts.Bold, fontSize: normalize(11), color: C.white,
    },

    // Card base
    card: {
        backgroundColor: C.card, borderRadius: normalize(20),
        padding: normalize(18), marginBottom: normalize(12),
        shadowColor: 'rgba(43,101,104,0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 10, elevation: 3,
    },

    // Progress bar
    track: { width: '100%', overflow: 'hidden' },
    fill: { overflow: 'hidden' },
    shimmer: {
        position: 'absolute', top: 0, bottom: 0, width: normalize(30),
        backgroundColor: 'rgba(255,255,255,0.35)',
        transform: [{ skewX: '-20deg' }],
    },
    barEndLabels: {
        flexDirection: 'row', justifyContent: 'space-between', marginTop: normalize(4),
    },
    barEndLabel: {
        fontFamily: fonts.Regular, fontSize: normalize(10), color: C.body,
    },

    // Quota row
    baseQuotaCollapse: {
        height: vh(16),
        width: vw(16),
    },
    baseQuotaExpand: {
        height: vh(16),
        width: vw(16),
        transform: [{ rotate: '180deg' }]
    },
    quotaRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: normalize(16), marginBottom: normalize(16),
    },
    quotaStats: { flex: 1, gap: normalize(10) },
    quotaStatRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
    quotaStatDot: {
        width: normalize(8), height: normalize(8), borderRadius: normalize(4), flexShrink: 0,
    },
    quotaStatVal: {
        fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black,
    },
    quotaStatLbl: {
        fontFamily: fonts.Regular, fontSize: normalize(10), color: C.body,
    },
    segmentedBarWrap: { marginTop: normalize(4) },

    // Circle gauge
    gaugeTrack: { position: 'absolute' },
    gaugeClipLeft: {
        position: 'absolute', overflow: 'hidden', top: 0,
    },
    gaugeClipRight: {
        position: 'absolute', overflow: 'hidden', top: 0,
    },
    gaugeHalf: { position: 'absolute', top: 0, left: 0 },
    gaugeValue: {
        fontFamily: fonts.Bold, fontSize: normalize(20), textAlign: 'center',
    },
    gaugeLabel: {
        fontFamily: fonts.Regular, fontSize: normalize(10),
        color: C.body, textAlign: 'center',
    },

    // Addon summary card
    addonSummaryCard: { marginBottom: normalize(8) },
    addonSummaryRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: normalize(12), marginBottom: normalize(14),
    },
    addonSummaryIcon: {
        width: normalize(44), height: normalize(44),
        borderRadius: normalize(14), alignItems: 'center', justifyContent: 'center',
    },
    addonSummaryTitle: {
        fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black,
    },
    addonSummaryMeta: {
        fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body, marginTop: vh(2),
    },
    addonSummaryConsumed: {
        fontFamily: fonts.Bold, fontSize: normalize(15), color: C.purple, textAlign: 'right',
    },
    addonSummaryConsumedLbl: {
        fontFamily: fonts.Regular, fontSize: normalize(10), color: C.body, textAlign: 'right',
    },

    // Addon card
    addonCard: {
        flexDirection: 'row', backgroundColor: C.card,
        borderRadius: normalize(16), marginBottom: normalize(8),
        overflow: 'hidden',
        shadowColor: 'rgba(43,101,104,0.06)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 8, elevation: 2,
    },
    addonAccent: { width: normalize(4) },
    addonBody: { flex: 1, padding: normalize(14) },
    addonTopRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: normalize(10), marginBottom: normalize(12),
    },
    addonIconBox: {
        width: normalize(34), height: normalize(34), borderRadius: normalize(10),
        backgroundColor: C.purpleBg, alignItems: 'center', justifyContent: 'center',
    },
    addonTitle: {
        fontFamily: fonts.Bold, fontSize: normalize(13), color: C.black,
    },
    addonMeta: {
        fontFamily: fonts.Regular, fontSize: normalize(10), color: C.body, marginTop: vh(2),
    },
    addonStatusPill: {
        paddingHorizontal: normalize(8), paddingVertical: normalize(3),
        borderRadius: normalize(8), borderWidth: 1,
    },
    addonStatusText: { fontFamily: fonts.SemiBold, fontSize: normalize(10) },
    addonProgress: { gap: normalize(5) },
    addonProgressLabels: {
        flexDirection: 'row', justifyContent: 'space-between',
    },
    addonProgressUsed: {
        fontFamily: fonts.SemiBold, fontSize: normalize(11), color: C.purple,
    },
    addonProgressLeft: {
        fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body,
    },



})
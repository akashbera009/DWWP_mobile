import React, { useRef, useEffect, useState } from 'react'
import {
    View, Text, ScrollView, StyleSheet, Animated,
    TouchableOpacity, Platform
} from 'react-native'

import ToggleSwitch from '../components/ToggleSwitch'
import { useAppSelector } from '@dwwp/store/hooks'
import LinearGradient from 'react-native-linear-gradient'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh } from '@dwwp/utils/dimensions'

// ─── Types ────────────────────────────────────────────────────────────────────
type ConnLevel = 'online' | 'recent' | 'stale' | 'offline' | 'loading'

const C = {
    primary: '#2B6568',
    primaryDark: '#1e4a4d',
    primaryLight: 'rgba(43,101,104,0.10)',
    primaryBorder: 'rgba(43,101,104,0.18)',
    cyan: '#32C2CA',
    cyanBg: 'rgba(50,194,202,0.10)',
    disabled: 'rgba(43,101,104,0.18)',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcLevel(lastSeen: number): ConnLevel {
    if (!lastSeen) return 'loading'
    const delta = Date.now() - lastSeen
    if (delta < 30_000) return 'online'
    if (delta < 5 * 60_000) return 'recent'
    if (delta < 60 * 60_000) return 'stale'
    return 'offline'
}

function calcRelativeTime(lastSeen: number): string {
    if (!lastSeen) return '—'
    const delta = Math.floor((Date.now() - lastSeen) / 1000)
    if (delta < 10) return 'Just now'
    if (delta < 60) return `${delta}s ago`
    if (delta < 3600) return `${Math.floor(delta / 60)}m ago`
    if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`
    return `${Math.floor(delta / 86400)}d ago`
}

function formatDateTime(ts: number): string {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    })
}

function formatMonthId(id: string): string {
    if (!id) return ''
    const [year, month] = id.split('-')
    return new Date(Number(year), Number(month) - 1)
        .toLocaleString('default', { month: 'long', year: 'numeric' })
}

// ─── Pulsing dot ──────────────────────────────────────────────────────────────
const PulseDot: React.FC<{ color: string; active: boolean }> = ({ color, active }) => {
    const pulse = useRef(new Animated.Value(1)).current
    useEffect(() => {
        if (!active) return
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1.9, duration: 800, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]))
        loop.start()
        return () => loop.stop()
    }, [active])
    return (
        <View style={{ width: normalize(8), height: normalize(8), alignItems: 'center', justifyContent: 'center' }}>
            {active && (
                <Animated.View style={{
                    position: 'absolute',
                    width: normalize(8), height: normalize(8),
                    borderRadius: normalize(4),
                    backgroundColor: color,
                    opacity: 0.35,
                    transform: [{ scale: pulse }],
                }} />
            )}
            <View style={{ width: normalize(6), height: normalize(6), borderRadius: normalize(3), backgroundColor: color }} />
        </View>
    )
}

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ title: string; style?: object }> = ({ title, style }) => (
    <Text style={[sharedStyles.sectionLabel, style]}>{title}</Text>
)

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DEVICE STATUS CARD
// ═══════════════════════════════════════════════════════════════════════════════
const DeviceStatusCard: React.FC = () => {
    const { lastSeen } = useAppSelector(s => s.servo)
    const [, setTick] = useState(0)

    // re-render every 5s to keep relative time fresh
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 5000)
        return () => clearInterval(id)
    }, [])

    const level = calcLevel(Number(lastSeen))
    const relTime = calcRelativeTime(Number(lastSeen))
    const absTime = formatDateTime(Number(lastSeen))
    const isOnline = level === 'online' || level === 'recent'

    const STATUS = {
        online: { label: 'ONLINE', bg: 'rgba(52,211,153,0.15)', text: '#34d399', dot: '#34d399' },
        recent: { label: 'ACTIVE', bg: 'rgba(52,211,153,0.12)', text: '#34d399', dot: '#34d399' },
        stale: { label: 'WEAK', bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', dot: '#f59e0b' },
        offline: { label: 'OFFLINE', bg: 'rgba(239,68,68,0.15)', text: '#fca5a5', dot: '#ef4444' },
        loading: { label: 'SYNCING', bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', dot: '#64748b' },
    }[level]

    const connLabel = isOnline ? 'Wi-Fi · Active'
        : level === 'stale' ? 'Wi-Fi · Weak'
            : 'Wi-Fi · Lost'

    return (
        <View style={dStyles.card}>

            {/* Header */}
            <View style={dStyles.headerRow}>
                <View style={dStyles.iconBox}>
                    <Text style={{ fontSize: normalize(18) }}>📶</Text>
                </View>
                <View style={{ flex: 1, marginLeft: normalize(10) }}>
                    <Text style={dStyles.titleText}>ESP32 · Servo Valve</Text>
                    <Text style={dStyles.subText}>DWWP Node · Main Line</Text>
                </View>
                <View style={[dStyles.statusPill, { backgroundColor: STATUS.bg }]}>
                    <PulseDot color={STATUS.dot} active={isOnline} />
                    <Text style={[dStyles.statusPillText, { color: STATUS.text }]}>
                        {STATUS.label}
                    </Text>
                </View>
            </View>

            <View style={sharedStyles.divider} />

            {/* Meta grid — 2 columns */}
            <View style={dStyles.metaGrid}>
                <View style={dStyles.metaCell}>
                    <Text style={dStyles.metaLabel}>Last seen</Text>
                    <Text style={dStyles.metaValue}>{relTime}</Text>
                </View>
                <View style={dStyles.metaCell}>
                    <Text style={dStyles.metaLabel}>Connection</Text>
                    <Text style={dStyles.metaValue}>{connLabel}</Text>
                </View>
                <View style={dStyles.metaCell}>
                    <Text style={dStyles.metaLabel}>Last connected</Text>
                    <Text style={dStyles.metaValue}>{absTime}</Text>
                </View>
                <View style={dStyles.metaCell}>
                    <Text style={dStyles.metaLabel}>Device ID</Text>
                    <Text style={dStyles.metaValue}>ESP-A3F2</Text>
                </View>
            </View>

            {/* Offline / stale strip */}
            {!isOnline && level !== 'loading' && (
                <View style={[
                    dStyles.alertStrip,
                    {
                        backgroundColor: level === 'stale' ? C.warningBg : C.errorBg,
                        borderTopColor: level === 'stale' ? C.warningBorder : C.errorBorder
                    }
                ]}>
                    <Text style={{ fontSize: normalize(13) }}>
                        {level === 'stale' ? '⚠️' : '📡'}
                    </Text>
                    <Text style={[dStyles.alertText, {
                        color: level === 'stale' ? C.warning : C.error,
                    }]}>
                        {level === 'stale'
                            ? 'Device signal is weak. Commands may be delayed.'
                            : 'Device is offline. Commands will queue and sync on reconnect.'}
                    </Text>
                </View>
            )}
        </View>
    )
}

const dStyles = StyleSheet.create({
    card: {
        backgroundColor: C.white,
        borderRadius: normalize(18),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(14),
    },
    iconBox: {
        width: normalize(40), height: normalize(40),
        borderRadius: normalize(11),
        backgroundColor: C.cyanBg,
        alignItems: 'center', justifyContent: 'center',
    },
    titleText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        color: C.black,
    },
    subText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.black,
        marginTop: vh(2),
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(5),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
        borderRadius: normalize(20),
    },
    statusPillText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(10),
        letterSpacing: 0.8,
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: normalize(10),
        gap: normalize(8),
    },
    metaCell: {
        width: '47%',
        backgroundColor: C.bg,
        borderRadius: normalize(10),
        padding: normalize(10),
    },
    metaLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: C.black,
        marginBottom: normalize(3),
    },
    metaValue: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
        color: C.black,
    },
    alertStrip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(8),
        borderTopWidth: 1,
        padding: normalize(12),
        paddingHorizontal: normalize(14),
    },
    alertText: {
        flex: 1,
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        lineHeight: normalize(16),
    },
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. WATER CONTROL CARD  (ControlSwitchModal content — now inline)
// ═══════════════════════════════════════════════════════════════════════════════
const WaterControlCard: React.FC = () => {
    const { servoState, lastSeen } = useAppSelector(s => s.servo)

    // ── replace these with your real selectors ─────────────────────────────
    const quotaExceeded: boolean = false
    const deviceOffline: boolean = calcLevel(Number(lastSeen)) === 'offline'
    // ───────────────────────────────────────────────────────────────────────

    const isLocked = quotaExceeded

    const stateLabel = isLocked ? 'Locked'
        : servoState ? 'Water is ON'
            : 'Water is OFF'

    const stateDesc = isLocked ? 'Quota exceeded · valve disabled'
        : servoState ? 'Valve open · flowing'
            : 'Valve closed · stopped'

    const liveLabel = servoState && !isLocked ? 'LIVE' : isLocked ? 'LOCKED' : 'OFF'
    const liveDotColor = servoState && !isLocked ? C.cyan : isLocked ? C.error : C.disabled

    return (
        <View style={wStyles.card}>

            {/* Quota exceeded banner */}
            {quotaExceeded && (
                <View style={wStyles.errorBanner}>
                    <Text style={{ fontSize: normalize(15) }}>🔒</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={wStyles.errorTitle}>Usage limit reached</Text>
                        <Text style={wStyles.errorSub}>
                            Control is disabled. Recharge your plan to regain access.
                        </Text>
                    </View>
                </View>
            )}

            {/* Offline banner */}
            {deviceOffline && !quotaExceeded && (
                <View style={wStyles.warnBanner}>
                    <Text style={{ fontSize: normalize(15) }}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={wStyles.warnTitle}>Device not reachable</Text>
                        <Text style={wStyles.warnSub}>
                            Command will execute once device reconnects.
                        </Text>
                    </View>
                </View>
            )}

            {/* State header — gradient when ON */}
            <LinearGradient
                colors={servoState && !isLocked ? [C.primary, C.primaryDark] : [C.bg, C.bg]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={wStyles.stateHeader}
            >
                <View>
                    <Text style={[wStyles.stateLabel, {
                        color: servoState && !isLocked ? C.white : C.black,
                    }]}>
                        {stateLabel}
                    </Text>
                    <Text style={[wStyles.stateDesc, {
                        color: servoState && !isLocked ? 'rgba(255,255,255,0.65)' : C.black,
                    }]}>
                        {stateDesc}
                    </Text>
                </View>
                <View style={[wStyles.liveBadge, {
                    backgroundColor: servoState && !isLocked
                        ? 'rgba(50,194,202,0.22)' : 'rgba(0,0,0,0.06)',
                }]}>
                    <PulseDot color={liveDotColor} active={servoState && !isLocked} />
                    <Text style={[wStyles.liveText, { color: liveDotColor }]}>{liveLabel}</Text>
                </View>
            </LinearGradient>

            {/* Toggle row OR locked row */}
            {!isLocked ? (
                <View style={wStyles.toggleRow}>
                    <Text style={wStyles.toggleHint}>
                        {deviceOffline
                            ? 'Device offline — toggle will queue and sync on reconnect'
                            : 'Tap to toggle water supply. Changes apply instantly.'}
                    </Text>
                    <ToggleSwitch disabled={false} />
                </View>
            ) : (
                <View style={wStyles.lockedRow}>
                    <Text style={wStyles.lockedHint}>Recharge your plan to control the valve</Text>
                    <TouchableOpacity style={wStyles.rechargeBtn} activeOpacity={0.82}>
                        {/* navigate to Payment tab */}
                        <Text style={wStyles.rechargeBtnText}>Recharge Plan</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Info note */}
            <View style={wStyles.infoNote}>
                <Text style={{ fontSize: normalize(12) }}>ℹ️</Text>
                <Text style={wStyles.infoText}>
                    {deviceOffline
                        ? 'Device is offline. Showing last known state. Commands sync automatically on reconnect.'
                        : 'Controls the servo valve on your DWWP device. The physical valve responds within 2–3 seconds.'}
                </Text>
            </View>
        </View>
    )
}

const wStyles = StyleSheet.create({
    card: {
        backgroundColor: C.white,
        borderRadius: normalize(18),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    errorBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: normalize(10),
        backgroundColor: C.errorBg,
        borderBottomWidth: 1, borderBottomColor: C.errorBorder,
        padding: normalize(13),
    },
    warnBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: normalize(10),
        backgroundColor: C.warningBg,
        borderBottomWidth: 1, borderBottomColor: C.warningBorder,
        padding: normalize(13),
    },
    errorTitle: { fontFamily: fonts.SemiBold, fontSize: normalize(12), color: C.error },
    errorSub: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.error, opacity: 0.8, marginTop: vh(2), lineHeight: normalize(16) },
    warnTitle: { fontFamily: fonts.SemiBold, fontSize: normalize(12), color: C.warning },
    warnSub: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.warning, opacity: 0.85, marginTop: vh(2), lineHeight: normalize(16) },
    stateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: normalize(16),
    },
    stateLabel: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
    },
    stateDesc: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        marginTop: vh(3),
    },
    liveBadge: {
        flexDirection: 'row', alignItems: 'center', gap: normalize(5),
        paddingHorizontal: normalize(10), paddingVertical: normalize(5),
        borderRadius: normalize(20),
    },
    liveText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(10),
        letterSpacing: 0.8,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(14),
        borderTopWidth: 1,
        borderTopColor: C.border,
        gap: normalize(12),
    },
    toggleHint: {
        flex: 1,
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: C.black,
        lineHeight: normalize(17),
    },
    lockedRow: {
        alignItems: 'center',
        paddingVertical: normalize(18),
        paddingHorizontal: normalize(16),
        gap: normalize(12),
        borderTopWidth: 1,
        borderTopColor: C.border,
    },
    lockedHint: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: C.black,
        textAlign: 'center',
    },
    rechargeBtn: {
        backgroundColor: C.primary,
        borderRadius: normalize(12),
        paddingHorizontal: normalize(28),
        paddingVertical: normalize(11),
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 5,
    },
    rechargeBtnText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: C.white,
    },
    infoNote: {
        flexDirection: 'row', alignItems: 'flex-start', gap: normalize(8),
        backgroundColor: C.primaryLight,
        margin: normalize(12),
        borderRadius: normalize(10),
        padding: normalize(11),
    },
    infoText: {
        flex: 1,
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.primary,
        lineHeight: normalize(16),
    },
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. USAGE SNAPSHOT CARD
// ═══════════════════════════════════════════════════════════════════════════════
const UsageSnapshotCard: React.FC = () => {
    const { todayUsage, allTimeDaysTotal, currentMonthId, months } = useAppSelector(s => s.usage)
    if (currentMonthId == null) return
    const MONTHLY_LIMIT = 2000  // replace with your per-user limit from store/config
    const currentMonthUsage = months?.[currentMonthId]?.total ?? 0
    const sortedKeys = Object.keys(months ?? {}).sort()
    const prevMonthId = sortedKeys[sortedKeys.length - 2]
    const lastMonthUsage = months?.[prevMonthId]?.total ?? 0
    const usagePct = Math.min((currentMonthUsage / MONTHLY_LIMIT) * 100, 100)
    const barColor = usagePct >= 90 ? C.error : usagePct >= 70 ? C.warning : C.primary
    const avgPerDay = Math.round(currentMonthUsage / Math.max(new Date().getDate(), 1))

    const barAnim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.timing(barAnim, { toValue: usagePct, duration: 900, useNativeDriver: false }).start()
    }, [usagePct])
    const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })

    return (
        <View style={uStyles.card}>
            <View style={uStyles.topRow}>
                <Text style={uStyles.monthText}>{formatMonthId(currentMonthId)}</Text>
                <View style={uStyles.todayBadge}>
                    <Text style={uStyles.todayLabel}>Today: </Text>
                    <Text style={uStyles.todayVal}>{(todayUsage ?? 0).toLocaleString()} L</Text>
                </View>
            </View>

            <View style={uStyles.barBg}>
                <Animated.View style={[uStyles.barFill, { width: barWidth, backgroundColor: barColor }]} />
            </View>

            <View style={uStyles.barLabels}>
                <Text style={uStyles.barText}>
                    <Text style={uStyles.barBold}>{Math.round(currentMonthUsage).toLocaleString()} L</Text>
                    {' '}used
                </Text>
                <Text style={uStyles.barText}>
                    <Text style={uStyles.barBold}>{MONTHLY_LIMIT.toLocaleString()} L</Text>
                    {' '}limit
                </Text>
            </View>

            <View style={uStyles.statsRow}>
                <View style={uStyles.statItem}>
                    <Text style={uStyles.statLabel}>All time</Text>
                    <Text style={uStyles.statVal}>{(allTimeDaysTotal / 1000).toFixed(1)}k L</Text>
                </View>
                <View style={uStyles.statDivider} />
                <View style={uStyles.statItem}>
                    <Text style={uStyles.statLabel}>Last month</Text>
                    <Text style={uStyles.statVal}>{Math.round(lastMonthUsage).toLocaleString()} L</Text>
                </View>
                <View style={uStyles.statDivider} />
                <View style={uStyles.statItem}>
                    <Text style={uStyles.statLabel}>Avg/day</Text>
                    <Text style={uStyles.statVal}>~{avgPerDay} L</Text>
                </View>
            </View>
        </View>
    )
}

const uStyles = StyleSheet.create({
    card: {
        backgroundColor: C.white,
        borderRadius: normalize(18),
        padding: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: normalize(14),
    },
    monthText: { fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black },
    todayBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.primaryLight,
        borderRadius: normalize(20),
        paddingHorizontal: normalize(10), paddingVertical: normalize(4),
    },
    todayLabel: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.primary },
    todayVal: { fontFamily: fonts.Bold, fontSize: normalize(11), color: C.primary },
    barBg: {
        height: normalize(6), backgroundColor: C.border,
        borderRadius: normalize(6), overflow: 'hidden', marginBottom: normalize(8),
    },
    barFill: { height: '100%', borderRadius: normalize(6) },
    barLabels: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalize(16),
    },
    barText: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.black },
    barBold: { fontFamily: fonts.Bold, color: C.black },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.bg, borderRadius: normalize(12),
        paddingVertical: normalize(12),
    },
    statItem: { flex: 1, alignItems: 'center', gap: vh(4) },
    statDivider: { width: 1, height: normalize(28), backgroundColor: C.border },
    statLabel: { fontFamily: fonts.Regular, fontSize: normalize(10), color: C.black },
    statVal: { fontFamily: fonts.Bold, fontSize: normalize(13), color: C.black },
})

// ═══════════════════════════════════════════════════════════════════════════════
// DEVICE TAB SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const DeviceTab: React.FC = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(20)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 10, tension: 60, useNativeDriver: true }),
        ]).start()
    }, [])

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                <SectionLabel title="Device Status" />
                <DeviceStatusCard />

                <SectionLabel title="Water Control" style={{ marginTop: normalize(20) }} />
                <WaterControlCard />

                <SectionLabel title="This Month's Usage" style={{ marginTop: normalize(20) }} />
                <UsageSnapshotCard />

            </Animated.View>
        </ScrollView>
    )
}

export default DeviceTab

// ─── Shared styles ────────────────────────────────────────────────────────────
const sharedStyles = StyleSheet.create({
    sectionLabel: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(11),
        color: C.black,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: normalize(8),
        marginLeft: normalize(2),
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginHorizontal: normalize(14),
    },
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    content: {
        padding: normalize(16),
        paddingBottom: normalize(40),
    },
})
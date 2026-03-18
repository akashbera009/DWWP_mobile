import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import Animated, {
    SensorType,
    useAnimatedSensor,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { useAppSelector } from '@dwwp/store/hooks'
import { selectCurrentMonthLimit, selectCurrentMonthTotal, selectTodayUsage } from '../usageSelectors'

// ─── Tuning constants ─────────────────────────────────────────────────────────
//
//  MAX_DEG    – hard ceiling on tilt angle. 8° feels premium without being dizzy.
//  SCALE      – gyro units → degrees. Lower = calmer reaction.
//  SMOOTHING  – EMA alpha. Higher = snappier, lower = more lag/buttery.
//               0.04 gives a nice ~60ms lag that feels physical.
//  DEADZONE   – ignore micro-vibrations below this rad/s threshold.
//  DECAY      – how fast velocity bleeds to zero when device is still.
//               0.88 = slow graceful return; 0.92 = even lazier.
//  SPRING     – withSpring config for the snap-back to 0 when truly still.
//
const MAX_DEG = 8       // max tilt in degrees (was 15 — too aggressive)
const SCALE = 2    // gravity is in m/s², 9.8 = full tilt, so scale down
const DEADZONE = 0.08   // gravity has more ambient noise than gyro
const SMOOTHING = 0.12   // slightly snappier since gravity is already stable
const DECAY = 0.88    // velocity decay per frame when near-still

const SPRING_CFG = {
    damping: 10,   // high damping = no oscillation, settles smoothly
    stiffness: 280,   // low stiffness = slow, lazy spring-back
    mass: .8,  // slightly heavy = more inertia, premium feel
}

const clamp = (v: number, lo: number, hi: number) => {
    'worklet'
    return Math.max(lo, Math.min(hi, v))
}

const HeroSummaryCard: React.FC = () => {

    const price = useAppSelector(state => state?.dashboard?.priceConfig?.regularPrice)
    const todayUsage = useAppSelector(selectTodayUsage)
    const monthTotal = useAppSelector(selectCurrentMonthTotal)
    const monthLimit = useAppSelector(selectCurrentMonthLimit)
    // const limitExceeded = useAppSelector(selectLimitExceeded)

    // const allTimeDaysTotal = useAppSelector(selectAllTimeDaysTotal)
    // const { todayUsage, monthTotal, monthLimit } = useAppSelector(state => {
    //     const month = state.usage?.months?.[monthKey] || {}

    //     return {
    //         todayUsage: month?.days?.[todayKey] ?? 0,
    //         monthTotal: month?.total ?? 0,
    //         monthLimit: month?.limit ?? 0,
    //         limitExceeded: month?.limitExceeded ?? false,
    //     }
    // })
    const billAmount = React.useMemo(() => {
        if (!price) return 0
        return (price * todayUsage).toFixed(0)
    }, [price, todayUsage])

    const monthBillAmount = React.useMemo(() => {
        if (!price) return 0
        return (price * monthTotal).toFixed(0)
    }, [price, monthTotal])

    // All-time total — your existing line was correct
    // const allTimeDaysTotal = useAppSelector(state =>
    //     state.usage.allTimeDaysTotal
    // ).toFixed(0)

    if(monthLimit === null) return 
    const usagePct = monthTotal / monthLimit;
    const onlineCount = 2;
    const total = 4;

    // const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 })
    const sensor = useAnimatedSensor(SensorType.GRAVITY, { interval: 16 })

    // Smoothed velocity values (EMA output)
    const vx = useSharedValue(0)
    const vy = useSharedValue(0)

    // Final display angles (fed into transform)
    const angleX = useSharedValue(0)
    const angleY = useSharedValue(0)

    // Track whether spring-back is already running so we don't retrigger it
    const isReturning = useSharedValue(false)

    useDerivedValue(() => {
        'worklet'
        // const rawX = sensor.sensor.value.x
        // const rawY = sensor.sensor.value.y
        const rawX = -sensor.sensor.value.x   // phone leans left → card tilts right
        const rawY = sensor.sensor.value.y   // phone tilts toward you → card top comes forward

        // Apply deadzone — treat micro-noise as zero
        const rX = Math.abs(rawX) < DEADZONE ? 0 : rawX
        const rY = Math.abs(rawY) < DEADZONE ? 0 : rawY

        // EMA smoothing — blends new reading into running average slowly
        vx.value = vx.value + SMOOTHING * (rX - vx.value)
        vy.value = vy.value + SMOOTHING * (rY - vy.value)

        // Check if device is effectively still
        const stillX = Math.abs(vx.value) < 0.04
        const stillY = Math.abs(vy.value) < 0.04

        const isStill = stillX && stillY

        if (isStill) {
            // Gradually decay toward zero (gives the drifting-to-rest feel)
            vx.value = vx.value * DECAY
            vy.value = vy.value * DECAY

            // Once velocity is tiny enough, spring back to neutral
            const tinyX = Math.abs(vx.value) < 0.015
            const tinyY = Math.abs(vy.value) < 0.015

            if (tinyX && tinyY && !isReturning.value) {
                isReturning.value = true
                angleX.value = withSpring(0, SPRING_CFG)
                angleY.value = withSpring(0, SPRING_CFG, () => {
                    isReturning.value = false
                })
            }
        } else {
            // Device is moving — update angles directly from velocity
            isReturning.value = false

            // rotateX tilts top/bottom, driven by Y-axis gyro
            // rotateY tilts left/right, driven by X-axis gyro
            // Note the intentional axis swap — this maps physical motion correctly
            angleX.value = clamp(vy.value * SCALE, -MAX_DEG, MAX_DEG)
            angleY.value = clamp(vx.value * SCALE, -MAX_DEG, MAX_DEG)
        }
    })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 700 },
            { rotateX: `${angleX.value}deg` },
            { rotateY: `${angleY.value}deg` },
        ],
    }))

    return (
        <Animated.View style={animatedStyle}>
            <LinearGradient
                colors={[colors.primary, colors.primaryDark, '#163a3c']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                {/* Decorative blobs */}
                <View style={styles.heroBlobTop} />
                <View style={styles.heroBlobBottom} />

                {/* ── Left: text ── */}
                <View style={styles.heroLeft}>
                    <Text style={styles.heroLabel}>Current Bill</Text>
                    <Text style={styles.heroBadgeTextRupee}>₹</Text>
                    <View style={styles.heroAmountBox} >
                        <Text style={styles.heroAmount}>{monthBillAmount}</Text>
                        <Text style={styles.heroThisMonth}>This Month</Text>
                    </View>
                    <View style={styles.heroRow}>
                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeTextSmall}>Today </Text>
                            <Text style={styles.heroBadgeTextRupeeSmall}>₹</Text>
                            <Text style={styles.heroBadgeText}>{billAmount}</Text>
                        </View>
                    </View>

                    <View style={styles.heroStats}>
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatValue}>{todayUsage}L</Text>
                            <Text style={styles.heroStatUnit}>Today</Text>
                        </View>
                        <View style={styles.heroStatDivider} />
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatValue}>{monthTotal}L</Text>
                            <Text style={styles.heroStatUnit}>This month</Text>
                        </View>
                        <View style={styles.heroStatDivider} />
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatValue}>{onlineCount}/{total}</Text>
                            <Text style={styles.heroStatUnit}>Devices</Text>
                        </View>
                    </View>
                </View>

                {/* ── Right: ring gauge ── */}
                <View style={styles.heroRight}>
                    <View style={styles.ringOuter}>
                        {/* Track */}
                        <View style={styles.ringTrack} />

                        {/* Arc segments */}
                        {Array.from({ length: 24 }).map((_, i) => {
                            const angle = (i / 24) * 360
                            const active = i < Math.round(24 * usagePct)
                            return (
                                <View
                                    key={i}
                                    style={[styles.ringSegment, {
                                        transform: [{ rotate: `${angle}deg` }],
                                        borderTopColor: active ? colors.activeDot : 'transparent',
                                        opacity: active
                                            ? 0.45 + (i / 24) * 0.55
                                            : 0.12,
                                    }]}
                                />
                            )
                        })}

                        {/* Center */}
                        <View style={styles.ringInner}>
                            <Text style={styles.ringPct}>{Math.round(usagePct * 100)}%</Text>
                            <Text style={styles.ringPctLabel}>used</Text>
                        </View>
                    </View>
                    <Text style={styles.ringCaption}>Monthly budget</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    )
}

export default HeroSummaryCard

// ─── Styles ───────────────────────────────────────────────────────────────────
const RING = normalize(88)

const styles = StyleSheet.create({
    heroCard: {
        borderRadius: normalize(24),
        padding: normalize(22),
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: normalize(160),
    },
    heroBlobTop: {
        position: 'absolute',
        top: -normalize(40), right: -normalize(20),
        width: normalize(160), height: normalize(160),
        borderRadius: normalize(80),
        backgroundColor: 'rgba(50,194,202,0.08)',
    },
    heroBlobBottom: {
        position: 'absolute',
        bottom: -normalize(50), left: normalize(100),
        width: normalize(130), height: normalize(130),
        borderRadius: normalize(65),
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    // Left
    heroLeft: { flex: 1, gap: vh(6) },
    heroLabel: {
        fontFamily: fonts.Medium, fontSize: normalize(12),
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: 0.8, textTransform: 'uppercase',
    },
    heroBadgeTextRupee: {
        position: 'absolute',
        top: vh(18),
        left: 0,
        fontFamily: fonts.light, fontSize: normalize(12),
        color: colors.white, lineHeight: normalize(36),
    },
    heroAmountBox: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    heroAmount: {
        fontFamily: fonts.Bold, fontSize: normalize(32),
        color: colors.white, lineHeight: normalize(36),
        marginLeft: vw(6)
    },
    heroThisMonth: {
        fontFamily: fonts.ExtraLight,
        fontSize: normalize(16),
        marginLeft: vw(8),
        color: colors.placeholderText,
    },
    heroRow: { flexDirection: 'row' },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(10), paddingVertical: normalize(4),
        borderRadius: normalize(20),
        backgroundColor: 'rgba(50,194,202,0.18)',
    },
    heroBadgeTextSmall: {
        fontFamily: fonts.ExtraLight, fontSize: normalize(11),
        color: colors.activeBorder,
    },
    heroBadgeTextRupeeSmall: {
        fontFamily: fonts.SemiBold, fontSize: normalize(11),
        color: colors.activeDot,
    },
    heroBadgeText: {
        fontFamily: fonts.SemiBold, fontSize: normalize(11),
        color: colors.activeDot,
    },
    heroStats: {
        flexDirection: 'row', alignItems: 'center',
        gap: normalize(10), marginTop: vh(4),
    },
    heroStatItem: { gap: vh(1) },
    heroStatValue: {
        fontFamily: fonts.Bold, fontSize: normalize(13), color: colors.white,
    },
    heroStatUnit: {
        fontFamily: fonts.Regular, fontSize: normalize(9),
        color: 'rgba(255,255,255,0.55)',
    },
    heroStatDivider: {
        width: 1, height: normalize(26),
        backgroundColor: 'rgba(255,255,255,0.18)',
    },

    // Ring
    heroRight: { alignItems: 'center', gap: vh(6) },
    ringOuter: {
        width: RING, height: RING,
        borderRadius: RING / 2,
        alignItems: 'center', justifyContent: 'center',
        position: 'relative',
    },
    ringTrack: {
        position: 'absolute',
        width: RING, height: RING, borderRadius: RING / 2,
        borderWidth: normalize(7),
        borderColor: 'rgba(255,255,255,0.10)',
    },
    ringSegment: {
        position: 'absolute',
        width: RING, height: RING, borderRadius: RING / 2,
        borderTopWidth: normalize(7),
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    ringInner: {
        width: normalize(64), height: normalize(64),
        borderRadius: normalize(32),
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
    },
    ringPct: {
        fontFamily: fonts.Bold, fontSize: normalize(16), color: colors.white,
    },
    ringPctLabel: {
        fontFamily: fonts.Regular, fontSize: normalize(9),
        color: 'rgba(255,255,255,0.60)',
    },
    ringCaption: {
        fontFamily: fonts.Regular, fontSize: normalize(10),
        color: 'rgba(255,255,255,0.55)', textAlign: 'center',
    },
})
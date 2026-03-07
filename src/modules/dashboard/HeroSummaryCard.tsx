import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { normalize, vh } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import Animated, {
    SensorType,
    useAnimatedSensor, useAnimatedStyle,
    useDerivedValue, useSharedValue
}
    from 'react-native-reanimated'

const clamp = (v: number, lo: number, hi: number) => {
    'worklet'
    return Math.max(lo, Math.min(hi, v))
}

const maxDeg = 15
const scale = 20
const smoothing = 0.08   // 0.08 is a good starting point
const deadzone = 0.01
const interval = 16

const HeroSummaryCard = () => {
    const ringRadius = 38
    const circumference = 2 * Math.PI * ringRadius
    const usagePct = 0.67  // 72% of monthly budget used
    const strokeDash = circumference * usagePct

    const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval })
    const fx = useSharedValue(0)
    const fy = useSharedValue(0)
    const fz = useSharedValue(0)

    useDerivedValue(() => {
        const a = smoothing   // <-- this is just a number; good to re-declare here
        const dz = deadzone

        const rawX = sensor.sensor.value.x
        const rawY = sensor.sensor.value.y
        const rawZ = sensor.sensor.value.z

        const rX = Math.abs(rawX) < dz ? 0 : rawX
        const rY = Math.abs(rawY) < dz ? 0 : rawY
        const rZ = Math.abs(rawZ) < dz ? 0 : rawZ

        fx.value = fx.value + a * (rX - fx.value)
        fy.value = fy.value + a * (rY - fy.value)
        fz.value = fz.value + a * (rZ - fz.value)
    })

    const animatedStyle = useAnimatedStyle(() => {
        const degX = clamp(fx.value * scale, -maxDeg, maxDeg)
        const degY = clamp(fy.value * scale, -maxDeg, maxDeg)
        const degZ = clamp(fz.value * scale, -maxDeg, maxDeg)

        return {
            transform: [
                { perspective: 600 },
                // note: rotateX rotates the top towards/away from the screen
                { rotateX: `${degX}deg` },
                { rotateY: `${degY}deg` },
                { rotateZ: `${degZ}deg` }
            ]
        }
    })

    return (
        <Animated.View style={[animatedStyle]}>
            <LinearGradient
                colors={[colors.primary, colors.primaryDark, '#163a3c']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                {/* Decorative circle blobs */}
                <View style={styles.heroBlobTop} />
                <View style={styles.heroBlobBottom} />

                {/* Left: text content */}
                <View style={styles.heroLeft}>
                    <Text style={styles.heroLabel}>Current Bill</Text>
                    <Text style={styles.heroAmount}>₹2,340</Text>
                    <View style={styles.heroRow}>
                        <View style={[styles.heroBadge, { backgroundColor: 'rgba(50,194,202,0.18)' }]}>
                            <Text style={styles.heroBadgeText}>Due in 8 days</Text>
                        </View>
                    </View>
                    <View style={styles.heroStats}>
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatValue}>590</Text>
                            <Text style={styles.heroStatUnit}>Today</Text>
                        </View>
                        <View style={styles.heroStatDivider} />
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatValue}>2300</Text>
                            <Text style={styles.heroStatUnit}>This month</Text>
                        </View>
                    </View>
                </View>

                {/* Right: circular ring progress */}
                <View style={styles.heroRight}>
                    <View style={styles.ringContainer}>
                        {/* SVG-like ring using View rotation trick */}
                        <View style={styles.ringOuter}>
                            <View style={styles.ringTrack} />
                            {/* Arc segments via rotated views */}
                            {Array.from({ length: 20 }).map((_, i) => {
                                const angle = (i / 20) * 360
                                const active = i < Math.round(20 * usagePct)
                                return (
                                    <View
                                        key={i}
                                        style={[
                                            styles.ringSegment,
                                            {
                                                transform: [{ rotate: `${angle}deg` }],
                                                borderTopColor: active ? colors.activeDot : 'transparent',
                                                opacity: active ? (0.5 + (i / 20) * 0.5) : 0.15,
                                            }
                                        ]}
                                    />
                                )
                            })}
                            <View style={styles.ringInner}>
                                <Text style={styles.ringPct}>72%</Text>
                                <Text style={styles.ringPctLabel}>used</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.ringCaption}>Monthly budget</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    )
}
export default HeroSummaryCard

const styles = StyleSheet.create({

    // Hero Card
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
        top: -normalize(40),
        right: -normalize(20),
        width: normalize(160),
        height: normalize(160),
        borderRadius: normalize(80),
        backgroundColor: 'rgba(50,194,202,0.08)',
    },
    heroBlobBottom: {
        position: 'absolute',
        bottom: -normalize(50),
        left: normalize(100),
        width: normalize(130),
        height: normalize(130),
        borderRadius: normalize(65),
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    heroLeft: {
        flex: 1,
        gap: vh(6),
    },
    heroLabel: {
        fontFamily: fonts.Medium,
        fontSize: normalize(12),
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    heroAmount: {
        fontFamily: fonts.Bold,
        fontSize: normalize(32),
        color: colors.white,
        lineHeight: normalize(36),
    },
    heroRow: {
        flexDirection: 'row',
    },
    heroBadge: {
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(4),
        borderRadius: normalize(20),
    },
    heroBadgeText: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(11),
        color: colors.activeDot,
    },
    heroStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(14),
        marginTop: vh(4),
    },
    heroStatItem: {
        gap: vh(1),
    },
    heroStatValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(15),
        color: colors.white,
    },
    heroStatUnit: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: 'rgba(255,255,255,0.55)',
    },
    heroStatDivider: {
        width: 1,
        height: normalize(28),
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    heroRight: {
        alignItems: 'center',
        gap: vh(6),
    },
    ringContainer: {
        width: normalize(90),
        height: normalize(90),
    },
    ringOuter: {
        width: normalize(90),
        height: normalize(90),
        borderRadius: normalize(45),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ringTrack: {
        position: 'absolute',
        width: normalize(90),
        height: normalize(90),
        borderRadius: normalize(45),
        borderWidth: normalize(8),
        borderColor: 'rgba(255,255,255,0.1)',
    },
    ringSegment: {
        position: 'absolute',
        width: normalize(90),
        height: normalize(90),
        borderRadius: normalize(45),
        borderTopWidth: normalize(8),
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    ringInner: {
        width: normalize(66),
        height: normalize(66),
        borderRadius: normalize(33),
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    ringPct: {
        fontFamily: fonts.Bold,
        fontSize: normalize(17),
        color: colors.white,
    },
    ringPctLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(9),
        color: 'rgba(255,255,255,0.6)',
    },
    ringCaption: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
    },

})
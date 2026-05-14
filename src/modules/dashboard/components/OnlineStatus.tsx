/**
 * OnlineStatus.tsx
 *
 * Shows the DWWP ESP32 device connection status derived from Firebase `lastSeen` timestamp.
 * Animates WiFi arcs individually (innermost → outermost) when online.
 * Fades / goes grey when offline.
 *
 * Props:
 *   lastSeen  – Firebase timestamp (ms). Omit or pass undefined for "loading" state.
 *   onPress   – optional callback when card is tapped
 */

import React, { useEffect, useRef, useState } from 'react'
import {
    View, Text, StyleSheet, Animated, Pressable, Easing,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { normalize} from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { useAppSelector, useAppDispatch } from '@dwwp/store/hooks'
import { fetchServoState } from '../servoActions'

// ─── theme ────────────────────────────────────────────────────────────────────
const C = {
    primary: '#2B6568',
    primaryDark: '#1e4a4d',
    cyan: '#32C2CA',
    cyanLight: 'rgba(50,194,202,0.15)',
    white: '#FFFFFF',
    error: '#E74C3C',
    warning: '#F39C12',
    bodyText: 'rgba(255,255,255,0.60)',
    borderGlass: 'rgba(255,255,255,0.12)',
}

// ─── helpers ──────────────────────────────────────────────────────────────────
type Level = 'online' | 'recent' | 'away' | 'offline' | 'loading'

function calcLevel(lastSeen?: number): Level {
    if (lastSeen === undefined) return 'loading'
    const secs = Math.floor((Date.now() - lastSeen) / 1000)
    if (secs < 15) return 'online'
    if (secs < 60) return 'recent'
    if (secs < 3600) return 'away'
    return 'offline'
}

function calcLabel(lastSeen?: number): { top: string; sub: string } {
    if (lastSeen === undefined) return { top: 'Connecting…', sub: 'Waiting for device' }
    const secs = Math.floor((Date.now() - lastSeen) / 1000)
    if (secs < 15) return { top: 'Online', sub: 'Device Synced' }
    if (secs < 60) return { top: `${secs}s ago`, sub: 'Just disconnected' }
    if (secs < 3600) return { top: `${Math.floor(secs / 60)}m ago`, sub: 'Connection lost' }
    if (secs < 86400) return { top: `${Math.floor(secs / 3600)}h ago`, sub: 'Device inactive' }
    return { top: `${Math.floor(secs / 86400)}d ago`, sub: 'Device unreachable' }
}

const levelColor: Record<Level, string> = {
    online: C.cyan,
    recent: C.warning,
    away: C.warning,
    offline: C.error,
    loading: 'rgba(255,255,255,0.3)',
}

// ─── WiFi arc animation ───────────────────────────────────────────────────────
// Three arcs animate in staggered sequence when online.
// When offline they just sit at low opacity / grey.
const ARC_COUNT = 3

function useWifiAnims(isOnline: boolean) {
    const anims = useRef(Array.from({ length: ARC_COUNT }, () => new Animated.Value(0))).current
    const loopRef = useRef<Animated.CompositeAnimation | null>(null)

    useEffect(() => {
        if (loopRef.current) { loopRef.current.stop(); loopRef.current = null }

        if (isOnline) {
            const sequence = Animated.loop(
                Animated.stagger(
                    180,
                    anims?.map(a =>
                        Animated.sequence([
                            Animated.timing(a, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                            Animated.timing(a, { toValue: 0.35, duration: 420, easing: Easing.in(Easing.quad), useNativeDriver: true }),
                        ])
                    )
                )
            )
            loopRef.current = sequence
            sequence.start()
        } else {
            anims.forEach(a => Animated.timing(a, { toValue: 0.18, duration: 500, useNativeDriver: true }).start())
        }
        return () => { loopRef.current?.stop() }
    }, [isOnline])

    return anims
}

// ─── Pulse ring (dot under wifi) ─────────────────────────────────────────────
function usePulse(active: boolean) {
    const anim = useRef(new Animated.Value(1)).current
    const loop = useRef<Animated.CompositeAnimation | null>(null)

    useEffect(() => {
        loop.current?.stop()
        if (active) {
            loop.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1.8, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
                ])
            )
            loop.current.start()
        } else {
            Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start()
        }
        return () => loop.current?.stop()
    }, [active])

    return anim
}
type OnlineStatusPropType = {
    handleSetActivetab: (idx: number) => void
}
// ─── Component ────────────────────────────────────────────────────────────────
export const OnlineStatus = ({ handleSetActivetab }: OnlineStatusPropType) => {
    const dispatch = useAppDispatch()
    const email = useAppSelector(state => state.auth?.user?.email)
    const lastSeen = useAppSelector(state => state?.servo?.lastSeen)

    const [_, setTick] = useState(0)

    // trigger re-render every 1 second, and fetch newest data every 5 seconds
    useEffect(() => {
        let count = 0
        const id = setInterval(() => {
            count++
            setTick(count)
            if (count % 5 === 0 && email) {
                dispatch(fetchServoState({ email }))
            }
        }, 1000)
        return () => clearInterval(id)
    }, [dispatch, email])

    const level = calcLevel(Number(lastSeen))
    const label = calcLabel(Number(lastSeen))
    const isOnline = level === 'online'
    const dot = levelColor[level]

    const arcAnims = useWifiAnims(isOnline)
    const pulseAnim = usePulse(isOnline)

    // Card entry scale
    const entryScale = useRef(new Animated.Value(0.88)).current
    useEffect(() => {
        Animated.spring(entryScale, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }).start()
    }, [])

    // Press feedback
    const pressScale = useRef(new Animated.Value(1)).current
    const onPressIn = () => Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start()
    const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start()

    const bgColors: [string, string, string] = isOnline
        ? [C.primary, '#235558', C.primaryDark]
        : level === 'offline'
            ? ['#1f1f1f', '#2a1a1a', '#1a0f0f']
            : ['#2a2a1a', '#1f1e14', '#1a1a0f']

    return (
        <Animated.View style={[styles.shadow, { transform: [{ scale: Animated.multiply(entryScale, pressScale) }] }]}>
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={
                () => {
                    handleSetActivetab(1)
                }
            }>
                <LinearGradient colors={bgColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>

                    {/* Glass border overlay */}
                    <View style={styles.glassBorder} />

                    {/* Top accent stripe */}
                    <LinearGradient
                        colors={isOnline ? [C.cyan, C.primary] : [dot, 'transparent']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.topStripe}
                    />

                    {/* ── WiFi icon area ── */}
                    <View style={styles.wifiArea}>

                        {/* Arcs – rendered bottom-up: arc[0]=inner, arc[2]=outer */}
                        <View style={styles.arcStack}>
                            {arcAnims?.map((anim, i) => {
                                const SIZE = normalize(22 + i * 20)   // 22 / 42 / 62
                                const THICK = normalize(3.5 - i * 0.5) // 3.5 / 3 / 2.5
                                return (
                                    <Animated.View
                                        key={i}
                                        style={[
                                            styles.arc,
                                            {
                                                width: SIZE,
                                                height: SIZE / 2,
                                                borderTopLeftRadius: SIZE / 2,
                                                borderTopRightRadius: SIZE / 2,
                                                borderTopWidth: THICK,
                                                borderLeftWidth: THICK,
                                                borderRightWidth: THICK,
                                                borderTopColor: isOnline ? C.cyan : '#555',
                                                borderLeftColor: isOnline ? C.cyan : '#555',
                                                borderRightColor: isOnline ? C.cyan : '#555',
                                                opacity: anim,
                                                bottom: normalize(10),  // align all arcs at base
                                            },
                                        ]}
                                    />
                                )
                            })}

                            {/* Dot at base of WiFi */}
                            <View style={styles.dotWrap}>
                                <Animated.View style={[
                                    styles.dotPulse,
                                    { backgroundColor: dot, transform: [{ scale: pulseAnim }], opacity: isOnline ? 0.35 : 0 }
                                ]} />
                                <View style={[styles.dot, { backgroundColor: dot }]} />
                            </View>
                        </View>
                    </View>

                    {/* ── Labels ── */}
                    <Text style={styles.labelMain}>{label.top}</Text>
                    <Text style={styles.labelSub}>{label.sub}</Text>

                    {/* ── Status pill ── */}
                    <View style={[styles.pill, { backgroundColor: `${dot}22`, borderColor: `${dot}44` }]}>
                        <View style={[styles.pillDot, { backgroundColor: dot }]} />
                        <Text style={[styles.pillText, { color: dot }]}>
                            {level === 'loading' ? 'SYNCING' : level.toUpperCase()}
                        </Text>
                    </View>

                </LinearGradient>
            </Pressable>
        </Animated.View>
    )
}

// ─── styles ───────────────────────────────────────────────────────────────────
const W = normalize(155)
const H = normalize(200)

const styles = StyleSheet.create({
    shadow: {
        width: W, height: H,
        borderRadius: normalize(22),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 16,
        elevation: 12,
    },
    card: {
        width: W, height: H,
        borderRadius: normalize(22),
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: normalize(14),
    },
    glassBorder: {
        position: 'absolute', inset: 0,
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: C.borderGlass,
    },
    topStripe: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: normalize(3),
    },
    // WiFi arcs
    wifiArea: {
        width: normalize(80),
        height: normalize(60),
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: normalize(10),
    },
    arcStack: {
        width: normalize(80),
        height: normalize(60),
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    arc: {
        position: 'absolute',
        borderBottomWidth: 0,
        borderBottomColor: 'transparent',
    },
    dotWrap: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: normalize(16),
        height: normalize(16),
    },
    dotPulse: {
        position: 'absolute',
        width: normalize(16),
        height: normalize(16),
        borderRadius: normalize(8),
    },
    dot: {
        width: normalize(8),
        height: normalize(8),
        borderRadius: normalize(4),
    },
    // Labels
    labelMain: {
        fontFamily: fonts.Bold,
        fontSize: normalize(15),
        color: C.white,
        letterSpacing: 0.3,
        marginBottom: normalize(3),
    },
    labelSub: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: C.bodyText,
        textAlign: 'center',
        paddingHorizontal: normalize(10),
        marginBottom: normalize(10),
    },
    // Pill
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(5),
        paddingHorizontal: normalize(11),
        paddingVertical: normalize(4),
        borderRadius: normalize(20),
        borderWidth: 1,
    },
    pillDot: {
        width: normalize(5),
        height: normalize(5),
        borderRadius: normalize(3),
    },
    pillText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(9),
        letterSpacing: 1.2,
    },
})
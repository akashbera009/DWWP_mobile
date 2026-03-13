import React, { useRef, useEffect } from 'react'
import {
    View, Text, StyleSheet, Animated, Platform, Image
} from 'react-native'
import ToggleSwitch from './ToggleSwitch'
import { useAppSelector } from '@dwwp/store/hooks'
import LinearGradient from 'react-native-linear-gradient'
import { localImages } from '@dwwp/utils/localimages'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh } from '@dwwp/utils/dimensions'

const C = {
    primary: '#2B6568',
    primaryDark: '#1e4a4d',
    primaryLight: 'rgba(43,101,104,0.10)',
    primaryBorder: 'rgba(43,101,104,0.18)',
    cyan: '#32C2CA',
    cyanBg: 'rgba(50,194,202,0.10)',
    cyanBorder: 'rgba(50,194,202,0.22)',
    disabled : 'rgba(50,194,202,0.22)',
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
 * WaterControlCard
 *
 * Replaces ControlSwitchModal — renders inline on the Device tab.
 * Handles three states automatically from Redux:
 *   1. Normal   — toggle works, shows live state
 *   2. Offline  — toggle is allowed but shows "queued" note
 *   3. Locked   — quota exceeded, toggle hidden, recharge CTA shown
 */
export const WaterControlCard: React.FC = () => {
    const { servoState, lastSeen } = useAppSelector(s => s.servo)

    // ── derive contextual flags ────────────────────────────────────────────────
    // Replace these with your real selectors once wired up
    const quotaExceeded: boolean = false   // e.g. useAppSelector(s => s.usage.quotaExceeded)
    const deviceOffline: boolean = false   // e.g. derive from lastSeen delta

    const isLocked = quotaExceeded

    // ── entry animation ────────────────────────────────────────────────────────
    const entryAnim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.spring(entryAnim, {
            toValue: 1, friction: 9, tension: 50, useNativeDriver: true,
        }).start()
    }, [])

    const cardStyle = {
        opacity: entryAnim,
        transform: [{ scale: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
    }

    return (
        <Animated.View style={cardStyle}>
            <View style={styles.card}>

                {/* ── Card header ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBox}>
                            <Image source={localImages.dwwp_logo} style={styles.logo} />
                        </View>
                        <View>
                            <Text style={styles.title}>Water Supply</Text>
                            <Text style={styles.subtitle}>DWWP Servo Valve · ESP32</Text>
                        </View>
                    </View>
                </View>

                {/* ── Quota exceeded banner ── */}
                {quotaExceeded && (
                    <View style={styles.errorBanner}>
                        <View style={styles.bannerIconBox}>
                            <Text style={styles.bannerEmoji}>🔒</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.errorTitle}>Usage limit reached</Text>
                            <Text style={styles.errorSub}>
                                Control is disabled. Recharge your plan to regain access.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Device offline banner ── */}
                {deviceOffline && !quotaExceeded && (
                    <View style={styles.warnBanner}>
                        <View style={[styles.bannerIconBox, { backgroundColor: C.warningBg }]}>
                            <Text style={styles.bannerEmoji}>⚠️</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.warnTitle}>Device not reachable</Text>
                            <Text style={styles.warnSub}>
                                Command will execute once device reconnects.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Live state card ── */}
                <LinearGradient
                    colors={
                        servoState && !isLocked
                            ? [C.primary, C.primaryDark]
                            : [C.bg, C.bg]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.stateCard,
                        !servoState && { borderWidth: 1, borderColor: C.border },
                    ]}
                >
                    <View style={styles.stateLeft}>
                        <View style={[styles.stateIconBox, {
                            backgroundColor: servoState && !isLocked
                                ? 'rgba(255,255,255,0.15)' : C.primaryLight,
                        }]}>
                            <Text style={{ fontSize: normalize(22) }}>
                                {isLocked ? '🔒' : servoState ? '💧' : '⏸️'}
                            </Text>
                        </View>
                        <View>
                            <Text style={[styles.stateLabel, {
                                color: servoState && !isLocked ? C.white : C.black,
                            }]}>
                                {isLocked ? 'Locked' : servoState ? 'Water is ON' : 'Water is OFF'}
                            </Text>
                            <Text style={[styles.stateDesc, {
                                color: servoState && !isLocked
                                    ? 'rgba(255,255,255,0.65)' : C.black,
                            }]}>
                                {isLocked
                                    ? 'Quota exceeded'
                                    : servoState
                                        ? 'Valve open · flowing'
                                        : 'Valve closed · stopped'}
                            </Text>
                        </View>
                    </View>

                    {/* Live badge */}
                    {!isLocked && (
                        <View style={[
                            styles.liveBadge,
                            { backgroundColor: servoState ? 'rgba(50,194,202,0.22)' : 'rgba(0,0,0,0.07)' },
                        ]}>
                            <LiveDot active={servoState} />
                            <Text style={[styles.liveText, {
                                color: servoState ? C.cyan : C.disabled,
                            }]}>
                                {servoState ? 'LIVE' : 'OFF'}
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* ── Toggle section (hidden when locked) ── */}
                {!isLocked ? (
                    <View style={styles.toggleSection}>
                        <Text style={styles.toggleHint}>
                            {deviceOffline
                                ? 'Device offline — toggle will queue and sync on reconnect'
                                : 'Tap to toggle water supply'}
                        </Text>
                        <ToggleSwitch disabled={isLocked} />
                    </View>
                ) : (
                    <View style={styles.lockedSection}>
                        <Text style={styles.lockedText}>
                            Recharge your plan to control the valve
                        </Text>
                        {/* Wire this to your payment/recharge navigator */}
                        <View style={styles.rechargeBtn}>
                            <Text style={styles.rechargeBtnText}>Recharge Plan</Text>
                        </View>
                    </View>
                )}

                {/* ── Info note ── */}
                <View style={styles.infoNote}>
                    <View style={styles.infoIconBox}>
                        <Text style={{ fontSize: normalize(12) }}>ℹ️</Text>
                    </View>
                    <Text style={styles.infoText}>
                        {deviceOffline
                            ? 'Device is offline. Showing last known state. Commands sync automatically on reconnect.'
                            : 'Controls the servo valve on your DWWP device. Physical valve responds within 2–3 seconds.'}
                    </Text>
                </View>

            </View>
        </Animated.View>
    )
}

// ── Small pulsing live dot ─────────────────────────────────────────────────────
const LiveDot: React.FC<{ active: boolean }> = ({ active }) => {
    const pulse = useRef(new Animated.Value(1)).current

    useEffect(() => {
        if (!active) return
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.5, duration: 700, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        )
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
                    backgroundColor: C.cyan,
                    opacity: 0.4,
                    transform: [{ scale: pulse }],
                }} />
            )}
            <View style={{
                width: normalize(6), height: normalize(6),
                borderRadius: normalize(3),
                backgroundColor: active ? C.cyan : C.disabled,
            }} />
        </View>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    card: {
        backgroundColor: C.white,
        borderRadius: normalize(20),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(16),
        paddingTop: normalize(16),
        paddingBottom: normalize(12),
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(12),
    },
    iconBox: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(12),
        backgroundColor: C.cyanBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: normalize(24),
        height: normalize(24),
    },
    title: {
        fontFamily: fonts.Bold,
        fontSize: normalize(15),
        color: C.black,
    },
    subtitle: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.black,
        marginTop: vh(2),
    },

    // Banners
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(10),
        backgroundColor: C.errorBg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: C.errorBorder,
        padding: normalize(14),
    },
    warnBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(10),
        backgroundColor: C.warningBg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: C.warningBorder,
        padding: normalize(14),
    },
    bannerIconBox: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(8),
        backgroundColor: C.errorBg,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    bannerEmoji: { fontSize: normalize(15) },
    errorTitle: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(13),
        color: C.error,
    },
    errorSub: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.error,
        opacity: 0.8,
        marginTop: vh(3),
        lineHeight: normalize(16),
    },
    warnTitle: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(13),
        color: C.warning,
    },
    warnSub: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.warning,
        opacity: 0.85,
        marginTop: vh(3),
        lineHeight: normalize(16),
    },

    // State card
    stateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: normalize(14),
        marginTop: normalize(14),
        borderRadius: normalize(16),
        padding: normalize(14),
        shadowColor: C.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 4,
    },
    stateLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(12),
    },
    stateIconBox: {
        width: normalize(44),
        height: normalize(44),
        borderRadius: normalize(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    stateLabel: {
        fontFamily: fonts.Bold,
        fontSize: normalize(15),
    },
    stateDesc: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        marginTop: vh(2),
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(5),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
        borderRadius: normalize(20),
    },
    liveText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(10),
        letterSpacing: 0.8,
    },

    // Toggle section
    toggleSection: {
        alignItems: 'center',
        paddingVertical: normalize(20),
        paddingHorizontal: normalize(16),
        gap: normalize(12),
    },
    toggleHint: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: C.black,
        textAlign: 'center',
        lineHeight: normalize(17),
    },

    // Locked state
    lockedSection: {
        alignItems: 'center',
        paddingVertical: normalize(20),
        paddingHorizontal: normalize(16),
        gap: normalize(12),
    },
    lockedText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: C.black,
        textAlign: 'center',
    },
    rechargeBtn: {
        backgroundColor: C.primary,
        borderRadius: normalize(12),
        paddingHorizontal: normalize(24),
        paddingVertical: normalize(11),
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    rechargeBtnText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: C.white,
        letterSpacing: 0.3,
    },

    // Info note
    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(8),
        backgroundColor: C.primaryLight,
        margin: normalize(14),
        marginTop: 0,
        borderRadius: normalize(10),
        padding: normalize(11),
    },
    infoIconBox: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(7),
        backgroundColor: C.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    infoText: {
        flex: 1,
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: C.primary,
        lineHeight: normalize(16),
    },
})
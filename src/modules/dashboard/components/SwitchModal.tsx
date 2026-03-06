/**
 * SwitchModal.tsx
 *
 * Bottom sheet to toggle the DWWP ESP32 servo (water valve) state.
 * Maps directly to Firebase field: users/{email}/servoState: boolean
 *
 * States handled:
 *  - Normal: user can freely toggle the valve ON / OFF
 *  - quotaExceeded: toggle is locked, red banner shown
 *  - deviceOffline: warning shown, toggle still visible but warned
 *
 * Props:
 *   servoState      – current value from Firebase (true = water ON)
 *   onToggle        – called with new boolean when user confirms change
 *   onClose         – close the sheet
 *   quotaExceeded   – monthly limit reached → lock toggle
 *   deviceOffline   – device not reachable → show warning
 *   limitExceeded   – same as quotaExceeded (Firebase field alias)
 */

import React, { useEffect, useRef, useState } from 'react'
import {
    View, Text, StyleSheet, Modal, Pressable,
    TouchableOpacity, Platform, Animated, Easing,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'

// ─── theme ────────────────────────────────────────────────────────────────────
const C = {
    primary:       '#2B6568',
    primaryDark:   '#1e4a4d',
    primaryLight:  'rgba(43,101,104,0.10)',
    primaryBorder: 'rgba(43,101,104,0.20)',
    cyan:          '#32C2CA',
    cyanBg:        'rgba(50,194,202,0.10)',
    white:         '#FFFFFF',
    black:         '#041617',
    bodyText:      '#6A7C92',
    border:        '#E1E8ED',
    bg:            '#F4F7F8',
    error:         '#E74C3C',
    errorBg:       'rgba(231,76,60,0.08)',
    errorBorder:   'rgba(231,76,60,0.20)',
    warning:       '#F39C12',
    warningBg:     'rgba(243,156,18,0.08)',
    warningBorder: 'rgba(243,156,18,0.22)',
    success:       '#27AE60',
    successBg:     'rgba(39,174,96,0.10)',
    overlay:       'rgba(4,22,23,0.52)',
    disabled:      '#B0BEC5',
    disabledBg:    '#ECEFF1',
    inputBg:       '#EFF2F5',
    shadow:        'rgba(43,101,104,0.12)',
}

// ─── Big animated valve toggle ────────────────────────────────────────────────
interface ValveToggleProps {
    value: boolean
    disabled?: boolean
    onToggle: () => void
}

const ValveToggle: React.FC<ValveToggleProps> = ({ value, disabled, onToggle }) => {
    const anim      = useRef(new Animated.Value(value ? 1 : 0)).current
    const glowAnim  = useRef(new Animated.Value(value ? 1 : 0)).current
    const ripple    = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.spring(anim, { toValue: value ? 1 : 0, friction: 6, tension: 120, useNativeDriver: false }).start()
        Animated.timing(glowAnim, { toValue: value ? 1 : 0, duration: 300, useNativeDriver: false }).start()
    }, [value])

    const handlePress = () => {
        if (disabled) return
        // ripple burst
        ripple.setValue(0)
        Animated.timing(ripple, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()
        onToggle()
    }

    const TRACK_W = normalize(88)
    const TRACK_H = normalize(46)
    const THUMB_D = normalize(36)

    const thumbX = anim.interpolate({ inputRange: [0, 1], outputRange: [normalize(5), TRACK_W - THUMB_D - normalize(5)] })
    const trackBg = anim.interpolate({ inputRange: [0, 1], outputRange: [C.inputBg, C.cyan] })
    const glowOp  = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] })
    const rippleS = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.2] })
    const rippleO = ripple.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.2, 0] })

    return (
        <View style={{ alignItems: 'center', gap: normalize(8) }}>
            {/* Glow behind track */}
            <Animated.View style={[
                styles.toggleGlow,
                { width: TRACK_W + normalize(20), height: TRACK_H + normalize(20), opacity: glowOp, backgroundColor: C.cyan }
            ]} />

            <Pressable onPress={handlePress} disabled={disabled} style={{ zIndex: 1 }}>
                <Animated.View style={[styles.toggleTrack, { width: TRACK_W, height: TRACK_H, backgroundColor: disabled ? C.disabledBg : trackBg }]}>
                    {/* Ripple */}
                    <Animated.View style={[
                        styles.toggleRipple,
                        { width: THUMB_D, height: THUMB_D, borderRadius: THUMB_D / 2, transform: [{ scale: rippleS }], opacity: rippleO,
                          left: thumbX, backgroundColor: value ? C.white : C.cyan }
                    ]} />

                    {/* Thumb */}
                    <Animated.View style={[
                        styles.toggleThumb,
                        { width: THUMB_D, height: THUMB_D, borderRadius: THUMB_D / 2, left: thumbX,
                          backgroundColor: disabled ? C.disabled : C.white }
                    ]}>
                        {/* Icon inside thumb */}
                        <Text style={[styles.thumbIcon, { opacity: disabled ? 0.4 : 1 }]}>
                            {value && !disabled ? '💧' : disabled ? '🔒' : '⏸'}
                        </Text>
                    </Animated.View>
                </Animated.View>
            </Pressable>

            {/* State label under toggle */}
            <Text style={[
                styles.toggleLabel,
                { color: disabled ? C.disabled : value ? C.cyan : C.bodyText }
            ]}>
                {disabled ? 'LOCKED' : value ? 'SUPPLY ACTIVE' : 'SUPPLY PAUSED'}
            </Text>
        </View>
    )
}

// ─── shake hook ──────────────────────────────────────────────────────────────
function useShake() {
    const anim = useRef(new Animated.Value(0)).current
    const shake = () => {
        Animated.sequence([
            Animated.timing(anim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue:  10, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue:  -7, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue:   7, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue:   0, duration: 60, useNativeDriver: true }),
        ]).start()
    }
    const style = { transform: [{ translateX: anim }] }
    return { shake, style }
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
    servoState:     boolean          // current valve state from Firebase
    onToggle:       (next: boolean) => void  // save to Firebase
    onClose:        () => void
    quotaExceeded?: boolean          // Firebase: limitExceeded
    deviceOffline?: boolean          // derived from lastSeen
}

const SwitchModal: React.FC<Props> = ({
    servoState,
    onToggle,
    onClose,
    quotaExceeded = false,
    deviceOffline = false,
}) => {
    const [localState, setLocalState] = useState(servoState)
    const isDirty   = localState !== servoState
    const isLocked  = quotaExceeded

    const sheetAnim = useRef(new Animated.Value(600)).current
    const { shake, style: shakeStyle } = useShake()

    // Slide in
    useEffect(() => {
        Animated.spring(sheetAnim, { toValue: 0, friction: 9, tension: 140, useNativeDriver: true }).start()
    }, [])

    const close = () => {
        Animated.timing(sheetAnim, { toValue: 600, duration: 260, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(onClose)
    }

    const handleToggle = () => {
        if (isLocked) { shake(); return }
        setLocalState(p => !p)
    }

    const handleConfirm = () => {
        onToggle(localState)
        close()
    }

    return (
        <Modal transparent animationType="none" statusBarTranslucent onRequestClose={close}>
            <Pressable style={styles.overlay} onPress={close}>
                <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
                    <Pressable onPress={e => e.stopPropagation()}>

                        {/* Handle */}
                        <View style={styles.handle} />

                        {/* ── Header ── */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={styles.headerIconBox}>
                                    <Text style={styles.headerIconEmoji}>💧</Text>
                                </View>
                                <View>
                                    <Text style={styles.title}>Water Supply Control</Text>
                                    <Text style={styles.subtitle}>DWWP Servo Valve · ESP32</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={close} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Quota exceeded banner ── */}
                        {quotaExceeded && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.bannerIcon}>⛔</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.errorBannerTitle}>Usage limit reached</Text>
                                    <Text style={styles.errorBannerSub}>Control disabled. Recharge to continue.</Text>
                                </View>
                            </View>
                        )}

                        {/* ── Device offline warning ── */}
                        {deviceOffline && !quotaExceeded && (
                            <View style={styles.warnBanner}>
                                <Text style={styles.bannerIcon}>⚠️</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.warnBannerTitle}>Device not reachable</Text>
                                    <Text style={styles.warnBannerSub}>Command will execute once device reconnects</Text>
                                </View>
                            </View>
                        )}

                        {/* ── Current state card ── */}
                        <LinearGradient
                            colors={localState && !isLocked
                                ? [C.primary, C.primaryDark]
                                : [C.bg, C.bg]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={[styles.stateCard, !localState && { borderWidth: 1, borderColor: C.border }]}
                        >
                            <View style={styles.stateCardLeft}>
                                <View style={[styles.stateIconBox, {
                                    backgroundColor: localState && !isLocked
                                        ? 'rgba(255,255,255,0.15)' : C.primaryLight
                                }]}>
                                    <Text style={{ fontSize: normalize(22) }}>
                                        {isLocked ? '🔒' : localState ? '💧' : '⏸️'}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={[styles.stateLabel, {
                                        color: localState && !isLocked ? C.white : C.black
                                    }]}>
                                        {isLocked ? 'Locked' : localState ? 'Water is ON' : 'Water is OFF'}
                                    </Text>
                                    <Text style={[styles.stateDesc, {
                                        color: localState && !isLocked ? 'rgba(255,255,255,0.65)' : C.bodyText
                                    }]}>
                                        {isLocked ? 'Quota exceeded' : localState ? 'Valve open · flowing' : 'Valve closed · stopped'}
                                    </Text>
                                </View>
                            </View>

                            {/* Live indicator */}
                            {!isLocked && (
                                <View style={[styles.liveBadge, { backgroundColor: localState ? 'rgba(50,194,202,0.25)' : 'rgba(0,0,0,0.08)' }]}>
                                    <View style={[styles.liveDot, { backgroundColor: localState ? C.cyan : C.disabled }]} />
                                    <Text style={[styles.liveText, { color: localState ? C.cyan : C.disabled }]}>
                                        {localState ? 'LIVE' : 'OFF'}
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>

                        {/* ── Big toggle ── */}
                        <View style={styles.toggleSection}>
                            <Text style={styles.toggleHint}>
                                {isLocked ? 'Recharge your plan to control the valve'
                                    : 'Tap to toggle water supply'}
                            </Text>
                            <Animated.View style={shakeStyle}>
                                <ValveToggle
                                    value={localState}
                                    disabled={isLocked}
                                    onToggle={handleToggle}
                                />
                            </Animated.View>
                        </View>

                        {/* ── Info note ── */}
                        <View style={styles.infoNote}>
                            <View style={[styles.infoIconBox, { backgroundColor: C.primaryLight }]}>
                                <Text style={{ fontSize: normalize(13) }}>ℹ️</Text>
                            </View>
                            <Text style={styles.infoText}>
                                This switch controls the servo valve on your DWWP device.
                                {deviceOffline ? ' Device is currently offline — command will sync when reconnected.' : ''}
                            </Text>
                        </View>

                        {/* ── Action buttons ── */}
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={close} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={isLocked ? undefined : handleConfirm}
                                style={[styles.confirmBtn, isLocked && { opacity: 0.45 }]}
                                disabled={isLocked}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={[C.cyan, C.primary]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.confirmBtnInner}
                                >
                                    <Text style={styles.confirmBtnText}>
                                        {isDirty ? (localState ? '✓  Turn ON' : '✓  Turn OFF') : 'Done'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    )
}

export default SwitchModal

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: C.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: C.white,
        borderTopLeftRadius:  normalize(28),
        borderTopRightRadius: normalize(28),
        paddingHorizontal: normalize(20),
        paddingBottom: Platform.OS === 'ios' ? normalize(38) : normalize(22),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
        elevation: 24,
    },
    handle: {
        width: normalize(40), height: normalize(4),
        borderRadius: normalize(2), backgroundColor: C.border,
        alignSelf: 'center',
        marginTop: normalize(12), marginBottom: normalize(20),
    },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: normalize(16),
    },
    headerLeft: {
        flexDirection: 'row', alignItems: 'center', gap: normalize(12),
    },
    headerIconBox: {
        width: normalize(42), height: normalize(42),
        borderRadius: normalize(14), backgroundColor: C.cyanBg,
        alignItems: 'center', justifyContent: 'center',
    },
    headerIconEmoji: { fontSize: normalize(20) },
    title: {
        fontFamily: fonts.Bold, fontSize: normalize(17), color: C.black,
    },
    subtitle: {
        fontFamily: fonts.Regular, fontSize: normalize(11),
        color: C.bodyText, marginTop: vh(2),
    },
    closeBtn: {
        width: normalize(30), height: normalize(30),
        borderRadius: normalize(15), backgroundColor: C.bg,
        alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { fontFamily: fonts.Bold, fontSize: normalize(12), color: C.bodyText },

    // Banners
    errorBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: normalize(10),
        backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder,
        borderRadius: normalize(14), padding: normalize(13), marginBottom: normalize(12),
    },
    warnBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: normalize(10),
        backgroundColor: C.warningBg, borderWidth: 1, borderColor: C.warningBorder,
        borderRadius: normalize(14), padding: normalize(13), marginBottom: normalize(12),
    },
    bannerIcon: { fontSize: normalize(18), marginTop: normalize(1) },
    errorBannerTitle: { fontFamily: fonts.Bold, fontSize: normalize(13), color: C.error },
    errorBannerSub:   { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.error, marginTop: vh(2), opacity: 0.8 },
    warnBannerTitle:  { fontFamily: fonts.Bold, fontSize: normalize(13), color: C.warning },
    warnBannerSub:    { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.warning, marginTop: vh(2), opacity: 0.8 },

    // State card
    stateCard: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: normalize(18), padding: normalize(16),
        marginBottom: normalize(6),
        shadowColor: C.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1, shadowRadius: 10, elevation: 4,
    },
    stateCardLeft: {
        flexDirection: 'row', alignItems: 'center', gap: normalize(12),
    },
    stateIconBox: {
        width: normalize(46), height: normalize(46),
        borderRadius: normalize(15),
        alignItems: 'center', justifyContent: 'center',
    },
    stateLabel: { fontFamily: fonts.Bold, fontSize: normalize(15) },
    stateDesc:  { fontFamily: fonts.Regular, fontSize: normalize(11), marginTop: vh(2) },
    liveBadge: {
        flexDirection: 'row', alignItems: 'center', gap: normalize(4),
        paddingHorizontal: normalize(10), paddingVertical: normalize(5),
        borderRadius: normalize(20),
    },
    liveDot: { width: normalize(6), height: normalize(6), borderRadius: normalize(3) },
    liveText: { fontFamily: fonts.Bold, fontSize: normalize(10), letterSpacing: 0.8 },

    // Toggle section
    toggleSection: {
        alignItems: 'center',
        paddingVertical: normalize(24),
        gap: normalize(16),
    },
    toggleHint: {
        fontFamily: fonts.Regular, fontSize: normalize(12),
        color: C.bodyText, textAlign: 'center',
    },

    // Big toggle
    toggleGlow: {
        position: 'absolute',
        borderRadius: normalize(30),
        top: -normalize(10), left: -normalize(10),
    },
    toggleTrack: {
        borderRadius: normalize(23),
        justifyContent: 'center',
        shadowColor: C.cyan,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
    },
    toggleThumb: {
        position: 'absolute',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22, shadowRadius: 6, elevation: 6,
    },
    toggleRipple: { position: 'absolute' },
    thumbIcon: { fontSize: normalize(16) },
    toggleLabel: {
        fontFamily: fonts.Bold, fontSize: normalize(10),
        letterSpacing: 1.4, textAlign: 'center',
    },

    // Info note
    infoNote: {
        flexDirection: 'row', alignItems: 'flex-start', gap: normalize(10),
        backgroundColor: C.primaryLight,
        borderRadius: normalize(12), padding: normalize(12),
        marginBottom: normalize(16),
    },
    infoIconBox: {
        width: normalize(26), height: normalize(26),
        borderRadius: normalize(8),
        alignItems: 'center', justifyContent: 'center',
    },
    infoText: {
        flex: 1, fontFamily: fonts.Regular,
        fontSize: normalize(11), color: C.primary, lineHeight: normalize(17),
    },

    // Action buttons
    actions: {
        flexDirection: 'row', gap: normalize(10),
    },
    cancelBtn: {
        flex: 1, borderWidth: 1.5, borderColor: C.border,
        borderRadius: normalize(14), padding: normalize(14),
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: fonts.SemiBold, fontSize: normalize(14), color: C.bodyText,
    },
    confirmBtn: {
        flex: 2, borderRadius: normalize(14), overflow: 'hidden',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28, shadowRadius: 8, elevation: 6,
    },
    confirmBtnInner: { padding: normalize(14), alignItems: 'center' },
    confirmBtnText: {
        fontFamily: fonts.Bold, fontSize: normalize(14), color: C.white, letterSpacing: 0.3,
    },
})
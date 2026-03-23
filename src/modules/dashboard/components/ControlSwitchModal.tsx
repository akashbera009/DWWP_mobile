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

import React, { useEffect, useRef } from 'react'
import {
    View, Text, StyleSheet, Modal, Pressable,
    TouchableOpacity, Platform, Animated, Easing,
    Image,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { normalize, vh} from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import ToggleSwitch from '@dwwp/modules/dashboard/components/ToggleSwitch'
import { localImages } from '@dwwp/utils/localimages'
import { useAppSelector } from '@dwwp/store/hooks'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { CustomButton } from '@dwwp/components/CustomButton'
import { ToastContainer } from '@dwwp/components/ToastContainer'
import { PulseDot } from './PulseDot'

// ─── theme ────────────────────────────────────────────────────────────────────
const C = {
    primary: '#2B6568',
    primaryDark: '#1e4a4d',
    primaryLight: 'rgba(43,101,104,0.10)',
    primaryBorder: 'rgba(43,101,104,0.20)',
    cyan: '#32C2CA',
    cyanBg: 'rgba(50,194,202,0.10)',
    white: '#FFFFFF',
    black: '#041617',
    bodyText: '#6A7C92',
    border: '#E1E8ED',
    bg: '#F4F7F8',
    error: '#E74C3C',
    errorBg: 'rgba(231,76,60,0.08)',
    errorBorder: 'rgba(231,76,60,0.20)',
    warning: '#F39C12',
    warningBg: 'rgba(243,156,18,0.08)',
    warningBorder: 'rgba(243,156,18,0.22)',
    success: '#27AE60',
    successBg: 'rgba(39,174,96,0.10)',
    overlay: 'rgba(4,22,23,0.52)',
    disabled: '#B0BEC5',
    disabledBg: '#ECEFF1',
    inputBg: '#EFF2F5',
    shadow: 'rgba(43,101,104,0.12)',
}
// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
    onClose: () => void
}

const ControlSwitchModal: React.FC<Props> = ({ onClose }) => {

    const { servoState } = useAppSelector(s => s.servo)
    const { lastSeen } = useAppSelector(s => s.servo)
    const sheetAnim = useRef(new Animated.Value(600)).current

    // Slide in
    useEffect(() => {
        Animated.spring(sheetAnim, { toValue: 0, friction: 9, tension: 40, useNativeDriver: true }).start()
    }, [])

    const close = () => {
        Animated.timing(sheetAnim, { toValue: 600, duration: 260, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(onClose)
    }

    const handleConfirm = () => {
        // onToggle(localState)
        close()
    }
    type ConnLevel = 'online' | 'recent' | 'stale' | 'offline' | 'loading'
    function calcLevel(lastSeen: number): ConnLevel {
        if (!lastSeen) return 'loading'
        const delta = Date.now() - lastSeen
        if (delta < 30_000) return 'online'
        if (delta < 5 * 60_000) return 'recent'
        if (delta < 60 * 60_000) return 'stale'
        return 'offline'
    }
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
        <Modal transparent animationType="none" statusBarTranslucent onRequestClose={close}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ToastContainer />
                <Pressable style={styles.overlay} onPress={close}>
                    <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
                        <Pressable onPress={e => e.stopPropagation()}>
                            {/* Handle */}
                            <View style={styles.handle} />
                            {/* ── Header ── */}
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
                                        <Text style={{ fontSize: normalize(22) }}>⚠️</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={wStyles.warnTitle}>Device not reachable</Text>
                                            <Text style={wStyles.warnSub}>
                                                Controlling available upon connected to WIFI
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
                                        {/* <Text style={wStyles.toggleHint}>
                                            {deviceOffline
                                                ? 'Device offline — toggle will queue and sync on reconnect'
                                                : 'Tap to toggle water supply. Changes apply instantly.'}
                                        </Text> */}
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
                                    <Image source={localImages.info} style={wStyles.info} />
                                    <Text style={wStyles.infoText}>
                                        {deviceOffline
                                            ? 'Device is offline. Showing last known state. Commands sync automatically on reconnect.'
                                            : 'Controls the servo valve on your DWWP device. The physical valve responds within 2–3 seconds.'}
                                    </Text>
                                </View>
                            </View>

                            <CustomButton
                                title='Done'
                                onPress={handleConfirm}
                            />

                        </Pressable>
                    </Animated.View>
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    )
}

export default ControlSwitchModal

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: C.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: C.white,
        borderTopLeftRadius: normalize(28),
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
    logo: {
        height: vh(22),
        width: vh(22),
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
    errorBannerSub: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.error, marginTop: vh(2), opacity: 0.8 },
    warnBannerTitle: { fontFamily: fonts.Bold, fontSize: normalize(13), color: C.warning },
    warnBannerSub: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.warning, marginTop: vh(2), opacity: 0.8 },

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
    stateDesc: { fontFamily: fonts.Regular, fontSize: normalize(11), marginTop: vh(2) },
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


const wStyles = StyleSheet.create({
    card: {
        backgroundColor: C.white,
        borderRadius: normalize(18),
    },
    errorBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: normalize(10),
        backgroundColor: C.errorBg,
        borderBottomWidth: 1, borderBottomColor: C.errorBorder,
        padding: normalize(13),
    },
    warnBanner: {
        flexDirection: 'row', alignItems: 'center', gap: normalize(10),
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
        paddingHorizontal: normalize(16),
        paddingVertical: vh(6)
    },
    stateLabel: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
    },
    stateDesc: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
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
        justifyContent: 'center',
        // paddingHorizontal: normalize(16),
        // paddingVertical: normalize(14),
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
    info: {
        height: vh(18),
        width: vh(18)
    },
    infoNote: {
        flexDirection: 'row', alignItems: 'center', gap: normalize(8),
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
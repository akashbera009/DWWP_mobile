import React, { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Easing,
    Platform,
    KeyboardAvoidingView,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import colors from "@dwwp/utils/colors"
import fonts from "@dwwp/utils/fonts"
import { normalize, vh, vw } from "@dwwp/utils/dimensions"
import { goBack } from "@dwwp/utils/navigationService"
import { useAppDispatch, useAppSelector } from "@dwwp/store/hooks"
import AnimatedInput from "../components/AnimatedInput"
import { LoadingPopup } from "../components/LoadingPopup"
import Avatar from "@dwwp/modules/dashboard/components/Avatar"
import { updateProfile } from "../authAction"
import { clearEditProfileState, clearSuccess } from "../authSlice"
import { CustomHeader } from "@dwwp/components/CustomHeader"

// ─── Section Header (same pattern as SignUpScreen) ────────────────────────────

const SectionHeader: React.FC<{ icon: string; title: string; sub: string }> = ({
    icon, title, sub,
}) => (
    <View style={sh.wrapper}>
        <Text style={sh.icon}>{icon}</Text>
        <View>
            <Text style={sh.title}>{title}</Text>
            <Text style={sh.sub}>{sub}</Text>
        </View>
    </View>
)

const sh = StyleSheet.create({
    wrapper: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
    icon: { fontSize: 26 },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.neutralBlack,
        fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },
    sub: { fontSize: 12, color: colors.neutralBodyText, marginTop: 1 },
})

// ─── Field Error ──────────────────────────────────────────────────────────────

const FieldErr: React.FC<{ msg?: string }> = ({ msg }) => {
    if (!msg) return null
    return <Text style={styles.fieldError}>⚠ {msg}</Text>
}

// ─── Disabled Row (read-only info) ────────────────────────────────────────────

const DisabledRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <View style={styles.disabledRow}>
        <Text style={styles.disabledLabel}>{label}</Text>
        <Text style={styles.disabledValue}>{value ?? "—"}</Text>
        <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
        </View>
    </View>
)

// ─── Screen ───────────────────────────────────────────────────────────────────

interface FieldError {
    fullName?: string
    mobileNo?: string
    address?: string
}

const EditProfileScreen = () => {
    const {bottom} = useSafeAreaInsets()
    const dispatch = useAppDispatch()

    const userDetails = useAppSelector((state) => state?.dashboard?.userDetails)
    const { isLoading, error, success } = useAppSelector((state) => state?.auth)

    // Editable fields
    const [fullName, setFullName] = useState(userDetails?.fullName ?? "")
    const [mobileNo, setMobileNo] = useState(userDetails?.mobileNo ?? "")
    const [address, setAddress] = useState(userDetails?.address ?? "")
    const [fieldErrors, setFieldErrors] = useState<FieldError>({})

    // Card entry animation
    const cardOpacity = useRef(new Animated.Value(0)).current
    const cardSlide = useRef(new Animated.Value(30)).current
    const buttonScale = useRef(new Animated.Value(1)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 1, duration: 480, delay: 80,
                easing: Easing.out(Easing.cubic), useNativeDriver: true,
            }),
            Animated.timing(cardSlide, {
                toValue: 0, duration: 480, delay: 80,
                easing: Easing.out(Easing.cubic), useNativeDriver: true,
            }),
        ]).start()

        return () => { dispatch(clearSuccess()) }
    }, [])

    // Go back after successful save
    useEffect(() => {
        if (success) goBack()
    }, [success])

    // ── Validation ────────────────────────────────────────────────────────────

    const validate = (): boolean => {
        const errs: FieldError = {}

        if (!fullName.trim()) errs.fullName = "Full name is required."
        else if (fullName.trim().length < 3) errs.fullName = "Name must be at least 3 characters."

        if (!mobileNo.trim()) errs.mobileNo = "Mobile number is required."
        else if (!/^\d{10}$/.test(mobileNo.trim())) errs.mobileNo = "Enter a valid 10-digit mobile number."

        if (!address.trim()) errs.address = "Address is required."
        else if (address.trim().length < 10) errs.address = "Please enter a complete address."

        setFieldErrors(errs)
        return Object.keys(errs).length === 0
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSave = () => {
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 70, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 70, useNativeDriver: true }),
        ]).start()

        dispatch(clearEditProfileState())
        if (!validate()) return

        dispatch(updateProfile({ fullName: fullName.trim(), mobileNo: mobileNo.trim(), address: address.trim() }))
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >

            <CustomHeader
                screenName="Edit Profile"
            />

            <ScrollView
                contentContainerStyle={[styles.scroll , {paddingBottom :vh(80)}]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarRing}>
                        <Avatar name={fullName || userDetails?.fullName || ''} size={72} />
                    </View>
                    <Text style={styles.avatarName}>{fullName || userDetails?.fullName}</Text>
                    <Text style={styles.avatarSub}>{userDetails?.emailId}</Text>
                </View>

                <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>

                    {/* ── Section 1: Editable ── */}
                    <SectionHeader icon="👤" title="Personal Info" sub="You can update these fields" />

                    <AnimatedInput
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={(t) => { setFullName(t); setFieldErrors((e) => ({ ...e, fullName: undefined })) }}
                        delay={60}
                    />
                    <FieldErr msg={fieldErrors.fullName} />

                    <AnimatedInput
                        placeholder="Mobile Number"
                        value={mobileNo}
                        onChangeText={(t) => {
                            const digits = t.replace(/\D/g, "").slice(0, 10)
                            setMobileNo(digits)
                            setFieldErrors((e) => ({ ...e, mobileNo: undefined }))
                        }}
                        keyboardType="phone-pad"
                        delay={120}
                    />
                    <FieldErr msg={fieldErrors.mobileNo} />

                    <AnimatedInput
                        placeholder="Residential Address"
                        value={address}
                        onChangeText={(t) => { setAddress(t); setFieldErrors((e) => ({ ...e, address: undefined })) }}
                        delay={180}
                        multiline
                    />
                    <FieldErr msg={fieldErrors.address} />

                    <View style={styles.sectionDivider} />

                    {/* ── Section 2: Account Info (locked) ── */}
                    <SectionHeader icon="🪪" title="Account Info" sub="These fields cannot be changed" />

                    <DisabledRow label="Email Address" value={userDetails?.emailId} />
                    <DisabledRow label="Consumer Number" value={userDetails?.consumerNumber} />
                    <DisabledRow label="Meter Number" value={userDetails?.meterNumber} />
                    <DisabledRow label="Account Number" value={userDetails?.accountNumber} />
                    <DisabledRow label="Supply Zone" value={userDetails?.supplyZone} />

                    <View style={styles.sectionDivider} />

                    {/* ── Section 3: Wi-Fi (locked) ── */}
                    <SectionHeader icon="📶" title="Wi-Fi Details" sub="Managed by your service provider" />

                    {/* <DisabledRow label="Wi-Fi Name (SSID)" value={userDetails?.wifiName} />
                    <DisabledRow label="Wi-Fi Password" value={userDetails?.wifiPassword ? "••••••••" : undefined} /> */}

                    {/* API error */}
                    {!!error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>⚠ {error}</Text>
                        </View>
                    )}

                    {/* Save Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 8 }}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            activeOpacity={0.85}
                            disabled={isLoading}
                        >
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <LoadingPopup visible={isLoading} message="Saving changes…" />
        </KeyboardAvoidingView>
    )
}

export default EditProfileScreen

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.overlayBackground,
    },

    // Header bar
    headerBar: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: vh(6),
    },
    backArrow: {
        height: vh(16),
        width: vw(16),
        tintColor: colors.white,
        marginHorizontal: vw(16),
    },
    headerTitle: {
        fontFamily: fonts.Bold,
        fontSize: normalize(20),
        color: colors.white,
    },

    scroll: {
        paddingHorizontal: vw(16),
        paddingTop: vh(20),
    },

    // Avatar
    avatarSection: {
        alignItems: "center",
        marginBottom: vh(20),
    },
    avatarRing: {
        width: normalize(80),
        height: normalize(80),
        borderRadius: normalize(40),
        borderWidth: 2.5,
        borderColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: vh(8),
    },
    avatarName: {
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
        color: colors.primaryBlack,
    },
    avatarSub: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: "#6B7280",
        marginTop: vh(2),
    },

    // Card
    card: {
        backgroundColor: colors.white,
        borderRadius: normalize(20),
        padding: normalize(20),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 18,
        elevation: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },

    sectionDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: vh(20),
    },

    // Disabled row
    disabledRow: {
        backgroundColor: "#F9FAFB",
        borderRadius: normalize(10),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingVertical: vh(12),
        paddingHorizontal: vw(14),
        marginBottom: vh(10),
        flexDirection: "row",
        alignItems: "center",
    },
    disabledLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        flex: 1,
        marginRight: vw(8),
        // fixed width so value aligns
        minWidth: vw(90),
        maxWidth: vw(90),
    },
    disabledValue: {
        fontFamily: fonts.Medium,
        fontSize: normalize(13),
        color: "#6B7280",
        flex: 1,
    },
    lockBadge: {
        marginLeft: vw(6),
    },
    lockIcon: {
        fontSize: normalize(12),
    },

    // Errors
    fieldError: {
        fontSize: normalize(12),
        color: colors.error,
        marginTop: -8,
        marginBottom: vh(10),
        marginLeft: vw(4),
        fontWeight: "500",
    },
    errorBanner: {
        backgroundColor: "#FFF0EF",
        borderRadius: normalize(10),
        paddingHorizontal: vw(14),
        paddingVertical: vh(10),
        marginBottom: vh(14),
        marginTop: vh(4),
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
    },
    errorText: {
        color: colors.error,
        fontSize: normalize(13),
        fontWeight: "500",
    },

    // Save button
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: normalize(14),
        height: normalize(52),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: vh(8),
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: normalize(15),
        fontFamily: fonts.Bold,
        letterSpacing: 0.4,
    },
})
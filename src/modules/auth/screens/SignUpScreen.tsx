/**
 * SignUpScreen.tsx
 *
 * Reuses AnimatedInput and BlobBackground from LoginScreen.
 * Multi-field form: name → email → address → aadhaar → mobile → password → confirm password
 * Confirm password field only appears after password has been typed.
 *
 * Redux: dispatches registerWithEmail action.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppDispatch, useAppSelector } from "@dwwp/store/hooks";
import { registerWithEmail } from "../authAction";
import { clearError } from "../authSlice";
import { AuthStackParamList, RootStackParamList } from "@dwwp/utils/types";
import { screenNames } from "@dwwp/utils/screenNames";
import colors from "@dwwp/utils/colors";
import AnimatedInput from "../components/AnimatedInput";
import { LoadingPopup } from "../components/LoadingPopup";
import BlobBackground from "../components/BlobBackground";

// ─── Import shared components from LoginScreen ────────────────────────────────
// AnimatedInput and BlobBackground are defined in LoginScreen.tsx
// Re-export them from there, or move them to a shared components file.
// For now we assume they are exported from LoginScreen:
// import { AnimatedInput, BlobBackground, LoadingPopup } from "./LoginScreen";


const { width } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigationType = NativeStackNavigationProp<AuthStackParamList>;
type RootNavigationType = NativeStackNavigationProp<RootStackParamList>;

// ─── Validation Helpers ───────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidAadhaar = (v: string) => /^\d{12}$/.test(v.trim());
const isValidMobile = (v: string) => /^\d{10}$/.test(v.trim());

interface FieldError {
  name?: string;
  email?: string;
  address?: string;
  aadhaar?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: string; title: string; sub: string }> = ({
  icon,
  title,
  sub,
}) => (
  <View style={sh.wrapper}>
    <Text style={sh.icon}>{icon}</Text>
    <View>
      <Text style={sh.title}>{title}</Text>
      <Text style={sh.sub}>{sub}</Text>
    </View>
  </View>
);

const sh = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  icon: { fontSize: 28 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutralBlack,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  sub: { fontSize: 12, color: colors.neutralBodyText, marginTop: 1 },
});

// ─── Inline Field Error ───────────────────────────────────────────────────────

const FieldErr: React.FC<{ msg?: string }> = ({ msg }) => {
  if (!msg) return null;
  return <Text style={styles.fieldError}>⚠ {msg}</Text>;
};

// ─── Sign Up Screen ───────────────────────────────────────────────────────────

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationType>();
  const navigationRoot = useNavigation<RootNavigationType>();

  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  // Show confirm only when password has content
  const showConfirmField = password.length > 0;

  // Slide-in animation for confirm password field
  const confirmSlide = useRef(new Animated.Value(0)).current;
  const confirmOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(confirmSlide, {
        toValue: showConfirmField ? 0 : 20,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(confirmOpacity, {
        toValue: showConfirmField ? 1 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showConfirmField]);

  // Card entry animation
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(36)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 550,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 550,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardSlide]);

  // Button scale feedback
  const buttonScale = useRef(new Animated.Value(1)).current;

  const pressButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: FieldError = {};

    if (!name.trim()) errs.name = "Full name is required.";
    else if (name.trim().length < 3) errs.name = "Name must be at least 3 characters.";

    if (!email.trim()) errs.email = "Email is required.";
    else if (!isValidEmail(email)) errs.email = "Enter a valid email address.";

    if (!address.trim()) errs.address = "Address is required.";
    else if (address.trim().length < 10) errs.address = "Please enter a complete address.";

    if (!aadhaar.trim()) errs.aadhaar = "Aadhaar number is required.";
    else if (!isValidAadhaar(aadhaar)) errs.aadhaar = "Aadhaar must be exactly 12 digits.";

    if (!mobile.trim()) errs.mobile = "Mobile number is required.";
    else if (!isValidMobile(mobile)) errs.mobile = "Enter a valid 10-digit mobile number.";

    if (!password) errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters.";

    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSignUp = async () => {
    pressButton();
    dispatch(clearError());

    if (!validate()) return;

    const result = await dispatch(
      registerWithEmail({ name, email, address, aadhaar, mobile, password })
    );

    if (registerWithEmail.fulfilled.match(result)) {
      navigationRoot.navigate(screenNames.MainStack as any);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <BlobBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <View style={styles.logoInner} />
          </View>
          <Text style={styles.brandName}>DWWP</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
          ]}
        >
          {/* ── Section 1: Personal Info ── */}
          <SectionHeader icon="👤" title="Personal Info" sub="Tell us who you are" />

          <AnimatedInput
            placeholder="Full Name"
            value={name}
            onChangeText={(t) => { setName(t); setFieldErrors((e) => ({ ...e, name: undefined })); }}
            delay={80}
          />
          <FieldErr msg={fieldErrors.name} />

          <AnimatedInput
            placeholder="Email Address"
            value={email}
            onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: undefined })); }}
            keyboardType="email-address"
            delay={140}
          />
          <FieldErr msg={fieldErrors.email} />

          <AnimatedInput
            placeholder="Residential Address"
            value={address}
            onChangeText={(t) => { setAddress(t); setFieldErrors((e) => ({ ...e, address: undefined })); }}
            delay={200}
            multiline
          />
          <FieldErr msg={fieldErrors.address} />

          <View style={styles.sectionDivider} />

          {/* ── Section 2: Identity ── */}
          <SectionHeader icon="🪪" title="Identity" sub="For verification purposes" />

          <AnimatedInput
            placeholder="Aadhaar Number (12 digits)"
            value={aadhaar}
            onChangeText={(t) => {
              const digits = t.replace(/\D/g, "").slice(0, 12);
              setAadhaar(digits);
              setFieldErrors((e) => ({ ...e, aadhaar: undefined }));
            }}
            keyboardType="number-pad"
            delay={260}
          />
          <FieldErr msg={fieldErrors.aadhaar} />

          <AnimatedInput
            placeholder="Mobile Number (10 digits)"
            value={mobile}
            onChangeText={(t) => {
              const digits = t.replace(/\D/g, "").slice(0, 10);
              setMobile(digits);
              setFieldErrors((e) => ({ ...e, mobile: undefined }));
            }}
            keyboardType="phone-pad"
            delay={320}
          />
          <FieldErr msg={fieldErrors.mobile} />

          <View style={styles.sectionDivider} />

          {/* ── Section 3: Security ── */}
          <SectionHeader icon="🔒" title="Security" sub="Keep your account safe" />

          <AnimatedInput
            placeholder="Password (min 8 characters)"
            value={password}
            onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: undefined, confirmPassword: undefined })); }}
            secureTextEntry={!showPassword}
            delay={380}
            rightElement={
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            }
          />
          <FieldErr msg={fieldErrors.password} />

          {/* Confirm password — slides in only when password is typed */}
          <Animated.View
            style={{
              opacity: confirmOpacity,
              transform: [{ translateY: confirmSlide }],
              // keep layout space only when visible
              overflow: "hidden",
              maxHeight: showConfirmField ? 80 : 0,
            }}
            pointerEvents={showConfirmField ? "auto" : "none"}
          >
            <AnimatedInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setFieldErrors((e) => ({ ...e, confirmPassword: undefined })); }}
              secureTextEntry={!showConfirm}
              delay={0}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowConfirm((p) => !p)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              }
            />
            <FieldErr msg={fieldErrors.confirmPassword} />
          </Animated.View>

          {/* API error banner */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          {/* Submit */}
          <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 8 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.linkRow}
          >
            <Text style={styles.linkGray}>Already have an account? </Text>
            <Text style={styles.linkPrimary}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <LoadingPopup visible={isLoading} message="Creating your account…" />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 7,
  },
  logoInner: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: colors.white,
    opacity: 0.9,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutralBlack,
    letterSpacing: 4,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  tagline: {
    marginTop: 3,
    fontSize: 13,
    color: colors.neutralBodyText,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 26,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },

  eyeButton: { paddingLeft: 8 },
  eyeIcon: { fontSize: 15 },

  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: "500",
  },

  errorBanner: {
    backgroundColor: "#FFF0EF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "500",
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  linkGray: {
    fontSize: 14,
    color: colors.neutralBodyText,
  },
  linkPrimary: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
});
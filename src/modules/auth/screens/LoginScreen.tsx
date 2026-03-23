import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppDispatch, useAppSelector } from "@dwwp/store/hooks";
import { loginWithEmail } from "../authAction"
import { clearError } from "../authSlice";
import { AuthStackParamList, RootStackParamList } from "@dwwp/utils/types";
import { screenNames } from "@dwwp/utils/screenNames";
import colors from "@dwwp/utils/colors";
import BlobBackground from "../components/BlobBackground";
import AnimatedInput from "../components/AnimatedInput";
import { LoadingPopup } from "../components/LoadingPopup";
import fonts from "@dwwp/utils/fonts";
import { strings } from "@dwwp/utils/strings";
import { localImages } from "@dwwp/utils/localimages";
import { vh } from "@dwwp/utils/dimensions";

// ─── Login Screen ─────────────────────────────────────────────────────────────

type NavigationType = NativeStackNavigationProp<AuthStackParamList>;
type RootNavigationType = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationType>();
  const navigationRoot = useNavigation<RootNavigationType>();

  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Entry animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;

    dispatch(clearError());

    // button press feedback
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const result = await dispatch(loginWithEmail({ email, password }));

    if (loginWithEmail.fulfilled.match(result)) {
      navigationRoot.navigate(screenNames.MainStack as any);
    }
  };

  const handleSkip = () => {
    navigationRoot.navigate(screenNames.MainStack as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <BlobBackground />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <View style={styles.logoMark}>
          <View style={styles.logoInner} />
        </View>
        <Text style={styles.brandName}>{strings.dwwp}</Text>
        <Text style={styles.tagline}>Your wellness, simplified.</Text>
      </Animated.View>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardAnim,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSubtitle}>Sign in to continue</Text>

        <AnimatedInput
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          delay={120}
        />

        <AnimatedInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          delay={220}
          rightElement={
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                source={showPassword ? localImages.view : localImages.hide}
                style={styles.showImage} />
            </TouchableOpacity>
          }
        />

        {/* Error message */}
        {!!error && (
          <Animated.View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </Animated.View>
        )}

        {/* Sign In Button */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: buttonAnim,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, (!email || !password) && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={isLoading || !email || !password}
          >
            <Text style={styles.buttonText}>{strings.signIn}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Footer links */}
        <TouchableOpacity
          onPress={() => navigation.navigate(screenNames.SignUpScreen)}
          style={styles.linkRow}
        >
          <Text style={styles.linkGray}>{strings.dontHaveAccount} </Text>
          <Text style={styles.linkPrimary}>{strings.signUp}</Text>
        </TouchableOpacity>

      </Animated.View>

      <LoadingPopup visible={isLoading} message="Signing you in…" />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_RADIUS = 28;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  // Header
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.white,
    opacity: 0.9,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.neutralBlack,
    letterSpacing: 4,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  tagline: {
    marginTop: 4,
    fontSize: 13,
    color: colors.neutralBodyText,
    letterSpacing: 0.3,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: CARD_RADIUS,
    padding: 28,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutralBlack,
    fontFamily: fonts.Bold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.neutralBodyText,
    marginBottom: 24,
  },

  eyeButton: {
    paddingLeft: 8,
  },
  showImage: {
    height: vh(14),
    width: vh(14),
    tintColor: colors.black
  },

  // Error
  errorBanner: {
    backgroundColor: "#FFF0EF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "500",
  },

  // Button
  buttonWrapper: {
    marginTop: 4,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryDisabled,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.neutralBodyText,
    fontSize: 13,
  },

  // Links
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
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
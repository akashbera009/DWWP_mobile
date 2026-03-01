import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';
import { strings } from '@dwwp/utils/strings';
import { CustomInput } from '@dwwp/components/CustomInput';

// ─── Types ─────────────────────────────────────────────────────────────────

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
  aadhar: string;
  mobile: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  aadhar?: string;
  mobile?: string;
}

// ─── Animated Field ────────────────────────────────────────────────────────

interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  error?: string;
  secureToggle?: boolean;
  isSecure?: boolean;
  onToggleSecure?: () => void;
  icon: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  error,
  secureToggle,
  isSecure,
  onToggleSecure,
  icon,
  onFocus,
  onBlur,
  ...rest
}) => {
  const focused = useSharedValue(0);
  const hasValue = value.length > 0;
  const labelProgress = useSharedValue(hasValue ? 1 : 0);

  const handleFocus = (e: any) => {
    focused.value = withTiming(1, { duration: 200 });
    labelProgress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    focused.value = withTiming(0, { duration: 200 });
    if (!value) {
      labelProgress.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
    }
    onBlur?.(e);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error ?? '#E53E3E'
      : interpolate(focused.value, [0, 1], [0, 1]) === 1
      ? colors.primary ?? '#1A73E8'
      : colors.border ?? '#D1D5DB',
    borderWidth: withTiming(focused.value === 1 ? 1.8 : 1, { duration: 200 }),
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(labelProgress.value, [0, 1], [vh(1.8), -vh(1.2)]),
    fontSize: interpolate(labelProgress.value, [0, 1], [normalize(14), normalize(11)]),
    color: error
      ? colors.error ?? '#E53E3E'
      : colors.textSecondary ?? '#6B7280',
  }));

  return (
    <View style={styles.fieldWrapper}>
      <Animated.View style={[styles.inputContainer, animatedContainerStyle]}>
        {/* Left icon */}
        <Text style={styles.fieldIcon}>{icon}</Text>

        <View style={styles.inputInner}>
          {/* Floating label */}
          <Animated.Text style={[styles.floatingLabel, animatedLabelStyle]}>
            {label}
          </Animated.Text>

          <TextInput
            style={styles.textInput}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="transparent"
            secureTextEntry={isSecure}
            autoCapitalize="none"
            {...rest}
          />
        </View>

        {/* Eye toggle for password fields */}
        {secureToggle && (
          <Pressable onPress={onToggleSecure} style={styles.eyeButton} hitSlop={8}>
            <Text style={styles.eyeIcon}>{isSecure ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Error message */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────

const SignupScreen: React.FC = () => {
  const [form, setForm] = useState<FormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    aadhar: '',
    mobile: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Button press animation
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // ── Refs for focus-next ──────────────────────────────────────────────────
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const aadharRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);

  // ── Field updater ────────────────────────────────────────────────────────
  const update = (field: keyof FormValues) => (val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Email
    if (!form.email.trim()) {
      newErrors.email = strings.errorEmailRequired ?? 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = strings.errorEmailInvalid ?? 'Enter a valid email address';
    }

    // Password
    if (!form.password) {
      newErrors.password = strings.errorPasswordRequired ?? 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = strings.errorPasswordLength ?? 'Minimum 8 characters';
    }

    // Confirm Password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = strings.errorConfirmRequired ?? 'Please re-enter your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = strings.errorPasswordMismatch ?? 'Passwords do not match';
    }

    // Aadhar — 12 digits
    if (!form.aadhar.trim()) {
      newErrors.aadhar = strings.errorAadharRequired ?? 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(form.aadhar.replace(/\s/g, ''))) {
      newErrors.aadhar = strings.errorAadharInvalid ?? 'Enter a valid 12-digit Aadhar number';
    }

    // Mobile — 10 digits
    if (!form.mobile.trim()) {
      newErrors.mobile = strings.errorMobileRequired ?? 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = strings.errorMobileInvalid ?? 'Enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });

    if (!validate()) return;
    setSubmitted(true);
    // TODO: wire up to your auth/API call
    console.log('Form submitted:', form);
  };

  // ── Aadhar formatter (adds space every 4 digits) ─────────────────────────
  const formatAadhar = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>💧</Text>
          </View>
          <Text style={styles.title}>{strings.signupTitle ?? 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {strings.signupSubtitle ?? 'Register to manage your water usage'}
          </Text>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>

          <FloatingInput
            label={strings.labelEmail ?? 'Email Address'}
            value={form.email}
            onChangeText={update('email')}
            error={errors.email}
            icon="✉️"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <FloatingInput
            label={strings.labelPassword ?? 'Password'}
            value={form.password}
            onChangeText={update('password')}
            error={errors.password}
            icon="🔒"
            secureToggle
            isSecure={!showPassword}
            onToggleSecure={() => setShowPassword((v) => !v)}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            ref={passwordRef}
          />

          <FloatingInput
            label={strings.labelConfirmPassword ?? 'Re-enter Password'}
            value={form.confirmPassword}
            onChangeText={update('confirmPassword')}
            error={errors.confirmPassword}
            icon="🔒"
            secureToggle
            isSecure={!showConfirm}
            onToggleSecure={() => setShowConfirm((v) => !v)}
            returnKeyType="next"
            onSubmitEditing={() => aadharRef.current?.focus()}
            ref={confirmRef}
          />

          <CustomInput
            label={strings.labelAadhar ?? 'Aadhar Number'}
            value={form.aadhar}
            onChangeText={(val) => update('aadhar')(formatAadhar(val))}
            error={errors.aadhar}
            icon="🪪"
            keyboardType="numeric"
            maxLength={14} // 12 digits + 2 spaces
            returnKeyType="next"
            onSubmitEditing={() => mobileRef.current?.focus()}
            ref={aadharRef}
          />

          <FloatingInput
            label={strings.labelMobile ?? 'Mobile Number'}
            value={form.mobile}
            onChangeText={(val) => update('mobile')(val.replace(/\D/g, '').slice(0, 10))}
            error={errors.mobile}
            icon="📱"
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            ref={mobileRef}
          />

          {/* ── Password strength hint ── */}
          {form.password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        form.password.length >= i * 3
                          ? i <= 1
                            ? '#E53E3E'
                            : i <= 2
                            ? '#ED8936'
                            : i <= 3
                            ? '#ECC94B'
                            : '#48BB78'
                          : colors.border ?? '#E5E7EB',
                    },
                  ]}
                />
              ))}
              <Text style={styles.strengthLabel}>
                {form.password.length < 4
                  ? (strings.strengthWeak ?? 'Weak')
                  : form.password.length < 7
                  ? (strings.strengthFair ?? 'Fair')
                  : form.password.length < 10
                  ? (strings.strengthGood ?? 'Good')
                  : (strings.strengthStrong ?? 'Strong')}
              </Text>
            </View>
          )}

          {/* ── Submit ── */}
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={[styles.submitButton, submitted && styles.submitButtonDone]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
                {submitted
                  ? (strings.signupSuccess ?? '✓ Registered!')
                  : (strings.signupButton ?? 'Create Account')}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Footer link ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {strings.alreadyHaveAccount ?? 'Already have an account? '}
            </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{strings.loginLink ?? 'Log In'}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background ?? '#F0F4FF',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: vh(4),
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: vh(6),
    paddingBottom: vh(3),
    paddingHorizontal: vw(6),
  },
  logoMark: {
    width: vw(18),
    height: vw(18),
    borderRadius: vw(9),
    backgroundColor: colors.primary ?? '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vh(2),
    shadowColor: colors.primary ?? '#1A73E8',
    shadowOffset: { width: 0, height: vh(1) },
    shadowOpacity: 0.35,
    shadowRadius: normalize(12),
    elevation: 6,
  },
  logoIcon: {
    fontSize: normalize(28),
  },
  title: {
    fontFamily: fonts.bold ?? 'System',
    fontSize: normalize(26),
    color: colors.textPrimary ?? '#111827',
    letterSpacing: -0.5,
    marginBottom: vh(0.6),
  },
  subtitle: {
    fontFamily: fonts.regular ?? 'System',
    fontSize: normalize(13),
    color: colors.textSecondary ?? '#6B7280',
    textAlign: 'center',
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: vw(5),
    backgroundColor: colors.surface ?? '#FFFFFF',
    borderRadius: normalize(20),
    paddingHorizontal: vw(5),
    paddingTop: vh(3),
    paddingBottom: vh(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vh(0.5) },
    shadowOpacity: 0.08,
    shadowRadius: normalize(16),
    elevation: 4,
  },

  // ── Field ─────────────────────────────────────────────────────────────────
  fieldWrapper: {
    marginBottom: vh(2.4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border ?? '#D1D5DB',
    borderRadius: normalize(12),
    backgroundColor: colors.inputBackground ?? '#F9FAFB',
    paddingHorizontal: vw(3),
    height: vh(7),
  },
  fieldIcon: {
    fontSize: normalize(16),
    marginRight: vw(2),
  },
  inputInner: {
    flex: 1,
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontFamily: fonts.regular ?? 'System',
    backgroundColor: 'transparent',
    color: colors.textSecondary ?? '#6B7280',
    zIndex: 1,
  },
  textInput: {
    fontFamily: fonts.regular ?? 'System',
    fontSize: normalize(14),
    color: colors.textPrimary ?? '#111827',
    paddingTop: vh(1.5),
    paddingBottom: 0,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: vw(2),
  },
  eyeIcon: {
    fontSize: normalize(16),
  },
  errorText: {
    fontFamily: fonts.regular ?? 'System',
    fontSize: normalize(11),
    color: colors.error ?? '#E53E3E',
    marginTop: vh(0.5),
    marginLeft: vw(1),
  },

  // ── Strength bar ──────────────────────────────────────────────────────────
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(2),
    gap: vw(1.5),
  },
  strengthBar: {
    flex: 1,
    height: vh(0.5),
    borderRadius: 4,
  },
  strengthLabel: {
    fontFamily: fonts.regular ?? 'System',
    fontSize: normalize(11),
    color: colors.textSecondary ?? '#6B7280',
    marginLeft: vw(1),
    width: vw(12),
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitButton: {
    backgroundColor: colors.primary ?? '#1A73E8',
    borderRadius: normalize(14),
    height: vh(6.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh(1),
    shadowColor: colors.primary ?? '#1A73E8',
    shadowOffset: { width: 0, height: vh(0.6) },
    shadowOpacity: 0.4,
    shadowRadius: normalize(10),
    elevation: 5,
  },
  submitButtonDone: {
    backgroundColor: colors.success ?? '#48BB78',
    shadowColor: colors.success ?? '#48BB78',
  },
  submitText: {
    fontFamily: fonts.semiBold ?? 'System',
    fontSize: normalize(15),
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vh(2.5),
  },
  footerText: {
    fontFamily: fonts.regular ?? 'System',
    fontSize: normalize(13),
    color: colors.textSecondary ?? '#6B7280',
  },
  footerLink: {
    fontFamily: fonts.semiBold ?? 'System',
    fontSize: normalize(13),
    color: colors.primary ?? '#1A73E8',
  },
});
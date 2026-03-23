import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Image,
  ActivityIndicator,
} from 'react-native';
//Custom Imports
import colors from '@dwwp/utils/colors';
import fonts from '@dwwp/utils/fonts';
import { strings } from '@dwwp/utils/strings';
import { normalize, vh, vw, isTablet } from '@dwwp/utils/dimensions';
import { localImages } from '@dwwp/utils/localImages';

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  showVerifyButton?: boolean;
  onVerifyPress?: () => void;
  verifyButtonText?: string;
  verifyButtonLoading?: boolean;
  isVerified?: boolean;
  onVerificationReset?: () => void;
  onVerificationSuccess?: () => void;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send' | 'default';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export const CustomInput = forwardRef<TextInput, CustomInputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      keyboardType = 'default',
      autoCapitalize = 'none',
      error,
      required = false,
      disabled = false,
      multiline = false,
      numberOfLines = 1,
      style,
      inputStyle,
      labelStyle,
      showVerifyButton = false,
      onVerifyPress,
      verifyButtonText = strings.verify,
      verifyButtonLoading = false,
      isVerified = false,
      onVerificationReset,
      onVerificationSuccess,
      maxLength,
      onFocus,
      onBlur,
      returnKeyType = 'default',
      onSubmitEditing,
      autoFocus = false,
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [verifiedValue, setVerifiedValue] = useState<string>('');

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    // Handle text change and reset verification if value changes from verified value
    const handleTextChange = (text: string) => {
      onChangeText(text);

      // If field was verified and user is editing, reset verification
      if (
        isVerified &&
        verifiedValue &&
        text !== verifiedValue &&
        onVerificationReset
      ) {
        onVerificationReset();
      }
    };

    // Track when verification succeeds
    React.useEffect(() => {
      if (isVerified && value) {
        setVerifiedValue(value);
        // Call success callback to handle focus management
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      }
    }, [isVerified, value, onVerificationSuccess]);

    const inputContainerStyle = [
      styles.inputContainer,
      isFocused && styles.focusedInput,
      error && styles.errorInput,
      disabled && styles.disabledInput,
      style,
    ];

    const textInputStyle = [
      styles.textInput,
      multiline && styles.multilineInput,
      disabled && styles.disabledText,
      inputStyle,
    ];

    const labelTextStyle = [styles.label, labelStyle];

    return (
      <View style={styles.container}>
        {label && (
          <Text style={labelTextStyle}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <View style={inputContainerStyle}>
          <TextInput
            ref={ref}
            style={textInputStyle}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            value={value}
            onChangeText={handleTextChange}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            maxLength={maxLength ?? undefined}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoFocus={autoFocus}
          />
          {showVerifyButton && !isVerified && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={onVerifyPress}
              disabled={disabled || verifyButtonLoading}
            >
              {verifyButtonLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.loadingIndicator}
                />
              ) : (
                <Text style={styles.verifyButtonText}>{verifyButtonText}</Text>
              )}
            </TouchableOpacity>
          )}
          {isVerified && (
            <View style={styles.verifiedIcon}>
              <Image
                source={localImages.verified}
                style={styles.verifiedIconImage}
              />
            </View>
          )}
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={togglePasswordVisibility}
              disabled={disabled}
            >
              <Image
                style={styles.eyeIconText}
                source={
                  isPasswordVisible ? localImages.eye : localImages.eyeSlash
                }
              />
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: isTablet ? vh(20) : vh(16),
  },
  label: {
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    marginBottom: vh(6),
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: vw(14),
    paddingHorizontal: vw(16),
    minHeight: vh(48),
  },
  textInput: {
    flex: 1,
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    color: colors.neutralBlack,
    paddingVertical: vh(12),
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: vh(80),
  },
  verifyButton: {
    paddingHorizontal: vw(12),
    paddingVertical: vh(6),
    borderRadius: vw(4),
    marginLeft: vw(8),
  },
  verifyButtonText: {
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    color: colors.primary,
  },
  loadingIndicator: {
    marginHorizontal: vw(4),
  },
  verifiedIcon: {
    padding: vw(8),
    marginLeft: vw(8),
  },
  verifiedIconImage: {
    width: vw(18),
    height: vw(18),
  },
  eyeIcon: {
    padding: vw(8),
    marginLeft: vw(8),
  },
  eyeIconText: {
    width: vw(18),
    height: vw(18),
  },
  focusedInput: {
    borderColor: colors.black,
    borderWidth: normalize(1),
  },
  errorInput: {
    borderColor: colors.error,
    borderWidth: normalize(1),
  },
  disabledInput: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBorder,
  },
  disabledText: {
    color: colors.disabledText,
  },
  errorText: {
    fontSize: normalize(12),
    fontFamily: fonts.Regular,
    color: colors.error,
    marginTop: vh(4),
  },
});
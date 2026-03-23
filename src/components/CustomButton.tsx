import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  // Vibration,
  Pressable,
} from 'react-native';
//Custom Imports
import colors from '../utils/colors';
import fonts from '../utils/fonts';
import { normalize, isTablet, vh } from '@dwwp/utils/dimensions';
import {
  Ionicons,
  IoniconsIconName,
} from '@react-native-vector-icons/ionicons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconName?: IoniconsIconName ;
  showIcon?: boolean;
  iconColor?: string;
  iconSize?: number;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  showIcon,
  iconName,
  iconSize = 20,
  iconColor,
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    size === 'small' && styles.small,
    size === 'medium' && styles.medium,
    size === 'large' && styles.large,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    size === 'small' && styles.smallText,
    size === 'medium' && styles.mediumText,
    size === 'large' && styles.largeText,
    disabled && styles.disabledText,
    textStyle,
  ];

  const handlePress = () => {
    // Add subtle vibration feedback
    // Vibration.vibrate(50); // 50ms vibration
    onPress();
  };

  return (
    <Pressable
      style={disabled ? [buttonStyle, styles.disabled] : buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      {showIcon && iconName && (
        <Ionicons
          name={iconName}
          size={normalize(iconSize)}
          color={iconColor}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical : vh(8)
  },
  text: {
    fontFamily: fonts.Medium,
    textAlign: 'center',
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: normalize(1),
    borderColor: colors.primary,
  },

  // Sizes
  small: {
    paddingVertical: isTablet ? normalize(12) : normalize(8),
    paddingHorizontal: isTablet ? normalize(20) : normalize(16),
    minHeight: isTablet ? normalize(44) : normalize(36),
  },
  medium: {
    paddingVertical: isTablet ? normalize(16) : normalize(12),
    paddingHorizontal: isTablet ? normalize(28) : normalize(24),
    minHeight: isTablet ? normalize(56) : normalize(48),
  },
  large: {
    paddingVertical: isTablet ? normalize(20) : normalize(16),
    paddingHorizontal: isTablet ? normalize(36) : normalize(32),
    minHeight: isTablet ? normalize(64) : normalize(56),
  },

  // Text styles for variants
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },

  // Text styles for sizes
  smallText: {
    fontSize: normalize(14),
  },
  mediumText: {
    fontSize: normalize(16),
  },
  largeText: {
    fontSize: normalize(18),
  },

  // Disabled styles
  disabled: {
    backgroundColor: colors.primaryDisabled,
    opacity: 0.5,
  },
  disabledText: {
    color: colors.white,
    opacity: 0.5,
  },
});
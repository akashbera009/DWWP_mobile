import React from 'react';
import {
  Text,
  Animated,
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
//Custom Imports
import colors from '@dwwp/utils/colors';
import fonts from '@dwwp/utils/fonts';
import { normalize, vw } from '@dwwp/utils/dimensions';
import { localImages } from '@dwwp/utils/localimages';

interface ToastProps {
  message: string;
  duration?: number;
  backgroundColor?: string;
  textColor?: string;
  icon?: 'tick' | 'error' | 'warning' | 'info';
  position?: 'top' | 'bottom';
}

interface IconData {
  type: 'image' | 'symbol';
  image?: ImageSourcePropType;
  symbol?: string;
  backgroundColor?: string;
  size?: number;
}

const getIconData = (iconType?: string): IconData => {
  switch (iconType) {
    case 'tick':
      return {
        type: 'image',
        image: localImages.tick,
        backgroundColor: colors.successIconBackground,
        size: normalize(10),
      };
    case 'error':
      return {
        type: 'symbol',
        symbol: '✕',
        backgroundColor: colors.error,
        size: normalize(10),
      };
    case 'warning':
      return {
        type: 'symbol',
        symbol: '⚠',
        backgroundColor: colors.warning,
        size: normalize(10),
      };
    case 'info':
      return {
        type: 'symbol',
        symbol: 'i',
        backgroundColor: colors.info,
        size: normalize(10),
      };
    default:
      return {
        type: 'symbol',
        symbol: 'i',
        backgroundColor: colors.info,
        size: normalize(10),
      };
  }
};

class CustomToast {
  private static animatedValue = new Animated.Value(100);
  private static isVisible = false;
  private static timeoutId: ReturnType<typeof setTimeout> | null = null;
  private static currentMessage: string = '';
  private static currentBackgroundColor: string = colors.black;
  private static currentTextColor: string = colors.white;
  private static currentIcon: string = 'info';
  private static currentPosition: 'top' | 'bottom' = 'top';

  static show({
    message,
    duration = 2000,
    backgroundColor = colors.black,
    textColor = colors.white,
    icon = 'info',
    position = 'top',
  }: ToastProps) {
    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set the new message, colors, and position immediately
    this.currentMessage = message;
    this.currentBackgroundColor = backgroundColor;
    this.currentTextColor = textColor;
    this.currentIcon = icon;
    this.currentPosition = position;

    // Reset animation value based on position
    const startValue = position === 'top' ? -100 : 100;
    if (!this.isVisible) {
      this.animatedValue.setValue(startValue);
    }

    this.isVisible = true;

    // Show animation
    Animated.spring(this.animatedValue, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Hide animation
    this.timeoutId = setTimeout(() => {
      const endValue = position === 'top' ? -150 : 150;
      Animated.timing(this.animatedValue, {
        toValue: endValue,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        this.isVisible = false;
        this.currentMessage = '';
        this.currentBackgroundColor = colors.black;
        this.currentTextColor = colors.white;
        this.currentIcon = 'info';
        this.currentPosition = 'top';
      });
    }, duration);
  }

  static getToast() {
    // Create the toast element dynamically each time it's requested
    if (!this.isVisible || !this.currentMessage) {
      return null;
    }

    const iconData = getIconData(this.currentIcon);
    const isTop = this.currentPosition === 'top';

    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: this.currentBackgroundColor,
            top: isTop ? normalize(50) : undefined,
            bottom: isTop ? undefined : normalize(100),
            borderColor:
              iconData.type === 'image' ? colors.successToastBorder : undefined,
          },
          { transform: [{ translateY: this.animatedValue }] },
        ]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconData.backgroundColor },
            ]}
          >
            {iconData.type === 'image' ? (
              iconData.image && (
                <Image
                  source={iconData.image}
                  style={[
                    styles.iconImage,
                    { width: iconData.size, height: iconData.size },
                  ]}
                  resizeMode="contain"
                />
              )
            ) : (
              <Text
                style={[
                  styles.iconSymbol,
                  {
                    fontSize: iconData.size,
                  },
                ]}
              >
                {iconData.symbol}
              </Text>
            )}
          </View>
          <Text
            numberOfLines={2}
            style={[styles.text, { color: this.currentTextColor }]}
          >
            {this.currentMessage}
          </Text>
        </View>
      </Animated.View>
    );
  }

  static isToastVisible() {
    return this.isVisible;
  }

  static getCurrentMessage() {
    return this.currentMessage;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: normalize(16),
    right: normalize(16),
    padding: normalize(16),
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
    borderRadius: normalize(12),
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    tintColor: colors.white,
    width: normalize(10),
    height: normalize(10),
  },
  iconSymbol: {
    color: colors.white,
    fontFamily: fonts.Regular,
    fontWeight: 'bold',
  },
  text: {
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    flex: 1,
    marginLeft: vw(16),
  },
});

export default CustomToast;
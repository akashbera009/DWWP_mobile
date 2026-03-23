import { Dimensions, PixelRatio, Platform } from 'react-native';

export const DesignWidth = 375;
export const DesignHeight = 812;
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

// Enhanced tablet detection
export const isTablet = (() => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;

  // iPad detection based on screen size and aspect ratio
  if (Platform.OS === 'ios') {
    // iPad Pro 11" (2388x1668), iPad Pro 12.9" (2732x2048), iPad Air (2360x1640), iPad (2160x1620)
    return width >= 768 || (width >= 600 && height >= 960) || aspectRatio < 1.3;
  }

  // Android tablet detection
  return width >= 768 || (width >= 600 && height >= 960);
})();

// Calculate proper scale factor for different devices
const getScaleFactor = () => {
  if (isTablet) {
    // For tablets, use a more conservative scaling approach
    // Limit maximum scale to prevent oversized elements
    const baseScale = Math.min(screenWidth / DesignWidth, 1.5);
    return Math.max(baseScale, 0.8); // Minimum scale of 0.8
  }

  // For phones, use standard scaling
  return screenWidth / DesignWidth;
};

const scale = getScaleFactor();

export function normalize(size: number) {
  const scaledSize = size * scale;

  // Apply pixel ratio rounding for crisp rendering
  return PixelRatio.roundToNearestPixel(scaledSize);
}

// Enhanced viewport width calculation
export const vw = (width: number) => {
  if (isTablet) {
    // For tablets, limit the maximum width to prevent oversized elements
    const maxWidth = Math.min(screenWidth * 0.7, 600); // Max 70% of screen or 600px
    const calculatedWidth = (width / DesignWidth) * screenWidth;
    return PixelRatio.roundToNearestPixel(Math.min(calculatedWidth, maxWidth));
  }

  // For phones, use standard calculation
  const percent = (width / DesignWidth) * 100;
  const elemWidth = parseFloat(percent + '%');
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

// Enhanced viewport height calculation
export const vh = (height: number) => {
  if (isTablet) {
    // For tablets, apply more conservative height scaling
    const calculatedHeight = (height / DesignHeight) * screenHeight;
    const maxHeight = Math.min(calculatedHeight, height * 1.3); // Max 30% increase
    return PixelRatio.roundToNearestPixel(maxHeight);
  }

  // For phones, use standard calculation
  const percent = (height / DesignHeight) * 100;
  const elemHeight = parseFloat(percent + '%');
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

// Responsive width calculation for tablets
export const responsiveWidth = (width: number) => {
  if (isTablet) {
    const maxWidth = Math.min(screenWidth * 0.6, 500);
    return Math.min(vw(width), maxWidth);
  }
  return vw(width);
};

// Responsive height calculation for tablets
export const responsiveHeight = (height: number) => {
  if (isTablet) {
    return Math.max(vh(height), height * 1.2);
  }
  return vh(height);
};

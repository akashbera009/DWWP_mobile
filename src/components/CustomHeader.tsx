import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
//Custom Imports
import colors from '@dwwp/utils/colors';
import fonts from '@dwwp/utils/fonts';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import { localImages } from '@dwwp/utils/localimages';

interface CustomHeaderProps {
  title: string;
  subTitle: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  backButtonStyle?: ViewStyle;
  rightIcon?: ImageSourcePropType;
  onPressRightIcon?: () => void;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  subTitle,
  onBackPress,
  showBackButton = true,
  containerStyle,
  titleStyle,
  backButtonStyle,
  rightIcon,
  onPressRightIcon,
}) => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        containerStyle
          ? containerStyle
          : [styles.container, { paddingTop: top }],
      ]}
    >
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity
            style={[styles.backButton, backButtonStyle]}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={10}
          >
            <Image
              source={localImages.backArrow}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
        </View>
        {showBackButton && <View style={styles.placeholder} />}
        {rightIcon && (
          <TouchableOpacity
            style={[styles.backButton, backButtonStyle]}
            onPress={onPressRightIcon}
            activeOpacity={0.7}
            hitSlop={10}
          >
            <Image
              source={rightIcon}
              style={styles.rightIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: vw(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: vh(44),
  },
  backButton: {
    width: vw(44),
    height: vh(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: vw(16),
    height: vh(12),
    resizeMode: 'contain',
  },
  title: {
    fontSize: normalize(16),
    fontFamily: fonts.Medium,
    color: colors.neutralBlack,
    textAlign: 'left',
  },
  subTitle: {
    fontSize: normalize(12),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    textAlign: 'left',
  },
  placeholder: {
    width: vw(44),
  },
  rightIcon: {
    width: vw(20),
    height: vh(20),
    resizeMode: 'contain',
  },
});
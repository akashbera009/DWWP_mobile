import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import colors from '@dwwp/utils/colors';
import fonts from '@dwwp/utils/fonts';

interface LoadingPopupProps {
  visible: boolean;
  message?: string;
}

export const LoadingPopup: React.FC<LoadingPopupProps> = ({
  visible,
  message = "Signing you in…",
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const pulse = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 380,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 380,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );

      pulse(dot1, 0).start();
      pulse(dot2, 160).start();
      pulse(dot3, 320).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }
  }, [visible]);

  const dotStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={ls.overlay}>
        <Animated.View
          style={[
            ls.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <View style={ls.dotsRow}>
            {[dot1, dot2, dot3].map((d, i) => (
              <Animated.View key={i} style={[ls.dot, dotStyle(d)]} />
            ))}
          </View>
          <Text style={ls.loadingMessage}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const ls = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.transparentBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    minWidth: 200,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  loadingMessage: {
    fontFamily: fonts.SemiBold,
    fontSize: 15,
    color: colors.neutralBlack,
    letterSpacing: 0.2,
  },
});

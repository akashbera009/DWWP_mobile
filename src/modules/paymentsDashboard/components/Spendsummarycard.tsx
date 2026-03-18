import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';

interface Props {
  totalSpent: number;
  totalUsage: number;
  pendingAmount: number;
}

const SpendSummaryCard: React.FC<Props> = ({ totalSpent, totalUsage, pendingAmount }) => {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 100 }),
      Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim,glowAnim]);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }], opacity: glowAnim }]}>
      {/* Decorative circle */}
      <View style={styles.decorCircle} />
      <View style={styles.decorCircle2} />

      <Text style={styles.cardLabel}>This Month's Overview</Text>

      <View style={styles.mainRow}>
        <View>
          <Text style={styles.spentLabel}>Total Spent</Text>
          <Text style={styles.spentAmount}>₹ {totalSpent.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{totalUsage} L</Text>
          <Text style={styles.statLabel}>Water Used</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: colors.warning }]}>₹{pendingAmount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Usage bar */}
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${Math.min((totalUsage / 500) * 100, 100)}%`],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.barLabel}>{totalUsage}/500 L monthly limit</Text>
      </View>
    </Animated.View>
  );
};

export default SpendSummaryCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: vw(16),
    marginBottom: vh(4),
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: vw(20),
    overflow: 'hidden',
    elevation: 12,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  decorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    top: -30,
    right: -20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(50,194,202,0.08)',
    bottom: 10,
    left: 20,
  },
  cardLabel: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: colors.neutralBodyText,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: vh(12),
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(16),
    marginBottom: vh(16),
  },
  spentLabel: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: colors.neutralBodyText,
  },
  spentAmount: {
    fontFamily: fonts.Bold,
    fontSize: normalize(28),
    color: colors.neutralBlack,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: vw(4),
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.Bold,
    fontSize: normalize(16),
    color: colors.primary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.neutralBodyText,
    marginTop: 2,
  },
  barContainer: {
    gap: vh(6),
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inputBackground,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  barLabel: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.neutralBodyText,
  },
});
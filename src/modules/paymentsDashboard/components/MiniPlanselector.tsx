import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';
import { showWarningSnackbar } from '@dwwp/utils/showSnackBar';
import { strings } from '@dwwp/utils/strings';
import fonts from '@dwwp/utils/fonts';
import { PLANS } from '../mocks/planData';

export interface Plan {
  id: string;
  name: string;
  price: number;
  volume: number;
  description: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface PlanSelectorProps {
  onSelect?: (plan: Plan) => void;
  defaultSelected?: string;
}

const PlanCard: React.FC<{
  plan: Plan;
  selected: boolean;
  onPress: () => void;
}> = ({ plan, selected, onPress }) => {
  const progress = useSharedValue(selected ? 1 : 0);
  const [qty, setQty] = useState<number>(1);

  React.useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, { damping: 16, stiffness: 120 });
  }, [selected]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], ['#E5E7EB', colors.primary]),
    borderWidth: withTiming(progress.value > 0.5 ? 2 : 1, { duration: 200 }),
    transform: [{ translateY: withSpring(progress.value > 0.5 ? -6 : 0, { damping: 16 }) }],
    shadowOpacity: withTiming(progress.value > 0.5 ? 0.18 : 0.05, { duration: 200 }),
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#FFFFFF', 'rgba(43,101,104,0.04)']),
  }));

  const increment = () =>
    setQty((q) => {
      if (q < 10) return q + 1;
      showWarningSnackbar(strings.maxLimitReached);
      return q;
    });

  const decrement = () =>
    setQty((q) => {
      if (q > 1) return q - 1;
      showWarningSnackbar(strings.minLimitReached);
      return q;
    });

  const totalPrice = plan.price * qty;
  const totalVolume = plan.volume * qty;

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
      <Animated.View style={[styles.card, animatedCardStyle]}>

        {/* Header */}
        <Animated.View style={[styles.cardHeader, animatedHeaderStyle]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
              <Text style={styles.iconText}>{plan.icon}</Text>
            </View>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planVolume}>{plan.volume}L per pack</Text>
            </View>
          </View>

          {/* Badge + Checkbox */}
          <View style={styles.headerRight}>
            {plan.badge && (
              <View style={[styles.badge, { borderColor: plan.badgeColor ?? '#16a34a' }]}>
                <View style={[styles.badgeDot, { backgroundColor: plan.badgeColor ?? '#16a34a' }]} />
                <Text style={[styles.badgeText, { color: plan.badgeColor ?? '#16a34a' }]}>
                  {plan.badge}
                </Text>
              </View>
            )}
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </View>
        </Animated.View>

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLarge}>₹{plan.price}</Text>
            <Text style={styles.priceUnit}> / pack</Text>
          </View>

          <Text style={styles.description}>{plan.description}</Text>

          {selected && (
            <Animated.View>
              {/* Qty control */}
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={decrement}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.qtyDisplay}>
                  <Text style={styles.qtyText}>{qty}</Text>
                </View>
                <TouchableOpacity style={styles.qtyBtn} onPress={increment}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={styles.totalRight}>
                  <Text style={styles.totalVolume}>{totalVolume} L</Text>
                  <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                </View>
              </View>

              {/* Add button */}
              <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
                <Text style={styles.addButtonText}>Add to Cart  •  ₹{totalPrice}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const PlanSelector: React.FC<PlanSelectorProps> = ({
  onSelect,
  defaultSelected = 'premium',
}) => {
  const [selectedId, setSelectedId] = useState<string>(defaultSelected);

  const handleSelect = (plan: Plan) => {
    setSelectedId(plan.id);
    onSelect?.(plan);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>{strings.planSelectorHeading}</Text>
      <Text style={styles.subHeading}>Purchase additional water packs</Text>
      {PLANS.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          selected={selectedId === plan.id}
          onPress={() => handleSelect(plan)}
        />
      ))}
    </View>
  );
};

export default PlanSelector;

const styles = StyleSheet.create({
  root: {
    marginHorizontal: vw(16),
    marginTop: vh(16),
    gap: 12,
  },
  heading: {
    fontSize: normalize(16),
    fontFamily: fonts.Bold,
    color: colors.primary,
    letterSpacing: -0.2,
  },
  subHeading: {
    fontSize: normalize(12),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    marginTop: -4,
    marginBottom: vh(4),
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(16),
    paddingVertical: vh(14),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  iconBoxSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  iconText: {
    fontSize: 18,
  },
  planName: {
    fontSize: normalize(15),
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
    letterSpacing: -0.2,
  },
  planVolume: {
    fontSize: normalize(11),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: vw(8),
    paddingVertical: vh(3),
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: normalize(10),
    fontFamily: fonts.Bold,
  },
  cardBody: {
    paddingHorizontal: vw(16),
    paddingTop: vh(4),
    paddingBottom: vh(16),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: vh(4),
  },
  priceLarge: {
    fontSize: normalize(34),
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
    letterSpacing: -1,
  },
  priceUnit: {
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
  },
  description: {
    fontSize: normalize(13),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    lineHeight: 20,
    marginBottom: vh(4),
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vw(12),
    marginTop: vh(12),
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  qtyBtnText: {
    fontSize: 22,
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
  },
  qtyDisplay: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vh(6),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.lightGray,
  },
  qtyText: {
    fontSize: normalize(18),
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
  },
  totalRow: {
    marginTop: vh(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: vw(4),
  },
  totalLabel: {
    fontSize: normalize(13),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
  },
  totalRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
  },
  totalVolume: {
    fontSize: normalize(13),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
  },
  totalPrice: {
    fontSize: normalize(15),
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
  },
  addButton: {
    marginTop: vh(14),
    paddingVertical: vh(14),
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  addButtonText: {
    color: colors.white,
    fontFamily: fonts.Bold,
    fontSize: normalize(15),
    letterSpacing: 0.2,
  },
});
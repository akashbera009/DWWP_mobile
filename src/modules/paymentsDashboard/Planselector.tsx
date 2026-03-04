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
} from 'react-native-reanimated';
import { PLANS } from './planData';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';
import { showWarningSnackbar } from '@dwwp/utils/showSnackBar';
import { strings } from '@dwwp/utils/strings';
import fonts from '@dwwp/utils/fonts';

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
    progress.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? colors.primary : '#E5E7EB',
    borderWidth: progress.value > 0.5 ? 1.8 : 1,
    shadowOpacity: progress.value > 0.5 ? 0.25 : 0.08,
    transform: [{ translateY: withTiming(progress.value > 0.5 ? -4 : 0, { duration: 220 }) }],
  }));

  const animatedBodyStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? colors.primary : '#E5E7EB',
    borderTopWidth: 1,
  }));

  const increment = () => setQty((q) => {
    if (q < 10)
      return q + 1
    else {
      showWarningSnackbar(strings.maxLimitReached);
      return q
    }
  });
  const decrement = () => setQty((q) => {
    if (q > 1)
      return q - 1
    else {
      showWarningSnackbar(strings.minLimitReached);
      return q
    }
  })

  const totalPrice = plan.price * qty;
  const totalVolume = plan.volume * qty;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Animated.View style={[styles.card, animatedCardStyle]}>

        {/* ── Header row ── */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{plan.icon}</Text>
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.smallMuted}>{plan.volume}{strings.lWater}</Text>
          </View>

          {/* Checkbox */}
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>

        {/* ── Body ── */}
        <Animated.View style={[styles.cardBody, animatedBodyStyle]}>
          {/* Badge */}
          {plan.badge && (
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { borderColor: plan.badgeColor ?? '#16a34a' }]}>
                <View style={[styles.badgeDot, { backgroundColor: plan.badgeColor ?? '#16a34a' }]} />
                <Text style={[styles.badgeText, { color: plan.badgeColor ?? '#16a34a' }]}>
                  {plan.badge}
                </Text>
              </View>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLarge}>₹{plan.price}</Text>
            <Text style={styles.priceUnit}> {strings.perPack}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{plan.description}</Text>

          {selected && (
            <>
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

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{strings.total}</Text>
                <Text style={styles.totalValue}>{totalVolume}L • ₹{totalPrice}</Text>
              </View>

              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>{strings.add} ₹ {totalPrice}</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const PlanSelector: React.FC<PlanSelectorProps> = ({
  onSelect,
  defaultSelected = 'premium',
}) => {
  const [selectedId, setSelectedId] = useState<string>(defaultSelected);

  const handleSelect = (plan: Plan) => {
    setSelectedId(plan.id);
    onSelect?.(plan);
  };

  return (<>
    <Text style={styles.heading}>{strings.planSelectorHeading}</Text>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {PLANS.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          selected={selectedId === plan.id}
          onPress={() => handleSelect(plan)}
        />
      ))}
    </ScrollView>
  </>
  );
};

export default PlanSelector;


const styles = StyleSheet.create({
  root: {
    flex: 1,
    // backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: normalize(20),
    fontFamily: fonts.Bold,
    color: colors.primary,
    marginHorizontal: vw(16),
  },
  content: {
    padding: 16,
    gap: 12,
  },

  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 10
  },

  // ── Header ────────────────────────────────────────────────────────────────
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  iconText: {
    fontSize: 16,
    color: '#374151',
  },
  planName: {
    fontSize: normalize(16),
    fontFamily: fonts.Bold,
    color: colors.primary,
    letterSpacing: -0.2,
  },
  smallMuted: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fonts.Regular,
  },

  // ── Checkbox ──────────────────────────────────────────────────────────────
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
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
    lineHeight: 15,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  // ── Badge ─────────────────────────────────────────────────────────────────
  badgeRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
    position: 'absolute',
    right: vw(18),
    top: vh(10)
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Price ─────────────────────────────────────────────────────────────────
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLarge: {
    fontSize: normalize(40),
    fontFamily: fonts.Medium,
    color: colors.darkGrey,
    letterSpacing: -1,
  },
  priceUnit: {
    fontSize: 15,
    fontFamily: fonts.Medium,
    color: colors.primaryDisabled
  },

  // ── Description ───────────────────────────────────────────────────────────
  description: {
    fontSize: normalize(13),
    color: colors.secondary,
    fontFamily: fonts.Regular,
    lineHeight: 20,
  },
  qtyRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  qtyBtnText: {
    fontSize: 22,
    fontWeight: '700',
  },
  qtyDisplay: {
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
  },

  totalRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    marginHorizontal: vw(4),
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  addButton: {
    marginTop: 12,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
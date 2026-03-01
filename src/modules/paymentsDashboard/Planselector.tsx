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

export interface Plan {
  id: string;
  name: string;
  price: number;
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

  React.useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? '#7C3AED' : '#E5E7EB',
    borderWidth: progress.value > 0.5 ? 1.8 : 1,
  }));

  const animatedBodyStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? '#7C3AED' : '#E5E7EB',
    borderTopWidth: 1,
  }));

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
            <Text style={styles.priceLarge}>${plan.price}</Text>
            <Text style={styles.priceUnit}> per month</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{plan.description}</Text>
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

  return (
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
  );
};

export default PlanSelector;


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    elevation : 10 
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
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
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    color: '#FFFFFF',
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
    marginBottom: 6,
  },
  priceLarge: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -1,
  },
  priceUnit: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },

  // ── Description ───────────────────────────────────────────────────────────
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
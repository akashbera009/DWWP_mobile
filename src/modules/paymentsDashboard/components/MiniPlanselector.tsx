import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';
import fonts from '@dwwp/utils/fonts';
import { PLANS } from '../mocks/planData';
import QtyModal from './QtyModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, payAddonBillType, payCurrentBillType, successPayload } from '@dwwp/utils/types';
import { showErrorSnackbar, showWarningSnackbar } from '@dwwp/utils/showSnackBar';
import { useRazorpayPayment } from '@dwwp/utils/razorpayPaymentFunciton';
import { displayNotification } from '@dwwp/utils/displayNotification';
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks';
import { confirmAddonPayment } from '../paymentAction';
import { screenNames } from '@dwwp/utils/screenNames';
import { addBroadcast } from '@dwwp/modules/dashboard/dashboardSlice';
import { CustomButton } from '@dwwp/components/CustomButton';
import { localImages } from '@dwwp/utils/localimages';

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
type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface PlanSelectorProps {
  onSelect?: (plan: Plan, qty: number, totalPrice: number, totalVolume: number) => void;
  onPaymentInitiated?: (payload: {
    plan: Plan;
    qty: number;
    totalPrice: number;
    totalVolume: number;
  }) => void;
  defaultSelected?: string;
}

const PlanCard: React.FC<{
  plan: Plan;
  selected: boolean;
  onPress: () => void;
  onAddToCart: () => void;
}> = ({ plan, selected, onPress, onAddToCart }) => {
  const progress = useSharedValue(selected ? 1 : 0);
  const scaleAnim = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, {
      damping: 14,
      stiffness: 100,
      mass: 0.8,
    });
  }, [selected]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], ['#E5E7EB', colors.primary]),
    borderWidth: withTiming(progress.value > 0.5 ? 2 : 1, { duration: 200 }),
    transform: [
      // { translateY: withSpring(progress.value > 0.5 ? -8 : 0, { damping: 14, stiffness: 100 }) },
      // { scale: scaleAnim.value },
    ],
    shadowOpacity: withTiming(progress.value > 0.5 ? 0.22 : 0.06, { duration: 200 }),
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#FFFFFF', 'rgba(43,101,104,0.05)']),
  }));

  const handlePress = () => {
    scaleAnim.value = withTiming(0.98, { duration: 100 }, () => {
      scaleAnim.value = withTiming(1, { duration: 100 });
    });
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={handlePress}>
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

          {selected ? (
            <Animated.View>
              {/* Add to Cart Button */}
              <TouchableOpacity
                style={styles.selectButton}
                activeOpacity={0.8}
                onPress={onAddToCart}
              >
                <View style={styles.selectButtonContent}>
                  <Text style={styles.selectButtonText}>Proceed to Pay</Text>
                  <Image
                    source={localImages.angle}
                    style={styles.angle}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View>
              <CustomButton
                title='Select'
                onPress={handlePress}
                variant='outline'
              />
            </Animated.View>
          )}
        </View>

      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

const PlanSelector: React.FC<PlanSelectorProps> = ({
  // onPaymentInitiated,
  // defaultSelected = 'premium',
}) => {
  const navigation = useNavigation<MainStackNavigationProp>();
  const [selectedId, setSelectedId] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch()
  const selectedPlan = PLANS.find((p) => p.id === selectedId);

  const handleSelect = (plan: Plan) => {
    setSelectedId(plan.id);
  };

  const handleAddToCart = () => {
    // Modal opens immediately when "Add to Cart" is tapped
    setIsModalVisible(true);
  };

  const handleQtyConfirm = (qty: number, totalPrice: number, totalVolume: number) => {
    if (!selectedPlan) return;
    payCurrentBill({
      amount: totalPrice,
      refill: totalVolume,
      qty: qty,
      type: 'addon'
    })
  };
  const { handlePayment } = useRazorpayPayment();
  const emailId = useAppSelector(s => s.dashboard?.userDetails?.emailId)

  const payCurrentBill = async ({ amount, refill, qty , type }: payAddonBillType): Promise<void> => {
    console.log('initiating addon payment... ');
    try {
      setIsLoading(true);
      const res = await handlePayment(amount)
      const { success, payment_id } = res
      if (success) {
        if (payment_id)
          onSuccess({
            payment_id,
            amount,
            refill,
            qty,
            type
          })
      } else {
        showWarningSnackbar('Payment Cancelled by User')
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      showErrorSnackbar('Payment failed ')
    } finally {
      setIsLoading(false);
    }
  };

  const onSuccess = async ({ payment_id, amount, qty = 1, refill, type }: successPayload) => {
    if (!emailId) return
    try {
      //close qtyModal
      setIsModalVisible(false)
      dispatch(confirmAddonPayment({
        email: emailId,
        razorPayId: payment_id,
        amount: amount,
        qty: qty,
        refill: refill,
        type
      })).then(res => {
        console.log('firebase writing response is ', res);
      })

      // navigate to success screen 
      navigation.navigate(screenNames.PaymentSuccessScreen, {
        payment_id,
        amount: amount * 100,
        qty,
        refill,
        type: 'addon'
      })
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false)
    }
  }

  const handleQtyCancel = () => {
    setIsModalVisible(false);
    setIsLoading(false);
  };

  return (
    <>
      <View style={styles.root}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={vw(300)}
          decelerationRate="fast"
        >
          {PLANS.map((plan) => (
            <View key={plan.id} style={styles.cardWrapper}>
              <PlanCard
                plan={plan}
                selected={selectedId === plan.id}
                onPress={() => handleSelect(plan)}
                onAddToCart={handleAddToCart}
              />
            </View>
          ))}
        </ScrollView>

        {/* Carousel indicators */}
        {/* <View style={styles.indicators}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.indicator,
                selectedId === plan.id && styles.indicatorActive,
              ]}
              onPress={() => handleSelect(plan)}
            />
          ))}
        </View> */}
      </View>

      {/* Quantity Modal - Bottom Sheet */}
      <QtyModal
        visible={isModalVisible}
        plan={selectedPlan || null}
        onConfirm={handleQtyConfirm}
        onCancel={handleQtyCancel}
        isLoading={isLoading}
      />

      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Processing payment...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PlanSelector;

const styles = StyleSheet.create({
  root: {
    marginBottom: vh(8),
    marginTop: vh(8)
  },
  scrollContent: {
    gap: vw(12),
  },
  cardWrapper: {
    width: vw(280),
  },
  card: {
    marginVertical: normalize(6),
    borderRadius: 20,
    minHeight: vh(270),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowRadius: 12,
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
    gap: vw(12),
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    fontSize: 20,
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
    marginBottom: vh(8),
  },
  priceLarge: {
    fontSize: normalize(32),
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
    letterSpacing: -1,
  },
  priceUnit: {
    fontSize: normalize(13),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
  },
  description: {
    fontSize: normalize(12),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    lineHeight: 18,
    marginBottom: vh(12),
  },
  selectButton: {
    marginTop: vh(6),
    paddingVertical: vh(13),
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vw(6),
  },
  selectButtonEmoji: {
    fontSize: 16,
  },
  selectButtonText: {
    color: colors.white,
    fontFamily: fonts.Bold,
    fontSize: normalize(14),
    letterSpacing: 0.2,
  },
  angle: {
    height: vh(14),
    width: vh(14),
    tintColor: colors.white
  },
  selectButtonArrow: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: fonts.Bold,
    fontSize: normalize(14),
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: vw(6),
    paddingBottom: vh(4),
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  indicatorActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
  // loading 
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderBox: {
    backgroundColor: colors.white,
    paddingVertical: vh(24),
    paddingHorizontal: vw(30),
    borderRadius: normalize(16),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  loaderText: {
    marginTop: vh(10),
    fontFamily: fonts.Medium,
    fontSize: normalize(13),
    color: colors.neutralBodyText,
  },
});
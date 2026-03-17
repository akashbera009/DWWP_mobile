import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';
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

interface QtyModalProps {
  visible: boolean;
  plan: Plan | null;
  onConfirm: (qty: number, totalPrice: number, totalVolume: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const QtyModal: React.FC<QtyModalProps> = ({
  visible,
  plan,
  onConfirm,
  onCancel,
  isLoading = false,
}) => { 
  const [qty, setQty] = useState<number>(1);
  
  useEffect(() => {
    if (visible) {
      setQty(1);
    }
  }, [visible]);

  if (!plan) return null;

  const totalPrice = plan.price * qty;
  const totalVolume = plan.volume * qty;

  const handleConfirm = () => {
    onConfirm(qty, totalPrice, totalVolume);
  };

  const handleDecrement = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrement = () => {
    if (qty < 10) setQty(qty + 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onCancel}
        />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.container}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={styles.planIconBox}>
            <Text style={styles.planIcon}>{plan.icon}</Text>
          </View>
          
          <View style={styles.planDetails}>
            <View style={styles.planNameRow}>
              <Text style={styles.planName}>{plan.name}</Text>
              {plan.badge && (
                <View style={[styles.badge, { borderColor: plan.badgeColor }]}>
                  <Text style={[styles.badgeText, { color: plan.badgeColor }]}>
                    {plan.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.planDescription}>{plan.description}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Content */}
        <View style={styles.content}>
          {/* Label */}
          <Text style={styles.label}>Select quantity</Text>

          {/* Qty Display - Modern Card */}
          <View style={styles.qtyDisplayCard}>
            <View style={styles.qtyDisplayInner}>
              <Text style={styles.qtyValue}>{qty}</Text>
              <Text style={styles.qtyUnit}>packs</Text>
            </View>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceLarge}>₹{totalPrice}</Text>
            </View>
          </View>

          {/* Stepper Controls */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={[styles.stepperBtn, qty === 1 && styles.stepperBtnDisabled]}
              onPress={handleDecrement}
              disabled={qty === 1}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepperBtnText, qty === 1 && styles.stepperBtnTextDisabled]}>
                −
              </Text>
            </TouchableOpacity>

            <View style={styles.stepperDisplay}>
              <Text style={styles.stepperDisplayText}>{qty}</Text>
            </View>

            <TouchableOpacity
              style={[styles.stepperBtn, qty === 10 && styles.stepperBtnDisabled]}
              onPress={handleIncrement}
              disabled={qty === 10}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepperBtnText, qty === 10 && styles.stepperBtnTextDisabled]}>
                +
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Select Numbers */}
          <View style={styles.quickNumbers}>
            {[1, 3, 5, 10].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.numberBtn,
                  qty === val && styles.numberBtnActive,
                ]}
                onPress={() => setQty(val)}
              >
                <Text
                  style={[
                    styles.numberBtnText,
                    qty === val && styles.numberBtnTextActive,
                  ]}
                >
                  {val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>₹{plan.price}</Text>
              <Text style={styles.infoUnit}>per pack</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Volume</Text>
              <Text style={styles.infoValue}>{plan.volume}L</Text>
              <Text style={styles.infoUnit}>per pack</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={styles.infoValue}>{totalVolume}L</Text>
              <Text style={styles.infoUnit}>{qty} packs</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmBtnText}>
              {isLoading ? 'Processing...' : `Add to Cart • ₹${totalPrice}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default QtyModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: vh(20),
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: vh(12),
  },
  
  // Plan Header
  planHeader: {
    flexDirection: 'row',
    paddingHorizontal: vw(20),
    paddingBottom: vh(16),
    gap: vw(12),
    alignItems: 'flex-start',
  },
  planIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  planIcon: {
    fontSize: 28,
  },
  planDetails: {
    flex: 1,
    gap: vh(6),
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
  },
  planName: {
    fontSize: normalize(16),
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
  },
  badge: {
    paddingHorizontal: vw(8),
    paddingVertical: vh(3),
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: normalize(10),
    fontFamily: fonts.Bold,
  },
  planDescription: {
    fontSize: normalize(12),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: vw(20),
  },

  content: {
    paddingHorizontal: vw(20),
    paddingTop: vh(20),
    paddingBottom: vh(16),
  },
  label: {
    fontSize: normalize(13),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    marginBottom: vh(16),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Qty Display Card
  qtyDisplayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: vw(20),
    paddingVertical: vh(20),
    marginBottom: vh(20),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  qtyDisplayInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: vw(8),
  },
  qtyValue: {
    fontSize: normalize(44),
    fontFamily: fonts.Bold,
    color: colors.primary,
  },
  qtyUnit: {
    fontSize: normalize(13),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
  },
  priceDisplay: {
    alignItems: 'flex-end',
  },
  priceLarge: {
    fontSize: normalize(26),
    fontFamily: fonts.Bold,
    color: colors.primary,
  },

  // Stepper Controls
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vw(16),
    marginBottom: vh(20),
  },
  stepperBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  stepperBtnDisabled: {
    backgroundColor: '#E5E7EB',
    elevation: 0,
    shadowOpacity: 0,
  },
  stepperBtnText: {
    fontSize: normalize(28),
    fontFamily: fonts.Bold,
    color: colors.white,
  },
  stepperBtnTextDisabled: {
    color: '#9CA3AF',
  },
  stepperDisplay: {
    width: 60,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  stepperDisplayText: {
    fontSize: normalize(22),
    fontFamily: fonts.Bold,
    color: colors.primary,
  },

  // Quick Select Numbers
  quickNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: vw(8),
    marginBottom: vh(20),
    justifyContent: 'space-between',
  },
  numberBtn: {
    width: '18%',
    paddingVertical: vh(6),
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  numberBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  numberBtnText: {
    fontSize: normalize(13),
    fontFamily: fonts.Bold,
    color: colors.neutralBodyText,
  },
  numberBtnTextActive: {
    color: colors.primary,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    gap: vw(12),
    marginBottom: vh(20),
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: normalize(11),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    marginBottom: vh(4),
  },
  infoValue: {
    fontSize: normalize(15),
    fontFamily: fonts.Bold,
    color: colors.primary,
    marginBottom: vh(2),
  },
  infoUnit: {
    fontSize: normalize(10),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: vw(12),
    paddingHorizontal: vw(20),
  },
  btn: {
    paddingVertical: vh(14),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
  },
  cancelBtnText: {
    fontSize: normalize(14),
    fontFamily: fonts.Bold,
    color: colors.neutralBlack,
  },
  confirmBtn: {
    flex: 1.3,
    backgroundColor: colors.primary,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: normalize(14),
    fontFamily: fonts.Bold,
    color: colors.white,
  },
});
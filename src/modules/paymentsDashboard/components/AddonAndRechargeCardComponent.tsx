import { View, Text, Animated, Pressable, StyleSheet } from 'react-native'
import React, { useRef } from 'react'
import { AddonRecord, PaymentRecord } from '@dwwp/modals';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import LinearGradient from 'react-native-linear-gradient';
import fonts from '@dwwp/utils/fonts';
import { screenNames } from '@dwwp/utils/screenNames';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, TransactionForNav } from '@dwwp/utils/types';
import { useNavigation } from '@react-navigation/native';

const C = {
  primary: '#2B6568',
  primaryDark: '#1e4a4d',
  cyan: '#32C2CA',
  cyanBg: 'rgba(50,194,202,0.10)',
  cyanBorder: 'rgba(50,194,202,0.20)',
  white: '#FFFFFF',
  black: '#041617',
  body: '#6A7C92',
  border: '#E1E8ED',
  bg: '#F4F7F8',
  card: '#FFFFFF',
  success: '#27AE60',
  successBg: 'rgba(39,174,96,0.10)',
  successBorder: 'rgba(39,174,96,0.22)',
  warning: '#F39C12',
  warningBg: 'rgba(243,156,18,0.10)',
  warningBorder: 'rgba(243,156,18,0.22)',
  purple: '#7C5CBF',
  purpleBg: 'rgba(124,92,191,0.10)',
  purpleBorder: 'rgba(124,92,191,0.22)',
  shadow: 'rgba(43,101,104,0.08)',
  inputBg: '#EFF2F5',
}
type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return '—' }
}

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}
function fmtMonth(key: string | null | undefined): string {
  if (!key) return '—'
  try {
    const [y, m] = key.split('-')
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-IN', {
      month: 'short', year: '2-digit',
    })
  } catch { return key }
}

function shortId(id: string | null | undefined): string {
  if (!id || typeof id !== 'string') return '—'
  return id.slice(-10).toUpperCase()
}


// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string | null | undefined }> = ({ status }) => {
  const resolved = status ?? 'Completed'
  const isOk = resolved.toLowerCase() === 'completed'
  return (
    <View style={[styles.badge, {
      backgroundColor: isOk ? C.successBg : C.warningBg,
      borderColor: isOk ? C.successBorder : C.warningBorder,
    }]}>
      <View style={[styles.badgeDot, { backgroundColor: isOk ? C.success : C.warning }]} />
      <Text style={[styles.badgeText, { color: isOk ? C.success : C.warning }]}>
        {resolved}
      </Text>
    </View>
  )
}

// ─── AddonCard ────────────────────────────────────────────────────────────────
export const AddonCard: React.FC<{ item: AddonRecord; index: number }> = ({ item, index }) => {
  const navigation = useNavigation<MainStackNavigationProp>();
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0)).current
  const slideY = useRef(new Animated.Value(normalize(24))).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay: index * 55, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, friction: 9, tension: 120, delay: index * 55, useNativeDriver: true }),
    ]).start()
  }, [])

  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }, { scale }] }}>
      <Pressable onPressIn={onIn} onPressOut={onOut}
        onPress={() => navigation.navigate(screenNames.ViewPaymentDetailsScreen, { transaction: item as TransactionForNav })}
        style={styles.card}>
        <LinearGradient colors={[C.purple, '#5B3FA6']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.cardAccent} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={[styles.iconBox, { backgroundColor: C.purpleBg }]}>
              <Text style={styles.iconEmoji}>⚡</Text>
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>Water Recharge</Text>
              <View style={styles.addonPillRow}>
                <View style={[styles.addonPill, { backgroundColor: C.cyanBg, borderColor: C.cyanBorder }]}>
                  <Text style={[styles.addonPillText, { color: C.cyan }]}>Qty: {item.quantityDone}</Text>
                </View>
                <View style={[styles.addonPill, { backgroundColor: C.purpleBg, borderColor: C.purpleBorder }]}>
                  <Text style={[styles.addonPillText, { color: C.purple }]}>refill: {item.refill}L </Text>
                </View>
              </View>
            </View>
            <View style={styles.addonAmountBlock}>
              <Text style={styles.addonAmountText}>₹{item.amount}</Text>
              <Text style={styles.addonAmountLabel}>paid</Text>
              <Text style={styles.addonCardMeta}>{fmtDate(item.addon_date)}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />
          <View style={styles.cardBottom}>
            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>TXN ID<Text style={styles.idValue}> {shortId(item.razor_pay_id)}</Text></Text>

            </View>
            <Text style={styles.timeText}>{fmtTime(item.addon_date)}</Text>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}


// ─── PaymentCard ──────────────────────────────────────────────────────────────
export const PaymentCard: React.FC<{ item: PaymentRecord; index: number }> = ({ item, index }) => {
  const navigation = useNavigation<MainStackNavigationProp>();
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0)).current
  const slideY = useRef(new Animated.Value(normalize(24))).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay: index * 55, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, friction: 9, tension: 120, delay: index * 55, useNativeDriver: true }),
    ]).start()
  }, [])

  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }, { scale }] }}>
      <Pressable onPressIn={onIn} onPressOut={onOut}
        onPress={() => navigation.navigate(screenNames.ViewPaymentDetailsScreen, { transaction: item as TransactionForNav })}
        style={styles.card}
      >
        <LinearGradient colors={[C.cyan, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.cardAccent} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={[styles.iconBox, { backgroundColor: C.cyanBg }]}>
              <Text style={styles.iconEmoji}>💳</Text>
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>Bill Payment</Text>
              <Text style={styles.cardMeta}>{fmtMonth(item.forMonth)}  ·  {fmtDate(item.timeStamp)}</Text>
            </View>
            <View style={styles.amountBlock}>
              <Text style={styles.amountText}>₹{item.amount}</Text>
              <Text style={styles.amountLabel}>paid</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardBottom}>
            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>TXN ID  <Text style={styles.idValue}>{shortId(item.razorPayId)} </Text></Text>
            </View>
            <Text style={styles.timeText}>{fmtTime(item.timeStamp)}</Text>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}


const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: C.card, borderRadius: normalize(18),
    overflow: 'hidden', shadowColor: C.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: C.border, marginHorizontal: vw(16), marginVertical: vh(4)
  },
  cardAccent: { width: normalize(4) },
  cardBody: { flex: 1, padding: normalize(14), gap: normalize(10) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
  iconBox: { width: normalize(40), height: normalize(40), borderRadius: normalize(13), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconEmoji: { fontSize: normalize(18) },
  cardTitleBlock: { flex: 1, gap: vh(2) },
  cardTitle: { fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black },
  cardMeta: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body },
  addonCardMeta: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body, position: 'relative', top: -vh(8) },
  amountBlock: { alignItems: 'flex-end', gap: vh(2) },
  amountText: { fontFamily: fonts.Bold, fontSize: normalize(17), color: C.black },
  amountLabel: { fontFamily: fonts.Regular, fontSize: normalize(10), color: C.black },
  addonAmountBlock: { alignItems: 'flex-end', gap: vh(2), marginBottom: vh(-8) },
  addonAmountText: { fontFamily: fonts.Bold, fontSize: normalize(17), color: C.black },
  addonAmountLabel: { fontFamily: fonts.Regular, fontSize: normalize(10), color: C.black, position: 'relative', top: -vh(8) },
  addonPillRow: { flexDirection: 'row', gap: normalize(8), marginBottom: vh(-6) },
  addonPill: { flexDirection: 'row', alignItems: 'center', gap: normalize(4), paddingHorizontal: normalize(10), paddingVertical: normalize(4), borderRadius: normalize(20), borderWidth: 1 },
  addonPillIcon: { fontSize: normalize(12) },
  addonPillText: { fontFamily: fonts.SemiBold, fontSize: normalize(11) },
  cardDivider: { height: 1, backgroundColor: C.border },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
  idBlock: { flex: 1, gap: vh(1) },
  idLabel: { fontFamily: fonts.Regular, fontSize: normalize(9), color: C.body, letterSpacing: 0.8 },
  idValue: { fontFamily: fonts.Bold, fontSize: normalize(11), color: C.black, letterSpacing: 0.5 },
  timeText: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body },
  badge: { flexDirection: 'row', alignItems: 'center', gap: normalize(4), paddingHorizontal: normalize(9), paddingVertical: normalize(3), borderRadius: normalize(20), borderWidth: 1 },
  badgeDot: { width: normalize(5), height: normalize(5), borderRadius: normalize(3) },
  badgeText: { fontFamily: fonts.SemiBold, fontSize: normalize(10) },

})
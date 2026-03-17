import React, { useRef, useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Platform,
  ActivityIndicator,
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { useAppSelector } from '@dwwp/store/hooks'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { generateAndShareReceiptPDF } from '@dwwp/utils/generateAndDownloadPDF'
import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MainStackParamList } from '@dwwp/utils/types'
import { buildReceiptHTML } from '@dwwp/utils/buildReceiptHTML'
import { QuotaBar } from '../components/QuotaBar'
import { strings } from '@dwwp/utils/strings'
import { CustomButton } from '@dwwp/components/CustomButton'

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  route: RouteProp<MainStackParamList, 'PaymentSuccessScreen'>;
  navigation: NativeStackNavigationProp<MainStackParamList, 'PaymentSuccessScreen'>;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

function formatDate() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function truncateId(id: string) {
  return id.length > 26 ? `${id.slice(0, 12)}…${id.slice(-6)}` : id
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const Row: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <View style={rowS.wrap}>
    <Text style={rowS.label}>{label}</Text>
    <Text style={[rowS.value, accent && rowS.accentValue]}>{value}</Text>
  </View>
)
const rowS = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: normalize(8) },
  label: { fontFamily: fonts.Regular, fontSize: normalize(13), color: colors.black },
  value: { fontFamily: fonts.SemiBold, fontSize: normalize(13), color: colors.black, textAlign: 'right', maxWidth: '58%' },
  accentValue: { fontFamily: fonts.Bold, color: colors.primary, fontSize: normalize(14) },
})

const Dashes = () => (
  <View style={{ flexDirection: 'row', paddingVertical: normalize(4) }}>
    {Array.from({ length: 34 }).map((_, i) => (
      <View key={i} style={{ flex: 1, height: 1, backgroundColor: i % 2 === 0 ? colors.border : 'transparent' }} />
    ))}
  </View>
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const PaymentSuccessScreen = ({ navigation, route }: Props) => {
  const {
    payment_id,
    amount,
    qty,
    refill,
    addon
  } = route?.params
  // ── Redux ──────────────────────────────────────────────────────────────────
  const { currentMonthId, months, todayUsage } = useAppSelector(s => s.usage)
  if (currentMonthId === null) return
  const currentMonth = months?.[currentMonthId]
  const currentUsage = currentMonth?.total ?? 0
  const previousLimit = currentMonth?.limit ?? 2000
  const addedQuota = (refill ?? 0) * (qty ?? 1)
  const newLimit = previousLimit + addedQuota
  const isAddon = !!addon

  // ── Entrance animations ────────────────────────────────────────────────────
  const iconScale = useRef(new Animated.Value(0)).current
  const iconOpacity = useRef(new Animated.Value(0)).current
  const cardSlide = useRef(new Animated.Value(36)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const btnOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
        Animated.timing(iconOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, friction: 9, tension: 55, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 340, useNativeDriver: true }),
      ]),
      Animated.timing(btnOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start()
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────
  const formattedAmount = formatINR(amount)
  const formattedDate = formatDate()
  const shortId = truncateId(payment_id)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDone = () => navigation?.goBack()

  const [isDownloadLoading, setIsDownloadLoading] = useState(false)
  const handleDownloadPDF = async () => {
    setIsDownloadLoading(true)
    try {
      const html = buildReceiptHTML({
        payment_id: payment_id,
        amount: String(amount / 100),
        qty: qty,
        refill: refill,
        addon: addon,
        date: '',
        previousLimit: 100,
        newLimit: 200,
        currentUsage: 10
      })
      await generateAndShareReceiptPDF(html, `DWWP_Receipt_${payment_id}`)
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setIsDownloadLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={S.root}>
      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Success icon ── */}
        <Animated.View style={[S.iconWrap, { opacity: iconOpacity, transform: [{ scale: iconScale }] }]}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={S.iconCircle}
          >
            <Text style={S.iconCheck}>✓</Text>
          </LinearGradient>
          <View style={S.iconRing} />
        </Animated.View>

        {/* ── Heading ── */}
        <Animated.View style={{ opacity: iconOpacity, alignItems: 'center' }}>
          <Text style={S.heading}>Payment Successful</Text>
          <Text style={S.subheading}>Your water quota has been recharged</Text>
        </Animated.View>

        {/* ── Amount pill ── */}
        <Animated.View style={[S.amountPill, { opacity: iconOpacity }]}>
          <Text style={S.amountLabel}>Amount Paid</Text>
          <Text style={S.amountValue}>{formattedAmount}</Text>
        </Animated.View>

        {/* ── Quota bar (only for addon purchases) ── */}
        {isAddon && addedQuota > 0 && (
          <>
            <Dashes />
            <QuotaBar
              previousLimit={previousLimit}
              addedLimit={addedQuota}
              currentUsage={currentUsage}
              newLimit={newLimit}
            />
          </>
        )}
        {/* ── Receipt card ── */}
        <Animated.View style={[S.receipt, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
          {/* Notch top */}
          <View style={S.notchRow}>
            <View style={S.notchCircle} />
            <Text style={S.receiptTitle}>Receipt</Text>
            <View style={S.notchCircle} />
          </View>

          {/* Receipt rows */}
          <View style={S.receiptBody}>
            <Row label="Payment Type" value="Water Quota Refill" />
            {isAddon && (
              <>
                <Row label="Plan / Addon" value={addon!} />
                <Row label="Qty" value={`${qty ?? 1} unit${(qty ?? 1) !== 1 ? 's' : ''}`} />
              </>
            )}
            <Row label="Quota Added" value={`${addedQuota.toLocaleString()} L`} accent />

            <Dashes />

            <Row label="Transaction ID" value={shortId} />
            <Row label="Date & Time" value={formattedDate} />
            <Row label="Status" value="Successful ✓" accent />
          </View>

          {/* Notch bottom */}
          <View style={[S.notchRow, { marginTop: normalize(8) }]}>
            <View style={S.notchCircle} />
            <View style={{ flex: 1, height: 1, borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }} />
            <View style={S.notchCircle} />
          </View>

          <Text style={S.receiptFooter}>
            {strings.paymentFooterText}
          </Text>
        </Animated.View>

        <View style={{ height: normalize(120) }} />
      </ScrollView>

      {/* ── Fixed bottom buttons ── */}
      <Animated.View style={[S.bottomBar, { opacity: btnOpacity }]}>
        <CustomButton
          title='Share Receipt'
          variant='outline'
          onPress={handleDownloadPDF}
          loading={isDownloadLoading}
          disabled={isDownloadLoading}
        />
        <CustomButton
          title='Done'
          style={{flexGrow:1}}
          onPress={handleDone}
          variant='primary'
        />
      </Animated.View>
    </View>
  )
}

export default PaymentSuccessScreen

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { alignItems: 'center', paddingTop: normalize(48), paddingHorizontal: normalize(20) },

  // Icon
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: normalize(20) },
  iconCircle: {
    width: normalize(72), height: normalize(72), borderRadius: normalize(36),
    alignItems: 'center', justifyContent: 'center',
  },
  iconCheck: { fontSize: normalize(34), color: colors.white, fontFamily: fonts.Bold },
  iconRing: {
    position: 'absolute',
    width: normalize(90), height: normalize(90), borderRadius: normalize(45),
    borderWidth: 2, borderColor: colors.primaryLight,
  },

  // Heading
  heading: { fontFamily: fonts.Bold, fontSize: normalize(22), color: colors.black, marginBottom: vh(6), textAlign: 'center' },
  subheading: { fontFamily: fonts.Regular, fontSize: normalize(13), color: colors.black, textAlign: 'center', marginBottom: vh(8) },

  // Amount pill
  amountPill: {
    alignItems: 'center', backgroundColor: colors.primaryLight,
    borderRadius: normalize(16), paddingVertical: normalize(10),
    paddingHorizontal: normalize(36), marginBottom: normalize(12),
  },
  amountLabel: { fontFamily: fonts.Regular, fontSize: normalize(11), color: colors.primary, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: normalize(0) },
  amountValue: { fontFamily: fonts.Bold, fontSize: normalize(28), color: colors.primary },

  // Receipt
  receipt: {
    width: '100%', backgroundColor: colors.white,
    marginTop: vh(8),
    borderTopWidth: normalize(1),
    borderTopColor: colors.primary,
    borderRadius: normalize(18), overflow: 'hidden',
    shadowColor: colors.black, shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 10,
  },
  notchRow: { flexDirection: 'row', alignItems: 'center' },
  notchCircle: {
    width: normalize(14), height: normalize(14), borderRadius: normalize(7),
    backgroundColor: colors.primary,
    marginHorizontal: -normalize(7),
  },
  receiptTitle: {
    flex: 1, fontFamily: fonts.Bold, fontSize: normalize(14),
    color: colors.black, letterSpacing: 1.2, textTransform: 'uppercase',
    textAlign: 'center', paddingVertical: normalize(12),
  },
  receiptBody: { paddingHorizontal: normalize(18), paddingBottom: normalize(4) },
  receiptFooter: {
    fontFamily: fonts.Regular, fontSize: normalize(10), color: colors.black,
    textAlign: 'center', lineHeight: normalize(16),
    paddingVertical: normalize(14), paddingHorizontal: normalize(16),
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: normalize(10),
    paddingHorizontal: normalize(20),
    paddingBottom: Platform.OS === 'ios' ? normalize(34) : normalize(18),
    paddingTop: normalize(12),
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  pdfBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: normalize(6),
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: normalize(14), paddingVertical: normalize(13),
  },
  pdfIcon: { fontSize: normalize(13), color: colors.black },
  pdfText: { fontFamily: fonts.SemiBold, fontSize: normalize(13), color: colors.black },
  doneBtn: {
    flex: 1.4, borderRadius: normalize(14), overflow: 'hidden',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 5,
  },
  doneBtnInner: { paddingVertical: normalize(13), alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontFamily: fonts.Bold, fontSize: normalize(14), color: colors.white, letterSpacing: 0.3 },
})
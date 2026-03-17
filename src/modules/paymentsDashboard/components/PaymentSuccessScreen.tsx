import React, { useRef, useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Platform,
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { useAppSelector } from '@dwwp/store/hooks'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { generateAndShareReceiptPDF } from '@dwwp/utils/generateAndDownloadPDF'
import { RouteProp, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MainStackParamList } from '@dwwp/utils/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  route: RouteProp<MainStackParamList , 'PaymentSuccessScreen'>;
  navigation: NativeStackNavigationProp<MainStackParamList , 'PaymentSuccessScreen'>;
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

// ─── Quota bar component ──────────────────────────────────────────────────────
const QuotaBar: React.FC<{
  previousLimit: number
  addedLimit: number
  currentUsage: number
  newLimit: number
}> = ({ previousLimit, addedLimit, currentUsage, newLimit }) => {

  // We animate two things:
  // 1. The "used" bar — stays the same width, just redraws against new total
  // 2. The "added" segment — grows from 0 to its final width after a short delay
  const addedAnim = useRef(new Animated.Value(0)).current
  const labelOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.spring(addedAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: false }),
        Animated.timing(labelOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  const usedPct = Math.min((currentUsage / newLimit) * 100, 100)
  const addedPct = Math.min((addedLimit / newLimit) * 100, 100)
  const prevUsedPct = Math.min((currentUsage / previousLimit) * 100, 100)

  const addedBarWidth = addedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${addedPct.toFixed(2)}%`],
  })

  return (
    <View style={qStyles.wrap}>
      {/* Title row */}
      <View style={qStyles.titleRow}>
        <Text style={qStyles.title}>Quota Updated</Text>
        <Animated.View style={[qStyles.addedBadge, { opacity: labelOpacity }]}>
          <Text style={qStyles.addedBadgeText}>+{addedLimit.toLocaleString()} L added</Text>
        </Animated.View>
      </View>

      {/* Bar track */}
      <View style={qStyles.track}>
        {/* Used portion */}
        <View style={[qStyles.usedBar, { width: `${usedPct.toFixed(2)}%` as any }]} />
        {/* Added portion — animated */}
        <Animated.View style={[qStyles.addedBar, { width: addedBarWidth }]} />
      </View>

      {/* Labels below bar */}
      <View style={qStyles.labelsRow}>
        <View style={qStyles.labelItem}>
          <View style={[qStyles.dot, { backgroundColor: colors.primary }]} />
          <Text style={qStyles.labelText}>Used: {currentUsage.toLocaleString()} L</Text>
        </View>
        <Animated.View style={[qStyles.labelItem, { opacity: labelOpacity }]}>
          <View style={[qStyles.dot, { backgroundColor: colors.primary }]} />
          <Text style={qStyles.labelText}>Added: {addedLimit.toLocaleString()} L</Text>
        </Animated.View>
        <View style={qStyles.labelItem}>
          <View style={[qStyles.dot, { backgroundColor: colors.border }]} />
          <Text style={qStyles.labelText}>New limit: {newLimit.toLocaleString()} L</Text>
        </View>
      </View>

      {/* Before → After pill */}
      <Animated.View style={[qStyles.limitChange, { opacity: labelOpacity }]}>
        <Text style={qStyles.limitChangeOld}>{previousLimit.toLocaleString()} L</Text>
        <Text style={qStyles.limitChangeArrow}> → </Text>
        <Text style={qStyles.limitChangeNew}>{newLimit.toLocaleString()} L</Text>
        <Text style={qStyles.limitChangeLabel}> monthly limit</Text>
      </Animated.View>
    </View>
  )
}

const qStyles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    borderRadius: normalize(14),
    padding: normalize(14),
    marginHorizontal: normalize(18),
    marginBottom: normalize(4),
    marginTop: normalize(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(12),
  },
  title: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(12),
    color: colors.black,
  },
  addedBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(3),
  },
  addedBadgeText: {
    fontFamily: fonts.Bold,
    fontSize: normalize(11),
    color: colors.primary,
  },
  track: {
    height: normalize(10),
    backgroundColor: colors.border,
    borderRadius: normalize(10),
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: normalize(10),
  },
  usedBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: normalize(10),
  },
  addedBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: normalize(10),
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(10),
    marginBottom: normalize(10),
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  dot: {
    width: normalize(7),
    height: normalize(7),
    borderRadius: normalize(4),
  },
  labelText: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.black,
  },
  limitChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(7),
    alignSelf: 'flex-start',
  },
  limitChangeOld: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(12),
    color: colors.black,
    textDecorationLine: 'line-through',
  },
  limitChangeArrow: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: colors.black,
  },
  limitChangeNew: {
    fontFamily: fonts.Bold,
    fontSize: normalize(13),
    color: colors.primary,
  },
  limitChangeLabel: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.black,
  },
})

// ─── PDF HTML ─────────────────────────────────────────────────────────────────
function buildReceiptHTML(p: {
  payment_id: string; amount: string; qty: number
  refill: number; addon?: string; date: string
  previousLimit: number; newLimit: number; currentUsage: number
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111;background:#fff}
      .brand{font-size:26px;font-weight:700;color:#1a6b6e;letter-spacing:2px;text-align:center}
      .sub{font-size:13px;color:#6b7280;text-align:center;margin-top:4px}
      .badge{display:inline-block;background:#e1f5ee;color:#065f46;font-size:13px;font-weight:600;padding:6px 18px;border-radius:20px;margin:12px auto 24px;display:block;width:fit-content}
      .amt{text-align:center;background:#f0faf9;border-radius:16px;padding:24px;margin:0 0 24px}
      .amt-lbl{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px}
      .amt-val{font-size:36px;font-weight:700;color:#1a6b6e;margin-top:6px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      td{padding:10px 0;font-size:13px;border-bottom:1px solid #f3f4f6}
      td:last-child{text-align:right;font-weight:600}
      .quota{background:#f0faf9;border-radius:12px;padding:16px;margin-top:20px}
      .quota-title{font-size:12px;font-weight:600;color:#1a6b6e;margin-bottom:10px}
      .bar-bg{height:10px;background:#e5e7eb;border-radius:10px;overflow:hidden;display:flex}
      .bar-used{height:100%;background:#1a6b6e}
      .bar-add{height:100%;background:#5eead4}
      .footer{text-align:center;font-size:11px;color:#9ca3af;margin-top:40px;border-top:1px solid #f3f4f6;padding-top:20px}
    </style></head><body>
      <div class="brand">DWWP</div>
      <div class="sub">Domestic Water Wastage Prevention</div>
      <div class="badge">✓ Payment Successful</div>
      <div class="amt">
        <div class="amt-lbl">Amount Paid</div>
        <div class="amt-val">${p.amount}</div>
      </div>
      <table>
        <tr><td>Payment Type</td><td>Water Quota Refill</td></tr>
        <tr><td>Plan / Addon</td><td>${p.addon ?? '—'}</td></tr>
        <tr><td>Quantity</td><td>${p.qty} unit${p.qty !== 1 ? 's' : ''}</td></tr>
        <tr><td>Quota Added</td><td>${p.refill.toLocaleString()} L</td></tr>
        <tr><td>Transaction ID</td><td style="word-break:break-all">${p.payment_id}</td></tr>
        <tr><td>Date & Time</td><td>${p.date}</td></tr>
      </table>
      <div class="quota">
        <div class="quota-title">Quota Updated · ${p.previousLimit.toLocaleString()} L → ${p.newLimit.toLocaleString()} L</div>
        <div class="bar-bg">
          <div class="bar-used" style="width:${Math.min((p.currentUsage / p.newLimit) * 100, 100).toFixed(1)}%"></div>
          <div class="bar-add"  style="width:${Math.min((p.refill / p.newLimit) * 100, 100).toFixed(1)}%"></div>
        </div>
        <div style="font-size:11px;color:#6b7280;margin-top:8px">
          Used: ${p.currentUsage.toLocaleString()} L &nbsp;|&nbsp;
          Added: ${p.refill.toLocaleString()} L &nbsp;|&nbsp;
          New limit: ${p.newLimit.toLocaleString()} L
        </div>
      </div>
      <div class="footer">Thank you for using DWWP · This is a computer-generated receipt</div>
    </body></html>`
}

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

  const handleDownloadPDF = async () => {
    try {
      const html = buildReceiptHTML({
        payment_id: payment_id,
        amount: String(amount),
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

          {/* Notch bottom */}
          <View style={[S.notchRow, { marginTop: normalize(8) }]}>
            <View style={S.notchCircle} />
            <View style={{ flex: 1, height: 1, borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }} />
            <View style={S.notchCircle} />
          </View>

          <Text style={S.receiptFooter}>
            Thank you for using DWWP{'\n'}This is a computer-generated receipt
          </Text>
        </Animated.View>

        <View style={{ height: normalize(120) }} />
      </ScrollView>

      {/* ── Fixed bottom buttons ── */}
      <Animated.View style={[S.bottomBar, { opacity: btnOpacity }]}>
        <TouchableOpacity style={S.pdfBtn} onPress={handleDownloadPDF} activeOpacity={0.8}>
          <Text style={S.pdfIcon}>⬇</Text>
          <Text style={S.pdfText}>Download Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.doneBtn} onPress={handleDone} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.doneBtnInner}
          >
            <Text style={S.doneBtnText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  iconCheck: { fontSize: normalize(34), color: '#fff', fontFamily: fonts.Bold },
  iconRing: {
    position: 'absolute',
    width: normalize(90), height: normalize(90), borderRadius: normalize(45),
    borderWidth: 2, borderColor: colors.primaryLight,
  },

  // Heading
  heading: { fontFamily: fonts.Bold, fontSize: normalize(22), color: colors.black, marginBottom: normalize(6), textAlign: 'center' },
  subheading: { fontFamily: fonts.Regular, fontSize: normalize(13), color: colors.black, textAlign: 'center', marginBottom: normalize(22) },

  // Amount pill
  amountPill: {
    alignItems: 'center', backgroundColor: colors.primaryLight,
    borderRadius: normalize(16), paddingVertical: normalize(14),
    paddingHorizontal: normalize(36), marginBottom: normalize(22),
  },
  amountLabel: { fontFamily: fonts.Regular, fontSize: normalize(11), color: colors.primary, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: normalize(4) },
  amountValue: { fontFamily: fonts.Bold, fontSize: normalize(28), color: colors.primary },

  // Receipt
  receipt: {
    width: '100%', backgroundColor: colors.white,
    borderRadius: normalize(18), overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  notchRow: { flexDirection: 'row', alignItems: 'center' },
  notchCircle: {
    width: normalize(14), height: normalize(14), borderRadius: normalize(7),
    backgroundColor: colors.background,
    marginHorizontal: -normalize(7),
  },
  receiptTitle: {
    flex: 1, fontFamily: fonts.Bold, fontSize: normalize(11),
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
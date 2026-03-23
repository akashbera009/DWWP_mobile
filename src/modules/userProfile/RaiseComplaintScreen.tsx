/**
 * RaiseComplaintScreen.tsx
 *
 * Fields:
 *   - Complaint category  (horizontal card picker)
 *   - Issue description   (multiline animated input)
 *   - Attach photo        (image picker strip)
 *
 * On submit → success modal with ticket number
 * Firestore integration: left as empty onPress stubs
 *
 * Deps:
 *   react-native-image-picker  (launchImageLibrary)
 *   react-native-linear-gradient
 *   @gorhom/portal  (for modal — optional, swap with RN Modal if not available)
 */

import React, { useState, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, TextInput, Image, Platform,
  KeyboardAvoidingView, StatusBar, Dimensions,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
// import { launchImageLibrary } from 'react-native-image-picker'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { useAppSelector } from '@dwwp/store/hooks'
import ImagePicker from "react-native-image-crop-picker";

const { width: SCREEN_W } = Dimensions.get('window')

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary: '#2B6568',
  primaryDark: '#1e4a4d',
  primaryLight: 'rgba(43,101,104,0.08)',
  cyan: '#32C2CA',
  cyanBg: 'rgba(50,194,202,0.10)',
  cyanBorder: 'rgba(50,194,202,0.25)',
  white: '#FFFFFF',
  black: '#041617',
  body: '#6A7C92',
  border: '#E1E8ED',
  bg: '#F4F7F8',
  card: '#FFFFFF',
  success: '#27AE60',
  successBg: 'rgba(39,174,96,0.08)',
  successBorder: 'rgba(39,174,96,0.20)',
  error: '#E74C3C',
  errorBg: 'rgba(231,76,60,0.08)',
  shadow: 'rgba(43,101,104,0.10)',
  inputBg: '#F4F7F8',
  placeholder: '#A8B8C8',
}

// ─── Categories ───────────────────────────────────────────────────────────────
interface Category {
  id: string
  label: string
  icon: string
  color: string
  bg: string
}

const CATEGORIES: Category[] = [
  { id: 'billing', label: 'Billing\nDiscrepancy', icon: '🧾', color: '#E74C3C', bg: 'rgba(231,76,60,0.08)' },
  { id: 'supply', label: 'Supply\nInterruption', icon: '🚰', color: '#F39C12', bg: 'rgba(243,156,18,0.08)' },
  { id: 'pipeline', label: 'Pipeline\nDamage', icon: '🔧', color: '#2B6568', bg: 'rgba(43,101,104,0.08)' },
  { id: 'meter', label: 'Meter\nMalfunction', icon: '📊', color: '#7C5CBF', bg: 'rgba(124,92,191,0.08)' },
  { id: 'other', label: 'Other', icon: '💬', color: '#32C2CA', bg: 'rgba(50,194,202,0.08)' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateTicketId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return 'TKT-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ─── CategoryCard ─────────────────────────────────────────────────────────────
const CategoryCard: React.FC<{
  cat: Category
  selected: boolean
  onPress: () => void
}> = ({ cat, selected, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current
  const onIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50 }).start()
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={onIn} onPressOut={onOut} onPress={onPress}
        style={[
          styles.catCard,
          selected
            ? { backgroundColor: cat.bg, borderColor: cat.color, borderWidth: 1.5 }
            : { backgroundColor: C.card, borderColor: C.border, borderWidth: 1 },
        ]}
      >
        {/* Selected check */}
        {selected && (
          <View style={[styles.catCheck, { backgroundColor: cat.color }]}>
            <Text style={styles.catCheckMark}>✓</Text>
          </View>
        )}
        <View style={[styles.catIconBox, { backgroundColor: selected ? cat.color : C.inputBg }]}>
          <Text style={styles.catIcon}>{cat.icon}</Text>
        </View>
        <Text style={[
          styles.catLabel,
          { color: selected ? cat.color : C.body }
        ]}>
          {cat.label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

// ─── PhotoThumb ───────────────────────────────────────────────────────────────
const PhotoThumb: React.FC<{ uri: string; onRemove: () => void }> = ({ uri, onRemove }) => (
  <View style={styles.photoThumb}>
    <Image source={{ uri }} style={styles.photoImg} />
    <Pressable onPress={onRemove} style={styles.photoRemove} hitSlop={8}>
      <Text style={styles.photoRemoveText}>✕</Text>
    </Pressable>
  </View>
)

// ─── AddPhotoBtn ──────────────────────────────────────────────────────────────
const AddPhotoBtn: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scale = useRef(new Animated.Value(1)).current
  const onIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50 }).start()
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPressIn={onIn} onPressOut={onOut} onPress={onPress} style={styles.addPhotoBtn}>
        <Text style={styles.addPhotoIcon}>📷</Text>
        <Text style={styles.addPhotoLabel}>Add Photo</Text>
      </Pressable>
    </Animated.View>
  )
}

// ─── SuccessModal ─────────────────────────────────────────────────────────────
const SuccessModal: React.FC<{
  visible: boolean
  ticketId: string
  category: Category | undefined
  onDone: () => void
}> = ({ visible, ticketId, category, onDone }) => {
  const opacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.82)).current
  const checkScale = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.spring(cardScale, { toValue: 1, friction: 9, tension: 120, useNativeDriver: true }),
        ]),
        Animated.spring(checkScale, { toValue: 1, friction: 6, tension: 200, useNativeDriver: true }),
      ]).start()
    } else {
      opacity.setValue(0)
      cardScale.setValue(0.82)
      checkScale.setValue(0)
    }
  }, [cardScale,checkScale,opacity,visible])

  if (!visible) return null

  return (
    <Animated.View style={[styles.modalOverlay, { opacity }]}>
      <Animated.View style={[styles.modalCard, { transform: [{ scale: cardScale }] }]}>

        {/* Success ring */}
        <View style={styles.successRingOuter}>
          <View style={styles.successRingInner}>
            <Animated.View style={[styles.successCheckBox, { transform: [{ scale: checkScale }] }]}>
              <LinearGradient
                colors={[C.success, '#1e8a4a']}
                style={styles.successCheckGrad}
              >
                <Text style={styles.successCheckText}>✓</Text>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>

        <Text style={styles.modalTitle}>Complaint Submitted!</Text>
        <Text style={styles.modalSub}>
          We've received your complaint and will get back to you within 24–48 hours.
        </Text>

        {/* Ticket card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Ticket ID</Text>
            <Text style={styles.ticketValue}>{ticketId}</Text>
          </View>
          {category && (
            <View style={[styles.ticketRow, { marginTop: vh(8) }]}>
              <Text style={styles.ticketLabel}>Category</Text>
              <View style={[styles.ticketCatPill, { backgroundColor: category.bg, borderColor: category.color }]}>
                <Text style={styles.ticketCatIcon}>{category.icon}</Text>
                <Text style={[styles.ticketCatText, { color: category.color }]}>
                  {category.label.replace('\n', ' ')}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Pressable onPress={onDone} style={styles.doneBtn}>
          <LinearGradient
            colors={[C.primary, C.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.doneBtnGrad}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </LinearGradient>
        </Pressable>

      </Animated.View>
    </Animated.View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
const RaiseComplaintScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [selectedCat, setSelectedCat] = useState<string>('')
  const [issue, setIssue] = useState<string>('')
  const [photos, setPhotos] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [errors, setErrors] = useState<{ cat?: string; issue?: string }>({})

  const inputAnim = useRef(new Animated.Value(0)).current
  const submitAnim = useRef(new Animated.Value(1)).current
  const inputRef = useRef<TextInput>(null)

  const onFocus = () => {
    setIsFocused(true)
    Animated.timing(inputAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start()
  }
  const onBlur = () => {
    setIsFocused(false)
    Animated.timing(inputAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start()
  }

  const inputBorderColor = inputAnim.interpolate({
    inputRange: [0, 1], outputRange: [C.border, C.cyan],
  })
  const inputBorderWidth = inputAnim.interpolate({
    inputRange: [0, 1], outputRange: [1, 1.5],
  })
  const pickPhoto = useCallback(() => {
    if (photos.length >= 3) return
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image) => {
      setPhotos(prev=> [...prev , image?.path])
    });
  }, [photos])

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!selectedCat) e.cat = 'Please select a category'
    if (!issue.trim()) e.issue = 'Please describe your issue'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const name = useAppSelector(s => s.dashboard.userDetails?.fullName)
  const email = useAppSelector(s => s.dashboard.userDetails?.emailId)
  const handleSubmit = async () => {
    if (!validate()) return

    const serviceId = "service_g8u6eis";
    const templateId = "template_46d2hqi";
    const publicKey = "9L_lR2--NAjfcN-jA";

    const templateParams = {
      from_name: name,
      from_email: email,
      complaint: [...selectedCat, issue].join("\n"),
    };

    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: templateParams,
          }),
        }
      );

      if (response.ok) {
        console.log("Email sent successfully");
      } else {
        console.log("Failed to send email", response);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }

    Animated.sequence([
      Animated.spring(submitAnim, { toValue: 0.94, useNativeDriver: true, speed: 50 }),
      Animated.spring(submitAnim, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start(() => {
      setTicketId(generateTicketId())
      setShowSuccess(true)
    })
  }

  const handleDone = () => {
    setShowSuccess(false)
    setSelectedCat('')
    setIssue('')
    setPhotos([])
    setErrors({})
    onBack?.()
  }

  const activeCat = CATEGORIES.find(c => c.id === selectedCat)

  return (
    <View style={styles.screen} >
      <StatusBar barStyle="light-content" translucent backgroundColor={'transparent'} />

      <CustomHeader screenName="Raise Complaint" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Section: Category ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: C.primary }]} />
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.sectionRequired}>*</Text>
            </View>
            <Text style={styles.sectionSub}>What is your complaint related to?</Text>

            {/* Category grid */}
            <View style={styles.catGrid}>
              {CATEGORIES.map(cat => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  selected={selectedCat === cat.id}
                  onPress={() => {
                    setSelectedCat(cat.id)
                    setErrors(e => ({ ...e, cat: undefined }))
                  }}
                />
              ))}
            </View>

            {errors.cat && (
              <View style={styles.errorRow}>
                <Text style={styles.errorText}>⚠ {errors.cat}</Text>
              </View>
            )}
          </View>

          {/* ── Section: Description ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: C.cyan }]} />
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionRequired}>*</Text>
            </View>
            <Text style={styles.sectionSub}>Describe the issue in detail</Text>

            <Animated.View style={[
              styles.textAreaWrap,
              { borderColor: errors.issue ? C.error : inputBorderColor, borderWidth: inputBorderWidth },
            ]}>
              <TextInput
                ref={inputRef}
                value={issue}
                onChangeText={t => {
                  setIssue(t)
                  if (t.trim()) setErrors(e => ({ ...e, issue: undefined }))
                }}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="e.g. My water bill for March shows ₹850 but I used only 40L last month..."
                placeholderTextColor={C.placeholder}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={styles.textArea}
                maxLength={500}
              />
              <View style={styles.textAreaFooter}>
                {isFocused && (
                  <Text style={styles.charCount}>{issue.length}/500</Text>
                )}
              </View>
            </Animated.View>

            {errors.issue && (
              <View style={styles.errorRow}>
                <Text style={styles.errorText}>⚠ {errors.issue}</Text>
              </View>
            )}
          </View>

          {/* ── Section: Photos ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: C.success }]} />
              <Text style={styles.sectionTitle}>Photos</Text>
              <Text style={styles.sectionOptional}>(optional)</Text>
            </View>
            <Text style={styles.sectionSub}>Attach up to 3 photos as evidence</Text>

            <View style={styles.photoRow}>
              {photos.map((uri, i) => (
                <PhotoThumb key={i} uri={uri} onRemove={() => removePhoto(i)} />
              ))}
              {photos.length < 3 && (
                <AddPhotoBtn onPress={pickPhoto} />
              )}
            </View>
          </View>

          {/* ── Notice card ── */}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeIcon}>ℹ️</Text>
            <Text style={styles.noticeText}>
              Complaints are typically resolved within 24–48 hours. You'll receive updates via SMS.
            </Text>
          </View>

          {/* ── Submit button ── */}
          <Animated.View style={{ transform: [{ scale: submitAnim }], marginTop: vh(8) }}>
            <Pressable onPress={handleSubmit} style={styles.submitBtn}>
              <LinearGradient
                colors={[C.primary, C.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitGrad}
              >
                <Text style={styles.submitText}>Submit Complaint</Text>
                <Text style={styles.submitArrow}>→</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Success modal ── */}
      <SuccessModal
        visible={showSuccess}
        ticketId={ticketId}
        category={activeCat}
        onDone={handleDone}
      />

    </View>
  )
}

export default RaiseComplaintScreen

// ─── Styles ───────────────────────────────────────────────────────────────────
const CAT_CARD_W = (SCREEN_W - vw(32) - normalize(10) * 4) / 3
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: vw(16), paddingBottom: vh(40), gap: normalize(4) },
  keyboardView :{ flex: 1 },
  // Sections
  section: { marginTop: vh(20) },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: normalize(6), marginBottom: vh(4) },
  sectionDot: { width: normalize(8), height: normalize(8), borderRadius: normalize(4) },
  sectionTitle: { fontFamily: fonts.Bold, fontSize: normalize(15), color: C.black },
  sectionRequired: { fontFamily: fonts.Bold, fontSize: normalize(14), color: C.error, marginLeft: normalize(2) },
  sectionOptional: { fontFamily: fonts.Regular, fontSize: normalize(12), color: C.body, marginLeft: normalize(4) },
  sectionSub: { fontFamily: fonts.Regular, fontSize: normalize(12), color: C.body, marginBottom: vh(12) },

  // Category grid
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: normalize(10),
  },
  catCard: {
    width: CAT_CARD_W, borderRadius: normalize(16),
    paddingVertical: normalize(14), paddingHorizontal: normalize(10),
    alignItems: 'center', gap: normalize(8),
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 2,
    position: 'relative',
  },
  catCheck: {
    position: 'absolute', top: normalize(6), right: normalize(6),
    width: normalize(16), height: normalize(16), borderRadius: normalize(8),
    alignItems: 'center', justifyContent: 'center',
  },
  catCheckMark: { color: C.white, fontSize: normalize(9), fontFamily: fonts.Bold },
  catIconBox: {
    width: normalize(42), height: normalize(42), borderRadius: normalize(14),
    alignItems: 'center', justifyContent: 'center',
  },
  catIcon: { fontSize: normalize(20) },
  catLabel: { fontFamily: fonts.SemiBold, fontSize: normalize(10.5), textAlign: 'center', lineHeight: normalize(15) },

  // Error
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: vh(6) },
  errorText: { fontFamily: fonts.SemiBold, fontSize: normalize(12), color: C.error },

  // Text area
  textAreaWrap: {
    backgroundColor: C.card, borderRadius: normalize(16),
    overflow: 'hidden',
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  textArea: {
    fontFamily: fonts.Regular, fontSize: normalize(13), color: C.black,
    padding: normalize(14), minHeight: normalize(130),
    lineHeight: normalize(21),
  },
  textAreaFooter: {
    paddingHorizontal: normalize(14), paddingBottom: normalize(10),
    alignItems: 'flex-end',
  },
  charCount: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body },

  // Photos
  photoRow: { flexDirection: 'row', gap: normalize(10), flexWrap: 'wrap' },
  photoThumb: {
    width: normalize(78), height: normalize(78), borderRadius: normalize(14),
    overflow: 'hidden', position: 'relative',
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: normalize(4), right: normalize(4),
    width: normalize(18), height: normalize(18), borderRadius: normalize(9),
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  photoRemoveText: { color: C.white, fontSize: normalize(9), fontFamily: fonts.Bold },
  addPhotoBtn: {
    width: normalize(78), height: normalize(78), borderRadius: normalize(14),
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: normalize(4),
  },
  addPhotoIcon: { fontSize: normalize(22) },
  addPhotoLabel: { fontFamily: fonts.SemiBold, fontSize: normalize(10), color: C.body },

  // Notice
  noticeCard: {
    flexDirection: 'row', gap: normalize(10), alignItems: 'flex-start',
    backgroundColor: C.cyanBg, borderWidth: 1, borderColor: C.cyanBorder,
    borderRadius: normalize(14), padding: normalize(14), marginTop: vh(20),
  },
  noticeIcon: { fontSize: normalize(16), marginTop: normalize(1) },
  noticeText: { flex: 1, fontFamily: fonts.Regular, fontSize: normalize(12), color: C.primary, lineHeight: normalize(18) },

  // Submit
  submitBtn: { borderRadius: normalize(18), overflow: 'hidden', shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5 },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: normalize(16), gap: normalize(8) },
  submitText: { fontFamily: fonts.Bold, fontSize: normalize(16), color: C.white },
  submitArrow: { fontFamily: fonts.Bold, fontSize: normalize(18), color: 'rgba(255,255,255,0.7)' },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,22,23,0.6)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  modalCard: {
    width: SCREEN_W - vw(40), backgroundColor: C.white,
    borderRadius: normalize(28), padding: normalize(28),
    alignItems: 'center', gap: normalize(12),
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1, shadowRadius: 30, elevation: 20,
  },
  successRingOuter: {
    width: normalize(88), height: normalize(88), borderRadius: normalize(44),
    backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center',
    marginBottom: normalize(4),
  },
  successRingInner: {
    width: normalize(72), height: normalize(72), borderRadius: normalize(36),
    backgroundColor: 'rgba(39,174,96,0.14)', alignItems: 'center', justifyContent: 'center',
  },
  successCheckBox: { width: normalize(54), height: normalize(54), borderRadius: normalize(27), overflow: 'hidden' },
  successCheckGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successCheckText: { color: C.white, fontSize: normalize(26), fontFamily: fonts.Bold },
  modalTitle: { fontFamily: fonts.Bold, fontSize: normalize(20), color: C.black, textAlign: 'center' },
  modalSub: { fontFamily: fonts.Regular, fontSize: normalize(13), color: C.body, textAlign: 'center', lineHeight: normalize(20) },
  ticketCard: {
    width: '100%', backgroundColor: C.inputBg, borderRadius: normalize(16),
    padding: normalize(16), gap: normalize(4),
    borderWidth: 1, borderColor: C.border,
  },
  ticketRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketLabel: { fontFamily: fonts.Regular, fontSize: normalize(12), color: C.body },
  ticketValue: { fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black, letterSpacing: 0.6 },
  ticketCatPill: { flexDirection: 'row', alignItems: 'center', gap: normalize(5), paddingHorizontal: normalize(10), paddingVertical: normalize(4), borderRadius: normalize(20), borderWidth: 1 },
  ticketCatIcon: { fontSize: normalize(13) },
  ticketCatText: { fontFamily: fonts.SemiBold, fontSize: normalize(12) },
  doneBtn: { width: '100%', borderRadius: normalize(16), overflow: 'hidden', marginTop: normalize(4) },
  doneBtnGrad: { paddingVertical: normalize(14), alignItems: 'center' },
  doneBtnText: { fontFamily: fonts.Bold, fontSize: normalize(15), color: C.white },
})
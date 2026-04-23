import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { fetchAIInsight } from '../analyticsActions'
import {
  selectAIInsight,
  selectAIInsightLoading,
  selectAIInsightError,
  selectCurrentPrediction,
  openChat,
  clearAIInsight,
} from '../analyticsSlice'

// ─── Tone Colors ──────────────────────────────────────────────────────────────

const TONE_STYLES = {
  positive: {
    bg: 'rgba(39, 174, 96, 0.06)',
    border: 'rgba(39, 174, 96, 0.20)',
    accent: '#27AE60',
    icon: '✨',
    label: 'AI Insight',
  },
  cautionary: {
    bg: 'rgba(243, 156, 18, 0.06)',
    border: 'rgba(243, 156, 18, 0.20)',
    accent: '#F39C12',
    icon: '⚡',
    label: 'AI Alert',
  },
  urgent: {
    bg: 'rgba(231, 76, 60, 0.06)',
    border: 'rgba(231, 76, 60, 0.20)',
    accent: '#E74C3C',
    icon: '🚨',
    label: 'AI Warning',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

const AIInsightCard: React.FC = () => {
  const dispatch = useAppDispatch()
  const prediction = useAppSelector(selectCurrentPrediction)
  const insight = useAppSelector(selectAIInsight)
  const isLoading = useAppSelector(selectAIInsightLoading)
  const error = useAppSelector(selectAIInsightError)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  // Fetch insight when prediction is available and insight is not loaded
  useEffect(() => {
    if (prediction && !insight && !isLoading && !error) {
      dispatch(fetchAIInsight())
    }
  }, [prediction, insight, isLoading, error, dispatch])

  // Animate in when insight loads
  useEffect(() => {
    if (insight) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 12,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [insight])

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Generating AI insight...</Text>
      </View>
    )
  }

  // Error state — allow retry
  if (error && !insight) {
    return (
      <TouchableOpacity
        style={styles.errorCard}
        onPress={() => {
          dispatch(clearAIInsight())
          dispatch(fetchAIInsight())
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.errorIcon}>⚠️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.errorText}>Couldn't load AI insight</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </View>
      </TouchableOpacity>
    )
  }

  // No insight yet
  if (!insight) return null

  const tone = TONE_STYLES[insight.tone] || TONE_STYLES.positive

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: tone.bg,
          borderColor: tone.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.toneIcon}>{tone.icon}</Text>
          <Text style={[styles.toneLabel, { color: tone.accent }]}>
            {tone.label}
          </Text>
        </View>
        <View style={[styles.aiBadge, { backgroundColor: tone.accent }]}>
          <Text style={styles.aiBadgeText}>Gemini</Text>
        </View>
      </View>

      {/* Headline */}
      <Text style={styles.headline}>{insight.headline}</Text>

      {/* Body */}
      <Text style={styles.body}>{insight.body}</Text>

      {/* Tip */}
      <View style={[styles.tipBox, { borderLeftColor: tone.accent }]}>
        <Text style={styles.tipLabel}>💡 Tip</Text>
        <Text style={styles.tipText}>{insight.tip}</Text>
      </View>

      {/* Chat CTA */}
      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: tone.accent }]}
        onPress={() => dispatch(openChat())}
        activeOpacity={0.85}
      >
        <Text style={styles.chatButtonText}>💬 Ask AI about your usage</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default AIInsightCard

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: normalize(16),
    borderWidth: 1,
    padding: normalize(16),
    marginTop: vh(12),
    marginBottom: vh(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  toneIcon: {
    fontSize: normalize(16),
  },
  toneLabel: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
  },
  aiBadgeText: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(9),
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  headline: {
    fontFamily: fonts.Bold,
    fontSize: normalize(17),
    color: '#111111',
    marginBottom: normalize(6),
  },
  body: {
    fontFamily: fonts.Regular,
    fontSize: normalize(13),
    color: 'rgba(0,0,0,0.60)',
    lineHeight: normalize(19),
    marginBottom: normalize(12),
  },
  tipBox: {
    borderLeftWidth: 3,
    paddingLeft: normalize(10),
    paddingVertical: normalize(6),
    marginBottom: normalize(14),
  },
  tipLabel: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(11),
    color: '#111111',
    marginBottom: normalize(2),
  },
  tipText: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: 'rgba(0,0,0,0.55)',
    lineHeight: normalize(17),
  },
  chatButton: {
    borderRadius: normalize(10),
    paddingVertical: normalize(10),
    alignItems: 'center',
  },
  chatButtonText: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(13),
    color: '#FFFFFF',
  },

  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    backgroundColor: 'rgba(43,101,104,0.04)',
    borderRadius: normalize(14),
    padding: normalize(16),
    marginTop: vh(12),
  },
  loadingText: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: colors.neutralBodyText,
  },

  // Error
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    backgroundColor: 'rgba(231,76,60,0.04)',
    borderRadius: normalize(14),
    padding: normalize(14),
    marginTop: vh(12),
  },
  errorIcon: {
    fontSize: normalize(20),
  },
  errorText: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(12),
    color: '#333',
  },
  retryText: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.primary,
    marginTop: normalize(2),
  },
})

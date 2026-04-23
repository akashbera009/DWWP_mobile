import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import colors from '@dwwp/utils/colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import fonts from '@dwwp/utils/fonts'
import { normalize, screenWidth, vh, vw } from '@dwwp/utils/dimensions'
import { strings } from '@dwwp/utils/strings'

import EffectiveTotal from '../components/EffectiveTotal'
import DailyBreakDown from '../components/DailyBreakDown'
import MonthlyBreakDown from '../components/MonthlyBreakDown'
import { localImages } from '@dwwp/utils/localimages'
import TrendCard from '../components/TrendCard'
import AIInsightCard from '../components/AIInsightCard'
import AIChatSheet from '../components/AIChatSheet'

const SCREEN_WIDTH = screenWidth;
const MARGIN_BOTH_SIDE = vw(16)

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary: '#2B6568',
  primaryDark: '#1e4a4d',
  primaryLight: 'rgba(43,101,104,0.10)',
  primaryBorder: 'rgba(43,101,104,0.18)',
  cyan: '#32C2CA',
  cyanBg: 'rgba(50,194,202,0.10)',
  cyanBorder: 'rgba(50,194,202,0.22)',
  white: '#FFFFFF',
  black: '#041617',
  body: '#6A7C92',
  border: '#E1E8ED',
  bg: '#F4F7F8',
  card: '#FFFFFF',
  error: '#E74C3C',
  errorBg: 'rgba(231,76,60,0.08)',
  errorBorder: 'rgba(231,76,60,0.20)',
  warning: '#F39C12',
  warningBg: 'rgba(243,156,18,0.08)',
  warningBorder: 'rgba(243,156,18,0.22)',
  success: '#27AE60',
  successBg: 'rgba(39,174,96,0.08)',
  successBorder: 'rgba(39,174,96,0.20)',
  inputBg: '#EFF2F5',
  shadow: 'rgba(43,101,104,0.10)',
  purple: '#7B68EE',
  purpleBg: 'rgba(123,104,238,0.10)',
}

const AnalyticsPage = () => {
  const { top } = useSafeAreaInsets()

  const innerScrollRef = useRef<ScrollView | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [currentBreaskDown, setCurrentBreakDown] = useState<number>(0)
  const breakDownWindows = ['month', 'daily']

  const startTimer = () => {
    if (timerRef?.current) return
    timerRef.current = setInterval(() => {
      const maxIdx = breakDownWindows.length - 1
      setCurrentBreakDown(prev => prev < maxIdx ? prev + 1 : 0)
    }, 4000)
  }
  const stopTimer = () => {
    if (timerRef?.current) {
      clearInterval(timerRef?.current)
      timerRef.current = null
    }
  }
  useEffect(() => {
    startTimer()
    return () => stopTimer()
  }, [])
  useEffect(() => {
    innerScrollRef?.current?.scrollTo({
      x: currentBreaskDown * screenWidth,
      animated: true
    })
  }, [currentBreaskDown])

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.homeHeaderContainer}>
        <Text style={styles.homeHeaderText}>{strings.analytics}</Text>
      </View>
      <View style={styles.stickeyHeader} />
      <ScrollView style={styles.scrollview}>
        <ScrollView
          ref={innerScrollRef}
          onMomentumScrollBegin={() => {
            stopTimer()
          }}
          onMomentumScrollEnd={(e) => {
            const nextIdx = e.nativeEvent.contentOffset.x
            setCurrentBreakDown(nextIdx)
            startTimer()
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.horizontalScrollView}
        >
          <View style={styles.page}>
            <MonthlyBreakDown />
          </View>

          <TouchableOpacity
            hitSlop={16}
            onPress={() => {
              setCurrentBreakDown(currentBreaskDown === 0 ? 1 : 0)
            }}
            style={[styles.nextButton,
            {
              transform: [
                { rotate: currentBreaskDown === 0 ? '-90deg' : '90deg' },
                { translateY: currentBreaskDown !== 0 ? vw(-20) : 0 }
              ],
            }
            ]}>

            <Image source={localImages.downarrow}
              style={styles.nextButtonImage} />
          </TouchableOpacity>

          <View style={styles.page}>
            <DailyBreakDown />
          </View>
        </ScrollView>

        <View style={styles.mainContent}>
          <Text style={styles.sectionLabelText}>Predicted Usages</Text>
          <TrendCard />

          {/* ── AI Insight Card ── */}
          <AIInsightCard />

          {/* ── Effective total summary ── */}
          <EffectiveTotal />
        </View>
      </ScrollView>

      {/* ── AI Chat Bottom Sheet (rendered above everything) ── */}
      <AIChatSheet />
    </View>
  )
}

export default AnalyticsPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary
  },
  scrollview: {
    backgroundColor: colors.overlayBackground,
    paddingTop: vh(16),
    paddingBottom: vh(16)
  },
  horizontalScrollView: {
    paddingHorizontal: vw(16),
  },
  page: {
    width: SCREEN_WIDTH - 2 * MARGIN_BOTH_SIDE,
    marginRight: MARGIN_BOTH_SIDE,
    paddingRight: vw(16),
  },
  nextButton: {
    height: vh(22),
    width: vh(22),
    borderRadius: normalize(20),
    position: 'relative',
    right: vw(25),
    top: '50%',
    backgroundColor: colors.activeDotLight,
  },
  nextButtonImage: {
    height: vh(22),
    width: vh(22),
    resizeMode: 'cover',
  },
  homeHeaderContainer: {
    backgroundColor: colors.primary,
    minHeight: vh(70),
    justifyContent: 'center'
  },
  homeHeaderText: {
    fontFamily: fonts.Bold,
    fontSize: normalize(20),
    color: colors.white,
    marginHorizontal: vw(16),
    marginVertical: vh(6)
  },
  stickeyHeader: {
    position: 'absolute'
  },
  mainContent: {
    flexGrow: 1,
    marginHorizontal: vw(16)
  },
  sectionLabelText: {
    fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black, flexShrink: 0,
  },
  // Trend card
  trendCard: {
    marginTop: vh(8),
    flexDirection: 'row', alignItems: 'center', gap: normalize(10),
    borderRadius: normalize(14), borderWidth: normalize(3),
    padding: normalize(13), marginBottom: normalize(12),
  },
  trendIcon: { fontSize: normalize(18) },
  trendLabel: { fontFamily: fonts.SemiBold, fontSize: normalize(13) },
  trendSub: {
    fontFamily: fonts.Regular, fontSize: normalize(11),
    color: C.body, marginTop: vh(2),
  },

})

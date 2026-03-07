import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UsageChart from '../dashboard/components/UsageChart'
import colors from '@dwwp/utils/colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import fonts from '@dwwp/utils/fonts'
import { normalize, screenWidth, vh, vw } from '@dwwp/utils/dimensions'
import { strings } from '@dwwp/utils/strings'
import { MOCK_ADDONS, MOCK_MONTH_DATA } from '../dashboard/Monthlyusagedetail'
import { getDaysInMonth, getTrend } from '@dwwp/utils/commonFunctions'
import EffectiveTotal from './components/EffectiveTotal'
import DailyBreakDown from './components/DailyBreakDown'
import MonthlyBreakDown from './components/MonthlyBreakDown'

const SCREEN_WIDTH = screenWidth;
const MARGIN_BOTH_SIDE = vw(20)
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(2)}kL` : `${Math.round(n)}L`
const fmtD = (n: number) => `${n.toFixed(1)}L`

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


const addons = MOCK_ADDONS
const monthData = MOCK_MONTH_DATA

const AnalyticsPage = () => {

  const { top } = useSafeAreaInsets()
  const daysInMonth = getDaysInMonth('This Month')
  const dayOfMonth = new Date().getDate()


  const totalConsumed = Object.values(monthData.dailyUsages).reduce((s, v) => s + v, 0)
  const totalAddonLiters = addons.reduce((s, a) => s + a.quantityDone, 0)
  const effectiveLimit = monthData.limit + totalAddonLiters

  const trend = getTrend(totalConsumed, effectiveLimit, dayOfMonth, daysInMonth)

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.homeHeaderContainer}>
        <Text style={styles.homeHeaderText}>{strings.analytics}</Text>
      </View>
      <ScrollView style={
        styles.scrollview
      }
        StickyHeaderComponent={() => (
          <Text>hi</Text>
        )}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
        >
          <View style={styles.page}>
            <MonthlyBreakDown />
          </View>
          <View style={styles.page}>
            <DailyBreakDown />
          </View>
        </ScrollView>

        <View style={styles.mainContent}>
          {/* ── Trend alert ── */}
          {!monthData.isMonthFinish && (
            <View style={[styles.trendCard, {
              backgroundColor: `${trend.color}10`,
              borderColor: `${trend.color}28`,
            }]}>
              <Text style={styles.trendIcon}>{trend.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.trendLabel, { color: trend.color }]}>{trend.label}</Text>
                <Text style={styles.trendSub}>
                  Day {dayOfMonth} of {daysInMonth}  ·  Expected {fmt((dayOfMonth / daysInMonth) * effectiveLimit)} by now
                </Text>
              </View>
            </View>
          )}

          {/* ── Effective total summary ── */}
          <EffectiveTotal />

        </View>
      </ScrollView>
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
    paddingTop: vh(16)
  },
  page: {
    width: SCREEN_WIDTH - 2 * MARGIN_BOTH_SIDE,
    marginRight: MARGIN_BOTH_SIDE
  },
  homeHeaderContainer: {
    backgroundColor: colors.primary
  },
  homeHeaderText: {
    fontFamily: fonts.Bold,
    fontSize: normalize(20),
    color: colors.white,
    marginHorizontal: vw(16),
    marginVertical: vh(6)
  },
  mainContent: {
    flexGrow: 1,
    marginHorizontal: vw(16)
  },
  // Trend card
  trendCard: {
    marginTop: vh(8),
    flexDirection: 'row', alignItems: 'center', gap: normalize(10),
    borderRadius: normalize(14), borderWidth: 1,
    padding: normalize(13), marginBottom: normalize(12),
  },
  trendIcon: { fontSize: normalize(18) },
  trendLabel: { fontFamily: fonts.SemiBold, fontSize: normalize(13) },
  trendSub: {
    fontFamily: fonts.Regular, fontSize: normalize(11),
    color: C.body, marginTop: vh(2),
  },

})

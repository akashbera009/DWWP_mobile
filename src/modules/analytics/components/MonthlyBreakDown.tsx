import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import LinearGradient from 'react-native-linear-gradient'
import colors from '@dwwp/utils/colors'
import Pill from '@dwwp/modules/dashboard/components/Pill'
import { getCurrentMonthKey, getShortMonthNameByMonthKey } from '@dwwp/utils/commonFunctions'
import { useAppSelector } from '@dwwp/store/hooks'


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

const MonthlyBreakDown = () => {
  const usedHistoryObject = useAppSelector(s => s.usage.allTimeMonths)
  const monthKeys: string[] = Object.keys(usedHistoryObject).map((e) => {
    return getShortMonthNameByMonthKey(e)
  })
  const usedInLitres: number[] = Object.values(usedHistoryObject).map((e) => {
    return Number(e?.toFixed(0) ?? 0 )
  })

  const [finalObjectArray, setFinalObjectArray] = useState<{ month: string, value: number }[]>([{ month: '', value: 0 }])
  let currenMonthKey = getCurrentMonthKey()
  const thisMonthUsages = useAppSelector(s => s.usage.months[currenMonthKey]?.total)
  currenMonthKey = getShortMonthNameByMonthKey(currenMonthKey)

  const [activeBar, setActiveBar] = useState(finalObjectArray?.length - 1)
  useEffect(() => {
    let temp = monthKeys.map((month, i) => {
      return {
        month: month,
        value: usedInLitres[i]
      }
    })
    temp = temp.reverse().slice(0, 6).reverse()
    temp.push({ month: currenMonthKey, value: thisMonthUsages })
    setFinalObjectArray(temp);
  }, [])
  useEffect(() => {
    if (finalObjectArray?.length === 0) return
    setActiveBar(finalObjectArray?.length - 1)
  }, [finalObjectArray?.length])

  const MAX_VAL = Math.floor(Math.max(...finalObjectArray?.map((d) => d.value)))

  const MAX_VAL_MONTH = finalObjectArray?.reduce((max, item) =>
    item.value > max.value ? item : max
  );

  const AVG_VAL = Math.floor(finalObjectArray?.reduce((prev, d, _) => (d.value + prev), 0) / finalObjectArray?.length)

  return (
    <>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>Monthly Breakdown</Text>
        <View style={styles.sectionLine} />
        <Pill
          label='Last 7 Months'
          color={colors.primary}
          bg={colors.primaryLight}
        />
      </View>

      {/* Bars */}
      <View style={[styles.card, { paddingBottom: normalize(10) }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartLegendRow}>
            <View style={[styles.legendDot, { backgroundColor: C.error, marginLeft: normalize(10) }]} />
            <Text style={styles.legendText}>Peak:
              <Text style={{ fontFamily: fonts.Bold, color: colors.neutralBlack }}>{MAX_VAL_MONTH?.month}: {MAX_VAL_MONTH?.value} L</Text>
            </Text>
            <View style={[styles.legendDot, { backgroundColor: C.cyan }]} />
            <Text style={styles.legendText}>
              Avg:
              <Text style={{ fontFamily: fonts.Bold, color: colors.neutralBlack }}>{AVG_VAL} L/Month</Text>
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {finalObjectArray?.map((d, i) => {
            const isActive = i === activeBar
            const barH = Math.round((d.value / MAX_VAL) * 100)
            return (
              <TouchableOpacity
                key={d.month}
                activeOpacity={0.8}
                onPress={() => setActiveBar(i)}
                style={styles.barWrapper}
              >
                {isActive && (
                  <View style={styles.barTooltip}>
                    <Text style={styles.barTooltipText}>{d.value}</Text>
                    <View style={styles.barTooltipArrow} />
                  </View>
                )}
                {isActive ? (
                  <LinearGradient
                    colors={[colors.activeDot, colors.primary]}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    style={[styles.bar, { height: barH }]}
                  />
                ) : (
                  <View style={[styles.bar, { height: barH, backgroundColor: i < activeBar ? colors.disabledBorder : colors.inputBackground }]} />
                )}
                <Text style={[styles.barLabel, isActive && { color: colors.primary, fontFamily: fonts.Bold }]} numberOfLines={1}>
                  {d.month}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </>
  )
}

export default MonthlyBreakDown

const styles = StyleSheet.create({
  // Section labels
  sectionLabel: {
    flexDirection: 'row', alignItems: 'center',
    gap: normalize(10), marginBottom: normalize(10), marginTop: normalize(6),
  },
  sectionLabelText: {
    fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black, flexShrink: 0,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: C.border },
  sectionLabelMeta: {
    fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body, flexShrink: 0,
  },

  // Chart badge
  chartBadge: {
    borderRadius: normalize(10),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
  },
  chartBadgeText: {
    fontFamily: fonts.Bold,
    fontSize: normalize(11),
    color: colors.white,
  },
  chartCallout: {
    marginBottom: vh(14),
    paddingVertical: vh(10),
    paddingHorizontal: normalize(12),
    backgroundColor: colors.lightGreen,
    borderRadius: normalize(12),
    borderLeftWidth: 3,
    borderLeftColor: colors.activeDot,
  },
  chartCalloutValue: {
    fontFamily: fonts.Bold,
    fontSize: normalize(20),
    color: colors.primary,
  },
  chartCalloutUnit: {
    fontFamily: fonts.Regular,
    fontSize: normalize(13),
    color: colors.neutralBodyText,
  },
  chartCalloutMonth: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.neutralBodyText,
    marginTop: vh(2),
  },
  barTooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: normalize(5),
    borderRightWidth: normalize(5),
    borderTopWidth: normalize(5),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    alignSelf: 'center',
  },
  chartSummaryRow: {
    flexDirection: 'row',
    gap: normalize(16),
    marginTop: vh(12),
    paddingTop: vh(12),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  chartSummaryDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
  },
  chartSummaryLabel: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.neutralBodyText,
  },

  card: {
    backgroundColor : C.card , 
    borderRadius: normalize(20),
    padding: normalize(18), marginBottom: normalize(12),
    shadowColor: 'rgba(43,101,104,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 3,
  },
  // Day bar chart
  chartHeader: { marginBottom: normalize(6) },
  chartLegendRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: normalize(5),
  },
  avgLineLabel: {
    fontFamily: fonts.Regular, fontSize: normalize(10),
    color: C.body, marginBottom: normalize(6),
  },
  dayChartScroll: { marginHorizontal: -normalize(4) },
  dayChartInner: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: normalize(4), gap: normalize(5),
    paddingBottom: normalize(4),
  },

  legendDot: {
    width: normalize(8), height: normalize(8), borderRadius: normalize(4),
  },
  legendText: {
    fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body,
  },
  // Chart
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: normalize(130),
    gap: vw(6),
    marginTop: vh(12),
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: vh(6),
  },
  bar: {
    width: '100%',
    borderRadius: normalize(10),
    minHeight: normalize(4),
  },
  barLabel: {
    fontFamily: fonts.Regular,
    fontSize: normalize(10),
    color: colors.neutralBodyText,
  },
  barTooltip: {
    backgroundColor: colors.primary,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(3),
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  barTooltipText: {
    fontFamily: fonts.Bold,
    fontSize: normalize(10),
    color: colors.white,
  },

})
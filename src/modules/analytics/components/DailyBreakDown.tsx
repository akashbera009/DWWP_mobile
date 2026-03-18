import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import DayBar from './DayBar'
import fonts from '@dwwp/utils/fonts'
import { normalize } from '@dwwp/utils/dimensions'
import { fmtD, getCurrentMonthKey } from '@dwwp/utils/commonFunctions'
import Pill from '@dwwp/modules/dashboard/components/Pill'
import colors from '@dwwp/utils/colors'
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

const DailyBreakDown = () => {
    const monthKey = useMemo(() => getCurrentMonthKey(), [])
    const rawdata = useAppSelector(s => s.usage?.months[monthKey]?.days)

    const { 
        entries,
        maxDay,
        avgDay,
        today,
        avgUsagesPerDay
    } = useMemo(() => {
        if (!rawdata) {
            return {
                monthKeys: [],
                values: [],
                monthData: [],
                totalConsumed: 0,
                entries: [],
                maxDay: 1,
                avgDay: 0,
                today: new Date().toISOString().slice(0, 10),
                avgUsagesPerDay: 0
            };
        }

        const monthKeys = Object.keys(rawdata);

        const values = Object.values(rawdata).map((e) =>
            Number(e.toFixed(0))
        );

        const monthData = values.map((e, i) => ({
            day: monthKeys[i],
            value: e
        }));

        const totalConsumed = values.reduce((s, v) => s + v, 0);

        const entries = [...monthData].sort((a, b) =>
            a.day.localeCompare(b.day)
        )

        const maxDay = Math.max(...entries.map((v) => v.value), 1);

        const avgDay = totalConsumed / Math.max(entries.length, 1);

        const today = new Date().toISOString().slice(0, 10);

        const avgUsagesPerDay = fmtD(avgDay);

        return {
            monthKeys,
            values,
            monthData,
            totalConsumed,
            entries,
            maxDay,
            avgDay,
            today,
            avgUsagesPerDay
        };
    }, [rawdata]);
    return (
        <>
            <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabelText}>Daily Breakdown</Text>
                <View style={styles.sectionLine} />
                <Pill
                    label={`${'avg ' + avgUsagesPerDay + '/day'}`}
                    color={colors.primary}
                    bg={colors.primaryLight}
                />
            </View>

            <View style={[styles.card, { paddingBottom: normalize(10) }]}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartLegendRow}>
                        <View style={[styles.legendDot, { backgroundColor: C.cyan }]} />
                        <Text style={styles.legendText}>Normal</Text>
                        <View style={[styles.legendDot, { backgroundColor: C.warning, marginLeft: normalize(10) }]} />
                        <Text style={styles.legendText}>Above avg</Text>
                        <View style={[styles.legendDot, { backgroundColor: C.error, marginLeft: normalize(10) }]} />
                        <Text style={styles.legendText}>High</Text>
                        <View style={[styles.legendDot, { backgroundColor: C.primary, marginLeft: normalize(10) }]} />
                        <Text style={styles.legendText}>Today</Text>
                    </View>
                </View>

                {/* Avg line label */}
                <Text style={styles.avgLineLabel}>── avg {fmtD(avgDay)}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayChartScroll}>
                    <View style={styles.dayChartInner}>
                        {entries.map((currDay, i ) => {
                            const day = currDay?.day.slice(-2)
                            return (
                                <DayBar
                                    key={i}
                                    day={day}
                                    value={currDay?.value}
                                    max={maxDay}
                                    isToday={currDay?.day === today}
                                    avg={avgDay}
                                />
                            )
                        })}
                    </View>
                </ScrollView>
            </View>

        </>)
}

export default DailyBreakDown

const styles = StyleSheet.create({
    card: {
        backgroundColor: C.card, borderRadius: normalize(20),
        padding: normalize(18), marginBottom: normalize(12),
        shadowColor: 'rgba(43,101,104,0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 10, elevation: 3,
    },

    legendDot: {
        width: normalize(8), height: normalize(8), borderRadius: normalize(4),
    },
    legendText: {
        fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body,
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

})
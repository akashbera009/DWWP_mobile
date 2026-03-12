import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import LinearGradient from 'react-native-linear-gradient'
import Pill from './Pill'
import colors from '@dwwp/utils/colors'
import { useAppSelector } from '@dwwp/store/hooks'
import { getCurrentMonthKey, getShortMonthNameByMonthKey } from '@dwwp/utils/commonFunctions'


const UsageChart = () => {
    const usedHistoryObject = useAppSelector(s => s.usage.allTimeMonths)
    const monthKeys: string[] = Object.keys(usedHistoryObject).map((e) => {
        return getShortMonthNameByMonthKey(e)
    })
    const usedInLitres: number[] = Object.values(usedHistoryObject).map((e) => {
        return Number(e.toFixed(0))
    })

    const [finalObjectArray, setFinalObjectArray] = useState<{ month: string, value: number }[]>([{ month: '', value: 0 }])
    let currenMonthKey = getCurrentMonthKey()
    const thisMonthUsages = useAppSelector(s => s.usage.months[currenMonthKey]?.total)
    currenMonthKey = getShortMonthNameByMonthKey(currenMonthKey)

    const [activeBar, setActiveBar] = useState(finalObjectArray.length - 1)
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
        if (finalObjectArray.length === 0) return
        setActiveBar(finalObjectArray.length - 1)
    }, [finalObjectArray.length])

    const MAX_VAL = Math.floor(Math.max(...finalObjectArray.map((d) => d.value)))
    const AVG_VAL = Math.floor(finalObjectArray.reduce((prev, d, _) => (d.value + prev), 0) / finalObjectArray.length)
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeaderRow}>
                <View>
                    <Text style={styles.cardTitle}>Monthly Usage{activeBar}</Text>
                    <Text style={styles.cardSubtitle}>Kilowatt hours · Jan 2025</Text>
                </View>
                <Pill label="This Year" color={colors.primary} bg={colors.primaryLight} />
            </View>

            {/* Bars */}
            <View style={styles.chartContainer}>
                {finalObjectArray.map((d, i) => {
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
                            <Text style={[styles.barLabel, isActive && { color: colors.primary, fontFamily: fonts.Bold }]}>
                                {d.month}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* Summary row */}
            <View style={styles.chartSummaryRow}>
                <View style={styles.chartSummaryItem}>
                    <View style={[styles.chartSummaryDot, { backgroundColor: colors.activeDot }]} />
                    <Text style={styles.chartSummaryLabel}>Peak: <Text style={{ fontFamily: fonts.Bold, color: colors.neutralBlack }}>Nov ·{MAX_VAL} Litres</Text></Text>
                </View>
                <View style={styles.chartSummaryItem}>
                    <View style={[styles.chartSummaryDot, { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.border }]} />
                    <Text style={styles.chartSummaryLabel}>Avg: <Text style={{ fontFamily: fonts.Bold, color: colors.neutralBlack }}>{AVG_VAL} Litres/Month</Text></Text>
                </View>
            </View>
        </View>
    )
}


export default UsageChart

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: normalize(20),
        padding: normalize(20),
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: vh(14),
    },
    cardTitle: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: colors.neutralBlack,
    },
    cardSubtitle: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
        marginTop: vh(2),
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


    // Chart
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: normalize(130),
        gap: vw(6),
        marginTop: vh(4),
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
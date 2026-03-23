import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { useAppSelector } from '@dwwp/store/hooks'
import { localImages } from '@dwwp/utils/localimages'

type StatItem = {
    icon: ImageSourcePropType;
    label: string;
    value: string;
    subScript?: string;
    sub: string;
    accent: string;
    trend?: number;
    bg: string
}

const StatGrid = () => {
    let billingCycle
    let nextBillRemainingdays
    const [statGrid, setStatGrid] = useState<StatItem[]>([
        // { icon: '⚡', label: 'Today', value: '0', subScript: 'litres', sub: '+0% vs last mo', accent: colors.activeDot, trend: 12, bg: 'rgba(50,194,202,0.08)' },
        { icon: localImages.alert, label: 'Penalty', value: '₹0', sub: '2 need attention', accent: colors.warning, trend: undefined, bg: 'rgba(243,156,18,0.08)' },
        // { icon: '📡', label: 'Regular Price', value: '₹0', sub: 'All zones active', accent: colors.success, trend: undefined, bg: 'rgba(39,174,96,0.08)' },
        { icon: localImages.calendar2, label: 'Billing Cycle', value: `0`, subScript: 'days', sub: `0 days Until next bill`, accent: colors.secondary, trend: undefined, bg: colors.primaryLight },
    ]
    )
    const now = new Date()
    const todayUse = useAppSelector(s => s.usage.todayUsage)
    useEffect(() => {
        const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
        billingCycle = daysInMonth(now.getFullYear(), now.getMonth() + 1)
        nextBillRemainingdays = billingCycle - now.getDate()
        setStatGrid([
            // { icon: '⚡', label: 'Today', value: todayUse.toString(), subScript: 'litres', sub: '+12% vs last mo', accent: colors.activeDot, trend: 12, bg: 'rgba(50,194,202,0.08)' },
            { icon: localImages.alert, label: 'Penalty', value: '₹0', sub: '2 need attention', accent: colors.warning, trend: undefined, bg: 'rgba(243,156,18,0.08)' },
            // { icon:localImages.rupee_indian, label: 'Regular Price', value: `₹0`, sub: 'All zones active', accent: colors.secondary, trend: undefined,  bg: colors.primaryLight},
            { icon: localImages.calendar2, label: 'Billing Cycle', value: `${billingCycle}`, subScript: 'days', sub: `${nextBillRemainingdays} days Until next bill`,accent: colors.info, trend: undefined, bg: 'rgba(39, 154, 174, 0.08)' },
        ])
    }, [])

    return (
        <View style={styles.statGrid}>
            {statGrid.map((item, i) => (
                <View key={i} style={[styles.statGridCard, { backgroundColor: colors.white, borderTopColor: item.accent, borderTopWidth: 3 }]}>
                    <View style={styles.oneline}>
                        <View style={[styles.statGridIconBox, { backgroundColor: item.bg }]}>
                            <Image
                                source={item.icon}
                                style={[styles.icon, {tintColor : item.accent}]}
                            />
                        </View>
                        <View>
                            <Text style={styles.statGridLabel}>{item.label}</Text>
                            <View style={styles.statGridValueRow}>
                                <Text style={styles.statGridValue} numberOfLines={1}>{item.value}</Text>
                                {item.subScript && (
                                    <Text style={styles.statGridValueSubScript}>{item.subScript}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                    <View style={styles.statGridFooter}>
                        {item.trend && (
                            <Text style={[styles.statGridTrend, { color: item.trend >= 0 ? colors.success : colors.error }]}>
                                {item.trend >= 0 ? '▲' : '▼'} {Math.abs(item.trend)}%{'  '}
                            </Text>
                        )}
                        <Text style={[styles.statGridSub, { color: item.accent }]} numberOfLines={1}>{item.sub}</Text>
                    </View>
                </View>
            ))}
        </View>
    )
}
export default StatGrid

const styles = StyleSheet.create({
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: normalize(10),
    },
    statGridCard: {
        width: '47.5%',
        borderRadius: normalize(18),
        padding: normalize(8),
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: normalize(10),
        elevation: 10,
        gap: vh(4),
        // borderWidth : 1
    },
    oneline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: vw(10),
        // borderWidth : 1 
    },
    statGridIconBox: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(13),
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: vh(2),
    },
    icon: {
        height: vh(24),
        width: vh(24),
    },
    statGridIcon: {
        fontSize: normalize(19),
    },
    statGridValueRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        overflow: 'hidden'
    },
    statGridValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(22),
        color: colors.neutralBlack,
        lineHeight: normalize(26),
    },
    statGridValueSubScript: {
        marginLeft: vw(6),
        fontSize: normalize(14),
        color: colors.neutralBlack,
        fontFamily: fonts.Medium
    },
    statGridLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
    },
    statGridFooter: {
        borderTopColor: colors.border,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // flexWrap: 'wrap',
        // marginTop: vh(2),
        // borderWidth : 1 
    },
    statGridTrend: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(10),
    },
    statGridSub: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(10),
    },

})
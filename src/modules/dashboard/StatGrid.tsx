import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'

const colors = {
    primary: '#2B6568',
    primaryLight: 'rgba(43,101,104,0.12)',
    primaryDark: '#1e4a4d',
    activeDot: '#32C2CA',
    activeDotLight: 'rgba(50,194,202,0.18)',
    lightGreen: 'rgba(50,194,202,0.08)',
    white: '#FFFFFF',
    neutralBlack: '#041617',
    neutralBodyText: '#6A7C92',
    background: '#F4F7F8',
    border: '#E1E8ED',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    lightGray: '#F8F9FA',
    inputBackground: '#EFF2F5',
    shadow: 'rgba(43,101,104,0.10)',
    cardShadow: 'rgba(43,101,104,0.08)',
    primaryDisabled: '#4A8A8D',
}
type StatItem = { icon: string; label: string; value: string; sub: string; accent: string; trend?: number; bg: string }

const STAT_GRID: StatItem[] = [
    { icon: '⚡', label: 'Total Usage',    value: '590 kWh', sub: '+12% vs last mo',  accent: colors.activeDot, trend: 12,  bg: 'rgba(50,194,202,0.08)'  },
    { icon: '🚨', label: 'Active Alerts',  value: '3',       sub: '2 need attention', accent: colors.warning,   trend: undefined, bg: 'rgba(243,156,18,0.08)' },
    { icon: '📡', label: 'Online Devices', value: '3 / 4',   sub: 'All zones active', accent: colors.success,   trend: undefined, bg: 'rgba(39,174,96,0.08)'  },
    { icon: '📅', label: 'Billing Cycle',  value: '22 days', sub: 'Until next bill',  accent: colors.primary,   trend: -4,  bg: colors.primaryLight       },
]

const StatGrid = () => (
    <View style={styles.statGrid}>
        {STAT_GRID.map((item, i) => (
            <View key={item.label} style={[styles.statGridCard, { backgroundColor: colors.white , borderTopColor: item.accent, borderTopWidth: 3 }]}>
                <View style={[styles.statGridIconBox, { backgroundColor: item.bg }]}>
                    <Text style={styles.statGridIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.statGridValue}>{item.value}</Text>
                <Text style={styles.statGridLabel}>{item.label}</Text>
                <View style={styles.statGridFooter}>
                    {item.trend !== undefined && (
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
export default StatGrid

const styles = StyleSheet.create({

        // Stat Grid
        statGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: normalize(10),
        },
        statGridCard: {
            width: '47.5%',
            borderRadius: normalize(18),
            padding: normalize(16),
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 3,
            gap: vh(4),
        },
        statGridIconBox: {
            width: normalize(40),
            height: normalize(40),
            borderRadius: normalize(13),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: vh(2),
        },
        statGridIcon: {
            fontSize: normalize(19),
        },
        statGridValue: {
            fontFamily: fonts.Bold,
            fontSize: normalize(22),
            color: colors.neutralBlack,
            lineHeight: normalize(26),
        },
        statGridLabel: {
            fontFamily: fonts.Regular,
            fontSize: normalize(12),
            color: colors.neutralBodyText,
        },
        statGridFooter: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: vh(2),
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
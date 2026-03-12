import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
// import colors from '@dwwp/utils/colors'
import { normalize, vh } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { useAppSelector } from '@dwwp/store/hooks'
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

const FixedCharges = () => {
    const limitConfig = useAppSelector(state => state.dashboard.limitConfig)
    const priceConfig = useAppSelector(state => state.dashboard.priceConfig)

    const FIXED_CHARGES = [
        {
            label: 'Regular Price',
            value: `₹${priceConfig?.regularPrice}/L`,
            color: colors.primary,
            ribbon: 'price'
        },
        {
            label: 'Penalty Price',
            value: `₹${priceConfig?.penaltyPrice}/L`,
            color: colors.error,
            ribbon: 'price'
        },
        {
            label: 'Regular Limit',
            value: `${limitConfig?.regular} L`,
            color: colors.activeDot,
            ribbon: 'limit'
        },
        {
            label: 'Penalty Limit',
            value: `${limitConfig?.penalty} L`,
            color: colors.warning,
            ribbon: 'limit'
        },
        {
            label: 'Max Limit',
            value: `${limitConfig?.max} L`,
            color: colors.neutralBodyText,
            ribbon: 'limit'
        },
    ]
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Fixed Charges</Text>
            {FIXED_CHARGES.map((item, i) => (
                <View key={item.label} style={[styles.chargeRow, i < FIXED_CHARGES.length - 1 && styles.chargeRowBorder]}>
                    <View style={styles.chargeLeft}>
                        <View style={[styles.chargeDot, { backgroundColor: item.color }]} />
                        <Text style={styles.chargeLabel}>{item.label}</Text>
                    </View>
                    <Text style={[styles.chargeValue, { color: item.color }]}>{item.value}</Text>
                </View>
            ))}
        </View>
    )
}

export default FixedCharges

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
    cardTitle: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: colors.neutralBlack,
    },
    chargeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: normalize(11),
    },
    chargeRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    chargeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    chargeDot: {
        width: normalize(8),
        height: normalize(8),
        borderRadius: normalize(4),
    },
    chargeLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(13),
        color: colors.neutralBlack,
    },
    chargeValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
    },

})
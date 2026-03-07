import { StyleSheet, Text, View, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { normalize } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
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

interface DayBarProps {
    day: string    // "04"
    value: number
    max: number
    isToday: boolean
    avg: number
}

const DayBar: React.FC<DayBarProps> = ({ day, value, max, isToday, avg }) => {
    const anim = useRef(new Animated.Value(0)).current
    const BAR_MAX_H = normalize(60)

    useEffect(() => {
        Animated.timing(anim, {
            toValue: value / Math.max(max, 1),
            duration: 700,
            delay: parseInt(day, 10) * 18,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start()
    }, [value, max])

    const barH = anim.interpolate({ inputRange: [0, 1], outputRange: [normalize(3), BAR_MAX_H] })
    const barColor = value > avg * 1.3 ? C.error : value > avg * 1.1 ? C.warning : C.cyan

    return (
        <View style={styles.dayBarWrapper}>
            {isToday && <View style={styles.dayBarTodayDot} />}
            <View style={[styles.dayBarTrack, { height: BAR_MAX_H }]}>
                <Animated.View style={[
                    styles.dayBarFill,
                    { height: barH, backgroundColor: isToday ? C.primary : barColor }
                ]} />
            </View>
            <Text style={[styles.dayBarLabel, isToday && { color: C.primary, fontFamily: fonts.Bold }]}>
                {day}
            </Text>
        </View>
    )
}


export default DayBar

const styles = StyleSheet.create({
    dayBarWrapper: {
        alignItems: 'center', width: normalize(22), gap: normalize(4),
    },
    dayBarTodayDot: {
        width: normalize(4), height: normalize(4), borderRadius: normalize(2),
        backgroundColor: C.primary, marginBottom: normalize(2),
    },
    dayBarTrack: {
        width: '100%', justifyContent: 'flex-end',
        backgroundColor: C.inputBg, borderRadius: normalize(4),
    },
    dayBarFill: {
        width: '100%', borderRadius: normalize(4), minHeight: normalize(3),
    },
    dayBarLabel: {
        fontFamily: fonts.Regular, fontSize: normalize(9), color: C.body,
    },
})
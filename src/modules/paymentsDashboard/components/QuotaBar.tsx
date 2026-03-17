
import React, { useRef, useEffect } from 'react'
import {
    View, Text, StyleSheet, Animated,
} from 'react-native'

import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'

// ─── Quota bar component ──────────────────────────────────────────────────────
export const QuotaBar: React.FC<{
    previousLimit: number
    addedLimit: number
    currentUsage: number
    newLimit: number
}> = ({ previousLimit, addedLimit, currentUsage, newLimit }) => {

    // We animate two things:
    // 1. The "used" bar — stays the same width, just redraws against new total
    // 2. The "added" segment — grows from 0 to its final width after a short delay
    const addedAnim = useRef(new Animated.Value(0)).current
    const labelOpacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.sequence([
            Animated.delay(600),
            Animated.parallel([
                Animated.spring(addedAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: false }),
                Animated.timing(labelOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
        ]).start()
    }, [])

    const usedPct = Math.min((currentUsage / newLimit) * 100, 100)
    const addedPct = Math.min((addedLimit / newLimit) * 100, 100)
    const prevUsedPct = Math.min((currentUsage / previousLimit) * 100, 100)

    const addedBarWidth = addedAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', `${addedPct.toFixed(2)}%`],
    })

    return (
        <View style={qStyles.wrap}>
            {/* Title row */}
            <View style={qStyles.titleRow}>
                <Text style={qStyles.title}>Quota Updated</Text>
                <Animated.View style={[qStyles.addedBadge, { opacity: labelOpacity }]}>
                    <Text style={qStyles.addedBadgeText}>+{addedLimit.toLocaleString()} L added</Text>
                </Animated.View>
            </View>

            {/* Bar track */}
            <View style={qStyles.track}>
                {/* Used portion */}
                <View style={[qStyles.usedBar, { width: `${usedPct.toFixed(2)}%` as any }]} />
                {/* Added portion — animated */}
                <Animated.View style={[qStyles.addedBar, { width: addedBarWidth }]} />
            </View>

            {/* Labels below bar */}
            <View style={qStyles.labelsRow}>
                <View style={qStyles.labelItem}>
                    <View style={[qStyles.dot, { backgroundColor: colors.primary }]} />
                    <Text style={qStyles.labelText}>Used: {currentUsage.toLocaleString()} L</Text>
                </View>
                <Animated.View style={[qStyles.labelItem, { opacity: labelOpacity }]}>
                    <View style={[qStyles.dot, { backgroundColor: colors.primary }]} />
                    <Text style={qStyles.labelText}>Added: {addedLimit.toLocaleString()} L</Text>
                </Animated.View>
                {/* <View style={qStyles.labelItem}>
                    <View style={[qStyles.dot, { backgroundColor: colors.border }]} />
                    <Text style={qStyles.labelText}>New limit: {newLimit.toLocaleString()} L</Text>
                </View> */}
            </View>

            {/* Before → After pill */}
            <Animated.View style={[qStyles.limitChange, { opacity: labelOpacity }]}>
                <Text style={qStyles.limitChangeOld}>{previousLimit.toLocaleString()} L</Text>
                <Text style={qStyles.limitChangeArrow}> → </Text>
                <Text style={qStyles.limitChangeNew}>{newLimit.toLocaleString()} L</Text>
                <Text style={qStyles.limitChangeLabel}> monthly limit</Text>
            </Animated.View>
        </View>
    )
}

const qStyles = StyleSheet.create({
    wrap: {
        backgroundColor: colors.inputBackground,
        borderRadius: normalize(14),
        padding: normalize(14),
        marginHorizontal: normalize(0),
        width: '100%',
        marginBottom: normalize(14),
        borderWidth: 2,
        borderColor: colors.primaryLight,
        shadowColor: colors.black, shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: normalize(12),
    },
    title: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
        color: colors.black,
    },
    addedBadge: {
        backgroundColor: colors.primaryLight,
        borderRadius: normalize(20),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(3),
    },
    addedBadgeText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(11),
        color: colors.primary,
    },
    track: {
        height: normalize(10),
        backgroundColor: colors.border,
        borderRadius: normalize(10),
        overflow: 'hidden',
        flexDirection: 'row',
        marginBottom: normalize(10),
    },
    usedBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: normalize(10),
    },
    addedBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: normalize(10),
    },
    labelsRow: {
        marginLeft: vw(6),
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: normalize(10),
        marginBottom: normalize(10),
    },
    labelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(5),
    },
    dot: {
        width: normalize(7),
        height: normalize(7),
        borderRadius: normalize(4),
    },
    labelText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: colors.black,
    },
    limitChange: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(7),
        alignSelf: 'flex-start',
    },
    limitChangeOld: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
        color: colors.black,
        textDecorationLine: 'line-through',
    },
    limitChangeArrow: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.black,
    },
    limitChangeNew: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: colors.primary,
    },
    limitChangeLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: colors.black,
    },
})

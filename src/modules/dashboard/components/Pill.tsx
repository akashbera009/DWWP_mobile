import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { normalize} from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'

const Pill = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
    <View style={[styles.pill, { backgroundColor: bg }]}>
        <View style={[styles.pillDot, { backgroundColor: color }]} />
        <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
)

export default Pill

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(5),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(4),
        borderRadius: normalize(20),
    },
    pillDot: {
        width: normalize(6),
        height: normalize(6),
        borderRadius: normalize(3),
    },
    pillText: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(11),
    },

})
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import colors from '@dwwp/utils/colors'
import fonts from '@dwwp/utils/fonts'
import { strings } from '@dwwp/utils/strings'

const FixedPricesComponent = () => {
    const [limit, setLimit] = useState<number>(2000)
    const [PricePerLtr, setPricePerLtr] = useState<number>(0.3)
    const [penaltyPerLtr, setPenaltyPerLtr] = useState<number>(1)

    return (
        <View
            style={styles.container}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                >
                <View style={styles.limit}>
                    <Text style={styles.limitText}>
                        {strings.Limit}
                    </Text>
                    <Text style={[styles.limitText, styles.limitValues]}>
                        {limit}
                    </Text>
                </View>
                <View style={styles.limit}>
                    <Text style={styles.limitText}>
                        {strings.pricePerLtr}
                    </Text>
                    <Text style={[styles.limitText, styles.limitValues]}>
                        ₹ {PricePerLtr}
                    </Text>
                </View>
                <View style={styles.limit}>
                    <Text style={styles.limitText}>
                        {strings.penaltyPerLtr}
                    </Text>
                    <Text style={[styles.limitText, styles.limitValues]}>
                        ₹ {penaltyPerLtr}
                    </Text>
                </View>
            </ScrollView>
        </View>
    )
}

export default FixedPricesComponent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // marginHorizontal: vw(16),
        flexDirection: 'row'
    },
    limit: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        borderRadius: normalize(12),
        borderWidth: normalize(1),
        borderColor: colors.border,
        alignItems: 'center',
        marginHorizontal: vw(8)
    },
    limitText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        color: colors.placeholderText,
        paddingVertical: vh(10),
        paddingHorizontal: vw(6)
    },
    limitValues: {
        color: colors.white,
    }
})
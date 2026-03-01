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

    const fixedPricesMap = [
        { title: strings.Limit, price: limit },
        { title: strings.pricePerLtr, price: PricePerLtr },
        { title: strings.penaltyPerLtr, price: penaltyPerLtr }
    ]
    return (
        <View
            style={styles.container}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {fixedPricesMap.map((item,idx) => (
                    <View style={styles.limit} key={idx}>
                        <Text style={styles.limitText}>
                            {item?.title}</Text>
                        <Text style={[ styles.limitValues]}>
                            {!item?.title.includes(strings.Limit) && '₹ '}
                            {item?.price}
                        </Text>
                    </View>
                ))}

            </ScrollView>
        </View>
    )
}

export default FixedPricesComponent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: vw(16),
        flexDirection: 'row',
    },
    limit: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: normalize(12),
        borderWidth: normalize(1),
        borderColor: colors.primary,
        alignItems: 'center',
        marginRight: vw(8)
    },
    limitText: {
        fontFamily: fonts.Medium,
        fontSize: normalize(14),
        color: colors.placeholderText,
        paddingVertical: vh(6),
        paddingHorizontal: vw(10)
    },
    limitValues: {
        color: colors.primary,  
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        paddingVertical: vh(6),
        paddingRight: vw(8)
    }
})
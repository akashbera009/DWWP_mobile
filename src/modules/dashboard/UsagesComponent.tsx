import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import colors from '@dwwp/utils/colors'
import { strings } from '@dwwp/utils/strings'
import fonts from '@dwwp/utils/fonts'
import { localImages } from '@dwwp/utils/localimages'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

const UsagesComponent = () => {
    const [todayUse, setTodayUse] = useState<number>(375)
    const [thisMonthUse, setThisMonthUse] = useState<number>(2075)
    const [totalPrice, setTotalPrice] = useState<number>(216)
    const [regularPrice, setRegularPrice] = useState<number>(0.10)
    const [penaltyPrice, setPenaltyPrice] = useState<number>(1)
    // const [fillingPercentage, setFillingPercentage] = useState<number>(20)

    const fillingWidth = useSharedValue(120)
    useEffect(() => {
        const timer = setInterval(() => {
            const randomNumber = 20 * Math.random()
            const randomSign = Math.random() > .5 ? -1 : 1;
            const finalNum = randomSign * randomNumber

            const nextVal = fillingWidth.value + finalNum
            if (nextVal < 0)
                fillingWidth.value = 120
            else if (nextVal > 300)
                fillingWidth.value = 120
            else
                fillingWidth.value = nextVal
        }, 500)
        return () => clearInterval(timer)
    })
    const AnimatedfillingStyle = useAnimatedStyle(() => ({
        width: fillingWidth.value
    }))
    return (
        <View>
            <Text style={styles.userDashBoardHeader}>{strings.userDashboard}</Text>
            <View style={styles.usagesContainer}>
                <View style={styles.upperUsagesContainer}>
                    <View style={styles.upperUsagesLeft}>
                        <Text style={styles.upperUsagesTxt}>{strings.today}</Text>
                        <Text style={styles.upperUsagesTxtValue}>{todayUse} L</Text>
                    </View>
                    <View style={styles.customDivider} />
                    <View style={styles.upperUsagesRight}>
                        <Text style={styles.upperUsagesTxt}>{strings.thisMonth}</Text>
                        <Text style={styles.upperUsagesTxtValue}>{thisMonthUse} L</Text>
                    </View>
                </View>

                <View style={styles.preDefinedPrice}>
                    <View style={styles.preDefinedPriceLeft}>
                        <Text style={styles.upperUsagesTxt}>{strings.regularPrice}</Text>
                        <Text style={styles.regular}>₹ {regularPrice} </Text>
                    </View>
                    <View style={styles.preDefinedPriceRight}>
                        <Text style={styles.upperUsagesTxt}>{strings.penalty}</Text>
                        <Text style={styles.penalty}>₹ {penaltyPrice} </Text>
                    </View>
                </View>

                <View style={styles.totalProcesCOntainerWrapper}>
                    <Image source={localImages.rupee_indian} style={styles.rupee_indian} />
                    <View style={styles.totalProcesCOntainer}>
                        <Text style={styles.totalPriceValueTxt}>{strings.totalPrice}</Text>
                        <Text style={styles.totalPriceValue}>{totalPrice}</Text>
                    </View>
                    <View style={styles.payButton}>
                        <Text style={styles.totalPriceValue}>{strings.pay}</Text>
                    </View>
                </View>

                {/* filling indicator */}
                <View style={styles.fillingContainer}>
                    <Animated.View
                        style={[styles.fillingBar, AnimatedfillingStyle]}>
                    </Animated.View>
                </View>

            </View>
        </View>
    )
}

export default UsagesComponent

const styles = StyleSheet.create({
    userDashBoardHeader:{
        fontFamily : fonts.Bold,
        fontSize : normalize(18),
        color : colors.primary,
        marginHorizontal : vw(16)
    },
    usagesContainer: {
        marginHorizontal: vw(16),
        marginVertical: vh(10),
        elevation: 10,
    },
    upperUsagesContainer: {
        flexDirection: 'row',
        backgroundColor: colors.modalBackground,
        borderRadius: normalize(12),
        borderWidth: normalize(1),
        borderColor: colors.border,
        justifyContent: 'center'
    },
    upperUsagesTxt: {
        color: colors.primary,
        fontFamily: fonts.SemiBold,
        fontSize: normalize(16),
        marginHorizontal: normalize(10),
        marginVertical: normalize(6),
    },
    upperUsagesLeft: {
        alignItems: 'center',
        flex: 0.4
    },
    customDivider: {
        borderRightWidth: normalize(1),
        borderRightColor: colors.info,
        borderStyle: 'dotted',
        flex: .1
    },
    upperUsagesRight: {
        alignItems: 'center',
        flex: 0.7
    },
    upperUsagesTxtValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
        color: colors.white
    },
    preDefinedPrice: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: vh(6),
        gap: vh(6)
        // borderWidth: normalize(1),
        // borderRadius: normalize(12),
        // backgroundColor: colors.modalBackground,
        // borderColor: colors.border,
    },

    preDefinedPriceLeft: {
        flexDirection: 'row',
        backgroundColor: colors.modalBackground,
        borderRadius: normalize(12),
        borderWidth: normalize(1),
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(10),
        flex: .6
    },
    preDefinedPriceRight: {
        flexDirection: 'row',
        backgroundColor: colors.modalBackground,
        borderRadius: normalize(12),
        borderWidth: normalize(1),
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(10),
        flex: .4
    },
    regular: {
        color: colors.info,
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
    },
    penalty: {
        color: colors.error,
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
    },
    totalProcesCOntainerWrapper: {
        flexDirection: 'row',
        backgroundColor: colors.modalBackground,
        borderRadius: normalize(12),
        borderWidth: normalize(1),
        borderColor: colors.border,
        alignItems: 'center'
        // justifyContent: 'center'
    },
    rupee_indian: {
        height: vh(30),
        width: vw(30),
        margin: normalize(10),
        marginHorizontal: vw(20)
    },
    totalProcesCOntainer: {
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    payButton: {
        position: 'absolute',
        right: vw(20),
        top: vh(15)
    },
    totalPriceValueTxt: {
        fontFamily: fonts.Regular,
        fontSize: normalize(20),
        color: colors.primary
    },
    totalPriceValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
        color: colors.white,
    },
    fillingContainer: {
        backgroundColor: colors.transparentBackground,
        minHeight: vh(16),
        borderRadius: normalize(20),
        marginVertical: vh(8)
    },
    fillingBar: {
        borderRadius: normalize(20),
        minHeight: vh(16),
        backgroundColor: colors.activeDot
    }

})
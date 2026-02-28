import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { HomeHeader } from '@dwwp/components/HomeHeader'
import colors from '@dwwp/utils/colors'
import { strings } from '@dwwp/utils/strings'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { OnlineStatus } from './OnlineStatus'
import UsagesComponent from './UsagesComponent'
import FixedPricesComponent from './FixedPricesComponent'

const DashBoardPage = () => {
    return (
        <View style={styles.container}>
            <View style={styles.homeHeaderContainer}>
                <Text style={styles.homeHeaderText}>{strings.dwwp}</Text>
            </View>
            <View style={styles.scrollContainer}>
                <ScrollView>
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>Welcome Back Akash Bera </Text>
                        <Text style={[styles.welcomeText,{color : colors.black}]}>x </Text>
                    </View>

                    <UsagesComponent />
                    <FixedPricesComponent/>

                    <OnlineStatus />
                </ScrollView>
            </View>
        </View>
    )
}

export default DashBoardPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // flexGrow : 1 , 
    },
    homeHeaderContainer: {
        backgroundColor: colors.primary
    },
    homeHeaderText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(20),
        color: colors.white,
        marginHorizontal: vw(16),
        marginVertical: vh(6)
    },
    scrollContainer: {
        flexGrow: 1,
        // backgroundColor: colors.overlayBackground // unnecessaruy
    },
    welcomeContainer: {
        backgroundColor: colors.lightGreen,
        marginHorizontal: vw(16),
        marginVertical: vh(10),
        padding: normalize(10),
        borderRadius: normalize(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    welcomeText: {
        fontFamily: fonts.Medium,
        fontSize: normalize(16),
        color: colors.primary
    }
})
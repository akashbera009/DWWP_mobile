import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import Pill from './Pill'

const WelcomeBanner = ({userName} :{userName:string}) => {
    const onlineCount = 5 ; 
    const deviceList = [1, 2, 3, 4, 5, 6, 7]
    return (
        <View style={styles.welcomeRow}>
            <View>
                <Text style={styles.welcomeSub}>Good morning,</Text>
                <Text style={styles.welcomeName}>{userName} 👋</Text>
            </View>
            <Pill label={`${onlineCount}/${deviceList.length} Online`} color={colors.primary} bg={colors.primaryLight} />
        </View>
    )
}

export default WelcomeBanner

const styles = StyleSheet.create({
    // Welcome Row
    welcomeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: vw(2),
    },
    welcomeSub: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
    },
    welcomeName: {
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
        color: colors.neutralBlack,
        marginTop: vh(2),
    },

})
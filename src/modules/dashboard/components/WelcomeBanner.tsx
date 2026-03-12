import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import Pill from './Pill'
import { useAppSelector } from '@dwwp/store/hooks'

const WelcomeBanner = () => {
    const fullName = useAppSelector(state => state.dashboard.userDetails?.fullName)
    const meterNumber = useAppSelector(state => state.dashboard.userDetails?.meterNumber)
 
    const [greeting, setGreeting] = useState<string>('')
    useEffect(() => {
        const nowHour = new Date().getHours()
        let  message = ''
        if(nowHour >= 0 && nowHour < 12){
            message = 'Morning'
        }else if(nowHour >= 12 && nowHour <13 ){
            message = 'Noon'
        }else if(nowHour >= 13 && nowHour < 19 ){
            message = 'AfterNoon'
        }
        else if(nowHour >= 19 && nowHour < 24 ){
            message = 'Evening'
        }
        setGreeting(message)
    }, [])
    return (
        <View style={styles.welcomeRow}>
            <View>
                <Text style={styles.welcomeSub}>Good {greeting},</Text>
                <Text style={styles.welcomeName}>{fullName} 👋</Text>
            </View>
            <Pill label={`Meter No: ${meterNumber}`} color={colors.primary} bg={colors.primaryLight} />
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
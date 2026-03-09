import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CustomHeader } from '@dwwp/components/CustomHeader'

const IndividualPaymentHistory = () => {
    return (
        <View style={styles.container}>
            <CustomHeader
                screenName='Individual Payment History' />
            <Text>IndividualPaymentHistory</Text>
        </View>
    )
}

export default IndividualPaymentHistory

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
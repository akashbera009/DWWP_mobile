import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { strings } from '@dwwp/utils/strings'
import { localImages } from '@dwwp/utils/localimages'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import PlanSelector from './Planselector'

const PaymentsDashboard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.homeHeaderContainer}>
        <Text style={styles.homeHeaderText}>{strings.rechargesAndPayments}</Text>
      </View>
      <PlanSelector
        defaultSelected="premium"
        onSelect={(plan) => console.log(plan)}
      />
    </View>
  )
}

export default PaymentsDashboard

const styles = StyleSheet.create({
  container: {
    flex: 1
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
})
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { strings } from '@dwwp/utils/strings'
import { localImages } from '@dwwp/utils/localimages'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import PlanSelector from './Planselector'
import TransactionHistory from './TransactionHistory'
import CurrentBillComponent from './CurrentBillComponent'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PaymentsDashboard = () => {
  const { top } = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <ScrollView style={
        styles.scrollview
      }>
        <View style={styles.homeHeaderContainer}>
          <Text style={styles.homeHeaderText}>{strings.rechargesAndPayments}</Text>
        </View>
        {/* <Text style={styles.heading}>Payment Dashboard</Text> */}
        <View style={styles.summaryCard}>
          <Text>Total Spent</Text>
          <Text style={styles.totalAmount}>₹ 300</Text>
        </View>

        <CurrentBillComponent />

        <TransactionHistory />

        <PlanSelector
          defaultSelected="premium"
          onSelect={(plan) => console.log(plan)}
        />
      </ScrollView>
    </View>
  )
}

export default PaymentsDashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary
  },
  scrollview: {
    backgroundColor: colors.overlayBackground
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
  heading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginHorizontal: vw(16)
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
})
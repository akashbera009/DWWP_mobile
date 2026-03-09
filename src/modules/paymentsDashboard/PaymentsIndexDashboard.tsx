import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback } from 'react'
import { strings } from '@dwwp/utils/strings'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'

import TransactionHistory from './components/MiniTransactionHistory'
import CurrentBillComponent from './components/CurrentBillComponent'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PlanSelector from './components/MiniPlanselector'
import { showSnackbar } from '@dwwp/utils/showSnackBar'
import { RefreshControl } from 'react-native-gesture-handler'

const PaymentsIndexDashboard = () => {
  const { top } = useSafeAreaInsets()
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      showSnackbar({ message: 'Data refreshed!', type: 'success' })
      setRefreshing(false);
    }, 1000);
  }, []);
  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.homeHeaderContainer}>
        <Text style={styles.homeHeaderText}>{strings.rechargesAndPayments}</Text>
      </View>
      <ScrollView
        style={
          styles.scrollview
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <CurrentBillComponent />

        <TransactionHistory />

        <PlanSelector
          defaultSelected="premium"
          onSelect={(plan) => console.log(plan)}
        />

      </ScrollView>
    </View >
  )
}

export default PaymentsIndexDashboard

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
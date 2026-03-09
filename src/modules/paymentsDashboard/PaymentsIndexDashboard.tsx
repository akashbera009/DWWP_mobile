import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useRef } from 'react'
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
import { localImages } from '@dwwp/utils/localimages'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { MainStackParamList } from '@dwwp/utils/types'
import { screenNames } from '@dwwp/utils/screenNames'

type MainStackNavigation = NativeStackNavigationProp<MainStackParamList>;
const PaymentsIndexDashboard = () => {
  const { top } = useSafeAreaInsets()
  const [refreshing, setRefreshing] = React.useState(false);
  const mainStackNavigation = useNavigation<MainStackNavigation>()

  const scrollViewRef = useRef<ScrollView | null>(null)

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      showSnackbar({ message: 'Data refreshed!', type: 'success' })
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleOpenChoosePlan = () => {
    mainStackNavigation.navigate(screenNames.AddonRechargesScreen)
  }
  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({
      animated : true,
    })
  }, [])
  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.homeHeaderContainer}>
        <Text style={styles.homeHeaderText}>{strings.rechargesAndPayments}</Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
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

        <View style={styles.planSelectorView}>
          <TouchableOpacity
            style={styles.planSelectorHeader}
            onPress={handleOpenChoosePlan}
          >
            <Text style={styles.heading}>{strings.planSelectorHeading}</Text>
            <Image source={localImages.back} style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.subHeading}>Purchase additional water packs</Text>
          <PlanSelector
            defaultSelected="premium"
            onSelect={(plan) => console.log(plan)}
          />
        </View>

        <TransactionHistory scrollToBottom={scrollToBottom} />

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
  // heading: {
  //   fontSize: 20,
  //   fontWeight: '800',
  //   marginBottom: 16,
  //   marginHorizontal: vw(16)
  // },
  planSelectorView: {
    marginHorizontal: vw(16),
    marginTop: vh(16),
  },
  planSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heading: {
    fontSize: normalize(16),
    fontFamily: fonts.Bold,
    color: colors.primary,
    letterSpacing: -0.2,
  },
  backArrow: {
    height: vh(10),
    width: vh(16),
    marginHorizontal: vw(8),
    tintColor: colors.primary,
    transform: [{ rotate: '180deg' }]
  },
  subHeading: {
    fontSize: normalize(12),
    fontFamily: fonts.Regular,
    color: colors.neutralBodyText,
    marginTop: -4,
    marginBottom: vh(4),
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
import { ScrollView, StyleSheet, View } from 'react-native'
import React from 'react'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { screenNames } from '@dwwp/utils/screenNames'
import TransactionItem from '../components/TransactionItem'
import { TRANSACTIONS } from '../mocks/transactionData'
import { vh, vw } from '@dwwp/utils/dimensions'

const FullPaymantHistory = () => {
  return (
    <View style={styles.container}>
      <CustomHeader
        screenName={screenNames.FullPaymantHistory} />
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}>
          {TRANSACTIONS.slice(0, 3).map((txn, index) => (
            <TransactionItem index={index} key={txn.id} item={txn as any} />
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

export default FullPaymantHistory

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    marginTop : vh(16),
    marginHorizontal : vw(16)
  }
})
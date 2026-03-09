import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { screenNames } from '@dwwp/utils/screenNames'

const FullPaymantHistory = () => {
  return (
    <View style={styles.container}>
      <CustomHeader
        screenName={screenNames.FullPaymantHistory} />
      <Text>FullTRansactionHistory</Text>
    </View>
  )
}

export default FullPaymantHistory

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
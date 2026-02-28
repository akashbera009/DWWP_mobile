import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { strings } from '@dwwp/utils/strings'
import { localImages } from '@dwwp/utils/localimages'
import colors from '@dwwp/utils/colors'
import { Profile } from '../dashboard/NormalWave'

const PaymentsDashboard = () => {
  return (
    <View style={styles.container}>
      <CustomHeader
        title={strings.Subscription}
        subTitle='Choose Plans'
        // containerStyle ={{backgroundColor : colors.primary}}
      />
   <Profile/>
    </View>
  )
}

export default PaymentsDashboard

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
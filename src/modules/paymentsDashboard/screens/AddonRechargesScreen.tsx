import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { screenNames } from '@dwwp/utils/screenNames'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import PlanSelector from '../components/MiniPlanselector'
import { vh, vw } from '@dwwp/utils/dimensions'

const AddonRechargesScreen = () => {
  return (
    <View style={styles.container}>
      <CustomHeader
        screenName={screenNames.AddonRechargesScreen} />
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}>
          <PlanSelector />
        </ScrollView>
      </View>
    </View>
  )
}

export default AddonRechargesScreen

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    marginHorizontal: vw(16),
    marginTop: vh(16)
  }
})
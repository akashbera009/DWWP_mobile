import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import AnimatedInput from '../auth/components/AnimatedInput'
import { CustomButton } from '@dwwp/components/CustomButton'
import { vw } from '@dwwp/utils/dimensions'

const RaiseComplaintScreen = () => {
  const [issue, setIssue] = useState<string>('')
  return (
    <View style={styles.container}>
      <CustomHeader
        screenName='Raise Complent' />

      <View style={styles.content}>
        <Text>RaiseComplaintScreen</Text>

        <AnimatedInput
          placeholder='Enter Issue'
          value={issue}
          onChangeText={setIssue}
        />
        <CustomButton
          title='Submit Complaint'
          onPress={() => { }}
        />
      </View>
    </View>
  )
}

export default RaiseComplaintScreen

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content:{
    marginHorizontal : vw(16)
  }
})
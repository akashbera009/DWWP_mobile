import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { strings } from '@dwwp/utils/strings'
import { Portal } from '@gorhom/portal'
import SwitchModal from './SwitchModal'
import { CustomButton } from '@dwwp/components/CustomButton'

const ServoControlPage = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    return (
        <View style={styles.container}>
            <View style={styles.homeHeaderContainer}>
                <Text style={styles.homeHeaderText}>{strings.gateControl}</Text>
            </View>
            <View style={styles.servoPageContainer}>

                <Text style={styles.homeHeaderText}>{strings.gateControl}</Text>
                <CustomButton
                    title='open sheet'
                    onPress={() => setIsModalOpen(prev => !prev)}
                />
                <View style={styles.scrollContainer}>
                    {isModalOpen &&
                        <Portal hostName='safe'>
                            <SwitchModal />
                        </Portal>
                    }
                </View>
            </View>
        </View>
    )
}

export default ServoControlPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    servoPageContainer: {
        marginHorizontal: vw(16)
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
    scrollContainer: {
        flexGrow: 1,
    }
})
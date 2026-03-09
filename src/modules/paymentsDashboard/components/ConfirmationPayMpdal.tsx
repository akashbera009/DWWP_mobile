import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { CustomButton } from '@dwwp/components/CustomButton'
import { strings } from '@dwwp/utils/strings'

type ConfirmationPayModalProps = {
    visible: boolean
    onSuccess: () => void
    onCancel: () => void
}

const ConfirmationPayModal = ({ visible, onSuccess, onCancel }: ConfirmationPayModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
        >
            <View style={styles.overlay}>

                <View style={styles.container}>
                    <Text style={styles.title}>Confirm Payment</Text>

                    <Text style={styles.message}>
                       {strings.paymentSureHeader}
                    </Text>

                    <CustomButton
                        title={strings.cancel}
                        variant='outline'
                        onPress={onCancel}
                        textStyle ={{color: colors.warning}}
                    />
                    <CustomButton
                        title={strings.proceed}
                        onPress={onSuccess}
                    />
                </View>

            </View>
        </Modal>
    )
}

export default ConfirmationPayModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.transparentBackground,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: vw(20)
    },

    container: {
        width: '100%',
        backgroundColor: colors.background,
        borderRadius: normalize(18),
        padding: normalize(22),
        elevation: 10,
    },

    title: {
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
        color: colors.neutralBlack,
        marginBottom: vh(8),
    },

    message: {
        fontFamily: fonts.Regular,
        fontSize: normalize(14),
        color: colors.neutralBodyText,
        marginBottom: vh(20),
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: vw(12),
    },

    cancelButton: {
        paddingVertical: vh(10),
        paddingHorizontal: vw(16),
        borderRadius: 10,
        backgroundColor: colors.inputBackground,
    },

    cancelText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: colors.neutralBlack,
    },

    payButton: {
        paddingVertical: vh(10),
        paddingHorizontal: vw(18),
        borderRadius: 10,
        backgroundColor: colors.primary,
    },

    payText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: colors.white,
    },
})
import colors from '@dwwp/utils/colors';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type SuccessScreenPropType = {
    visible: boolean
    message: string;
    onOk: () => void
}
const SuccessPopup : React.FC<SuccessScreenPropType> = ({
    visible , 
    message , 
    onOk
})=> {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.container}>

                    <View style={styles.iconCircle}>
                        <Text style={styles.icon}>✓</Text>
                    </View>

                    <Text style={styles.title}>Success</Text>

                    <Text style={styles.message}>
                        {message || "Your action was completed successfully."}
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={onOk}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

export default SuccessPopup;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.transparentBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: '85%',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },

    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.successToastBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },

    icon: {
        fontSize: 34,
        color: colors.success,
        fontWeight: 'bold',
    },

    title: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.neutralBlack,
        marginBottom: 10,
    },

    message: {
        fontSize: 15,
        color: colors.neutralBodyText,
        textAlign: 'center',
        marginBottom: 25,
    },

    button: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
    },

    buttonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 16,
    },
});
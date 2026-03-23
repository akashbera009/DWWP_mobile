import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '@dwwp/utils/colors';
type ConfirmationPopupScreenProps = {
    visible: boolean
    message: string
    onConfirm: () => void
    onCancel: () => void
}
const ConfirmationPopup = ({ visible, message, onConfirm, onCancel }: ConfirmationPopupScreenProps) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.container}>

                    <Text style={styles.title}>Confirm Action</Text>

                    <Text style={styles.message}>
                        {message || "Are you sure you want to continue?"}
                    </Text>

                    <View style={styles.buttonRow}>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationPopup;

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
        marginBottom: 25,
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginRight: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },

    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },

    cancelText: {
        color: colors.darkGrey,
        fontWeight: '500',
    },

    confirmText: {
        color: colors.white,
        fontWeight: '600',
    },
});
// LimitWarningBanner.tsx
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabParamList } from '@dwwp/utils/types';
import { screenNames } from '@dwwp/utils/screenNames';

type Props = {
    onClose: () => void
}
type BottomStackNavigationProp = NativeStackNavigationProp<BottomTabParamList>;

const LimitWarningBanner = ({ onClose }: Props) => {
    const bottomNavigation = useNavigation<BottomStackNavigationProp>();
    return (
        <View style={styles.banner}>
            <View style={styles.left}>
                <Text style={styles.emoji}>⚠️</Text>
                <View>
                    <Text style={styles.title}>Usage Limit Reached</Text>
                    <Text style={styles.subtitle}>Recharge to restore water supply</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.rechargeBtn}
                    onPress={() => bottomNavigation.navigate(screenNames.PaymentDashBoard)}
                >
                    <Text style={styles.rechargeTxt}>Recharge</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Text style={styles.closeTxt}>✕</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#7F1D1D',   // deep red
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    emoji: { fontSize: 20 },
    title: {
        color: '#FEF2F2',
        fontWeight: '700',
        fontSize: 13,
    },
    subtitle: {
        color: '#FECACA',
        fontSize: 11,
        marginTop: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rechargeBtn: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    rechargeTxt: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
    closeTxt: {
        color: '#FECACA',
        fontSize: 14,
        fontWeight: '700',
    },
})

export default LimitWarningBanner
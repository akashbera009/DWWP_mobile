import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { TRANSACTIONS } from './transactionData';
import TransactionItem from './TransactionItem';
import { normalize, vw } from '@dwwp/utils/dimensions';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { strings } from '@dwwp/utils/strings';
import fonts from '@dwwp/utils/fonts';
import colors from '@dwwp/utils/colors';

const TransactionHistory = () => {
    const expanded = useSharedValue(0);

    const toggle = () => {
        expanded.value = withTiming(expanded.value === 0 ? 1 : 0, {
            duration: 300,
        });
    };

    // Animated arrow rotation
    const arrowStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: `${expanded.value * 180}deg`,
            },
        ],
    }));

    // Animated collapse container
    const contentStyle = useAnimatedStyle(() => ({
        height: expanded.value === 0 ? 0 : 'auto',
        opacity: expanded.value,
    }));

    return (
        <View style={styles.wrapper}>
            <Text style={styles.heading}>{strings.TransactionHistory}</Text>
            <TouchableOpacity style={styles.header} onPress={toggle}>
                <Text style={styles.title}>Transactions for this month</Text>

                <Animated.Text style={[styles.arrow, arrowStyle]}>
                    ▼
                </Animated.Text>
            </TouchableOpacity>

            <Animated.View style={[styles.contentContainer, contentStyle]}>
                {TRANSACTIONS.map((txn) => (
                    <TransactionItem key={txn.id} item={txn} />
                ))}
            </Animated.View>
        </View>
    );
};

export default TransactionHistory;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 16,
        marginHorizontal: vw(16)
    },
    heading: {
        fontSize: normalize(20),
        fontFamily: fonts.Bold,
        color: colors.primary,
        // marginHorizontal: vw(16),
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    arrow: {
        fontSize: 14,
    },
    contentContainer: {
        overflow: 'hidden',
    },
});
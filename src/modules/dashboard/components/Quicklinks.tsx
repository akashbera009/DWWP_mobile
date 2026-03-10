import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
} from 'react-native';
import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';
import { localImages } from '@dwwp/utils/localimages';
import { MainStackParamList, BottomTabParamList } from '@dwwp/utils/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { screenNames } from '@dwwp/utils/screenNames';

interface QuickLink {
    label: string;
    onPress?: () => void;
}
type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
type BottomStackNavigationProp = NativeStackNavigationProp<BottomTabParamList>;

const LinkRow: React.FC<{ item: QuickLink; index: number; isLast: boolean }> = ({
    item,
    index,
    isLast,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay: index * 60,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                delay: index * 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, damping: 15 }),
            Animated.timing(bgAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15 }),
            Animated.timing(bgAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
        ]).start();
    };

    const rowBg = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(43,101,104,0)', 'rgba(43,101,104,0.05)'],
    });

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
        >
            <Animated.View style={{ backgroundColor: rowBg }}>
                <TouchableOpacity
                    style={[styles.row, isLast && styles.rowLast]}
                    onPress={item.onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <View style={styles.dot} />
                    <Text style={styles.label}>{item.label}</Text>
                    <Image source={localImages.share} style={styles.arrow} />
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

const QuickLinks: React.FC = () => {
    const headerAnim = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<MainStackNavigationProp>();
    const bottomNavigation = useNavigation<BottomStackNavigationProp>();
    const LINKS: QuickLink[] = [
        {
            label: 'Raise Complaint',
            onPress: () => {
                navigation.navigate(screenNames.RaiseComplaintScreen)
            }
        },
        {
            label: 'Give Feedback',
            onPress: () => {
                navigation.navigate(screenNames.RaiseComplaintScreen)
            }
        },
        {
            label: 'Do a Quick Recharge',
            onPress: () => {
                navigation.navigate(screenNames.AddonRechargesScreen)
            }
        },
        {
            label: 'Pay Dues',
            onPress: () => {
                bottomNavigation.navigate(screenNames.PaymentDashBoard)
            }
        },
    ];

    useEffect(() => {
        Animated.timing(headerAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={styles.wrapper}>
            <Animated.Text
                style={[
                    styles.title,
                    {
                        opacity: headerAnim,
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-6, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                Quick Links
            </Animated.Text>

            <View style={styles.listCard}>
                {LINKS.map((item, index) => (
                    <LinkRow
                        key={item.label}
                        item={item}
                        index={index}
                        isLast={index === LINKS.length - 1}
                    />
                ))}
            </View>
        </View>
    );
};

export default QuickLinks;

const styles = StyleSheet.create({
    wrapper: {
        // marginHorizontal: vw(16),
        marginTop: vh(20),
    },
    title: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: colors.primary,
        marginBottom: vh(10),
        letterSpacing: -0.2,
    },
    listCard: {
        // backgroundColor: colors.white,
        // borderRadius: 16,
        // overflow: 'hidden',
        // elevation: 4,
        // shadowColor: colors.primaryDark,
        // shadowOpacity: 0.08,
        // shadowRadius: 10,
        // shadowOffset: { width: 0, height: 3 },
        // borderWidth: 1,
        // borderColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: vw(18),
        paddingVertical: vh(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: vw(12),
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        opacity: 0.5,
    },
    label: {
        flex: 1,
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        color: colors.primary,
        letterSpacing: -0.1,
    },
    arrow: {
        width: normalize(14),
        height: normalize(14),
        tintColor: colors.primaryDisabled,
    },
});
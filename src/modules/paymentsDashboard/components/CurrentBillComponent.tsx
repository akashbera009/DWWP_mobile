import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
    Modal,
    ActivityIndicator,
} from 'react-native';
import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';
import { localImages } from '@dwwp/utils/localimages';
import ConfirmationPayModal from './ConfirmationPayMpdal';
import { useRazorpayPayment } from '@dwwp/utils/razorpayPaymentFunciton';
import { showErrorSnackbar, showWarningSnackbar } from '@dwwp/utils/showSnackBar';
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks';
import { confirmAddonPayment } from '../paymentAction';
import { useNavigation } from '@react-navigation/native';
import { billObjectType, MainStackParamList, payCurrentBillType, successPayload } from '@dwwp/utils/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { screenNames } from '@dwwp/utils/screenNames';
import { selectCurrentMonthLimit, selectCurrentMonthTotal } from '@dwwp/modules/dashboard/usageSelectors';
import { getCurrentMonthKey } from '@dwwp/utils/commonFunctions';

export interface BillingCardProps {
    amount: number;
    usage: number;
    dueDate: string;
    isPaid: boolean;
    onPayPress: () => void;
}

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const CurrentBillComponent = () => {
    const navigation = useNavigation<MainStackNavigationProp>();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const todayUsage = useAppSelector(s => s?.usage?.todayUsage)
    const price = useAppSelector(state => state?.dashboard?.priceConfig?.regularPrice)
    const monthTotal = useAppSelector(selectCurrentMonthTotal)
    const monthLimit = useAppSelector(selectCurrentMonthLimit)
    const billAmount = React.useMemo(() => {
        if (!price) return 0
        return (price * todayUsage).toFixed(0)
    }, [price, todayUsage])

    const monthBillAmount = React.useMemo(() => {
        if (!price) return 0
        return (price * monthTotal).toFixed(0)
    }, [price, monthTotal])

    const [nextBillRemainingDays, setNextBillRemainingDays] = useState<number>(0);

    useEffect(() => {
        const now = new Date();

        const daysInMonth = (year: number, month: number) =>
            new Date(year, month, 0).getDate();

        const billingCycle = daysInMonth(now.getFullYear(), now.getMonth() + 1);
        const remainingDays = billingCycle - now.getDate();

        setNextBillRemainingDays(remainingDays);
    }, []);
    // get paymentstatus
    const transactions = useAppSelector(s => s?.payment?.payments)
    const monthKey = getCurrentMonthKey()
    const [isPaid, setIsPaid] = useState(false)
    useEffect(() => {
        const res = transactions.find(entry =>
            (entry?.forMonth === monthKey) && (entry?.status === 'Completed')
        )
        if (res) setIsPaid(true)
        else setIsPaid(false)
    }, [])

    const billObject: billObjectType = {
        amount: String(monthBillAmount),
        usage: monthTotal,
        dueDate: nextBillRemainingDays,
        isPaid: isPaid,
    };

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const isMonthEnd = nextBillRemainingDays >= 0 && nextBillRemainingDays < 2;
    const isDisabled = billObject.isPaid || !isMonthEnd;
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()
    const emailId = useAppSelector(s => s.dashboard?.userDetails?.emailId)
    // Pulse the status dot when pending
    useEffect(() => {
        if (!isPaid) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                ])
            ).start();
        }
    }, []);

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, damping: 10 }).start();

    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 10 }).start();


    const { handlePayment } = useRazorpayPayment();
    const onProceedPayment = useCallback(() => {
        payCurrentBill({
            amount: Number(monthBillAmount),
            usage: monthTotal,
            type: 'regular'
        })
    }, [])
    const onCancelProceed = useCallback(() => {
        setIsModalOpen(false)
        setLoading(false)
    }, [loading])

    const payCurrentBill = async ({ amount, usage, type }: payCurrentBillType): Promise<void> => {
        console.log('initiating Recharge payment... ');
        try {
            setLoading(true)
            setIsModalOpen(true)
            const res = await handlePayment(amount)
            const { success, payment_id } = res
            if (success) {
                if (payment_id)
                    onSuccess({
                        payment_id,
                        amount,
                        usage,
                        type
                    })
            } else {
                showWarningSnackbar('Payment Cancelled by User')
                setLoading(false)
            }
        } catch (error) {
            console.log(error);
            showErrorSnackbar('Payment failed ')
        } finally {
            setIsModalOpen(false)
            setLoading(false)
        }
    };

    const onSuccess = async ({ payment_id, amount, usage, type }: successPayload) => {
        if (!emailId) return
        try {
            setLoading(true)
            dispatch(confirmAddonPayment({
                email: emailId,
                razorPayId: payment_id,
                amount: amount,
                usage,
                type
            })).then(res => {
                console.log('firebase writing response is ', res);
            })
            // navigate to success screen 
            navigation.navigate(screenNames.PaymentSuccessScreen, {
                payment_id,
                amount: amount * 100,
                usage: String(usage),
                type: 'addon'
            })
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <View style={styles.wrapper}>
            <Text style={styles.sectionLabel}>Current Bill</Text>

            <View style={styles.card}>
                {/* Top accent bar */}
                <View style={[styles.accentBar, { backgroundColor: isPaid ? colors.success : colors.warning }]} />

                {/* Decorative circle */}
                <View style={styles.decorCircle} />
                <View style={styles.decorCircle2} />

                {/* Header row */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.monthText}>{monthLabel}</Text>
                    </View>
                    <View style={styles.statusPill}>
                        <Animated.View
                            style={[
                                styles.statusDot,
                                {
                                    backgroundColor: isPaid ? colors.success : colors.warning,
                                    transform: [{ scale: isPaid ? 1 : pulseAnim }],
                                },
                            ]}
                        />
                        <Text style={[styles.statusText, { color: isPaid ? colors.success : colors.warning }]}>
                            {isPaid ? 'Paid' : 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Amount display */}
                <View style={styles.amountRow}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.amountText}>{billObject.amount}</Text>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Image source={localImages.usages}
                            style={styles.Stateicon} />
                        <View>
                            <Text style={styles.statValue}>{billObject.usage?.toFixed(0)} L</Text>
                            <Text style={styles.statLabel}>Used</Text>
                        </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Image source={localImages.calendar}
                            style={styles.Stateicon} />
                        <View>
                            <Text style={styles.statValue}>{billObject.dueDate}</Text>
                            <Text style={styles.statLabel}>Days left</Text>
                        </View>
                    </View>
                </View>

                {/* Pay button */}
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={[styles.button, isDisabled && styles.disabledButton]}
                        disabled={isDisabled}
                        onPress={() => setIsModalOpen(true)}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                    >
                        {!isDisabled && <Text style={styles.buttonIcon}>⚡</Text>}
                        <Text style={[styles.buttonText, !isDisabled && { color: colors.white }]}>
                            {isPaid ? 'Already Paid' : !isMonthEnd ? 'Available on Month End' : 'Pay Now'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <ConfirmationPayModal
                visible={isModalOpen}
                onProceedPayment={onProceedPayment}
                onCancelProceed={onCancelProceed}
                amount={10}
                type={'recharge'}
                refill='10'
            />

            <Modal
                visible={loading}
                transparent
                animationType="fade"
                statusBarTranslucent
            >
                <View style={styles.loadingOverlay}>
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loaderText}>Processing payment...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CurrentBillComponent;

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: vw(16),
        marginTop: vh(16),
    },
    sectionLabel: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: colors.primary,
        marginBottom: vh(10),
        letterSpacing: -0.2,
    },
    decorCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primaryLight,
        top: -30,
        right: -20,
    },
    decorCircle2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 160,
        backgroundColor: 'rgba(50,194,202,0.08)',
        bottom: 60,
        left: 10,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: colors.primaryDark,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    accentBar: {
        height: 4,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: vw(20),
        paddingBottom: vh(4),
    },
    monthText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: colors.neutralBlack,
        letterSpacing: -0.3,
    },
    subText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
        marginTop: 2,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        paddingHorizontal: vw(10),
        paddingVertical: vh(5),
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(12),
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: vw(20),
        paddingVertical: vh(0),
    },
    currencySymbol: {
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
        color: colors.primary,
        marginTop: vh(6),
        marginRight: vw(2),
    },
    amountText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(42),
        color: colors.neutralBlack,
        letterSpacing: -1.5,
        lineHeight: normalize(48),
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: vw(20),
        marginBottom: vh(12),
        marginTop: vh(8),
        backgroundColor: colors.white,
        elevation: 2,
        borderRadius: normalize(14),
        padding: vw(8),
        gap: vw(8),
        borderWidth: normalize(1),
        borderColor: colors.border
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: vw(8),
        marginLeft: vw(4)
    },
    Stateicon: {
        height: vh(22),
        width: vh(22),
        marginRight: vw(2),
        tintColor: colors.black
    },
    statIcon: {
        fontSize: 20,
    },
    statValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: colors.neutralBlack,
    },
    statLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: colors.neutralBodyText,
    },
    statDivider: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: colors.border,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        color: colors.white,
        marginHorizontal: vw(20),
        marginBottom: vh(20),
        paddingVertical: vh(15),
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 4,
        shadowColor: colors.primaryDark,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    disabledButton: {
        backgroundColor: colors.inputBackground,
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonIcon: {
        fontSize: 16,
    },
    buttonText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(15),
        color: colors.grayScaleColor,
        letterSpacing: 0.2,
    },

    // loading 
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    loaderBox: {
        backgroundColor: colors.white,
        paddingVertical: vh(24),
        paddingHorizontal: vw(30),
        borderRadius: normalize(16),
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },

    loaderText: {
        marginTop: vh(10),
        fontFamily: fonts.Medium,
        fontSize: normalize(13),
        color: colors.neutralBodyText,
    },
});
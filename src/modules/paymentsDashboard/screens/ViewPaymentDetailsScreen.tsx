import React, { useRef, useEffect, useState } from 'react'
import {
    View, Text, StyleSheet, ScrollView, Animated, Platform, Pressable,
    Image,
} from 'react-native'

import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { generateAndShareReceiptPDF } from '@dwwp/utils/generateAndDownloadPDF'
import { buildReceiptHTML } from '@dwwp/utils/buildReceiptHTML'
import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MainStackParamList } from '@dwwp/utils/types'
import { PaymentRecord, AddonRecord } from '@dwwp/modals'
import { CustomButton } from '@dwwp/components/CustomButton'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { showSuccessSnackbar } from '@dwwp/utils/showSnackBar'
import { localImages } from '@dwwp/utils/localimages'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// ─── Types ────────────────────────────────────────────────────────────────────
type Transaction =
    | ({ type: 'payment' } & PaymentRecord)
    | ({ type: 'addon' } & AddonRecord)

type Props = {
    route: RouteProp<MainStackParamList, 'ViewPaymentDetailsScreen'>;
    navigation: NativeStackNavigationProp<MainStackParamList, 'ViewPaymentDetailsScreen'>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(amount: number) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
}

function formatFullDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—'
    try {
        const date = new Date(dateStr)
        return date.toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        })
    } catch {
        return dateStr
    }
}

function truncateId(id: string): string {
    return id.length > 26 ? `${id.slice(0, 10)}…${id.slice(-6)}` : id
}

function getStatusColor(status: string | null): string {
    const s = (status ?? 'Completed').toLowerCase()
    if (s === 'completed') return colors.success || '#27AE60'
    if (s === 'pending') return colors.warning || '#F39C12'
    return colors.error || '#E74C3C'
}

function getStatusIcon(status: string | null): string {
    const s = (status ?? 'Completed').toLowerCase()
    if (s === 'completed') return '✓'
    if (s === 'pending') return '⏳'
    return '✕'
}

function getTransactionIcon(type: 'payment' | 'addon'): string {
    return type === 'payment' ? '💰' : '💧'
}

function getTransactionTitle(type: 'payment' | 'addon'): string {
    return type === 'payment' ? 'Regular Payment' : 'Addon Recharge'
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const Row: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
    <View style={rowS.wrap}>
        <Text style={rowS.label}>{label}</Text>
        <Text style={[rowS.value, accent && rowS.accentValue]} numberOfLines={2}>{value}</Text>
    </View>
)

const rowS = StyleSheet.create({
    wrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: normalize(10) },
    label: { fontFamily: fonts.Regular, fontSize: normalize(13), color: colors.black },
    value: { fontFamily: fonts.SemiBold, fontSize: normalize(13), color: colors.black, textAlign: 'right', maxWidth: '70%' },
    accentValue: { fontFamily: fonts.Bold, color: colors.primary, fontSize: normalize(14) },
})

const Dashes = () => (
    <View style={{ flexDirection: 'row', paddingVertical: normalize(2) }}>
        {Array.from({ length: 34 }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 1, backgroundColor: i % 2 === 0 ? colors.primary : 'transparent' }} />
        ))}
    </View>
)

const NotchRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View style={notchS.row}>
        <View style={notchS.circle} />
        {children}
        <View style={notchS.circle} />
    </View>
)

const notchS = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    circle: {
        width: normalize(14), height: normalize(14), borderRadius: normalize(7),
        backgroundColor: colors.primary,
        marginHorizontal: -normalize(7),
    },
})

// ─── Transaction Header ────────────────────────────────────────────────────────
const TransactionHeader: React.FC<{
    type: 'payment' | 'addon'
    amount: number
    status: string | null
    date: string | null
}> = ({ type, amount, status, date }) => {
    const statusColor = getStatusColor(status)
    const statusIcon = getStatusIcon(status)
    const txIcon = getTransactionIcon(type)
    const txTitle = getTransactionTitle(type)

    return (
        <View style={headerS.container}>
           
                <View style={headerS.iconWrap}>
                    <View style={[
                        headerS.icon,
                        { backgroundColor: type === 'payment' ? 'rgba(43,101,104,0.1)' : 'rgba(124,92,191,0.1)' }
                    ]}>
                        {/* <Text style={headerS.iconText}>{txIcon}</Text> */}
                         <Text style={headerS.amountValue}>{formatINR(amount)}</Text>
                    </View>
                    <View>
                        <Text style={headerS.title}>{txTitle}</Text>
                        <Text style={headerS.date}>{formatFullDate(date)}</Text>
                    </View>
                </View>
                <View style={[headerS.statusBadge, { borderColor: statusColor }]}>
                    <Text style={[headerS.statusIcon, { color: statusColor }]}>{statusIcon}</Text>
                </View>
        </View>
    )
}

const headerS = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: normalize(16),
        padding: normalize(16),
        marginBottom: normalize(16),
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
               flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: normalize(12),
    },
    icon: {
        // width: normalize(48),
        // height: normalize(48),
        padding : normalize(8),
        borderRadius: normalize(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(12),
    },
    iconText: {
        fontSize: normalize(20),
    },
    title: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(14),
        color: colors.black,
        marginBottom: normalize(3),
    },
    date: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.black,
        opacity: 0.6,
    },
    statusBadge: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusIcon: {
        fontSize: normalize(16),
        fontFamily: fonts.Bold,
    },
    amountWrap: {
        paddingTop: normalize(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    amountLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: colors.black,
        opacity: 0.6,
        marginBottom: normalize(4),
    },
    amountValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(24),
        color: colors.primary,
    },
})

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const ViewPaymentDetailsScreen = ({ navigation, route }: Props) => {
    const transaction = route?.params?.transaction as Transaction | undefined
    const { bottom } = useSafeAreaInsets()
    if (!transaction) {
        return (
            <View style={S.root}>
                <Text style={S.errorText}>Transaction not found</Text>
            </View>
        )
    }
 
    const isPayment = transaction.type === 'payment'
    const amount = transaction.amount ?? 0
    const status = transaction.status
    const date = isPayment ? transaction.timeStamp : transaction.addon_date
    const transactionId = isPayment ? transaction.razorPayId : transaction.razor_pay_id

    // ── Animations ────────────────────────────────────────────────────────────
    const fadeIn = useRef(new Animated.Value(0)).current
    const slideUp = useRef(new Animated.Value(24)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(slideUp, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
        ]).start()
    }, [])

    // ── PDF Download ──────────────────────────────────────────────────────────
    const [isDownloadLoading, setIsDownloadLoading] = useState(false)

    const handleDownloadPDF = async () => {
        setIsDownloadLoading(true)
        try {
            const html = buildReceiptHTML({
                payment_id: transactionId,
                amount: String(amount),
                date: formatFullDate(date),
                qty: isPayment ? undefined : (transaction as AddonRecord).quantityDone,
                refill: isPayment ? undefined : (transaction as AddonRecord).refill,
                addon: isPayment ? undefined : `Addon Recharge`,
                previousLimit: 0,
                newLimit: 0,
                currentUsage: 0
            })
            showSuccessSnackbar('PDF Saved in phone')
            await generateAndShareReceiptPDF(html, `DWWP_Receipt_${transactionId}`)
        } catch (err) {
            console.error('PDF error:', err)
        } finally {
            setIsDownloadLoading(false)
        }
    }

    const handleGoBack = () => navigation?.goBack()

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <View style={S.root}>
            <CustomHeader
                screenName='Transaction Details'
                subTitle={transactionId}
            />

            <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View style={[{ opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
                    {/* Transaction Header Card */}
                    <TransactionHeader
                        type={transaction.type}
                        amount={amount}
                        status={status}
                        date={date}
                    />

                    {/* Receipt Card */}
                    <View style={S.receipt}>
                        <NotchRow>
                            <Text style={S.receiptTitle}>Receipt</Text>
                        </NotchRow>

                        {/* Info Banner */}
                        <View style={S.infoBanner}>
                            <Image source={localImages.info} style={S.info} />
                            <Text style={S.infoBannerText}>Below is your complete transaction record. Download for your records.</Text>
                        </View>

                        <View style={S.receiptBody}>
                            {/* Section 1: Transaction Basics */}
                            <Text style={S.sectionTitle}>Transaction Details</Text>
                            <Row label="Type" value={isPayment ? 'Regular Payment' : 'Addon Recharge'} />
                            <Row label="Amount" value={formatINR(amount)} accent />
                            <Row label="Status" value={status ? `${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}` : 'Completed'} accent />

                            <Dashes />

                            {/* Section 2: Payment Specific */}
                            {isPayment && (
                                <>
                                    <Text style={S.sectionTitle}>Payment Information</Text>
                                    <Row label="Billing Month" value={(transaction as PaymentRecord).forMonth || '—'} />
                                    <Row label="Razor Pay ID" value={truncateId((transaction as PaymentRecord).razorPayId)} />
                                    {(transaction as PaymentRecord).date && (
                                        <Row label="Original Date" value={formatFullDate((transaction as PaymentRecord).date)} />
                                    )}
                                    <Dashes />
                                </>
                            )}

                            {/* Section 3: Addon Specific */}
                            {!isPayment && (
                                <>
                                    <Text style={S.sectionTitle}>Addon Details</Text>
                                    <Row label="Quantity" value={`${(transaction as AddonRecord).quantityDone ?? 0} unit(s)`} />
                                    <Row label="Refill Per Unit" value={`${(transaction as AddonRecord).refill ?? 0}L`} />
                                    <Row label="Total Refill" value={`${((transaction as AddonRecord).quantityDone ?? 0) * ((transaction as AddonRecord).refill ?? 0)}L`} accent />
                                    <Row label="Razor Pay ID" value={truncateId((transaction as AddonRecord).razor_pay_id)} />
                                    <Dashes />
                                </>
                            )}

                            {/* Section 4: Timestamp & Metadata */}
                            <Text style={S.sectionTitle}>Transaction Time</Text>
                            <Row label="Date & Time" value={formatFullDate(date)} />
                            <Row label="Timezone" value="UTC+5:30 (IST)" />

                            <Dashes />

                            {/* Section 5: Summary */}
                            <Text style={S.sectionTitle}>Summary</Text>
                            <Row label="Payment Method" value="Razorpay" />
                            <Row label="Transaction Status" value={status ? `${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}` : 'Completed'} accent />
                        </View>

                        <NotchRow>
                            <View style={{ flex: 1, height: 1, borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }} />
                        </NotchRow>

                        <Text style={S.receiptFooter}>
                            This is an official receipt of your transaction. Keep it for your records.
                        </Text>
                    </View>

                    <View style={{ height: normalize(120) }} />
                </Animated.View>
            </ScrollView>

            {/* Bottom Actions - Focus on Share */}
            <Animated.View style={[S.bottomBar, { opacity: fadeIn, marginBottom: bottom }]}>
                <CustomButton
                    title='Download Receipt'
                    variant='primary'
                    onPress={handleDownloadPDF}
                    loading={isDownloadLoading}
                    disabled={isDownloadLoading}
                    style={{ flex: 1 }}
                />
                <CustomButton
                    title='Close'
                    variant='outline'
                    onPress={handleGoBack}
                    style={{ minWidth: normalize(80) }}
                />
            </Animated.View>
        </View>
    )
}

export default ViewPaymentDetailsScreen

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Content
    scroll: {
        paddingHorizontal: normalize(16),
        paddingTop: normalize(16),
        paddingBottom: normalize(16),
    },

    // Receipt
    receipt: {
        backgroundColor: colors.white,
        borderTopWidth: normalize(2),
        borderTopColor: colors.primary,
        borderRadius: normalize(16),
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    receiptTitle: {
        flex: 1,
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        color: colors.black,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        textAlign: 'center',
        paddingVertical: normalize(12),
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(43,101,104,0.08)',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(12),
        gap: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(43,101,104,0.15)',
    },
    infoBannerIcon: {
        fontSize: normalize(16),
    },
    info: {
        height: (18),
        width: vh(18)
    },
    infoBannerText: {
        flex: 1,
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.black,
        opacity: 0.7,
        lineHeight: normalize(16),
    },
    receiptBody: {
        paddingHorizontal: normalize(18),
        paddingVertical: normalize(8),
    },
    sectionTitle: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
        color: colors.black,
        opacity: 0.7,
        marginTop: normalize(12),
        marginBottom: normalize(8),
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    receiptFooter: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: colors.black,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: normalize(16),
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(16),
    },

    // Bottom actions
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: normalize(10),
        paddingHorizontal: normalize(16),
        paddingBottom: Platform.OS === 'ios' ? normalize(34) : normalize(18),
        paddingTop: normalize(12),
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    // Error
    errorText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(14),
        color: colors.black,
        textAlign: 'center',
        marginTop: vh(50),
    },
})
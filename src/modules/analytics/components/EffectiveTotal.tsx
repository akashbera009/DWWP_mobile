import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { MOCK_ADDONS, MOCK_MONTH_DATA } from '@dwwp/modules/dashboard/components/Monthlyusagedetail'

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(2)}kL` : `${Math.round(n)}L`

const C = {
    primary: '#2B6568',
    primaryDark: '#1e4a4d',
    primaryLight: 'rgba(43,101,104,0.10)',
    primaryBorder: 'rgba(43,101,104,0.18)',
    cyan: '#32C2CA',
    cyanBg: 'rgba(50,194,202,0.10)',
    cyanBorder: 'rgba(50,194,202,0.22)',
    white: '#FFFFFF',
    black: '#041617',
    body: '#6A7C92',
    border: '#E1E8ED',
    bg: '#F4F7F8',
    card: '#FFFFFF',
    error: '#E74C3C',
    errorBg: 'rgba(231,76,60,0.08)',
    errorBorder: 'rgba(231,76,60,0.20)',
    warning: '#F39C12',
    warningBg: 'rgba(243,156,18,0.08)',
    warningBorder: 'rgba(243,156,18,0.22)',
    success: '#27AE60',
    successBg: 'rgba(39,174,96,0.08)',
    successBorder: 'rgba(39,174,96,0.20)',
    inputBg: '#EFF2F5',
    shadow: 'rgba(43,101,104,0.10)',
    purple: '#7B68EE',
    purpleBg: 'rgba(123,104,238,0.10)',
}

const addons = MOCK_ADDONS
const monthData = MOCK_MONTH_DATA

const EffectiveTotal = () => {
    const totalConsumed = Object.values(monthData.dailyUsages).reduce((s, v) => s + v, 0)
    const totalAddonLiters = addons.reduce((s, a) => s + a.quantityDone, 0)
    const effectiveLimit = monthData.limit + totalAddonLiters
    const baseConsumed = Math.min(totalConsumed, monthData.limit)
    const addonConsumed = Math.max(totalConsumed - monthData.limit, 0)
    const remaining = Math.max(effectiveLimit - totalConsumed, 0)
    const overUsed = Math.max(totalConsumed - effectiveLimit, 0)
    const basePct = Math.min(baseConsumed / Math.max(monthData.limit, 1), 1)
    return (
        <>
            <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabelText}>Effective Total</Text>
                <View style={styles.sectionLine} />
            </View>

            <View style={styles.card}>
                <Text style={styles.effectiveTitle}>
                    {fmt(totalConsumed)} <Text style={styles.effectiveOf}>of</Text> {fmt(effectiveLimit)}
                </Text>
                <Text style={styles.effectiveSub}>
                    Base {fmt(monthData.limit)} + Addon {fmt(totalAddonLiters)}
                </Text>

                <View style={styles.stackedBarWrap}>
                    <View style={styles.stackedBarTrack}>
                        <View style={[styles.stackedBarBase, {
                            flex: monthData.limit,
                            backgroundColor: C.cyanBg,
                            borderRightWidth: addons.length > 0 ? 1 : 0,
                            borderRightColor: C.border,
                        }]}>
                            <View style={[styles.stackedBarFill, {
                                width: `${basePct * 100}%`,
                                backgroundColor: basePct >= 1 ? C.error : C.cyan,
                            }]} />
                        </View>

                        {totalAddonLiters > 0 && (
                            <View style={[styles.stackedBarBase, { flex: totalAddonLiters, backgroundColor: C.purpleBg }]}>
                                <View style={[styles.stackedBarFill, {
                                    width: `${Math.min(addonConsumed / Math.max(totalAddonLiters, 1), 1) * 100}%`,
                                    backgroundColor: C.purple,
                                }]} />
                            </View>
                        )}
                    </View>
                    <View style={styles.stackedBarLabels}>
                        <Text style={[styles.stackedBarLabel, { color: C.cyan }]}>Base</Text>
                        {totalAddonLiters > 0 && (
                            <Text style={[styles.stackedBarLabel, { color: C.purple }]}>Addon</Text>
                        )}
                    </View>
                </View>

                {[
                    { label: 'Base quota', val: fmt(monthData.limit), color: C.cyan, bg: C.cyanBg },
                    { label: 'Addon quota', val: fmt(totalAddonLiters), color: C.purple, bg: C.purpleBg },
                    { label: 'Total consumed', val: fmt(totalConsumed), color: C.primary, bg: C.primaryLight },
                    {
                        label: overUsed > 0 ? 'Over limit' : 'Remaining',
                        val: overUsed > 0 ? fmt(overUsed) : fmt(remaining),
                        color: overUsed > 0 ? C.error : C.success,
                        bg: overUsed > 0 ? C.errorBg : C.successBg
                    },
                ].map((row, i) => (
                    <View key={i} style={[styles.summaryRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
                        <View style={[styles.summaryRowDot, { backgroundColor: row.color }]} />
                        <Text style={styles.summaryRowLabel}>{row.label}</Text>
                        <View style={[styles.summaryRowValBox, { backgroundColor: row.bg }]}>
                            <Text style={[styles.summaryRowVal, { color: row.color }]}>{row.val}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </>
    )
}

export default EffectiveTotal

const styles = StyleSheet.create({


    //section labels
    sectionLabel: {
        flexDirection: 'row', alignItems: 'center',
        gap: normalize(10), marginBottom: normalize(10), marginTop: normalize(6),
    },
    sectionLabelText: {
        fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black, flexShrink: 0,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: C.border },
    sectionLabelMeta: {
        fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body, flexShrink: 0,
    },
    card: {
        backgroundColor: C.card, borderRadius: normalize(20),
        padding: normalize(18), marginBottom: normalize(12),
        shadowColor: 'rgba(43,101,104,0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 10, elevation: 3,
    },

    // Summary rows
    summaryRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: normalize(11), gap: normalize(10),
    },
    summaryRowDot: {
        width: normalize(8), height: normalize(8), borderRadius: normalize(4),
    },
    summaryRowLabel: {
        flex: 1, fontFamily: fonts.Regular, fontSize: normalize(13), color: C.black,
    },
    summaryRowValBox: {
        paddingHorizontal: normalize(10), paddingVertical: normalize(4),
        borderRadius: normalize(8),
    },
    summaryRowVal: {
        fontFamily: fonts.Bold, fontSize: normalize(13),
    },

    // Effective title
    effectiveTitle: {
        fontFamily: fonts.Bold, fontSize: normalize(24), color: C.black,
    },
    effectiveOf: {
        fontFamily: fonts.Regular, fontSize: normalize(16), color: C.body,
    },
    effectiveSub: {
        fontFamily: fonts.Regular, fontSize: normalize(12),
        color: C.body, marginTop: vh(3),
    },

    // Stacked bar
    stackedBarWrap: { marginVertical: normalize(14) },
    stackedBarTrack: {
        height: normalize(18), flexDirection: 'row',
        borderRadius: normalize(9), overflow: 'hidden',
        backgroundColor: C.inputBg,
    },
    stackedBarBase: { height: '100%', overflow: 'hidden' },
    stackedBarFill: { height: '100%' },
    stackedBarLabels: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: normalize(5), paddingHorizontal: normalize(2),
    },
    stackedBarLabel: {
        fontFamily: fonts.SemiBold, fontSize: normalize(10),
    },
})
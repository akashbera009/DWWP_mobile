import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { normalize, vh} from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'

const colors = {
    primary: '#2B6568',
    primaryLight: 'rgba(43,101,104,0.12)',
    primaryDark: '#1e4a4d',
    activeDot: '#32C2CA',
    activeDotLight: 'rgba(50,194,202,0.18)',
    lightGreen: 'rgba(50,194,202,0.08)',
    white: '#FFFFFF',
    neutralBlack: '#041617',
    neutralBodyText: '#6A7C92',
    background: '#F4F7F8',
    border: '#E1E8ED',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    lightGray: '#F8F9FA',
    inputBackground: '#EFF2F5',
    shadow: 'rgba(43,101,104,0.10)',
    cardShadow: 'rgba(43,101,104,0.08)',
    primaryDisabled: '#4A8A8D',
}
const HeroSummaryCard = ({ onlineCount, total }: { onlineCount: number; total: number }) => {
    const ringRadius = 38
    const circumference = 2 * Math.PI * ringRadius
    const usagePct = 0.67  // 72% of monthly budget used
    const strokeDash = circumference * usagePct

    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryDark, '#163a3c']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
        >
            {/* Decorative circle blobs */}
            <View style={styles.heroBlobTop} />
            <View style={styles.heroBlobBottom} />

            {/* Left: text content */}
            <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>Current Bill</Text>
                <Text style={styles.heroAmount}>₹2,340</Text>
                <View style={styles.heroRow}>
                    <View style={[styles.heroBadge, { backgroundColor: 'rgba(50,194,202,0.18)' }]}>
                        <Text style={styles.heroBadgeText}>Due in 8 days</Text>
                    </View>
                </View>
                <View style={styles.heroStats}>
                    <View style={styles.heroStatItem}>
                        <Text style={styles.heroStatValue}>590</Text>
                        <Text style={styles.heroStatUnit}>kWh used</Text>
                    </View>
                    <View style={styles.heroStatDivider} />
                    <View style={styles.heroStatItem}>
                        <Text style={styles.heroStatValue}>{onlineCount}/{total}</Text>
                        <Text style={styles.heroStatUnit}>devices on</Text>
                    </View>
                </View>
            </View>

            {/* Right: circular ring progress */}
            <View style={styles.heroRight}>
                <View style={styles.ringContainer}>
                    {/* SVG-like ring using View rotation trick */}
                    <View style={styles.ringOuter}>
                        <View style={styles.ringTrack} />
                        {/* Arc segments via rotated views */}
                        {Array.from({ length: 20 }).map((_, i) => {
                            const angle = (i / 20) * 360
                            const active = i < Math.round(20 * usagePct)
                            return (
                                <View
                                    key={i}
                                    style={[
                                        styles.ringSegment,
                                        {
                                            transform: [{ rotate: `${angle}deg` }],
                                            borderTopColor: active ? colors.activeDot : 'transparent',
                                            opacity: active ? (0.5 + (i / 20) * 0.5) : 0.15,
                                        }
                                    ]}
                                />
                            )
                        })}
                        <View style={styles.ringInner}>
                            <Text style={styles.ringPct}>72%</Text>
                            <Text style={styles.ringPctLabel}>used</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.ringCaption}>Monthly budget</Text>
            </View>
        </LinearGradient>
    )
}
export default HeroSummaryCard

const styles = StyleSheet.create({

        // Hero Card
        heroCard: {
            borderRadius: normalize(24),
            padding: normalize(22),
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
            minHeight: normalize(160),
        },
        heroBlobTop: {
            position: 'absolute',
            top: -normalize(40),
            right: -normalize(20),
            width: normalize(160),
            height: normalize(160),
            borderRadius: normalize(80),
            backgroundColor: 'rgba(50,194,202,0.08)',
        },
        heroBlobBottom: {
            position: 'absolute',
            bottom: -normalize(50),
            left: normalize(100),
            width: normalize(130),
            height: normalize(130),
            borderRadius: normalize(65),
            backgroundColor: 'rgba(255,255,255,0.04)',
        },
        heroLeft: {
            flex: 1,
            gap: vh(6),
        },
        heroLabel: {
            fontFamily: fonts.Medium,
            fontSize: normalize(12),
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
        },
        heroAmount: {
            fontFamily: fonts.Bold,
            fontSize: normalize(32),
            color: colors.white,
            lineHeight: normalize(36),
        },
        heroRow: {
            flexDirection: 'row',
        },
        heroBadge: {
            paddingHorizontal: normalize(10),
            paddingVertical: normalize(4),
            borderRadius: normalize(20),
        },
        heroBadgeText: {
            fontFamily: fonts.SemiBold,
            fontSize: normalize(11),
            color: colors.activeDot,
        },
        heroStats: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: normalize(14),
            marginTop: vh(4),
        },
        heroStatItem: {
            gap: vh(1),
        },
        heroStatValue: {
            fontFamily: fonts.Bold,
            fontSize: normalize(15),
            color: colors.white,
        },
        heroStatUnit: {
            fontFamily: fonts.Regular,
            fontSize: normalize(10),
            color: 'rgba(255,255,255,0.55)',
        },
        heroStatDivider: {
            width: 1,
            height: normalize(28),
            backgroundColor: 'rgba(255,255,255,0.2)',
        },
        heroRight: {
            alignItems: 'center',
            gap: vh(6),
        },
        ringContainer: {
            width: normalize(90),
            height: normalize(90),
        },
        ringOuter: {
            width: normalize(90),
            height: normalize(90),
            borderRadius: normalize(45),
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        ringTrack: {
            position: 'absolute',
            width: normalize(90),
            height: normalize(90),
            borderRadius: normalize(45),
            borderWidth: normalize(8),
            borderColor: 'rgba(255,255,255,0.1)',
        },
        ringSegment: {
            position: 'absolute',
            width: normalize(90),
            height: normalize(90),
            borderRadius: normalize(45),
            borderTopWidth: normalize(8),
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
        },
        ringInner: {
            width: normalize(66),
            height: normalize(66),
            borderRadius: normalize(33),
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
        },
        ringPct: {
            fontFamily: fonts.Bold,
            fontSize: normalize(17),
            color: colors.white,
        },
        ringPctLabel: {
            fontFamily: fonts.Regular,
            fontSize: normalize(9),
            color: 'rgba(255,255,255,0.6)',
        },
        ringCaption: {
            fontFamily: fonts.Regular,
            fontSize: normalize(10),
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
        },
    
})
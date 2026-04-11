import React, { useEffect, useRef } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
} from 'react-native'

import { normalize } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { calculatePrediction } from '../analyticsActions'
import { selectCurrentPrediction, selectShouldRecalculatePrediction } from '../analyticsSlice'
// import { LiquidGlassCard } from '@dwwp/modules/analytics/components/Liquidglasscard'
import colors from '@dwwp/utils/colors'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIcon(riskLevel: 'safe' | 'warning' | 'critical'): string {
    return { safe: '✅', warning: '⚠️', critical: '⚡' }[riskLevel]
}

function formatTime(isoString: string): string {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString('en-IN')
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TrendCard: React.FC<{ onDetailPress?: () => void }> = ({ onDetailPress }) => {
    const dispatch = useAppDispatch()
    const prediction = useAppSelector(selectCurrentPrediction)
    const shouldRecalculate = useAppSelector(selectShouldRecalculatePrediction)
    const isLoading = useAppSelector(state => state.analytics.isLoading)

    const slideAnim = useRef(new Animated.Value(20)).current
    const opacityAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (!isLoading && (shouldRecalculate || !prediction)) {
            dispatch(calculatePrediction())
        }
    }, [dispatch, shouldRecalculate, prediction, isLoading])

    useEffect(() => {
        if (prediction) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 10,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [prediction])

    if (!prediction) {
        return (
            <View style={styles.wrapper}>
                <View style={styles.loadingCard}>
                    <Text style={styles.loadingText}>Loading prediction...</Text>
                </View>
            </View>
        )
    }

    return (
        <Animated.View
            style={[
                styles.wrapper,
                { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
            ]}
        >
            <TouchableOpacity
                activeOpacity={onDetailPress ? 0.85 : 1}
                onPress={onDetailPress}
                disabled={!onDetailPress}
            >
                {/* <LiquidGlassCard riskLevel={prediction.riskLevel} borderRadius={normalize(16)}> */}
                    <View style={styles.inner}>

                        {/* Icon + Title + Confidence */}
                        <View style={styles.topRow}>
                            <View style={styles.iconBox}>
                                <Text style={styles.iconText}>{getIcon(prediction.riskLevel)}</Text>
                            </View>
                            <View style={styles.titleSection}>
                                <Text style={styles.mainLabel}>
                                    {prediction.riskLevel === 'safe'
                                        ? 'Well Under Pace'
                                        : prediction.riskLevel === 'warning'
                                            ? 'Slightly Above Pace'
                                            : 'Critical Usage'}
                                </Text>
                                <Text style={styles.subLabel}>
                                    {prediction.riskPercentage}% of quota projected
                                </Text>
                            </View>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceLabel}>CONF</Text>
                                <Text style={styles.confidenceValue}>{prediction.confidence}%</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Stats Grid */}
                        <View style={styles.statsGrid}>
                            <StatCell
                                label="Projected"
                                value={`${prediction.projectedMonthlyUsage}L`}
                                meta={`${prediction.projectedDailyAverage}L/day`}
                            />
                            <StatCell
                                label="Current"
                                value={`${prediction.currentUsage}L`}
                                meta={`Day ${new Date().getDate()}`}
                            />
                            <StatCell
                                label="Remaining"
                                value={`${prediction.daysRemaining}d`}
                                meta={`${Math.round(
                                    (prediction.projectedMonthlyUsage - prediction.currentUsage) /
                                    Math.max(prediction.daysRemaining, 1)
                                )}L/day`}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Season + Pace + Trend */}
                        <View style={styles.contextRow}>
                            <ContextItem label="Season" value={prediction.season} icon="🌍" />
                            <ContextItem
                                label="Pace"
                                value={`${prediction.paceRatio.toFixed(2)}x`}
                                icon="⚡"
                                color={
                                    prediction.paceRatio > 1.2
                                        ? '#C62828'
                                        : prediction.paceRatio > 1.05
                                            ? '#E65100'
                                            : '#2E7D32'
                                }
                            />
                            <ContextItem
                                label="Trend"
                                value={prediction.trend}
                                icon={prediction.trend === 'increasing' ? '📈' : '📉'}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Alert */}
                        {prediction.alerts.length > 0 && (
                            <View style={styles.alertBox}>
                                <Text style={styles.alertMessage}>
                                    {prediction.alerts[0].message}
                                </Text>
                                <Text style={styles.alertRec}>
                                    {prediction.alerts[0].recommendation}
                                </Text>
                            </View>
                        )}

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.updatedText}>
                                Updated {formatTime(prediction.lastUpdated)}
                            </Text>
                            {onDetailPress && (
                                <Text style={styles.tapHint}>Tap for details →</Text>
                            )}
                        </View>

                    </View>
                {/* </LiquidGlassCard> */}
            </TouchableOpacity>
        </Animated.View>
    )
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

const StatCell: React.FC<{ label: string; value: string; meta: string }> = ({ label, value, meta }) => (
    <View style={styles.statCell}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statMeta}>{meta}</Text>
    </View>
)

const ContextItem: React.FC<{
    label: string; value: string; icon: string; color?: string
}> = ({ label, value, icon, color = '#1a1a1a' }) => (
    <View style={styles.contextItem}>
        <Text style={styles.contextIcon}>{icon}</Text>
        <Text style={styles.contextLabel}>{label}</Text>
        <Text style={[styles.contextValue, { color }]}>{value}</Text>
    </View>
)

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: normalize(12),
    },
    inner: {
        backgroundColor:colors.background,
        paddingVertical: normalize(16),
        paddingHorizontal: normalize(14),
        borderRadius : normalize(16),
        elevation:10
    },
    loadingCard: {
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: normalize(16),
        height: normalize(120),
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(13),
        color: '#888',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(10),
        marginBottom: normalize(12),
    },
    iconBox: {
        width: normalize(48),
        height: normalize(48),
        borderRadius: normalize(12),
        backgroundColor: 'rgba(0,0,0,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: normalize(24),
    },
    titleSection: {
        flex: 1,
    },
    mainLabel: {
        fontFamily: fonts.Bold,
        fontSize: normalize(15),
        color: '#111111',
        marginBottom: normalize(2),
    },
    subLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: 'rgba(0,0,0,0.50)',
    },
    confidenceBadge: {
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderRadius: normalize(10),
        paddingVertical: normalize(6),
        paddingHorizontal: normalize(8),
        minWidth: normalize(50),
        alignItems: 'center',
    },
    confidenceLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(8),
        color: 'rgba(0,0,0,0.40)',
        letterSpacing: 0.5,
        marginBottom: normalize(2),
    },
    confidenceValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: '#111111',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.08)',
        marginVertical: normalize(11),
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCell: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: 'rgba(0,0,0,0.40)',
        marginBottom: normalize(4),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: '#111111',
        marginBottom: normalize(2),
    },
    statMeta: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: 'rgba(0,0,0,0.38)',
    },
    contextRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: normalize(6),
    },
    contextItem: {
        alignItems: 'center',
        gap: normalize(4),
    },
    contextIcon: {
        fontSize: normalize(16),
    },
    contextLabel: {
        fontFamily: fonts.Regular,
        fontSize: normalize(9),
        color: 'rgba(0,0,0,0.40)',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    contextValue: {
        fontFamily: fonts.Bold,
        fontSize: normalize(12),
        color: '#111111',
    },
    alertBox: {
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: normalize(10),
        padding: normalize(10),
        marginBottom: normalize(10),
    },
    alertMessage: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(12),
        color: '#111111',
        marginBottom: normalize(3),
    },
    alertRec: {
        fontFamily: fonts.Regular,
        fontSize: normalize(11),
        color: 'rgba(0,0,0,0.50)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    updatedText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        color: 'rgba(0,0,0,0.38)',
    },
    tapHint: {
        fontFamily: fonts.SemiBold,
        fontSize: normalize(10),
        color: 'rgba(0,0,0,0.50)',
    },
})

export default TrendCard
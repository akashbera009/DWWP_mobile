/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WATER USAGE PREDICTION SYSTEM
 * 
 * Features:
 * - Historical trend analysis
 * - Seasonal adjustment (Summer/Winter/Rainy/Festive)
 * - Momentum-based projection
 * - Daily pace prediction
 * - Risk assessment
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Seasonal factors by month (India-centric)
 * Values represent multiplier for base usage
 */
export const SEASONAL_FACTORS: Record<number, { season: string; factor: number }> = {
  0: { season: 'Winter', factor: 0.85 }, // January
  1: { season: 'Winter', factor: 0.85 }, // February
  2: { season: 'Spring', factor: 0.90 }, // March
  3: { season: 'Summer', factor: 1.25 }, // April - Hot
  4: { season: 'Summer', factor: 1.30 }, // May - Peak summer
  5: { season: 'Monsoon', factor: 0.75 }, // June - Rainy season starts
  6: { season: 'Monsoon', factor: 0.70 }, // July - Peak monsoon
  7: { season: 'Monsoon', factor: 0.75 }, // August - Monsoon ends
  8: { season: 'Post-monsoon', factor: 0.95 }, // September
  9: { season: 'Autumn', factor: 1.05 }, // October - Festive season starts
  10: { season: 'Festive', factor: 1.15 }, // November - Festive peak
  11: { season: 'Festive/Winter', factor: 1.10 }, // December - Holiday season
}

/**
 * Festive periods adjustment
 * Days of month that have increased water usage due to festivals/holidays
 */
const FESTIVE_DATES = [
  { start: 15, end: 16, name: 'Holi' }, // March
  { start: 10, end: 11, name: 'Diwali' }, // October/November (varies)
  { start: 25, end: 26, name: 'Christmas' }, // December
  { start: 1, end: 3, name: 'New Year' },
]

// ─── Core Prediction Types ────────────────────────────────────────────────────
export interface UsagePrediction {
  // Projections
  projectedMonthlyUsage: number
  projectedEndOfMonth: number
  riskLevel: 'safe' | 'warning' | 'critical'
  riskPercentage: number

  // Breakdown
  currentUsage: number
  expectedByNow: number
  paceRatio: number
  daysRemaining: number
  projectedDailyAverage: number

  // Seasonal context
  seasonalFactor: number
  season: string
  isFestiveDay: boolean

  // Historical insights
  averageDailyUsage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trendMagnitude: number

  // Alerts
  alerts: PredictionAlert[]

  // Confidence
  confidence: number // 0-100
  lastUpdated: string
}

export interface PredictionAlert {
  type: 'urgent' | 'warning' | 'info'
  message: string
  recommendation: string
}

// ─── Main Prediction Engine ──────────────────────────────────────────────────

/**
 * Calculate comprehensive water usage prediction
 *
 * @param currentUsage - Current month's usage in liters
 * @param monthlyLimit - Monthly quota in liters
 * @param historicalMonths - Map of past months' usage {monthKey: total}
 * @param allTimeDaysTotal - Total liters used all-time (for baseline)
 * @param effectiveLimit - Current limit after addons
 */
export function calculateUsagePrediction(
  currentUsage: number,
  monthlyLimit: number,
  historicalMonths: Record<string, number>,
  allTimeDaysTotal: number,
  effectiveLimit: number
): UsagePrediction {
  const now = new Date()
  const dayOfMonth = now.getDate()
  const daysInMonth = getDaysInMonth(now.getMonth() + 1)

  // 1. Historical Analysis
  const historicalAnalysis = analyzeHistoricalTrend(historicalMonths)

  // 2. Seasonal Factor
  const seasonalInfo = SEASONAL_FACTORS[now.getMonth()]

  // 3. Festive Day Check
  const isFestiveDay = checkIfFestiveDay(dayOfMonth, now.getMonth())

  // 4. Calculate Expected Usage
  const expectedByNow = (dayOfMonth / daysInMonth) * effectiveLimit
  const paceRatio = currentUsage / Math.max(expectedByNow, 1)

  // 5. Calculate Average Daily Usage
  const currentDailyAverage = currentUsage / Math.max(dayOfMonth, 1)

  // 6. Adjusted Average (considering historical patterns and seasonal factors)
  const adjustedDailyAverage = calculateAdjustedDailyAverage(
    historicalAnalysis.averageDailyUsage,
    seasonalInfo.factor,
    isFestiveDay ? 1.1 : 1.0,
    historicalAnalysis.trend,
    historicalAnalysis.trendMagnitude
  )

  // 7. Project End of Month
  const daysRemaining = daysInMonth - dayOfMonth
  const projectedAdditionalUsage = adjustedDailyAverage * daysRemaining
  const projectedMonthlyUsage = currentUsage + projectedAdditionalUsage

  // 8. Calculate Risk
  const riskPercentage = (projectedMonthlyUsage / Math.max(effectiveLimit, 1)) * 100
  const riskLevel = calculateRiskLevel(riskPercentage)

  // 9. Generate Alerts
  const alerts = generateAlerts(
    riskLevel,
    riskPercentage,
    paceRatio,
    historicalAnalysis.trend,
    daysRemaining
  )

  // 10. Confidence Score
  const confidence = calculateConfidence(
    historicalMonths,
    dayOfMonth,
    historicalAnalysis
  )

  return {
    projectedMonthlyUsage: Math.round(projectedMonthlyUsage),
    projectedEndOfMonth: Math.round(projectedMonthlyUsage),
    riskLevel,
    riskPercentage: Math.round(riskPercentage),

    currentUsage: Math.round(currentUsage),
    expectedByNow: Math.round(expectedByNow),
    paceRatio: Math.round(paceRatio * 100) / 100,
    daysRemaining,
    projectedDailyAverage: Math.round(adjustedDailyAverage),

    seasonalFactor: seasonalInfo.factor,
    season: seasonalInfo.season,
    isFestiveDay,

    averageDailyUsage: Math.round(historicalAnalysis.averageDailyUsage),
    trend: historicalAnalysis.trend,
    trendMagnitude: Math.round(historicalAnalysis.trendMagnitude * 100) / 100,

    alerts,
    confidence,
    lastUpdated: new Date().toISOString(),
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Analyze historical usage trends
 */
function analyzeHistoricalTrend(historicalMonths: Record<string, number>): {
  averageDailyUsage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trendMagnitude: number
  variance: number
} {
  const values = Object.values(historicalMonths).filter(v => v > 0)

  if (values.length === 0) {
    return {
      averageDailyUsage: 60, // Default average
      trend: 'stable',
      trendMagnitude: 0,
      variance: 0,
    }
  }

  const totalDays = values.length * 30 // Approximate
  const totalUsage = values.reduce((a, b) => a + b, 0)
  const averageDailyUsage = totalUsage / totalDays

  // Calculate trend (comparing recent 3 months vs previous 3 months)
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  let trendMagnitude = 0

  if (values.length >= 6) {
    const recent3 = values.slice(-3)
    const previous3 = values.slice(-6, -3)

    const recentAvg = recent3.reduce((a, b) => a + b, 0) / 3
    const prevAvg = previous3.reduce((a, b) => a + b, 0) / 3

    trendMagnitude = (recentAvg - prevAvg) / prevAvg
    trend = trendMagnitude > 0.1 ? 'increasing' : trendMagnitude < -0.1 ? 'decreasing' : 'stable'
  }

  // Calculate variance
  const mean = averageDailyUsage
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val / 30 - mean, 2), 0) / values.length

  return {
    averageDailyUsage,
    trend,
    trendMagnitude,
    variance,
  }
}

/**
 * Check if today is a festive day
 */
function checkIfFestiveDay(dayOfMonth: number, monthIndex: number): boolean {
  const month = monthIndex + 1

  // Month-specific festive checks
  if (month === 3) {
    // March - Holi (usually mid-March)
    return dayOfMonth >= 15 && dayOfMonth <= 17
  }

  if (month === 10 || month === 11) {
    // October/November - Diwali (usually in October)
    return dayOfMonth >= 10 && dayOfMonth <= 12
  }

  if (month === 12) {
    // December - Christmas and New Year prep
    return dayOfMonth >= 15 || dayOfMonth === 1
  }

  if (month === 1) {
    // January - New Year
    return dayOfMonth <= 5
  }

  return false
}

/**
 * Calculate adjusted daily average considering multiple factors
 */
function calculateAdjustedDailyAverage(
  baseDailyAverage: number,
  seasonalFactor: number,
  festiveFactor: number,
  trend: 'increasing' | 'decreasing' | 'stable',
  trendMagnitude: number
): number {
  let adjusted = baseDailyAverage * seasonalFactor * festiveFactor

  // Apply trend momentum (smoother than raw trend)
  if (trend === 'increasing') {
    adjusted *= 1 + Math.min(trendMagnitude, 0.15) // Cap at 15% increase
  } else if (trend === 'decreasing') {
    adjusted *= Math.max(1 + trendMagnitude, 0.85) // Cap at 15% decrease
  }

  return adjusted
}

/**
 * Determine risk level
 */
function calculateRiskLevel(percentage: number): 'safe' | 'warning' | 'critical' {
  if (percentage > 95) return 'critical'
  if (percentage > 75) return 'warning'
  return 'safe'
}

/**
 * Generate contextual alerts
 */
function generateAlerts(
  riskLevel: 'safe' | 'warning' | 'critical',
  riskPercentage: number,
  paceRatio: number,
  trend: 'increasing' | 'decreasing' | 'stable',
  daysRemaining: number
): PredictionAlert[] {
  const alerts: PredictionAlert[] = []

  if (riskLevel === 'critical') {
    alerts.push({
      type: 'urgent',
      message: `⚡ Critical: Projected to use ${Math.round(riskPercentage)}% of monthly quota`,
      recommendation: 'Reduce water usage immediately. Consider taking shorter showers and fixing leaks.',
    })
  } else if (riskLevel === 'warning') {
    alerts.push({
      type: 'warning',
      message: `⚠️ Warning: On track to use ${Math.round(riskPercentage)}% of quota`,
      recommendation: 'Be mindful of water usage. Small changes can make a big difference.',
    })
  } else {
    alerts.push({
      type: 'info',
      message: '✅ Great pace! You\'re using water efficiently.',
      recommendation: 'Keep up the good habits!',
    })
  }

  // Trend alert
  if (trend === 'increasing' && daysRemaining > 5) {
    alerts.push({
      type: 'warning',
      message: '📈 Usage is trending upward',
      recommendation: 'Your consumption is increasing month-over-month. Monitor closely.',
    })
  }

  // Pace alert
  if (paceRatio > 1.2) {
    alerts.push({
      type: 'urgent',
      message: `⚡ Pace Alert: ${Math.round(paceRatio * 100)}% of expected usage already`,
      recommendation: 'You\'re ahead of pace. Reduce consumption to stay within quota.',
    })
  }

  // Few days left alert
  if (daysRemaining <= 3 && riskPercentage > 80) {
    alerts.push({
      type: 'warning',
      message: '⏰ Only ' + daysRemaining + ' days left in the month',
      recommendation: 'Minimize water usage in the remaining days.',
    })
  }

  return alerts
}

/**
 * Calculate confidence score (how reliable is the prediction)
 * Higher = more historical data and consistency
 */
function calculateConfidence(
  historicalMonths: Record<string, number>,
  dayOfMonth: number,
  analysis: ReturnType<typeof analyzeHistoricalTrend>
): number {
  let confidence = 50 // Base confidence

  // More historical data = higher confidence
  const monthsCount = Object.keys(historicalMonths).length
  confidence += Math.min(monthsCount * 5, 25) // Max +25

  // More days passed = higher confidence
  confidence += Math.min((dayOfMonth / 30) * 15, 15) // Max +15

  // Lower variance = higher confidence
  if (analysis.variance < 20) confidence += 10
  else if (analysis.variance < 50) confidence += 5

  return Math.min(confidence, 100)
}

/**
 * Get days in a given month
 */
function getDaysInMonth(month: number): number {
  const now = new Date()
  return new Date(now.getFullYear(), month, 0).getDate()
}

// ─── Utility Functions for Display ────────────────────────────────────────────

/**
 * Get human-readable prediction summary
 */
export function getPredictionSummary(prediction: UsagePrediction): string {
  if (prediction.riskLevel === 'critical') {
    return `⚡ Critical: You may exceed your ${prediction.riskPercentage}% quota. Reduce usage now!`
  } else if (prediction.riskLevel === 'warning') {
    return `⚠️ Watch out: ${prediction.riskPercentage}% quota usage projected. Be mindful.`
  } else {
    return `✅ Great pace! On track to use ${prediction.riskPercentage}% of quota.`
  }
}

/**
 * Get prediction color based on risk
 */
export function getPredictionColor(riskLevel: 'safe' | 'warning' | 'critical'): string {
  const colorMap = {
    safe: '#4CAF50', // Green
    warning: '#FF9800', // Orange
    critical: '#F44336', // Red
  }
  return colorMap[riskLevel]
}

/**
 * Format prediction for display
 */
export function formatPrediction(prediction: UsagePrediction): {
  mainStat: string
  subtitle: string
  icon: string
  color: string
} {
  return {
    mainStat: `${prediction.projectedMonthlyUsage}L`,
    subtitle: `${prediction.riskPercentage}% of quota projected`,
    icon:
      prediction.riskLevel === 'critical'
        ? '⚡'
        : prediction.riskLevel === 'warning'
        ? '⚠️'
        : '✅',
    color: getPredictionColor(prediction.riskLevel),
  }
}
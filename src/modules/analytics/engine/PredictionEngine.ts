/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WATER USAGE PREDICTION ENGINE v2
 *
 * Fixes in this version:
 * - Fixed effectiveLimit=0/undefined causing Infinity% quota bug
 * - Projection now blends historical average WITH current month pace
 * - Trend calculation normalized to daily averages (not raw month totals)
 * - Festive dates actually wired up and used
 * - Confidence now penalizes anomalous current-month pace
 * - All division operations protected against zero
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Seasonal Factors (India-centric) ─────────────────────────────────────────

export const SEASONAL_FACTORS: Record<number, { season: string; factor: number }> = {
  0:  { season: 'Winter',       factor: 0.85 },
  1:  { season: 'Winter',       factor: 0.85 },
  2:  { season: 'Spring',       factor: 0.90 },
  3:  { season: 'Summer',       factor: 1.20 },
  4:  { season: 'Summer',       factor: 1.25 },
  5:  { season: 'Monsoon',      factor: 0.80 },
  6:  { season: 'Monsoon',      factor: 0.75 },
  7:  { season: 'Monsoon',      factor: 0.80 },
  8:  { season: 'Post-Monsoon', factor: 0.95 },
  9:  { season: 'Autumn',       factor: 1.00 },
  10: { season: 'Festive',      factor: 1.10 },
  11: { season: 'Winter',       factor: 1.05 },
}

// ─── Festive Periods (month is 1-indexed) ─────────────────────────────────────

interface FestivePeriod {
  month: number
  startDay: number
  endDay: number
  name: string
  factor: number // usage multiplier during this period
}

const FESTIVE_PERIODS: FestivePeriod[] = [
  { month: 1,  startDay: 1,  endDay: 5,  name: 'New Year',  factor: 1.15 },
  { month: 3,  startDay: 13, endDay: 17, name: 'Holi',      factor: 1.30 }, // high water use
  { month: 4,  startDay: 13, endDay: 15, name: 'Baisakhi',  factor: 1.10 },
  { month: 8,  startDay: 19, endDay: 20, name: 'Janmashtami', factor: 1.05 },
  { month: 10, startDay: 2,  endDay: 5,  name: 'Navratri',  factor: 1.08 },
  { month: 10, startDay: 20, endDay: 24, name: 'Diwali',    factor: 1.15 },
  { month: 11, startDay: 1,  endDay: 3,  name: 'Diwali',    factor: 1.10 }, // Diwali can fall in Nov
  { month: 12, startDay: 24, endDay: 31, name: 'Christmas/NYE', factor: 1.12 },
]

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsagePrediction {
  // Core projections
  projectedMonthlyUsage: number
  riskLevel: 'safe' | 'warning' | 'critical'
  riskPercentage: number         // 0–100+ (capped at 150 for display sanity)

  // Pace
  currentUsage: number
  effectiveLimit: number
  expectedByNow: number          // linear expected usage for today's date
  paceRatio: number              // <1 = under pace, >1 = over pace
  daysElapsed: number
  daysRemaining: number
  projectedDailyAverage: number  // what we'll use to project remaining days

  // Seasonal
  seasonalFactor: number
  season: string
  festivePeriod: string | null   // name of ongoing festival, or null

  // Historical
  historicalDailyAverage: number // average L/day from past months
  currentDailyAverage: number    // L/day so far this month
  trend: 'increasing' | 'decreasing' | 'stable'
  trendMagnitude: number         // fractional change e.g. 0.12 = 12% up

  // Alerts
  alerts: PredictionAlert[]

  // Meta
  confidence: number             // 0–100
  dataQuality: 'high' | 'medium' | 'low'
  lastUpdated: string
}

export interface PredictionAlert {
  type: 'urgent' | 'warning' | 'info'
  message: string
  recommendation: string
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

/**
 * @param currentUsage     - Liters used so far this month
 * @param monthlyLimit     - Admin-set base monthly quota in liters
 * @param addonLiters      - Extra liters the user purchased/added (default 0)
 * @param historicalMonths - Past months: { '2025-03': 2840, '2025-02': 3100, ... }
 */
export function calculateUsagePrediction(
  currentUsage: number,
  monthlyLimit: number,
  addonLiters: number = 0,
  historicalMonths: Record<string, number> = {}
): UsagePrediction {
  // ── 0. Effective limit (NEVER let this be 0) ─────────────────────────────
  const effectiveLimit = Math.max(monthlyLimit + addonLiters, 1)

  // ── 1. Date context ───────────────────────────────────────────────────────
  const now = new Date()
  const monthIndex = now.getMonth()          // 0-indexed
  const daysElapsed = now.getDate()
  const daysInMonth = getDaysInMonth(now.getFullYear(), monthIndex)
  const daysRemaining = daysInMonth - daysElapsed

  // ── 2. Seasonal + festive ─────────────────────────────────────────────────
  const seasonalInfo = SEASONAL_FACTORS[monthIndex]
  const activeFestive = getActiveFestivePeriod(daysElapsed, monthIndex + 1)
  const festiveFactor = activeFestive ? activeFestive.factor : 1.0

  // ── 3. Historical analysis (normalized to L/day) ──────────────────────────
  const historical = analyzeHistoricalTrend(historicalMonths)

  // ── 4. Current month pace ─────────────────────────────────────────────────
  const currentDailyAverage = currentUsage / Math.max(daysElapsed, 1)

  // ── 5. Projected daily average (weighted blend: 60% current, 40% historical)
  //       If we have < 3 months history, lean more on current pace
  const historyWeight = Math.min(historical.monthCount * 0.1, 0.4) // max 40%
  const currentWeight = 1 - historyWeight

  let projectedDailyAverage: number
  if (historical.monthCount === 0) {
    // No history: use current pace adjusted for season
    projectedDailyAverage = currentDailyAverage * seasonalInfo.factor * festiveFactor
  } else {
    const blended =
      currentDailyAverage * currentWeight +
      historical.dailyAverage * historyWeight

    projectedDailyAverage = blended * seasonalInfo.factor * festiveFactor

    // Apply trend momentum (capped at ±15%)
    if (historical.trend === 'increasing') {
      projectedDailyAverage *= 1 + Math.min(historical.trendMagnitude, 0.15)
    } else if (historical.trend === 'decreasing') {
      projectedDailyAverage *= 1 + Math.max(historical.trendMagnitude, -0.15)
    }
  }

  // ── 6. Project end-of-month ───────────────────────────────────────────────
  const projectedAdditional = projectedDailyAverage * daysRemaining
  const projectedMonthlyUsage = Math.round(currentUsage + projectedAdditional)

  // ── 7. Pace ratio (current vs linear expected) ────────────────────────────
  const expectedByNow = (daysElapsed / daysInMonth) * effectiveLimit
  const paceRatio = currentUsage / Math.max(expectedByNow, 1)

  // ── 8. Risk (based on projection vs effective limit) ──────────────────────
  const rawRiskPercentage = (projectedMonthlyUsage / effectiveLimit) * 100
  const riskPercentage = Math.min(Math.round(rawRiskPercentage), 999) // cap display
  const riskLevel = getRiskLevel(rawRiskPercentage)

  // ── 9. Alerts ─────────────────────────────────────────────────────────────
  const alerts = buildAlerts({
    riskLevel,
    riskPercentage: rawRiskPercentage,
    paceRatio,
    trend: historical.trend,
    daysRemaining,
    activeFestive,
    currentDailyAverage,
    projectedDailyAverage,
    effectiveLimit,
    projectedMonthlyUsage,
  })

  // ── 10. Confidence ────────────────────────────────────────────────────────
  const confidence = calculateConfidence(
    historical.monthCount,
    daysElapsed,
    paceRatio,
    historical.variance
  )

  const dataQuality: UsagePrediction['dataQuality'] =
    historical.monthCount >= 4 ? 'high' : historical.monthCount >= 2 ? 'medium' : 'low'

  return {
    projectedMonthlyUsage,
    riskLevel,
    riskPercentage,

    currentUsage: Math.round(currentUsage),
    effectiveLimit,
    expectedByNow: Math.round(expectedByNow),
    paceRatio: Math.round(paceRatio * 100) / 100,
    daysElapsed,
    daysRemaining,
    projectedDailyAverage: Math.round(projectedDailyAverage),

    seasonalFactor: seasonalInfo.factor,
    season: seasonalInfo.season,
    festivePeriod: activeFestive?.name ?? null,

    historicalDailyAverage: Math.round(historical.dailyAverage),
    currentDailyAverage: Math.round(currentDailyAverage),
    trend: historical.trend,
    trendMagnitude: Math.round(historical.trendMagnitude * 100) / 100,

    alerts,
    confidence,
    dataQuality,
    lastUpdated: new Date().toISOString(),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

/**
 * Returns the active festive period for a given day, or null
 */
function getActiveFestivePeriod(dayOfMonth: number, month: number): FestivePeriod | null {
  return (
    FESTIVE_PERIODS.find(
      f => f.month === month && dayOfMonth >= f.startDay && dayOfMonth <= f.endDay
    ) ?? null
  )
}

/**
 * Analyze historical months — normalizes each month to L/day before comparing
 */
function analyzeHistoricalTrend(historicalMonths: Record<string, number>): {
  dailyAverage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trendMagnitude: number
  variance: number
  monthCount: number
} {
  const entries = Object.entries(historicalMonths)
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => a.localeCompare(b)) // chronological

  if (entries.length === 0) {
    return { dailyAverage: 0, trend: 'stable', trendMagnitude: 0, variance: 0, monthCount: 0 }
  }

  // Normalize each month to L/day using actual days in that month
  const dailyRates = entries.map(([key, total]) => {
    const [year, month] = key.split('-').map(Number)
    const days = getDaysInMonth(year, month - 1)
    return total / days
  })

  const dailyAverage = dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length

  // Trend: compare recent 3 vs previous 3 (normalized)
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  let trendMagnitude = 0

  if (dailyRates.length >= 4) {
    const half = Math.floor(dailyRates.length / 2)
    const recent = dailyRates.slice(-half)
    const previous = dailyRates.slice(-half * 2, -half)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length
    trendMagnitude = (recentAvg - prevAvg) / Math.max(prevAvg, 1)
    trend = trendMagnitude > 0.08 ? 'increasing' : trendMagnitude < -0.08 ? 'decreasing' : 'stable'
  }

  // Variance of daily rates
  const variance =
    dailyRates.reduce((sum, r) => sum + Math.pow(r - dailyAverage, 2), 0) / dailyRates.length

  return { dailyAverage, trend, trendMagnitude, variance, monthCount: entries.length }
}

function getRiskLevel(percentage: number): 'safe' | 'warning' | 'critical' {
  if (percentage >= 95) return 'critical'
  if (percentage >= 78) return 'warning'
  return 'safe'
}

function buildAlerts({
  riskLevel,
  riskPercentage,
  paceRatio,
  trend,
  daysRemaining,
  activeFestive,
  currentDailyAverage,
  projectedDailyAverage,
  effectiveLimit,
  projectedMonthlyUsage,
}: {
  riskLevel: 'safe' | 'warning' | 'critical'
  riskPercentage: number
  paceRatio: number
  trend: 'increasing' | 'decreasing' | 'stable'
  daysRemaining: number
  activeFestive: FestivePeriod | null
  currentDailyAverage: number
  projectedDailyAverage: number
  effectiveLimit: number
  projectedMonthlyUsage: number
}): PredictionAlert[] {
  const alerts: PredictionAlert[] = []

  // Primary risk alert
  if (riskLevel === 'critical') {
    const overBy = Math.round(projectedMonthlyUsage - effectiveLimit)
    alerts.push({
      type: 'urgent',
      message: `⚡ You're projected to exceed your limit by ${overBy}L`,
      recommendation: `Cut daily usage to ~${Math.round(
        (effectiveLimit - projectedMonthlyUsage + projectedDailyAverage * daysRemaining) /
          Math.max(daysRemaining, 1)
      )}L/day to stay within quota.`,
    })
  } else if (riskLevel === 'warning') {
    alerts.push({
      type: 'warning',
      message: `⚠️ Projected at ${Math.round(riskPercentage)}% of your quota`,
      recommendation: 'You\'re slightly over pace. Cutting back a little each day will keep you safe.',
    })
  } else {
    alerts.push({
      type: 'info',
      message: '✅ You\'re well within your monthly quota.',
      recommendation: 'Keep it up! You\'re on a great track.',
    })
  }

  // Pace alert (only if not already covered by critical)
  if (riskLevel !== 'critical' && paceRatio > 1.25) {
    alerts.push({
      type: 'warning',
      message: `📊 Pace is ${Math.round(paceRatio * 100)}% of expected for this point in month`,
      recommendation: 'You\'re using water faster than the monthly pace. Consider slowing down.',
    })
  }

  // Trend alert
  if (trend === 'increasing') {
    alerts.push({
      type: 'warning',
      message: '📈 Month-over-month usage is trending upward',
      recommendation: 'Your usage has been growing over recent months. Investigate what\'s changed.',
    })
  }

  // Festive alert
  if (activeFestive) {
    alerts.push({
      type: 'info',
      message: `🎉 ${activeFestive.name} period — usage typically runs ~${Math.round(
        (activeFestive.factor - 1) * 100
      )}% higher`,
      recommendation: 'Festive periods naturally use more water. This has been factored into your projection.',
    })
  }

  // End of month crunch
  if (daysRemaining <= 5 && riskLevel !== 'safe') {
    alerts.push({
      type: 'urgent',
      message: `⏰ Only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left — every litre counts`,
      recommendation: 'Prioritise essential usage only for the rest of the month.',
    })
  }

  return alerts
}

function calculateConfidence(
  monthCount: number,
  daysElapsed: number,
  paceRatio: number,
  variance: number
): number {
  let confidence = 40 // base

  // More history = more confident
  confidence += Math.min(monthCount * 8, 32)   // max +32 at 4+ months

  // More of the month elapsed = more confident
  confidence += Math.min((daysElapsed / 30) * 20, 20) // max +20

  // Penalise anomalous pace (very high or very low)
  const paceAnomaly = Math.abs(paceRatio - 1)
  if (paceAnomaly > 0.5) confidence -= 15
  else if (paceAnomaly > 0.25) confidence -= 7

  // Penalise high variance in history
  if (variance > 100) confidence -= 8
  else if (variance > 50) confidence -= 4

  return Math.max(10, Math.min(Math.round(confidence), 95))
}

// ─── Display Utilities ────────────────────────────────────────────────────────

export function getPredictionColor(riskLevel: 'safe' | 'warning' | 'critical'): string {
  return { safe: '#2E7D32', warning: '#E65100', critical: '#C62828' }[riskLevel]
}

export function getPredictionSummary(prediction: UsagePrediction): string {
  const { riskLevel, riskPercentage, projectedMonthlyUsage, effectiveLimit } = prediction
  if (riskLevel === 'critical') {
    return `⚡ Critical: Projected to use ${riskPercentage}% of quota (${projectedMonthlyUsage}L / ${effectiveLimit}L)`
  }
  if (riskLevel === 'warning') {
    return `⚠️ Warning: On track for ${riskPercentage}% quota usage`
  }
  return `✅ On track — projected ${riskPercentage}% of quota`
}
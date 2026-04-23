/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WATER AI SERVICE — powered by Google Gemini
 *
 * Provides:
 *   1. Auto-insight: one-shot natural language card on load
 *   2. Chat: multi-turn Q&A with full prediction context
 *   3. Suggested questions based on user's risk state
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import Config from 'react-native-config'
import { UsagePrediction } from './PredictionEngine'

// ─── Config ───────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-3-flash-preview'

function getApiKey(): string {
  // Use env key first, then your hardcoded fallback
  const key = Config.GEMINI_API_KEY || 'AIzaSyDZrC3INsXmJRQMcmG4d-5Knw4jqwkk5LM'

  if (!key || key === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('GEMINI_API_KEY is not set')
  }
  return key
}

function getEndpoint(): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${getApiKey()}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export interface AIInsight {
  headline: string       // e.g. "You're doing well this month"
  body: string           // 2–3 sentence explanation
  tip: string            // single actionable tip
  tone: 'positive' | 'cautionary' | 'urgent'
}

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(prediction: UsagePrediction): string {
  return `You are a friendly, concise water conservation advisor for an Indian household app.
You help users understand their monthly water usage and give practical advice.

The user's current water usage data is:
- Season: ${prediction.season}${prediction.festivePeriod ? ` (${prediction.festivePeriod} period)` : ''}
- Seasonal factor: ${prediction.seasonalFactor} (1.0 = normal, >1 = high season)
- Day ${prediction.daysElapsed} of month, ${prediction.daysRemaining} days remaining
- Used so far: ${prediction.currentUsage}L (expected by now: ${prediction.expectedByNow}L)
- Current daily average: ${prediction.currentDailyAverage}L/day
- Historical daily average: ${prediction.historicalDailyAverage}L/day
- Projected end-of-month total: ${prediction.projectedMonthlyUsage}L
- Monthly limit: ${prediction.effectiveLimit}L
- Projected quota usage: ${prediction.riskPercentage}%
- Risk level: ${prediction.riskLevel}
- Pace ratio: ${prediction.paceRatio} (1.0 = perfect pace, >1 = over pace)
- Usage trend: ${prediction.trend} (${prediction.trendMagnitude > 0 ? '+' : ''}${Math.round(prediction.trendMagnitude * 100)}% month-over-month)
- Prediction confidence: ${prediction.confidence}% (data quality: ${prediction.dataQuality})

Rules:
- Be warm and conversational, not robotic
- Keep responses SHORT — max 3–4 sentences for insights, max 5 sentences for chat answers
- Always ground your answer in the numbers above
- If asked something unrelated to water usage, politely redirect
- For Jaipur, India context: water is precious, summers are harsh, monsoon brings relief
- Never repeat the same advice twice in a conversation`
}

// ─── Gemini API Call ──────────────────────────────────────────────────────────

interface GeminiContent {
  role: 'user' | 'model'
  parts: { text: string }[]
}

async function callGemini(
  systemInstruction: string,
  contents: GeminiContent[]
): Promise<string> {
  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
      topP: 0.9,
    },
  }

  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[WaterAI] Gemini error:', response.status, errorText)
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()

  // Extract text from Gemini response
  const candidates = data?.candidates
  if (!candidates?.length) {
    throw new Error('No response from Gemini')
  }

  const parts = candidates[0]?.content?.parts
  if (!parts?.length) {
    throw new Error('Empty response from Gemini')
  }

  return parts.map((p: { text: string }) => p.text).join('')
}

// ─── 1. Auto-Insight (one-shot, called on card load) ─────────────────────────

/**
 * Generates a structured insight card from the current prediction.
 * Returns parsed JSON: { headline, body, tip, tone }
 */
export async function generateInsight(prediction: UsagePrediction): Promise<AIInsight> {
  const prompt = `Based on this user's water usage data, generate a brief insight card.
Respond ONLY with a valid JSON object — no markdown, no preamble, no code fences — in this exact shape:
{
  "headline": "short punchy headline (max 6 words)",
  "body": "2–3 sentence explanation of their situation using the actual numbers",
  "tip": "one specific, actionable tip for today",
  "tone": "positive" | "cautionary" | "urgent"
}

tone guide: use "positive" if riskLevel=safe, "cautionary" if warning, "urgent" if critical.`

  try {
    const text = await callGemini(
      buildSystemPrompt(prediction),
      [{ role: 'user', parts: [{ text: prompt }] }]
    )

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as AIInsight
  } catch (error) {
    console.warn('[WaterAI] Insight generation failed, using fallback:', error)
    // Fallback if Gemini didn't return clean JSON or API failed
    return buildFallbackInsight(prediction)
  }
}

/**
 * Generates a fallback insight without AI when the API is unavailable.
 */
function buildFallbackInsight(prediction: UsagePrediction): AIInsight {
  if (prediction.riskLevel === 'critical') {
    return {
      headline: 'Usage is running high',
      body: `You've used ${prediction.currentUsage}L so far this month — projected to hit ${prediction.projectedMonthlyUsage}L against a ${prediction.effectiveLimit}L limit. That's ${prediction.riskPercentage}% of your quota.`,
      tip: `Try to keep daily usage under ${Math.round((prediction.effectiveLimit - prediction.currentUsage) / Math.max(prediction.daysRemaining, 1))}L for the rest of the month.`,
      tone: 'urgent',
    }
  }

  if (prediction.riskLevel === 'warning') {
    return {
      headline: 'Keep an eye on usage',
      body: `At ${prediction.currentDailyAverage}L/day, you're on track to use ${prediction.riskPercentage}% of your monthly quota. With ${prediction.daysRemaining} days left, a small reduction can keep you safe.`,
      tip: 'Check for any dripping taps or running flushes — small leaks add up.',
      tone: 'cautionary',
    }
  }

  return {
    headline: 'Looking good this month',
    body: `You've used ${prediction.currentUsage}L so far — well within your ${prediction.effectiveLimit}L limit. Your pace ratio is ${prediction.paceRatio}x, which means you're under the expected usage for this point in the month.`,
    tip: 'Keep up the good work! Consistent habits make a big difference.',
    tone: 'positive',
  }
}

// ─── 2. Chat (multi-turn) ─────────────────────────────────────────────────────

/**
 * Send a user message and get a reply, maintaining conversation history.
 *
 * Usage:
 *   const history: ChatMessage[] = []
 *   const reply = await sendChatMessage(prediction, history, "Why is my usage so high?")
 *   history.push({ role: 'user', content: "Why is my usage so high?" })
 *   history.push({ role: 'model', content: reply })
 */
export async function sendChatMessage(
  prediction: UsagePrediction,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  // Convert chat history to Gemini format
  const contents: GeminiContent[] = [
    ...history.map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    })),
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ]

  try {
    return await callGemini(buildSystemPrompt(prediction), contents)
  } catch (error) {
    console.error('[WaterAI] Chat error:', error)
    throw error
  }
}

// ─── 3. Suggested Questions ───────────────────────────────────────────────────

/**
 * Returns context-aware suggested questions based on the prediction state.
 * Use these as quick-tap chips in your chat UI.
 */
export function getSuggestedQuestions(prediction: UsagePrediction): string[] {
  const questions: string[] = []

  if (prediction.riskLevel === 'critical') {
    questions.push('How can I reduce usage fast?')
    questions.push('What uses the most water at home?')
  } else if (prediction.riskLevel === 'warning') {
    questions.push('What should I cut back on?')
  } else {
    questions.push('How am I doing compared to last month?')
  }

  if (prediction.trend === 'increasing') {
    questions.push('Why is my usage going up?')
  }

  if (prediction.festivePeriod) {
    questions.push(`Does ${prediction.festivePeriod} affect my usage?`)
  }

  questions.push(`What's a good daily target for me?`)
  questions.push('How is my projection calculated?')

  return questions.slice(0, 4) // return max 4
}
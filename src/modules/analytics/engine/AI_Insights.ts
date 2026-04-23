/**
 * @deprecated — This file is superseded by Wateraiservice.ts
 * Kept for reference only. All AI functionality now uses Google Gemini
 * via the Wateraiservice module.
 */

// Re-export from the active service for backwards compatibility
export { generateInsight, sendChatMessage, getSuggestedQuestions } from './Wateraiservice'
export type { AIInsight, ChatMessage } from './Wateraiservice'
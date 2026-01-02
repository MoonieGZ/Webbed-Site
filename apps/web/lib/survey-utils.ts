import type { SurveyWithDetails, Question } from "@/types/pfq-survey"

/**
 * Generate a unique 8-character public ID for surveys
 */
export async function generateSurveyPublicId(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude ambiguous chars
  let publicId = ""
  for (let i = 0; i < 8; i++) {
    publicId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return publicId
}

/**
 * Count total questions across all groups in a survey
 */
export function countTotalQuestions(survey: SurveyWithDetails | null): number {
  if (!survey || !survey.groups) return 0
  return survey.groups.reduce(
    (count, group) => count + (group.questions?.length || 0),
    0,
  )
}

/**
 * Get all questions from a survey, flattened from groups
 */
export function getAllQuestions(survey: SurveyWithDetails | null): Question[] {
  if (!survey || !survey.groups) return []
  const allQuestions: Question[] = []
  for (const group of survey.groups) {
    if (group.questions) {
      allQuestions.push(...group.questions)
    }
  }
  return allQuestions
}

/**
 * Sort items by order_index
 */
export function sortByOrderIndex<T extends { order_index: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

/**
 * Format date for display
 */
export function formatSurveyDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleString()
}

/**
 * Check if a question has required data (e.g., choices for choice questions)
 */
export function questionHasRequiredData(question: Question): boolean {
  if (question.question_type === "choice") {
    return question.choices !== undefined && question.choices.length > 0
  }
  return true // Other question types don't require additional data
}

/**
 * Generate localStorage key for survey progress
 */
export function getSurveyProgressKey(publicId: string, apiKeyHash: string): string {
  return `survey-${publicId}-${apiKeyHash}`
}

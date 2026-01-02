/**
 * Constants for survey functionality
 */

// Question type limits
export const MAX_TEXT_LENGTH = 2000
export const MAX_CHOICES_PER_QUESTION = 10

// Question types
export const QUESTION_TYPES = [
  "range_5",
  "range_10",
  "likert",
  "text",
  "choice",
  "number",
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

// Likert scale options
export const LIKERT_OPTIONS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
] as const

// Cookie name for API key storage
export const PFQ_SURVEY_API_KEY_COOKIE = "pfq_survey_api_key"
export const API_KEY_COOKIE_EXPIRY_DAYS = 1

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

// PFQ URLs - defined as constants to prevent injection
export const PFQ_API_KEY_PAGE_URL = "https://pokefarm.com/farm#tab=5.7" as const
export const PFQ_BASE_URL = "https://pokefarm.com" as const

/**
 * Validates that a URL is from the PokéFarm domain
 * This prevents open redirect vulnerabilities
 */
export function validatePFQUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname === "pokefarm.com" ||
      urlObj.hostname === "www.pokefarm.com"
    )
  } catch {
    return false
  }
}

/**
 * Securely opens the PFQ API key page
 * Includes validation to prevent URL manipulation
 */
export function openPFQApiKeyPage(): void {
  const url = PFQ_API_KEY_PAGE_URL

  // Validate URL before opening
  if (!validatePFQUrl(url)) {
    console.error("Invalid PFQ URL detected - potential security issue")
    return
  }

  // Use window.open with security features
  window.open(url, "_blank", "noopener,noreferrer")
}

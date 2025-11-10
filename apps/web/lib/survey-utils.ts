import { queryOne } from "./db"
import { randomBytes } from "crypto"

/**
 * Generates a unique 8-character public ID for surveys
 * Retries if collision occurs
 */
export async function generateSurveyPublicId(): Promise<string> {
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Generate 4 random bytes (8 hex characters)
    const randomBytesBuffer = randomBytes(4)
    const publicId = randomBytesBuffer.toString("hex")

    // Check if it already exists
    const existing = await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )

    if (!existing) {
      return publicId
    }

    attempts++
  }

  throw new Error("Failed to generate unique public ID after multiple attempts")
}

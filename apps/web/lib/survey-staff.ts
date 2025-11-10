import { getUserBySession } from "./session"
import { queryOne } from "./db"
import { PFQApiService } from "@/services/pfq-api"

/**
 * Checks if a user is staff by validating their PFQ API key
 * and checking the isStaff property from the whoAmI response
 */
export async function isStaffUser(
  sessionToken: string | undefined,
): Promise<boolean> {
  if (!sessionToken) {
    return false
  }

  try {
    const user = await getUserBySession(sessionToken)
    if (!user) {
      return false
    }

    // Get user's PFQ API key
    const apiKeyRecord = (await queryOne(
      "SELECT api_key FROM pfq_apikeys WHERE user_id = ? LIMIT 1",
      [user.id],
    )) as { api_key: string } | null

    if (!apiKeyRecord) {
      return false
    }

    // Validate API key and check isStaff
    const validationResult = await PFQApiService.whoAmI(apiKeyRecord.api_key)

    if (!validationResult.success || !validationResult.data) {
      return false
    }

    return validationResult.data.isStaff === true
  } catch (error) {
    console.error("Error checking staff status:", error)
    return false
  }
}

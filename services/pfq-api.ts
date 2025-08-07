interface PFQUser {
  name: string
  displayname: string
  isStaff: boolean
  shortlink: string
  avatar: string
}

interface PFQApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export class PFQApiService {
  private static readonly BASE_URL = "https://api.pokefarm.com/v1"

  static async whoAmI(apiKey: string): Promise<PFQApiResponse<PFQUser>> {
    try {
      const response = await fetch(`${this.BASE_URL}/user/me`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        return {
          success: false,
          error:
            response.status === 401
              ? "Invalid API key"
              : "Failed to validate API key",
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error("PFQ API validation error:", error)
      return {
        success: false,
        error: "Network error occurred while validating API key",
      }
    }
  }

  static async getUserInfo(apiKey: string): Promise<PFQApiResponse<PFQUser>> {
    return this.whoAmI(apiKey)
  }
}

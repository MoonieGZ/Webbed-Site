import type {
  PFQApiResponse,
  PFQIV,
  PFQIVResponse,
  PFQMarketboardListing,
  PFQMarketboardSearch,
  PFQMarketboardSearchItem,
  PFQMarketboardSummary,
  PFQMarketboardTrend,
  PFQUser,
} from "@/types/pfq"

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

  static async getMarketboardTrends(
    apiKey: string,
    itemId: number,
    interval: number = 30,
  ): Promise<PFQApiResponse<PFQMarketboardTrend>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/marketboard/${itemId}/trends?interval=${interval}`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      )

      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error("PFQ API marketboard trends error:", error)
      return {
        success: false,
        error: "Network error occurred while fetching marketboard trends",
      }
    }
  }

  static async getMarketboardListings(
    apiKey: string,
    itemId: number,
    limit: number = 10,
  ): Promise<PFQApiResponse<PFQMarketboardListing>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/marketboard/${itemId}/listings?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      )

      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error("PFQ API marketboard listings error:", error)
      return {
        success: false,
        error: "Network error occurred while fetching marketboard listings",
      }
    }
  }

  static async getMarketboardItemSummary(
    apiKey: string,
    itemId: number,
  ): Promise<PFQApiResponse<PFQMarketboardSummary>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/marketboard/${itemId}/summary`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      )

      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error("PFQ API marketboard item summary error:", error)
      return {
        success: false,
        error: "Network error occurred while fetching marketboard item summary",
      }
    }
  }

  static async getMarketboardItemSearch(
    apiKey: string,
    itemName: string,
  ): Promise<PFQApiResponse<PFQMarketboardSearch>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/marketboard/search?query=${encodeURIComponent(itemName)}`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      )

      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error("PFQ API marketboard item search error:", error)
      return {
        success: false,
        error: "Network error occurred while fetching marketboard item search",
      }
    }
  }

  static async getMarketboardItemByItemId(
    apiKey: string,
    itemId: number,
  ): Promise<PFQApiResponse<PFQMarketboardSearchItem>> {
    if (itemId < 1) {
      return {
        success: false,
        error: "Invalid item id",
      }
    }
    try {
      const response = await fetch(
        `${this.BASE_URL}/marketboard/item/${itemId}`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      )

      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error("PFQ API marketboard item by item id error:", error)
      return {
        success: false,
        error:
          "Network error occurred while fetching marketboard item by item id",
      }
    }
  }

  static async getAllIVs(apiKey: string): Promise<PFQApiResponse<PFQIV[]>> {
    try {
      const allIVs: PFQIV[] = []
      let currentPage = 1
      let totalPages = 1

      do {
        const response = await fetch(
          `${this.BASE_URL}/pokemon/all-iv?page=${currentPage}&limit=500`,
          {
            method: "GET",
            headers: {
              "x-api-key": apiKey,
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok) {
          return {
            success: false,
            error: `Failed to fetch IVs on page ${currentPage}`,
          }
        }

        const data: PFQIVResponse = await response.json()
        allIVs.push(...data.ivs)
        totalPages = data.pagination.totalPages
        currentPage++
      } while (currentPage <= totalPages)

      return {
        success: true,
        data: allIVs,
      }
    } catch (error) {
      console.error("PFQ API get all IVs error:", error)
      return {
        success: false,
        error: "Network error occurred while fetching all IVs",
      }
    }
  }
}

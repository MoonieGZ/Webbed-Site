import { useState } from "react"
import { PFQApiService } from "@/services/pfq-api"

interface TestResult {
  functionName: string
  success: boolean
  data?: any
  error?: string
  loading: boolean
}

export function usePFQApiTesting(apiKey: string | null) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runAllTests = async () => {
    if (!apiKey) {
      setTestResults([
        {
          functionName: "All Tests",
          success: false,
          error: "No API key available",
          loading: false,
        },
      ])
      return
    }

    setIsRunning(true)
    const results: TestResult[] = []

    // Test whoAmI
    results.push({
      functionName: "whoAmI",
      success: false,
      loading: true,
    })
    setTestResults([...results])

    try {
      const whoAmIResult = await PFQApiService.whoAmI(apiKey)
      results[0] = {
        functionName: "whoAmI",
        success: whoAmIResult.success,
        data: whoAmIResult.data,
        error: whoAmIResult.error,
        loading: false,
      }
      setTestResults([...results])
    } catch (error) {
      results[0] = {
        functionName: "whoAmI",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }
      setTestResults([...results])
    }

    // Test getMarketboardTrends
    results.push({
      functionName: "getMarketboardTrends",
      success: false,
      loading: true,
    })
    setTestResults([...results])

    try {
      const trendsResult = await PFQApiService.getMarketboardTrends(apiKey, 244)
      results[1] = {
        functionName: "getMarketboardTrends",
        success: trendsResult.success,
        data: trendsResult.data,
        error: trendsResult.error,
        loading: false,
      }
      setTestResults([...results])
    } catch (error) {
      results[1] = {
        functionName: "getMarketboardTrends",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }
      setTestResults([...results])
    }

    // Test getMarketboardListings
    results.push({
      functionName: "getMarketboardListings",
      success: false,
      loading: true,
    })
    setTestResults([...results])

    try {
      const listingsResult = await PFQApiService.getMarketboardListings(
        apiKey,
        244,
      )
      results[2] = {
        functionName: "getMarketboardListings",
        success: listingsResult.success,
        data: listingsResult.data,
        error: listingsResult.error,
        loading: false,
      }
      setTestResults([...results])
    } catch (error) {
      results[2] = {
        functionName: "getMarketboardListings",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }
      setTestResults([...results])
    }

    // Test getMarketboardItemSummary
    results.push({
      functionName: "getMarketboardItemSummary",
      success: false,
      loading: true,
    })
    setTestResults([...results])

    try {
      const summaryResult = await PFQApiService.getMarketboardItemSummary(
        apiKey,
        244,
      )
      results[3] = {
        functionName: "getMarketboardItemSummary",
        success: summaryResult.success,
        data: summaryResult.data,
        error: summaryResult.error,
        loading: false,
      }
      setTestResults([...results])
    } catch (error) {
      results[3] = {
        functionName: "getMarketboardItemSummary",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }
      setTestResults([...results])
    }

    // Test getMarketboardItemSearch
    results.push({
      functionName: "getMarketboardItemSearch",
      success: false,
      loading: true,
    })
    setTestResults([...results])

    try {
      const searchResult = await PFQApiService.getMarketboardItemSearch(
        apiKey,
        "Jewel",
      )
      results[4] = {
        functionName: "getMarketboardItemSearch",
        success: searchResult.success,
        data: searchResult.data,
        error: searchResult.error,
        loading: false,
      }
      setTestResults([...results])
    } catch (error) {
      results[4] = {
        functionName: "getMarketboardItemSearch",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }
      setTestResults([...results])
    }

    setIsRunning(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return {
    testResults,
    isRunning,
    runAllTests,
    clearResults,
  }
}

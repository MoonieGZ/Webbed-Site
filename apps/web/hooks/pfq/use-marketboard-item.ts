"use client"

import { useEffect, useMemo, useState } from "react"
import { usePFQApiKey } from "@/hooks/pfq/use-pfq-api-key"
import { PFQApiService } from "@/services/pfq-api"
import type {
  PFQMarketboardListing,
  PFQMarketboardSummary,
  PFQMarketboardTrend,
  PFQMarketboardSearchItem,
} from "@/types/pfq"

export interface UseMarketboardItemResult {
  loading: boolean
  error: string | null
  trends: PFQMarketboardTrend
  listings: PFQMarketboardListing
  summary: PFQMarketboardSummary | null
  item: PFQMarketboardSearchItem | null
  refresh: () => void
  hasApiKey: boolean
}

export function useMarketboardItem(
  itemId: number,
  intervalDays: number = 90,
): UseMarketboardItemResult {
  const { apiKey } = usePFQApiKey()
  const [trends, setTrends] = useState<PFQMarketboardTrend>([])
  const [listings, setListings] = useState<PFQMarketboardListing>([])
  const [summary, setSummary] = useState<PFQMarketboardSummary | null>(null)
  const [item, setItem] = useState<PFQMarketboardSearchItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const refresh = () => setRefreshToken((n) => n + 1)

  useEffect(() => {
    if (!apiKey || !Number.isFinite(itemId)) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const [trendRes, listRes, summaryRes, itemRes] = await Promise.all([
          PFQApiService.getMarketboardTrends(apiKey, itemId, intervalDays),
          PFQApiService.getMarketboardListings(apiKey, itemId, 20),
          PFQApiService.getMarketboardItemSummary(apiKey, itemId),
          PFQApiService.getMarketboardItemByItemId(apiKey, itemId),
        ])

        if (cancelled) return

        if (trendRes.success && trendRes.data) setTrends(trendRes.data)
        else setError(trendRes.error || "Failed to load trends")

        if (listRes.success && listRes.data) setListings(listRes.data)
        else setError(listRes.error || "Failed to load listings")

        if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data)
        else setError(summaryRes.error || "Failed to load summary")

        if (itemRes.success && itemRes.data) setItem(itemRes.data)
        else setError(itemRes.error || "Failed to load item details")
      } catch {
        if (!cancelled) setError("Network error while loading item data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [apiKey, itemId, intervalDays, refreshToken])

  return {
    loading,
    error,
    trends,
    listings,
    summary,
    item,
    refresh,
    hasApiKey: Boolean(apiKey),
  }
}

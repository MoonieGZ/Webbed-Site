"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { PFQApiService } from "@/services/pfq-api"
import type { PFQMarketboardSearch } from "@/types/pfq"
import { usePFQApiKey } from "@/hooks/pfq/use-pfq-api-key"

export interface UseMarketboardSearchResult {
  query: string
  setQuery: (value: string) => void
  results: PFQMarketboardSearch
  loading: boolean
  error: string | null
  hasApiKey: boolean
}

export function useMarketboardSearch(
  delayMs: number = 400,
): UseMarketboardSearchResult {
  const { apiKey } = usePFQApiKey()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PFQMarketboardSearch>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const trimmedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    if (!apiKey) return

    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (trimmedQuery.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller
    const timeoutId = setTimeout(async () => {
      try {
        const res = await PFQApiService.getMarketboardItemSearch(
          apiKey,
          trimmedQuery,
        )
        if (controller.signal.aborted) return
        if (res.success && res.data) {
          setResults(res.data)
        } else {
          setError(res.error || "Search failed")
          setResults([])
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError("Network error during search")
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, delayMs)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [apiKey, trimmedQuery, delayMs])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasApiKey: Boolean(apiKey),
  }
}

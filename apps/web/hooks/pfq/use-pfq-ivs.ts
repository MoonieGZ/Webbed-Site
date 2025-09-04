"use client"

import { useEffect, useMemo, useState } from "react"
import { usePFQApiKey } from "@/hooks/pfq/use-pfq-api-key"
import { PFQApiService } from "@/services/pfq-api"
import type { PFQIV } from "@/types/pfq"

const NICKNAMES_KEY = "pfq_iv_nicknames"

type NicknameMap = Record<string, string>

export function usePFQIVs() {
  const { apiKey, loading: apiKeyLoading, error: apiKeyError } = usePFQApiKey()
  const [ivs, setIVs] = useState<PFQIV[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nicknames, setNicknames] = useState<NicknameMap>({})
  const [filterIVCount, setFilterIVCount] = useState<number | null>(null)
  const [page, setPage] = useState<number>(1)
  const perPage = 50

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NICKNAMES_KEY)
      if (raw) setNicknames(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    if (!apiKey || apiKeyLoading) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await PFQApiService.getAllIVs(apiKey)
        if (cancelled) return
        if (res.success && res.data) {
          setIVs(res.data)
        } else {
          setError(res.error || "Failed to load IVs")
        }
      } catch (e) {
        if (!cancelled) setError("Network error while loading IVs")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [apiKey, apiKeyLoading])

  const setNickname = (shortlink: string, name: string) => {
    setNicknames((prev) => {
      const next = { ...prev, [shortlink]: name }
      try {
        localStorage.setItem(NICKNAMES_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const filtered = useMemo(() => {
    if (filterIVCount == null) return ivs
    return ivs.filter((entry) => {
      const count31 = Array.isArray(entry.iv)
        ? entry.iv.reduce((acc, v) => acc + (v === 31 ? 1 : 0), 0)
        : 0
      return count31 === filterIVCount
    })
  }, [ivs, filterIVCount])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages])

  const start = (page - 1) * perPage
  const end = start + perPage
  const paged = filtered.slice(start, end)

  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1))
  const prevPage = () => setPage((p) => Math.max(1, p - 1))

  return {
    ivs: paged,
    loading: loading || apiKeyLoading,
    error: error || apiKeyError,
    nicknames,
    setNickname,
    filterIVCount,
    setFilterIVCount,
    page,
    setPage,
    nextPage,
    prevPage,
    totalPages,
    perPage,
    totalCount: filtered.length,
  }
}

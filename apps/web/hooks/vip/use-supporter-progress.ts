"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { DonationsResponse, SupporterProgressData } from "@/types"

export function useSupporterProgress() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalEuros, setTotalEuros] = useState(0)

  const fetchDonations = useCallback(async () => {
    setError(null)
    try {
      const r = await fetch("/api/vip/donations", { cache: "no-store" })
      if (!r.ok) throw new Error("Failed to load donations")
      const data = (await r.json()) as DonationsResponse
      setTotalEuros(Math.max(0, Number(data.totalEuros) || 0))
    } catch (e) {
      setError("Unable to load donations right now.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDonations()
  }, [fetchDonations])

  const computed: SupporterProgressData = useMemo(() => {
    const hostingGoalEuros = 20
    const eurosPerGiveaway = 20
    const afterHosting = Math.max(0, totalEuros - hostingGoalEuros)
    const giveawaysAchieved = Math.floor(afterHosting / eurosPerGiveaway)
    const nextGiveawayAt = hostingGoalEuros + (giveawaysAchieved + 1) * eurosPerGiveaway
    const progressToNextGiveawayPct = Math.min(100, Math.max(0, ((totalEuros - (nextGiveawayAt - eurosPerGiveaway)) / eurosPerGiveaway) * 100))

    return {
      totalEuros,
      hostingGoalEuros,
      eurosPerGiveaway,
      giveawaysAchieved,
      nextGiveawayAt,
      progressToNextGiveawayPct,
    }
  }, [totalEuros])

  return { loading, error, ...computed, refresh: fetchDonations }
}



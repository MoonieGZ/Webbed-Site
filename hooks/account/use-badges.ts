import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

export type FeaturedSlots = [number | null, number | null, number | null]

export interface Badge {
  id: number
  name: string
  description: string
  icon_url: string
  earned_at: string
}

interface BadgesResponse {
  ownedBadges: Badge[]
  featuredSlots: FeaturedSlots
}

export function useBadges() {
  const [ownedBadges, setOwnedBadges] = useState<Badge[]>([])
  const [featuredSlots, setFeaturedSlots] = useState<FeaturedSlots>([
    null,
    null,
    null,
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    void fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/account/badges")
      const data = (await response.json()) as BadgesResponse | { error: string }
      if (!response.ok) {
        throw new Error((data as any).error || "Failed to fetch badges")
      }
      const { ownedBadges, featuredSlots } = data as BadgesResponse
      setOwnedBadges(ownedBadges)
      setFeaturedSlots(featuredSlots)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Failed to load badges:", error)
      toast.error("Failed to load badges", toastStyles.error)
    } finally {
      setLoading(false)
    }
  }

  const assignBadgeToSlot = (badgeId: number, slotIndex: number) => {
    setFeaturedSlots((prev) => {
      const updated: FeaturedSlots = [...prev] as FeaturedSlots
      for (let i = 0; i < updated.length; i++) {
        if (updated[i] === badgeId) updated[i] = null
      }
      updated[slotIndex] = badgeId
      return updated
    })
    setHasUnsavedChanges(true)
  }

  const clearSlot = (slotIndex: number) => {
    setFeaturedSlots((prev) => {
      const updated: FeaturedSlots = [...prev] as FeaturedSlots
      updated[slotIndex] = null
      return updated
    })
    setHasUnsavedChanges(true)
  }

  const saveFeatured = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/account/badges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: featuredSlots }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update featured badges")
      }
      toast.success("Featured badges updated!", toastStyles.success)
      setHasUnsavedChanges(false)
      await fetchBadges()
    } catch (error) {
      console.error("Failed to save featured badges:", error)
      toast.error("Failed to update featured badges", toastStyles.error)
    } finally {
      setSaving(false)
    }
  }

  const featuredBadges = useMemo(() => {
    const byId = new Map(ownedBadges.map((b) => [b.id, b]))
    return featuredSlots.map((id) => (id == null ? null : byId.get(id) || null))
  }, [ownedBadges, featuredSlots])

  return {
    ownedBadges,
    featuredSlots,
    featuredBadges,
    loading,
    saving,
    hasUnsavedChanges,
    assignBadgeToSlot,
    clearSlot,
    saveFeatured,
    refresh: fetchBadges,
  }
}



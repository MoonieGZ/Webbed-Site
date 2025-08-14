"use client"

import { useEffect, useMemo, useState } from "react"
import type { GiBoss } from "@/types"
import { useGiData } from "./use-gi-data"
import type { GiBossProfile } from "@/types/gi/profile"

export function useGiSettingsBosses() {
  const { bosses, settings, setSettings, bossLocations } = useGiData()
  const [filter, setFilter] = useState("")
  const [profiles, setProfiles] = useState<GiBossProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null)

  const items: GiBoss[] = bosses ?? []
  const enabledMap = settings.bosses.enabled

  const grouped = useMemo(() => {
    const map = new Map<string, GiBoss[]>()
    items.forEach((item) => {
      const key = item.location
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    })
    return map
  }, [items])

  const groupKeys = useMemo(() => {
    return bossLocations.filter((l) => grouped.has(l))
  }, [grouped, bossLocations])

  const filteredGroups = useMemo(() => {
    if (!filter) return grouped
    const map = new Map<string, GiBoss[]>()
    groupKeys.forEach((k) => {
      const arr = (grouped.get(k) ?? []).filter((i) =>
        i.name.toLowerCase().includes(filter.toLowerCase()),
      )
      if (arr.length > 0) map.set(k, arr)
    })
    return map
  }, [filter, grouped, groupKeys])

  const setEnabled = (name: string, val: boolean) => {
    setSettings((prev) => ({
      ...prev,
      bosses: {
        ...prev.bosses,
        enabled: { ...prev.bosses.enabled, [name]: val },
      },
    }))
  }

  const toggleGroup = (group: string, val: boolean) => {
    const arr = filteredGroups.get(group) ?? []
    setSettings((prev) => {
      const updated = { ...prev.bosses.enabled }
      arr.forEach((i) => (updated[i.name] = val))
      return { ...prev, bosses: { ...prev.bosses, enabled: updated } }
    })
  }

  const toggleLegendBosses = (value: boolean) => {
    setSettings((prev) => {
      const updated = { ...prev.bosses.enabled }
      items.forEach((b) => {
        if (b.legendary) updated[b.name] = value
      })
      return { ...prev, bosses: { ...prev.bosses, enabled: updated } }
    })
  }

  const toggleAll = (value: boolean) => {
    setSettings((prev) => {
      const updated: Record<string, boolean> = { ...prev.bosses.enabled }
      items.forEach((b) => {
        updated[b.name] = value
      })
      return { ...prev, bosses: { ...prev.bosses, enabled: updated } }
    })
  }

  const isGroupAllEnabled = (group: string) => {
    const arr = filteredGroups.get(group) ?? []
    return arr.length > 0 && arr.every((i) => enabledMap[i.name])
  }

  // Profiles: load
  useEffect(() => {
    fetch("/api/minigames/gi/boss-profiles")
      .then((r) => r.json())
      .then((p: GiBossProfile[]) => setProfiles(Array.isArray(p) ? p : []))
      .catch(() => {})
  }, [])

  const buildFullEnabledMap = (): Record<string, boolean> => {
    const full: Record<string, boolean> = {}
    items.forEach((c) => {
      full[c.name] = enabledMap[c.name] ?? true
    })
    return full
  }

  const saveProfile = async (profileIndex: number, name?: string) => {
    const fullMap = buildFullEnabledMap()
    await fetch("/api/minigames/gi/boss-profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileIndex,
        name: name ?? null,
        enabledMap: fullMap,
      }),
    }).catch(() => {})
    const updated = await fetch("/api/minigames/gi/boss-profiles").then((r) =>
      r.json(),
    )
    setProfiles(Array.isArray(updated) ? updated : [])
    setSelectedProfile(profileIndex)
  }

  const normalizeEnabledMapForBosses = (map: Record<string, boolean>) => {
    const merged: Record<string, boolean> = {}
    items.forEach((c) => {
      merged[c.name] = map[c.name] ?? true
    })
    return merged
  }
  const loadProfile = (profileIndex: number) => {
    const prof = profiles.find((p) => p.profileIndex === profileIndex)
    if (prof) {
      const normalized = normalizeEnabledMapForBosses(prof.enabledMap)
      setSettings((prev) => ({
        ...prev,
        bosses: { ...prev.bosses, enabled: normalized },
      }))
    }
    setSelectedProfile(profileIndex)
  }

  const usedProfileIndices = useMemo(
    () => new Set(profiles.map((p) => p.profileIndex)),
    [profiles],
  )

  const nextAvailableProfileIndex = useMemo(() => {
    for (let i = 1; i <= 10; i += 1) {
      if (!usedProfileIndices.has(i)) return i
    }
    return null
  }, [usedProfileIndices])

  return {
    settings,
    filter,
    setFilter,
    enabledMap,
    groupKeys,
    filteredGroups,
    setEnabled,
    toggleGroup,
    toggleLegendBosses,
    toggleAll,
    isGroupAllEnabled,
    profiles,
    selectedProfile,
    saveProfile,
    loadProfile,
    usedProfileIndices,
    nextAvailableProfileIndex,
  }
}

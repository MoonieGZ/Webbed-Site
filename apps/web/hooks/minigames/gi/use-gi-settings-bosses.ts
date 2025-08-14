"use client"

import { useMemo, useState } from "react"
import type { GiBoss } from "@/types"
import { useGiData } from "./use-gi-data"

export function useGiSettingsBosses() {
  const { bosses, settings, setSettings, bossLocations } = useGiData()
  const [filter, setFilter] = useState("")

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
  }
}

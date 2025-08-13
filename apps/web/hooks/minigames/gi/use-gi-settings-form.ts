"use client"

import { useMemo, useState } from "react"
import type { GiBoss, GiCharacter } from "@/types"
import { useGiData } from "./use-gi-data"

export function useGiSettingsForm(type: "characters" | "bosses") {
  const { characters, bosses, settings, setSettings, bossLocations } =
    useGiData()
  const [filter, setFilter] = useState("")

  const items = (type === "characters" ? characters : bosses) ?? []

  const enabledMap =
    type === "characters"
      ? settings.characters.enabled
      : settings.bosses.enabled

  const grouped = useMemo(() => {
    const map = new Map<string, Array<GiCharacter | GiBoss>>()
    items.forEach((item) => {
      const key =
        type === "characters"
          ? (item as GiCharacter).element
          : (item as GiBoss).location
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    })
    return map
  }, [items, type])

  const groupKeys = useMemo(() => {
    if (type === "characters") {
      return Array.from(grouped.keys()).sort()
    }
    return bossLocations.filter((l) => grouped.has(l))
  }, [grouped, bossLocations, type])

  const filteredGroups = useMemo(() => {
    if (!filter) return grouped
    const map = new Map<string, Array<GiCharacter | GiBoss>>()
    groupKeys.forEach((k) => {
      const arr = (grouped.get(k) ?? []).filter((i) =>
        i.name.toLowerCase().includes(filter.toLowerCase()),
      )
      if (arr.length > 0) map.set(k, arr)
    })
    return map
  }, [filter, grouped, groupKeys])

  const setEnabled = (name: string, val: boolean) => {
    setSettings((prev) =>
      type === "characters"
        ? {
            ...prev,
            characters: {
              ...prev.characters,
              enabled: { ...prev.characters.enabled, [name]: val },
            },
          }
        : {
            ...prev,
            bosses: {
              ...prev.bosses,
              enabled: { ...prev.bosses.enabled, [name]: val },
            },
          },
    )
  }

  const toggleGroup = (group: string, val: boolean) => {
    const arr = filteredGroups.get(group) ?? []
    setSettings((prev) => {
      if (type === "characters") {
        const updated = { ...prev.characters.enabled }
        arr.forEach((i) => (updated[i.name] = val))
        return { ...prev, characters: { ...prev.characters, enabled: updated } }
      } else {
        const updated = { ...prev.bosses.enabled }
        arr.forEach((i) => (updated[i.name] = val))
        return { ...prev, bosses: { ...prev.bosses, enabled: updated } }
      }
    })
  }

  const disableLegendBosses = () => {
    if (type !== "bosses") return
    setSettings((prev) => {
      const updated = { ...prev.bosses.enabled }
      ;(items as GiBoss[]).forEach((b) => {
        if (b.name.startsWith("⭐ - ")) updated[b.name] = false
      })
      return { ...prev, bosses: { ...prev.bosses, enabled: updated } }
    })
  }

  const isGroupAllEnabled = (group: string) => {
    const arr = filteredGroups.get(group) ?? []
    return arr.length > 0 && arr.every((i) => enabledMap[i.name])
  }

  return {
    items,
    settings,
    filter,
    setFilter,
    enabledMap,
    groupKeys,
    filteredGroups,
    setEnabled,
    toggleGroup,
    disableLegendBosses,
    isGroupAllEnabled,
  }
}

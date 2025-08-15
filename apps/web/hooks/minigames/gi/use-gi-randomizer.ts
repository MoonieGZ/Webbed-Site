"use client"

import { useMemo, useState } from "react"
import type { GiBoss, GiCharacter } from "@/types"
import { useGiDataContext } from "@/hooks/minigames/gi/gi-data-provider"

export type RandomizeType = "characters" | "bosses" | "combined"

export type RandomResultItem<T> = T & { visible?: boolean }

export interface RandomResult {
  characters: Array<RandomResultItem<GiCharacter & { selected?: boolean }>>
  bosses: Array<RandomResultItem<GiBoss>>
}

export function useGiRandomizer() {
  const { characters, bosses, settings, setSettings, loading } =
    useGiDataContext()
  const [result, setResult] = useState<RandomResult | null>(null)

  const availableCharacters = useMemo(() => {
    if (!characters) return 0
    return characters.filter((c) => {
      const enabled = settings.characters.enabled[c.name] ?? true
      const excluded =
        settings.enableExclusion &&
        settings.characters.excluded.includes(c.name)
      return enabled && !excluded
    }).length
  }, [characters, settings])

  const availableBosses = useMemo(() => {
    if (!bosses) return 0
    const enabledMap = settings.bosses.enabled
    const list = bosses.filter((b) => enabledMap[b.name] ?? true)
    if (settings.rules.coopMode)
      return list.filter((b) => Boolean(b.coop)).length
    return list.length
  }, [bosses, settings.rules.coopMode, JSON.stringify(settings.bosses.enabled)])

  const updateCharacterCount = (count: number) =>
    setSettings((prev) => ({
      ...prev,
      characters: { ...prev.characters, count },
    }))

  const updateBossCount = (count: number) =>
    setSettings((prev) => ({
      ...prev,
      bosses: { ...prev.bosses, count },
    }))

  const toggleExclusion = (enabled: boolean) =>
    setSettings((prev) => ({ ...prev, enableExclusion: enabled }))

  const includeCharacter = (name: string) =>
    setSettings((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        excluded: prev.characters.excluded.filter((n) => n !== name),
      },
    }))

  const excludeCharacter = (names: string[]) =>
    setSettings((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        excluded: [...prev.characters.excluded, ...names],
      },
    }))

  return {
    loading,
    settings,
    setSettings,
    availableCharacters,
    availableBosses,
    updateCharacterCount,
    updateBossCount,
    toggleExclusion,
    includeCharacter,
    excludeCharacter,
    result,
    setResult,
  }
}

"use client"

import { useMemo, useState } from "react"
import type { GiBoss, GiCharacter, GiRandomizerSettings } from "@/types"
import { useGiData } from "./use-gi-data"

export type RandomizeType = "characters" | "bosses" | "combined"

export type RandomResultItem<T> = T & { visible?: boolean }

export interface RandomResult {
  characters: Array<RandomResultItem<GiCharacter & { selected?: boolean }>>
  bosses: Array<RandomResultItem<GiBoss>>
}

// Client-side rolling has been removed. Randomization is handled server-side.

export function useGiRandomizer() {
  const { characters, bosses, settings, setSettings, loading } = useGiData()
  const [result, setResult] = useState<RandomResult | null>(null)
  // Keep local result state to display server-provided results (mapped by name)

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
    return bosses.filter((b) => settings.bosses.enabled[b.name] ?? true).length
  }, [bosses, settings])

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

  // Client-side randomization handlers removed. Server is the source of truth.

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

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

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useGiRandomizer() {
  const { characters, bosses, settings, setSettings, loading } = useGiData()
  const [result, setResult] = useState<RandomResult | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

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

  function getRandomizedCharacters(): Array<
    RandomResultItem<GiCharacter & { selected?: boolean }>
  > | null {
    if (!characters) return null
    const enabled = characters.filter(
      (c) => settings.characters.enabled[c.name] ?? true,
    )
    const filtered = settings.enableExclusion
      ? enabled.filter((c) => !settings.characters.excluded.includes(c.name))
      : enabled

    if (filtered.length < settings.characters.count) return null

    const travelers = filtered.filter((c) => c.name.startsWith("Traveler ("))
    const nonTravelers = filtered.filter(
      (c) => !c.name.startsWith("Traveler ("),
    )
    const pool = [...nonTravelers]
    if (!settings.rules.coopMode && travelers.length > 0) {
      pool.push(travelers[Math.floor(Math.random() * travelers.length)])
    }

    let selected: GiCharacter[] = []
    if (settings.rules.limitFiveStars) {
      const max5 = settings.rules.maxFiveStars
      const fiveStars = pool.filter((c) => c.fiveStar)
      const fourStars = pool.filter((c) => !c.fiveStar)
      if (fiveStars.length < Math.min(max5, settings.characters.count))
        return null
      if (
        fourStars.length <
        settings.characters.count - Math.min(max5, settings.characters.count)
      )
        return null
      const pick5 = fisherYatesShuffle(fiveStars).slice(
        0,
        Math.min(max5, settings.characters.count),
      )
      const pick4 = fisherYatesShuffle(fourStars).slice(
        0,
        settings.characters.count - pick5.length,
      )
      selected = fisherYatesShuffle([...pick5, ...pick4])
    } else {
      selected = fisherYatesShuffle(pool).slice(0, settings.characters.count)
    }

    return selected.map((c) => ({ ...c, selected: false, visible: false }))
  }

  function getRandomizedBosses(): Array<RandomResultItem<GiBoss>> | null {
    if (!bosses) return null
    const enabled = bosses.filter(
      (b) => settings.bosses.enabled[b.name] ?? true,
    )
    const filtered = settings.rules.coopMode
      ? enabled.filter((b) => b.coop)
      : enabled
    if (filtered.length < settings.bosses.count) return null
    return fisherYatesShuffle(filtered)
      .slice(0, settings.bosses.count)
      .map((b) => ({ ...b, visible: false }))
  }

  function handleRandomize(type: RandomizeType) {
    let chars: RandomResult["characters"] = []
    let b: RandomResult["bosses"] = []
    if (type === "characters" || type === "combined") {
      const c = getRandomizedCharacters()
      if (!c) return
      chars = c
    }
    if (type === "bosses" || type === "combined") {
      const bb = getRandomizedBosses()
      if (!bb) return
      b = bb
    }
    setResult({ characters: chars, bosses: b })
  }

  function acceptSelected() {
    if (!result) return
    const names = result.characters.filter((c) => c.selected).map((c) => c.name)
    if (names.length === 0) return
    excludeCharacter(names)
  }

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
    isAnimating,
    setIsAnimating,
    handleRandomize,
    acceptSelected,
  }
}

"use client"

import { useMemo } from "react"
import { useGiLobbyContext } from "@/hooks/minigames/gi/lobby-provider"
import { useGiDataContext } from "@/hooks/minigames/gi/gi-data-provider"
import type { GiBoss, GiCharacter } from "@/types"

export function useGiRollResult() {
  const { lobby } = useGiLobbyContext()
  const { characters, bosses } = useGiDataContext()

  const rolledCharacterNames = (lobby?.currentRoll?.characters ||
    []) as string[]
  const rolledBossName = (lobby?.currentRoll as any)?.boss as string | null
  const rolledBossNames = (lobby?.currentRoll as any)?.bosses as
    | string[]
    | undefined

  const rolledCharacters = useMemo(() => {
    if (!Array.isArray(characters)) return [] as GiCharacter[]
    if (!Array.isArray(rolledCharacterNames)) return [] as GiCharacter[]
    const set = new Set(rolledCharacterNames)
    return characters.filter((c) => set.has(c.name))
  }, [characters, JSON.stringify(rolledCharacterNames || [])])

  const rolledBosses = useMemo(() => {
    const names: string[] = Array.isArray(rolledBossNames)
      ? rolledBossNames
      : rolledBossName
        ? [rolledBossName]
        : []
    if (!Array.isArray(bosses) || names.length === 0) return [] as GiBoss[]
    const byName: Record<string, GiBoss> = {}
    for (const b of bosses) byName[b.name] = b
    return names.map((n) => byName[n]).filter(Boolean) as GiBoss[]
  }, [bosses, JSON.stringify(rolledBossNames || rolledBossName || [])])

  const hasResult = rolledCharacters.length > 0 || rolledBosses.length > 0

  return { hasResult, rolledCharacters, rolledBosses }
}

"use client"

import { useEffect, useMemo, useState } from "react"
import type { GiCharacter } from "@/types"

type SortKey = "name" | "rarity" | "element" | "origin" | "weapon"

export function useGiSettingsCharacters() {
  const [characters, setCharacters] = useState<GiCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("element")
  const [ascending, setAscending] = useState(true)
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({})
  const [profiles, setProfiles] = useState<
    Array<{
      profileIndex: number
      name: string | null
      enabledMap: Record<string, boolean>
    }>
  >([])
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null)

  useEffect(() => {
    const cached = localStorage.getItem("gi_characters_v1")
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed?.data && Array.isArray(parsed.data)) {
          setCharacters(parsed.data as GiCharacter[])
        }
      } catch {}
    }
    fetch("/api/minigames/gi/characters")
      .then((r) => r.json())
      .then((list: GiCharacter[]) => setCharacters(list))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/minigames/gi/profiles")
      .then((r) => r.json())
      .then((p) => setProfiles(p))
      .catch(() => {})
  }, [])

  const grouped = useMemo(() => {
    const temp: Record<string, GiCharacter[]> = {}
    characters.forEach((c) => {
      if (!temp[c.element]) temp[c.element] = []
      temp[c.element].push(c)
    })
    const map = new Map<string, GiCharacter[]>()
    Object.keys(temp)
      .sort((a, b) => a.localeCompare(b))
      .forEach((el) => {
        map.set(
          el,
          temp[el].slice().sort((a, b) => a.name.localeCompare(b.name)),
        )
      })
    return map
  }, [characters])

  const toggleEnabled = (name: string, value: boolean) => {
    setEnabledMap((prev) => ({ ...prev, [name]: value }))
  }

  const saveProfile = async (profileIndex: number, name?: string) => {
    await fetch("/api/minigames/gi/profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileIndex, name: name ?? null, enabledMap }),
    })
    const updated = await fetch("/api/minigames/gi/profiles").then((r) =>
      r.json(),
    )
    setProfiles(updated)
    setSelectedProfile(profileIndex)
  }

  const loadProfile = (profileIndex: number) => {
    const prof = profiles.find((p) => p.profileIndex === profileIndex)
    if (prof) setEnabledMap(prof.enabledMap)
    setSelectedProfile(profileIndex)
  }

  return {
    loading,
    characters,
    grouped,
    enabledMap,
    toggleEnabled,
    profiles,
    selectedProfile,
    loadProfile,
    saveProfile,
  }
}

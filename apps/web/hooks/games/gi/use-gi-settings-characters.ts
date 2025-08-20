"use client"

import { useEffect, useMemo, useState } from "react"
import type { GiCharacter } from "@/types"
import type { GiCharacterProfile } from "@/types/gi/profile"

export function useGiSettingsCharacters() {
  const [characters, setCharacters] = useState<GiCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({})
  const [profiles, setProfiles] = useState<GiCharacterProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null)
  const [filter, setFilter] = useState("")

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
    fetch("/api/games/gi/characters")
      .then((r) => r.json())
      .then((list: GiCharacter[]) => setCharacters(list))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (characters.length === 0) return
    try {
      const cache = localStorage.getItem("gi_enabled_map_v1")
      if (cache) {
        const parsed = JSON.parse(cache) as Record<string, boolean>
        const merged: Record<string, boolean> = {}
        characters.forEach((c) => {
          merged[c.name] = parsed[c.name] ?? true
        })
        setEnabledMap(merged)
        return
      }
    } catch {}
    const allTrue: Record<string, boolean> = {}
    characters.forEach((c) => {
      allTrue[c.name] = true
    })
    setEnabledMap(allTrue)
  }, [characters])

  useEffect(() => {
    fetch("/api/games/gi/profiles")
      .then((r) => r.json())
      .then((p: GiCharacterProfile[]) => setProfiles(Array.isArray(p) ? p : []))
      .catch(() => {})
  }, [])

  const refreshRemoteProfiles = async () => {
    try {
      const res = await fetch("/api/games/gi/profiles")
      const p = await res.json()
      setProfiles(Array.isArray(p) ? p : [])
    } catch {}
  }

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

  const filteredGroups = useMemo(() => {
    if (!filter) return grouped
    const map = new Map<string, GiCharacter[]>()
    Array.from(grouped.keys()).forEach((k) => {
      const arr = (grouped.get(k) ?? []).filter((i) =>
        i.name.toLowerCase().includes(filter.toLowerCase()),
      )
      if (arr.length > 0) map.set(k, arr)
    })
    return map
  }, [filter, grouped])

  const persistEnabledMap = (map: Record<string, boolean>) => {
    try {
      localStorage.setItem("gi_enabled_map_v1", JSON.stringify(map))
    } catch {}
  }

  const toggleEnabled = (name: string, value: boolean) => {
    setEnabledMap((prev) => {
      const next = { ...prev, [name]: value }
      persistEnabledMap(next)
      return next
    })
  }

  const buildFullEnabledMap = (): Record<string, boolean> => {
    const full: Record<string, boolean> = {}
    characters.forEach((c) => {
      full[c.name] = enabledMap[c.name] ?? true
    })
    return full
  }
  const saveProfile = async (profileIndex: number, name?: string) => {
    const fullMap = buildFullEnabledMap()
    await fetch("/api/games/gi/profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileIndex,
        name: name ?? null,
        enabledMap: fullMap,
      }),
    }).catch(() => {})
    const updated = await fetch("/api/games/gi/profiles").then((r) =>
      r.json(),
    )
    setProfiles(Array.isArray(updated) ? updated : [])
    setSelectedProfile(profileIndex)
  }

  const normalizeEnabledMapForCharacters = (map: Record<string, boolean>) => {
    const merged: Record<string, boolean> = {}
    characters.forEach((c) => {
      merged[c.name] = map[c.name] ?? true
    })
    return merged
  }
  const loadProfile = (profileIndex: number) => {
    const prof = profiles.find((p) => p.profileIndex === profileIndex)
    if (prof) {
      const normalized = normalizeEnabledMapForCharacters(prof.enabledMap)
      setEnabledMap(normalized)
      persistEnabledMap(normalized)
    }
    setSelectedProfile(profileIndex)
  }

  const toggleAll = (value: boolean) => {
    const next: Record<string, boolean> = {}
    characters.forEach((c) => {
      next[c.name] = value
    })
    persistEnabledMap(next)
    setEnabledMap(next)
  }

  const toggleByRarity = (fiveStar: boolean, value: boolean) => {
    const next: Record<string, boolean> = { ...enabledMap }
    characters.forEach((c) => {
      if (c.fiveStar === fiveStar) next[c.name] = value
    })
    persistEnabledMap(next)
    setEnabledMap(next)
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
    loading,
    characters,
    grouped,
    filteredGroups,
    enabledMap,
    toggleEnabled,
    profiles,
    selectedProfile,
    loadProfile,
    saveProfile,
    toggleAll,
    toggleByRarity,
    usedProfileIndices,
    nextAvailableProfileIndex,
    refreshRemoteProfiles,
    filter,
    setFilter,
  }
}

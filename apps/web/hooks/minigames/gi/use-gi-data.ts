"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { GiBoss, GiCharacter, GiRandomizerSettings } from "@/types"
import { DEFAULT_GI_SETTINGS } from "@/types"

const CHARACTERS_KEY = "gi_characters_v1"
const BOSSES_KEY = "gi_bosses_v1"
const SETTINGS_KEY = "gi_settings_v1"
const ONE_HOUR_MS = 60 * 60 * 1000

type Cached<T> = { data: T; ts: number }

function readCache<T>(key: string, maxAgeMs?: number): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Cached<T>
    if (maxAgeMs && Date.now() - parsed.ts > maxAgeMs) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export function useGiData() {
  const [characters, setCharacters] = useState<GiCharacter[] | null>(null)
  const [bosses, setBosses] = useState<GiBoss[] | null>(null)
  const [settings, setSettings] =
    useState<GiRandomizerSettings>(DEFAULT_GI_SETTINGS)
  const [loading, setLoading] = useState(true)
  const settingsDirty = useRef(false)

  useEffect(() => {
    const c = readCache<GiCharacter[]>(CHARACTERS_KEY, ONE_HOUR_MS)
    const b = readCache<GiBoss[]>(BOSSES_KEY, ONE_HOUR_MS)
    const s = readCache<GiRandomizerSettings>(SETTINGS_KEY)
    if (Array.isArray(c)) setCharacters(c)
    if (Array.isArray(b)) setBosses(b)
    if (s) setSettings(s)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [cRes, bRes, sRes] = await Promise.all([
          fetch("/api/minigames/gi/characters").then((r) => r.json()),
          fetch("/api/minigames/gi/bosses").then((r) => r.json()),
          fetch("/api/minigames/gi/settings").then((r) => r.json()),
        ])
        if (cancelled) return
        setCharacters(Array.isArray(cRes) ? cRes : [])
        setBosses(Array.isArray(bRes) ? bRes : [])
        setSettings((prev) => ({ ...prev, ...sRes }))
        if (Array.isArray(cRes)) writeCache(CHARACTERS_KEY, cRes)
        if (Array.isArray(bRes)) writeCache(BOSSES_KEY, bRes)
        writeCache(SETTINGS_KEY, sRes)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!settingsDirty.current) return
    settingsDirty.current = false
    const toSave = settings
    writeCache(SETTINGS_KEY, toSave)
    
    fetch("/api/minigames/gi/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    }).catch(() => {})
  }, [settings])

  const updateSettings = (
    updater: (prev: GiRandomizerSettings) => GiRandomizerSettings,
  ) => {
    setSettings((prev) => {
      settingsDirty.current = true
      return updater(prev)
    })
  }

  const elementOrder = useMemo(
    () => ["Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo"],
    [],
  )

  const bossLocations = useMemo(() => {
    const set = new Set<string>()
    const list = Array.isArray(bosses) ? bosses : []
    list.forEach((b) => set.add(b.location))
    return Array.from(set)
  }, [bosses])

  return {
    characters,
    bosses,
    settings,
    setSettings: updateSettings,
    loading,
    bossLocations,
  }
}

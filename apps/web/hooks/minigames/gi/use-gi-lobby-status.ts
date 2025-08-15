"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useGiLobbyContext } from "@/hooks/minigames/gi/lobby-provider"
import { useUsersByIds } from "@/hooks/api/use-users-by-ids"
import type { GiLobbyPrivacy } from "@/types"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useGiMultiplayerProfileGate } from "@/hooks/minigames/gi/use-gi-multiplayer-profile-gate"
import { useGiDataContext } from "@/hooks/minigames/gi/gi-data-provider"
import type { GiBossProfile, GiCharacterProfile } from "@/types/gi/profile"

export function useGiLobbyStatus() {
  const { lobby, isHost, hostUserId, memberUserIds, setLobbyPrivacy } =
    useGiLobbyContext()
  const { list: members, loading } = useUsersByIds(memberUserIds)
  const { ensureHasMultiplayerProfile } = useGiMultiplayerProfileGate()
  const { characters, bosses, settings, setSettings } = useGiDataContext()

  const [profiles, setProfiles] = useState<GiCharacterProfile[]>([])
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<
    number | null
  >(null)
  const [combineMode, setCombineMode] = useState<boolean>(false)
  const [bossProfiles, setBossProfiles] = useState<GiBossProfile[]>([])
  const [selectedBossProfileIndex, setSelectedBossProfileIndex] = useState<
    number | null
  >(null)

  const privacy = (lobby?.privacy as GiLobbyPrivacy) || "closed"
  const hasOthers = (lobby?.members?.length || 0) > 1

  const handleSetPrivacy = useCallback(
    async (next: GiLobbyPrivacy) => {
      if (next === "invite-only") {
        const ok = await ensureHasMultiplayerProfile()
        if (!ok) return
        if (bossProfiles.length === 0) {
          toast.error("Boss profile required.", {
            ...toastStyles.error,
            description:
              "Go to Settings > Bosses, then Profiles > Save to create a boss profile.",
            duration: 10000,
          } as any)
          return
        }
      }
      await setLobbyPrivacy(next)
      toast.success("Lobby privacy updated!", toastStyles.success)
    },
    [setLobbyPrivacy, ensureHasMultiplayerProfile, bossProfiles.length],
  )

  const sortedMembers = useMemo(() => {
    if (!Array.isArray(members)) return []
    return [...members].sort((a, b) => {
      const ah = String(a.id) === String(hostUserId) ? -1 : 1
      const bh = String(b.id) === String(hostUserId) ? -1 : 1
      return ah - bh
    })
  }, [members, hostUserId])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/minigames/gi/profiles", {
          cache: "no-store",
        })
        const p = (await r.json()) as GiCharacterProfile[]
        setProfiles(Array.isArray(p) ? p : [])
      } catch {}
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/minigames/gi/boss-profiles", {
          cache: "no-store",
        })
        const p = (await r.json()) as GiBossProfile[]
        setBossProfiles(Array.isArray(p) ? p : [])
      } catch {}
    })()
  }, [])

  const normalizeEnabledMapForCharacters = useCallback(
    (map: Record<string, boolean>) => {
      const merged: Record<string, boolean> = {}
      ;(characters || []).forEach((c) => {
        merged[c.name] = map[c.name] ?? true
      })
      return merged
    },
    [characters],
  )

  const applyProfile = useCallback(
    (profileIndex: number) => {
      const prof = profiles.find((p) => p.profileIndex === profileIndex)
      if (!prof) return
      const normalized = normalizeEnabledMapForCharacters(prof.enabledMap)
      setSettings((prev) => ({
        ...prev,
        characters: { ...prev.characters, enabled: normalized },
      }))
      setSelectedProfileIndex(profileIndex)
    },
    [profiles, normalizeEnabledMapForCharacters, setSettings],
  )

  const applyBossProfile = useCallback(
    (profileIndex: number) => {
      const prof = bossProfiles.find((p) => p.profileIndex === profileIndex)
      if (!prof) return
      const merged: Record<string, boolean> = {}
      ;(bosses || []).forEach((b) => {
        merged[b.name] = prof.enabledMap[b.name] ?? true
      })
      setSettings((prev) => ({
        ...prev,
        bosses: { ...prev.bosses, enabled: merged },
      }))
      setSelectedBossProfileIndex(profileIndex)
    },
    [bossProfiles, bosses, setSettings],
  )

  useEffect(() => {
    if (!combineMode) return
    let cancelled = false
    ;(async () => {
      try {
        const ids = (memberUserIds || [])
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n))
        if (ids.length === 0) return
        const r = await fetch("/api/minigames/gi/profiles/by-user-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        })
        if (!r.ok) return
        const data = (await r.json()) as {
          profiles?: Array<{
            userId: number
            profileIndex: number
            name: string | null
            enabledMap: Record<string, boolean>
          }>
        }
        if (cancelled) return
        const merged: Record<string, boolean> = {}
        ;(characters || []).forEach((c) => {
          let anyEnabled = false
          for (const prof of data.profiles || []) {
            const val = prof.enabledMap[c.name]
            if (val === true) {
              anyEnabled = true
              break
            }
          }
          merged[c.name] = anyEnabled
        })
        setSettings((prev) => ({
          ...prev,
          characters: { ...prev.characters, enabled: merged },
        }))
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [
    combineMode,
    JSON.stringify(memberUserIds || []),
    characters,
    setSettings,
  ])

  useEffect(() => {
    if (combineMode) return
    if (selectedProfileIndex) applyProfile(selectedProfileIndex)
  }, [combineMode])

  const refreshCombine = useCallback(async () => {
    const ids = (memberUserIds || [])
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n))
    if (ids.length === 0) return
    const r = await fetch("/api/minigames/gi/profiles/by-user-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
    if (!r.ok) return
    const data = (await r.json()) as {
      profiles?: Array<{
        userId: number
        profileIndex: number
        name: string | null
        enabledMap: Record<string, boolean>
      }>
    }
    const merged: Record<string, boolean> = {}
    ;(characters || []).forEach((c) => {
      let anyEnabled = false
      for (const prof of data.profiles || []) {
        const val = prof.enabledMap[c.name]
        if (val === true) {
          anyEnabled = true
          break
        }
      }
      merged[c.name] = anyEnabled
    })
    setSettings((prev) => ({
      ...prev,
      characters: { ...prev.characters, enabled: merged },
    }))
  }, [JSON.stringify(memberUserIds || []), characters, setSettings])

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
    const coopMode = settings.rules.coopMode
    const enabledMap = settings.bosses.enabled
    const list = bosses.filter((b) => enabledMap[b.name] ?? true)
    if (!coopMode) return list.length
    return list.filter((b) => Boolean(b.coop)).length
  }, [bosses, settings.rules.coopMode, JSON.stringify(settings.bosses.enabled)])

  const updateCharacterCount = useCallback(
    (count: number) =>
      setSettings((prev) => ({
        ...prev,
        characters: { ...prev.characters, count },
      })),
    [setSettings],
  )

  const updateBossCount = useCallback(
    (count: number) =>
      setSettings((prev) => ({
        ...prev,
        bosses: { ...prev.bosses, count },
      })),
    [setSettings],
  )

  useEffect(() => {
    if (hasOthers && !settings.rules.coopMode) {
      setSettings((prev) => ({
        ...prev,
        rules: { ...prev.rules, coopMode: true },
      }))
    }
  }, [hasOthers, settings.rules.coopMode, setSettings])

  useEffect(() => {
    if (!hasOthers && !settings.rules.coopMode && selectedBossProfileIndex) {
      applyBossProfile(selectedBossProfileIndex)
    }
  }, [
    hasOthers,
    settings.rules.coopMode,
    selectedBossProfileIndex,
    applyBossProfile,
  ])

  return {
    lobby,
    isHost,
    hostUserId,
    privacy,
    members: sortedMembers,
    membersLoading: loading,
    hasOthers,
    handleSetPrivacy,
    profiles,
    selectedProfileIndex,
    setSelectedProfileIndex,
    combineMode,
    setCombineMode,
    applyProfile,
    bossProfiles,
    selectedBossProfileIndex,
    setSelectedBossProfileIndex,
    applyBossProfile,
    availableCharacters,
    availableBosses,
    characterCount: settings.characters.count,
    bossCount: settings.bosses.count,
    updateCharacterCount,
    updateBossCount,
    refreshCombine,
  }
}

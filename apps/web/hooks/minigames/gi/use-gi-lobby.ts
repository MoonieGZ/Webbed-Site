"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type {
  GiBoss,
  GiCharacter,
  GiLobbyPrivacy,
  GiLobbyState,
  GiRandomizerSettings,
} from "@/types"
import { useAccount } from "@/hooks/account/use-account"

interface CreateLobbyParams {
  privacy?: GiLobbyPrivacy
}

interface JoinLobbyParams {
  lobbyId: string
}

interface RollCharactersParams {
  lobbyId: string
  characters: GiCharacter[]
  settings: GiRandomizerSettings
}

interface RollBossParams {
  lobbyId: string
  bosses: GiBoss[]
  settings: GiRandomizerSettings
}

export function useGiLobby() {
  const [connected, setConnected] = useState(false)
  const [currentLobby, setCurrentLobby] = useState<GiLobbyState | null>(null)
  const [rolling, setRolling] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const { user } = useAccount()

  const isHost = useMemo(() => {
    if (!currentLobby || !user) return false
    return String(currentLobby.hostId) === String(user.id)
  }, [currentLobby, user])

  useEffect(() => {
    let stopped = false
    ;(async () => {
      try {
        const authRes = await fetch("/api/ws/token", { method: "POST" })
        if (!authRes.ok) return
        const auth = (await authRes.json()) as { token: string }
        if (stopped) return

        const url = process.env.NEXT_PUBLIC_WS_URL
        if (!url) return
        const s = io(url, {
          transports: ["websocket"],
          auth: { token: auth.token },
        })
        socketRef.current = s
        s.on("connect", () => setConnected(true))
        s.on("disconnect", () => setConnected(false))

        s.on("lobbyState", (p: { ok: boolean; lobby?: GiLobbyState }) => {
          if (!p?.ok || !p.lobby) return
          setCurrentLobby(p.lobby)
        })
        s.on(
          "rolledCharacters",
          (p: { ok: boolean; characters?: string[]; error?: string }) => {
            if (!p?.ok || !Array.isArray(p.characters)) return
            setCurrentLobby((prev) =>
              prev
                ? {
                    ...prev,
                    currentRoll: {
                      ...(prev.currentRoll || {}),
                      characters: p.characters,
                    },
                  }
                : prev,
            )
          },
        )
        s.on(
          "rolledBoss",
          (p: { ok: boolean; boss?: string; error?: string }) => {
            if (!p?.ok) return
            setCurrentLobby((prev) =>
              prev
                ? {
                    ...prev,
                    currentRoll: {
                      ...(prev.currentRoll || {}),
                      boss: p.boss ?? null,
                    },
                  }
                : prev,
            )
          },
        )

        s.on(
          "lobby:host_left",
          (p: { ok: boolean; lobbyId?: string; hostId?: string | null }) => {
            if (!p?.ok) return
            setCurrentLobby((prev) =>
              prev && (!p?.lobbyId || p.lobbyId === prev.lobbyId)
                ? { ...prev, hostId: p?.hostId ? String(p.hostId) : prev?.hostId }
                : prev,
            )
            // Show warning to all remaining members
            toast.warning("Host left. A new host has been assigned.", toastStyles.warning)
          },
        )

        s.on(
          "lobby:host_transfer",
          (p: { ok: boolean; lobbyId?: string; hostId?: string }) => {
            setCurrentLobby((prev) =>
              prev && (!p?.lobbyId || p.lobbyId === prev.lobbyId)
                ? { ...prev, hostId: String(p?.hostId || prev.hostId) }
                : prev,
            )
          },
        )

        s.on("lobby:kicked", (p: { ok: boolean; lobbyId?: string }) => {
          try {
            toast.error("You were removed from the lobby", {
              ...toastStyles.error,
              duration: 5000,
            })
          } catch {}
          setCurrentLobby(null)
        })
      } catch {}
    })()
    return () => {
      stopped = true
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    // no-op; but ensures hook re-computes isHost when user is available
  }, [user?.id, currentLobby?.hostId])

  const createLobby = useCallback(async (params?: CreateLobbyParams) => {
    return new Promise<{ ok: boolean; lobbyId?: string; error?: string }>(
      (resolve) => {
        const s = socketRef.current
        if (!s) return resolve({ ok: false, error: "Not connected" })
        s.emit("createLobby", { privacy: params?.privacy }, (res: any) => {
          if (!res?.ok)
            return resolve({ ok: false, error: res?.error || "Failed" })

          s.emit("lobbyState", { lobbyId: res.lobbyId }, (state: any) => {
            if (state?.ok && state.lobby)
              setCurrentLobby(state.lobby as GiLobbyState)
            resolve({ ok: true, lobbyId: res.lobbyId })
          })
        })
      },
    )
  }, [])

  const joinLobby = useCallback(
    async ({ lobbyId }: JoinLobbyParams) => {
      return new Promise<{ ok: boolean; error?: string }>(async (resolve) => {
        const s = socketRef.current
        if (!s) return resolve({ ok: false, error: "Not connected" })
        if (currentLobby?.lobbyId && currentLobby.lobbyId !== lobbyId) {
          await new Promise<void>((res) => {
            s.emit("leaveLobby", { lobbyId: currentLobby.lobbyId }, () => res())
          })
        }
        s.emit("joinLobby", { lobbyId }, (res: any) => {
          if (!res?.ok)
            return resolve({ ok: false, error: res?.error || "Failed" })
          s.emit("lobbyState", { lobbyId }, (state: any) => {
            if (state?.ok && state.lobby)
              setCurrentLobby(state.lobby as GiLobbyState)
            resolve({ ok: true })
          })
        })
      })
    },
    [currentLobby?.lobbyId],
  )

  const leaveLobby = useCallback(async () => {
    return new Promise<{ ok: boolean; error?: string }>((resolve) => {
      const s = socketRef.current
      const lobbyId = currentLobby?.lobbyId
      if (!s || !lobbyId) return resolve({ ok: false, error: "No lobby" })
      s.emit("leaveLobby", { lobbyId }, (res: any) => {
        if (!res?.ok)
          return resolve({ ok: false, error: res?.error || "Failed" })
        setCurrentLobby(null)
        resolve({ ok: true })
      })
    })
  }, [currentLobby?.lobbyId])

  const kickMember = useCallback(
    async (memberUserId: string | number) => {
      return new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const s = socketRef.current
        const lobbyId = currentLobby?.lobbyId
        if (!s || !lobbyId) return resolve({ ok: false, error: "No lobby" })
        s.emit(
          "kickMember",
          { lobbyId, memberUserId: String(memberUserId) },
          (res: any) => {
            if (!res?.ok)
              return resolve({ ok: false, error: res?.error || "Failed" })
            resolve({ ok: true })
          },
        )
      })
    },
    [currentLobby?.lobbyId],
  )

  const rollCharacters = useCallback(
    async ({ lobbyId, characters, settings }: RollCharactersParams) => {
      if (!socketRef.current)
        return { ok: false as const, error: "Not connected" }
      try {
        setRolling(true)
        return await new Promise<{
          ok: boolean
          characters?: string[]
          error?: string
        }>((resolve) => {
          socketRef.current!.emit(
            "rollCharacters",
            { lobbyId, characters, settings },
            (res: any) => {
              setRolling(false)
              if (!res?.ok)
                return resolve({ ok: false, error: res?.error || "Failed" })
              resolve({ ok: true, characters: res.characters })
            },
          )
        })
      } finally {
        setRolling(false)
      }
    },
    [],
  )

  const rollBoss = useCallback(
    async ({ lobbyId, bosses, settings }: RollBossParams) => {
      if (!socketRef.current)
        return { ok: false as const, error: "Not connected" }
      try {
        setRolling(true)
        return await new Promise<{
          ok: boolean
          boss?: string
          error?: string
        }>((resolve) => {
          socketRef.current!.emit(
            "rollBoss",
            { lobbyId, bosses, settings },
            (res: any) => {
              setRolling(false)
              if (!res?.ok)
                return resolve({ ok: false, error: res?.error || "Failed" })
              resolve({ ok: true, boss: res.boss })
            },
          )
        })
      } finally {
        setRolling(false)
      }
    },
    [],
  )

  return {
    connected,
    lobby: currentLobby,
    isHost,
    hostUserId: currentLobby?.hostId ?? null,
    memberUserIds: Array.isArray(currentLobby?.members)
      ? currentLobby!.members
      : [],
    createLobby,
    joinLobby,
    rollCharacters,
    rollBoss,
    setLobbyPrivacy: (privacy: GiLobbyPrivacy) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const s = socketRef.current
        const lobbyId = currentLobby?.lobbyId
        if (!s || !lobbyId) return resolve({ ok: false, error: "No lobby" })
        s.emit("setLobbyPrivacy", { lobbyId, privacy }, (res: any) => {
          if (!res?.ok)
            return resolve({ ok: false, error: res?.error || "Failed" })
          resolve({ ok: true })
        })
      }),
    rolling,
    leaveLobby,
    kickMember,
  }
}

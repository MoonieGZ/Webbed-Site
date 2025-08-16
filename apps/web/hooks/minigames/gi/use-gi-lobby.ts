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
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        })
        socketRef.current = s
        const createSoloLobby = async () => {
          return new Promise<void>((resolve) => {
            try {
              s.emit("createLobby", { privacy: "closed" }, (res: any) => {
                if (!res?.ok || !res?.lobbyId) {
                  try {
                    toast.error(
                      res?.error || "Failed to create solo lobby.",
                      toastStyles.error,
                    )
                  } catch {}
                  return resolve()
                }
                s.emit("lobbyState", { lobbyId: res.lobbyId }, (state: any) => {
                  if (state?.ok && state.lobby)
                    setCurrentLobby(state.lobby as GiLobbyState)
                  try {
                    localStorage.setItem("gi:lastLobbyId", String(res.lobbyId))
                    toast.success(
                      "Connected to solo lobby.",
                      toastStyles.success,
                    )
                  } catch {}
                  resolve()
                })
              })
            } catch {
              resolve()
            }
          })
        }
        s.on("connect", async () => {
          setConnected(true)
          try {
            if (currentLobby?.lobbyId) return
            const stored = localStorage.getItem("gi:lastLobbyId")
            if (!stored) return
            await new Promise<void>((resolve) => {
              s.emit("joinLobby", { lobbyId: stored }, async (res: any) => {
                if (res?.ok) {
                  s.emit("lobbyState", { lobbyId: stored }, (state: any) => {
                    if (state?.ok && state.lobby) {
                      setCurrentLobby(state.lobby as GiLobbyState)
                      toast.success(
                        "Rejoined your previous lobby.",
                        toastStyles.success,
                      )
                    }
                    resolve()
                  })
                } else {
                  try {
                    localStorage.removeItem("gi:lastLobbyId")
                    toast.info("Your previous lobby was closed.", {
                      ...toastStyles.info,
                      duration: 3000,
                    })
                  } catch {}
                  await createSoloLobby()
                  resolve()
                }
              })
            })
          } catch {}
        })
        s.on("disconnect", () => {
          setConnected(false)
          try {
            toast.info("Disconnected. Attempting to reconnect...", {
              ...toastStyles.info,
              duration: 2000,
            })
          } catch {}
        })

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
          (p: {
            ok: boolean
            boss?: string
            bosses?: string[]
            error?: string
          }) => {
            if (!p?.ok) return
            setCurrentLobby((prev) =>
              prev
                ? {
                    ...prev,
                    currentRoll: {
                      ...(prev.currentRoll || {}),
                      boss: p.boss ?? null,
                      bosses: Array.isArray(p.bosses)
                        ? p.bosses
                        : prev.currentRoll?.bosses,
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
                ? {
                    ...prev,
                    hostId: p?.hostId ? String(p.hostId) : prev?.hostId,
                  }
                : prev,
            )

            toast.warning(
              "Host left. A new host has been assigned.",
              toastStyles.warning,
            )
          },
        )

        s.on(
          "lobby:member_joined",
          (p: { ok: boolean; lobbyId?: string; memberUserId?: string }) => {
            if (!p?.ok) return
            setCurrentLobby((prev) => {
              if (!prev || (p?.lobbyId && prev.lobbyId !== p.lobbyId))
                return prev
              const mid = String(p?.memberUserId || "")
              if (!mid) return prev
              if (prev.members?.includes(mid)) return prev
              const next = { ...prev, members: [...(prev.members || []), mid] }
              try {
                if (!user || String(user.id) !== mid) {
                  toast.info("A player joined the lobby", {
                    ...toastStyles.info,
                    duration: 3000,
                  })
                }
              } catch {}
              return next
            })
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
          try {
            localStorage.removeItem("gi:lastLobbyId")
          } catch {}
        })

        s.on("lobby:closed", (p: { ok: boolean; lobbyId?: string }) => {
          try {
            toast.info("Lobby was closed.", {
              ...toastStyles.info,
              duration: 3000,
            })
          } catch {}
          setCurrentLobby(null)
          try {
            localStorage.removeItem("gi:lastLobbyId")
          } catch {}
          // Auto-create a replacement solo lobby
          void createSoloLobby()
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

  useEffect(() => {
    const s = socketRef.current
    const lobbyId = currentLobby?.lobbyId
    if (!s || !connected || !lobbyId) return
    let stopped = false
    const sendHeartbeat = () => {
      try {
        s.emit("heartbeat", { lobbyId })
      } catch {}
    }
    const intervalId = setInterval(sendHeartbeat, 5000)
    sendHeartbeat()
    const onVisibility = () => {
      if (!document.hidden) sendHeartbeat()
    }
    const onOnline = () => sendHeartbeat()
    window.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("online", onOnline)
    return () => {
      stopped = true
      clearInterval(intervalId)
      window.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("online", onOnline)
    }
  }, [connected, currentLobby?.lobbyId])

  useEffect(() => {
    const hasOthers = (currentLobby?.members?.length || 0) > 1
    const shouldWarn = Boolean(currentLobby?.lobbyId) && (isHost || hasOthers)
    const handler = (e: BeforeUnloadEvent) => {
      if (!shouldWarn) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [currentLobby?.lobbyId, currentLobby?.members, isHost])

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
            try {
              localStorage.setItem("gi:lastLobbyId", String(res.lobbyId))
            } catch {}
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
            try {
              localStorage.setItem("gi:lastLobbyId", String(lobbyId))
            } catch {}
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
        try {
          localStorage.removeItem("gi:lastLobbyId")
        } catch {}
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
    syncHostEnabledMap: (enabledMap: Record<string, boolean>) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const s = socketRef.current
        const lobbyId = currentLobby?.lobbyId
        if (!s || !lobbyId) return resolve({ ok: false, error: "No lobby" })
        s.emit("syncHostEnabledMap", { lobbyId, enabledMap }, (res: any) => {
          if (!res?.ok)
            return resolve({ ok: false, error: res?.error || "Failed" })
          resolve({ ok: true })
        })
      }),
    syncHostBossEnabledMap: (enabledMap: Record<string, boolean>) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const s = socketRef.current
        const lobbyId = currentLobby?.lobbyId
        if (!s || !lobbyId) return resolve({ ok: false, error: "No lobby" })
        s.emit(
          "syncHostBossEnabledMap",
          { lobbyId, enabledMap },
          (res: any) => {
            if (!res?.ok)
              return resolve({ ok: false, error: res?.error || "Failed" })
            resolve({ ok: true })
          },
        )
      }),
    rolling,
    leaveLobby,
    kickMember,
  }
}

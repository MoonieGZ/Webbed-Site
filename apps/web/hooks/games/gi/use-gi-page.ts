"use client"

import * as React from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useGiLobbyContext } from "@/hooks/games/gi/lobby-provider"

export function useGiPage() {
  const [aboutOpen, setAboutOpen] = React.useState(false)
  const [showFirstStart, setShowFirstStart] = React.useState(false)
  const { connected, lobby, createLobby } = useGiLobbyContext()

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("first_start")
      setShowFirstStart(stored !== "false")
    } catch {
      setShowFirstStart(true)
    }
  }, [])

  React.useEffect(() => {
    if (!connected) return
    if (lobby?.lobbyId) return
    try {
      const storedLobbyId = localStorage.getItem("gi:lastLobbyId")
      if (storedLobbyId) return
    } catch {}
    ;(async () => {
      toast.info("Connecting to lobby...", {
        ...toastStyles.info,
        duration: 2000,
      })
      const res = await createLobby({ privacy: "closed" })
      if (res.ok) {
        toast.success("Connected to solo lobby.", toastStyles.success)
      } else {
        toast.error(res.error || "Failed to create lobby.", toastStyles.error)
      }
    })()
  }, [connected, lobby?.lobbyId, createLobby])

  const handleAboutOpenChange = React.useCallback((open: boolean) => {
    setAboutOpen(open)
  }, [])

  React.useEffect(() => {
    if (aboutOpen && showFirstStart) {
      try {
        localStorage.setItem("first_start", "false")
      } catch {}
      setShowFirstStart(false)
    }
  }, [aboutOpen, showFirstStart])

  return { aboutOpen, setAboutOpen, showFirstStart, handleAboutOpenChange }
}

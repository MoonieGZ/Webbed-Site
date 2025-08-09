import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type { GameUID, GameType } from "@/types/game-uid"

export const GAME_INFO = {
  gi: {
    name: "Genshin Impact",
    shortName: "GI",
    description: "Enter your Genshin Impact UID",
    placeholder: "e.g., 123456789",
  },
  hsr: {
    name: "Honkai: Star Rail",
    shortName: "HSR",
    description: "Enter your Honkai: Star Rail UID",
    placeholder: "e.g., 123456789",
  },
  zzz: {
    name: "Zenless Zone Zero",
    shortName: "ZZZ",
    description: "Enter your Zenless Zone Zero UID",
    placeholder: "e.g., 123456789",
  },
  ww: {
    name: "Wuthering Waves",
    shortName: "WW",
    description: "Enter your Wuthering Waves UID",
    placeholder: "e.g., 123456789",
  },
} as const

export function useGameUIDs() {
  const [gameUIDs, setGameUIDs] = useState<GameUID[]>([])
  const [loading, setLoading] = useState(true)
  const [savingGames, setSavingGames] = useState<Set<GameType>>(new Set())
  const [uidInputs, setUidInputs] = useState<Record<GameType, string>>({
    gi: "",
    hsr: "",
    zzz: "",
    ww: "",
  })

  useEffect(() => {
    fetchGameUIDs()
  }, [])

  const fetchGameUIDs = async () => {
    try {
      const response = await fetch("/api/account/game-uids")
      const data = await response.json()

      if (response.ok) {
        setGameUIDs(data)

        const initialInputs = { gi: "", hsr: "", zzz: "", ww: "" }
        data.forEach((uid: GameUID) => {
          initialInputs[uid.game] = uid.uid
        })
        setUidInputs(initialInputs)
      } else {
        console.error("Failed to fetch game UIDs:", data.error)
        toast.error("Failed to load game UIDs", toastStyles.error)
      }
    } catch (error) {
      console.error("Error fetching game UIDs:", error)
      toast.error("Failed to load game UIDs", toastStyles.error)
    } finally {
      setLoading(false)
    }
  }

  const saveGameUID = async (game: GameType) => {
    const uid = uidInputs[game].trim()

    setSavingGames((prev) => new Set(prev).add(game))

    try {
      if (!uid) {
        const response = await fetch(`/api/account/game-uids?game=${game}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (response.ok) {
          toast.success(
            `${GAME_INFO[game].name} UID deleted successfully!`,
            toastStyles.success,
          )
          await fetchGameUIDs()
        } else {
          toast.error(
            data.error || `Failed to delete ${GAME_INFO[game].name} UID`,
            toastStyles.error,
          )
        }
      } else {
        const response = await fetch("/api/account/game-uids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ game, uid }),
        })

        const data = await response.json()

        if (response.ok) {
          toast.success(
            `${GAME_INFO[game].name} UID saved successfully!`,
            toastStyles.success,
          )
          await fetchGameUIDs()
        } else {
          toast.error(
            data.error || `Failed to save ${GAME_INFO[game].name} UID`,
            toastStyles.error,
          )
        }
      }
    } catch (error) {
      console.error(`Error saving/deleting ${GAME_INFO[game].name} UID:`, error)
      toast.error(
        `Failed to save ${GAME_INFO[game].name} UID`,
        toastStyles.error,
      )
    } finally {
      setSavingGames((prev) => {
        const newSet = new Set(prev)
        newSet.delete(game)
        return newSet
      })
    }
  }

  const updateUidInput = (game: GameType, value: string) => {
    setUidInputs((prev) => ({ ...prev, [game]: value }))
  }

  const getGameUID = (game: GameType) => {
    return gameUIDs.find((uid) => uid.game === game)
  }

  const isSaving = (game: GameType) => savingGames.has(game)

  return {
    gameUIDs,
    loading,
    uidInputs,
    saveGameUID,
    updateUidInput,
    getGameUID,
    isSaving,
    refreshGameUIDs: fetchGameUIDs,
  }
}

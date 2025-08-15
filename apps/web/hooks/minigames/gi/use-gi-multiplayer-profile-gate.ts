"use client"

import { useCallback, useRef } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

export function useGiMultiplayerProfileGate() {
  const cacheRef = useRef<{ checked: boolean; has: boolean }>({
    checked: false,
    has: false,
  })

  const ensureHasMultiplayerProfile = useCallback(
    async (forceRefresh = false) => {
      if (cacheRef.current.checked && !forceRefresh) {
        if (!cacheRef.current.has) {
          toast.error("Multiplayer profile required.", {
            ...toastStyles.error,
            description:
              "Go to Settings, choose your character list, then Profiles > Save and name it 'Multiplayer'.",
            duration: 10000,
          } as any)
        }
        return cacheRef.current.has
      }
      try {
        const res = await fetch("/api/minigames/gi/profiles", {
          cache: "no-store",
        })
        const list = (await res.json()) as Array<{ name: string | null }>
        const has =
          Array.isArray(list) &&
          list.some(
            (p) => (p?.name || "").trim().toLowerCase() === "multiplayer",
          )
        cacheRef.current = { checked: true, has }
        if (!has) {
          toast.error("Multiplayer profile required.", {
            ...toastStyles.error,
            description:
              "Go to Settings, choose your character list, then Profiles > Save and name it 'Multiplayer'.",
            duration: 10000,
          } as any)
        }
        return has
      } catch {
        toast.error("Unable to verify profiles.", {
          ...toastStyles.error,
          description:
            "Go to Settings, choose your character list, then Profiles > Save and name it 'Multiplayer'.",
          duration: 10000,
        } as any)
        return false
      }
    },
    [],
  )

  return { ensureHasMultiplayerProfile }
}

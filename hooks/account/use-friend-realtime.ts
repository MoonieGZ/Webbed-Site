"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type { FriendRequestCountResponse } from "@/types/friends"

export function useFriendRealtime() {
  const [pendingCount, setPendingCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const fetchCount = async () => {
    try {
      const r = await fetch("/api/friends/requests/count", {
        cache: "no-store",
      })
      if (!r.ok) return
      const data = (await r.json()) as FriendRequestCountResponse
      setPendingCount(data.pendingCount ?? 0)
    } catch {}
  }

  useEffect(() => {
    let stopped = false
    ;(async () => {
      await fetchCount()
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
        let lastCount = 0
        s.on("friend:pending_count", (p: { count: number }) => {
          const next = typeof p?.count === "number" ? p.count : 0

          if (next > lastCount) {
            const diff = next - lastCount
            toast.info(
              diff === 1 ? "New friend request!" : `${diff} new friend requests!`,
              {
                ...toastStyles.info,
                duration: 10000,
              },
            )
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("friend-requests:refresh"))
            }
          }
          lastCount = next
          setPendingCount(next)
        })
      } catch {}
    })()

    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchCount()
    }
    const onFocus = () => void fetchCount()
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      stopped = true
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisible)
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  return { pendingCount, connected, refresh: fetchCount }
}

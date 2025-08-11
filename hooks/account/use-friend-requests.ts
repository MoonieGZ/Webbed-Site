import { useCallback, useEffect, useState } from "react"
import type { FriendRequestItem } from "@/types"

export type RequestsTabKey = "friends" | "received" | "sent" | "blocked"

export function useFriendRequests() {
  const [tab, setTab] = useState<RequestsTabKey>("friends")
  const [received, setReceived] = useState<FriendRequestItem[]>([])
  const [sent, setSent] = useState<FriendRequestItem[]>([])
  const [blocked, setBlocked] = useState<FriendRequestItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/friends/requests")
      if (res.ok) {
        const data = (await res.json()) as { requests: FriendRequestItem[] }
        const all = data.requests
        setReceived(all.filter((r) => r.type === "received" && r.status === "pending"))
        setSent(all.filter((r) => r.type === "sent" && r.status === "pending"))
        setBlocked(all.filter((r) => r.type === "blocked"))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const sendRequest = async (userId: number) => {
    const res = await fetch("/api/friends/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) await fetchAll()
    return res.ok
  }

  const respondToRequest = async (
    requestId: number,
    action: "accept" | "decline" | "block" | "cancel",
  ) => {
    const res = await fetch(`/api/friends/requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      await fetchAll()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("friends:refresh"))
      }
    }
    return res.ok
  }

  const unblockUser = async (requestId: number) => {
    const res = await fetch(`/api/friends/requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unblock" }),
    })
    if (res.ok) await fetchAll()
    return res.ok
  }

  return {
    tab,
    setTab,
    received,
    sent,
    blocked,
    loading,
    sendRequest,
    respondToRequest,
    unblockUser,
    refresh: fetchAll,
  }
}

import { useState } from "react"
import type { FriendUserSummary } from "@/types"

export function useAddFriendDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<FriendUserSummary[]>([])
  const [searching, setSearching] = useState(false)

  const search = async (q: string) => {
    const term = q.trim()
    setQuery(term)
    if (!term) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `/api/friends/search?q=${encodeURIComponent(term)}`,
      )
      if (res.ok) {
        const data = (await res.json()) as { users: FriendUserSummary[] }
        setResults(data.users)
      }
    } finally {
      setSearching(false)
    }
  }

  const sendRequest = async (userId: number) => {
    const res = await fetch("/api/friends/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) setResults((prev) => prev.filter((u) => u.id !== userId))
    return res.ok
  }

  return {
    open,
    setOpen,
    query,
    setQuery,
    results,
    searching,
    search,
    sendRequest,
  }
}

import { useCallback, useEffect, useMemo, useState } from "react"
import type { FriendListItem, FriendUserSummary } from "@/types"

export function useFriendsList() {
  const [friends, setFriends] = useState<FriendListItem[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<FriendUserSummary[]>([])

  const filteredFriends = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return friends
    return friends.filter((f) => f.name.toLowerCase().includes(query))
  }, [friends, q])

  const fetchFriends = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      const res = await fetch(`/api/friends?${params.toString()}`)
      if (res.ok) {
        const data = (await res.json()) as {
          friends: FriendListItem[]
          page: number
          pageSize: number
          total: number
        }
        setFriends(data.friends)
        setTotal(data.total)

        setSelected((prev) => {
          const ids = new Set(data.friends.map((f) => f.id))
          const next = new Set<number>()
          for (const id of prev) if (ids.has(id)) next.add(id)
          return next
        })
      }
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    void fetchFriends()
  }, [fetchFriends])

  useEffect(() => {
    const handler = () => {
      void fetchFriends()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("friends:refresh", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("friends:refresh", handler)
      }
    }
  }, [fetchFriends])

  const removeFriend = async (userId: number) => {
    const res = await fetch(`/api/friends/${userId}`, { method: "DELETE" })
    if (res.ok) await fetchFriends()
    return res.ok
  }

  const toggleSelect = (userId: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const removeSelected = async () => {
    if (selected.size === 0) return false
    const ids = Array.from(selected)
    await Promise.all(
      ids.map((id) => fetch(`/api/friends/${id}`, { method: "DELETE" })),
    )
    await fetchFriends()
    setSelected(new Set())
    return true
  }

  const searchUsers = async (query: string) => {
    const term = query.trim()
    if (!term) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `/api/friends/search?q=${encodeURIComponent(term)}`,
      )
      if (res.ok) {
        const data = (await res.json()) as { users: FriendUserSummary[] }
        setSearchResults(data.users)
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
    if (res.ok) {
      // Optimistically remove from results
      setSearchResults((prev) => prev.filter((u) => u.id !== userId))
    }
    return res.ok
  }

  return {
    friends: filteredFriends,
    loading,
    searching,
    q,
    setQ,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    removeFriend,
    selected,
    toggleSelect,
    clearSelection,
    removeSelected,
    refresh: fetchFriends,
    searchResults,
    searchUsers,
    sendRequest,
  }
}

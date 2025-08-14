"use client"

import { useEffect, useMemo, useState } from "react"
import type { AppUser } from "@/types/user"

export function useUsersByIds(userIds: Array<number | string> | null) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<
    Record<string, Pick<AppUser, "id" | "name" | "title" | "avatar">>
  >({})

  useEffect(() => {
    const ids = (userIds || [])
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n))
    if (ids.length === 0) {
      setUsers({})
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const r = await fetch("/api/users/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        })
        if (!r.ok) return
        const data = (await r.json()) as {
          users?: Array<{
            id: number
            name: string | null
            title: string | null
            avatar: string | null
          }>
        }
        if (cancelled) return
        const map: Record<string, any> = {}
        for (const u of data.users || []) {
          map[String(u.id)] = {
            id: u.id,
            name: u.name || `User ${u.id}`,
            title: u.title || null,
            avatar: u.avatar || null,
          }
        }
        setUsers(map)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [JSON.stringify(userIds || [])])

  const list = useMemo(() => Object.values(users), [users])
  return { loading, users, list }
}

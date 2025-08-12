import { useCallback, useEffect, useMemo, useState } from "react"

export type AdminUser = {
  id: number
  name: string
  email: string
  avatar: string | null
  permissions: {
    can_change_user: 0 | 1
    can_change_avatar: 0 | 1
    is_banned: 0 | 1
  }
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    [total, pageSize],
  )

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (q.trim()) params.set("q", q.trim())
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, q])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const toggleSelect = (userId: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const performBulk = async (
    action:
      | "restrict_user"
      | "restrict_avatar"
      | "ban"
      | "allow_user"
      | "allow_avatar"
      | "unban",
  ) => {
    if (selected.size === 0) return
    const userIds = Array.from(selected.values())
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds, action }),
    })
    if (res.ok) {
      await fetchUsers()
    }
  }

  return {
    users,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    q,
    setQ,
    loading,
    selected,
    toggleSelect,
    clearSelection,
    performBulk,
  }
}

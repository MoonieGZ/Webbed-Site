"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

type GroupType = "talent_upgrade" | "enemy_drop" | "other"
type MaterialType = "weekly_boss" | "boss_drop" | "collectible"
type CombinedType = GroupType | MaterialType

type Character = {
  id: number
  name: string
  element: string
  weaponType: string
  rarity: number
}
type GroupsByType = Record<
  string,
  Array<{ id: number; name: string; previewMaterialName?: string }>
>
type MaterialsByType = Record<string, Array<{ id: number; name: string }>>
type CurrentAssignments = Record<number, Partial<Record<CombinedType, number>>>

export function useWwAdminGroups() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [groupsByType, setGroupsByType] = useState<GroupsByType>({})
  const [current, setCurrent] = useState<CurrentAssignments>({})
  const [materialsByType, setMaterialsByType] = useState<MaterialsByType>({})
  const [q, setQ] = useState("")

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/ww/groups", {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to load groups")
      const data = (await res.json()) as {
        characters: Character[]
        groupsByType: GroupsByType
        current: CurrentAssignments
        materialsByType: MaterialsByType
      }
      setCharacters(data.characters)
      setGroupsByType(data.groupsByType)
      setCurrent(data.current)
      setMaterialsByType(data.materialsByType)
    } catch (err: any) {
      setError(err?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return characters
    return characters.filter((c) => c.name.toLowerCase().includes(query))
  }, [characters, q])

  const groupedByElement = useMemo(() => {
    const map: Record<string, Character[]> = {}
    for (const c of filtered) {
      if (!map[c.element]) map[c.element] = []
      map[c.element].push(c)
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name))
    }
    return map
  }, [filtered])

  const updateAssignment = useCallback(
    async (characterId: number, type: CombinedType, groupId: number | null) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/ww/groups", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characterId, type, groupId }),
        })
        if (!res.ok) throw new Error("Failed to update")
        setCurrent((prev) => ({
          ...prev,
          [characterId]: {
            ...(prev[characterId] || {}),
            [type]: groupId ?? undefined,
          },
        }))
        toast.success("Saved", toastStyles.success)
      } catch (err: any) {
        setError(err?.message || "Unknown error")
        toast("Failed to save", toastStyles.error)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    loading,
    error,
    q,
    setQ,
    groupedByElement,
    groupsByType,
    materialsByType,
    current,
    updateAssignment,
  }
}

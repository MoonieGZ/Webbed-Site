"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  createContext,
} from "react"
import { EXP_MATERIALS } from "@/lib/games/ww/templates"

type Material = { id: number; name: string; rarity?: number }
type Group = { groupId: number; groupName: string; materials: Material[] }

type AssetsResponse = {
  groupsByType?: Record<string, Group[]>
  materialsByType?: Record<string, Array<Material & { rarity: number }>>
  characters?: Array<{
    id: number
    name: string
    element: string
    weaponType: string
    rarity: number
    icon: string
    elementIcon: string
    groups?: Record<string, Group[]>
    materials?: Record<string, { id: number; name: string; rarity: number }>
  }>
}

type InventoryMap = Record<number, number>

const STORAGE_KEY = "ww:inventory:v1"

function readLocalStorage(): InventoryMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as InventoryMap
    // sanitize to non-negative integers
    const sanitized: InventoryMap = {}
    for (const [k, v] of Object.entries(parsed)) {
      const id = Number(k)
      const num = Math.max(0, Math.floor(Number(v)))
      if (Number.isFinite(id) && Number.isFinite(num)) sanitized[id] = num
    }
    return sanitized
  } catch {
    return {}
  }
}

function writeLocalStorage(map: InventoryMap) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

export type UseWwInventoryReturn = {
  loading: boolean
  error: string | null
  // taxonomy
  standaloneByType: Record<string, Material[]>
  groupsByType: Record<string, Group[]>
  // state
  counts: InventoryMap
  setCount: (materialId: number, count: number) => void
  increment: (materialId: number, delta?: number) => void
  resetAll: () => void
  getCountFor: (type: string, name: string) => number
  getTotalExp: (category: "CHARACTER" | "WEAPON") => number
}

const WwInventoryContext = createContext<UseWwInventoryReturn | null>(null)

export function WwInventoryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const value = useWwInventoryInternal()
  return React.createElement(
    WwInventoryContext.Provider,
    { value },
    children as any,
  )
}

export function useWwInventory(): UseWwInventoryReturn {
  // If a context is provided higher up (preferred), use it.
  const ctx = useContext(WwInventoryContext)
  if (ctx) return ctx
  return useWwInventoryInternal()
}

function useWwInventoryInternal(): UseWwInventoryReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState<InventoryMap>({})

  const [standaloneByType, setStandaloneByType] = useState<
    Record<string, Material[]>
  >({})
  const [groupsByType, setGroupsByType] = useState<Record<string, Group[]>>({})

  const initializedRef = useRef(false)

  // Load counts once
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    setCounts(readLocalStorage())
  }, [])

  // Persist on changes
  useEffect(() => {
    if (!initializedRef.current) return
    writeLocalStorage(counts)
  }, [counts])

  const setCount = useCallback((materialId: number, count: number) => {
    setCounts((prev) => {
      const next = { ...prev }
      const sanitized = Math.max(0, Math.floor(Number(count) || 0))
      if (sanitized === 0) delete next[materialId]
      else next[materialId] = sanitized
      return next
    })
  }, [])

  const increment = useCallback((materialId: number, delta = 1) => {
    setCounts((prev) => {
      const current = prev[materialId] || 0
      const nextVal = Math.max(0, Math.floor(current + delta))
      const next = { ...prev }
      if (nextVal === 0) delete next[materialId]
      else next[materialId] = nextVal
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setCounts({})
  }, [])

  // Fetch taxonomy of materials
  const fetchAssets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/games/ww/assets", { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to load assets: ${res.status}`)
      const data = (await res.json()) as AssetsResponse

      // Groups (enemy_drop, talent_upgrade, etc.)
      setGroupsByType(data.groupsByType || {})

      // Standalone materials by type: collectible, boss_drop, exp
      const baseStandalone = data.materialsByType || {}

      // Weekly boss materials aren't included in materialsByType; collect from characters.materials
      const weeklySet = new Map<number, Material>()
      for (const c of data.characters || []) {
        const w = c.materials?.["weekly_boss"]
        if (w && !weeklySet.has(w.id))
          weeklySet.set(w.id, { id: w.id, name: w.name, rarity: w.rarity })
      }

      const standalone: Record<string, Material[]> = { ...baseStandalone }
      if (weeklySet.size > 0) {
        standalone["weekly_boss"] = Array.from(weeklySet.values()).sort(
          (a, b) =>
            (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name),
        )
      }

      // Normalize arrays and sort by rarity desc then name
      for (const key of Object.keys(standalone)) {
        const arr = standalone[key] || []
        standalone[key] = [...arr].sort(
          (a, b) =>
            (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name),
        )
      }

      setStandaloneByType(standalone)
    } catch (err: any) {
      setError(err?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  // Derived sums per type (not currently returned but may be helpful)
  useMemo(() => counts, [counts])

  return {
    loading,
    error,
    standaloneByType,
    groupsByType,
    counts,
    setCount,
    increment,
    resetAll,
    getCountFor: (type: string, name: string) => {
      // Prefer exact match by id if known via taxonomy
      const fromStandalone = (standaloneByType[type] || []).find(
        (m) => m.name === name,
      )
      if (fromStandalone) {
        const id = Number(fromStandalone.id)
        const val = (counts as Record<number, number>)[id]
        if (val != null) return val || 0
      }
      // Search group materials as a fallback
      for (const g of groupsByType[type] || []) {
        const m = g.materials.find((x) => x.name === name)
        if (m) {
          const id = Number(m.id)
          const val = (counts as Record<number, number>)[id]
          if (val != null) return val || 0
        }
      }
      // Special-case Shell Credit (DB id 89)
      if (name === "Shell Credit") {
        const id = 89
        const val = (counts as Record<number, number>)[id]
        return val || 0
      }
      return 0
    },
    getTotalExp: (category: "CHARACTER" | "WEAPON") => {
      const mats = EXP_MATERIALS[category]
      if (!mats) return 0
      let total = 0
      for (const m of mats) {
        const id = Number(m.id)
        const have = (counts as Record<number, number>)[id] || 0
        const value = Number((m as any).value) || 0
        if (have > 0 && value > 0) total += have * value
      }
      return total
    },
  }
}

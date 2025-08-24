"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  useState,
} from "react"

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

// Simple shared store so multiple hook instances stay in sync
let sharedCounts: InventoryMap = {}
let sharedInitialized = false
const subscribers = new Set<() => void>()
const INVENTORY_EVENT = "ww:inventory:change"

function notifySubscribers() {
  for (const fn of subscribers) fn()
}

function subscribe(fn: () => void) {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}

function getSnapshot() {
  return sharedCounts
}

function getServerSnapshot() {
  return {}
}

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
}

export function useWwInventory(): UseWwInventoryReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const counts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const [standaloneByType, setStandaloneByType] = useState<
    Record<string, Material[]>
  >({})
  const [groupsByType, setGroupsByType] = useState<Record<string, Group[]>>({})

  const initializedRef = useRef(false)

  // Load counts once and bridge cross-bundle updates via DOM event
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    if (!sharedInitialized) {
      sharedCounts = readLocalStorage()
      sharedInitialized = true
      notifySubscribers()
    }
    const onDomEvent = (e: Event) => {
      try {
        const detail = (e as CustomEvent<InventoryMap>).detail
        if (detail) {
          sharedCounts = { ...detail }
          writeLocalStorage(sharedCounts)
          notifySubscribers()
        }
      } catch {}
    }
    if (typeof window !== "undefined")
      window.addEventListener(INVENTORY_EVENT, onDomEvent as any)
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener(INVENTORY_EVENT, onDomEvent as any)
    }
  }, [])

  const setCount = useCallback((materialId: number, count: number) => {
    const next = { ...sharedCounts }
    const sanitized = Math.max(0, Math.floor(Number(count) || 0))
    if (sanitized === 0) delete next[materialId]
    else next[materialId] = sanitized
    sharedCounts = next
    writeLocalStorage(sharedCounts)
    notifySubscribers()
    if (typeof window !== "undefined")
      window.dispatchEvent(
        new CustomEvent(INVENTORY_EVENT, { detail: { ...sharedCounts } }),
      )
  }, [])

  const increment = useCallback((materialId: number, delta = 1) => {
    const current = sharedCounts[materialId] || 0
    const nextVal = Math.max(0, Math.floor(current + delta))
    const next = { ...sharedCounts }
    if (nextVal === 0) delete next[materialId]
    else next[materialId] = nextVal
    sharedCounts = next
    writeLocalStorage(sharedCounts)
    notifySubscribers()
    if (typeof window !== "undefined")
      window.dispatchEvent(
        new CustomEvent(INVENTORY_EVENT, { detail: { ...sharedCounts } }),
      )
  }, [])

  const resetAll = useCallback(() => {
    sharedCounts = {}
    writeLocalStorage(sharedCounts)
    notifySubscribers()
    if (typeof window !== "undefined")
      window.dispatchEvent(
        new CustomEvent(INVENTORY_EVENT, { detail: { ...sharedCounts } }),
      )
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
  // Example usage could compute totals within the dialog
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
  }
}

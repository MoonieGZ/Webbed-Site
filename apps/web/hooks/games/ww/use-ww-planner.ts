"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useWwInventory } from "@/hooks/games/ww/use-ww-inventory"
import {
  ASCENSION_TEMPLATES,
  SKILL_TEMPLATES,
  EXP_TEMPLATES,
} from "@/lib/games/ww/templates"

type CharacterAsset = {
  id: number
  name: string
  element: string
  weaponType: string
  rarity: number
  icon: string
  elementIcon: string
}

type WeaponAsset = {
  id: number
  name: string
  type: string
  rarity: number
  icon: string
}

export type CharacterPlan = {
  planId: string
  characterId: number
  characterName: string
  characterIcon: string
  characterElement: string
  characterElementIcon: string
  characterWeaponType: string
  fromAscension: number
  toAscension: number
  fromLevel: number
  toLevel: number
  skillRanges: [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ]
  // Order aligns with UI: index 0 is Level 2 (top), index 1 is Level 1 (bottom)
  inherentSelected: [boolean, boolean]
  statBoostsSelected: [
    [boolean, boolean],
    [boolean, boolean],
    [boolean, boolean],
    [boolean, boolean],
  ]
}

export type WeaponPlan = {
  planId: string
  weaponId: number
  weaponName: string
  weaponType: string
  weaponIcon: string
  weaponRarity: number
  fromAscension: number
  toAscension: number
  fromLevel: number
  toLevel: number
}

export function useWwPlanner() {
  const [loading, setLoading] = useState(false)
  const [characters, setCharacters] = useState<CharacterAsset[]>([])
  const [characterDetailsById, setCharacterDetailsById] = useState<
    Record<number, any>
  >({})
  const [weapons, setWeapons] = useState<WeaponAsset[]>([])
  const [weaponDetailsById, setWeaponDetailsById] = useState<
    Record<number, any>
  >({})
  const [plans, setPlans] = useState<CharacterPlan[]>([])
  const [weaponPlans, setWeaponPlans] = useState<WeaponPlan[]>([])
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null)
  const [editingWeaponPlanIndex, setEditingWeaponPlanIndex] = useState<
    number | null
  >(null)
  const [accountId, setAccountId] = useState<number>(0)
  const hasHydratedFromStorage = useRef<boolean>(false)

  // UI state
  const [showAddCharacter, setShowAddCharacter] = useState(false)
  const [showCharacterConfig, setShowCharacterConfig] = useState(false)
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterAsset | null>(null)
  const [showAddWeapon, setShowAddWeapon] = useState(false)
  const [showWeaponConfig, setShowWeaponConfig] = useState(false)
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponAsset | null>(null)
  const [search, setSearch] = useState("")
  const [showReorderPlans, setShowReorderPlans] = useState(false)
  // Mixed ordering: display order of mixed character/weapon plans
  const [displayOrder, setDisplayOrder] = useState<string[]>([])
  // Mixed ordering: displayOrder as array of ids: "C:<planId>" or "W:<planId>"
  // NOTE: declared later near mixed ordering helpers

  // Temp config state for character dialog
  const [fromAscension, setFromAscension] = useState(0)
  const [toAscension, setToAscension] = useState(6)
  const [fromLevel, setFromLevel] = useState(1)
  const [toLevel, setToLevel] = useState(90)
  const [skillRanges, setSkillRanges] = useState<
    [
      [number, number],
      [number, number],
      [number, number],
      [number, number],
      [number, number],
    ]
  >([
    [1, 10],
    [1, 10],
    [1, 10],
    [1, 10],
    [1, 10],
  ])
  const [inherentLevels, setInherentLevels] = useState<[boolean, boolean]>([
    false,
    false,
  ])
  const [statBoosts, setStatBoosts] = useState<
    [
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
    ]
  >([
    [true, true],
    [true, true],
    [true, true],
    [true, true],
  ])
  // Weapon temp config
  const [wFromAscension, setWFromAscension] = useState(0)
  const [wToAscension, setWToAscension] = useState(6)
  const [wFromLevel, setWFromLevel] = useState(1)
  const [wToLevel, setWToLevel] = useState(90)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/games/ww/assets", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as any
      const chars = (data.characters || []) as Array<
        CharacterAsset & {
          groups?: Record<
            string,
            Array<{
              groupId: number
              groupName: string
              materials: Array<{ id: number; name: string; rarity: number }>
            }>
          >
          materials?: Record<
            string,
            { id: number; name: string; rarity: number }
          >
        }
      >
      setCharacters(
        chars.map((c) => ({
          id: c.id,
          name: c.name,
          element: c.element,
          weaponType: (c as any).weaponType,
          rarity: c.rarity,
          icon: c.icon,
          elementIcon: c.elementIcon,
        })),
      )
      const map: Record<number, any> = {}
      for (const c of chars) {
        map[c.id] = c
      }
      setCharacterDetailsById(map)
      // Weapons
      const wb: WeaponAsset[] = []
      const wDetails: Record<number, any> = {}
      const byType = (data.weaponsByType || {}) as Record<string, any[]>
      for (const [type, list] of Object.entries(byType)) {
        for (const w of list as any[]) {
          wb.push({
            id: w.id,
            name: w.name,
            type,
            rarity: w.rarity,
            icon: w.icon,
          })
          wDetails[w.id] = w
        }
      }
      setWeapons(wb)
      setWeaponDetailsById(wDetails)
    } catch {
      // noop for now
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  // ---- LocalStorage persistence (compact schema) ----
  type StoredPlanV1 = [
    number, // characterId
    number, // fromAscension
    number, // toAscension
    number, // fromLevel
    number, // toLevel
    number, // bitmask for inherent + stat nodes
    [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ], // flattened skill ranges (r0f,r0t,...,r4f,r4t)
  ]
  type StoredWeaponPlanV1 = [
    number, // weaponId
    number, // fromAscension
    number, // toAscension
    number, // fromLevel
    number, // toLevel
  ]

  const STORAGE_PREFIX = "ww:planner:v1"
  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}:acct:${accountId}`,
    [accountId],
  )

  const packBits = (
    inherent: [boolean, boolean],
    statBoostsSel: [
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
    ],
  ): number => {
    let mask = 0
    // inherentSelected is [L2, L1]
    if (inherent?.[1]) mask |= 1 << 0 // L1
    if (inherent?.[0]) mask |= 1 << 1 // L2
    for (let i = 0; i < 4; i++) {
      const pair = statBoostsSel?.[i] || [false, false]
      const base = 2 + i * 2
      if (pair[1]) mask |= 1 << base // L1
      if (pair[0]) mask |= 1 << (base + 1) // L2
    }
    return mask
  }

  const unpackBits = (
    mask: number,
  ): {
    inherent: [boolean, boolean]
    statBoosts: [
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
    ]
  } => {
    const inherent: [boolean, boolean] = [false, false]
    // order [L2, L1]
    inherent[1] = Boolean(mask & (1 << 0)) // L1
    inherent[0] = Boolean(mask & (1 << 1)) // L2
    const statBoosts: [
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
    ] = [
      [false, false],
      [false, false],
      [false, false],
      [false, false],
    ]
    for (let i = 0; i < 4; i++) {
      const base = 2 + i * 2
      const L1 = Boolean(mask & (1 << base))
      const L2 = Boolean(mask & (1 << (base + 1)))
      statBoosts[i] = [L2, L1]
    }
    return { inherent, statBoosts }
  }

  const packPlan = (p: CharacterPlan): StoredPlanV1 => {
    return [
      p.characterId,
      p.fromAscension,
      p.toAscension,
      p.fromLevel,
      p.toLevel,
      packBits(p.inherentSelected, p.statBoostsSelected),
      [
        p.skillRanges[0][0],
        p.skillRanges[0][1],
        p.skillRanges[1][0],
        p.skillRanges[1][1],
        p.skillRanges[2][0],
        p.skillRanges[2][1],
        p.skillRanges[3][0],
        p.skillRanges[3][1],
        p.skillRanges[4][0],
        p.skillRanges[4][1],
      ],
    ]
  }

  const unpackPlan = (sp: StoredPlanV1): CharacterPlan => {
    const [cid, fa, ta, fl, tl, bits, flat] = sp
    const char = characters.find((c) => c.id === cid) || null
    const { inherent, statBoosts } = unpackBits(bits)
    return {
      planId:
        typeof crypto !== "undefined" && (crypto as any)?.randomUUID
          ? (crypto as any).randomUUID()
          : `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      characterId: cid,
      characterName: char?.name || String(cid),
      characterIcon: char?.icon || "/games/ww/characters/Unknown.webp",
      characterElement: char?.element || "Unknown",
      characterElementIcon:
        char?.elementIcon || "/games/ww/elements/Unknown.webp",
      characterWeaponType: char?.weaponType || "",
      fromAscension: fa,
      toAscension: ta,
      fromLevel: fl,
      toLevel: tl,
      skillRanges: [
        [flat[0] ?? 1, flat[1] ?? 10],
        [flat[2] ?? 1, flat[3] ?? 10],
        [flat[4] ?? 1, flat[5] ?? 10],
        [flat[6] ?? 1, flat[7] ?? 10],
        [flat[8] ?? 1, flat[9] ?? 10],
      ],
      inherentSelected: inherent,
      statBoostsSelected: statBoosts,
    }
  }

  const packWeaponPlan = (p: WeaponPlan): StoredWeaponPlanV1 => {
    return [p.weaponId, p.fromAscension, p.toAscension, p.fromLevel, p.toLevel]
  }
  const unpackWeaponPlan = (sw: StoredWeaponPlanV1): WeaponPlan => {
    const [wid, fa, ta, fl, tl] = sw
    const w = weapons.find((x) => x.id === wid) || null
    return {
      planId:
        typeof crypto !== "undefined" && (crypto as any)?.randomUUID
          ? (crypto as any).randomUUID()
          : `wplan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      weaponId: wid,
      weaponName: w?.name || String(wid),
      weaponType: w?.type || "",
      weaponIcon: w?.icon || "/games/ww/weapons/Unknown.webp",
      weaponRarity: w?.rarity || 4,
      fromAscension: fa,
      toAscension: ta,
      fromLevel: fl,
      toLevel: tl,
    }
  }

  // Load from storage after assets are available and only once per account
  useEffect(() => {
    if (hasHydratedFromStorage.current) return
    if (!characters || characters.length === 0) return
    if (!weapons || weapons.length === 0) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          v?: number
          p?: StoredPlanV1[]
          w?: StoredWeaponPlanV1[]
          o?: string[]
        }
        // Unpack plans first to obtain fresh planIds
        const newPlans = Array.isArray(parsed?.p)
          ? parsed.p.map(unpackPlan)
          : ([] as CharacterPlan[])
        const newWeaponPlans = Array.isArray(parsed?.w)
          ? parsed.w.map(unpackWeaponPlan)
          : ([] as WeaponPlan[])

        setPlans(newPlans)
        setWeaponPlans(newWeaponPlans)

        // Remap saved display order (which references old planIds) to freshly
        // generated planIds while preserving the C/W interleave pattern.
        if (Array.isArray(parsed?.o) && parsed.o.length > 0) {
          const kinds = parsed.o
            .map((id) => String(id).split(":")[0])
            .filter((k) => k === "C" || k === "W")
          const charIds = newPlans.map((p) => `C:${p.planId}`)
          const weapIds = newWeaponPlans.map((p) => `W:${p.planId}`)
          let ci = 0
          let wi = 0
          const remapped: string[] = []
          for (const k of kinds) {
            if (k === "C") {
              if (ci < charIds.length) remapped.push(charIds[ci++])
            } else if (k === "W") {
              if (wi < weapIds.length) remapped.push(weapIds[wi++])
            }
          }
          // Append any remaining items not covered by saved pattern
          while (ci < charIds.length) remapped.push(charIds[ci++])
          while (wi < weapIds.length) remapped.push(weapIds[wi++])

          setDisplayOrder(remapped)
        } else {
          // No saved order; leave displayOrder empty to use fallback ordering
          setDisplayOrder([])
        }
      }
    } catch {}
    hasHydratedFromStorage.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters, weapons, storageKey])

  // Save to storage whenever plans change
  useEffect(() => {
    if (!hasHydratedFromStorage.current) return
    try {
      const packed = plans.map(packPlan)
      const packedW = weaponPlans.map(packWeaponPlan)
      const payload = JSON.stringify({
        v: 1,
        p: packed,
        w: packedW,
        o: displayOrder,
      })
      localStorage.setItem(storageKey, payload)
    } catch {}
  }, [plans, weaponPlans, displayOrder, storageKey])

  const filteredCharacters = useMemo(() => {
    const q = search.trim().toLowerCase()
    const existing = new Set(plans.map((p) => p.characterId))
    const available = characters.filter((c) => !existing.has(c.id))
    if (!q) return available
    return available.filter((c) => c.name.toLowerCase().includes(q))
  }, [characters, search, plans])

  const filteredWeapons = useMemo(() => {
    const q = search.trim().toLowerCase()
    const existing = new Set(weaponPlans.map((p) => p.weaponId))
    const available = weapons.filter((w) => !existing.has(w.id))
    if (!q) return available
    return available.filter((w) => w.name.toLowerCase().includes(q))
  }, [weapons, search, weaponPlans])

  // Mixed ordering state & helpers
  // (remove duplicate later)
  const getOrderedIds = useCallback(() => {
    if (displayOrder.length > 0) return displayOrder
    const chars = plans.map((p) => `C:${p.planId}`)
    const weaps = weaponPlans.map((p) => `W:${p.planId}`)
    return [...chars, ...weaps]
  }, [displayOrder, plans, weaponPlans])
  const orderedItems = useMemo(() => {
    const ids = getOrderedIds()
    const result: Array<{
      id: string
      kind: "CHAR" | "WEAPON"
      name: string
      icon: string
    }> = []
    for (const id of ids) {
      const [k, pid] = id.split(":")
      if (k === "C") {
        const p = plans.find((x) => x.planId === pid)
        if (p)
          result.push({
            id: pid,
            kind: "CHAR",
            name: p.characterName,
            icon: p.characterIcon,
          })
      } else if (k === "W") {
        const p = weaponPlans.find((x) => x.planId === pid)
        if (p)
          result.push({
            id: pid,
            kind: "WEAPON",
            name: p.weaponName,
            icon: p.weaponIcon,
          })
      }
    }
    return result
  }, [plans, weaponPlans, getOrderedIds])

  const openAddCharacter = () => setShowAddCharacter(true)
  const closeAddCharacter = () => setShowAddCharacter(false)
  const openAddWeapon = () => setShowAddWeapon(true)
  const closeAddWeapon = () => setShowAddWeapon(false)

  const openReorderPlans = () => setShowReorderPlans(true)
  const closeReorderPlans = () => setShowReorderPlans(false)

  const chooseCharacter = (c: CharacterAsset) => {
    setSelectedCharacter(c)
    setShowAddCharacter(false)

    setFromAscension(0)
    setToAscension(6)
    setFromLevel(1)
    setToLevel(90)
    setSkillRanges([
      [1, 10],
      [1, 10],
      [1, 10],
      [1, 10],
      [1, 10],
    ])
    setInherentLevels([true, true])
    setStatBoosts([
      [true, true],
      [true, true],
      [true, true],
      [true, true],
    ])
    setShowCharacterConfig(true)
  }

  const chooseWeapon = (w: WeaponAsset) => {
    setSelectedWeapon(w)
    setShowAddWeapon(false)
    setWFromAscension(0)
    setWToAscension(6)
    setWFromLevel(1)
    setWToLevel(90)
    setShowWeaponConfig(true)
  }

  const cancelCharacterConfig = () => {
    setShowCharacterConfig(false)
    setSelectedCharacter(null)
    setEditingPlanIndex(null)
  }
  const cancelWeaponConfig = () => {
    setShowWeaponConfig(false)
    setSelectedWeapon(null)
    setEditingWeaponPlanIndex(null)
  }

  const confirmCharacterPlan = () => {
    if (!selectedCharacter) return
    const plan: CharacterPlan = {
      planId:
        editingPlanIndex != null && editingPlanIndex >= 0
          ? plans[editingPlanIndex]?.planId ||
            (typeof crypto !== "undefined" && (crypto as any)?.randomUUID
              ? (crypto as any).randomUUID()
              : `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
          : typeof crypto !== "undefined" && (crypto as any)?.randomUUID
            ? (crypto as any).randomUUID()
            : `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      characterId: selectedCharacter.id,
      characterName: selectedCharacter.name,
      characterIcon: selectedCharacter.icon,
      characterElement: selectedCharacter.element,
      characterElementIcon: selectedCharacter.elementIcon,
      characterWeaponType: selectedCharacter.weaponType,
      fromAscension,
      toAscension,
      fromLevel,
      toLevel,
      skillRanges,
      inherentSelected: inherentLevels, // [L2, L1]
      statBoostsSelected: statBoosts, // 4 pairs, each [L2, L1]
    }
    setPlans((prev) => {
      if (
        editingPlanIndex !== null &&
        editingPlanIndex >= 0 &&
        editingPlanIndex < prev.length
      ) {
        return prev.map((p, i) => (i === editingPlanIndex ? plan : p))
      }
      return [...prev, plan]
    })
    // Append to mixed display order if already established
    setDisplayOrder((prev) => {
      if (!prev || prev.length === 0) return prev
      const id = `C:${plan.planId}`
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
    setShowCharacterConfig(false)
    setSelectedCharacter(null)
    setEditingPlanIndex(null)
  }

  const confirmWeaponPlan = () => {
    if (!selectedWeapon) return
    const plan: WeaponPlan = {
      planId:
        editingWeaponPlanIndex != null && editingWeaponPlanIndex >= 0
          ? weaponPlans[editingWeaponPlanIndex]?.planId ||
            (typeof crypto !== "undefined" && (crypto as any)?.randomUUID
              ? (crypto as any).randomUUID()
              : `wplan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
          : typeof crypto !== "undefined" && (crypto as any)?.randomUUID
            ? (crypto as any).randomUUID()
            : `wplan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      weaponId: selectedWeapon.id,
      weaponName: selectedWeapon.name,
      weaponType: selectedWeapon.type,
      weaponIcon: selectedWeapon.icon,
      weaponRarity: selectedWeapon.rarity,
      fromAscension: wFromAscension,
      toAscension: wToAscension,
      fromLevel: wFromLevel,
      toLevel: wToLevel,
    }
    setWeaponPlans((prev) => {
      if (
        editingWeaponPlanIndex !== null &&
        editingWeaponPlanIndex >= 0 &&
        editingWeaponPlanIndex < prev.length
      ) {
        return prev.map((p, i) => (i === editingWeaponPlanIndex ? plan : p))
      }
      return [...prev, plan]
    })
    // Append to mixed display order if already established
    setDisplayOrder((prev) => {
      if (!prev || prev.length === 0) return prev
      const id = `W:${plan.planId}`
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
    setShowWeaponConfig(false)
    setSelectedWeapon(null)
    setEditingWeaponPlanIndex(null)
  }

  const removePlan = (index: number) => {
    setPlans((prev) => prev.filter((_, i) => i !== index))
  }
  const removeWeaponPlan = (index: number) => {
    setWeaponPlans((prev) => prev.filter((_, i) => i !== index))
  }

  const applyPlanOrder = (order: number[]) => {
    // Reorder display order only (mixed C/W).
    setDisplayOrder((prev) => {
      const curr = getOrderedIds()
      if (order.length !== curr.length) return prev
      const nextIds = order.map((i) => curr[i])
      return nextIds
    })
    setShowReorderPlans(false)
  }

  const beginEditPlan = (index: number) => {
    const plan = plans[index]
    if (!plan) return
    // Find the character asset from loaded characters; fallback to plan data
    const char =
      characters.find((c) => c.id === plan.characterId) ||
      ({
        id: plan.characterId,
        name: plan.characterName,
        element: plan.characterElement,
        weaponType: plan.characterWeaponType,
        rarity: 0,
        icon: plan.characterIcon,
        elementIcon: plan.characterElementIcon,
      } as CharacterAsset)

    setSelectedCharacter(char)
    setFromAscension(plan.fromAscension)
    setToAscension(plan.toAscension)
    setFromLevel(plan.fromLevel)
    setToLevel(plan.toLevel)
    setSkillRanges(plan.skillRanges)
    setInherentLevels(plan.inherentSelected)
    setStatBoosts(plan.statBoostsSelected)
    setEditingPlanIndex(index)
    setShowCharacterConfig(true)
  }

  const beginEditWeaponPlan = (index: number) => {
    const plan = weaponPlans[index]
    if (!plan) return
    const w = weapons.find((x) => x.id === plan.weaponId) || null
    setSelectedWeapon(
      w || {
        id: plan.weaponId,
        name: plan.weaponName,
        type: plan.weaponType,
        rarity: plan.weaponRarity,
        icon: plan.weaponIcon,
      },
    )
    setWFromAscension(plan.fromAscension)
    setWToAscension(plan.toAscension)
    setWFromLevel(plan.fromLevel)
    setWToLevel(plan.toLevel)
    setEditingWeaponPlanIndex(index)
    setShowWeaponConfig(true)
  }

  // Compute total required materials across all plans
  const totalResources = useMemo(() => {
    const items: Record<string, number> = {}
    let credits = 0

    const addItem = (
      type: string,
      name: string,
      qty: number,
      _rarity?: number,
    ) => {
      if (!qty) return
      const key = `${type}:${name}`
      items[key] = (items[key] ?? 0) + qty
    }

    const pickGroupMaterials = (
      detail: any,
      type: string,
    ): Array<{ name: string; rarity: number }> | null => {
      const groups = detail?.groups?.[type] as
        | Array<{
            materials: Array<{ name: string; rarity: number }>
          }>
        | undefined
      if (!groups || groups.length === 0) return null
      const mats = [...groups[0].materials].sort(
        (a, b) => (a.rarity ?? 0) - (b.rarity ?? 0),
      )
      return mats.map((m) => ({ name: m.name, rarity: m.rarity }))
    }

    for (const plan of plans) {
      const detail = characterDetailsById[plan.characterId]
      if (!detail) continue

      // Ascension steps
      for (let a = plan.fromAscension + 1; a <= plan.toAscension; a++) {
        const step = ASCENSION_TEMPLATES.CHARACTER.find(
          (t) => t.ascension === a,
        )
        if (!step) continue

        // enemy_drop tiered
        const enemyMats = pickGroupMaterials(detail, "enemy_drop")
        if (enemyMats && Array.isArray(step.enemy_drop)) {
          for (
            let i = 0;
            i < step.enemy_drop.length && i < enemyMats.length;
            i++
          ) {
            const qty = step.enemy_drop[i]
            if (qty) addItem("enemy_drop", enemyMats[i].name, qty)
          }
        } else if (Array.isArray(step.enemy_drop)) {
          const tiers = step.enemy_drop as number[]
          for (let i = 0; i < tiers.length; i++) {
            const qty = tiers[i] || 0
            if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
          }
        }
        const bossMat = detail?.materials?.boss_drop
        if (bossMat && step.boss_drop)
          addItem("boss_drop", bossMat.name, step.boss_drop)

        // collectible single
        const collMat = detail?.materials?.collectible
        if (collMat && step.collectible)
          addItem("collectible", collMat.name, step.collectible)
        else if (!collMat && step.collectible)
          addItem("collectible", "Unknown", step.collectible)

        // count credits separately for totals; breakdown adds as Shell Credit later
        credits += step.credits || 0
      }

      // Character leveling credits (milestones between fromLevel -> toLevel)
      for (const row of EXP_TEMPLATES.CHARACTER) {
        if (row.level > plan.fromLevel && row.level <= plan.toLevel) {
          credits += row.credits || 0
        }
      }

      // Skills leveling
      for (let si = 0; si < plan.skillRanges.length; si++) {
        const [from, to] = plan.skillRanges[si]
        for (let lvl = Math.max(2, from + 1); lvl <= to; lvl++) {
          const step = SKILL_TEMPLATES.SKILL.find((t) => t.level === lvl)
          if (!step) continue

          // talent_upgrade group
          const talentMats = pickGroupMaterials(detail, "talent_upgrade")
          if (talentMats && Array.isArray(step.talent_upgrade)) {
            for (
              let i = 0;
              i < step.talent_upgrade.length && i < talentMats.length;
              i++
            ) {
              const qty = step.talent_upgrade[i]
              if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
            }
          } else if (Array.isArray(step.talent_upgrade)) {
            const tiers = step.talent_upgrade as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
            }
          }
          // enemy_drop for skills
          const enemyMats = pickGroupMaterials(detail, "enemy_drop")
          if (enemyMats && Array.isArray(step.enemy_drop)) {
            for (
              let i = 0;
              i < step.enemy_drop.length && i < enemyMats.length;
              i++
            ) {
              const qty = step.enemy_drop[i]
              if (qty) addItem("enemy_drop", enemyMats[i].name, qty)
            }
          } else if (Array.isArray(step.enemy_drop)) {
            const tiers = step.enemy_drop as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
            }
          }

          // weekly_boss single
          const weekly = detail?.materials?.weekly_boss
          if (weekly && step.weekly_boss)
            addItem("weekly_boss", weekly.name, step.weekly_boss)

          credits += step.credits || 0
        }
      }

      // Inherent skills: plan.inherentSelected is [L2, L1]
      if (plan.inherentSelected?.[1]) {
        const t = SKILL_TEMPLATES.INHERENT.find((x) => x.level === 1)
        if (t) {
          const talentMats = pickGroupMaterials(detail, "talent_upgrade")
          const enemyMats = pickGroupMaterials(detail, "enemy_drop")
          if (talentMats && Array.isArray(t.talent_upgrade)) {
            for (
              let i = 0;
              i < t.talent_upgrade.length && i < talentMats.length;
              i++
            ) {
              const qty = t.talent_upgrade[i]
              if (qty)
                addItem(
                  "talent_upgrade",
                  talentMats[i].name,
                  qty,
                  talentMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.talent_upgrade)) {
            const tiers = t.talent_upgrade as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
            }
          }
          if (enemyMats && Array.isArray(t.enemy_drop)) {
            for (
              let i = 0;
              i < t.enemy_drop.length && i < enemyMats.length;
              i++
            ) {
              const qty = t.enemy_drop[i]
              if (qty)
                addItem(
                  "enemy_drop",
                  enemyMats[i].name,
                  qty,
                  enemyMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.enemy_drop)) {
            const tiers = t.enemy_drop as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
            }
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && t.weekly_boss)
            addItem("weekly_boss", weekly.name, t.weekly_boss)
          credits += t.credits || 0
        }
      }
      if (plan.inherentSelected?.[0]) {
        const t = SKILL_TEMPLATES.INHERENT.find((x) => x.level === 2)
        if (t) {
          const talentMats = pickGroupMaterials(detail, "talent_upgrade")
          const enemyMats = pickGroupMaterials(detail, "enemy_drop")
          if (talentMats && Array.isArray(t.talent_upgrade)) {
            for (
              let i = 0;
              i < t.talent_upgrade.length && i < talentMats.length;
              i++
            ) {
              const qty = t.talent_upgrade[i]
              if (qty)
                addItem(
                  "talent_upgrade",
                  talentMats[i].name,
                  qty,
                  talentMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.talent_upgrade)) {
            const tiers = t.talent_upgrade as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
            }
          }
          if (enemyMats && Array.isArray(t.enemy_drop)) {
            for (
              let i = 0;
              i < t.enemy_drop.length && i < enemyMats.length;
              i++
            ) {
              const qty = t.enemy_drop[i]
              if (qty)
                addItem(
                  "enemy_drop",
                  enemyMats[i].name,
                  qty,
                  enemyMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.enemy_drop)) {
            const tiers = t.enemy_drop as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
            }
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && t.weekly_boss)
            addItem("weekly_boss", weekly.name, t.weekly_boss)
          credits += t.credits || 0
        }
      }

      // Stat boosts: 4 rows, each [L2, L1]
      for (let row = 0; row < (plan.statBoostsSelected?.length || 0); row++) {
        const pair = plan.statBoostsSelected[row]
        if (!pair) continue
        if (pair[1]) {
          const t = SKILL_TEMPLATES.STAT_NODE.find((x) => x.level === 1)
          if (t) {
            const talentMats = pickGroupMaterials(detail, "talent_upgrade")
            const enemyMats = pickGroupMaterials(detail, "enemy_drop")
            if (talentMats && Array.isArray(t.talent_upgrade)) {
              for (
                let i = 0;
                i < t.talent_upgrade.length && i < talentMats.length;
                i++
              ) {
                const qty = t.talent_upgrade[i]
                if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
              }
            } else if (Array.isArray(t.talent_upgrade)) {
              const tiers = t.talent_upgrade as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
              }
            }
            if (enemyMats && Array.isArray(t.enemy_drop)) {
              for (
                let i = 0;
                i < t.enemy_drop.length && i < enemyMats.length;
                i++
              ) {
                const qty = t.enemy_drop[i]
                if (qty) addItem("enemy_drop", enemyMats[i].name, qty)
              }
            } else if (Array.isArray(t.enemy_drop)) {
              const tiers = t.enemy_drop as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
              }
            }
            const weekly = detail?.materials?.weekly_boss
            if (weekly && t.weekly_boss)
              addItem("weekly_boss", weekly.name, t.weekly_boss)
            credits += t.credits || 0
          }
        }
        if (pair[0]) {
          const t = SKILL_TEMPLATES.STAT_NODE.find((x) => x.level === 2)
          if (t) {
            const talentMats = pickGroupMaterials(detail, "talent_upgrade")
            const enemyMats = pickGroupMaterials(detail, "enemy_drop")
            if (talentMats && Array.isArray(t.talent_upgrade)) {
              for (
                let i = 0;
                i < t.talent_upgrade.length && i < talentMats.length;
                i++
              ) {
                const qty = t.talent_upgrade[i]
                if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
              }
            } else if (Array.isArray(t.talent_upgrade)) {
              const tiers = t.talent_upgrade as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
              }
            }
            if (enemyMats && Array.isArray(t.enemy_drop)) {
              for (
                let i = 0;
                i < t.enemy_drop.length && i < enemyMats.length;
                i++
              ) {
                const qty = t.enemy_drop[i]
                if (qty) addItem("enemy_drop", enemyMats[i].name, qty)
              }
            } else if (Array.isArray(t.enemy_drop)) {
              const tiers = t.enemy_drop as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
              }
            }
            const weekly = detail?.materials?.weekly_boss
            if (weekly && t.weekly_boss)
              addItem("weekly_boss", weekly.name, t.weekly_boss)
            credits += t.credits || 0
          }
        }
      }
    }

    const totalItemsCount = Object.values(items).reduce((a, b) => a + b, 0)
    return { items: totalItemsCount, credits }
  }, [plans, characterDetailsById])

  // Weapon breakdown helper
  const getWeaponPlanBreakdown = useCallback(
    (plan: WeaponPlan) => {
      const detail = weaponDetailsById[plan.weaponId]
      if (!detail)
        return {
          credits: 0,
          materials: [] as Array<{ type: string; name: string; qty: number }>,
        }
      const items: Record<
        string,
        { type: string; name: string; qty: number; rarity?: number }
      > = {}
      let credits = 0
      const addItem = (
        type: string,
        name: string,
        qty: number,
        rarity?: number,
      ) => {
        if (!qty) return
        const key = `${type}:${name}:${rarity ?? 0}`
        items[key] = items[key]
          ? { ...items[key], qty: items[key].qty + qty }
          : { type, name, qty, rarity }
      }
      const pickGroupMaterials = (
        detail: any,
        type: string,
      ): Array<{ name: string; rarity: number }> | null => {
        const groups = detail?.groups?.[type] as Array<
          { materials: Array<{ name: string; rarity: number }> } | undefined
        >
        if (!groups || groups.length === 0) return null
        const mats = [...(groups[0]?.materials ?? [])].sort(
          (a, b) => (a.rarity ?? 0) - (b.rarity ?? 0),
        )
        return mats.map((m) => ({ name: m.name, rarity: m.rarity }))
      }
      const ascT =
        plan.weaponRarity >= 5
          ? ASCENSION_TEMPLATES.WEAPON_5
          : ASCENSION_TEMPLATES.WEAPON_4
      for (let a = plan.fromAscension + 1; a <= plan.toAscension; a++) {
        const step = ascT.find((t) => t.ascension === a)
        if (!step) continue
        const talentMats = pickGroupMaterials(detail, "talent_upgrade")
        if (talentMats && Array.isArray(step.talent_upgrade)) {
          for (
            let i = 0;
            i < step.talent_upgrade.length && i < talentMats.length;
            i++
          ) {
            const qty = (step as any).talent_upgrade?.[i]
            if (qty)
              addItem(
                "talent_upgrade",
                talentMats[i].name,
                qty,
                talentMats[i].rarity,
              )
          }
        }
        const enemyMats = pickGroupMaterials(detail, "enemy_drop")
        if (enemyMats && Array.isArray(step.enemy_drop)) {
          for (
            let i = 0;
            i < step.enemy_drop.length && i < enemyMats.length;
            i++
          ) {
            const qty = (step as any).enemy_drop?.[i]
            if (qty)
              addItem("enemy_drop", enemyMats[i].name, qty, enemyMats[i].rarity)
          }
        }
        if (step.credits) addItem("other", "Shell Credit", step.credits, 2)
        credits += step.credits || 0
      }
      // EXP & credits milestones for weapons
      const expT =
        plan.weaponRarity >= 5
          ? EXP_TEMPLATES.WEAPON_5_STAR
          : EXP_TEMPLATES.WEAPON_4_STAR
      let requiredExp = 0
      for (const row of expT) {
        if (row.level > plan.fromLevel && row.level <= plan.toLevel) {
          requiredExp += row.exp || 0
          if (row.credits) addItem("other", "Shell Credit", row.credits, 2)
          credits += row.credits || 0
        }
      }
      if (requiredExp > 0) addItem("exp", "Premium Energy Core", requiredExp, 4)
      const entries = Object.values(items) as Array<{
        type: string
        name: string
        qty: number
        rarity?: number
      }>
      const enemyEntries = entries
        .filter((e) => e.type === "enemy_drop")
        .sort((a, b) => (a.rarity ?? 0) - (b.rarity ?? 0))
      const talentEntries = entries
        .filter((e) => e.type === "talent_upgrade")
        .sort((a, b) => (a.rarity ?? 0) - (b.rarity ?? 0))
      const expEntries = entries.filter((e) => e.type === "exp")
      const creditEntries = entries.filter(
        (e) => e.type === "other" && e.name === "Shell Credit",
      )
      const ordered = [
        ...enemyEntries,
        ...talentEntries,
        ...expEntries,
        ...creditEntries,
      ]
      return { credits, materials: ordered }
    },
    [weaponDetailsById],
  )

  // Per-plan breakdown helper
  const getPlanBreakdown = useCallback(
    (plan: CharacterPlan) => {
      const detail = characterDetailsById[plan.characterId]
      if (!detail)
        return {
          credits: 0,
          materials: [] as Array<{ type: string; name: string; qty: number }>,
        }

      const items: Record<
        string,
        { type: string; name: string; qty: number; rarity?: number }
      > = {}
      let credits = 0

      const addItem = (
        type: string,
        name: string,
        qty: number,
        rarity?: number,
      ) => {
        if (!qty) return
        const key = `${type}:${name}:${rarity ?? 0}`
        items[key] = items[key]
          ? { ...items[key], qty: items[key].qty + qty }
          : { type, name, qty, rarity }
      }

      const pickGroupMaterials = (
        detail: any,
        type: string,
      ): Array<{ name: string; rarity: number }> | null => {
        const groups = detail?.groups?.[type] as Array<
          { materials: Array<{ name: string; rarity: number }> } | undefined
        >
        if (!groups || groups.length === 0) return null
        const mats = [...(groups[0]?.materials ?? [])].sort(
          (a, b) => (a.rarity ?? 0) - (b.rarity ?? 0),
        )
        return mats.map((m) => ({ name: m.name, rarity: m.rarity }))
      }

      // Ascension
      for (let a = plan.fromAscension + 1; a <= plan.toAscension; a++) {
        const step = ASCENSION_TEMPLATES.CHARACTER.find(
          (t) => t.ascension === a,
        )
        if (!step) continue
        const enemyMats = pickGroupMaterials(detail, "enemy_drop")
        if (enemyMats && Array.isArray(step.enemy_drop)) {
          for (
            let i = 0;
            i < step.enemy_drop.length && i < enemyMats.length;
            i++
          ) {
            const qty = step.enemy_drop[i]
            if (qty)
              addItem("enemy_drop", enemyMats[i].name, qty, enemyMats[i].rarity)
          }
        } else if (Array.isArray(step.enemy_drop)) {
          const tiers = step.enemy_drop as number[]
          for (let i = 0; i < tiers.length; i++) {
            const qty = tiers[i] || 0
            if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
          }
        }
        const bossMat = detail?.materials?.boss_drop
        if (bossMat && step.boss_drop)
          addItem("boss_drop", bossMat.name, step.boss_drop, 3)
        const collMat = detail?.materials?.collectible
        if (collMat && step.collectible)
          addItem("collectible", collMat.name, step.collectible, collMat.rarity)
        else if (!collMat && step.collectible)
          addItem("collectible", "Unknown", step.collectible)
        if (!bossMat && step.boss_drop)
          addItem("boss_drop", "Unknown", step.boss_drop, 3)
        if (step.credits) addItem("other", "Shell Credit", step.credits, 2)
        credits += step.credits || 0
      }

      // Character leveling EXP & credits (milestones between fromLevel -> toLevel)
      let requiredExp = 0
      for (const row of EXP_TEMPLATES.CHARACTER) {
        if (row.level > plan.fromLevel && row.level <= plan.toLevel) {
          requiredExp += row.exp || 0
          if (row.credits) addItem("other", "Shell Credit", row.credits, 2)
          credits += row.credits || 0
        }
      }
      if (requiredExp > 0) {
        // Use premium item representation; qty holds EXP total, not item count
        addItem("exp", "Premium Resonance Potion", requiredExp, 4)
      }

      // Skills
      for (let si = 0; si < plan.skillRanges.length; si++) {
        const [from, to] = plan.skillRanges[si]
        for (let lvl = Math.max(2, from + 1); lvl <= to; lvl++) {
          const step = SKILL_TEMPLATES.SKILL.find((t) => t.level === lvl)
          if (!step) continue
          const talentMats = pickGroupMaterials(detail, "talent_upgrade")
          if (talentMats && Array.isArray(step.talent_upgrade)) {
            for (
              let i = 0;
              i < step.talent_upgrade.length && i < talentMats.length;
              i++
            ) {
              const qty = step.talent_upgrade[i]
              if (qty)
                addItem(
                  "talent_upgrade",
                  talentMats[i].name,
                  qty,
                  talentMats[i].rarity,
                )
            }
          } else if (Array.isArray(step.talent_upgrade)) {
            const tiers = step.talent_upgrade as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
            }
          }
          const enemyMats = pickGroupMaterials(detail, "enemy_drop")
          if (enemyMats && Array.isArray(step.enemy_drop)) {
            for (
              let i = 0;
              i < step.enemy_drop.length && i < enemyMats.length;
              i++
            ) {
              const qty = step.enemy_drop[i]
              if (qty)
                addItem(
                  "enemy_drop",
                  enemyMats[i].name,
                  qty,
                  enemyMats[i].rarity,
                )
            }
          } else if (Array.isArray(step.enemy_drop)) {
            const tiers = step.enemy_drop as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
            }
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && step.weekly_boss)
            addItem("weekly_boss", weekly.name, step.weekly_boss, 3)
          else if (step.weekly_boss)
            addItem("weekly_boss", "Unknown", step.weekly_boss, 3)
          if (step.credits) addItem("other", "Shell Credit", step.credits, 2)
          credits += step.credits || 0
        }
      }

      // Inherent
      if (plan.inherentSelected?.[1]) {
        const t = SKILL_TEMPLATES.INHERENT.find((x) => x.level === 1)
        if (t) {
          const talentMats = pickGroupMaterials(detail, "talent_upgrade")
          const enemyMats = pickGroupMaterials(detail, "enemy_drop")
          if (talentMats && Array.isArray(t.talent_upgrade)) {
            for (
              let i = 0;
              i < t.talent_upgrade.length && i < talentMats.length;
              i++
            ) {
              const qty = t.talent_upgrade[i]
              if (qty)
                addItem(
                  "talent_upgrade",
                  talentMats[i].name,
                  qty,
                  talentMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.talent_upgrade)) {
            const tiers = t.talent_upgrade as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
            }
          }
          if (enemyMats && Array.isArray(t.enemy_drop)) {
            for (
              let i = 0;
              i < t.enemy_drop.length && i < enemyMats.length;
              i++
            ) {
              const qty = t.enemy_drop[i]
              if (qty)
                addItem(
                  "enemy_drop",
                  enemyMats[i].name,
                  qty,
                  enemyMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.enemy_drop)) {
            const tiers = t.enemy_drop as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
            }
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && t.weekly_boss)
            addItem("weekly_boss", weekly.name, t.weekly_boss, 3)
          else if (t.weekly_boss)
            addItem("weekly_boss", "Unknown", t.weekly_boss, 3)
          if (t.credits) addItem("other", "Shell Credit", t.credits, 2)
          credits += t.credits || 0
        }
      }
      if (plan.inherentSelected?.[0]) {
        const t = SKILL_TEMPLATES.INHERENT.find((x) => x.level === 2)
        if (t) {
          const talentMats = pickGroupMaterials(detail, "talent_upgrade")
          const enemyMats = pickGroupMaterials(detail, "enemy_drop")
          if (talentMats && Array.isArray(t.talent_upgrade)) {
            for (
              let i = 0;
              i < t.talent_upgrade.length && i < talentMats.length;
              i++
            ) {
              const qty = t.talent_upgrade[i]
              if (qty)
                addItem(
                  "talent_upgrade",
                  talentMats[i].name,
                  qty,
                  talentMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.talent_upgrade)) {
            const tiers = t.talent_upgrade as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
            }
          }
          if (enemyMats && Array.isArray(t.enemy_drop)) {
            for (
              let i = 0;
              i < t.enemy_drop.length && i < enemyMats.length;
              i++
            ) {
              const qty = t.enemy_drop[i]
              if (qty)
                addItem(
                  "enemy_drop",
                  enemyMats[i].name,
                  qty,
                  enemyMats[i].rarity,
                )
            }
          } else if (Array.isArray(t.enemy_drop)) {
            const tiers = t.enemy_drop as number[]
            for (let i = 0; i < tiers.length; i++) {
              const qty = tiers[i] || 0
              if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
            }
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && t.weekly_boss)
            addItem("weekly_boss", weekly.name, t.weekly_boss, 3)
          else if (t.weekly_boss)
            addItem("weekly_boss", "Unknown", t.weekly_boss, 3)
          if (t.credits) addItem("other", "Shell Credit", t.credits, 2)
          credits += t.credits || 0
        }
      }

      // Stat nodes
      for (let row = 0; row < (plan.statBoostsSelected?.length || 0); row++) {
        const pair = plan.statBoostsSelected[row]
        if (!pair) continue
        if (pair[1]) {
          const t = SKILL_TEMPLATES.STAT_NODE.find((x) => x.level === 1)
          if (t) {
            const talentMats = pickGroupMaterials(detail, "talent_upgrade")
            const enemyMats = pickGroupMaterials(detail, "enemy_drop")
            if (talentMats && Array.isArray(t.talent_upgrade)) {
              for (
                let i = 0;
                i < t.talent_upgrade.length && i < talentMats.length;
                i++
              ) {
                const qty = t.talent_upgrade[i]
                if (qty)
                  addItem(
                    "talent_upgrade",
                    talentMats[i].name,
                    qty,
                    talentMats[i].rarity,
                  )
              }
            } else if (Array.isArray(t.talent_upgrade)) {
              const tiers = t.talent_upgrade as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
              }
            }
            if (enemyMats && Array.isArray(t.enemy_drop)) {
              for (
                let i = 0;
                i < t.enemy_drop.length && i < enemyMats.length;
                i++
              ) {
                const qty = t.enemy_drop[i]
                if (qty)
                  addItem(
                    "enemy_drop",
                    enemyMats[i].name,
                    qty,
                    enemyMats[i].rarity,
                  )
              }
            } else if (Array.isArray(t.enemy_drop)) {
              const tiers = t.enemy_drop as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
              }
            }
            const weekly = detail?.materials?.weekly_boss
            if (weekly && t.weekly_boss)
              addItem("weekly_boss", weekly.name, t.weekly_boss, 3)
            if (t.credits) addItem("other", "Shell Credit", t.credits, 2)
            credits += t.credits || 0
          }
        }
        if (pair[0]) {
          const t = SKILL_TEMPLATES.STAT_NODE.find((x) => x.level === 2)
          if (t) {
            const talentMats = pickGroupMaterials(detail, "talent_upgrade")
            const enemyMats = pickGroupMaterials(detail, "enemy_drop")
            if (talentMats && Array.isArray(t.talent_upgrade)) {
              for (
                let i = 0;
                i < t.talent_upgrade.length && i < talentMats.length;
                i++
              ) {
                const qty = t.talent_upgrade[i]
                if (qty)
                  addItem(
                    "talent_upgrade",
                    talentMats[i].name,
                    qty,
                    talentMats[i].rarity,
                  )
              }
            } else if (Array.isArray(t.talent_upgrade)) {
              const tiers = t.talent_upgrade as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("talent_upgrade", "Unknown", qty, i + 1)
              }
            }
            if (enemyMats && Array.isArray(t.enemy_drop)) {
              for (
                let i = 0;
                i < t.enemy_drop.length && i < enemyMats.length;
                i++
              ) {
                const qty = t.enemy_drop[i]
                if (qty)
                  addItem(
                    "enemy_drop",
                    enemyMats[i].name,
                    qty,
                    enemyMats[i].rarity,
                  )
              }
            } else if (Array.isArray(t.enemy_drop)) {
              const tiers = t.enemy_drop as number[]
              for (let i = 0; i < tiers.length; i++) {
                const qty = tiers[i] || 0
                if (qty) addItem("enemy_drop", "Unknown", qty, i + 1)
              }
            }
            const weekly = detail?.materials?.weekly_boss
            if (weekly && t.weekly_boss)
              addItem("weekly_boss", weekly.name, t.weekly_boss, 3)
            else if (t.weekly_boss)
              addItem("weekly_boss", "Unknown", t.weekly_boss, 3)
            if (t.credits) addItem("other", "Shell Credit", t.credits, 2)
            credits += t.credits || 0
          }
        }
      }

      // Order: enemy_drop asc rarity, talent_upgrade asc rarity, boss_drop, collectible, weekly_boss, EXP, then credits
      const entries = Object.values(items) as Array<{
        type: string
        name: string
        qty: number
        rarity?: number
      }>
      const creditsEntry = entries.filter(
        (e) => e.type === "other" && e.name === "Shell Credit",
      )
      const expEntries = entries.filter((e) => e.type === "exp")
      const enemyEntries = entries
        .filter((e) => e.type === "enemy_drop")
        .sort((a, b) => (a.rarity ?? 0) - (b.rarity ?? 0))
      const talentEntries = entries
        .filter((e) => e.type === "talent_upgrade")
        .sort((a, b) => (a.rarity ?? 0) - (b.rarity ?? 0))
      const bossEntries = entries.filter((e) => e.type === "boss_drop")
      const collEntries = entries.filter((e) => e.type === "collectible")
      const weeklyEntries = entries.filter((e) => e.type === "weekly_boss")
      const ordered = [
        ...enemyEntries,
        ...talentEntries,
        ...bossEntries,
        ...collEntries,
        ...weeklyEntries,
        ...expEntries,
        ...creditsEntry,
      ]
      return { credits, materials: ordered }
    },
    [characterDetailsById],
  )

  // Access inventory and taxonomy
  const { getCountFor, getTotalExp, groupsByType } = useWwInventory()

  // Build a snapshot of remaining inventory after allocating prior plans,
  // using crafting (3:1) for grouped types before moving to later plans.
  const getAvailabilityForPlan = useCallback(
    (
      planIndex: number,
    ): {
      availableFor: (type: string, name: string) => number
      availableExp: (category?: "CHARACTER" | "WEAPON") => number
    } => {
      const groupedTypes = ["enemy_drop", "talent_upgrade"] as const

      // Group cache for quick lookup by material name
      type GroupCacheEntry = {
        type: string
        groupId: number
        matsAsc: Array<{ id: number; name: string; rarity?: number }>
        idxByName: Record<string, number>
        counts: number[]
      }
      const groupCache = new Map<string, GroupCacheEntry>()

      const getGroupEntry = (
        type: string,
        name: string,
      ): GroupCacheEntry | null => {
        const typeGroups = (groupsByType as any)?.[type] as
          | Array<{
              groupId: number
              groupName: string
              materials: Array<{ id: number; name: string; rarity?: number }>
            }>
          | undefined
        if (!typeGroups || typeGroups.length === 0) return null
        for (const g of typeGroups) {
          const found = g.materials.find((m) => m.name === name)
          if (!found) continue
          const key = `${type}:${g.groupId}`
          let entry = groupCache.get(key)
          if (!entry) {
            const matsAsc = [...g.materials].sort(
              (a, b) => (a.rarity || 0) - (b.rarity || 0),
            )
            const idxByName: Record<string, number> = {}
            matsAsc.forEach((m, i) => {
              idxByName[m.name] = i
            })
            const counts = matsAsc.map((m) => getCountFor(type, m.name))
            entry = { type, groupId: g.groupId, matsAsc, idxByName, counts }
            groupCache.set(key, entry)
          }
          return entry
        }
        return null
      }

      // Non-grouped remaining counts by type+name
      const remainingMap = new Map<string, number>()
      const getRemaining = (type: string, name: string): number => {
        const k = `${type}:${name}`
        if (!remainingMap.has(k)) remainingMap.set(k, getCountFor(type, name))
        return remainingMap.get(k) || 0
      }
      const decRemaining = (type: string, name: string, qty: number) => {
        const k = `${type}:${name}`
        const curr = getRemaining(type, name)
        remainingMap.set(k, Math.max(0, curr - Math.max(0, qty || 0)))
      }

      // Credits and EXP pools
      let creditsRemaining = getRemaining("other", "Shell Credit")
      let expRemaining = getTotalExp("CHARACTER")

      // Helper: allocate grouped material with crafting
      const allocateGrouped = (type: string, name: string, qty: number) => {
        const entry = getGroupEntry(type, name)
        if (!entry) return
        const targetIdx = entry.idxByName[name]
        if (targetIdx == null) return
        let needed = Math.max(0, qty || 0)
        // Consume same tier
        const take = Math.min(needed, entry.counts[targetIdx] || 0)
        if (take > 0) {
          entry.counts[targetIdx] -= take
          needed -= take
        }
        if (needed <= 0) return
        // Craft upwards from lower tiers (closest first)
        for (let k = targetIdx - 1; k >= 0 && needed > 0; k--) {
          const distance = targetIdx - k
          const factor = Math.pow(3, distance)
          const possible = Math.floor((entry.counts[k] || 0) / factor)
          if (possible <= 0) continue
          const produce = Math.min(needed, possible)
          entry.counts[k] -= produce * factor
          // directly consumed; do not add to target tier then remove
          needed -= produce
        }
        // If needed > 0 here, it remains unmet, which is fine for availability calc
      }

      // Simulate allocations for all prior plans
      for (let i = 0; i < Math.min(planIndex, plans.length); i++) {
        const bd = getPlanBreakdown(plans[i])
        for (const m of bd.materials) {
          if (!m || !m.qty) continue
          if (m.type === "exp") {
            expRemaining = Math.max(0, expRemaining - (m.qty || 0))
            continue
          }
          if (m.type === "other" && m.name === "Shell Credit") {
            creditsRemaining = Math.max(0, creditsRemaining - (m.qty || 0))
            continue
          }
          if ((groupedTypes as readonly string[]).includes(m.type)) {
            allocateGrouped(m.type, m.name, m.qty)
          } else {
            decRemaining(m.type, m.name, m.qty)
          }
        }
      }

      return {
        availableFor: (type: string, name: string) => {
          if (type === "other" && name === "Shell Credit")
            return creditsRemaining
          if ((groupedTypes as readonly string[]).includes(type)) {
            const entry = getGroupEntry(type, name)
            if (!entry) return 0
            const idx = entry.idxByName[name]
            if (idx == null) return 0
            return entry.counts[idx] || 0
          }
          return getRemaining(type, name)
        },
        availableExp: (category: "CHARACTER" | "WEAPON" = "CHARACTER") => {
          // Only CHARACTER EXP supported currently
          return category === "CHARACTER" ? expRemaining : 0
        },
      }
    },
    [plans, getPlanBreakdown, getCountFor, getTotalExp, groupsByType],
  )

  // Public helpers that expose per-plan availability
  const getAvailableForPlan = useCallback(
    (planIndex: number, type: string, name: string): number => {
      return getAvailabilityForPlan(planIndex).availableFor(type, name)
    },
    [getAvailabilityForPlan],
  )

  const getTotalExpForPlan = useCallback(
    (planIndex: number, category: "CHARACTER" | "WEAPON" = "CHARACTER") => {
      return getAvailabilityForPlan(planIndex).availableExp(category)
    },
    [getAvailabilityForPlan],
  )

  // Mixed-order availability (characters + weapons), honoring display order and crafting
  const getAvailabilityForMixedPosition = useCallback(
    (
      position: number,
    ): {
      availableFor: (type: string, name: string) => number
      availableExp: (category?: "CHARACTER" | "WEAPON") => number
    } => {
      const groupedTypes = ["enemy_drop", "talent_upgrade"] as const

      type GroupCacheEntry = {
        type: string
        groupId: number
        matsAsc: Array<{ id: number; name: string; rarity?: number }>
        idxByName: Record<string, number>
        counts: number[]
      }
      const groupCache = new Map<string, GroupCacheEntry>()

      const getGroupEntry = (
        type: string,
        name: string,
      ): GroupCacheEntry | null => {
        const typeGroups = (groupsByType as any)?.[type] as
          | Array<{
              groupId: number
              groupName: string
              materials: Array<{ id: number; name: string; rarity?: number }>
            }>
          | undefined
        if (!typeGroups || typeGroups.length === 0) return null
        for (const g of typeGroups) {
          const found = g.materials.find((m) => m.name === name)
          if (!found) continue
          const key = `${type}:${g.groupId}`
          let entry = groupCache.get(key)
          if (!entry) {
            const matsAsc = [...g.materials].sort(
              (a, b) => (a.rarity || 0) - (b.rarity || 0),
            )
            const idxByName: Record<string, number> = {}
            matsAsc.forEach((m, i) => {
              idxByName[m.name] = i
            })
            const counts = matsAsc.map((m) => getCountFor(type, m.name))
            entry = { type, groupId: g.groupId, matsAsc, idxByName, counts }
            groupCache.set(key, entry)
          }
          return entry
        }
        return null
      }

      const remainingMap = new Map<string, number>()
      const getRemaining = (type: string, name: string): number => {
        const k = `${type}:${name}`
        if (!remainingMap.has(k)) remainingMap.set(k, getCountFor(type, name))
        return remainingMap.get(k) || 0
      }
      const decRemaining = (type: string, name: string, qty: number) => {
        const k = `${type}:${name}`
        const curr = getRemaining(type, name)
        remainingMap.set(k, Math.max(0, curr - Math.max(0, qty || 0)))
      }

      let creditsRemaining = getRemaining("other", "Shell Credit")
      let expCharacterRemaining = getTotalExp("CHARACTER")
      let expWeaponRemaining = getTotalExp("WEAPON")

      const allocateGrouped = (type: string, name: string, qty: number) => {
        const entry = getGroupEntry(type, name)
        if (!entry) return
        const targetIdx = entry.idxByName[name]
        if (targetIdx == null) return
        let needed = Math.max(0, qty || 0)
        const take = Math.min(needed, entry.counts[targetIdx] || 0)
        if (take > 0) {
          entry.counts[targetIdx] -= take
          needed -= take
        }
        if (needed <= 0) return
        for (let k = targetIdx - 1; k >= 0 && needed > 0; k--) {
          const distance = targetIdx - k
          const factor = Math.pow(3, distance)
          const possible = Math.floor((entry.counts[k] || 0) / factor)
          if (possible <= 0) continue
          const produce = Math.min(needed, possible)
          entry.counts[k] -= produce * factor
          needed -= produce
        }
      }

      const ids = getOrderedIds()
      for (let i = 0; i < Math.min(position, ids.length); i++) {
        const [k, pid] = String(ids[i]).split(":")
        if (k === "C") {
          const plan = plans.find((p) => p.planId === pid)
          if (!plan) continue
          const bd = getPlanBreakdown(plan)
          for (const m of bd.materials) {
            if (!m || !m.qty) continue
            if (m.type === "exp") {
              expCharacterRemaining = Math.max(
                0,
                expCharacterRemaining - (m.qty || 0),
              )
              continue
            }
            if (m.type === "other" && m.name === "Shell Credit") {
              creditsRemaining = Math.max(0, creditsRemaining - (m.qty || 0))
              continue
            }
            if ((groupedTypes as readonly string[]).includes(m.type)) {
              allocateGrouped(m.type, m.name, m.qty)
            } else {
              decRemaining(m.type, m.name, m.qty)
            }
          }
        } else if (k === "W") {
          const plan = weaponPlans.find((p) => p.planId === pid)
          if (!plan) continue
          const bd = getWeaponPlanBreakdown(plan)
          for (const m of bd.materials) {
            if (!m || !m.qty) continue
            if (m.type === "exp") {
              expWeaponRemaining = Math.max(
                0,
                expWeaponRemaining - (m.qty || 0),
              )
              continue
            }
            if (m.type === "other" && m.name === "Shell Credit") {
              creditsRemaining = Math.max(0, creditsRemaining - (m.qty || 0))
              continue
            }
            if ((groupedTypes as readonly string[]).includes(m.type)) {
              allocateGrouped(m.type, m.name, m.qty)
            } else {
              decRemaining(m.type, m.name, m.qty)
            }
          }
        }
      }

      return {
        availableFor: (type: string, name: string) => {
          if (type === "other" && name === "Shell Credit")
            return creditsRemaining
          if ((groupedTypes as readonly string[]).includes(type)) {
            const entry = getGroupEntry(type, name)
            if (!entry) return 0
            const idx = entry.idxByName[name]
            if (idx == null) return 0
            return entry.counts[idx] || 0
          }
          return getRemaining(type, name)
        },
        availableExp: (category: "CHARACTER" | "WEAPON" = "CHARACTER") => {
          return category === "WEAPON"
            ? expWeaponRemaining
            : expCharacterRemaining
        },
      }
    },
    [
      getOrderedIds,
      plans,
      weaponPlans,
      getPlanBreakdown,
      getWeaponPlanBreakdown,
      groupsByType,
      getCountFor,
      getTotalExp,
    ],
  )

  const getAvailableForMixedPositionValue = useCallback(
    (position: number, type: string, name: string) => {
      return getAvailabilityForMixedPosition(position).availableFor(type, name)
    },
    [getAvailabilityForMixedPosition],
  )

  const getTotalExpForMixedPositionValue = useCallback(
    (position: number, category: "CHARACTER" | "WEAPON" = "CHARACTER") => {
      return getAvailabilityForMixedPosition(position).availableExp(category)
    },
    [getAvailabilityForMixedPosition],
  )

  // Combined remaining materials needed after allocating inventory (with crafting) in mixed order
  const getCombinedRemaining = useCallback(() => {
    const groupedTypes = ["enemy_drop", "talent_upgrade"] as const
    type Acc = Record<
      string,
      { type: string; name: string; qty: number; rarity?: number }
    >
    const deficits: Acc = {}

    type GroupCacheEntry = {
      type: string
      groupId: number
      matsAsc: Array<{ id: number; name: string; rarity?: number }>
      idxByName: Record<string, number>
      counts: number[]
    }
    const groupCache = new Map<string, GroupCacheEntry>()
    const getGroupEntry = (
      type: string,
      name: string,
    ): GroupCacheEntry | null => {
      const typeGroups = (groupsByType as any)?.[type] as
        | Array<{
            groupId: number
            groupName: string
            materials: Array<{ id: number; name: string; rarity?: number }>
          }>
        | undefined
      if (!typeGroups || typeGroups.length === 0) return null
      for (const g of typeGroups) {
        const found = g.materials.find((m) => m.name === name)
        if (!found) continue
        const key = `${type}:${g.groupId}`
        let entry = groupCache.get(key)
        if (!entry) {
          const matsAsc = [...g.materials].sort(
            (a, b) => (a.rarity || 0) - (b.rarity || 0),
          )
          const idxByName: Record<string, number> = {}
          matsAsc.forEach((m, i) => (idxByName[m.name] = i))
          const counts = matsAsc.map((m) => getCountFor(type, m.name))
          entry = { type, groupId: g.groupId, matsAsc, idxByName, counts }
          groupCache.set(key, entry)
        }
        return entry
      }
      return null
    }

    const remainingMap = new Map<string, number>()
    const getRemaining = (type: string, name: string): number => {
      const k = `${type}:${name}`
      if (!remainingMap.has(k)) remainingMap.set(k, getCountFor(type, name))
      return remainingMap.get(k) || 0
    }
    const decRemaining = (type: string, name: string, qty: number) => {
      const k = `${type}:${name}`
      const curr = getRemaining(type, name)
      remainingMap.set(k, Math.max(0, curr - Math.max(0, qty || 0)))
    }

    let creditsRemaining = getRemaining("other", "Shell Credit")
    let expCharacterRemaining = getTotalExp("CHARACTER")
    let expWeaponRemaining = getTotalExp("WEAPON")

    const addDeficit = (
      type: string,
      name: string,
      qty: number,
      rarity?: number,
    ) => {
      if (!qty) return
      const key = `${type}:${name}:${rarity ?? 0}`
      deficits[key] = deficits[key]
        ? { ...deficits[key], qty: deficits[key].qty + qty }
        : { type, name, qty, rarity }
    }

    const allocateGroupedWithShortage = (
      type: string,
      name: string,
      qty: number,
      rarity?: number,
    ) => {
      const entry = getGroupEntry(type, name)
      if (!entry) {
        addDeficit(type, name, Math.max(0, qty || 0), rarity)
        return
      }
      const targetIdx = entry.idxByName[name]
      if (targetIdx == null) {
        addDeficit(type, name, Math.max(0, qty || 0), rarity)
        return
      }
      let needed = Math.max(0, qty || 0)
      // use same tier
      const take = Math.min(needed, entry.counts[targetIdx] || 0)
      if (take > 0) {
        entry.counts[targetIdx] -= take
        needed -= take
      }
      // craft up from lower tiers
      for (let k = targetIdx - 1; k >= 0 && needed > 0; k--) {
        const distance = targetIdx - k
        const factor = Math.pow(3, distance)
        const possible = Math.floor((entry.counts[k] || 0) / factor)
        if (possible <= 0) continue
        const produce = Math.min(needed, possible)
        entry.counts[k] -= produce * factor
        needed -= produce
      }
      if (needed > 0) addDeficit(type, name, needed, rarity)
    }

    const ids = getOrderedIds()
    for (let i = 0; i < ids.length; i++) {
      const [k, pid] = String(ids[i]).split(":")
      const isChar = k === "C"
      if (isChar) {
        const plan = plans.find((p) => p.planId === pid)
        if (!plan) continue
        const bd = getPlanBreakdown(plan)
        const mats = bd.materials as Array<{
          type: string
          name: string
          qty: number
          rarity?: number
        }>
        for (const m of mats) {
          if (!m || !m.qty) continue
          if (m.type === "exp") {
            const avail = expCharacterRemaining
            const deficit = Math.max(0, (m.qty || 0) - avail)
            expCharacterRemaining = Math.max(0, avail - (m.qty || 0))
            if (deficit > 0) addDeficit("exp", m.name, deficit, m.rarity)
            continue
          }
          if (m.type === "other" && m.name === "Shell Credit") {
            const avail = creditsRemaining
            const deficit = Math.max(0, (m.qty || 0) - avail)
            creditsRemaining = Math.max(0, avail - (m.qty || 0))
            if (deficit > 0) addDeficit("other", m.name, deficit, m.rarity)
            continue
          }
          if ((groupedTypes as readonly string[]).includes(m.type)) {
            allocateGroupedWithShortage(m.type, m.name, m.qty, m.rarity)
          } else {
            const avail = getRemaining(m.type, m.name)
            const take = Math.min(avail, m.qty || 0)
            decRemaining(m.type, m.name, take)
            const deficit = Math.max(0, (m.qty || 0) - take)
            if (deficit > 0) addDeficit(m.type, m.name, deficit, m.rarity)
          }
        }
      } else if (k === "W") {
        const plan = weaponPlans.find((p) => p.planId === pid)
        if (!plan) continue
        const bd = getWeaponPlanBreakdown(plan)
        const mats = bd.materials as Array<{
          type: string
          name: string
          qty: number
          rarity?: number
        }>
        for (const m of mats) {
          if (!m || !m.qty) continue
          if (m.type === "exp") {
            const avail = expWeaponRemaining
            const deficit = Math.max(0, (m.qty || 0) - avail)
            expWeaponRemaining = Math.max(0, avail - (m.qty || 0))
            if (deficit > 0) addDeficit("exp", m.name, deficit, m.rarity)
            continue
          }
          if (m.type === "other" && m.name === "Shell Credit") {
            const avail = creditsRemaining
            const deficit = Math.max(0, (m.qty || 0) - avail)
            creditsRemaining = Math.max(0, avail - (m.qty || 0))
            if (deficit > 0) addDeficit("other", m.name, deficit, m.rarity)
            continue
          }
          if ((groupedTypes as readonly string[]).includes(m.type)) {
            allocateGroupedWithShortage(m.type, m.name, m.qty, m.rarity)
          } else {
            const avail = getRemaining(m.type, m.name)
            const take = Math.min(avail, m.qty || 0)
            decRemaining(m.type, m.name, take)
            const deficit = Math.max(0, (m.qty || 0) - take)
            if (deficit > 0) addDeficit(m.type, m.name, deficit, m.rarity)
          }
        }
      }
    }

    const entries = Object.values(deficits) as Array<{
      type: string
      name: string
      qty: number
      rarity?: number
    }>
    const getGroupId = (type: string, name: string): number => {
      if (!(type === "enemy_drop" || type === "talent_upgrade"))
        return Number.MAX_SAFE_INTEGER
      const entry = getGroupEntry(type, name)
      return entry ? entry.groupId : Number.MAX_SAFE_INTEGER
    }
    const typeRank = (e: { type: string; name: string }) => {
      if (e.type === "exp") return 0
      if (e.type === "other" && e.name === "Shell Credit") return 1
      if (e.type === "enemy_drop") return 2
      if (e.type === "talent_upgrade") return 3
      if (e.type === "boss_drop") return 4
      if (e.type === "collectible") return 5
      if (e.type === "weekly_boss") return 6
      return 7
    }
    const ordered = [...entries].sort((a, b) => {
      const ta = typeRank(a)
      const tb = typeRank(b)
      if (ta !== tb) return ta - tb
      if (ta === 2 || ta === 3) {
        const ga = getGroupId(a.type, a.name)
        const gb = getGroupId(b.type, b.name)
        if (ga !== gb) return ga - gb
        const ra = a.rarity ?? 0
        const rb = b.rarity ?? 0
        if (ra !== rb) return ra - rb
        return a.name.localeCompare(b.name)
      }
      return a.name.localeCompare(b.name)
    })
    return ordered
  }, [
    getOrderedIds,
    plans,
    weaponPlans,
    getPlanBreakdown,
    getWeaponPlanBreakdown,
    groupsByType,
    getCountFor,
    getTotalExp,
  ])

  // Skill helpers
  const setSkillRange = (index: number, from: number, to: number) => {
    setSkillRanges((prev) => {
      const next = prev.map((pair) => [...pair]) as unknown as [
        [number, number],
        [number, number],
        [number, number],
        [number, number],
        [number, number],
      ]
      const clampedFrom = Math.max(1, Math.min(10, from || 1))
      const clampedTo = Math.max(1, Math.min(10, to || 1))
      next[index] = [
        Math.min(clampedFrom, clampedTo),
        Math.max(clampedFrom, clampedTo),
      ]
      return next
    })
  }

  return {
    loading,
    characters,
    weapons,
    plans,
    weaponPlans,
    totalResources,
    getPlanBreakdown,
    getWeaponPlanBreakdown,

    search,
    setSearch,
    filteredCharacters,
    filteredWeapons,

    showAddCharacter,
    openAddCharacter,
    closeAddCharacter,
    showAddWeapon,
    openAddWeapon,
    closeAddWeapon,
    chooseCharacter,
    chooseWeapon,
    showReorderPlans,
    openReorderPlans,
    closeReorderPlans,
    showCharacterConfig,
    showWeaponConfig,
    selectedCharacter,
    selectedWeapon,
    cancelCharacterConfig,
    cancelWeaponConfig,
    confirmCharacterPlan,
    confirmWeaponPlan,

    fromAscension,
    toAscension,
    setFromAscension,
    setToAscension,
    fromLevel,
    toLevel,
    setFromLevel,
    setToLevel,
    skillRanges,
    setSkillRange,
    inherentLevels,
    setInherentLevels,
    statBoosts,
    setStatBoosts,

    // weapon config state
    wFromAscension,
    wToAscension,
    setWFromAscension,
    setWToAscension,
    wFromLevel,
    wToLevel,
    setWFromLevel,
    setWToLevel,

    // plan ops
    removePlan,
    removeWeaponPlan,
    beginEditPlan,
    beginEditWeaponPlan,
    applyPlanOrder,

    // Mark plan as done: update plan state to reflect desired achieved
    markPlanAsDone: (index: number) => {
      setPlans((prev) => {
        if (index < 0 || index >= prev.length) return prev
        const p = prev[index]
        const next: CharacterPlan = {
          ...p,
          fromAscension: p.toAscension,
          fromLevel: p.toLevel,
          skillRanges: p.skillRanges.map(([from, to]) => [
            to,
            to,
          ]) as unknown as [
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
          ],
          // Clear selected nodes so no further materials are required
          inherentSelected: [false, false],
          statBoostsSelected: [
            [false, false],
            [false, false],
            [false, false],
            [false, false],
          ],
        }
        return prev.map((it, i) => (i === index ? next : it))
      })
    },

    // Mark weapon plan as done
    markWeaponPlanAsDone: (index: number) => {
      setWeaponPlans((prev) => {
        if (index < 0 || index >= prev.length) return prev
        const p = prev[index]
        const next: WeaponPlan = {
          ...p,
          fromAscension: p.toAscension,
          fromLevel: p.toLevel,
        }
        return prev.map((it, i) => (i === index ? next : it))
      })
    },

    // priority allocation helpers
    getAvailableForPlan,
    getTotalExpForPlan,
    orderedItems,
    // Mixed availability snapshot for a given mixed position
    getMixedAvailability: (position: number) =>
      getAvailabilityForMixedPosition(position),
    getCombinedRemaining,

    // multi-account state
    accountId,
    setAccountId,
  }
}

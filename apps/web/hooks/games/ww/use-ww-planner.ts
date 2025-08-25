"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

export function useWwPlanner() {
  const [loading, setLoading] = useState(false)
  const [characters, setCharacters] = useState<CharacterAsset[]>([])
  const [characterDetailsById, setCharacterDetailsById] = useState<
    Record<number, any>
  >({})
  const [plans, setPlans] = useState<CharacterPlan[]>([])
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null)
  const [accountId, setAccountId] = useState<number>(0)
  const hasHydratedFromStorage = useRef<boolean>(false)

  // UI state
  const [showAddCharacter, setShowAddCharacter] = useState(false)
  const [showCharacterConfig, setShowCharacterConfig] = useState(false)
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterAsset | null>(null)
  const [search, setSearch] = useState("")
  const [showReorderPlans, setShowReorderPlans] = useState(false)

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

  // Load from storage after characters are available and only once per account
  useEffect(() => {
    if (hasHydratedFromStorage.current) return
    if (!characters || characters.length === 0) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as { v?: number; p?: StoredPlanV1[] }
        if (Array.isArray(parsed?.p)) {
          const rebuilt = parsed.p.map(unpackPlan)
          setPlans(rebuilt)
        }
      }
    } catch {}
    hasHydratedFromStorage.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters, storageKey])

  // Save to storage whenever plans change
  useEffect(() => {
    if (!hasHydratedFromStorage.current) return
    try {
      const packed = plans.map(packPlan)
      const payload = JSON.stringify({ v: 1, p: packed })
      localStorage.setItem(storageKey, payload)
    } catch {}
  }, [plans, storageKey])

  const filteredCharacters = useMemo(() => {
    const q = search.trim().toLowerCase()
    const existing = new Set(plans.map((p) => p.characterId))
    const available = characters.filter((c) => !existing.has(c.id))
    if (!q) return available
    return available.filter((c) => c.name.toLowerCase().includes(q))
  }, [characters, search, plans])

  const openAddCharacter = () => setShowAddCharacter(true)
  const closeAddCharacter = () => setShowAddCharacter(false)

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

  const cancelCharacterConfig = () => {
    setShowCharacterConfig(false)
    setSelectedCharacter(null)
    setEditingPlanIndex(null)
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
    setShowCharacterConfig(false)
    setSelectedCharacter(null)
    setEditingPlanIndex(null)
  }

  const removePlan = (index: number) => {
    setPlans((prev) => prev.filter((_, i) => i !== index))
  }

  const applyPlanOrder = (order: number[]) => {
    setPlans((prev) => {
      if (!Array.isArray(order) || order.length !== prev.length) return prev
      const next: CharacterPlan[] = []
      for (const idx of order) {
        const item = prev[idx]
        if (item) next.push(item)
      }
      return next.length === prev.length ? next : prev
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
    plans,
    totalResources,
    getPlanBreakdown,

    search,
    setSearch,
    filteredCharacters,

    showAddCharacter,
    openAddCharacter,
    closeAddCharacter,
    chooseCharacter,
    showReorderPlans,
    openReorderPlans,
    closeReorderPlans,
    showCharacterConfig,
    selectedCharacter,
    cancelCharacterConfig,
    confirmCharacterPlan,

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

    // plan ops
    removePlan,
    beginEditPlan,
    applyPlanOrder,

    // multi-account state
    accountId,
    setAccountId,
  }
}

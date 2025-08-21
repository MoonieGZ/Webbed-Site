"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ASCENSION_TEMPLATES,
  SKILL_TEMPLATES,
  EXP_TEMPLATES,
} from "@/lib/games/ww/templates"

type CharacterAsset = {
  id: number
  name: string
  element: string
  rarity: number
  icon: string
  elementIcon: string
}

export type CharacterPlan = {
  characterId: number
  characterName: string
  characterIcon: string
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

  // UI state
  const [showAddCharacter, setShowAddCharacter] = useState(false)
  const [showCharacterConfig, setShowCharacterConfig] = useState(false)
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterAsset | null>(null)
  const [search, setSearch] = useState("")

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
      const res = await fetch("/api/wuwa/assets", { cache: "no-store" })
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

  const filteredCharacters = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return characters
    return characters.filter((c) => c.name.toLowerCase().includes(q))
  }, [characters, search])

  const openAddCharacter = () => setShowAddCharacter(true)
  const closeAddCharacter = () => setShowAddCharacter(false)

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
  }

  const confirmCharacterPlan = () => {
    if (!selectedCharacter) return
    const plan: CharacterPlan = {
      characterId: selectedCharacter.id,
      characterName: selectedCharacter.name,
      characterIcon: selectedCharacter.icon,
      fromAscension,
      toAscension,
      fromLevel,
      toLevel,
      skillRanges,
      inherentSelected: inherentLevels, // [L2, L1]
      statBoostsSelected: statBoosts, // 4 pairs, each [L2, L1]
    }
    setPlans((prev) => [...prev, plan])
    setShowCharacterConfig(false)
    setSelectedCharacter(null)
  }

  // Compute total required materials across all plans
  const totalResources = useMemo(() => {
    const items: Record<string, number> = {}
    let credits = 0

    const addItem = (type: string, name: string, qty: number) => {
      if (!qty) return
      const key = `${type}:${name}`
      items[key] = (items[key] ?? 0) + qty
    }

    const pickGroupMaterials = (
      detail: any,
      type: string,
    ): Array<{ name: string; rarity: number }> | null => {
      const groups = detail?.groups?.[type] as
        | Array<{ materials: Array<{ name: string; rarity: number }> }>
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
        }

        // boss_drop single
        const bossMat = detail?.materials?.boss_drop
        if (bossMat && step.boss_drop)
          addItem("boss_drop", bossMat.name, step.boss_drop)

        // collectible single
        const collMat = detail?.materials?.collectible
        if (collMat && step.collectible)
          addItem("collectible", collMat.name, step.collectible)

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
              if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
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
              if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
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
        const key = `${type}:${name}`
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
            if (qty) addItem("enemy_drop", enemyMats[i].name, qty)
          }
        }
        const bossMat = detail?.materials?.boss_drop
        if (bossMat && step.boss_drop)
          addItem("boss_drop", bossMat.name, step.boss_drop)
        const collMat = detail?.materials?.collectible
        if (collMat && step.collectible)
          addItem("collectible", collMat.name, step.collectible)
        if (step.credits) addItem("other", "Shell Credit", step.credits, 0)
        credits += step.credits || 0
      }

      // Character leveling credits (milestones between fromLevel -> toLevel)
      for (const row of EXP_TEMPLATES.CHARACTER) {
        if (row.level > plan.fromLevel && row.level <= plan.toLevel) {
          if (row.credits) addItem("other", "Shell Credit", row.credits, 0)
          credits += row.credits || 0
        }
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
              if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
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
              if (qty) addItem("enemy_drop", enemyMats[i].name, qty)
            }
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && step.weekly_boss)
            addItem("weekly_boss", weekly.name, step.weekly_boss)
          if (step.credits) addItem("other", "Shell Credit", step.credits, 0)
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
              if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
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
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && t.weekly_boss)
            addItem("weekly_boss", weekly.name, t.weekly_boss)
          if (t.credits) addItem("other", "Shell Credit", t.credits, 0)
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
              if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
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
          }
          const weekly = detail?.materials?.weekly_boss
          if (weekly && t.weekly_boss)
            addItem("weekly_boss", weekly.name, t.weekly_boss)
          if (t.credits) addItem("other", "Shell Credit", t.credits, 0)
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
                if (qty) addItem("talent_upgrade", talentMats[i].name, qty)
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
            }
            const weekly = detail?.materials?.weekly_boss
            if (weekly && t.weekly_boss)
              addItem("weekly_boss", weekly.name, t.weekly_boss)
            if (t.credits) addItem("other", "Shell Credit", t.credits, 0)
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
            }
            const weekly = detail?.materials?.weekly_boss
            if (weekly && t.weekly_boss)
              addItem("weekly_boss", weekly.name, t.weekly_boss)
            if (t.credits) addItem("other", "Shell Credit", t.credits, 0)
            credits += t.credits || 0
          }
        }
      }

      // Order: enemy_drop asc rarity, talent_upgrade asc rarity, then weekly_boss, then credits (Shell Credit)
      const entries = Object.values(items) as Array<{
        type: string
        name: string
        qty: number
        rarity?: number
      }>
      const creditsEntry = entries.filter(
        (e) => e.type === "other" && e.name === "Shell Credit",
      )
      const enemyEntries = entries
        .filter((e) => e.type === "enemy_drop")
        .sort((a, b) => (a.rarity ?? 0) - (b.rarity ?? 0))
      const talentEntries = entries
        .filter((e) => e.type === "talent_upgrade")
        .sort((a, b) => (a.rarity ?? 0) - (b.rarity ?? 0))
      const weeklyEntries = entries.filter((e) => e.type === "weekly_boss")
      const ordered = [
        ...enemyEntries,
        ...talentEntries,
        ...weeklyEntries,
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
  }
}

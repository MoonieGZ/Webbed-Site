import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import {
  getCharacterIconUrl,
  getElementIconUrl,
  getWeaponIconUrl,
} from "@/lib/games/ww/icons"

export async function GET() {
  try {
    const charRows = (await query(
      "SELECT id, name, element, weapon_type, rarity FROM ww_characters ORDER BY element, rarity DESC, name",
    )) as Array<{
      id: number
      name: string
      element: string
      weapon_type: string
      rarity: number
    }>

    // Character groups with materials
    const charGroupRows = (await query(
      `SELECT cg.character_id as characterId,
			        g.id as groupId,
			        g.name as groupName,
			        g.type as groupType,
			        m.id as materialId,
			        m.name as materialName,
			        m.rarity as materialRarity
			   FROM ww_character_groups cg
			   JOIN ww_groups g ON g.id = cg.group_id
			   JOIN ww_group_items gi ON gi.group_id = g.id
			   JOIN ww_materials m ON m.id = gi.material_id`,
    )) as Array<{
      characterId: number
      groupId: number
      groupName: string
      groupType: string
      materialId: number
      materialName: string
      materialRarity: number
    }>

    const characterGroups: Record<
      number,
      Record<
        string,
        Array<{
          groupId: number
          groupName: string
          materials: Array<{ id: number; name: string; rarity: number }>
        }>
      >
    > = {}
    for (const r of charGroupRows) {
      if (!characterGroups[r.characterId]) characterGroups[r.characterId] = {}
      const byType = characterGroups[r.characterId]
      if (!byType[r.groupType]) byType[r.groupType] = []
      let groupEntry = byType[r.groupType].find((g) => g.groupId === r.groupId)
      if (!groupEntry) {
        groupEntry = {
          groupId: r.groupId,
          groupName: r.groupName,
          materials: [],
        }
        byType[r.groupType].push(groupEntry)
      }
      groupEntry.materials.push({
        id: r.materialId,
        name: r.materialName,
        rarity: r.materialRarity,
      })
    }

    // Character direct materials (weekly_boss, boss_drop, collectible)
    const charMatRows = (await query(
      `SELECT cm.character_id as characterId,
			        cm.type as materialType,
			        m.id as materialId,
			        m.name as materialName,
			        m.rarity as materialRarity
			   FROM ww_character_materials cm
			   JOIN ww_materials m ON m.id = cm.material_id`,
    )) as Array<{
      characterId: number
      materialType: string
      materialId: number
      materialName: string
      materialRarity: number
    }>

    const characterMaterials: Record<
      number,
      Record<string, { id: number; name: string; rarity: number }>
    > = {}
    for (const r of charMatRows) {
      if (!characterMaterials[r.characterId])
        characterMaterials[r.characterId] = {}
      characterMaterials[r.characterId][r.materialType] = {
        id: r.materialId,
        name: r.materialName,
        rarity: r.materialRarity,
      }
    }

    const characters = charRows.map((row) => ({
      id: row.id,
      name: row.name,
      element: row.element,
      weaponType: row.weapon_type,
      rarity: row.rarity,
      icon: getCharacterIconUrl(row.element, row.name),
      elementIcon: getElementIconUrl(row.element),
      groups: characterGroups[row.id] || {},
      materials: characterMaterials[row.id] || {},
    }))

    const weaponRows = (await query(
      "SELECT id, name, weapon_type, rarity FROM ww_weapons ORDER BY weapon_type, rarity DESC, name",
    )) as Array<{
      id: number
      name: string
      weapon_type: string
      rarity: number
    }>

    // Weapon groups with materials
    const weaponGroupRows = (await query(
      `SELECT wg.weapon_id as weaponId,
			        g.id as groupId,
			        g.name as groupName,
			        g.type as groupType,
			        m.id as materialId,
			        m.name as materialName,
			        m.rarity as materialRarity
			   FROM ww_weapon_groups wg
			   JOIN ww_groups g ON g.id = wg.group_id
			   JOIN ww_group_items gi ON gi.group_id = g.id
			   JOIN ww_materials m ON m.id = gi.material_id`,
    )) as Array<{
      weaponId: number
      groupId: number
      groupName: string
      groupType: string
      materialId: number
      materialName: string
      materialRarity: number
    }>

    const weaponGroups: Record<
      number,
      Record<
        string,
        Array<{
          groupId: number
          groupName: string
          materials: Array<{ id: number; name: string; rarity: number }>
        }>
      >
    > = {}
    for (const r of weaponGroupRows) {
      if (!weaponGroups[r.weaponId]) weaponGroups[r.weaponId] = {}
      const byType = weaponGroups[r.weaponId]
      if (!byType[r.groupType]) byType[r.groupType] = []
      let groupEntry = byType[r.groupType].find((g) => g.groupId === r.groupId)
      if (!groupEntry) {
        groupEntry = {
          groupId: r.groupId,
          groupName: r.groupName,
          materials: [],
        }
        byType[r.groupType].push(groupEntry)
      }
      groupEntry.materials.push({
        id: r.materialId,
        name: r.materialName,
        rarity: r.materialRarity,
      })
    }

    const weaponsByType: Record<
      string,
      Array<{
        id: number
        name: string
        type: string
        rarity: number
        icon: string
        groups: Record<
          string,
          Array<{
            groupId: number
            groupName: string
            materials: Array<{ id: number; name: string; rarity: number }>
          }>
        >
      }>
    > = {}
    for (const row of weaponRows) {
      const type = row.weapon_type
      if (!weaponsByType[type]) weaponsByType[type] = []
      weaponsByType[type].push({
        id: row.id,
        name: row.name,
        type,
        rarity: row.rarity,
        icon: getWeaponIconUrl(type, row.name),
        groups: weaponGroups[row.id] || {},
      })
    }

    // All groups and their materials (for verification view)
    const groupRows = (await query(
      `SELECT g.id as groupId,
			        g.name as groupName,
			        g.type as groupType,
			        m.id as materialId,
			        m.name as materialName,
			        m.rarity as materialRarity
			   FROM ww_groups g
			   JOIN ww_group_items gi ON gi.group_id = g.id
			   JOIN ww_materials m ON m.id = gi.material_id
			 ORDER BY g.type, g.name, m.rarity DESC, m.name`,
    )) as Array<{
      groupId: number
      groupName: string
      groupType: string
      materialId: number
      materialName: string
      materialRarity: number
    }>

    const groupsByType: Record<
      string,
      Array<{
        groupId: number
        groupName: string
        materials: Array<{ id: number; name: string; rarity: number }>
      }>
    > = {}
    for (const r of groupRows) {
      if (!groupsByType[r.groupType]) groupsByType[r.groupType] = []
      let g = groupsByType[r.groupType].find((x) => x.groupId === r.groupId)
      if (!g) {
        g = { groupId: r.groupId, groupName: r.groupName, materials: [] }
        groupsByType[r.groupType].push(g)
      }
      g.materials.push({
        id: r.materialId,
        name: r.materialName,
        rarity: r.materialRarity,
      })
    }

    // Standalone materials by type (e.g., collectible, exp, boss_drop) not requiring group assignment
    const materialRows = (await query(
      `SELECT id, name, rarity, type
			   FROM ww_materials
			  WHERE type IN ('collectible','exp','boss_drop')
			  ORDER BY type, rarity DESC, name`,
    )) as Array<{ id: number; name: string; rarity: number; type: string }>

    const materialsByType: Record<
      string,
      Array<{ id: number; name: string; rarity: number }>
    > = {}
    for (const r of materialRows) {
      if (!materialsByType[r.type]) materialsByType[r.type] = []
      materialsByType[r.type].push({ id: r.id, name: r.name, rarity: r.rarity })
    }

    return NextResponse.json({
      characters,
      weaponsByType,
      groupsByType,
      materialsByType,
    })
  } catch (err) {
    console.error("/api/wuwa/assets error", err)
    return NextResponse.json(
      { error: "Failed to load assets" },
      { status: 500 },
    )
  }
}

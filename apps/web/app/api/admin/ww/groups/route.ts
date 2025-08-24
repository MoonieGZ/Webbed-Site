import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { ADMIN_USER_ID } from "@/lib/admin"
import { query } from "@/lib/db"

type GroupType =
  | "boss_drop"
  | "talent_upgrade"
  | "collectible"
  | "weekly_boss"
  | "enemy_drop"
  | "other"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value
    const requester = sessionToken ? await getUserBySession(sessionToken) : null
    if (!requester || requester.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const characters = (await query(
      `SELECT id, name, element, weapon_type as weaponType, rarity
         FROM ww_characters
        ORDER BY element, rarity DESC, name`,
    )) as Array<{
      id: number
      name: string
      element: string
      weaponType: string
      rarity: number
    }>

    const groupRows = (await query(
      `SELECT id, name, type
         FROM ww_groups
        ORDER BY type, name`,
    )) as Array<{ id: number; name: string; type: GroupType }>

    // Find a preview material (highest rarity, then alpha) for each group
    const previewRows = (await query(
      `SELECT g.id as groupId, g.type as groupType, m.name as materialName, m.rarity as materialRarity
         FROM ww_groups g
         JOIN ww_group_items gi ON gi.group_id = g.id
         JOIN ww_materials m ON m.id = gi.material_id
        ORDER BY m.rarity DESC, m.name ASC`,
    )) as Array<{
      groupId: number
      groupType: GroupType
      materialName: string
      materialRarity: number
    }>
    const previews = new Map<number, { name: string }>()
    for (const r of previewRows) {
      if (!previews.has(r.groupId))
        previews.set(r.groupId, { name: r.materialName })
    }

    const groupsByType: Record<
      string,
      Array<{ id: number; name: string; previewMaterialName?: string }>
    > = {}
    for (const g of groupRows) {
      if (!groupsByType[g.type]) groupsByType[g.type] = []
      groupsByType[g.type].push({
        id: g.id,
        name: g.name,
        previewMaterialName: previews.get(g.id)?.name,
      })
    }

    const assignmentRows = (await query(
      `SELECT cg.character_id as characterId, g.id as groupId, g.type as groupType
         FROM ww_character_groups cg
         JOIN ww_groups g ON g.id = cg.group_id`,
    )) as Array<{ characterId: number; groupId: number; groupType: GroupType }>

    const materialRows = (await query(
      `SELECT cm.character_id as characterId, cm.type as materialType, m.id as materialId, m.name as materialName
         FROM ww_character_materials cm
         JOIN ww_materials m ON m.id = cm.material_id`,
    )) as Array<{
      characterId: number
      materialType: "weekly_boss" | "boss_drop" | "collectible"
      materialId: number
      materialName: string
    }>

    const current: Record<number, any> = {}
    for (const r of assignmentRows) {
      if (!current[r.characterId]) current[r.characterId] = {}
      current[r.characterId][r.groupType] = r.groupId
    }
    for (const r of materialRows) {
      if (!current[r.characterId]) current[r.characterId] = {}
      current[r.characterId][r.materialType] = r.materialId
    }

    // Also provide materials lists by type for the three direct-select categories
    const materialOptions = (await query(
      `SELECT id, name, type
         FROM ww_materials
        WHERE type IN ('weekly_boss','boss_drop','collectible')
        ORDER BY type, name`,
    )) as Array<{ id: number; name: string; type: string }>
    const materialsByType: Record<
      string,
      Array<{ id: number; name: string }>
    > = {}
    for (const m of materialOptions) {
      if (!materialsByType[m.type]) materialsByType[m.type] = []
      materialsByType[m.type].push({ id: m.id, name: m.name })
    }

    return NextResponse.json({
      characters,
      groupsByType,
      current,
      materialsByType,
    })
  } catch (error) {
    console.error("Admin WW groups GET error:", error)
    return NextResponse.json(
      { error: "Failed to load WW groups" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value
    const requester = sessionToken ? await getUserBySession(sessionToken) : null
    if (!requester || requester.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      characterId?: number
      type?: GroupType | "weekly_boss" | "boss_drop" | "collectible"
      groupId?: number | null
    }
    const { characterId, type, groupId } = body
    if (!characterId || !type || typeof characterId !== "number") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // If type is one of the direct material-selection types
    if (
      type === "weekly_boss" ||
      type === "boss_drop" ||
      type === "collectible"
    ) {
      if (groupId != null) {
        const check = (await query(
          `SELECT id FROM ww_materials WHERE id = ? AND type = ? LIMIT 1`,
          [groupId, type],
        )) as Array<{ id: number }>
        if (check.length === 0) {
          return NextResponse.json(
            { error: "Material does not match type" },
            { status: 400 },
          )
        }
      }

      // Upsert into ww_character_materials
      await query(
        `DELETE FROM ww_character_materials WHERE character_id = ? AND type = ?`,
        [characterId, type],
      )
      if (groupId != null) {
        await query(
          `INSERT INTO ww_character_materials (character_id, material_id, type) VALUES (?, ?, ?)`,
          [characterId, groupId, type],
        )
      }
      return NextResponse.json({ success: true })
    }

    if (groupId != null) {
      // Validate group belongs to provided type
      const check = (await query(
        `SELECT id FROM ww_groups WHERE id = ? AND type = ? LIMIT 1`,
        [groupId, type],
      )) as Array<{ id: number }>
      if (check.length === 0) {
        return NextResponse.json(
          { error: "Group does not match type" },
          { status: 400 },
        )
      }
    }

    // Remove any existing assignment for this character and type
    await query(
      `DELETE cg FROM ww_character_groups cg
         JOIN ww_groups g ON g.id = cg.group_id
        WHERE cg.character_id = ? AND g.type = ?`,
      [characterId, type],
    )

    if (groupId != null) {
      await query(
        `INSERT IGNORE INTO ww_character_groups (character_id, group_id) VALUES (?, ?)`,
        [characterId, groupId],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin WW groups PUT error:", error)
    return NextResponse.json(
      { error: "Failed to update group assignment" },
      { status: 500 },
    )
  }
}

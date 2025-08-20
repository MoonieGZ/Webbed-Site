import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { query } from "@/lib/db"

async function getUserId(request: NextRequest): Promise<number | null> {
  const token = request.cookies.get("session")?.value
  if (!token) return null
  const user = await getUserBySession(token)
  return user?.id ?? null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json([])
    const rows = (await query(
      "SELECT profile_index, name, enabled_map FROM gi_boss_profiles WHERE user_id = ? ORDER BY profile_index",
      [userId],
    )) as Array<{
      profile_index: number
      name: string | null
      enabled_map: any
    }>
    const profiles = rows.map((r) => ({
      profileIndex: r.profile_index,
      name: r.name,
      enabledMap:
        typeof r.enabled_map === "string"
          ? JSON.parse(r.enabled_map)
          : r.enabled_map,
    }))
    return NextResponse.json(profiles)
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load profiles" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = (await request.json()) as {
      profileIndex: number
      name?: string | null
      enabledMap: Record<string, boolean>
    }
    const { profileIndex, name = null, enabledMap } = body
    const json = JSON.stringify(enabledMap)
    await query(
      "INSERT INTO gi_boss_profiles (user_id, profile_index, name, enabled_map) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), enabled_map = VALUES(enabled_map)",
      [userId, profileIndex, name, json],
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { query } from "@/lib/db"
import { z } from "zod"

async function requireUser(
  request: NextRequest,
): Promise<{ id: number } | null> {
  const token = request.cookies.get("session")?.value
  if (!token) return null
  const user = await getUserBySession(token)
  return user ? { id: user.id } : null
}

export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request)
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const bodySchema = z.object({
      ids: z.array(z.number().int().positive()).min(1),
    })
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ profiles: [] })
    const { ids } = parsed.data

    const placeholders = ids.map(() => "?").join(",")
    const rows = (await query(
      `SELECT user_id, profile_index, name, enabled_map FROM gi_character_profiles WHERE user_id IN (${placeholders}) AND name = 'Multiplayer'`,
      ids,
    )) as Array<{
      user_id: number
      profile_index: number
      name: string | null
      enabled_map: any
    }>

    return NextResponse.json({
      profiles: rows.map((r) => ({
        userId: r.user_id,
        profileIndex: r.profile_index,
        name: r.name,
        enabledMap:
          typeof r.enabled_map === "string"
            ? JSON.parse(r.enabled_map)
            : r.enabled_map,
      })),
    })
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load profiles" },
      { status: 500 },
    )
  }
}

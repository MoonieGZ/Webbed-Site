import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { z } from "zod"

async function requireUser(
  request: NextRequest,
): Promise<{ id: number } | null> {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) return null
  const row = (await query(
    "SELECT u.id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW() LIMIT 1",
    [sessionToken],
  )) as Array<{ id: number }>
  return row?.[0] ?? null
}

export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request)
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const bodySchema = z.object({
      ids: z.array(z.number().int().positive()).min(1),
    })
    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) return NextResponse.json({ users: [] })
    const { ids } = parseResult.data

    const placeholders = ids.map(() => "?").join(",")
    const rows = (await query(
      `SELECT id, name, title, avatar FROM users WHERE id IN (${placeholders})`,
      ids,
    )) as Array<{
      id: number
      name: string | null
      title: string | null
      avatar: string | null
    }>

    return NextResponse.json({
      users: rows.map((r) => ({
        id: r.id,
        name: r.name,
        title: r.title,
        avatar: r.avatar,
      })),
    })
  } catch (e) {
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}

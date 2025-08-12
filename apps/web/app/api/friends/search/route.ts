import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"

async function requireUser(
  request: NextRequest,
): Promise<{ id: number } | null> {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) return null
  const user = (await queryOne(
    "SELECT u.id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
    [sessionToken],
  )) as { id: number } | null
  return user
}

export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request)
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    if (!q) return NextResponse.json({ users: [] })

    const friendIds = (await query(
      `SELECT CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END AS friend_id
       FROM user_friends
       WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'`,
      [me.id, me.id, me.id],
    )) as Array<{ friend_id: number }>

    const excludeIds = new Set<number>([
      me.id,
      ...friendIds.map((f) => f.friend_id),
    ])

    const candidates = (await query(
      `SELECT id, name, title, avatar
       FROM users
       WHERE (name LIKE ?)
       ORDER BY id ASC
       LIMIT 20`,
      [`%${q}%`],
    )) as Array<{
      id: number
      name: string
      title: string | null
      avatar: string | null
    }>

    const users = candidates.filter((u) => !excludeIds.has(u.id))

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Friends search error:", error)
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 },
    )
  }
}

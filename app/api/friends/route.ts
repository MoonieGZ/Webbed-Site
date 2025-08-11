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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)),
    )

    const countRows = (await query(
      `SELECT COUNT(*) AS cnt
       FROM user_friends f
       WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'`,
      [me.id, me.id],
    )) as Array<{ cnt: number }>
    const total = countRows?.[0]?.cnt ?? 0

    const friends = (await query(
      `SELECT 
         CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END AS friend_id
       FROM user_friends f
       WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
       ORDER BY friend_id ASC
       LIMIT ? OFFSET ?`,
      [me.id, me.id, me.id, pageSize, (page - 1) * pageSize],
    )) as Array<{ friend_id: number }>

    const friendIds = friends.map((r) => r.friend_id)
    if (friendIds.length === 0) {
      return NextResponse.json({ friends: [] })
    }

    const users = (await query(
      `SELECT u.id, u.name, u.title, u.avatar
       FROM users u
       WHERE u.id IN (${friendIds.map(() => "?").join(",")})`,
      friendIds,
    )) as Array<{
      id: number
      name: string
      title: string | null
      avatar: string | null
    }>

    const featured = (await query(
      `SELECT fb.user_id, b.id, b.name, b.icon_url
       FROM user_featured_badges fb
       JOIN badges b ON b.id = fb.badge_id
       WHERE fb.user_id IN (${friendIds.map(() => "?").join(",")})
       ORDER BY fb.user_id ASC, fb.slot ASC`,
      friendIds,
    )) as Array<{
      user_id: number
      id: number
      name: string
      icon_url: string | null
    }>

    const userIdToBadges = new Map<
      number,
      Array<{ id: number; name: string; icon_url: string | null }>
    >()
    for (const f of featured) {
      const arr = userIdToBadges.get(f.user_id) ?? []
      if (arr.length < 3)
        arr.push({ id: f.id, name: f.name, icon_url: f.icon_url })
      userIdToBadges.set(f.user_id, arr)
    }

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      title: u.title,
      avatar: u.avatar,
      badges: userIdToBadges.get(u.id) ?? [],
    }))

    return NextResponse.json({ page, pageSize, total, friends: result })
  } catch (error) {
    console.error("Friends GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 },
    )
  }
}

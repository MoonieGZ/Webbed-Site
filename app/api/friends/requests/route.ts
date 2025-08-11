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
    const typeParam = (searchParams.get("type") || "").toLowerCase()
    const filter =
      typeParam === "received" || typeParam === "sent" || typeParam === "blocked"
        ? typeParam
        : "all"

    const joinParams = [me.id, me.id]
    const whereClause =
      filter === "received"
        ? "f.addressee_id = ? AND f.status = 'pending'"
        : filter === "sent"
          ? "f.requester_id = ? AND f.status = 'pending'"
          : filter === "blocked"
            ? "(f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'blocked'"
            : "(f.requester_id = ? OR f.addressee_id = ?)"
    const whereParams = filter === "blocked" || filter === "all" ? [me.id, me.id] : [me.id]
    const rows = (await query(
      `SELECT 
         f.id, f.requester_id, f.addressee_id, f.status, f.created_at, f.updated_at,
         u.id AS user_id, u.name AS user_name, u.title AS user_title, u.avatar AS user_avatar
       FROM user_friends f
       JOIN users u ON (
         (f.requester_id = ? AND u.id = f.addressee_id) OR
         (f.addressee_id = ? AND u.id = f.requester_id)
       )
       WHERE ${whereClause}
       ORDER BY f.created_at DESC`,
      [...joinParams, ...whereParams],
    )) as Array<{
      id: number
      requester_id: number
      addressee_id: number
      status: string
      created_at: string
      updated_at: string | null
      user_id: number
      user_name: string
      user_title: string | null
      user_avatar: string | null
    }>

    const requests = rows.map((r) => ({
      id: r.id,
      requester_id: r.requester_id,
      addressee_id: r.addressee_id,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      user: {
        id: r.user_id,
        name: r.user_name,
        title: r.user_title,
        avatar: r.user_avatar,
      },
      type:
        r.status === "blocked"
          ? ("blocked" as const)
          : r.status === "pending"
            ? (r.addressee_id === me.id ? ("received" as const) : ("sent" as const))
            : ("accepted" as const),
    }))

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Friend requests GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request)
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await request.json()) as { userId?: number }
    const otherId = body.userId
    if (!otherId || !Number.isFinite(otherId) || otherId === me.id) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }

    const existing = (await queryOne(
      `SELECT id, status FROM user_friends 
       WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
       LIMIT 1`,
      [me.id, otherId, otherId, me.id],
    )) as { id: number; status: string } | null

    if (existing) {
      if (existing.status === "accepted") {
        return NextResponse.json({ error: "Already friends" }, { status: 400 })
      }
      if (existing.status === "blocked") {
        return NextResponse.json(
          { error: "Cannot send request (blocked)" },
          { status: 400 },
        )
      }
      if (existing.status === "pending") {
        return NextResponse.json(
          { error: "Request already exists" },
          { status: 400 },
        )
      }
      if (existing.status === "declined") {
        // Allow resending by updating to pending if direction is me -> other
        await query(
          `UPDATE user_friends SET requester_id = ?, addressee_id = ?, status = 'pending', updated_at = NOW() WHERE id = ?`,
          [me.id, otherId, existing.id],
        )
        return NextResponse.json({ success: true })
      }
    }

    await query(
      `INSERT INTO user_friends (requester_id, addressee_id, status) VALUES (?, ?, 'pending')`,
      [me.id, otherId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Friend requests POST error:", error)
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 },
    )
  }
}

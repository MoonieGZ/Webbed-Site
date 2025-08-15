import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { emitFriendPendingCount, emitFriendAccepted } from "@/lib/realtime"

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const me = await requireUser(request)
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: idParam } = await context.params
    const id = parseInt(idParam, 10)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = (await request.json()) as { action?: string }
    const action = (body.action || "").toLowerCase()

    const existing = (await queryOne(
      `SELECT id, requester_id, addressee_id, status FROM user_friends WHERE id = ?`,
      [id],
    )) as {
      id: number
      requester_id: number
      addressee_id: number
      status: string
    } | null
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (action === "accept") {
      if (existing.addressee_id !== me.id || existing.status !== "pending")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      await query(
        `UPDATE user_friends SET status = 'accepted', updated_at = NOW() WHERE id = ?`,
        [id],
      )

      const addresseeRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [me.id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(me.id, addresseeRow?.cnt ?? 0)
      const requesterRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [existing.requester_id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(
        existing.requester_id,
        requesterRow?.cnt ?? 0,
      )

      const meRow = (await queryOne("SELECT id, name FROM users WHERE id = ?", [
        me.id,
      ])) as { id: number; name: string | null } | null
      if (meRow) {
        await emitFriendAccepted(existing.requester_id, {
          id: meRow.id,
          name: meRow.name ?? null,
        })
      }
      return NextResponse.json({ success: true })
    }

    if (action === "decline") {
      if (existing.addressee_id !== me.id || existing.status !== "pending")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      await query(
        `UPDATE user_friends SET status = 'declined', updated_at = NOW() WHERE id = ?`,
        [id],
      )
      const myRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [me.id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(me.id, myRow?.cnt ?? 0)
      const requesterRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [existing.requester_id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(
        existing.requester_id,
        requesterRow?.cnt ?? 0,
      )
      return NextResponse.json({ success: true })
    }

    if (action === "cancel") {
      if (existing.requester_id !== me.id || existing.status !== "pending")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      await query(`DELETE FROM user_friends WHERE id = ?`, [id])
      const requesterRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [me.id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(me.id, requesterRow?.cnt ?? 0)
      const addresseeRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [existing.addressee_id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(
        existing.addressee_id,
        addresseeRow?.cnt ?? 0,
      )
      return NextResponse.json({ success: true })
    }

    if (action === "block") {
      if (existing.requester_id !== me.id && existing.addressee_id !== me.id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      await query(
        `UPDATE user_friends SET status = 'blocked', updated_at = NOW() WHERE id = ?`,
        [id],
      )
      const myRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [me.id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(me.id, myRow?.cnt ?? 0)
      const otherId =
        existing.requester_id === me.id
          ? existing.addressee_id
          : existing.requester_id
      const otherRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [otherId],
      )) as { cnt: number } | null
      await emitFriendPendingCount(otherId, otherRow?.cnt ?? 0)
      return NextResponse.json({ success: true })
    }

    if (action === "unblock") {
      if (existing.requester_id !== me.id && existing.addressee_id !== me.id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      await query(
        `DELETE FROM user_friends WHERE id = ? AND status = 'blocked'`,
        [id],
      )
      const myRow = (await queryOne(
        "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
        [me.id],
      )) as { cnt: number } | null
      await emitFriendPendingCount(me.id, myRow?.cnt ?? 0)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
  } catch (error) {
    console.error("Friend request update error:", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { ADMIN_USER_ID } from "@/lib/admin"
import { query } from "@/lib/db"
import { rm } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value
    const requester = sessionToken ? await getUserBySession(sessionToken) : null
    if (!requester || requester.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)),
    )
    const q = (searchParams.get("q") || "").trim()

    const whereClause = q ? "WHERE (u.name LIKE ? OR u.email LIKE ?)" : ""
    const whereParams = q ? [`%${q}%`, `%${q}%`] : []

    const countRows = (await query(
      `SELECT COUNT(*) AS cnt FROM users u ${whereClause}`,
      whereParams,
    )) as Array<{ cnt: number }>
    const total = countRows?.[0]?.cnt ?? 0

    const offset = (page - 1) * pageSize
    const users = (await query(
      `SELECT u.id, u.name, u.email, u.avatar,
              up.can_change_user, up.can_change_avatar, up.is_banned
       FROM users u
       LEFT JOIN user_permissions up ON up.user_id = u.id
       ${whereClause}
       ORDER BY u.id ASC
       LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset],
    )) as Array<{
      id: number
      name: string
      email: string
      avatar: string | null
      can_change_user: 0 | 1 | null
      can_change_avatar: 0 | 1 | null
      is_banned: 0 | 1 | null
    }>

    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      permissions: {
        can_change_user: (u.can_change_user ?? 1) as 0 | 1,
        can_change_avatar: (u.can_change_avatar ?? 1) as 0 | 1,
        is_banned: (u.is_banned ?? 0) as 0 | 1,
      },
    }))

    return NextResponse.json({ page, pageSize, total, users: data })
  } catch (error) {
    console.error("Admin users list error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
      userIds?: number[]
      action?:
        | "restrict_user"
        | "restrict_avatar"
        | "ban"
        | "allow_user"
        | "allow_avatar"
        | "unban"
    }
    const { userIds, action } = body
    if (
      !userIds ||
      !Array.isArray(userIds) ||
      userIds.length === 0 ||
      !action
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const setClause =
      action === "restrict_user"
        ? "can_change_user = 0"
        : action === "restrict_avatar"
          ? "can_change_avatar = 0"
          : action === "ban"
            ? "is_banned = 1"
            : action === "allow_user"
              ? "can_change_user = 1"
              : action === "allow_avatar"
                ? "can_change_avatar = 1"
                : action === "unban"
                  ? "is_banned = 0"
                  : null
    if (!setClause) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
    }

    const values = userIds.map(() => "(?)").join(",")
    await query(
      `INSERT IGNORE INTO user_permissions (user_id) VALUES ${values}`,
      userIds,
    )

    await query(
      `UPDATE user_permissions SET ${setClause} WHERE user_id IN (${userIds.map(() => "?").join(",")})`,
      userIds,
    )

    if (action === "restrict_user") {
      await query(
        `UPDATE users SET name = NULL WHERE id IN (${userIds.map(() => "?").join(",")})`,
        userIds,
      )
    }

    if (action === "restrict_avatar") {
      await query(
        `UPDATE users SET avatar = NULL WHERE id IN (${userIds.map(() => "?").join(",")})`,
        userIds,
      )

      const baseDir = join(process.cwd(), "public", "avatars")
      await Promise.allSettled(
        userIds.map((id) =>
          rm(join(baseDir, String(id)), { recursive: true, force: true }),
        ),
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin users bulk update error:", error)
    return NextResponse.json(
      { error: "Failed to apply bulk action" },
      { status: 500 },
    )
  }
}

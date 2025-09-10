import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { SessionUser } from "@/types/session"
import { z } from "zod"

async function requireUser(request: NextRequest): Promise<SessionUser | null> {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) return null
  const user = (await queryOne(
    "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
    [sessionToken],
  )) as SessionUser | null
  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const titles = (await query(
      `SELECT b.title
       FROM user_badges ub
       JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = ?
       ORDER BY ub.badge_id ASC`,
      [user.id],
    )) as Array<{ title: string }>

    const current = (await queryOne("SELECT title FROM users WHERE id = ?", [
      user.id,
    ])) as { title: string | null } | null

    return NextResponse.json({
      titles: titles.map((t) => t.title).filter((t) => !!t),
      currentTitle: current?.title ?? null,
    })
  } catch (error) {
    console.error("Title GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch titles" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const bodySchema = z.object({ title: z.string().min(1).max(64).nullable() })
    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    const { title } = parseResult.data

    if (title !== null) {
      const owns = (await queryOne(
        `SELECT 1 AS ok
         FROM user_badges ub
         JOIN badges b ON b.id = ub.badge_id
         WHERE ub.user_id = ? AND b.title = ?
         LIMIT 1`,
        [user.id, title],
      )) as { ok: number } | null

      if (!owns) {
        return NextResponse.json(
          { error: "You do not own this title" },
          { status: 400 },
        )
      }
    }

    await query("UPDATE users SET title = ? WHERE id = ?", [title, user.id])

    return NextResponse.json({ success: true, title })
  } catch (error) {
    console.error("Title PUT error:", error)
    return NextResponse.json(
      { error: "Failed to update title" },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { SessionUser } from "@/types/session"
import { z } from "zod"

async function requireUser(request: NextRequest): Promise<SessionUser | null> {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) return null
  const user = (await queryOne(
    "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW() LIMIT 1",
    [sessionToken],
  )) as SessionUser | null
  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ownedBadges = (await query(
      `SELECT b.id, b.name, b.description, b.icon_url, ub.earned_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = ?
       ORDER BY b.name`,
      [user.id],
    )) as Array<{
      id: number
      name: string
      description: string
      icon_url: string
      earned_at: string
    }>

    const featured = (await query(
      `SELECT slot, badge_id
       FROM user_featured_badges
       WHERE user_id = ?
       ORDER BY slot`,
      [user.id],
    )) as Array<{ slot: number; badge_id: number }>

    const slots: Array<number | null> = [null, null, null]
    for (const f of featured) {
      if (f.slot >= 1 && f.slot <= 3) slots[f.slot - 1] = f.badge_id
    }

    return NextResponse.json({ ownedBadges, featuredSlots: slots })
  } catch (error) {
    console.error("Badges GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bodySchema = z.object({
      slots: z
        .array(z.number().int().positive().nullable())
        .length(3, { message: "slots must have length 3" }),
    })
    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }
    const { slots } = parseResult.data

    const nonNullIds = slots.filter((v) => v != null) as number[]
    const uniqueIds = new Set(nonNullIds)
    if (uniqueIds.size !== nonNullIds.length) {
      return NextResponse.json(
        { error: "Duplicate badges are not allowed across slots" },
        { status: 400 },
      )
    }

    let owns: Array<{ badge_id: number }> = []
    if (nonNullIds.length > 0) {
      owns = (await query(
        `SELECT badge_id FROM user_badges WHERE user_id = ? AND badge_id IN (${nonNullIds
          .map(() => "?")
          .join(",")})`,
        [user.id, ...nonNullIds],
      )) as Array<{ badge_id: number }>
      const ownedSet = new Set(owns.map((o) => o.badge_id))
      for (const id of nonNullIds) {
        if (!ownedSet.has(id)) {
          return NextResponse.json(
            { error: `Badge ${id} is not owned by user` },
            { status: 400 },
          )
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      const slot = i + 1
      const badgeId = slots[i]
      if (badgeId == null) {
        await query(
          `DELETE FROM user_featured_badges WHERE user_id = ? AND slot = ?`,
          [user.id, slot],
        )
      } else {
        await query(
          `INSERT INTO user_featured_badges (user_id, badge_id, slot)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE badge_id = VALUES(badge_id)`,
          [user.id, badgeId, slot],
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Badges PUT error:", error)
    return NextResponse.json(
      { error: "Failed to update featured badges" },
      { status: 500 },
    )
  }
}

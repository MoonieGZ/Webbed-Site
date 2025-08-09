import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"

interface SessionUser {
  id: number
  email: string
}

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

    // Normalize to fixed 3 slots
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

    const body = await request.json()
    const slots = body?.slots as Array<number | null> | undefined
    if (!Array.isArray(slots) || slots.length !== 3) {
      return NextResponse.json(
        { error: "Invalid payload: expected slots array of length 3" },
        { status: 400 },
      )
    }

    // Validate uniqueness of non-null badge ids across slots
    const nonNullIds = slots.filter((v) => v != null) as number[]
    const uniqueIds = new Set(nonNullIds)
    if (uniqueIds.size !== nonNullIds.length) {
      return NextResponse.json(
        { error: "Duplicate badges are not allowed across slots" },
        { status: 400 },
      )
    }

    // Validate that provided badges belong to the user
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

    // Apply updates per slot
    for (let i = 0; i < 3; i++) {
      const slot = i + 1
      const badgeId = slots[i]
      if (badgeId == null) {
        await query(
          `DELETE FROM user_featured_badges WHERE user_id = ? AND slot = ?`,
          [user.id, slot],
        )
      } else {
        // Ensure row exists or update. Primary key is (user_id, slot)
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



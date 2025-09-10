import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = (await queryOne(
      "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
      [sessionToken],
    )) as { id: number; email: string } | null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parameterized query; user id bound positionally
    const gameUIDs = await query(
      "SELECT game, uid, created_at, updated_at FROM user_game_uids WHERE user_id = ? ORDER BY created_at DESC",
      [user.id],
    )

    return NextResponse.json(gameUIDs)
  } catch (error) {
    console.error("Game UIDs fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch game UIDs" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = (await queryOne(
      "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
      [sessionToken],
    )) as { id: number; email: string } | null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bodySchema = z.object({
      game: z.enum(["gi", "hsr", "zzz", "ww"]),
      uid: z.string().min(1).max(64),
    })
    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    const { game, uid } = parseResult.data

    const existingUID = await queryOne(
      "SELECT id FROM user_game_uids WHERE user_id = ? AND game = ?",
      [user.id, game],
    )

    if (existingUID) {
      // Parameterized upsert-like update path
      await query(
        "UPDATE user_game_uids SET uid = ?, updated_at = NOW() WHERE user_id = ? AND game = ?",
        [uid.trim(), user.id, game],
      )
    } else {
      // Parameterized insert path
      await query(
        "INSERT INTO user_game_uids (user_id, game, uid, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [user.id, game, uid.trim()],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Game UID save error:", error)
    return NextResponse.json(
      { error: "Failed to save game UID" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = (await queryOne(
      "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
      [sessionToken],
    )) as { id: number; email: string } | null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchSchema = z.object({ game: z.enum(["gi", "hsr", "zzz", "ww"]) })
    const game = searchSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams)).success
      ? (Object.fromEntries(new URL(request.url).searchParams).game as "gi" | "hsr" | "zzz" | "ww")
      : null
    if (!game) {
      return NextResponse.json({ error: "Invalid or missing game" }, { status: 400 })
    }

    // Parameterized delete
    await query("DELETE FROM user_game_uids WHERE user_id = ? AND game = ?", [
      user.id,
      game,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Game UID delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete game UID" },
      { status: 500 },
    )
  }
}

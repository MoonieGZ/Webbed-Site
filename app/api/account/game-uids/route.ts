import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"

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

    const { game, uid } = await request.json()

    if (!game || !uid) {
      return NextResponse.json(
        { error: "Game and UID are required" },
        { status: 400 },
      )
    }

    // Validate game enum
    const validGames = ["gi", "hsr", "zzz", "ww"]
    if (!validGames.includes(game)) {
      return NextResponse.json(
        { error: "Invalid game specified" },
        { status: 400 },
      )
    }

    const existingUID = await queryOne(
      "SELECT id FROM user_game_uids WHERE user_id = ? AND game = ?",
      [user.id, game],
    )

    if (existingUID) {
      // Update existing UID
      await query(
        "UPDATE user_game_uids SET uid = ?, updated_at = NOW() WHERE user_id = ? AND game = ?",
        [uid.trim(), user.id, game],
      )
    } else {
      // Insert new UID
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

    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game")

    if (!game) {
      return NextResponse.json(
        { error: "Game parameter is required" },
        { status: 400 },
      )
    }

    // Validate game enum
    const validGames = ["gi", "hsr", "zzz", "ww"]
    if (!validGames.includes(game)) {
      return NextResponse.json(
        { error: "Invalid game specified" },
        { status: 400 },
      )
    }

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

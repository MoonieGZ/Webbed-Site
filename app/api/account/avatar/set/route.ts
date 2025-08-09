import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { query } from "@/lib/db"
import { getRecentAvatars } from "@/lib/avatar-utils"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserBySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const recentCountResult = (await query(
      "SELECT COUNT(*) AS cnt FROM user_avatar_changes WHERE user_id = ? AND created_at > (NOW() - INTERVAL 1 MINUTE)",
      [user.id],
    )) as Array<{ cnt: number }>
    const recentCount = recentCountResult?.[0]?.cnt ?? 0
    if (recentCount >= 3) {
      return NextResponse.json(
        {
          error:
            "You can change your avatar at most 3 times per minute. Please wait before trying again.",
        },
        { status: 429 },
      )
    }

    const { filename } = await request.json()

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      )
    }

    const recentAvatars = await getRecentAvatars(user.id, 10)
    const avatarExists = recentAvatars.some(
      (avatar) => avatar.filename === filename,
    )

    if (!avatarExists) {
      return NextResponse.json(
        { error: "Avatar not found in recent avatars" },
        { status: 400 },
      )
    }

    const avatarPath = `/avatars/${user.id}/${filename}`
    await query("UPDATE users SET avatar = ? WHERE id = ?", [
      avatarPath,
      user.id,
    ])

    await query(
      "INSERT INTO user_avatar_changes (user_id, avatar_path) VALUES (?, ?)",
      [user.id, avatarPath],
    )

    return NextResponse.json({
      success: true,
      avatar: avatarPath,
    })
  } catch (error) {
    console.error("Error setting avatar:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

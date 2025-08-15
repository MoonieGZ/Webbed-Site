import { NextRequest, NextResponse } from "next/server"
import { validateSession, getUserBySession } from "@/lib/session"
import { query } from "@/lib/db"
import { cleanupOldAvatars, detectImageMime } from "@/lib/avatar-utils"
import crypto from "crypto"
import fs from "fs/promises"
import path from "path"
import { DiscordWebhookService } from "@/services/discord-webhook"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = await getUserBySession(sessionToken)

    if (!user || user.permissions?.is_banned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.permissions?.can_change_avatar) {
      return NextResponse.json(
        { error: "Changing avatar is restricted" },
        { status: 403 },
      )
    }

    const { email } = await request.json()

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

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailHash = crypto
      .createHash("md5")
      .update(email.toLowerCase().trim())
      .digest("hex")

    const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=200&d=404`

    const response = await fetch(gravatarUrl)

    if (!response.ok) {
      return NextResponse.json(
        { error: "No Gravatar found for this email" },
        { status: 404 },
      )
    }

    const imageBuffer = await response.arrayBuffer()
    const imageData = Buffer.from(imageBuffer)

    const fileExtension = "jpg"
    const fileName = `gravatar-${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${fileExtension}`

    const avatarDir = path.join(
      process.cwd(),
      "uploads",
      "avatars",
      user.id.toString(),
    )
    await fs.mkdir(avatarDir, { recursive: true })

    const filePath = path.join(avatarDir, fileName)
    const detected = await detectImageMime(imageData)
    if (!detected) {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 },
      )
    }
    await fs.writeFile(filePath, imageData)

    const avatarPath = `/avatars/${user.id}/${fileName}`
    await query("UPDATE users SET avatar = ? WHERE id = ?", [
      avatarPath,
      user.id,
    ])

    await cleanupOldAvatars(user.id, 5)

    await query(
      "INSERT INTO user_avatar_changes (user_id, avatar_path, created_at) VALUES (?, ?, NOW())",
      [user.id, avatarPath],
    )

    const avatarUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${avatarPath}`
    await DiscordWebhookService.notifyGravatarImport(user, avatarUrl)

    return NextResponse.json({
      success: true,
      avatar: `/avatars/${user.id}/${fileName}`,
    })
  } catch (error) {
    console.error("Gravatar import error:", error)
    return NextResponse.json(
      { error: "Failed to import Gravatar" },
      { status: 500 },
    )
  }
}

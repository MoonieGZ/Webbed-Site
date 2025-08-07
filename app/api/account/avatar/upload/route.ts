import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import crypto from "crypto"
import { getUserBySession } from "@/lib/session"
import { query } from "@/lib/db"
import { cleanupOldAvatars } from "@/lib/avatar-utils"
import { DiscordWebhookService } from "@/services/discord-webhook"

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

    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      )
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"]

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP" },
        { status: 400 },
      )
    }

    const hash = crypto
      .createHash("md5")
      .update(`${user.id}-${Date.now()}-${Math.random()}`)
      .digest("hex")
    const filename = `${hash}.${fileExtension}`

    const userAvatarDir = join(
      process.cwd(),
      "public",
      "avatars",
      user.id.toString(),
    )
    await mkdir(userAvatarDir, { recursive: true })

    const filePath = join(userAvatarDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const avatarPath = `/avatars/${user.id}/${filename}`
    await query("UPDATE users SET avatar = ? WHERE id = ?", [
      avatarPath,
      user.id,
    ])

    await cleanupOldAvatars(user.id, 10)

    const avatarUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${avatarPath}`
    await DiscordWebhookService.notifyAvatarUpload(user, avatarUrl)

    return NextResponse.json({
      success: true,
      avatar: avatarPath,
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

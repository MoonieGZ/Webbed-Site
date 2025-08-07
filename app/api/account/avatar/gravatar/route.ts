import { NextRequest, NextResponse } from "next/server"
import { validateSession, getUserBySession } from "@/lib/session"
import { query } from "@/lib/db"
import { cleanupOldAvatars } from "@/lib/avatar-utils"
import crypto from "crypto"
import fs from "fs/promises"
import path from "path"

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { email } = await request.json()

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
      "public",
      "avatars",
      user.id.toString(),
    )
    await fs.mkdir(avatarDir, { recursive: true })

    const filePath = path.join(avatarDir, fileName)
    await fs.writeFile(filePath, imageData)

    const avatarPath = `/avatars/${user.id}/${fileName}`
    await query("UPDATE users SET avatar = ? WHERE id = ?", [
      avatarPath,
      user.id,
    ])

    await cleanupOldAvatars(user.id, 10)

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

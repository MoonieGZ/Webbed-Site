import { NextRequest, NextResponse } from "next/server"
import { createMagicLink, sendMagicLinkEmail, queryOne } from "@/lib/magic-link"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const existingUser = (await queryOne(
      "SELECT id FROM users WHERE email = ?",
      [email],
    )) as { id: number } | null

    const token = await createMagicLink(email, existingUser?.id || undefined)

    await sendMagicLinkEmail(email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Magic link error:", error)
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 },
    )
  }
}

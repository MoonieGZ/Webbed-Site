import { NextRequest, NextResponse } from "next/server"
import { createMagicLink, sendMagicLinkEmail, queryOne } from "@/lib/magic-link"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const ipHeader =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      ""
    const ip = ipHeader.split(",")[0].trim()
    const userAgent = request.headers.get("user-agent") || ""

    const lastRequest = (await queryOne(
      "SELECT created_at FROM magic_links WHERE email = ? AND ip_address = ? ORDER BY created_at DESC LIMIT 1",
      [email, ip],
    )) as { created_at: string } | null

    if (lastRequest) {
      const last = new Date(lastRequest.created_at).getTime()
      const now = Date.now()
      const diffMs = now - last
      const minIntervalMs = 2 * 60 * 1000
      if (diffMs < minIntervalMs) {
        const waitSec = Math.ceil((minIntervalMs - diffMs) / 1000)
        return NextResponse.json(
          {
            error: `Please wait ${waitSec}s before requesting another link for this email.`,
          },
          { status: 429 },
        )
      }
    }

    const hourlyCount = (await queryOne(
      "SELECT COUNT(DISTINCT email) AS cnt FROM magic_links WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 1 HOUR)",
      [ip],
    )) as { cnt: number } | null

    const perEmailHourly = (await queryOne(
      "SELECT COUNT(*) AS cnt FROM magic_links WHERE email = ? AND created_at > (NOW() - INTERVAL 1 HOUR)",
      [email],
    )) as { cnt: number } | null

    if ((hourlyCount?.cnt ?? 0) >= 3 || (perEmailHourly?.cnt ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Too many requests for this email in the last hour. Please try again later." },
        { status: 429 },
      )
    }

    const existingUser = (await queryOne(
      "SELECT id FROM users WHERE email = ?",
      [email],
    )) as { id: number } | null

    const token = await createMagicLink(
      email,
      existingUser?.id || undefined,
      ip,
      userAgent,
    )

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

import { NextRequest, NextResponse } from "next/server"
import { createMagicLink, sendMagicLinkEmail, queryOne } from "@/lib/magic-link"
import { User } from "@/types/magic-link"
import { defaultPermissions, UserPermissions } from "@/lib/admin"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const bodySchema = z.object({ email: z.string().email().max(255) })
    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }
    const { email } = parseResult.data

    const ipHeader =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      ""
    const ip = ipHeader.split(",")[0].trim()
    const userAgent = request.headers.get("user-agent") || ""

    // Parameterized rate-limit check for this email + IP
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

    // Parameterized IP-scoped hourly limit
    const hourlyCount = (await queryOne(
      "SELECT COUNT(DISTINCT email) AS cnt FROM magic_links WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 1 HOUR)",
      [ip],
    )) as { cnt: number } | null

    // Parameterized email-scoped hourly limit
    const perEmailHourly = (await queryOne(
      "SELECT COUNT(*) AS cnt FROM magic_links WHERE email = ? AND created_at > (NOW() - INTERVAL 1 HOUR)",
      [email],
    )) as { cnt: number } | null

    if ((hourlyCount?.cnt ?? 0) >= 3 || (perEmailHourly?.cnt ?? 0) >= 3) {
      return NextResponse.json(
        {
          error:
            "Too many requests for this email in the last hour. Please try again later.",
        },
        { status: 429 },
      )
    }

    const existingUser = (await queryOne(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    )) as { id: number } | null

    if (existingUser?.id) {
      const user = await getUserById(existingUser.id)
      if (user?.permissions?.is_banned) {
        return NextResponse.json(
          { error: "Account is banned" },
          { status: 403 },
        )
      }
    }

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

async function getUserById(id: number) {
  const user = (await queryOne("SELECT * FROM users WHERE id = ? LIMIT 1", [
    id,
  ])) as User | null
  const perms = (await queryOne(
    "SELECT * FROM user_permissions WHERE user_id = ? LIMIT 1",
    [id],
  )) as UserPermissions | null
  return { ...user, permissions: perms ?? defaultPermissions }
}

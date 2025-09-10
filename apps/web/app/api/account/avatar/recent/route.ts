import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { getRecentAvatars } from "@/lib/avatar-utils"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserBySession(sessionToken)

    if (!user || user.permissions?.is_banned) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const qs = Object.fromEntries(new URL(request.url).searchParams)
    const schema = z.object({ limit: z.coerce.number().int().positive().max(50).default(10) })
    const parsed = schema.safeParse(qs)
    const limit = parsed.success ? parsed.data.limit : 10
    const recentAvatars = await getRecentAvatars(user.id, limit)

    return NextResponse.json({
      success: true,
      avatars: recentAvatars,
    })
  } catch (error) {
    console.error("Error fetching recent avatars:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

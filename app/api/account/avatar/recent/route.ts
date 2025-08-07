import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { getRecentAvatars } from "@/lib/avatar-utils"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserBySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const recentAvatars = await getRecentAvatars(user.id, 10)

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

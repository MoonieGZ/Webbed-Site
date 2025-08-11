import { NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/db"

async function requireUser(
  request: NextRequest,
): Promise<{ id: number } | null> {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) return null
  const user = (await queryOne(
    "SELECT u.id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
    [sessionToken],
  )) as { id: number } | null
  return user
}

export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request)
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const row = (await queryOne(
      "SELECT COUNT(*) AS cnt FROM user_friends WHERE addressee_id = ? AND status = 'pending'",
      [me.id],
    )) as { cnt: number } | null

    const pendingCount = row?.cnt ?? 0
    return NextResponse.json({ pendingCount })
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch count" },
      { status: 500 },
    )
  }
}

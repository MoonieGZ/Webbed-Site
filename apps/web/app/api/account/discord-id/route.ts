import { query, queryOne } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = (await queryOne(
    "SELECT u.id, u.email, u.discord_id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
    [sessionToken],
  )) as { id: number; email: string; discord_id: string } | null
  return NextResponse.json({ discordId: user?.discord_id || null })
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = (await queryOne(
    "SELECT u.id, u.email, u.discord_id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
    [sessionToken],
  )) as { id: number; email: string; discord_id: string } | null
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { discordId } = await request.json()

  // Validate Discord ID format (optional - you can adjust the regex as needed)
  if (discordId && !/^\d{17,19}$/.test(discordId)) {
    return NextResponse.json(
      { error: "Invalid Discord ID format" },
      { status: 400 },
    )
  }

  await query("UPDATE users SET discord_id = ? WHERE id = ?", [
    discordId || null,
    user.id,
  ])
  return NextResponse.json({ discordId: discordId || null })
}

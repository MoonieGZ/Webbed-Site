import { query, queryOne } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = (await queryOne(
    "SELECT u.id, u.email, u.discord_id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW() LIMIT 1",
    [sessionToken],
  )) as { id: number; email: string; discord_id: string | null } | null
  return NextResponse.json({ discordId: user?.discord_id || null })
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = (await queryOne(
    "SELECT u.id, u.email, u.discord_id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW() LIMIT 1",
    [sessionToken],
  )) as { id: number; email: string; discord_id: string | null } | null
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const bodySchema = z.object({
    discordId: z
      .string()
      .regex(/^\d{17,19}$/, { message: "Invalid Discord ID" })
      .nullable()
      .optional(),
  })
  const parseResult = bodySchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
  const { discordId } = parseResult.data

  await query("UPDATE users SET discord_id = ? WHERE id = ?", [
    discordId ?? null,
    user.id,
  ])
  return NextResponse.json({ discordId: discordId || null })
}

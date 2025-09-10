import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { queryOne } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = (await queryOne(
      "SELECT u.id FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
      [sessionToken],
    )) as { id: number } | null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const secret = process.env.WS_JWT_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "WS_JWT_SECRET not configured" },
        { status: 500 },
      )
    }

    const issuer = process.env.WS_JWT_ISSUER || "apps/web"
    const audience = process.env.WS_JWT_AUDIENCE || "ws"

    const token = jwt.sign(
      { typ: "ws-token" },
      secret,
      {
        subject: String(user.id),
        expiresIn: "10m",
        issuer,
        audience,
        algorithm: "HS512",
      },
    )

    return NextResponse.json({ token })
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to issue token" },
      { status: 500 },
    )
  }
}

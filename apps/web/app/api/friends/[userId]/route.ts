import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { z } from "zod"

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

export async function DELETE(request: NextRequest, context: any) {
  try {
    const { params } = context as { params: { userId: string } }
    const me = await requireUser(request)
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const paramSchema = z.object({ userId: z.coerce.number().int().positive() })
    const parsed = paramSchema.safeParse(params)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }
    const otherId = parsed.data.userId

    await query(
      `DELETE FROM user_friends 
       WHERE ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))
         AND status = 'accepted'`,
      [me.id, otherId, otherId, me.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Friends DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 },
    )
  }
}

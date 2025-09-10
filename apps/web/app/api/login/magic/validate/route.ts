import { NextRequest, NextResponse } from "next/server"
import { validateMagicLink, createUser } from "@/lib/magic-link"
import { createSession } from "@/lib/session"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const bodySchema = z.object({ token: z.string().min(1).max(1024) })
    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }
    const { token } = parseResult.data

    const result = await validateMagicLink(token)

    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      )
    }

    let userId: number
    let userPayload: { id: number; email: string } | null = null

    if (result.shouldCreateUser) {
      const newUser = await createUser(result.email)
      userId = newUser.id
      userPayload = { id: newUser.id, email: newUser.email }
    } else {
      userId = result.user!.id
      userPayload = { id: result.user!.id, email: result.user!.email }
    }

    const sessionToken = await createSession(userId)

    const response = NextResponse.json({ success: true, user: userPayload })

    const expiresDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresDate,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Magic link validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate magic link" },
      { status: 500 },
    )
  }
}

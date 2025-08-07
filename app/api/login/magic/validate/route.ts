import { NextRequest, NextResponse } from "next/server"
import { validateMagicLink, createUser } from "@/lib/magic-link"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const result = await validateMagicLink(token)

    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      )
    }

    let userId: number

    if (result.shouldCreateUser) {
      const newUser = await createUser(result.email)
      userId = newUser.id
    } else {
      userId = result.user!.id
    }

    const sessionToken = await createSession(userId)

    const response = NextResponse.json({
      success: true,
      user: result.shouldCreateUser ? result.user : result.user,
      shouldCreateUser: result.shouldCreateUser,
    })

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

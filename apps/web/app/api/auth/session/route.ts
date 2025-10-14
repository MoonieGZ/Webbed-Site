import { NextRequest, NextResponse } from "next/server"
import { validateSession, extendSession, getUserBySession } from "@/lib/session"
import { ADMIN_USER_ID } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false })
    }

    const session = await validateSession(sessionToken)

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    const user = await getUserBySession(sessionToken)

    if (!user || user.permissions?.is_banned) {
      return NextResponse.json({ authenticated: false })
    }

    await extendSession(sessionToken)

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "User #" + user.id,
        title: user.title,
        avatar: user.avatar ?? null,
        name_changed_at: user.name_changed_at,
        isAdmin: user.id === ADMIN_USER_ID,
        permissions: user.permissions || undefined,
      },
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
    console.error("Session check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (sessionToken) {
      const { deleteSession } = await import("@/lib/session")
      await deleteSession(sessionToken)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("session")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false })
  }
}

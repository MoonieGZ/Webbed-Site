import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateSession, getUserBySession } from "@/lib/session"
import { ADMIN_USER_ID } from "@/lib/admin"

export async function requiresAccount() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  if (!sessionToken) {
    redirect("/")
  }

  const session = await validateSession(sessionToken!)
  if (!session) {
    redirect("/")
  }

  const user = await getUserBySession(sessionToken!)
  if (!user || user.permissions?.is_banned) {
    redirect("/")
  }

  const isAdmin = user.id === ADMIN_USER_ID
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || `User #${user.id}`,
      title: user.title ?? null,
      avatar: user.avatar ?? null,
      isAdmin,
      permissions: user.permissions ?? undefined,
    },
  }
}

export async function requiresAdmin() {
  const { user } = await requiresAccount()
  if (!user.isAdmin) {
    redirect("/")
  }
  return { user }
}



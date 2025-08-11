import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(`${base}/api/auth/session`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  })
  const data = await res.json()

  if (!data?.authenticated || !data?.user?.isAdmin) {
    redirect("/")
  }

  return <>{children}</>
}

import type { ReactNode } from "react"
import { requiresAdmin } from "@/lib/guards"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  await requiresAdmin()
  return <>{children}</>
}

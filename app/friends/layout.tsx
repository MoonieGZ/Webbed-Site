import type { ReactNode } from "react"
import { requiresAccount } from "@/lib/guards"

export default async function FriendsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requiresAccount()
  return <>{children}</>
}

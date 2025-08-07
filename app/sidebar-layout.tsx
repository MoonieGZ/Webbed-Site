"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/tools/navigation/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/animate-ui/radix/sidebar"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()

  const excludedPaths = ["/login"]

  const isExcludedPath = excludedPaths.some((path) =>
    pathname?.startsWith(path),
  )

  if (isExcludedPath) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import * as React from "react"
import { Moon } from "lucide-react"
import Link from "next/link"

import { NavMain } from "@/components/navigation/nav-main"
import { NavLinks } from "@/components/navigation/nav-links"
import { NavSecondary } from "@/components/navigation/nav-secondary"
import { NavUser } from "@/components/navigation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/animate-ui/radix/sidebar"
import { useSidebarData } from "@/hooks/navigation/use-sidebar-data"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { loading, user } = useSidebarData()
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Moon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">mnsy.dev</span>
                  <span className="truncate text-xs">a webbed site</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavLinks />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            id: user?.id ?? null,
            name: user?.name ?? "Guest",
            title: user?.title ?? "",
            avatar: user?.avatar ?? "",
          }}
          loading={loading}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import * as React from "react"
import {
  Moon,
  Send,
  Settings2,
  Gamepad2,
  Webhook,
  MessageCircleHeart,
  FishSymbol,
} from "lucide-react"

import { NavMain } from "@/components/tools/navigation/nav-main"
import { NavLinks } from "@/components/tools/navigation/nav-links"
import { NavSecondary } from "@/components/tools/navigation/nav-secondary"
import { NavUser } from "@/components/tools/navigation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/animate-ui/radix/sidebar"

const data = {
  user: {
    name: "Moonsy",
    rank: "Admin",
    avatar: "/hysilens.png",
  },
  navMain: [
    {
      title: "Fimsh 1",
      url: "#",
      icon: FishSymbol,
      isActive: true,
      items: [
        {
          title: "Fimsh 1.1",
          url: "#",
        },
        {
          title: "Fimsh 1.2",
          url: "#",
        },
        {
          title: "Fimsh 1.3",
          url: "#",
        },
      ],
    },
    {
      title: "Fimsh 2",
      url: "#",
      icon: FishSymbol,
      items: [
        {
          title: "Fimsh 2.1",
          url: "#",
        },
        {
          title: "Fimsh 2.2",
          url: "#",
        },
        {
          title: "Fimsh 2.3",
          url: "#",
        },
      ],
    },
    {
      title: "Fimsh 3",
      url: "#",
      icon: FishSymbol,
      items: [
        {
          title: "Fimsh 3.1",
          url: "#",
        },
        {
          title: "Fimsh 3.2",
          url: "#",
        },
        {
          title: "Fimsh 3.3",
          url: "#",
        },
        {
          title: "Fimsh 3.4",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
    {
      title: "Bluesky",
      url: "https://bsky.app/profile/mnsy.dev",
      icon: MessageCircleHeart,
    },
  ],
  links: [
    {
      name: "PokéFarm Q",
      url: "https://pokefarm.com/",
      icon: Gamepad2,
    },
    {
      name: "PokéFarm Q API",
      url: "https://api.pokefarm.com/docs/",
      icon: Webhook,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Moon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">mnsy.dev</span>
                  <span className="truncate text-xs">a webbed site</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavLinks links={data.links} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

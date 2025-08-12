"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/animate-ui/radix/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ProfileInformationCard } from "@/components/account/profile-information-card"
import { AvatarCard } from "@/components/account/avatar-card"
import { PFQApiKeyCard } from "@/components/account/pfq-api-key-card"
import { GameUIDsCard } from "@/components/account/game-uids-card"
import { BadgesCard } from "@/components/account/badges-card"

export default function AccountPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <span>Account</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileInformationCard />
          <AvatarCard />
        </div>

        <div className="grid gap-6">
          <BadgesCard />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PFQApiKeyCard />
          <GameUIDsCard />
        </div>
      </div>
    </>
  )
}

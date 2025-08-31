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
import { SupporterCard } from "@/components/vip/supporter-card"
import { SupporterIntroCard } from "@/components/vip/supporter-intro-card"
import { SupporterProgressCard } from "@/components/vip/supporter-progress-card"

export default function VIPPage() {
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
              <BreadcrumbItem>VIP</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4">
          <SupporterIntroCard />
        </div>
        <div className="grid gap-4 md:grid-cols-2 items-stretch">
          <div className="md:col-span-2 lg:col-span-1 h-full">
            <SupporterCard />
          </div>
          <div className="md:col-span-2 lg:col-span-1 h-full">
            <SupporterProgressCard />
          </div>
        </div>
      </div>
    </>
  )
}

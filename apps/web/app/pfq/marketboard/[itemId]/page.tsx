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
import { useParams } from "next/navigation"
import { PFQMarketboardItem } from "@/components/pfq/marketboard-item"
import { PFQMarketboardSearch } from "@/components/pfq/marketboard-search"

export default function MarketboardItemPage() {
  const params = useParams()
  const itemIdParam = params?.itemId
  const itemId = Number(
    Array.isArray(itemIdParam) ? itemIdParam[0] : itemIdParam,
  )

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
                <BreadcrumbLink href="/pfq">PokéFarm Q</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/pfq/marketboard">
                  Marketboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/pfq/marketboard/${itemId}`}>
                  Item {itemId}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4">
          <PFQMarketboardSearch />
          <PFQMarketboardItem itemId={itemId} />
        </div>
      </div>
    </>
  )
}

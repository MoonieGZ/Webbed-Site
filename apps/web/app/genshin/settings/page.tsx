"use client"
import { SidebarTrigger } from "@/components/animate-ui/radix/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import GICharactersSettings from "@/components/games/gi/gi-characters-settings"
import GIBossesSettings from "@/components/games/gi/gi-bosses-settings"
import {
  TabsContent,
  TabsList,
  TabsContents,
  TabsTrigger,
  Tabs,
} from "@/components/animate-ui/components/tabs"
import { ShieldUser, Undo2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GISettingsPage() {
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
                <BreadcrumbLink href="/genshin">Echovia</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/genshin">Genshin Impact</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/genshin/settings">
                  Settings
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center justify-end gap-2 ml-auto px-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/genshin">
              <Undo2 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="bosses" className="flex items-center gap-2">
              <ShieldUser className="h-4 w-4" />
              Bosses
            </TabsTrigger>
          </TabsList>

          <TabsContents>
            <TabsContent value="characters" className="space-y-4">
              <GICharactersSettings />
            </TabsContent>
            <TabsContent value="bosses" className="space-y-4">
              <GIBossesSettings />
            </TabsContent>
          </TabsContents>
        </Tabs>
      </div>
    </>
  )
}

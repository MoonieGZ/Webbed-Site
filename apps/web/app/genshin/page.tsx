"use client"

import React from "react"
import { SidebarTrigger } from "@/components/animate-ui/radix/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import GIRandomizer from "@/components/minigames/gi/gi-randomizer"
import { GILobbyStatusCard } from "@/components/minigames/gi"
import { useGiLobbyContext } from "@/hooks/minigames/gi/lobby-provider"
import { Info, Settings } from "lucide-react"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

function GIPageBody() {
  const [aboutOpen, setAboutOpen] = React.useState(false)
  const [showFirstStart, setShowFirstStart] = React.useState(false)
  const { connected, lobby, createLobby } = useGiLobbyContext()

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("first_start")
      setShowFirstStart(stored !== "false")
    } catch {
      setShowFirstStart(true)
    }
  }, [])

  React.useEffect(() => {
    if (!connected) return
    if (lobby?.lobbyId) return
    ;(async () => {
      const t = toast.info("Connecting to lobby...", {
        ...toastStyles.info,
        duration: 2000,
      })
      const res = await createLobby({ privacy: "closed" })
      if (res.ok) {
        toast.success("Connected to solo lobby.", toastStyles.success)
      } else {
        toast.error(res.error || "Failed to create lobby.", toastStyles.error)
      }
    })()
  }, [connected, lobby?.lobbyId, createLobby])

  const handleAboutOpenChange = React.useCallback((open: boolean) => {
    setAboutOpen(open)
  }, [])

  React.useEffect(() => {
    if (aboutOpen && showFirstStart) {
      try {
        localStorage.setItem("first_start", "false")
      } catch {}
      setShowFirstStart(false)
    }
  }, [aboutOpen, showFirstStart])

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
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center justify-end gap-2 ml-auto px-4">
          <Tooltip side="bottom">
            <TooltipTrigger>
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={() => setAboutOpen(true)}
              >
                <Info className="h-4 w-4" />
                {showFirstStart ? (
                  <>
                    <span className="pointer-events-none absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-destructive/80 animate-ping" />
                    <span className="pointer-events-none absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
                  </>
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>About</TooltipContent>
          </Tooltip>
          <Tooltip side="bottom">
            <TooltipTrigger>
              <Button variant="outline" size="sm" asChild>
                <Link href="/genshin/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <GILobbyStatusCard />
          </div>
          <div className="lg:col-span-3 order-1 lg:order-2">
            <GIRandomizer />
          </div>
        </div>
      </div>

      <Dialog open={aboutOpen} onOpenChange={handleAboutOpenChange}>
        <DialogContent from="top">
          <DialogHeader>
            <DialogTitle>About Echovia</DialogTitle>
            <DialogDescription>
              A community-driven hub of minigames and tools.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Echovia brings together playful utilities and cooperative
              experiences for games like Genshin Impact. Spin up challenges,
              customize rules, and play with friends - all in one place.
            </p>
            <p>
              We&apos;re continually expanding with new game modes, richer
              profiles, and better multiplayer tools. Thanks for being here!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function GIPage() {
  return <GIPageBody />
}

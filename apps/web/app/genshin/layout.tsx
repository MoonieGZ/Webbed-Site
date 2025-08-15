"use client"

import React from "react"
import { TooltipProvider } from "@/components/animate-ui/components/tooltip"
import { GiLobbyProvider } from "@/hooks/minigames/gi/lobby-provider"
import { GiDataProvider } from "@/hooks/minigames/gi/gi-data-provider"

export default function GenshinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <GiDataProvider>
        <GiLobbyProvider>{children}</GiLobbyProvider>
      </GiDataProvider>
    </TooltipProvider>
  )
}

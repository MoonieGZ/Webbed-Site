"use client"

import React from "react"
import { TooltipProvider } from "@/components/animate-ui/components/tooltip"
import { GiLobbyProvider } from "@/hooks/minigames/gi/lobby-provider"

export default function GenshinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <GiLobbyProvider>{children}</GiLobbyProvider>
    </TooltipProvider>
  )
}

"use client"

import React from "react"
import { TooltipProvider } from "@/components/animate-ui/components/tooltip"

export default function WuWaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TooltipProvider>{children}</TooltipProvider>
}

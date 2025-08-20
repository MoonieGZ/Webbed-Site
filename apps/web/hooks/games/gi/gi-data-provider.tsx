"use client"

import React, { createContext, useContext } from "react"
import { useGiData } from "@/hooks/minigames/gi/use-gi-data"

type GiDataContextValue = ReturnType<typeof useGiData>

const GiDataContext = createContext<GiDataContextValue | null>(null)

export function GiDataProvider({ children }: { children: React.ReactNode }) {
  const value = useGiData()
  return (
    <GiDataContext.Provider value={value}>{children}</GiDataContext.Provider>
  )
}

export function useGiDataContext(): GiDataContextValue {
  const ctx = useContext(GiDataContext)
  if (!ctx)
    throw new Error("useGiDataContext must be used within GiDataProvider")
  return ctx
}

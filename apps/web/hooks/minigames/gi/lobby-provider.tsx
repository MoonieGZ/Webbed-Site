"use client"

import React, { createContext, useContext } from "react"
import { useGiLobby } from "@/hooks/minigames/gi/use-gi-lobby"

type LobbyContextValue = ReturnType<typeof useGiLobby>

const LobbyContext = createContext<LobbyContextValue | null>(null)

export function GiLobbyProvider({ children }: { children: React.ReactNode }) {
  const value = useGiLobby()
  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
}

export function useGiLobbyContext(): LobbyContextValue {
  const ctx = useContext(LobbyContext)
  if (!ctx) {
    throw new Error("useGiLobbyContext must be used within GiLobbyProvider")
  }
  return ctx
}

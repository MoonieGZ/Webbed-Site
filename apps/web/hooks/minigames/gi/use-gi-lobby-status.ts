"use client"

import { useCallback, useMemo } from "react"
import { useGiLobbyContext } from "@/hooks/minigames/gi/lobby-provider"
import { useUsersByIds } from "@/hooks/api/use-users-by-ids"
import type { GiLobbyPrivacy } from "@/types"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

export function useGiLobbyStatus() {
  const { lobby, isHost, hostUserId, memberUserIds, setLobbyPrivacy } =
    useGiLobbyContext()
  const { list: members, loading } = useUsersByIds(memberUserIds)

  const privacy = (lobby?.privacy as GiLobbyPrivacy) || "closed"
  const hasOthers = (lobby?.members?.length || 0) > 1

  const handleSetPrivacy = useCallback(
    async (next: GiLobbyPrivacy) => {
      await setLobbyPrivacy(next)
      toast.success("Lobby privacy updated", toastStyles.success)
    },
    [setLobbyPrivacy],
  )

  const sortedMembers = useMemo(() => {
    if (!Array.isArray(members)) return []
    return [...members].sort((a, b) => {
      const ah = String(a.id) === String(hostUserId) ? -1 : 1
      const bh = String(b.id) === String(hostUserId) ? -1 : 1
      return ah - bh
    })
  }, [members, hostUserId])

  return {
    lobby,
    isHost,
    hostUserId,
    privacy,
    members: sortedMembers,
    membersLoading: loading,
    hasOthers,
    handleSetPrivacy,
  }
}

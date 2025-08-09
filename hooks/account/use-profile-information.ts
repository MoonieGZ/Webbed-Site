import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

import type { AppUser as User } from "@/types/user"

export function useProfileInformation() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [newUsername, setNewUsername] = useState("")
  const [isChangingUsername, setIsChangingUsername] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (user) {
      setNewUsername(user.name || "")
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)
      } else {
        window.location.href = "/login"
        return
      }
    } catch (error) {
      console.error("Session check failed:", error)
      window.location.href = "/login"
      return
    }
    setLoading(false)
  }

  const canChangeUsername = () => {
    if (!user?.name_changed_at) return true

    const lastChanged = new Date(user.name_changed_at)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return lastChanged < thirtyDaysAgo
  }

  const getDaysUntilUsernameChange = () => {
    if (!user?.name_changed_at) return 0

    const lastChanged = new Date(user.name_changed_at)
    const nextAllowed = new Date(
      lastChanged.getTime() + 30 * 24 * 60 * 60 * 1000,
    )
    const now = new Date()

    const diffTime = nextAllowed.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  const handleUsernameChange = async () => {
    if (!user || !newUsername.trim()) return

    setIsChangingUsername(true)
    try {
      const response = await fetch("/api/account/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Username updated successfully!", toastStyles.success)
        setUser({ ...user, name: newUsername.trim() })
        setNewUsername("")
      } else {
        toast.error(
          data.error || "Failed to update username",
          toastStyles.error,
        )
      }
    } catch (error) {
      console.error("Error updating username:", error)
      toast.error("Failed to update username", toastStyles.error)
    } finally {
      setIsChangingUsername(false)
    }
  }

  return {
    user,
    loading,
    newUsername,
    setNewUsername,
    isChangingUsername,
    canChangeUsername,
    getDaysUntilUsernameChange,
    handleUsernameChange,
  }
}

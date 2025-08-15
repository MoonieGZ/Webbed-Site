import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useUserContext } from "@/contexts/user-context"

import type { AppUser as User } from "@/types/user"
import { canChangeUsernameSince, daysUntilUsernameChange } from "@/lib/username"

export function useProfileInformation() {
  const { updateUser } = useUserContext()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [newUsername, setNewUsername] = useState("")
  const [isChangingUsername, setIsChangingUsername] = useState(false)
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
  const [isSavingTitle, setIsSavingTitle] = useState(false)

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
      const response = await fetch("/api/auth/session", { cache: "no-store" })
      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)

        try {
          const r = await fetch("/api/account/title", { cache: "no-store" })
          const t = await r.json()
          if (r.ok) {
            setTitles(t.titles || [])
            setSelectedTitle(t.currentTitle ?? null)
          }
        } catch {}
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

  const canChangeUsername = () =>
    canChangeUsernameSince(user?.name_changed_at) &&
    (user as any).permissions?.can_change_user

  const getDaysUntilUsernameChange = () =>
    daysUntilUsernameChange(user?.name_changed_at)

  const handleUsernameChange = async () => {
    if (!user || !newUsername.trim()) return

    setIsChangingUsername(true)
    toast.info("Saving username...", toastStyles.info)
    try {
      const response = await fetch("/api/account/username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newUsername.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Username updated successfully!", toastStyles.success)
        setUser({ ...user, name: newUsername.trim() })
        setNewUsername("")
        updateUser({ name: newUsername.trim() })
      } else {
        toast.error(
          data.error || "Failed to update username.",
          toastStyles.error,
        )
      }
    } catch (error) {
      console.error("Error updating username:", error)
      toast.error("Failed to update username.", toastStyles.error)
    } finally {
      setIsChangingUsername(false)
    }
  }

  const handleTitleSave = async () => {
    setIsSavingTitle(true)
    try {
      const response = await fetch("/api/account/title", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: selectedTitle }),
      })
      const data = await response.json()
      if (response.ok) {
        setUser((prev) =>
          prev ? { ...prev, title: data.title ?? null } : prev,
        )
        toast.success("Title updated!", toastStyles.success)
        updateUser({ title: data.title ?? null })
      } else {
        toast.error(data.error || "Failed to update title.", toastStyles.error)
      }
    } catch (e) {
      toast.error("Failed to update title.", toastStyles.error)
    } finally {
      setIsSavingTitle(false)
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
    titles,
    selectedTitle,
    setSelectedTitle,
    handleTitleSave,
    isSavingTitle,
  }
}

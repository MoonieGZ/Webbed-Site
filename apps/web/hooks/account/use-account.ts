import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type { RecentAvatar } from "@/types/account"

import type { AppUser as User } from "@/types/user"
import { canChangeUsernameSince, daysUntilUsernameChange } from "@/lib/username"

export function useAccount() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [isChangingUsername, setIsChangingUsername] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [recentAvatars, setRecentAvatars] = useState<RecentAvatar[]>([])
  const [isLoadingRecentAvatars, setIsLoadingRecentAvatars] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user) {
      setNewUsername(user.name || "")
      fetchRecentAvatars()
    }
  }, [user])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)
        setAuthenticated(true)
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

  const fetchRecentAvatars = async () => {
    if (!user) return

    setIsLoadingRecentAvatars(true)
    try {
      const response = await fetch("/api/account/avatar/recent")
      const data = await response.json()

      if (response.ok) {
        setRecentAvatars(data.avatars)
      }
    } catch (error) {
      console.error("Failed to fetch recent avatars:", error)
    } finally {
      setIsLoadingRecentAvatars(false)
    }
  }

  const canChangeUsername = () => canChangeUsernameSince(user?.name_changed_at)

  const getDaysUntilUsernameChange = () =>
    daysUntilUsernameChange(user?.name_changed_at)

  const handleUsernameChange = async () => {
    if (!user) {
      toast.error("User not found.", toastStyles.error)
      return
    }

    if (!newUsername.trim()) {
      toast.error("Please enter a username.", toastStyles.error)
      return
    }

    if (!canChangeUsername()) {
      toast.error(
        `You can only change your username once every 30 days. Try again in ${getDaysUntilUsernameChange()} days.`,
        toastStyles.error,
      )
      return
    }

    setIsChangingUsername(true)

    try {
      const response = await fetch("/api/account/username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newUsername }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Username updated successfully!", toastStyles.success)
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: data.name,
                name_changed_at: data.name_changed_at,
              }
            : null,
        )
      } else {
        toast.error(
          data.error || "Failed to update username",
          toastStyles.error,
        )
      }
    } catch (error) {
      console.error("Username change failed:", error)
      toast.error(
        "An error occurred while updating username",
        toastStyles.error,
      )
    } finally {
      setIsChangingUsername(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.", toastStyles.error)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.", toastStyles.error)
      return
    }

    setIsUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/account/avatar/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Avatar updated successfully!", toastStyles.success)
        setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : null))

        fetchRecentAvatars()
      } else {
        toast.error(data.error || "Failed to upload avatar.", toastStyles.error)
      }
    } catch (error) {
      console.error("Avatar upload failed:", error)
      toast.error("An error occurred while uploading avatar.", toastStyles.error)
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 250))
      setIsUploadingAvatar(false)
    }
  }

  const handleGravatarImport = async () => {
    if (!user?.email) {
      toast.error("No email address available for Gravatar.", toastStyles.error)
      return
    }

    setIsUploadingAvatar(true)

    try {
      const response = await fetch("/api/account/avatar/gravatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Gravatar imported successfully!", toastStyles.success)
        setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : null))

        fetchRecentAvatars()
      } else {
        toast.error(
          data.error || "Failed to import Gravatar.",
          toastStyles.error,
        )
      }
    } catch (error) {
      console.error("Gravatar import failed:", error)
      toast.error(
        "An error occurred while importing Gravatar.",
        toastStyles.error,
      )
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 250))
      setIsUploadingAvatar(false)
    }
  }

  const handleSetRecentAvatar = async (filename: string) => {
    if (!user) {
      toast.error("User not found.", toastStyles.error)
      return
    }

    setIsUploadingAvatar(true)

    try {
      const response = await fetch("/api/account/avatar/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Avatar updated successfully!", toastStyles.success)
        setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : null))

        fetchRecentAvatars()
      } else {
        toast.error(data.error || "Failed to update avatar.", toastStyles.error)
      }
    } catch (error) {
      console.error("Avatar update failed:", error)
      toast.error("An error occurred while updating avatar.", toastStyles.error)
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 250))
      setIsUploadingAvatar(false)
    }
  }

  return {
    user,
    loading,
    authenticated,
    newUsername,
    setNewUsername,
    isChangingUsername,
    isUploadingAvatar,
    recentAvatars,
    isLoadingRecentAvatars,
    canChangeUsername,
    getDaysUntilUsernameChange,
    handleUsernameChange,
    handleAvatarUpload,
    handleGravatarImport,
    handleSetRecentAvatar,
  }
}

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

interface RecentAvatar {
  src: string
  filename: string
  modifiedTime: Date
}

interface User {
  id: number
  email: string
  name: string
  rank?: string
  avatar?: string
  name_changed_at?: string
}

export function useAvatar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [recentAvatars, setRecentAvatars] = useState<RecentAvatar[]>([])

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (user) {
      fetchRecentAvatars()
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

  const fetchRecentAvatars = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/account/avatar/recent")
      const data = await response.json()

      if (response.ok) {
        setRecentAvatars(data.avatars)
      }
    } catch (error) {
      console.error("Failed to fetch recent avatars:", error)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Avatar uploaded successfully!", toastStyles.success)
        setUser({ ...user, avatar: data.avatar })
        await fetchRecentAvatars()
      } else {
        toast.error(data.error || "Failed to upload avatar", toastStyles.error)
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar", toastStyles.error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleGravatarImport = async () => {
    if (!user) return

    setIsUploadingAvatar(true)
    try {
      const response = await fetch("/api/account/avatar/gravatar", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Gravatar imported successfully!", toastStyles.success)
        setUser({ ...user, avatar: data.avatar })
        await fetchRecentAvatars()
      } else {
        toast.error(
          data.error || "Failed to import Gravatar",
          toastStyles.error,
        )
      }
    } catch (error) {
      console.error("Error importing Gravatar:", error)
      toast.error("Failed to import Gravatar", toastStyles.error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSetRecentAvatar = async (filename: string) => {
    if (!user) return

    try {
      const response = await fetch("/api/account/avatar/recent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Avatar set successfully!", toastStyles.success)
        setUser({ ...user, avatar: data.avatar })
      } else {
        toast.error(data.error || "Failed to set avatar", toastStyles.error)
      }
    } catch (error) {
      console.error("Error setting recent avatar:", error)
      toast.error("Failed to set avatar", toastStyles.error)
    }
  }

  const onAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }

    event.target.value = ""
  }

  return {
    user,
    loading,
    isUploadingAvatar,
    recentAvatars,
    onAvatarFileChange,
    handleGravatarImport,
    handleSetRecentAvatar,
  }
}

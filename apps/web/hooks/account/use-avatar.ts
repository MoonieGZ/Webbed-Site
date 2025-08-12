import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useUserContext } from "@/contexts/user-context"
import type { RecentAvatar } from "@/types/account"

export function useAvatar() {
  const { user, updateUser, loading } = useUserContext()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [recentAvatars, setRecentAvatars] = useState<RecentAvatar[]>([])

  useEffect(() => {
    if (user) {
      fetchRecentAvatars()
    }
  }, [user])

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

      const response = await fetch("/api/account/avatar/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Avatar uploaded successfully!", toastStyles.success)
        updateUser({ avatar: data.avatar })
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
        updateUser({ avatar: data.avatar })
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
      const response = await fetch("/api/account/avatar/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Avatar set successfully!", toastStyles.success)
        updateUser({ avatar: data.avatar })
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

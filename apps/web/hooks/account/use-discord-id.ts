import { toastStyles } from "@/lib/toast-styles"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export function useDiscordId() {
  const [discordId, setDiscordId] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDiscordId()
  }, [])

  const fetchDiscordId = async () => {
    try {
      const response = await fetch("/api/account/discord-id")
      const data = await response.json()
      setDiscordId(data.discordId || "")
    } catch (error) {
      console.error("Failed to fetch Discord ID:", error)
      setDiscordId("")
    } finally {
      setIsLoading(false)
    }
  }

  const saveDiscordId = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/account/discord-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId: discordId }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Discord ID saved successfully!", toastStyles.success)
        setDiscordId(data.discordId || "")
      } else {
        toast.error(
          data.error || "Failed to save Discord ID.",
          toastStyles.error,
        )
      }
    } catch (error) {
      console.error("Failed to save Discord ID:", error)
      toast.error("Failed to save Discord ID.", toastStyles.error)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    discordId,
    setDiscordId,
    isSaving,
    isLoading,
    saveDiscordId,
  }
}

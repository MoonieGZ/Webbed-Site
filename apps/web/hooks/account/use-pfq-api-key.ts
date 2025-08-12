import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type { PFQApiKeyInfo } from "@/types/pfq"

export function usePFQApiKey() {
  const [apiKeyInfo, setApiKeyInfo] = useState<PFQApiKeyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    fetchApiKeyInfo()
  }, [])

  const fetchApiKeyInfo = async () => {
    try {
      const response = await fetch("/api/account/pfq")
      const data = await response.json()

      if (response.ok) {
        setApiKeyInfo(data)
      } else {
        console.error("Failed to fetch PFQ API key info:", data.error)
        toast.error("Failed to load PFQ API key information", toastStyles.error)
      }
    } catch (error) {
      console.error("Error fetching PFQ API key info:", error)
      toast.error("Failed to load PFQ API key information", toastStyles.error)
    } finally {
      setLoading(false)
    }
  }

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key", toastStyles.error)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/account/pfq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("PFQ API key saved successfully!", toastStyles.success)
        setApiKey("")
        await fetchApiKeyInfo()
      } else {
        toast.error(data.error || "Failed to save API key", toastStyles.error)
      }
    } catch (error) {
      console.error("Error saving PFQ API key:", error)
      toast.error("Failed to save API key", toastStyles.error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteApiKey = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/account/pfq", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("PFQ API key deleted successfully!", toastStyles.success)
        await fetchApiKeyInfo()
      } else {
        toast.error(data.error || "Failed to delete API key", toastStyles.error)
      }
    } catch (error) {
      console.error("Error deleting PFQ API key:", error)
      toast.error("Failed to delete API key", toastStyles.error)
    } finally {
      setIsDeleting(false)
    }
  }

  const openPFQApiKeyPage = () => {
    window.open("https://pokefarm.com/farm#tab=5.7", "_blank")
  }

  return {
    apiKeyInfo,
    loading,
    isSaving,
    isDeleting,
    apiKey,
    setApiKey,
    saveApiKey,
    deleteApiKey,
    openPFQApiKeyPage,
    refreshApiKeyInfo: fetchApiKeyInfo,
  }
}

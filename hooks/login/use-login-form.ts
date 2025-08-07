import { useState } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/utils"

export function useLoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address", toastStyles.error)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/login/magic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Email sent, check your inbox!", toastStyles.success)
        setEmail("")
      } else {
        toast.error(
          data.error || "Failed to send magic link",
          toastStyles.error,
        )
      }
    } catch (error) {
      toast.error(
        "An error occurred while sending the magic link",
        toastStyles.error,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    setEmail,
    isLoading,
    handleSubmit,
  }
}

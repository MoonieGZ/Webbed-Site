import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

export function useLoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownMessage, setCooldownMessage] = useState<string>("")
  const [lastSentEmail, setLastSentEmail] = useState<string>("")
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  const isSameAsLast = email.trim() !== "" && email.trim() === lastSentEmail
  const isCooldownActive = useMemo(() => {
    if (!cooldownUntil) return false
    if (!isSameAsLast) return false
    return Date.now() < cooldownUntil
  }, [cooldownUntil, isSameAsLast])

  useEffect(() => {
    if (!cooldownUntil) return
    const interval = window.setInterval(() => {
      if (Date.now() >= cooldownUntil) {
        setCooldownUntil(null)
        window.clearInterval(interval)
      }
    }, 1000)
    return () => window.clearInterval(interval)
  }, [cooldownUntil])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address.", toastStyles.error)
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

        const trimmed = email.trim()
        setLastSentEmail(trimmed)
        setCooldownUntil(Date.now() + 2 * 60 * 1000)
        setCooldownMessage(
          "Email sent! If you have not received it, you can try again in 2 minutes.",
        )
      } else {
        const message = data.error || "Failed to send magic link."
        setCooldownMessage(message)

        const match = /wait\s+(\d+)s/i.exec(message)
        if (match) {
          const seconds = Number(match[1])
          const trimmed = email.trim()
          setLastSentEmail(trimmed)
          setCooldownUntil(Date.now() + seconds * 1000)
        }
        toast.error(message, toastStyles.error)
      }
    } catch (error) {
      toast.error(
        "An error occurred while sending the magic link.",
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
    cooldownMessage,
    isCooldownActive,
    buttonLabel: isSameAsLast ? "Re-send" : "Login",
    handleSubmit,
  }
}

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useUser } from "@/hooks/login/use-user"

export function useVIPSupport() {
  const { user, loading: userLoading } = useUser()

  const [donationId, setDonationId] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [discordUsername, setDiscordUsername] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && !userLoading) {
      setPaypalEmail((user as any).email || "")
    }
  }, [user, userLoading])

  const submit = async () => {
    if (!donationId.trim() || !paypalEmail.trim()) {
      toast.error(
        "Please provide your Donation ID and PayPal email.",
        toastStyles.error,
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationId: donationId.trim(),
          paypalEmail: paypalEmail.trim(),
          discordUsername: discordUsername.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(
          "Thanks! We received your details. Your Supporter badge will appear within 24 hours.",
          toastStyles.success,
        )
        setDonationId("")
        setDiscordUsername("")
      } else {
        toast.error(
          data.error || "Failed to submit donation details.",
          toastStyles.error,
        )
      }
    } catch (err) {
      toast.error("Failed to submit donation details.", toastStyles.error)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    donationId,
    setDonationId,
    paypalEmail,
    setPaypalEmail,
    discordUsername,
    setDiscordUsername,
    submitting,
    submit,
  }
}

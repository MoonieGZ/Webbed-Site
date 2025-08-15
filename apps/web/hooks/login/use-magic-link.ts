import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@/hooks/login/use-user"

type Status = "loading" | "success" | "error" | "invalid"

export function useMagicLink() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")
  const { refetch } = useUser()

  const ensureSessionReady = async (): Promise<void> => {
    // Poll session endpoint briefly to ensure cookie/user are ready
    const maxAttempts = 5
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const r = await fetch("/api/auth/session", { cache: "no-store" })
        const d = await r.json()
        if (d?.authenticated && d?.user?.id) return
      } catch {}
      await new Promise((res) => setTimeout(res, 250))
    }
  }

  const validateToken = async (token: string) => {
    try {
      const response = await fetch("/api/login/magic/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        if (data.shouldCreateUser) {
          setMessage("Account created successfully! Redirecting...")
        } else {
          setMessage("Login successful! Redirecting...")
        }

        // Ensure the session cookie is applied and user context is fresh
        await ensureSessionReady()
        await refetch()
        router.push("/account")
      } else {
        setStatus("error")
        setMessage(data.error || "Invalid or expired token")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while validating the token")
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("invalid")
      setMessage("No token provided")
      return
    }

    validateToken(token)
  }, [searchParams])

  return {
    status,
    message,
    handleBackToLogin,
  }
}

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

type Status = "loading" | "success" | "error" | "invalid"

export function useMagicLink() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")

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

        setTimeout(() => {
          router.push("/account")
        }, 2000)
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

import { useEffect, useState } from "react"

export function useSession() {
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" })
      const data = await response.json()

      if (data.authenticated) {
        window.location.href = "/"
        return
      }
    } catch (error) {
      console.error("Session check failed:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkSession()
  }, [])

  return {
    loading,
  }
}

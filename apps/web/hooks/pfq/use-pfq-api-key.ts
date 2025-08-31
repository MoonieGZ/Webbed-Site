import { useState, useEffect } from "react"

export function usePFQApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/account/pfq")
        if (!response.ok) {
          throw new Error("Failed to fetch API key")
        }

        const data = await response.json()
        if (data.hasApiKey && data.apiKey) {
          setApiKey(data.apiKey)
        } else {
          setError("No API key found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch API key")
      } finally {
        setLoading(false)
      }
    }

    fetchApiKey()
  }, [])

  return { apiKey, loading, error }
}

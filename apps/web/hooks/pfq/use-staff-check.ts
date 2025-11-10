"use client"

import { useState, useEffect } from "react"

export function useStaffCheck() {
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStaff = async () => {
      try {
        // First check if user is authenticated
        const sessionResponse = await fetch("/api/auth/session")
        const sessionData = await sessionResponse.json()

        if (!sessionData.authenticated) {
          setIsStaff(false)
          setLoading(false)
          return
        }

        // Get user's PFQ API key info
        const apiKeyResponse = await fetch("/api/account/pfq")
        const apiKeyData = await apiKeyResponse.json()

        if (
          !apiKeyResponse.ok ||
          !apiKeyData.hasApiKey ||
          !apiKeyData.pfqUser
        ) {
          setIsStaff(false)
          setLoading(false)
          return
        }

        // Check if the PFQ user is staff
        setIsStaff(apiKeyData.pfqUser.isStaff === true)
      } catch (error) {
        console.error("Error checking staff status:", error)
        setIsStaff(false)
      } finally {
        setLoading(false)
      }
    }

    checkStaff()
  }, [])

  return { isStaff, loading }
}

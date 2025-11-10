"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type { SurveyWithDetails, UserResponse, SubmitResponseRequest } from "@/types/pfq-survey"

export function useSurvey(publicId: string) {
  const [survey, setSurvey] = useState<SurveyWithDetails | null>(null)
  const [userResponse, setUserResponse] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [hasApiKeyFromProfile, setHasApiKeyFromProfile] = useState(false)

  useEffect(() => {
    fetchSurvey()
    fetchApiKeyFromProfile()
  }, [publicId])

  // Fetch user response when API key is available
  useEffect(() => {
    if (apiKey) {
      fetchUserResponse(apiKey)
    } else {
      // Also try without API key (for logged-in users)
      fetchUserResponse()
    }
  }, [apiKey, publicId])

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/pfq/surveys/${publicId}`)
      const data = await response.json()

      if (response.ok) {
        setSurvey(data.survey)
        setError(null)
      } else {
        setError(data.error || "Failed to load survey")
        setSurvey(null)
      }
    } catch (error) {
      console.error("Error fetching survey:", error)
      setError("Failed to load survey")
      setSurvey(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserResponse = async (apiKeyToUse?: string) => {
    try {
      // Use provided API key, or the current apiKey state, or none
      const keyToUse = apiKeyToUse || apiKey
      const url = keyToUse
        ? `/api/pfq/surveys/${publicId}/responses?api_key=${encodeURIComponent(keyToUse)}`
        : `/api/pfq/surveys/${publicId}/responses`
      
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok && data.response) {
        // Extract the response object from the API response
        setUserResponse(data.response)
      } else {
        setUserResponse(null)
      }
    } catch (error) {
      console.error("Error fetching user response:", error)
      // Don't set error here, it's optional
    }
  }

  const fetchApiKeyFromProfile = async () => {
    try {
      const response = await fetch("/api/account/pfq")
      const data = await response.json()

      if (response.ok && data.hasApiKey && data.apiKey) {
        setApiKey(data.apiKey)
        setHasApiKeyFromProfile(true)
        // Fetch user response immediately when API key is loaded from profile
        // The useEffect will also trigger, but this ensures it happens right away
        await fetchUserResponse(data.apiKey)
      } else {
        // Even if no API key from profile, try to fetch response (for logged-in users)
        await fetchUserResponse()
      }
    } catch (error) {
      // Silent fail - user might not be logged in
      // Still try to fetch response without API key
      await fetchUserResponse()
    }
  }

  const submitResponse = async (answers: SubmitResponseRequest["answers"]) => {
    if (!apiKey.trim()) {
      toast.error("Please enter your PFQ API key.", toastStyles.error)
      return false
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/pfq/surveys/${publicId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey.trim(),
          answers,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Response submitted successfully!", toastStyles.success)
        // Extract the response object from the API response
        if (data.response) {
          setUserResponse(data.response)
        }
        return true
      } else {
        toast.error(data.error || "Failed to submit response.", toastStyles.error)
        return false
      }
    } catch (error) {
      console.error("Error submitting response:", error)
      toast.error("Failed to submit response.", toastStyles.error)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const isSurveyActive = () => {
    if (!survey) return false
    const now = new Date()
    const startDate = new Date(survey.start_date)
    const endDate = new Date(survey.end_date)
    return now >= startDate && now <= endDate
  }

  const isSurveyUpcoming = () => {
    if (!survey) return false
    const now = new Date()
    const startDate = new Date(survey.start_date)
    return now < startDate
  }

  const isSurveyEnded = () => {
    if (!survey) return false
    const now = new Date()
    const endDate = new Date(survey.end_date)
    return now > endDate
  }

  return {
    survey,
    userResponse,
    loading,
    submitting,
    error,
    apiKey,
    setApiKey,
    hasApiKeyFromProfile,
    submitResponse,
    isSurveyActive,
    isSurveyUpcoming,
    isSurveyEnded,
    refreshSurvey: fetchSurvey,
    refreshResponse: fetchUserResponse,
  }
}


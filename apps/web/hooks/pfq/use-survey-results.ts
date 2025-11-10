"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type {
  SurveyResultsIndividual,
  SurveyResultsAggregated,
} from "@/types/pfq-survey"

export function useSurveyResults(publicId: string) {
  const [results, setResults] = useState<
    SurveyResultsIndividual[] | SurveyResultsAggregated[] | null
  >(null)
  const [view, setView] = useState<"individual" | "aggregated">("aggregated")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResults()
  }, [publicId, view])

  const fetchResults = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/pfq/surveys/${publicId}/results?view=${view}`,
      )
      const data = await response.json()

      if (response.ok) {
        setResults(data.results)
      } else {
        setError(data.error || "Failed to load results")
        setResults(null)
      }
    } catch (error) {
      console.error("Error fetching results:", error)
      setError("Failed to load results")
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const toggleView = (newView: "individual" | "aggregated") => {
    setView(newView)
  }

  return {
    results,
    view,
    loading,
    error,
    toggleView,
    refreshResults: fetchResults,
  }
}


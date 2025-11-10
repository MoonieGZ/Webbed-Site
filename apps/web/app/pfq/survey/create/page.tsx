"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SurveyCreateForm } from "@/components/pfq/survey/create-form"
import { useStaffCheck } from "@/hooks/pfq/use-staff-check"

export default function SurveyCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isStaff, loading } = useStaffCheck()
  const surveyId = searchParams?.get("surveyId") || null

  useEffect(() => {
    if (!loading && !isStaff) {
      router.push("/")
    }
  }, [loading, isStaff, router])

  if (loading) {
    return (
      <div className="absolute inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isStaff) {
    return null
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <SurveyCreateForm publicId={surveyId || undefined} />
      </div>
    </div>
  )
}


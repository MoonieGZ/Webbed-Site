"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SurveyCreateForm } from "@/components/pfq/survey/create-form"
import { SurveyLoadingSpinner } from "@/components/pfq/survey/loading-spinner"
import { useStaffCheck } from "@/hooks/pfq/use-staff-check"

function SurveyCreatePageContent() {
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
    return <SurveyLoadingSpinner />
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

export default function SurveyCreatePage() {
  return (
    <Suspense fallback={<SurveyLoadingSpinner />}>
      <SurveyCreatePageContent />
    </Suspense>
  )
}

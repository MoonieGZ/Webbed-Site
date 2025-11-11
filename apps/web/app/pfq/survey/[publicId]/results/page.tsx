"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SurveyResults } from "@/components/pfq/survey/results"
import { SurveyLoadingSpinner } from "@/components/pfq/survey/loading-spinner"
import { useStaffCheck } from "@/hooks/pfq/use-staff-check"

export default function SurveyResultsPage() {
  const params = useParams()
  const router = useRouter()
  const publicId = params?.publicId as string | undefined
  const { isStaff, loading } = useStaffCheck()

  useEffect(() => {
    if (!loading && !isStaff) {
      router.push("/")
    }
  }, [loading, isStaff, router])

  if (loading) {
    return <SurveyLoadingSpinner />
  }

  if (!isStaff || !publicId) {
    return null
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <SurveyResults publicId={publicId} />
      </div>
    </div>
  )
}

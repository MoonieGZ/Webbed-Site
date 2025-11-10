"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SurveyResults } from "@/components/pfq/survey/results"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    return (
      <div className="absolute inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
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


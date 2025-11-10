"use client"

import { useParams } from "next/navigation"
import { SurveyForm } from "@/components/pfq/survey/form"

export default function SurveyViewPage() {
  const params = useParams()
  const publicId = params?.publicId as string | undefined

  if (!publicId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-destructive">Invalid survey ID</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <SurveyForm publicId={publicId} />
      </div>
    </div>
  )
}


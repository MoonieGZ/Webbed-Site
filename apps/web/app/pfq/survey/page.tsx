"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartLine } from "lucide-react"

export default function SurveyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5" /> PFQ Surveys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Surveys are accessed via direct link. If you have a survey link,
            please use it to access the survey.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

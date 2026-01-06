"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SurveyLoadingSpinner } from "./loading-spinner"
import { useSurveyResults } from "@/hooks/pfq/use-survey-results"
import { formatSurveyDate } from "@/lib/survey-utils"
import type {
  SurveyResultsIndividual,
  SurveyResultsAggregated,
} from "@/types/pfq-survey"

interface SurveyResultsProps {
  publicId: string
}

export function SurveyResults({ publicId }: SurveyResultsProps) {
  const { results, view, loading, error, toggleView } =
    useSurveyResults(publicId)

  if (loading) {
    return <SurveyLoadingSpinner />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Check if results are empty based on view type
  const hasResults =
    results &&
    Array.isArray(results) &&
    results.length > 0 &&
    (view === "aggregated" ||
      (view === "individual" &&
        results.every(
          (r: any) => r && r.response && typeof r.response === "object",
        )))

  // Calculate total responses
  const totalResponses =
    view === "individual"
      ? (results as SurveyResultsIndividual[])?.length || 0
      : (results as SurveyResultsAggregated[])?.[0]?.total_responses || 0

  if (!hasResults) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Survey Results</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Responses: {totalResponses}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={view === "aggregated" ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleView("aggregated")}
                >
                  Aggregated
                </Button>
                <Button
                  variant={view === "individual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleView("individual")}
                >
                  Individual
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>No Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No responses have been submitted yet.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Survey Results</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total Responses: {totalResponses}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "aggregated" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleView("aggregated")}
              >
                Aggregated
              </Button>
              <Button
                variant={view === "individual" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleView("individual")}
              >
                Individual
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {view === "individual" ? (
        <IndividualResultsView results={results as SurveyResultsIndividual[]} />
      ) : (
        <AggregatedResultsView results={results as SurveyResultsAggregated[]} />
      )}
    </div>
  )
}

function IndividualResultsView({
  results,
}: {
  results: SurveyResultsIndividual[]
}) {
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Individual Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No individual responses have been submitted yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {results
        .filter((result) => result && result.response)
        .map((result, index) => (
          <Card key={result.response.id}>
            <CardHeader>
              <CardTitle>
                Response #{index + 1}
                {result.response.pfq_username && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    by {result.response.pfq_username}
                    {result.response.user && (
                      <span className="text-xs ml-1">
                        (
                        {result.response.user.name ||
                          result.response.user.email}
                        )
                      </span>
                    )}
                  </span>
                )}
                {!result.response.pfq_username && result.response.user && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    by {result.response.user.name || result.response.user.email}
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted: {formatSurveyDate(result.response.created_at)}
                {result.response.updated_at !== result.response.created_at && (
                  <span className="ml-2">
                    (Updated: {formatSurveyDate(result.response.updated_at)})
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.answers && result.answers.length > 0 ? (
                result.answers.map((answer, answerIndex) => (
                  <div key={answer.id}>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {answer.question.question_text}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Type: {answer.question.question_type}
                      </p>
                      <div className="p-3 bg-muted rounded-lg">
                        <p>{answer.answer_value}</p>
                      </div>
                    </div>
                    {answerIndex < result.answers.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No answers for this response.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

function AggregatedResultsView({
  results,
}: {
  results: SurveyResultsAggregated[]
}) {
  // Filter out invalid results and ensure data is an array
  const validResults = results.filter(
    (result) =>
      result &&
      typeof result === "object" &&
      "question_id" in result &&
      "question_text" in result &&
      "data" in result &&
      Array.isArray(result.data),
  )

  if (validResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Aggregated Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No aggregated results available.
          </p>
        </CardContent>
      </Card>
    )
  }

  let currentGroupId: number | undefined = undefined

  return (
    <div className="space-y-4">
      {validResults.map((result, index) => {
        const showGroupHeader =
          result.group_id !== undefined &&
          result.group_id !== currentGroupId

        if (showGroupHeader) {
          currentGroupId = result.group_id
        }

        return (
          <div key={result.question_id}>
            {showGroupHeader && result.group_name && (
              <div className="mb-4 mt-6 first:mt-0">
                <h3 className="text-lg font-semibold">{result.group_name}</h3>
                <Separator className="mt-2" />
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>{result.question_text}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Type: {result.question_type}
                </p>
              </CardHeader>
              <CardContent>
                {result.total_responses === 0 ||
                !result.data ||
                !Array.isArray(result.data) ||
                result.data.length === 0 ? (
                  <p className="text-muted-foreground">No responses yet</p>
                ) : (
                  <div className="space-y-3">
                    {result.data.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.value}</span>
                          <span className="font-medium">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

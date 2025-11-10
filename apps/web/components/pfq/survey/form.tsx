"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SurveyKeyPrompt } from "./key-prompt"
import { useSurvey } from "@/hooks/pfq/use-survey"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type { SurveyWithDetails, Question } from "@/types/pfq-survey"

interface SurveyFormProps {
  publicId: string
}

export function SurveyForm({ publicId }: SurveyFormProps) {
  const {
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
    refreshResponse,
  } = useSurvey(publicId)

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})

  useEffect(() => {
    if (userResponse?.answers) {
      const initialAnswers: Record<number, string | string[]> = {}
      for (const answer of userResponse.answers) {
        // Try to parse as JSON array for multiple selections, fallback to string
        try {
          const parsed = JSON.parse(answer.answer_value)
          if (Array.isArray(parsed)) {
            initialAnswers[answer.question_id] = parsed
          } else {
            initialAnswers[answer.question_id] = answer.answer_value
          }
        } catch {
          initialAnswers[answer.question_id] = answer.answer_value
        }
      }
      setAnswers(initialAnswers)
    }
  }, [userResponse])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading survey...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error || !survey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error || "Survey not found"}</p>
        </CardContent>
      </Card>
    )
  }

  if (isSurveyUpcoming()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{survey.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This survey has not started yet. It will be available on{" "}
            {new Date(survey.start_date).toLocaleString()}.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isSurveyEnded()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{survey.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This survey has ended. It was available until{" "}
            {new Date(survey.end_date).toLocaleString()}.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isSurveyActive()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{survey.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This survey is not currently active.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleMultipleAnswerChange = (
    questionId: number,
    choiceValue: string,
    checked: boolean,
  ) => {
    setAnswers((prev) => {
      const current = prev[questionId]
      const currentArray = Array.isArray(current)
        ? current
        : current
          ? [current]
          : []

      if (checked) {
        // Add choice if not already present
        if (!currentArray.includes(choiceValue)) {
          return { ...prev, [questionId]: [...currentArray, choiceValue] }
        }
      } else {
        // Remove choice
        return {
          ...prev,
          [questionId]: currentArray.filter((v) => v !== choiceValue),
        }
      }
      return prev
    })
  }

  const handleSubmit = async () => {
    const answerArray = Object.entries(answers).map(
      ([questionId, answerValue]) => {
        // Serialize arrays as JSON for multiple selections
        const serializedValue = Array.isArray(answerValue)
          ? JSON.stringify(answerValue)
          : answerValue
        return {
          question_id: parseInt(questionId),
          answer_value: serializedValue,
        }
      },
    )

    // Validate all questions are answered
    const allQuestions: Question[] = []
    for (const group of survey.groups) {
      allQuestions.push(...group.questions)
    }

    const unansweredQuestions = allQuestions.filter((q) => {
      const answer = answers[q.id]
      if (!answer) return true
      if (Array.isArray(answer)) {
        return answer.length === 0
      }
      return answer.trim() === ""
    })

    if (unansweredQuestions.length > 0) {
      toast.error(
        `Please answer all questions. ${unansweredQuestions.length} question(s) remain unanswered.`,
        toastStyles.error,
      )
      return
    }

    const success = await submitResponse(answerArray)
    if (success) {
      // Reset form or show success message
    }
  }

  const renderQuestion = (question: Question) => {
    const rawValue = answers[question.id]
    const isMultiple = question.allow_multiple === true

    // Normalize value based on question type
    let value: string | string[]
    if (isMultiple) {
      // For multiple selections, always use array
      value = Array.isArray(rawValue)
        ? rawValue
        : rawValue
          ? [String(rawValue)]
          : []
    } else {
      // For single selection, always use string
      value = Array.isArray(rawValue)
        ? rawValue[0] || ""
        : String(rawValue || "")
    }

    switch (question.question_type) {
      case "range_5": {
        const rangeValue =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value[0] || "0"
              : "0"
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor={`q-${question.id}`}
                className="text-base font-semibold"
              >
                {question.question_text}
              </Label>
            </div>
            <div className="space-y-2 pl-1">
              <Slider
                id={`q-${question.id}`}
                min={0}
                max={5}
                step={1}
                value={[parseInt(rangeValue) || 0]}
                onValueChange={(vals) =>
                  handleAnswerChange(question.id, vals[0].toString())
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span className="font-medium">{rangeValue || 0}</span>
                <span>5</span>
              </div>
            </div>
          </div>
        )
      }

      case "range_10": {
        const rangeValue =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value[0] || "0"
              : "0"
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor={`q-${question.id}`}
                className="text-base font-semibold"
              >
                {question.question_text}
              </Label>
            </div>
            <div className="space-y-2 pl-1">
              <Slider
                id={`q-${question.id}`}
                min={0}
                max={10}
                step={1}
                value={[parseInt(rangeValue) || 0]}
                onValueChange={(vals) =>
                  handleAnswerChange(question.id, vals[0].toString())
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span className="font-medium">{rangeValue || 0}</span>
                <span>10</span>
              </div>
            </div>
          </div>
        )
      }

      case "likert":
        const likertOptions = [
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
        ]
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-base font-semibold">
                {question.question_text}
              </Label>
            </div>
            <div className="space-y-2 pl-1 border-l-2 border-muted pl-4">
              {likertOptions.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    value={option}
                    checked={value === option}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case "text": {
        const textValue =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value.join(", ")
              : ""
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor={`q-${question.id}`}
                className="text-base font-semibold"
              >
                {question.question_text}
              </Label>
            </div>
            <div className="pl-1">
              <textarea
                id={`q-${question.id}`}
                value={textValue}
                onChange={(e) => {
                  if (e.target.value.length <= 2000) {
                    handleAnswerChange(question.id, e.target.value)
                  }
                }}
                maxLength={2000}
                rows={4}
                placeholder="Type your answer here..."
                className="flex min-h-[80px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {textValue.length}/2000 characters
              </div>
            </div>
          </div>
        )
      }

      case "choice":
        if (!question.choices || question.choices.length === 0) {
          return (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-base font-semibold">
                  {question.question_text}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground pl-1">
                No choices available for this question.
              </p>
            </div>
          )
        }
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-base font-semibold">
                {question.question_text}
                {isMultiple && (
                  <span className="text-xs text-muted-foreground ml-2 font-normal">
                    (Select all that apply)
                  </span>
                )}
              </Label>
            </div>
            <div className="space-y-2 pl-1 border-l-2 border-muted pl-4">
              {question.choices.map((choice) => {
                const isChecked = isMultiple
                  ? Array.isArray(value) && value.includes(choice.choice_text)
                  : typeof value === "string" && value === choice.choice_text

                return (
                  <label
                    key={choice.id}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type={isMultiple ? "checkbox" : "radio"}
                      name={isMultiple ? undefined : `q-${question.id}`}
                      value={choice.choice_text}
                      checked={isChecked}
                      onChange={(e) => {
                        if (isMultiple) {
                          handleMultipleAnswerChange(
                            question.id,
                            choice.choice_text,
                            e.target.checked,
                          )
                        } else {
                          handleAnswerChange(question.id, e.target.value)
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{choice.choice_text}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{survey.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please fill in the survey below.{" "}
            {survey.allow_edits
              ? "You will be able to edit your response until the survey ends."
              : "You will not be able to edit your response after it is submitted."}
          </p>
          <SurveyKeyPrompt
            apiKey={apiKey}
            setApiKey={setApiKey}
            hasApiKeyFromProfile={hasApiKeyFromProfile}
            onApiKeyValidated={refreshResponse}
          />
        </CardContent>
      </Card>

      {survey.groups.map((group, groupIndex) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {group.questions.map((question, questionIndex) => (
              <div key={question.id}>
                {renderQuestion(question)}
                {questionIndex < group.questions.length - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent>
          <div className="flex justify-end gap-2">
            {userResponse && survey.allow_edits && (
              <p className="text-sm text-muted-foreground self-center">
                You can edit your response
              </p>
            )}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !apiKey.trim()}
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Submitting...
                </>
              ) : userResponse ? (
                "Update Response"
              ) : (
                "Submit Response"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

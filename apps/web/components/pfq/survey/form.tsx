"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/animate-ui/radix/progress"
import { SurveyKeyPrompt } from "./key-prompt"
import { useSurvey } from "@/hooks/pfq/use-survey"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import {
  countTotalQuestions,
  getAllQuestions,
  formatSurveyDate,
  getSurveyProgressKey,
} from "@/lib/survey-utils"
import { MAX_TEXT_LENGTH, LIKERT_OPTIONS } from "@/lib/survey-constants"
import type { Question } from "@/types/pfq-survey"

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
    isApiKeyValidated,
    markApiKeyAsValidated,
    submitResponse,
    isSurveyActive,
    isSurveyUpcoming,
    isSurveyEnded,
    refreshResponse,
  } = useSurvey(publicId)

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [touchedQuestions, setTouchedQuestions] = useState<Set<number>>(
    new Set(),
  )
  const [validationErrors, setValidationErrors] = useState<Set<number>>(
    new Set(),
  )

  // Count total questions across all groups (memoized for performance)
  // Must be called before any early returns to satisfy React Hooks rules
  const totalQuestions = useMemo(() => countTotalQuestions(survey), [survey])

  // Calculate progress: how many questions have been answered
  const answeredCount = useMemo(() => {
    if (!survey || totalQuestions === 0) return 0

    const allQuestions = getAllQuestions(survey)
    let answered = 0

    for (const question of allQuestions) {
      const answer = answers[question.id]

      // For range questions, check if they've been touched/interacted with
      if (
        question.question_type === "range_5" ||
        question.question_type === "range_10"
      ) {
        if (touchedQuestions.has(question.id) && answer) {
          // Check if answer is valid (not empty)
          if (Array.isArray(answer)) {
            if (answer.length > 0) answered++
          } else if (typeof answer === "string" && answer.trim() !== "") {
            answered++
          }
        }
      } else {
        // For other question types, check if answer exists and is not empty
        if (answer) {
          if (Array.isArray(answer)) {
            if (answer.length > 0) answered++
          } else if (typeof answer === "string" && answer.trim() !== "") {
            answered++
          }
        }
      }
    }

    return answered
  }, [survey, answers, touchedQuestions, totalQuestions])

  const progressPercentage = useMemo(() => {
    if (totalQuestions === 0) return 0
    return Math.round((answeredCount / totalQuestions) * 100)
  }, [answeredCount, totalQuestions])

  const remainingCount = totalQuestions - answeredCount

  // Simple hash function for API key (for localStorage key)
  const hashApiKey = (key: string): string => {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Get localStorage key for this survey and API key
  const getStorageKey = (): string | null => {
    if (!apiKey || !isApiKeyValidated || !publicId) return null
    const apiKeyHash = hashApiKey(apiKey)
    return getSurveyProgressKey(publicId, apiKeyHash)
  }

  // Load from userResponse first (takes precedence over localStorage)
  useEffect(() => {
    if (userResponse?.answers) {
      const initialAnswers: Record<number, string | string[]> = {}
      const touched = new Set<number>()
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
        // Mark questions with existing answers as touched
        touched.add(answer.question_id)
      }
      setAnswers(initialAnswers)
      setTouchedQuestions(touched)
    }
  }, [userResponse])

  // Load from localStorage when API key is validated (only if no userResponse)
  useEffect(() => {
    // Skip if userResponse exists (it takes precedence)
    if (userResponse?.answers) return
    if (!isApiKeyValidated || !apiKey || !publicId) return

    const storageKey = getStorageKey()
    if (!storageKey) return

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const savedData = JSON.parse(saved)
        if (savedData.answers && typeof savedData.answers === "object") {
          setAnswers(savedData.answers)
          setTouchedQuestions(new Set<number>(savedData.touchedQuestions || []))
        }
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [isApiKeyValidated, apiKey, publicId, userResponse])

  // Save to localStorage on answers change (debounced)
  useEffect(() => {
    if (!isApiKeyValidated || !apiKey || !publicId) return

    const storageKey = getStorageKey()
    if (!storageKey) return

    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = {
          answers,
          touchedQuestions: Array.from(touchedQuestions),
          timestamp: Date.now(),
        }
        localStorage.setItem(storageKey, JSON.stringify(dataToSave))
      } catch (error) {
        // Handle quota exceeded or other errors gracefully
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          console.warn("localStorage quota exceeded, cannot save progress")
        } else {
          console.error("Error saving to localStorage:", error)
        }
      }
    }, 500) // Debounce by 500ms

    return () => clearTimeout(timeoutId)
  }, [answers, touchedQuestions, isApiKeyValidated, apiKey, publicId])

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
            {formatSurveyDate(survey.start_date)}.
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
            {formatSurveyDate(survey.end_date)}.
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
    // Mark question as touched
    setTouchedQuestions((prev) => new Set(prev).add(questionId))
    // Clear validation error for this question
    setValidationErrors((prev) => {
      const next = new Set(prev)
      next.delete(questionId)
      return next
    })
  }

  const handleMultipleAnswerChange = (
    questionId: number,
    choiceValue: string,
    checked: boolean,
  ) => {
    // Find the question to check max_selections
    const allQuestions = getAllQuestions(survey)
    const question = allQuestions.find((q) => q.id === questionId)

    setAnswers((prev) => {
      const current = prev[questionId]
      const currentArray = Array.isArray(current)
        ? current
        : current
          ? [current]
          : []

      if (checked) {
        // Check max_selections limit
        if (question?.max_selections && currentArray.length >= question.max_selections) {
          toast.error(
            `You can only select up to ${question.max_selections} option(s) for this question.`,
            toastStyles.error,
          )
          return prev
        }

        // Add choice if not already present
        if (!currentArray.includes(choiceValue)) {
          // Mark question as touched
          setTouchedQuestions((prev) => new Set(prev).add(questionId))
          // Clear validation error for this question
          setValidationErrors((prev) => {
            const next = new Set(prev)
            next.delete(questionId)
            return next
          })
          return { ...prev, [questionId]: [...currentArray, choiceValue] }
        }
      } else {
        // Remove choice
        // Mark question as touched
        setTouchedQuestions((prev) => new Set(prev).add(questionId))
        // Clear validation error for this question
        setValidationErrors((prev) => {
          const next = new Set(prev)
          next.delete(questionId)
          return next
        })
        return {
          ...prev,
          [questionId]: currentArray.filter((v) => v !== choiceValue),
        }
      }
      return prev
    })
  }

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (submitting) {
      return
    }

    // Get all questions using utility function
    const allQuestions = getAllQuestions(survey)

    // Prevent submission if there are no questions
    if (allQuestions.length === 0) {
      toast.error("This survey has no answerable questions.", toastStyles.error)
      return
    }

    // Build answer array - include "N/A" for unanswered optional questions
    const answerArray: { question_id: number; answer_value: string }[] = []
    const answeredQuestionIds = new Set(Object.keys(answers).map(Number))

    for (const question of allQuestions) {
      const questionId = question.id
      if (answeredQuestionIds.has(questionId)) {
        // Question has an answer
        const answerValue = answers[questionId]
        const serializedValue = Array.isArray(answerValue)
          ? JSON.stringify(answerValue)
          : answerValue
        answerArray.push({
          question_id: questionId,
          answer_value: serializedValue,
        })
      } else if (question.is_optional === true) {
        // Optional question with no answer - will be handled by API as "N/A"
        // We don't need to include it here, the API will add it
      }
      // Required questions without answers are caught by validation above
    }

    const unansweredQuestions = allQuestions.filter((q) => {
      // Skip validation for optional questions
      if (q.is_optional === true) {
        return false
      }

      const answer = answers[q.id]

      // For range questions, check if they've been touched/interacted with
      // Range questions default to "0" visually, so we need to check if user interacted
      if (q.question_type === "range_5" || q.question_type === "range_10") {
        // If not touched, it's unanswered
        if (!touchedQuestions.has(q.id)) return true
        // If touched but answer is missing or empty, it's unanswered
        if (!answer) return true
        // Check if answer is empty string (for string type) or empty array
        if (Array.isArray(answer)) {
          return answer.length === 0
        }
        if (typeof answer === "string" && answer.trim() === "") return true
        // If it was touched, "0" is a valid answer
        return false
      }

      // For other question types, use standard validation
      if (!answer) return true
      if (Array.isArray(answer)) {
        return answer.length === 0
      }
      return answer.trim() === ""
    })

    if (unansweredQuestions.length > 0) {
      // Set validation errors for visual indication
      setValidationErrors(new Set(unansweredQuestions.map((q) => q.id)))

      const questionTexts = unansweredQuestions
        .slice(0, 3)
        .map((q) => {
          const text =
            q.question_text.length > 50
              ? q.question_text.substring(0, 50) + "..."
              : q.question_text
          return `"${text}"`
        })
        .join(", ")

      const remainingCount = unansweredQuestions.length - 3
      const questionList =
        remainingCount > 0
          ? `${questionTexts}, and ${remainingCount} more`
          : questionTexts

      toast.error(
        `Please answer all questions. Unanswered: ${questionList}.`,
        toastStyles.error,
      )
      return
    }

    // Clear validation errors if all questions are answered
    setValidationErrors(new Set())

    const success = await submitResponse(answerArray)
    if (success) {
      // Clear localStorage after successful submission
      const storageKey = getStorageKey()
      if (storageKey) {
        try {
          localStorage.removeItem(storageKey)
        } catch (error) {
          console.error("Error clearing localStorage:", error)
        }
      }
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
        const hasError = validationErrors.has(question.id)
        const isTouched = touchedQuestions.has(question.id)
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor={`q-${question.id}`}
                className={`text-base font-semibold ${hasError ? "text-destructive" : ""}`}
              >
                {question.question_text}
                {hasError && (
                  <span className="text-destructive text-sm font-normal ml-2">
                    (Please answer this question)
                  </span>
                )}
              </Label>
            </div>
            <div
              className={`space-y-2 pl-1 ${hasError ? "border-l-2 border-destructive pl-4" : ""}`}
            >
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
                <span
                  className={`font-medium ${hasError && !isTouched ? "text-destructive" : ""}`}
                >
                  {rangeValue || 0}
                </span>
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
        const hasError = validationErrors.has(question.id)
        const isTouched = touchedQuestions.has(question.id)
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor={`q-${question.id}`}
                className={`text-base font-semibold ${hasError ? "text-destructive" : ""}`}
              >
                {question.question_text}
                {hasError && (
                  <span className="text-destructive text-sm font-normal ml-2">
                    (Please answer this question)
                  </span>
                )}
              </Label>
            </div>
            <div
              className={`space-y-2 pl-1 ${hasError ? "border-l-2 border-destructive pl-4" : ""}`}
            >
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
                <span
                  className={`font-medium ${hasError && !isTouched ? "text-destructive" : ""}`}
                >
                  {rangeValue || 0}
                </span>
                <span>10</span>
              </div>
            </div>
          </div>
        )
      }

      case "likert": {
        const hasError = validationErrors.has(question.id)
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                className={`text-base font-semibold ${hasError ? "text-destructive" : ""}`}
              >
                {question.question_text}
                {hasError && (
                  <span className="text-destructive text-sm font-normal ml-2">
                    (Please answer this question)
                  </span>
                )}
              </Label>
            </div>
            <div
              className={`space-y-2 pl-1 border-l-2 ${hasError ? "border-destructive" : "border-muted"} pl-4`}
            >
              {LIKERT_OPTIONS.map((option, index) => (
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
      }

      case "text": {
        const textValue =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value.join(", ")
              : ""
        const hasError = validationErrors.has(question.id)
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor={`q-${question.id}`}
                className={`text-base font-semibold ${hasError ? "text-destructive" : ""}`}
              >
                {question.question_text}
                {hasError && (
                  <span className="text-destructive text-sm font-normal ml-2">
                    (Please answer this question)
                  </span>
                )}
              </Label>
            </div>
            <div className="pl-1">
              <textarea
                id={`q-${question.id}`}
                value={textValue}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_TEXT_LENGTH) {
                    handleAnswerChange(question.id, e.target.value)
                  }
                }}
                maxLength={MAX_TEXT_LENGTH}
                rows={4}
                placeholder="Type your answer here..."
                className={`flex min-h-[80px] w-full rounded-md border-2 bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  hasError
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {textValue.length}/{MAX_TEXT_LENGTH} characters
              </div>
            </div>
          </div>
        )
      }

      case "number": {
        const numberValue =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value[0] || ""
              : ""
        const hasError = validationErrors.has(question.id)
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor={`q-${question.id}`}
                className={`text-base font-semibold ${hasError ? "text-destructive" : ""}`}
              >
                {question.question_text}
                {hasError && (
                  <span className="text-destructive text-sm font-normal ml-2">
                    (Please answer this question)
                  </span>
                )}
              </Label>
            </div>
            <div className="pl-1">
              <Input
                id={`q-${question.id}`}
                type="number"
                value={numberValue}
                onChange={(e) => {
                  // Only allow digits (including negative and decimal)
                  const inputValue = e.target.value
                  // Allow empty string, negative sign, decimal point, and digits
                  if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
                    handleAnswerChange(question.id, inputValue)
                  }
                }}
                placeholder="Enter a number..."
                className={`${
                  hasError
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
            </div>
          </div>
        )
      }

      case "choice": {
        const hasError = validationErrors.has(question.id)
        if (!question.choices || question.choices.length === 0) {
          return (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label
                  className={`text-base font-semibold ${hasError ? "text-destructive" : ""}`}
                >
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
              <Label
                className={`text-base font-semibold ${hasError ? "text-destructive" : ""}`}
              >
                {question.question_text}
                {isMultiple && (
                  <span className="text-xs text-muted-foreground ml-2 font-normal">
                    {question.max_selections
                      ? `(Select up to ${question.max_selections})`
                      : "(Select all that apply)"}
                  </span>
                )}
                {hasError && (
                  <span className="text-destructive text-sm font-normal ml-2">
                    (Please answer this question)
                  </span>
                )}
              </Label>
            </div>
            <div
              className={`space-y-2 pl-1 border-l-2 ${hasError ? "border-destructive" : "border-muted"} pl-4`}
            >
              {question.choices.map((choice) => {
                const isChecked = isMultiple
                  ? Array.isArray(value) && value.includes(choice.choice_text)
                  : typeof value === "string" && value === choice.choice_text

                // Check if we're at max selections and this choice is not checked
                const currentSelections = isMultiple && Array.isArray(value) ? value.length : 0
                const isAtMax = question.max_selections && currentSelections >= question.max_selections && !isChecked

                return (
                  <label
                    key={choice.id}
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      isAtMax
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type={isMultiple ? "checkbox" : "radio"}
                      name={isMultiple ? undefined : `q-${question.id}`}
                      value={choice.choice_text}
                      checked={isChecked}
                      disabled={isAtMax}
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
              {isMultiple && question.max_selections && (
                <p className="text-xs text-muted-foreground mt-2">
                  {(() => {
                    const currentSelections = Array.isArray(value) ? value.length : 0
                    return `${currentSelections} of ${question.max_selections} selected`
                  })()}
                </p>
              )}
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Sticky Progress Indicator - only show when API key is validated */}
      {totalQuestions > 0 && isApiKeyValidated && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm py-4 -mx-4 px-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {answeredCount} of {totalQuestions} questions answered
              </span>
              <span className="font-medium">
                {remainingCount}{" "}
                {remainingCount === 1 ? "question" : "questions"} remaining
              </span>
            </div>
            <Progress value={progressPercentage} />
            <p className="text-xs text-muted-foreground text-center">
              {progressPercentage}% complete
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{survey.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            isApiKeyValidated={isApiKeyValidated}
            onApiKeyValidated={(validatedKey) => {
              markApiKeyAsValidated()
              refreshResponse(validatedKey)
            }}
          />
        </CardContent>
      </Card>

      {/* Only show questions when API key is validated */}
      {!isApiKeyValidated ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Please validate your API key to view and answer questions.
            </p>
          </CardContent>
        </Card>
      ) : totalQuestions === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-center">
              This survey currently has no answerable questions. Please check
              back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        survey.groups.map((group, groupIndex) => (
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
        ))
      )}

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
              disabled={
                submitting || !isApiKeyValidated || totalQuestions === 0
              }
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

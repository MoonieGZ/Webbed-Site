"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSurveyCreate } from "@/hooks/pfq/use-survey-create"
import { QuestionGroupEditor } from "./question-group-editor"
import { QuestionEditor } from "./question-editor"
import { Copy, Check, AlertTriangle, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Survey } from "@/types/pfq-survey"

interface SurveyCreateFormProps {
  publicId?: string
}

export function SurveyCreateForm({ publicId }: SurveyCreateFormProps) {
  const router = useRouter()
  const {
    survey,
    groups,
    questions,
    creating,
    loading,
    createSurvey,
    updateSurvey,
    addGroup,
    updateGroup,
    deleteGroup,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    setGroups,
    setQuestions,
    loadSurvey,
  } = useSurveyCreate(publicId)

  useEffect(() => {
    if (publicId && !survey && !loading) {
      loadSurvey(publicId)
    }
  }, [publicId, survey, loading, loadSurvey])

  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [anonymousResponses, setAnonymousResponses] = useState(false)
  const [allowEdits, setAllowEdits] = useState(false)
  const [publicIdCopied, setPublicIdCopied] = useState(false)
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(false)

  // Load available surveys list
  useEffect(() => {
    const fetchSurveys = async () => {
      setLoadingSurveys(true)
      try {
        const response = await fetch("/api/pfq/surveys")
        const data = await response.json()
        if (response.ok && data.surveys) {
          setAvailableSurveys(data.surveys)
        }
      } catch (error) {
        console.error("Error fetching surveys:", error)
      } finally {
        setLoadingSurveys(false)
      }
    }
    fetchSurveys()
  }, [])

  // Sync form state with loaded survey
  useEffect(() => {
    if (survey) {
      setName(survey.name)
      setStartDate(survey.start_date ? new Date(survey.start_date).toISOString().slice(0, 16) : "")
      setEndDate(survey.end_date ? new Date(survey.end_date).toISOString().slice(0, 16) : "")
      setAnonymousResponses(survey.anonymous_responses)
      setAllowEdits(survey.allow_edits)
    }
  }, [survey])

  // Helper to get date string value
  const getStartDateValue = (): string => {
    if (startDate) return startDate
    if (survey?.start_date) return new Date(survey.start_date).toISOString().slice(0, 16)
    return ""
  }

  const getEndDateValue = (): string => {
    if (endDate) return endDate
    if (survey?.end_date) return new Date(survey.end_date).toISOString().slice(0, 16)
    return ""
  }

  const handleSelectSurvey = (selectedPublicId: string) => {
    if (selectedPublicId) {
      loadSurvey(selectedPublicId)
      // Update URL without reload
      window.history.pushState(
        {},
        "",
        `/pfq/survey/create?surveyId=${selectedPublicId}`,
      )
    }
  }

  const handleCreateSurvey = async () => {
    if (!name.trim()) {
      toast.error("Please enter a survey name", toastStyles.error)
      return
    }
    if (!startDate || !endDate) {
      toast.error("Please enter start and end dates", toastStyles.error)
      return
    }

    const surveyData = {
      name: name.trim(),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      anonymous_responses: anonymousResponses,
      allow_edits: allowEdits,
    }

    const created = await createSurvey(surveyData)
    if (created) {
      // Survey created, can now add groups and questions
    }
  }

  const handleUpdateSurvey = async () => {
    if (!survey) return

    const updates: any = {}
    if (name.trim() !== survey.name) updates.name = name.trim()
    if (startDate) {
      const newStart = new Date(startDate).toISOString()
      if (newStart !== survey.start_date) updates.start_date = newStart
    }
    if (endDate) {
      const newEnd = new Date(endDate).toISOString()
      if (newEnd !== survey.end_date) updates.end_date = newEnd
    }
    if (anonymousResponses !== survey.anonymous_responses) {
      updates.anonymous_responses = anonymousResponses
    }
    if (allowEdits !== survey.allow_edits) {
      updates.allow_edits = allowEdits
    }

    if (Object.keys(updates).length > 0) {
      await updateSurvey(updates)
    }
  }

  const copyPublicId = () => {
    if (survey?.public_id) {
      navigator.clipboard.writeText(
        `${window.location.origin}/pfq/survey/${survey.public_id}`,
      )
      setPublicIdCopied(true)
      setTimeout(() => setPublicIdCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (survey) {
    // Check if survey is currently active (live)
    const now = new Date()
    const startDate = new Date(survey.start_date)
    const endDate = new Date(survey.end_date)
    const isLive = now >= startDate && now <= endDate

    // Survey loaded or created - show edit form and group/question management
    return (
      <div className="space-y-6">
        {isLive && (
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Survey is Currently Live
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Warning:</strong> This survey is currently active and accepting responses. 
                    Adding new questions or changing the order of existing questions will falsify results 
                    and may cause data inconsistencies. Only make changes if absolutely necessary.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Survey Created</CardTitle>
            <CardDescription>
              Survey ID: <code className="bg-muted px-1 rounded">{survey.public_id}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Survey Link</p>
                  <code className="text-xs break-all">
                    {window.location.origin}/pfq/survey/{survey.public_id}
                  </code>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => router.push(`/pfq/survey/${survey.public_id}/results`)}
                    variant="outline"
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Responses
                  </Button>
                  <Button
                    onClick={copyPublicId}
                    variant="outline"
                    size="sm"
                  >
                    {publicIdCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="survey-name">Survey Name</Label>
                <Input
                  id="survey-name"
                  value={name || survey.name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date & Time</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={getStartDateValue()}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date & Time</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={getEndDateValue()}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous">Anonymous Responses</Label>
                  <p className="text-xs text-muted-foreground">
                    Hide user information in results
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={anonymousResponses ?? survey.anonymous_responses}
                  onCheckedChange={setAnonymousResponses}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-edits">Allow Edits</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow users to edit their responses
                  </p>
                </div>
                <Switch
                  id="allow-edits"
                  checked={allowEdits ?? survey.allow_edits}
                  onCheckedChange={setAllowEdits}
                />
              </div>

              <Button onClick={handleUpdateSurvey} className="w-full">
                Update Survey
              </Button>
            </div>
          </CardContent>
        </Card>

        <QuestionGroupEditor
          surveyPublicId={survey.public_id}
          groups={groups}
          onAddGroup={addGroup}
          onUpdateGroup={updateGroup}
          onDeleteGroup={deleteGroup}
          onGroupsChange={setGroups}
        />

        {groups.map((group) => (
          <QuestionEditor
            key={group.id}
            surveyPublicId={survey.public_id}
            group={group}
            questions={questions.filter((q) => q.group_id === group.id)}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onDeleteQuestion={deleteQuestion}
            onQuestionsChange={(newQuestions) => {
              setQuestions([
                ...questions.filter((q) => q.group_id !== group.id),
                ...newQuestions,
              ])
            }}
          />
        ))}
      </div>
    )
  }

  // Initial survey creation form
  return (
    <div className="space-y-6">
      {availableSurveys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Load Existing Survey</CardTitle>
            <CardDescription>
              Select a survey to continue editing, or create a new one below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={publicId || ""}
              onValueChange={handleSelectSurvey}
              disabled={loadingSurveys}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a survey to edit..." />
              </SelectTrigger>
              <SelectContent>
                {availableSurveys.map((s) => (
                  <SelectItem key={s.public_id} value={s.public_id}>
                    {s.name} ({s.public_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Survey</CardTitle>
          <CardDescription>
            Fill in the survey details below. You can add questions after creating
            the survey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Survey Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter survey name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start Date & Time</Label>
            <Input
              id="start"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End Date & Time</Label>
            <Input
              id="end"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="anonymous-new">Anonymous Responses</Label>
            <p className="text-xs text-muted-foreground">
              Hide user information in results
            </p>
          </div>
          <Switch
            id="anonymous-new"
            checked={anonymousResponses}
            onCheckedChange={setAnonymousResponses}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow-edits-new">Allow Edits</Label>
            <p className="text-xs text-muted-foreground">
              Allow users to edit their responses
            </p>
          </div>
          <Switch
            id="allow-edits-new"
            checked={allowEdits}
            onCheckedChange={setAllowEdits}
          />
        </div>

        <Button
          onClick={handleCreateSurvey}
          disabled={creating || !name.trim() || !startDate || !endDate}
          className="w-full"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              Creating...
            </>
          ) : (
            "Create Survey"
          )}
        </Button>
      </CardContent>
    </Card>
    </div>
  )
}


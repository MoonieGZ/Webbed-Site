"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type {
  Survey,
  QuestionGroup,
  Question,
  CreateSurveyRequest,
  CreateQuestionGroupRequest,
  CreateQuestionRequest,
} from "@/types/pfq-survey"

export function useSurveyCreate(publicId?: string) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [groups, setGroups] = useState<QuestionGroup[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  const [savingQuestion, setSavingQuestion] = useState(false)

  const loadSurvey = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pfq/surveys/${id}`)
      const data = await response.json()

      if (response.ok && data.survey) {
        // The API returns { survey: { ...survey, groups } }
        const fullSurvey = data.survey
        setSurvey({
          id: fullSurvey.id,
          public_id: fullSurvey.public_id,
          name: fullSurvey.name,
          start_date: fullSurvey.start_date,
          end_date: fullSurvey.end_date,
          anonymous_responses: fullSurvey.anonymous_responses,
          allow_edits: fullSurvey.allow_edits,
          created_by: fullSurvey.created_by,
          created_at: fullSurvey.created_at,
          updated_at: fullSurvey.updated_at,
        })

        // Extract groups and questions from the survey
        const surveyGroups: QuestionGroup[] = []
        const surveyQuestions: Question[] = []

        for (const group of fullSurvey.groups || []) {
          surveyGroups.push({
            id: group.id,
            survey_id: group.survey_id,
            name: group.name,
            order_index: group.order_index,
            created_at: group.created_at,
          })

          for (const question of group.questions || []) {
            surveyQuestions.push({
              id: question.id,
              group_id: question.group_id,
              survey_id: question.survey_id,
              question_text: question.question_text,
              question_type: question.question_type,
              allow_multiple: question.allow_multiple ?? false,
              max_selections: question.max_selections ?? null,
              is_optional: question.is_optional ?? false,
              order_index: question.order_index,
              created_at: question.created_at,
              choices: question.choices || [],
            })
          }
        }

        setGroups(surveyGroups)
        setQuestions(surveyQuestions)
      } else {
        toast.error(data.error || "Failed to load survey.", toastStyles.error)
      }
    } catch (error) {
      console.error("Error loading survey:", error)
      toast.error("Failed to load survey.", toastStyles.error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load existing survey if publicId is provided
  useEffect(() => {
    if (publicId) {
      loadSurvey(publicId)
    }
  }, [publicId, loadSurvey])

  const createSurvey = async (data: CreateSurveyRequest) => {
    setCreating(true)
    try {
      const response = await fetch("/api/pfq/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSurvey(result.survey)
        toast.success("Survey created successfully!", toastStyles.success)
        return result.survey
      } else {
        toast.error(
          result.error || "Failed to create survey.",
          toastStyles.error,
        )
        return null
      }
    } catch (error) {
      console.error("Error creating survey:", error)
      toast.error("Failed to create survey.", toastStyles.error)
      return null
    } finally {
      setCreating(false)
    }
  }

  const updateSurvey = async (data: Partial<CreateSurveyRequest>) => {
    if (!survey) return false

    try {
      const response = await fetch(`/api/pfq/surveys/${survey.public_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSurvey(result.survey)
        toast.success("Survey updated successfully!", toastStyles.success)
        return true
      } else {
        toast.error(
          result.error || "Failed to update survey.",
          toastStyles.error,
        )
        return false
      }
    } catch (error) {
      console.error("Error updating survey:", error)
      toast.error("Failed to update survey.", toastStyles.error)
      return false
    }
  }

  const addGroup = async (data: CreateQuestionGroupRequest) => {
    if (!survey) return null

    setSavingGroup(true)
    try {
      const response = await fetch(
        `/api/pfq/surveys/${survey.public_id}/groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      )

      const result = await response.json()

      if (response.ok) {
        const newGroup = result.group
        setGroups([...groups, newGroup])
        toast.success("Question group added!", toastStyles.success)
        return newGroup
      } else {
        toast.error(result.error || "Failed to add group.", toastStyles.error)
        return null
      }
    } catch (error) {
      console.error("Error adding group:", error)
      toast.error("Failed to add group.", toastStyles.error)
      return null
    } finally {
      setSavingGroup(false)
    }
  }

  const updateGroup = async (
    groupId: number,
    data: Partial<CreateQuestionGroupRequest>,
  ) => {
    if (!survey) return false

    try {
      const response = await fetch(
        `/api/pfq/surveys/${survey.public_id}/groups/${groupId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      )

      const result = await response.json()

      if (response.ok) {
        setGroups(groups.map((g) => (g.id === groupId ? result.group : g)))
        toast.success("Group updated!", toastStyles.success)
        return true
      } else {
        toast.error(
          result.error || "Failed to update group.",
          toastStyles.error,
        )
        return false
      }
    } catch (error) {
      console.error("Error updating group:", error)
      toast.error("Failed to update group.", toastStyles.error)
      return false
    }
  }

  const deleteGroup = async (groupId: number) => {
    if (!survey) return false

    try {
      const response = await fetch(
        `/api/pfq/surveys/${survey.public_id}/groups/${groupId}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        setGroups(groups.filter((g) => g.id !== groupId))
        setQuestions(
          questions.filter((q) => {
            const group = groups.find((g) => g.id === groupId)
            return group ? q.group_id !== groupId : true
          }),
        )
        toast.success("Group deleted!", toastStyles.success)
        return true
      } else {
        const result = await response.json()
        toast.error(
          result.error || "Failed to delete group.",
          toastStyles.error,
        )
        return false
      }
    } catch (error) {
      console.error("Error deleting group:", error)
      toast.error("Failed to delete group.", toastStyles.error)
      return false
    }
  }

  const addQuestion = async (data: CreateQuestionRequest) => {
    if (!survey) return null

    setSavingQuestion(true)
    try {
      const response = await fetch(
        `/api/pfq/surveys/${survey.public_id}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      )

      const result = await response.json()

      if (response.ok) {
        const newQuestion = result.question
        setQuestions([...questions, newQuestion])
        toast.success("Question added!", toastStyles.success)
        return newQuestion
      } else {
        toast.error(
          result.error || "Failed to add question.",
          toastStyles.error,
        )
        return null
      }
    } catch (error) {
      console.error("Error adding question:", error)
      toast.error("Failed to add question.", toastStyles.error)
      return null
    } finally {
      setSavingQuestion(false)
    }
  }

  const updateQuestion = async (
    questionId: number,
    data: Partial<CreateQuestionRequest>,
  ) => {
    if (!survey) return false

    try {
      const response = await fetch(
        `/api/pfq/surveys/${survey.public_id}/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      )

      const result = await response.json()

      if (response.ok) {
        setQuestions(
          questions.map((q) => (q.id === questionId ? result.question : q)),
        )
        toast.success("Question updated!", toastStyles.success)
        return true
      } else {
        toast.error(
          result.error || "Failed to update question.",
          toastStyles.error,
        )
        return false
      }
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question.", toastStyles.error)
      return false
    }
  }

  const deleteQuestion = async (questionId: number) => {
    if (!survey) return false

    try {
      const response = await fetch(
        `/api/pfq/surveys/${survey.public_id}/questions/${questionId}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        setQuestions(questions.filter((q) => q.id !== questionId))
        toast.success("Question deleted!", toastStyles.success)
        return true
      } else {
        const result = await response.json()
        toast.error(
          result.error || "Failed to delete question.",
          toastStyles.error,
        )
        return false
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      toast.error("Failed to delete question.", toastStyles.error)
      return false
    }
  }

  const reset = () => {
    setSurvey(null)
    setGroups([])
    setQuestions([])
  }

  return {
    survey,
    groups,
    questions,
    creating,
    loading,
    savingGroup,
    savingQuestion,
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
    reset,
  }
}

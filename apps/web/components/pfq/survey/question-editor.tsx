"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { sortByOrderIndex } from "@/lib/survey-utils"
import { MAX_CHOICES_PER_QUESTION } from "@/lib/survey-constants"
import type {
  Question,
  QuestionGroup,
  CreateQuestionRequest,
} from "@/types/pfq-survey"
import { Switch } from "@/components/ui/switch"

interface QuestionEditorProps {
  surveyPublicId: string
  group: QuestionGroup
  questions: Question[]
  onAddQuestion: (data: CreateQuestionRequest) => Promise<Question | null>
  onUpdateQuestion: (
    questionId: number,
    data: Partial<CreateQuestionRequest>,
  ) => Promise<boolean>
  onDeleteQuestion: (questionId: number) => Promise<boolean>
  onQuestionsChange: (questions: Question[]) => void
}

export function QuestionEditor({
  group,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onQuestionsChange,
}: QuestionEditorProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<{
    question_text: string
    question_type: "range_5" | "range_10" | "likert" | "text" | "choice" | "number"
    allow_multiple?: boolean
    is_optional?: boolean
    order_index: number
    choices: { choice_text: string; order_index: number }[]
  } | null>(null)
  const [adding, setAdding] = useState(false)
  const [newQuestion, setNewQuestion] = useState<{
    question_text: string
    question_type: "range_5" | "range_10" | "likert" | "text" | "choice" | "number"
    allow_multiple?: boolean
    is_optional?: boolean
    order_index: number
    choices: { choice_text: string; order_index: number }[]
  }>({
    question_text: "",
    question_type: "text",
    allow_multiple: false,
    is_optional: false,
    order_index: 0,
    choices: [],
  })

  const handleAdd = async () => {
    if (!newQuestion.question_text.trim()) {
      toast.error("Please enter a question", toastStyles.error)
      return
    }

    if (
      newQuestion.question_type === "choice" &&
      newQuestion.choices.length === 0
    ) {
      toast.error(
        "Choice questions must have at least one choice",
        toastStyles.error,
      )
      return
    }

    setAdding(true)
    // Auto-set order_index to end if not set
    const maxOrder =
      questions.length > 0
        ? Math.max(...questions.map((q) => q.order_index))
        : -1
    const orderIndex = newQuestion.order_index || maxOrder + 1

    const question = await onAddQuestion({
      group_id: group.id,
      question_text: newQuestion.question_text.trim(),
      question_type: newQuestion.question_type,
      allow_multiple:
        newQuestion.question_type === "choice"
          ? newQuestion.allow_multiple
          : undefined,
      is_optional: newQuestion.is_optional,
      order_index: orderIndex,
      choices:
        newQuestion.question_type === "choice"
          ? newQuestion.choices
          : undefined,
    })

    if (question) {
      setNewQuestion({
        question_text: "",
        question_type: "text",
        allow_multiple: false,
        is_optional: false,
        order_index: 0,
        choices: [],
      })
    }
    setAdding(false)
  }

  const handleStartEdit = (question: Question) => {
    setEditingId(question.id)
    setEditingQuestion({
      question_text: question.question_text,
      question_type: question.question_type,
      allow_multiple: question.allow_multiple ?? false,
      is_optional: question.is_optional ?? false,
      order_index: question.order_index,
      choices: question.choices
        ? question.choices.map((c) => ({
            choice_text: c.choice_text,
            order_index: c.order_index,
          }))
        : [],
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingQuestion) return

    if (!editingQuestion.question_text.trim()) {
      toast.error("Please enter a question", toastStyles.error)
      return
    }

    if (
      editingQuestion.question_type === "choice" &&
      editingQuestion.choices.length === 0
    ) {
      toast.error(
        "Choice questions must have at least one choice",
        toastStyles.error,
      )
      return
    }

    const success = await onUpdateQuestion(editingId, {
      question_text: editingQuestion.question_text.trim(),
      question_type: editingQuestion.question_type,
      is_optional: editingQuestion.is_optional,
      allow_multiple:
        editingQuestion.question_type === "choice"
          ? editingQuestion.allow_multiple
          : undefined,
      order_index: editingQuestion.order_index,
      choices:
        editingQuestion.question_type === "choice"
          ? editingQuestion.choices
          : undefined,
    })

    if (success) {
      setEditingId(null)
      setEditingQuestion(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingQuestion(null)
  }

  const handleDelete = async (questionId: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await onDeleteQuestion(questionId)
    }
  }

  const addEditChoice = () => {
    if (!editingQuestion) return
    if (editingQuestion.choices.length >= MAX_CHOICES_PER_QUESTION) {
      toast.error(
        `Maximum ${MAX_CHOICES_PER_QUESTION} choices allowed`,
        toastStyles.error,
      )
      return
    }
    setEditingQuestion({
      ...editingQuestion,
      choices: [
        ...editingQuestion.choices,
        {
          choice_text: "",
          order_index: editingQuestion.choices.length,
        },
      ],
    })
  }

  const updateEditChoice = (index: number, text: string) => {
    if (!editingQuestion) return
    const updated = [...editingQuestion.choices]
    updated[index] = { ...updated[index], choice_text: text }
    setEditingQuestion({ ...editingQuestion, choices: updated })
  }

  const removeEditChoice = (index: number) => {
    if (!editingQuestion) return
    const updated = editingQuestion.choices.filter((_, i) => i !== index)
    setEditingQuestion({ ...editingQuestion, choices: updated })
  }

  const moveQuestion = async (questionId: number, direction: "up" | "down") => {
    const sortedQuestions = sortByOrderIndex(questions)
    const currentIndex = sortedQuestions.findIndex((q) => q.id === questionId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sortedQuestions.length) return

    const currentQuestion = sortedQuestions[currentIndex]
    const targetQuestion = sortedQuestions[newIndex]

    // Swap order_index values
    const tempOrder = currentQuestion.order_index
    const currentNewOrder = targetQuestion.order_index
    const targetNewOrder = tempOrder

    // Update both questions
    await onUpdateQuestion(currentQuestion.id, { order_index: currentNewOrder })
    await onUpdateQuestion(targetQuestion.id, { order_index: targetNewOrder })

    // Update local state to reflect the change
    const updated = questions.map((q) => {
      if (q.id === currentQuestion.id) {
        return { ...q, order_index: currentNewOrder }
      }
      if (q.id === targetQuestion.id) {
        return { ...q, order_index: targetNewOrder }
      }
      return q
    })
    onQuestionsChange(updated)
  }

  const moveChoice = async (
    questionId: number,
    choiceIndex: number,
    direction: "up" | "down",
  ) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question || !question.choices) return

    const sortedChoices = sortByOrderIndex(question.choices)
    const newIndex = direction === "up" ? choiceIndex - 1 : choiceIndex + 1
    if (newIndex < 0 || newIndex >= sortedChoices.length) return

    const currentChoice = sortedChoices[choiceIndex]
    const targetChoice = sortedChoices[newIndex]

    // Swap order_index values
    const tempOrder = currentChoice.order_index
    const currentNewOrder = targetChoice.order_index
    const targetNewOrder = tempOrder

    // Update both choices - need to get the actual choice IDs
    // For now, we'll update the question with reordered choices
    const updatedChoices = [...sortedChoices]
    updatedChoices[choiceIndex] = {
      ...currentChoice,
      order_index: currentNewOrder,
    }
    updatedChoices[newIndex] = { ...targetChoice, order_index: targetNewOrder }

    await onUpdateQuestion(questionId, {
      choices: updatedChoices.map((c) => ({
        choice_text: c.choice_text,
        order_index: c.order_index,
      })),
    })
  }

  const addChoice = () => {
    if (newQuestion.choices.length >= MAX_CHOICES_PER_QUESTION) {
      toast.error(
        `Maximum ${MAX_CHOICES_PER_QUESTION} choices allowed`,
        toastStyles.error,
      )
      return
    }
    setNewQuestion({
      ...newQuestion,
      choices: [
        ...newQuestion.choices,
        { choice_text: "", order_index: newQuestion.choices.length },
      ],
    })
  }

  const updateChoice = (index: number, text: string) => {
    const updated = [...newQuestion.choices]
    updated[index] = { ...updated[index], choice_text: text }
    setNewQuestion({ ...newQuestion, choices: updated })
  }

  const removeChoice = (index: number) => {
    const updated = newQuestion.choices.filter((_, i) => i !== index)
    setNewQuestion({ ...newQuestion, choices: updated })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions - {group.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <Label>Add New Question</Label>
          <div className="space-y-2">
            <Input
              placeholder="Question text"
              value={newQuestion.question_text}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  question_text: e.target.value,
                })
              }
            />
            <div className="flex gap-2">
              <Select
                value={newQuestion.question_type}
                onValueChange={(
                  value: "range_5" | "range_10" | "likert" | "text" | "choice" | "number",
                ) =>
                  setNewQuestion({
                    ...newQuestion,
                    question_type: value,
                    allow_multiple:
                      value === "choice"
                        ? (newQuestion.allow_multiple ?? false)
                        : undefined,
                    choices: value === "choice" ? newQuestion.choices : [],
                  })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="choice">
                    Choice (Radio/Checkbox)
                  </SelectItem>
                  <SelectItem value="range_5">Range 0-5</SelectItem>
                  <SelectItem value="range_10">Range 0-10</SelectItem>
                  <SelectItem value="likert">Likert Scale</SelectItem>
                  <SelectItem value="text">Text (2000 chars)</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-2 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="is-optional-new" className="text-sm">
                  Optional Question
                </Label>
                <p className="text-xs text-muted-foreground">
                  {newQuestion.is_optional
                    ? "Can be left unanswered (will be saved as 'N/A')"
                    : "Required - must be answered"}
                </p>
              </div>
              <Switch
                id="is-optional-new"
                checked={newQuestion.is_optional ?? false}
                onCheckedChange={(checked) =>
                  setNewQuestion({
                    ...newQuestion,
                    is_optional: checked,
                  })
                }
              />
            </div>

            {newQuestion.question_type === "choice" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-multiple-new" className="text-sm">
                      Allow Multiple Selections
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {newQuestion.allow_multiple
                        ? "Checkboxes"
                        : "Radio buttons"}
                    </p>
                  </div>
                  <Switch
                    id="allow-multiple-new"
                    checked={newQuestion.allow_multiple ?? false}
                    onCheckedChange={(checked) =>
                      setNewQuestion({
                        ...newQuestion,
                        allow_multiple: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Choices (max 10)</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addChoice}
                    disabled={newQuestion.choices.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Choice
                  </Button>
                </div>
                {sortByOrderIndex(newQuestion.choices).map((choice, index) => {
                  const sortedChoices = sortByOrderIndex(newQuestion.choices)
                  return (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Choice ${index + 1}`}
                        value={choice.choice_text}
                        onChange={(e) => {
                          const actualIndex = sortedChoices.findIndex(
                            (c) => c.order_index === choice.order_index,
                          )
                          if (actualIndex !== -1) {
                            updateChoice(actualIndex, e.target.value)
                          }
                        }}
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (index > 0) {
                              const updated = [...sortedChoices]
                              const temp = updated[index].order_index
                              updated[index].order_index =
                                updated[index - 1].order_index
                              updated[index - 1].order_index = temp
                              setNewQuestion({
                                ...newQuestion,
                                choices: updated,
                              })
                            }
                          }}
                          disabled={index === 0}
                          className="h-6 px-2"
                          title="Move up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (index < sortedChoices.length - 1) {
                              const updated = [...sortedChoices]
                              const temp = updated[index].order_index
                              updated[index].order_index =
                                updated[index + 1].order_index
                              updated[index + 1].order_index = temp
                              setNewQuestion({
                                ...newQuestion,
                                choices: updated,
                              })
                            }
                          }}
                          disabled={index === sortedChoices.length - 1}
                          className="h-6 px-2"
                          title="Move down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const actualIndex = sortedChoices.findIndex(
                            (c) => c.order_index === choice.order_index,
                          )
                          if (actualIndex !== -1) {
                            removeChoice(actualIndex)
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <Button onClick={handleAdd} disabled={adding} className="w-full">
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {sortByOrderIndex(questions).map((question) => (
            <div key={question.id} className="p-3 border rounded-lg space-y-2">
              {editingId === question.id && editingQuestion ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Question text"
                      value={editingQuestion.question_text}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          question_text: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Select
                        value={editingQuestion.question_type}
                        onValueChange={(
                          value:
                            | "range_5"
                            | "range_10"
                            | "likert"
                            | "text"
                            | "choice"
                            | "number",
                        ) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            question_type: value,
                            allow_multiple:
                              value === "choice"
                                ? (editingQuestion.allow_multiple ?? false)
                                : undefined,
                            choices:
                              value === "choice" ? editingQuestion.choices : [],
                          })
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="range_5">Range 0-5</SelectItem>
                          <SelectItem value="range_10">Range 0-10</SelectItem>
                          <SelectItem value="likert">Likert Scale</SelectItem>
                          <SelectItem value="text">
                            Text (2000 chars)
                          </SelectItem>
                          <SelectItem value="choice">
                            Choice (Radio/Checkbox)
                          </SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await moveQuestion(question.id, "up")
                          }}
                          disabled={
                            sortByOrderIndex(questions).findIndex(
                              (q) => q.id === question.id,
                            ) === 0
                          }
                          className="h-6 px-2"
                          title="Move up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await moveQuestion(question.id, "down")
                          }}
                          disabled={
                            sortByOrderIndex(questions).findIndex(
                              (q) => q.id === question.id,
                            ) ===
                            questions.length - 1
                          }
                          className="h-6 px-2"
                          title="Move down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <div className="space-y-0.5">
                        <Label htmlFor="is-optional-edit" className="text-sm">
                          Optional Question
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {editingQuestion.is_optional
                            ? "Can be left unanswered (will be saved as 'N/A')"
                            : "Required - must be answered"}
                        </p>
                      </div>
                      <Switch
                        id="is-optional-edit"
                        checked={editingQuestion.is_optional ?? false}
                        onCheckedChange={(checked) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            is_optional: checked,
                          })
                        }
                      />
                    </div>

                    {editingQuestion.question_type === "choice" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="space-y-0.5">
                            <Label
                              htmlFor="allow-multiple-edit"
                              className="text-sm"
                            >
                              Allow Multiple Selections
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {editingQuestion.allow_multiple
                                ? "Checkboxes"
                                : "Radio buttons"}
                            </p>
                          </div>
                          <Switch
                            id="allow-multiple-edit"
                            checked={editingQuestion.allow_multiple ?? false}
                            onCheckedChange={(checked) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                allow_multiple: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Choices (max 10)</Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={addEditChoice}
                            disabled={editingQuestion.choices.length >= 10}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Choice
                          </Button>
                        </div>
                        {sortByOrderIndex(editingQuestion.choices).map(
                          (choice, index) => {
                            const sortedChoices = sortByOrderIndex(
                              editingQuestion.choices,
                            )
                            return (
                              <div key={index} className="flex gap-2">
                                <Input
                                  placeholder={`Choice ${index + 1}`}
                                  value={choice.choice_text}
                                  onChange={(e) => {
                                    const sorted = [
                                      ...editingQuestion.choices,
                                    ].sort(
                                      (a, b) => a.order_index - b.order_index,
                                    )
                                    const actualIndex = sorted.findIndex(
                                      (c) =>
                                        c.order_index === choice.order_index,
                                    )
                                    if (actualIndex !== -1) {
                                      updateEditChoice(
                                        actualIndex,
                                        e.target.value,
                                      )
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (index > 0) {
                                        const updated = [...sortedChoices]
                                        const temp = updated[index].order_index
                                        updated[index].order_index =
                                          updated[index - 1].order_index
                                        updated[index - 1].order_index = temp
                                        setEditingQuestion({
                                          ...editingQuestion,
                                          choices: updated,
                                        })
                                      }
                                    }}
                                    disabled={index === 0}
                                    className="h-6 px-2"
                                    title="Move up"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (index < sortedChoices.length - 1) {
                                        const updated = [...sortedChoices]
                                        const temp = updated[index].order_index
                                        updated[index].order_index =
                                          updated[index + 1].order_index
                                        updated[index + 1].order_index = temp
                                        setEditingQuestion({
                                          ...editingQuestion,
                                          choices: updated,
                                        })
                                      }
                                    }}
                                    disabled={
                                      index === sortedChoices.length - 1
                                    }
                                    className="h-6 px-2"
                                    title="Move down"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const sorted = [
                                      ...editingQuestion.choices,
                                    ].sort(
                                      (a, b) => a.order_index - b.order_index,
                                    )
                                    const actualIndex = sorted.findIndex(
                                      (c) =>
                                        c.order_index === choice.order_index,
                                    )
                                    if (actualIndex !== -1) {
                                      removeEditChoice(actualIndex)
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          },
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{question.question_text}</p>
                    <p className="text-sm text-muted-foreground">
                      Type: {question.question_type}
                    </p>
                    {question.question_type === "choice" &&
                      question.choices && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Choices:{" "}
                          {question.choices
                            .map((c) => c.choice_text)
                            .join(", ")}
                        </div>
                      )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await moveQuestion(question.id, "up")
                        }}
                        disabled={
                          sortByOrderIndex(questions).findIndex(
                            (q) => q.id === question.id,
                          ) === 0
                        }
                        className="h-6 px-2"
                        title="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await moveQuestion(question.id, "down")
                        }}
                        disabled={
                          sortByOrderIndex(questions).findIndex(
                            (q) => q.id === question.id,
                          ) ===
                          questions.length - 1
                        }
                        className="h-6 px-2"
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEdit(question)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

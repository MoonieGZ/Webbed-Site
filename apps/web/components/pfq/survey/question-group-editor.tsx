"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type {
  QuestionGroup,
  CreateQuestionGroupRequest,
} from "@/types/pfq-survey"

interface QuestionGroupEditorProps {
  surveyPublicId: string
  groups: QuestionGroup[]
  onAddGroup: (
    data: CreateQuestionGroupRequest,
  ) => Promise<QuestionGroup | null>
  onUpdateGroup: (
    groupId: number,
    data: Partial<CreateQuestionGroupRequest>,
  ) => Promise<boolean>
  onDeleteGroup: (groupId: number) => Promise<boolean>
  onGroupsChange: (groups: QuestionGroup[]) => void
}

export function QuestionGroupEditor({
  groups,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onGroupsChange,
}: QuestionGroupEditorProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editOrder, setEditOrder] = useState(0)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newOrder, setNewOrder] = useState(0)

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a group name", toastStyles.error)
      return
    }

    setAdding(true)
    const group = await onAddGroup({
      name: newName.trim(),
      order_index: newOrder,
    })

    if (group) {
      setNewName("")
      setNewOrder(0)
    }
    setAdding(false)
  }

  const handleStartEdit = (group: QuestionGroup) => {
    setEditingId(group.id)
    setEditName(group.name)
    setEditOrder(group.order_index)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    if (!editName.trim()) {
      toast.error("Please enter a group name", toastStyles.error)
      return
    }

    const success = await onUpdateGroup(editingId, {
      name: editName.trim(),
      order_index: editOrder,
    })

    if (success) {
      setEditingId(null)
      setEditName("")
      setEditOrder(0)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditOrder(0)
  }

  const handleDelete = async (groupId: number) => {
    if (
      confirm(
        "Are you sure you want to delete this group? All questions in this group will also be deleted.",
      )
    ) {
      await onDeleteGroup(groupId)
    }
  }

  const moveGroup = async (groupId: number, direction: "up" | "down") => {
    const sortedGroups = [...groups].sort(
      (a, b) => a.order_index - b.order_index,
    )
    const currentIndex = sortedGroups.findIndex((g) => g.id === groupId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sortedGroups.length) return

    const currentGroup = sortedGroups[currentIndex]
    const targetGroup = sortedGroups[newIndex]

    // Swap order_index values
    const tempOrder = currentGroup.order_index
    const currentNewOrder = targetGroup.order_index
    const targetNewOrder = tempOrder

    // Update both groups
    await onUpdateGroup(currentGroup.id, { order_index: currentNewOrder })
    await onUpdateGroup(targetGroup.id, { order_index: targetNewOrder })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Groups</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Add New Group</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Group name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {groups
            .sort((a, b) => a.order_index - b.order_index)
            .map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                {editingId === group.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await moveGroup(group.id, "up")
                          setEditOrder(group.order_index - 1)
                        }}
                        disabled={
                          groups
                            .sort((a, b) => a.order_index - b.order_index)
                            .findIndex((g) => g.id === group.id) === 0
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
                          await moveGroup(group.id, "down")
                          setEditOrder(group.order_index + 1)
                        }}
                        disabled={
                          groups
                            .sort((a, b) => a.order_index - b.order_index)
                            .findIndex((g) => g.id === group.id) ===
                          groups.length - 1
                        }
                        className="h-6 px-2"
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-medium">{group.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await moveGroup(group.id, "up")
                          }}
                          disabled={
                            groups
                              .sort((a, b) => a.order_index - b.order_index)
                              .findIndex((g) => g.id === group.id) === 0
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
                            await moveGroup(group.id, "down")
                          }}
                          disabled={
                            groups
                              .sort((a, b) => a.order_index - b.order_index)
                              .findIndex((g) => g.id === group.id) ===
                            groups.length - 1
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
                        onClick={() => handleStartEdit(group)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(group.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

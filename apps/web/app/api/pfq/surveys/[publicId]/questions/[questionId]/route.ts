import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { z } from "zod"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; questionId: string }> },
) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserBySession(sessionToken)
    const isStaff = await isStaffUser(sessionToken)

    if (!user || !isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { publicId, questionId } = await params

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const question = (await queryOne(
      "SELECT id, group_id, question_type FROM pfq_survey_questions WHERE id = ? AND survey_id = ? LIMIT 1",
      [questionId, survey.id],
    )) as any

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const bodySchema = z.object({
      group_id: z.number().int().positive().optional(),
      question_text: z.string().min(1).optional(),
      question_type: z
        .enum(["range_5", "range_10", "likert", "text", "choice", "number"])
        .optional(),
      allow_multiple: z.boolean().optional(), // For choice questions: true = checkboxes, false = radio
      max_selections: z.number().int().positive().nullable().optional(), // For multiple choice: max selections allowed (null = no limit)
      is_optional: z.boolean().optional(), // If true, question can be left unanswered
      order_index: z.number().int().min(0).optional(),
    })

    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }

    const updates = parseResult.data
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (updates.group_id !== undefined) {
      // Verify new group belongs to survey
      const group = (await queryOne(
        "SELECT id FROM pfq_survey_question_groups WHERE id = ? AND survey_id = ? LIMIT 1",
        [updates.group_id, survey.id],
      )) as any

      if (!group) {
        return NextResponse.json(
          { error: "Question group not found" },
          { status: 404 },
        )
      }

      updateFields.push("group_id = ?")
      updateValues.push(updates.group_id)
    }
    if (updates.question_text !== undefined) {
      updateFields.push("question_text = ?")
      updateValues.push(updates.question_text)
    }
    if (updates.question_type !== undefined) {
      updateFields.push("question_type = ?")
      updateValues.push(updates.question_type)

      // If changing from choice to non-choice, delete choices
      if (
        question.question_type === "choice" &&
        updates.question_type !== "choice"
      ) {
        await query(
          "DELETE FROM pfq_survey_answer_choices WHERE question_id = ?",
          [questionId],
        )
      }
    }
    if (updates.allow_multiple !== undefined) {
      // Only allow_multiple for choice questions
      if (
        question.question_type === "choice" ||
        updates.question_type === "choice"
      ) {
        updateFields.push("allow_multiple = ?")
        updateValues.push(updates.allow_multiple ? 1 : 0)
      }
    }
    if (updates.max_selections !== undefined) {
      // Only max_selections for multiple choice questions
      if (
        (question.question_type === "choice" && question.allow_multiple === 1) ||
        (updates.question_type === "choice" && updates.allow_multiple === true)
      ) {
        updateFields.push("max_selections = ?")
        updateValues.push(updates.max_selections ?? null)
      } else {
        // Clear max_selections if not a multiple choice question
        updateFields.push("max_selections = ?")
        updateValues.push(null)
      }
    }
    if (updates.is_optional !== undefined) {
      updateFields.push("is_optional = ?")
      updateValues.push(updates.is_optional ? 1 : 0)
    }
    if (updates.order_index !== undefined) {
      updateFields.push("order_index = ?")
      updateValues.push(updates.order_index)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      )
    }

    updateValues.push(questionId)

    await query(
      `UPDATE pfq_survey_questions SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    )

    const updatedQuestion = (await queryOne(
      "SELECT id, group_id, survey_id, question_text, question_type, allow_multiple, max_selections, is_optional, order_index, created_at FROM pfq_survey_questions WHERE id = ? LIMIT 1",
      [questionId],
    )) as any
    updatedQuestion.allow_multiple = updatedQuestion.allow_multiple === 1
    updatedQuestion.max_selections = updatedQuestion.max_selections ?? null
    updatedQuestion.is_optional = updatedQuestion.is_optional === 1

    if (updatedQuestion.question_type === "choice") {
      const choices = await query(
        "SELECT id, question_id, choice_text, order_index, created_at FROM pfq_survey_answer_choices WHERE question_id = ? ORDER BY order_index ASC",
        [questionId],
      )
      updatedQuestion.choices = choices
    }

    return NextResponse.json({ question: updatedQuestion })
  } catch (error) {
    console.error("Question update error:", error)
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; questionId: string }> },
) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserBySession(sessionToken)
    const isStaff = await isStaffUser(sessionToken)

    if (!user || !isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { publicId, questionId } = await params

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    await query(
      "DELETE FROM pfq_survey_questions WHERE id = ? AND survey_id = ?",
      [questionId, survey.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Question delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    )
  }
}

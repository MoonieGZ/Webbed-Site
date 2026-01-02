import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { z } from "zod"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
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

    const { publicId } = await params

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const bodySchema = z.object({
      group_id: z.number().int().positive(),
      question_text: z.string().min(1),
      question_type: z.enum([
        "range_5",
        "range_10",
        "likert",
        "text",
        "choice",
        "number",
      ]),
      allow_multiple: z.boolean().optional(), // For choice questions: true = checkboxes, false = radio
      max_selections: z.number().int().positive().nullable().optional(), // For multiple choice: max selections allowed (null = no limit)
      is_optional: z.boolean().optional(), // If true, question can be left unanswered
      order_index: z.number().int().min(0),
      choices: z
        .array(
          z.object({
            choice_text: z.string().min(1).max(255),
            order_index: z.number().int().min(0),
          }),
        )
        .max(10)
        .optional(),
    })

    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }

    const {
      group_id,
      question_text,
      question_type,
      allow_multiple,
      max_selections,
      is_optional,
      order_index,
      choices,
    } = parseResult.data

    // Verify group belongs to survey
    const group = (await queryOne(
      "SELECT id FROM pfq_survey_question_groups WHERE id = ? AND survey_id = ? LIMIT 1",
      [group_id, survey.id],
    )) as any

    if (!group) {
      return NextResponse.json(
        { error: "Question group not found" },
        { status: 404 },
      )
    }

    // Validate choices for choice type questions
    if (question_type === "choice") {
      if (!choices || choices.length === 0) {
        return NextResponse.json(
          { error: "Choice questions must have at least one choice" },
          { status: 400 },
        )
      }
      if (choices.length > 10) {
        return NextResponse.json(
          { error: "Choice questions can have at most 10 choices" },
          { status: 400 },
        )
      }
    } else if (choices && choices.length > 0) {
      return NextResponse.json(
        { error: "Only choice type questions can have choices" },
        { status: 400 },
      )
    }

    const result = (await query(
      "INSERT INTO pfq_survey_questions (group_id, survey_id, question_text, question_type, allow_multiple, max_selections, is_optional, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        group_id,
        survey.id,
        question_text,
        question_type,
        question_type === "choice" ? (allow_multiple ? 1 : 0) : 0,
        question_type === "choice" && allow_multiple ? max_selections ?? null : null,
        is_optional ? 1 : 0,
        order_index,
      ],
    )) as any

    const questionId = result.insertId

    // Insert choices if provided
    if (choices && choices.length > 0) {
      for (const choice of choices) {
        await query(
          "INSERT INTO pfq_survey_answer_choices (question_id, choice_text, order_index) VALUES (?, ?, ?)",
          [questionId, choice.choice_text, choice.order_index],
        )
      }
    }

    const question = (await queryOne(
      "SELECT id, group_id, survey_id, question_text, question_type, allow_multiple, max_selections, is_optional, order_index, created_at FROM pfq_survey_questions WHERE id = ? LIMIT 1",
      [questionId],
    )) as any
    question.allow_multiple = question.allow_multiple === 1
    question.max_selections = question.max_selections ?? null
    question.is_optional = question.is_optional === 1

    if (question_type === "choice" && choices) {
      const insertedChoices = await query(
        "SELECT id, question_id, choice_text, order_index, created_at FROM pfq_survey_answer_choices WHERE question_id = ? ORDER BY order_index ASC",
        [questionId],
      )
      question.choices = insertedChoices
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Question creation error:", error)
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    )
  }
}

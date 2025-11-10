import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { z } from "zod"

export async function POST(
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
      "SELECT id, question_type FROM pfq_survey_questions WHERE id = ? AND survey_id = ? LIMIT 1",
      [questionId, survey.id],
    )) as any

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      )
    }

    if (question.question_type !== "choice") {
      return NextResponse.json(
        { error: "Only choice type questions can have choices" },
        { status: 400 },
      )
    }

    // Check current choice count
    const currentChoices = (await query(
      "SELECT id FROM pfq_survey_answer_choices WHERE question_id = ?",
      [questionId],
    )) as any[]

    if (currentChoices.length >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 choices allowed per question" },
        { status: 400 },
      )
    }

    const bodySchema = z.object({
      choice_text: z.string().min(1).max(255),
      order_index: z.number().int().min(0),
    })

    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }

    const { choice_text, order_index } = parseResult.data

    const result = await query(
      "INSERT INTO pfq_survey_answer_choices (question_id, choice_text, order_index) VALUES (?, ?, ?)",
      [questionId, choice_text, order_index],
    ) as any

    const choice = await queryOne(
      "SELECT id, question_id, choice_text, order_index, created_at FROM pfq_survey_answer_choices WHERE id = ? LIMIT 1",
      [result.insertId],
    )

    return NextResponse.json({ choice })
  } catch (error) {
    console.error("Answer choice creation error:", error)
    return NextResponse.json(
      { error: "Failed to create answer choice" },
      { status: 500 },
    )
  }
}


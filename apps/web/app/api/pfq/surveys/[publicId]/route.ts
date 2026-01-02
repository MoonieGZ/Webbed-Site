import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { z } from "zod"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  try {
    const { publicId } = await params

    const survey = (await queryOne(
      "SELECT id, public_id, name, start_date, end_date, anonymous_responses, allow_edits, created_by, created_at, updated_at FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    // Get question groups with questions
    const groups = (await query(
      "SELECT id, survey_id, name, order_index, created_at FROM pfq_survey_question_groups WHERE survey_id = ? ORDER BY order_index ASC",
      [survey.id],
    )) as any[]

    for (const group of groups) {
      const questions = (await query(
        "SELECT id, group_id, survey_id, question_text, question_type, allow_multiple, is_optional, order_index, created_at FROM pfq_survey_questions WHERE group_id = ? ORDER BY order_index ASC",
        [group.id],
      )) as any[]

      for (const question of questions) {
        question.allow_multiple = question.allow_multiple === 1
        question.is_optional = question.is_optional === 1
        if (question.question_type === "choice") {
          const choices = await query(
            "SELECT id, question_id, choice_text, order_index, created_at FROM pfq_survey_answer_choices WHERE question_id = ? ORDER BY order_index ASC",
            [question.id],
          )
          question.choices = choices
        }
      }

      group.questions = questions
    }

    return NextResponse.json({
      survey: {
        ...survey,
        groups,
      },
    })
  } catch (error) {
    console.error("Survey fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch survey" },
      { status: 500 },
    )
  }
}

export async function PUT(
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
      "SELECT id, start_date FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const bodySchema = z.object({
      name: z.string().min(1).max(255).optional(),
      start_date: z.string().datetime().optional(),
      end_date: z.string().datetime().optional(),
      anonymous_responses: z.boolean().optional(),
      allow_edits: z.boolean().optional(),
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

    if (updates.name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(updates.name)
    }
    if (updates.start_date !== undefined) {
      updateFields.push("start_date = ?")
      updateValues.push(updates.start_date)
    }
    if (updates.end_date !== undefined) {
      updateFields.push("end_date = ?")
      updateValues.push(updates.end_date)
    }
    if (updates.anonymous_responses !== undefined) {
      updateFields.push("anonymous_responses = ?")
      updateValues.push(updates.anonymous_responses ? 1 : 0)
    }
    if (updates.allow_edits !== undefined) {
      updateFields.push("allow_edits = ?")
      updateValues.push(updates.allow_edits ? 1 : 0)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      )
    }

    updateValues.push(publicId)

    await query(
      `UPDATE pfq_surveys SET ${updateFields.join(", ")} WHERE public_id = ?`,
      updateValues,
    )

    const updatedSurvey = await queryOne(
      "SELECT id, public_id, name, start_date, end_date, anonymous_responses, allow_edits, created_by, created_at, updated_at FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )

    return NextResponse.json({ survey: updatedSurvey })
  } catch (error) {
    console.error("Survey update error:", error)
    return NextResponse.json(
      { error: "Failed to update survey" },
      { status: 500 },
    )
  }
}

export async function DELETE(
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

    await query("DELETE FROM pfq_surveys WHERE public_id = ?", [publicId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Survey delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete survey" },
      { status: 500 },
    )
  }
}

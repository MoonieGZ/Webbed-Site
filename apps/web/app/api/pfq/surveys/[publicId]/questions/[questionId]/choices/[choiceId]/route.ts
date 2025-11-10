import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { z } from "zod"

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ publicId: string; questionId: string; choiceId: string }>
  },
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

    const { publicId, questionId, choiceId } = await params

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const choice = (await queryOne(
      "SELECT id FROM pfq_survey_answer_choices WHERE id = ? AND question_id = ? LIMIT 1",
      [choiceId, questionId],
    )) as any

    if (!choice) {
      return NextResponse.json(
        { error: "Answer choice not found" },
        { status: 404 },
      )
    }

    const bodySchema = z.object({
      choice_text: z.string().min(1).max(255).optional(),
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

    if (updates.choice_text !== undefined) {
      updateFields.push("choice_text = ?")
      updateValues.push(updates.choice_text)
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

    updateValues.push(choiceId)

    await query(
      `UPDATE pfq_survey_answer_choices SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    )

    const updatedChoice = await queryOne(
      "SELECT id, question_id, choice_text, order_index, created_at FROM pfq_survey_answer_choices WHERE id = ? LIMIT 1",
      [choiceId],
    )

    return NextResponse.json({ choice: updatedChoice })
  } catch (error) {
    console.error("Answer choice update error:", error)
    return NextResponse.json(
      { error: "Failed to update answer choice" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ publicId: string; questionId: string; choiceId: string }>
  },
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

    const { publicId, questionId, choiceId } = await params

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    await query(
      "DELETE FROM pfq_survey_answer_choices WHERE id = ? AND question_id = ?",
      [choiceId, questionId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Answer choice delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete answer choice" },
      { status: 500 },
    )
  }
}

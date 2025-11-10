import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { z } from "zod"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; groupId: string }> },
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

    const { publicId, groupId } = await params

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const group = (await queryOne(
      "SELECT id FROM pfq_survey_question_groups WHERE id = ? AND survey_id = ? LIMIT 1",
      [groupId, survey.id],
    )) as any

    if (!group) {
      return NextResponse.json(
        { error: "Question group not found" },
        { status: 404 },
      )
    }

    const bodySchema = z.object({
      name: z.string().min(1).max(255).optional(),
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

    if (updates.name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(updates.name)
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

    updateValues.push(groupId)

    await query(
      `UPDATE pfq_survey_question_groups SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    )

    const updatedGroup = await queryOne(
      "SELECT id, survey_id, name, order_index, created_at FROM pfq_survey_question_groups WHERE id = ? LIMIT 1",
      [groupId],
    )

    return NextResponse.json({ group: updatedGroup })
  } catch (error) {
    console.error("Question group update error:", error)
    return NextResponse.json(
      { error: "Failed to update question group" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; groupId: string }> },
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

    const { publicId, groupId } = await params

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    await query(
      "DELETE FROM pfq_survey_question_groups WHERE id = ? AND survey_id = ?",
      [groupId, survey.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Question group delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete question group" },
      { status: 500 },
    )
  }
}

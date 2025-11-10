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
      name: z.string().min(1).max(255),
      order_index: z.number().int().min(0),
    })

    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }

    const { name, order_index } = parseResult.data

    const result = (await query(
      "INSERT INTO pfq_survey_question_groups (survey_id, name, order_index) VALUES (?, ?, ?)",
      [survey.id, name, order_index],
    )) as any

    const group = await queryOne(
      "SELECT id, survey_id, name, order_index, created_at FROM pfq_survey_question_groups WHERE id = ? LIMIT 1",
      [result.insertId],
    )

    return NextResponse.json({ group })
  } catch (error) {
    console.error("Question group creation error:", error)
    return NextResponse.json(
      { error: "Failed to create question group" },
      { status: 500 },
    )
  }
}

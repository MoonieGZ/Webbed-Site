import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { generateSurveyPublicId } from "@/lib/survey-utils"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isStaff = await isStaffUser(sessionToken)

    if (!isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const surveys = await query(
      "SELECT id, public_id, name, start_date, end_date, anonymous_responses, allow_edits, created_by, created_at, updated_at FROM pfq_surveys ORDER BY created_at DESC",
    )

    return NextResponse.json({ surveys })
  } catch (error) {
    console.error("Survey list error:", error)
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
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

    const bodySchema = z.object({
      name: z.string().min(1).max(255),
      start_date: z.string().datetime(),
      end_date: z.string().datetime(),
      anonymous_responses: z.boolean(),
      allow_edits: z.boolean(),
    })

    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }

    const { name, start_date, end_date, anonymous_responses, allow_edits } =
      parseResult.data

    const public_id = await generateSurveyPublicId()

    const result = await query(
      "INSERT INTO pfq_surveys (public_id, name, start_date, end_date, anonymous_responses, allow_edits, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [public_id, name, start_date, end_date, anonymous_responses ? 1 : 0, allow_edits ? 1 : 0, user.id],
    ) as any

    const survey = await queryOne(
      "SELECT id, public_id, name, start_date, end_date, anonymous_responses, allow_edits, created_by, created_at, updated_at FROM pfq_surveys WHERE id = ? LIMIT 1",
      [result.insertId],
    )

    return NextResponse.json({ survey })
  } catch (error) {
    console.error("Survey creation error:", error)
    return NextResponse.json(
      { error: "Failed to create survey" },
      { status: 500 },
    )
  }
}


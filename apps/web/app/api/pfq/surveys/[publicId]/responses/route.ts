import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { PFQApiService } from "@/services/pfq-api"
import { z } from "zod"
import crypto from "crypto"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  try {
    const { publicId } = await params
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("api_key") // Optional API key for unauthenticated users

    const survey = (await queryOne(
      "SELECT id FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    // Try to get user from session (optional)
    const sessionToken = request.cookies.get("session")?.value
    let userId: number | null = null

    if (sessionToken) {
      const user = await getUserBySession(sessionToken)
      if (user) {
        userId = user.id
      }
    }

    let response: any = null

    // Check by user_id first (for logged-in users)
    if (userId) {
      response = (await queryOne(
        "SELECT id, survey_id, user_id, api_key_validated, created_at, updated_at FROM pfq_survey_responses WHERE survey_id = ? AND user_id = ? LIMIT 1",
        [survey.id, userId],
      )) as any
    }

    // If no response found by user_id, check by API key hash (for unauthenticated users)
    if (!response && apiKey) {
      const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
      response = (await queryOne(
        "SELECT id, survey_id, user_id, api_key_validated, created_at, updated_at FROM pfq_survey_responses WHERE survey_id = ? AND api_key_hash = ? LIMIT 1",
        [survey.id, apiKeyHash],
      )) as any
    }

    if (!response) {
      return NextResponse.json({ response: null })
    }

    const answers = await query(
      "SELECT id, response_id, question_id, answer_value, created_at, updated_at FROM pfq_survey_answers WHERE response_id = ?",
      [response.id],
    )

    return NextResponse.json({
      response: {
        ...response,
        answers,
      },
    })
  } catch (error) {
    console.error("Response fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch response" },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  try {
    const { publicId } = await params

    const survey = (await queryOne(
      "SELECT id, start_date, end_date, allow_edits FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    // Check if survey is within timeframe
    const now = new Date()
    const startDate = new Date(survey.start_date)
    const endDate = new Date(survey.end_date)

    if (now < startDate) {
      return NextResponse.json(
        { error: "Survey has not started yet" },
        { status: 400 },
      )
    }

    if (now > endDate) {
      return NextResponse.json(
        { error: "Survey has ended" },
        { status: 400 },
      )
    }

    const bodySchema = z.object({
      api_key: z.string().min(1),
      answers: z.array(
        z.object({
          question_id: z.number().int().positive(),
          answer_value: z.string(),
        }),
      ),
    })

    const parseResult = bodySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      )
    }

    const { api_key, answers } = parseResult.data

    // Validate API key and get PFQ user info
    const validationResult = await PFQApiService.whoAmI(api_key)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error || "Invalid API key" },
        { status: 400 },
      )
    }

    // Get PFQ username from API response
    const pfqUsername = validationResult.data?.name || null

    // Hash API key for tracking (SHA-256)
    const apiKeyHash = crypto.createHash("sha256").update(api_key).digest("hex")

    // Try to get user from session (optional)
    const sessionToken = request.cookies.get("session")?.value
    let userId: number | null = null

    if (sessionToken) {
      const user = await getUserBySession(sessionToken)
      if (user) {
        userId = user.id
      }
    }

    // Check if user or API key already has a response
    let existingResponse: any = null
    if (userId) {
      // Check by user_id first (for logged-in users)
      existingResponse = await queryOne(
        "SELECT id FROM pfq_survey_responses WHERE survey_id = ? AND user_id = ? LIMIT 1",
        [survey.id, userId],
      ) as any
    } else {
      // Check by API key hash (for unauthenticated users)
      existingResponse = await queryOne(
        "SELECT id FROM pfq_survey_responses WHERE survey_id = ? AND api_key_hash = ? LIMIT 1",
        [survey.id, apiKeyHash],
      ) as any
    }

    if (existingResponse) {
      if (!survey.allow_edits) {
        return NextResponse.json(
          { error: "Survey does not allow editing responses" },
          { status: 400 },
        )
      }

      // Update existing response
      await query(
        "UPDATE pfq_survey_responses SET api_key_validated = 1, api_key_hash = ?, pfq_username = ?, updated_at = NOW() WHERE id = ?",
        [apiKeyHash, pfqUsername, existingResponse.id],
      )

      // Delete old answers
      await query(
        "DELETE FROM pfq_survey_answers WHERE response_id = ?",
        [existingResponse.id],
      )

      // Insert new answers
      for (const answer of answers) {
        await query(
          "INSERT INTO pfq_survey_answers (response_id, question_id, answer_value) VALUES (?, ?, ?)",
          [existingResponse.id, answer.question_id, answer.answer_value],
        )
      }

      const updatedResponse = await queryOne(
        "SELECT id, survey_id, user_id, api_key_validated, created_at, updated_at FROM pfq_survey_responses WHERE id = ? LIMIT 1",
        [existingResponse.id],
      )

      const responseAnswers = await query(
        "SELECT id, response_id, question_id, answer_value, created_at, updated_at FROM pfq_survey_answers WHERE response_id = ?",
        [existingResponse.id],
      )

      return NextResponse.json({
        response: {
          ...updatedResponse,
          answers: responseAnswers,
        },
      })
    } else {
      // Create new response
      const result = await query(
        "INSERT INTO pfq_survey_responses (survey_id, user_id, api_key_validated, api_key_hash, pfq_username) VALUES (?, ?, 1, ?, ?)",
        [survey.id, userId, apiKeyHash, pfqUsername],
      ) as any

      const responseId = result.insertId

      // Insert answers
      for (const answer of answers) {
        await query(
          "INSERT INTO pfq_survey_answers (response_id, question_id, answer_value) VALUES (?, ?, ?)",
          [responseId, answer.question_id, answer.answer_value],
        )
      }

      const newResponse = await queryOne(
        "SELECT id, survey_id, user_id, api_key_validated, created_at, updated_at FROM pfq_survey_responses WHERE id = ? LIMIT 1",
        [responseId],
      )

      const responseAnswers = await query(
        "SELECT id, response_id, question_id, answer_value, created_at, updated_at FROM pfq_survey_answers WHERE response_id = ?",
        [responseId],
      )

      return NextResponse.json({
        response: {
          ...newResponse,
          answers: responseAnswers,
        },
      })
    }
  } catch (error) {
    console.error("Response submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 },
    )
  }
}


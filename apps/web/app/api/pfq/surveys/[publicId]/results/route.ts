import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"

export async function GET(
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
    const { searchParams } = new URL(request.url)
    const view = searchParams.get("view") || "aggregated" // 'individual' or 'aggregated'

    const survey = (await queryOne(
      "SELECT id, anonymous_responses FROM pfq_surveys WHERE public_id = ? LIMIT 1",
      [publicId],
    )) as any

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    if (view === "individual") {
      // Get all responses with user info (if not anonymous) and PFQ username
      const responses = (await query(
        `SELECT r.id, r.survey_id, r.user_id, r.api_key_validated, r.pfq_username, r.created_at, r.updated_at,
         ${survey.anonymous_responses ? "NULL as user_name, NULL as user_email" : "u.name as user_name, u.email as user_email"}
         FROM pfq_survey_responses r
         ${survey.anonymous_responses ? "" : "LEFT JOIN users u ON r.user_id = u.id"}
         WHERE r.survey_id = ?
         ORDER BY r.created_at DESC`,
        [survey.id],
      )) as any[]

      const results = []

      for (const response of responses) {
        const answers = (await query(
          `SELECT a.id, a.response_id, a.question_id, a.answer_value, a.created_at, a.updated_at,
           q.question_text, q.question_type
           FROM pfq_survey_answers a
           JOIN pfq_survey_questions q ON a.question_id = q.id
           WHERE a.response_id = ?
           ORDER BY q.order_index ASC`,
          [response.id],
        )) as any[]

        results.push({
          response: {
            id: response.id,
            survey_id: response.survey_id,
            user_id: survey.anonymous_responses ? null : response.user_id,
            api_key_validated: response.api_key_validated,
            pfq_username: survey.anonymous_responses
              ? null
              : response.pfq_username,
            created_at: response.created_at,
            updated_at: response.updated_at,
            user: survey.anonymous_responses
              ? null
              : response.user_id
                ? {
                    id: response.user_id,
                    name: response.user_name,
                    email: response.user_email,
                  }
                : null,
          },
          answers: answers.map((a: any) => ({
            id: a.id,
            response_id: a.response_id,
            question_id: a.question_id,
            answer_value: a.answer_value,
            created_at: a.created_at,
            updated_at: a.updated_at,
            question: {
              id: a.question_id,
              question_text: a.question_text,
              question_type: a.question_type,
            },
          })),
        })
      }

      return NextResponse.json({ results, view: "individual" })
    } else {
      // Aggregated view - get statistics for each question
      const questions = (await query(
        "SELECT id, question_text, question_type FROM pfq_survey_questions WHERE survey_id = ? ORDER BY order_index ASC",
        [survey.id],
      )) as any[]

      const aggregatedResults = []

      for (const question of questions) {
        const answers = (await query(
          "SELECT answer_value FROM pfq_survey_answers WHERE question_id = ?",
          [question.id],
        )) as any[]

        const totalResponses = answers.length

        if (totalResponses === 0) {
          aggregatedResults.push({
            question_id: question.id,
            question_text: question.question_text,
            question_type: question.question_type,
            total_responses: 0,
            data: [],
          })
          continue
        }

        // Count occurrences of each answer value
        const valueCounts: Record<string, number> = {}
        for (const answer of answers) {
          const value = answer.answer_value
          valueCounts[value] = (valueCounts[value] || 0) + 1
        }

        // Convert to array with percentages
        const data = Object.entries(valueCounts).map(([value, count]) => ({
          value,
          count,
          percentage: Math.round((count / totalResponses) * 100 * 100) / 100, // Round to 2 decimal places
        }))

        // Sort by count descending, then by value
        data.sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count
          }
          return a.value.localeCompare(b.value)
        })

        aggregatedResults.push({
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          total_responses: totalResponses,
          data,
        })
      }

      return NextResponse.json({
        results: aggregatedResults,
        view: "aggregated",
      })
    }
  } catch (error) {
    console.error("Survey results error:", error)
    return NextResponse.json(
      { error: "Failed to fetch survey results" },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import { isStaffUser } from "@/lib/survey-staff"
import { LIKERT_OPTIONS } from "@/lib/survey-constants"

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
           JOIN pfq_survey_question_groups g ON q.group_id = g.id
           WHERE a.response_id = ?
           ORDER BY g.order_index ASC, q.order_index ASC`,
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
        `SELECT q.id, q.question_text, q.question_type, q.allow_multiple, q.is_optional, q.group_id, q.order_index, g.order_index as group_order_index, g.name as group_name
         FROM pfq_survey_questions q
         JOIN pfq_survey_question_groups g ON q.group_id = g.id
         WHERE q.survey_id = ?
         ORDER BY g.order_index ASC, g.id ASC, q.order_index ASC`,
        [survey.id],
      )) as any[]

      const aggregatedResults = []

      for (const question of questions) {
        const answers = (await query(
          "SELECT answer_value FROM pfq_survey_answers WHERE question_id = ?",
          [question.id],
        )) as any[]

        const totalResponses = answers.length
        const allowMultiple = question.allow_multiple === 1
        const isOptional = question.is_optional === 1

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

        let data: { value: string; count: number; percentage: number }[] = []

        // Handle multiple choice questions differently
        if (question.question_type === "choice" && allowMultiple) {
          // Fetch all available choices for this question
          const choices = (await query(
            "SELECT id, choice_text, order_index FROM pfq_survey_answer_choices WHERE question_id = ? ORDER BY order_index ASC",
            [question.id],
          )) as any[]

          // Create a map of choice text to count
          const choiceCounts: Record<string, number> = {}
          
          // Initialize all choices with 0
          for (const choice of choices) {
            choiceCounts[choice.choice_text] = 0
          }

          // Parse JSON arrays and count individual choices
          for (const answer of answers) {
            try {
              const parsed = JSON.parse(answer.answer_value)
              if (Array.isArray(parsed)) {
                for (const choice of parsed) {
                  if (typeof choice === "string" && choiceCounts.hasOwnProperty(choice)) {
                    choiceCounts[choice] = (choiceCounts[choice] || 0) + 1
                  }
                }
              }
            } catch {
              // If parsing fails, treat as a single string value
              const value = answer.answer_value
              if (choiceCounts.hasOwnProperty(value)) {
                choiceCounts[value] = (choiceCounts[value] || 0) + 1
              }
            }
          }

          // Convert to array with percentages, sorted by order_index
          data = choices.map((choice) => {
            const count = choiceCounts[choice.choice_text] || 0
            return {
              value: choice.choice_text,
              count,
              percentage: Math.round((count / totalResponses) * 100 * 100) / 100,
            }
          })
        } else if (question.question_type === "likert") {
          // Handle Likert scale questions with fixed order
          const valueCounts: Record<string, number> = {}
          for (const answer of answers) {
            const value = answer.answer_value
            valueCounts[value] = (valueCounts[value] || 0) + 1
          }

          // Create ordered list: LIKERT_OPTIONS + N/A (if optional)
          const orderedOptions: string[] = [...LIKERT_OPTIONS]
          if (isOptional) {
            orderedOptions.push("N/A")
          }

          // Build data array in fixed order
          data = orderedOptions.map((option) => {
            const count = valueCounts[option] || 0
            return {
              value: option,
              count,
              percentage: Math.round((count / totalResponses) * 100 * 100) / 100,
            }
          })
        } else {
          // Handle all other question types (text, number, range, single choice)
          const valueCounts: Record<string, number> = {}
          for (const answer of answers) {
            const value = answer.answer_value
            valueCounts[value] = (valueCounts[value] || 0) + 1
          }

          // Convert to array with percentages
          data = Object.entries(valueCounts).map(([value, count]) => ({
            value,
            count,
            percentage: Math.round((count / totalResponses) * 100 * 100) / 100,
          }))

          // Sort by count descending, then by value
          data.sort((a, b) => {
            if (b.count !== a.count) {
              return b.count - a.count
            }
            return a.value.localeCompare(b.value)
          })
        }

        aggregatedResults.push({
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          total_responses: totalResponses,
          group_id: question.group_id,
          group_name: question.group_name,
          group_order_index: question.group_order_index,
          order_index: question.order_index,
          data,
        })
      }

      // Ensure results are sorted by group order, then group id (for tiebreaker), then question order
      aggregatedResults.sort((a, b) => {
        if (a.group_order_index !== b.group_order_index) {
          return a.group_order_index - b.group_order_index
        }
        // When group order_index is the same, use group_id as tiebreaker
        if (a.group_id !== b.group_id) {
          return a.group_id - b.group_id
        }
        return a.order_index - b.order_index
      })

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

export type SurveyQuestionType =
  | "range_5"
  | "range_10"
  | "likert"
  | "text"
  | "choice"

export interface Survey {
  id: number
  public_id: string
  name: string
  start_date: string
  end_date: string
  anonymous_responses: boolean
  allow_edits: boolean
  created_by: number
  created_at: string
  updated_at: string
}

export interface QuestionGroup {
  id: number
  survey_id: number
  name: string
  order_index: number
  created_at: string
}

export interface Question {
  id: number
  group_id: number
  survey_id: number
  question_text: string
  question_type: SurveyQuestionType
  allow_multiple?: boolean // For choice questions: true = checkboxes, false = radio buttons
  order_index: number
  created_at: string
  choices?: AnswerChoice[]
}

export interface AnswerChoice {
  id: number
  question_id: number
  choice_text: string
  order_index: number
  created_at: string
}

export interface SurveyResponse {
  id: number
  survey_id: number
  user_id: number | null
  api_key_validated: boolean
  pfq_username?: string | null
  created_at: string
  updated_at: string
}

export interface SurveyAnswer {
  id: number
  response_id: number
  question_id: number
  answer_value: string
  created_at: string
  updated_at: string
}

export interface SurveyWithDetails extends Survey {
  groups: (QuestionGroup & {
    questions: Question[]
  })[]
}

export interface UserResponse {
  response: SurveyResponse
  answers: SurveyAnswer[]
}

export interface SurveyResultsIndividual {
  response: SurveyResponse & {
    user?: {
      id: number
      name: string | null
      email: string
    } | null
  }
  answers: (SurveyAnswer & {
    question: Question
  })[]
}

export interface SurveyResultsAggregated {
  question_id: number
  question_text: string
  question_type: SurveyQuestionType
  total_responses: number
  data: {
    value: string
    count: number
    percentage: number
  }[]
}

export interface CreateSurveyRequest {
  name: string
  start_date: string
  end_date: string
  anonymous_responses: boolean
  allow_edits: boolean
}

export interface UpdateSurveyRequest {
  name?: string
  start_date?: string
  end_date?: string
  anonymous_responses?: boolean
  allow_edits?: boolean
}

export interface CreateQuestionGroupRequest {
  name: string
  order_index: number
}

export interface UpdateQuestionGroupRequest {
  name?: string
  order_index?: number
}

export interface CreateQuestionRequest {
  group_id: number
  question_text: string
  question_type: SurveyQuestionType
  allow_multiple?: boolean // For choice questions: true = checkboxes, false = radio buttons
  order_index: number
  choices?: CreateAnswerChoiceRequest[]
}

export interface UpdateQuestionRequest {
  group_id?: number
  question_text?: string
  question_type?: SurveyQuestionType
  allow_multiple?: boolean // For choice questions: true = checkboxes, false = radio buttons
  order_index?: number
}

export interface CreateAnswerChoiceRequest {
  choice_text: string
  order_index: number
}

export interface UpdateAnswerChoiceRequest {
  choice_text?: string
  order_index?: number
}

export interface SubmitResponseRequest {
  api_key: string
  answers: {
    question_id: number
    answer_value: string
  }[]
}

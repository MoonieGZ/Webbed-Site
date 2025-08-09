export interface SessionUser {
  id: number
  email: string
}

export interface UserSession {
  id: number
  user_id: number
  token: string
  created_at: Date
  expires_at: Date
}

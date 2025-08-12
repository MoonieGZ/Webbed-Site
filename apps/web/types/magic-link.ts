export interface MagicLink {
  id: number
  token: string
  email: string
  user_id: number | null
  expires_at: Date
  used: boolean
  created_at: Date
}

export interface User {
  id: number
  email: string
  name: string | null
  created_at: Date
  updated_at: Date
}

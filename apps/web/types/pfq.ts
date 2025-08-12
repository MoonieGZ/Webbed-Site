export interface PFQUser {
  name: string
  displayname: string
  isStaff: boolean
  shortlink: string
  avatar: string
}

export interface PFQApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PFQApiKeyInfo {
  hasApiKey: boolean
  created_at?: string
  last_validated?: string
  pfqUser?: PFQUser | null
}

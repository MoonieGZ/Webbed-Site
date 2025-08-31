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

export interface PFQMarketboardTrendItem {
  day: string
  sales_count: number
  total_quantity: number
  min_price: number
  max_price: number
  avg_price: number
}

export type PFQMarketboardTrend = PFQMarketboardTrendItem[]

export interface PFQMarketboardListingItem {
  id: number
  userId: number
  quantity: number
  price: number
  created_at: string
}

export type PFQMarketboardListing = PFQMarketboardListingItem[]

export interface PFQMarketboardSummaryItem {
  lowest_price: number
  highest_price: number
  total_quantity: number
  listings_count: number
}

export type PFQMarketboardSummary = PFQMarketboardSummaryItem[]

export interface PFQMarketboardSearchItem {
  id: number
  name: string
  category: string
  sprite: string
}

export type PFQMarketboardSearch = PFQMarketboardSearchItem[]

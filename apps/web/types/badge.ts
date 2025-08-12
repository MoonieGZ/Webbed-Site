export interface Badge {
  id: number
  name: string
  description: string
  icon_url: string
  earned_at: string
}

export interface BadgesResponse {
  ownedBadges: Badge[]
  featuredSlots: FeaturedSlots
}

export type FeaturedSlots = [number | null, number | null, number | null]

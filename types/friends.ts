export interface FriendUserSummary {
  id: number
  name: string
  title: string | null
  avatar: string | null
}

export interface FriendBadge {
  id: number
  name: string
  icon_url: string | null
}

export interface FriendListItem extends FriendUserSummary {
  badges: FriendBadge[]
}

export type FriendRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "blocked"

export interface FriendRequestItem {
  id: number
  requester_id: number
  addressee_id: number
  status: FriendRequestStatus
  created_at: string
  updated_at: string | null
  user: FriendUserSummary
  type?: "accepted" | "received" | "sent" | "blocked"
}

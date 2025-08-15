export type GiLobbyPrivacy = "closed" | "friends" | "invite-only"

export interface GiLobbyState {
  lobbyId: string
  hostId: string | null
  members: string[]
  currentRoll?: {
    characters?: string[]
    boss?: string | null
    bosses?: string[]
  }
  privacy: GiLobbyPrivacy
}

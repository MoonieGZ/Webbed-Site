export type GameType = "gi" | "hsr" | "zzz" | "ww"

export interface GameUID {
  game: GameType
  uid: string
  created_at: string
  updated_at: string
}

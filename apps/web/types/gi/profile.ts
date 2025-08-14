export interface GiCharacterProfile {
  profileIndex: number
  name: string | null
  enabledMap: Record<string, boolean>
}

export interface GiBossProfile {
  profileIndex: number
  name: string | null
  enabledMap: Record<string, boolean>
}

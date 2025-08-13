export interface GiRandomizerSettings {
  characters: {
    count: number
    enabled: Record<string, boolean>
    excluded: string[]
  }
  bosses: {
    count: number
    enabled: Record<string, boolean>
  }
  enableExclusion: boolean
  rules: {
    coopMode: boolean
    limitFiveStars: boolean
    maxFiveStars: number
  }
}

export const DEFAULT_GI_SETTINGS: GiRandomizerSettings = {
  characters: { count: 4, enabled: {}, excluded: [] },
  bosses: { count: 8, enabled: {} },
  enableExclusion: true,
  rules: { coopMode: false, limitFiveStars: false, maxFiveStars: 2 },
}

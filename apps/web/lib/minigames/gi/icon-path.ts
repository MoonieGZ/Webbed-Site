export function toIconFileFromName(name: string): string {
  return `${name.replace(/\s+/g, "_")}_Icon.webp`
}

export function buildCharacterIconPath(name: string, element: string): string {
  if (name.startsWith("Traveler ")) {
    return `/minigames/gi/characters/Traveler_Icon.webp`
  }

  return `/minigames/gi/characters/${element}/${toIconFileFromName(name)}`
}

export function buildBossIconPath(name: string, location: string): string {
  return `/minigames/gi/bosses/${location}/${toIconFileFromName(name)}`
}

export function buildElementIconPath(element: string): string {
  return `/minigames/gi/elements/${element}.webp`
}

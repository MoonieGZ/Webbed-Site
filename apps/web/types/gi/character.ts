export type GiElement =
  | "Anemo"
  | "Geo"
  | "Electro"
  | "Dendro"
  | "Hydro"
  | "Pyro"
  | "Cryo"

export interface GiCharacter {
  name: string
  element: GiElement
  fiveStar: boolean
}

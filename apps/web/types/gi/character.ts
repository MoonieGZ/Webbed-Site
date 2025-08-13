export type GiElement =
  | "Anemo"
  | "Geo"
  | "Electro"
  | "Dendro"
  | "Hydro"
  | "Pyro"
  | "Cryo"

export type GiRegion =
  | "Mondstadt"
  | "Liyue"
  | "Inazuma"
  | "Sumeru"
  | "Fontaine"
  | "Natlan"
  | "Snezhnaya"
  | "Nod-Krai"
  | "Other"

export type GiWeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst"

export interface GiCharacter {
  name: string
  element: GiElement
  fiveStar: boolean
  origin: GiRegion
  weaponType: GiWeaponType
}

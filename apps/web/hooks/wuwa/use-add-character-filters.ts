"use client"

import { useMemo, useState } from "react"

export type ElementType =
  | "Aero"
  | "Glacio"
  | "Havoc"
  | "Fusion"
  | "Spectro"
  | "Electro"
  | "Unknown"

export type WeaponType =
  | "Pistols"
  | "Sword"
  | "Broadblade"
  | "Rectifier"
  | "Gauntlets"
  | "Unknown"

export function useAddCharacterFilters() {
  const [elementFilter, setElementFilter] = useState<ElementType | "">("")
  const [weaponFilter, setWeaponFilter] = useState<WeaponType | "">("")

  const elementOptions: ElementType[] = useMemo(
    () => [
      "Aero",
      "Glacio",
      "Havoc",
      "Fusion",
      "Spectro",
      "Electro",
      "Unknown",
    ],
    [],
  )

  const weaponOptions: WeaponType[] = useMemo(
    () => [
      "Pistols",
      "Sword",
      "Broadblade",
      "Rectifier",
      "Gauntlets",
      "Unknown",
    ],
    [],
  )

  const clearFilters = () => {
    setElementFilter("")
    setWeaponFilter("")
  }

  return {
    elementFilter,
    setElementFilter,
    weaponFilter,
    setWeaponFilter,
    elementOptions,
    weaponOptions,
    clearFilters,
  }
}

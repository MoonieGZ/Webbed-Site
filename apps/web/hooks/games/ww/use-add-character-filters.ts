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
  const [elementFilters, setElementFilters] = useState<ElementType[]>([])
  const [weaponFilters, setWeaponFilters] = useState<WeaponType[]>([])

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
    setElementFilters([])
    setWeaponFilters([])
  }

  return {
    elementFilters,
    setElementFilters,
    weaponFilters,
    setWeaponFilters,
    elementOptions,
    weaponOptions,
    clearFilters,
  }
}

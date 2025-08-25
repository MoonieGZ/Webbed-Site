export const getGlow = (rarity?: number) => {
  if (rarity === 1)
    return { base: "#81e6be", light: "#c7f3e1", line: "#81e6be" }
  if (rarity === 2)
    return { base: "#8fd6fa", light: "#c9ebfd", line: "#8fd6fa" }
  if (rarity === 3)
    return { base: "#d0a2fd", light: "#e6cffd", line: "#d0a2fd" }
  if (rarity === 4)
    return { base: "#f9d852", light: "#fdeea6", line: "#f9d852" }
  return { base: "#a1a1aa", light: "#d4d4d8", line: "#a1a1aa" }
}

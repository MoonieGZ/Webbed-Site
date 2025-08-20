export function getCharacterIconUrl(element: string, filenameOrName: string): string {
	if (filenameOrName.startsWith("Rover (")) {
		filenameOrName = "Rover";
	}
	const filename = filenameOrName.endsWith(".png")
		? filenameOrName
		: `Resonator_${filenameOrName.replaceAll(" ", "_")}.png`
	return `/games/ww/characters/${element}/${filename}`
}

export function getElementIconUrl(element: string): string {
	return `/games/ww/elements/${element}.webp`
}

export function getWeaponIconUrl(type: string, filenameOrName: string): string {
	const filename = filenameOrName.endsWith(".png")
		? filenameOrName
		: `Weapon_${filenameOrName.replaceAll(" ", "_").replaceAll("'", "").replaceAll(":", "").replaceAll("#", "")}.png`
	return `/games/ww/weapons/${type}/${filename}`
}

export function getMaterialIconUrl(type: string, filenameOrName: string): string {
	const filename = filenameOrName.endsWith(".png")
		? filenameOrName
		: `Item_${filenameOrName.replaceAll(" ", "_")}.png`
	return `/games/ww/materials/${type}/${filename}`
}
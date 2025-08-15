'use strict'

// Utility: Fisher-Yates shuffle
function shuffleArray(arr) {
	const a = Array.isArray(arr) ? [...arr] : []
	for (let i = a.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1))
		const tmp = a[i]
		a[i] = a[j]
		a[j] = tmp
	}
	return a
}

function selectRandomCharacters(characters, settings) {
	if (!Array.isArray(characters)) return null
	if (!settings || !settings.characters || !settings.rules) return null

	const enabled = characters.filter((c) => {
		const enabledFlag = Boolean(
			(settings.characters.enabled && settings.characters.enabled[c.name]) ?? true,
		)
		const excluded = Boolean(
			settings.enableExclusion &&
			Array.isArray(settings.characters.excluded) &&
			settings.characters.excluded.includes(c.name),
		)
		return enabledFlag && !excluded
	})

	if (enabled.length < settings.characters.count) return null

	const travelers = enabled.filter((c) => typeof c.name === 'string' && c.name.startsWith('Traveler ('))
	const nonTravelers = enabled.filter((c) => !(typeof c.name === 'string' && c.name.startsWith('Traveler (')))
	const pool = [...nonTravelers]
	if (!settings.rules.coopMode && travelers.length > 0) {
		pool.push(travelers[Math.floor(Math.random() * travelers.length)])
	}

	let selected = []
	if (settings.rules.limitFiveStars) {
		const max5 = Number(settings.rules.maxFiveStars || 0)
		const fiveStars = pool.filter((c) => Boolean(c.fiveStar))
		const fourStars = pool.filter((c) => !Boolean(c.fiveStar))
		if (fiveStars.length < Math.min(max5, settings.characters.count)) return null
		if (
			fourStars.length <
			settings.characters.count - Math.min(max5, settings.characters.count)
		)
			return null
		const pick5 = shuffleArray(fiveStars).slice(0, Math.min(max5, settings.characters.count))
		const pick4 = shuffleArray(fourStars).slice(
			0,
			settings.characters.count - pick5.length,
		)
		selected = shuffleArray([...pick5, ...pick4])
	} else {
		selected = shuffleArray(pool).slice(0, settings.characters.count)
	}

	return selected.map((c) => c.name)
}

function selectRandomBosses(bosses, settings) {
	if (!Array.isArray(bosses)) return null
	if (!settings || !settings.bosses || !settings.rules) return null

	const enabled = bosses.filter(
		(b) => Boolean((settings.bosses.enabled && settings.bosses.enabled[b.name]) ?? true),
	)
	const filtered = settings.rules.coopMode ? enabled.filter((b) => Boolean(b.coop)) : enabled
	if (filtered.length < settings.bosses.count) return null
	return shuffleArray(filtered)
		.slice(0, settings.bosses.count)
		.map((b) => b.name)
}

module.exports = {
	selectRandomCharacters,
	selectRandomBosses,
}



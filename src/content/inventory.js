export const seedCarryLimit = 4

export function seedCarryState(inventory = [], selectedIndex = 0, limit = seedCarryLimit) {
  const carried = inventory.slice(0, limit)
  const reserve = inventory.slice(limit)
  const selectedCarryIndex = carried.length ? Math.min(Math.max(selectedIndex, 0), carried.length - 1) : 0

  return {
    carried,
    limit,
    reserve,
    reserveCount: reserve.length,
    selectedCarryIndex,
    selectedSeed: carried[selectedCarryIndex] ?? inventory[0],
    totalCount: inventory.length,
  }
}

export function seedCarryText(inventory = [], selectedIndex = 0, limit = seedCarryLimit) {
  const carry = seedCarryState(inventory, selectedIndex, limit)
  const carriedNames = carry.carried.map((seed, index) => `${index + 1}. ${seed.name}`).join('; ') || 'none'
  const selectedText = carry.selectedSeed ? `Selected seed: ${carry.selectedSeed.name}.` : 'Selected seed: none.'
  const reserveText = carry.reserveCount
    ? `${carry.reserveCount} seed voice(s) held in the library reserve.`
    : 'No seed voices in reserve.'

  return `${selectedText} Seed carry limit: ${carry.carried.length} of ${carry.limit} carried. Carried: ${carriedNames}. ${reserveText}`
}

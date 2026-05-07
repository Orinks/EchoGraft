export function chamberSubstrate(chamber = {}) {
  const system = chamber.system?.toLowerCase() ?? ''
  if (system.includes('water')) return 'wet root channel'
  if (system.includes('canopy')) return 'photosynthetic lattice'
  if (system.includes('glass')) return 'reflective glass loam'
  if (system.includes('memory')) return 'archive loam'
  if (system.includes('heart')) return 'resonant heartsoil'
  if (system.includes('root') || system.includes('mycel')) return 'mycelial rootbed'
  return 'breathable intake soil'
}

export function plantingAssessment(seed, position, chamber = {}, plantedSeeds = []) {
  const target = chamber.target ?? { x: 0, y: 0 }
  const distance = Math.hypot(target.x - position.x, target.y - position.y)
  const tolerance = chamber.tolerances?.position ?? 1
  const substrate = chamberSubstrate(chamber)
  const nearbyInteractions = plantedSeeds.filter((planted) => {
    const other = planted.position ?? { x: 0, y: 0 }
    return Math.hypot(other.x - position.x, other.y - position.y) <= 2
  })
  const meaningful = distance <= tolerance

  return {
    distance,
    meaningful,
    nearbyInteractions: nearbyInteractions.map((item) => item.name),
    position,
    seedFamily: seed.family,
    substrate,
    text: meaningful
      ? `Meaningful position: within ${distance.toFixed(1)} steps of the chamber heart, inside the ${tolerance} step restoration tolerance. Substrate ${substrate}. Nearby seed interactions: ${nearbyInteractions.length ? nearbyInteractions.map((item) => item.name).join(', ') : 'none'}.`
      : `Meaningful position: ${distance.toFixed(1)} steps from the chamber heart; move closer than ${tolerance} steps for stronger resonance. Substrate ${substrate}. Nearby seed interactions: ${nearbyInteractions.length ? nearbyInteractions.map((item) => item.name).join(', ') : 'none'}.`,
  }
}

export function plantedSeed(seed, position, chamber = {}, plantedSeeds = []) {
  const assessment = plantingAssessment(seed, position, chamber, plantedSeeds)
  return {
    assessment,
    seed: {
      ...seed,
      chamberSubstrate: assessment.substrate,
      position: { x: position.x, y: position.y },
    },
  }
}

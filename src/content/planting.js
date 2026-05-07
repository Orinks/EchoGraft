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

export function plantingPositions(chamber = {}) {
  const target = chamber.target ?? { x: 0, y: 0 }
  const offsets = chamber.plantingPattern?.offsets ?? []
  if (!offsets.length) return [{ x: target.x, y: target.y, label: 'chamber heart' }]
  return offsets.map((offset, index) => ({
    x: target.x + offset.x,
    y: target.y + offset.y,
    label: `${chamber.plantingPattern.name ?? 'planting pattern'} ${index + 1}`,
  }))
}

export function plantingCoverage(chamber = {}, plantedSeeds = []) {
  const slots = plantingPositions(chamber)
  const tolerance = chamber.tolerances?.position ?? 1
  const availableSeeds = plantedSeeds.map((seed, index) => ({ seed, index }))
  const covered = slots.map((slot) => {
    let best
    for (const candidate of availableSeeds) {
      const position = candidate.seed.position ?? { x: 0, y: 0 }
      const distance = Math.hypot(slot.x - position.x, slot.y - position.y)
      if (!best || distance < best.distance) best = { ...candidate, distance }
    }

    if (!best || best.distance > tolerance) return { slot, covered: false, distance: best?.distance ?? Infinity }
    availableSeeds.splice(availableSeeds.findIndex((candidate) => candidate.index === best.index), 1)
    return { slot, covered: true, distance: best.distance, seed: best.seed.name }
  })

  return {
    complete: covered.every((item) => item.covered),
    covered,
    coveredCount: covered.filter((item) => item.covered).length,
    requiredCount: slots.length,
  }
}

export function growthTiming(seed = {}, chamber = {}) {
  const profiles = {
    breathing: { pulses: 4, feel: 'expands and rests between pulses' },
    climbing: { pulses: 5, feel: 'steps upward through the chamber over several pulses' },
    steady: { pulses: 3, feel: 'settles evenly before joining resonance' },
    twining: { pulses: 6, feel: 'braids with nearby planted voices over a longer cycle' },
  }
  const behavior = profiles[seed.growthBehavior] ? seed.growthBehavior : 'steady'
  const profile = profiles[behavior] ?? profiles.steady
  const pulseRate = Math.max(Number(seed.pulseRate ?? chamber.target?.pulseRate ?? 1), 0.25)
  const seconds = Number(((profile.pulses / pulseRate) * 4).toFixed(1))

  return {
    behavior,
    pulses: profile.pulses,
    reflexPressure: false,
    seconds,
    text: `Growth timing: ${behavior} growth ${profile.feel}; listen for ${profile.pulses} pulse(s), about ${seconds} seconds. No reflex timing required.`,
  }
}

export function plantingAssessment(seed, position, chamber = {}, plantedSeeds = []) {
  const slots = plantingPositions(chamber)
  const nearestSlot = slots
    .map((slot, index) => ({ slot, index, distance: Math.hypot(slot.x - position.x, slot.y - position.y) }))
    .sort((a, b) => a.distance - b.distance)[0]
  const distance = nearestSlot.distance
  const tolerance = chamber.tolerances?.position ?? 1
  const substrate = chamberSubstrate(chamber)
  const nearbyInteractions = plantedSeeds.filter((planted) => {
    const other = planted.position ?? { x: 0, y: 0 }
    return Math.hypot(other.x - position.x, other.y - position.y) <= 2
  })
  const meaningful = distance <= tolerance
  const slotText = slots.length > 1
    ? ` Planting slot ${nearestSlot.index + 1} of ${slots.length}: ${nearestSlot.slot.label}.`
    : ''
  const timing = growthTiming(seed, chamber)

  return {
    distance,
    growthTiming: timing,
    meaningful,
    nearbyInteractions: nearbyInteractions.map((item) => item.name),
    position,
    seedFamily: seed.family,
    slot: nearestSlot.slot,
    slotIndex: nearestSlot.index,
    substrate,
    text: meaningful
      ? `Meaningful position: within ${distance.toFixed(1)} steps of a restoration planting point, inside the ${tolerance} step restoration tolerance.${slotText} Substrate ${substrate}. Nearby seed interactions: ${nearbyInteractions.length ? nearbyInteractions.map((item) => item.name).join(', ') : 'none'}. ${timing.text}`
      : `Meaningful position: ${distance.toFixed(1)} steps from the nearest restoration planting point; move closer than ${tolerance} steps for stronger resonance.${slotText} Substrate ${substrate}. Nearby seed interactions: ${nearbyInteractions.length ? nearbyInteractions.map((item) => item.name).join(', ') : 'none'}. ${timing.text}`,
  }
}

export function plantedSeed(seed, position, chamber = {}, plantedSeeds = []) {
  const assessment = plantingAssessment(seed, position, chamber, plantedSeeds)
  return {
    assessment,
    seed: {
      ...seed,
      chamberSubstrate: assessment.substrate,
      growthTiming: assessment.growthTiming,
      position: { x: position.x, y: position.y },
    },
  }
}

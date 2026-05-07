import { weatherWindowState } from './chambers.js'
import { plantingCoverage } from './planting.js'

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function phaseDistance(a, b) {
  const delta = Math.abs((((a - b) % 360) + 540) % 360 - 180)
  return delta
}

function averageSeeds(seeds) {
  const count = seeds.length || 1
  return seeds.reduce(
    (acc, seed) => ({
      pitchRatio: acc.pitchRatio + seed.pitchRatio / count,
      pulseRate: acc.pulseRate + seed.pulseRate / count,
      brightness: acc.brightness + seed.brightness / count,
      phase: acc.phase + seed.phase / count,
      position: {
        x: acc.position.x + seed.position.x / count,
        y: acc.position.y + seed.position.y / count,
      },
      grafted: acc.grafted || seed.grafted,
    }),
    { pitchRatio: 0, pulseRate: 0, brightness: 0, phase: 0, position: { x: 0, y: 0 }, grafted: false },
  )
}

export function photosynthesisState(chamber, plantedSeeds) {
  if (!chamber.photosynthesis) return undefined

  const ecology = averageSeeds(plantedSeeds)
  const threshold = chamber.photosynthesis.minBrightness
  const active = ecology.brightness >= threshold

  return {
    active,
    brightness: Number(ecology.brightness.toFixed(2)),
    threshold,
    text: active
      ? `Photosynthetic canopy active at brightness ${ecology.brightness.toFixed(2)}; ${chamber.photosynthesis.text}.`
      : `Photosynthetic canopy needs brightness ${threshold}; current brightness ${ecology.brightness.toFixed(2)}.`,
  }
}

export function thermalShutterState(chamber, plantedSeeds) {
  if (!chamber.thermalShutters) return undefined

  const ecology = averageSeeds(plantedSeeds)
  const { minBrightness, maxBrightness } = chamber.thermalShutters
  const open = ecology.brightness >= minBrightness && ecology.brightness <= maxBrightness
  const state = ecology.brightness < minBrightness ? 'too cool' : ecology.brightness > maxBrightness ? 'overheated' : 'open'

  return {
    brightness: Number(ecology.brightness.toFixed(2)),
    maxBrightness,
    minBrightness,
    open,
    state,
    text: open
      ? `Thermal shutters open at brightness ${ecology.brightness.toFixed(2)}; ${chamber.thermalShutters.text}.`
      : `Thermal shutters are ${state}; keep brightness between ${minBrightness} and ${maxBrightness}.`,
  }
}

export function pressureSailState(chamber, plantedSeeds) {
  if (!chamber.pressureSails) return undefined

  const ecology = averageSeeds(plantedSeeds)
  const { minPulseRate, maxPulseRate } = chamber.pressureSails
  const steady = ecology.pulseRate >= minPulseRate && ecology.pulseRate <= maxPulseRate
  const state = ecology.pulseRate < minPulseRate ? 'slack' : ecology.pulseRate > maxPulseRate ? 'straining' : 'steady'

  return {
    maxPulseRate,
    minPulseRate,
    pulseRate: Number(ecology.pulseRate.toFixed(2)),
    state,
    steady,
    text: steady
      ? `Pressure sails steady at pulse ${ecology.pulseRate.toFixed(2)}; ${chamber.pressureSails.text}.`
      : `Pressure sails are ${state}; keep pulse between ${minPulseRate} and ${maxPulseRate}.`,
  }
}

export function timbrePuzzleState(chamber, plantedSeeds) {
  if (!chamber.timbrePuzzle) return undefined

  const { minBrightness, waveforms } = chamber.timbrePuzzle
  const matchingSeed = plantedSeeds.find((seed) => seed.brightness >= minBrightness && waveforms.includes(seed.waveform))
  const brightest = plantedSeeds.reduce((best, seed) => seed.brightness > best.brightness ? seed : best, plantedSeeds[0])
  const waveformList = waveforms.join(' or ')

  return {
    active: Boolean(matchingSeed),
    brightness: Number((brightest?.brightness ?? 0).toFixed(2)),
    minBrightness,
    waveform: brightest?.waveform ?? 'none',
    waveforms,
    text: matchingSeed
      ? `Brightness/timbre puzzle open: ${matchingSeed.name} carries ${matchingSeed.waveform} at brightness ${matchingSeed.brightness}. ${chamber.timbrePuzzle.text}.`
      : `Brightness/timbre puzzle needs brightness ${minBrightness} with ${waveformList} timbre; strongest planted voice is ${brightest?.waveform ?? 'none'} at ${brightest?.brightness ?? 0}.`,
  }
}

export function evaluateResonance(chamber, plantedSeeds) {
  if (plantedSeeds.length < chamber.requiredSeeds) {
    return { solved: false, score: 0, missing: [`Plant ${chamber.requiredSeeds - plantedSeeds.length} more seed(s).`] }
  }

  const ecology = averageSeeds(plantedSeeds)
  const photosynthesis = photosynthesisState(chamber, plantedSeeds)
  const thermalShutters = thermalShutterState(chamber, plantedSeeds)
  const pressureSails = pressureSailState(chamber, plantedSeeds)
  const timbrePuzzle = timbrePuzzleState(chamber, plantedSeeds)
  const checks = [
    ['position', distance(ecology.position, chamber.target), chamber.tolerances.position, 'Move planted seed position closer to the heart.'],
    ['pitchRatio', Math.abs(ecology.pitchRatio - chamber.target.pitchRatio), chamber.tolerances.pitchRatio, 'Tune pitch ratio closer to the chamber heart.'],
    ['pulseRate', Math.abs(ecology.pulseRate - chamber.target.pulseRate), chamber.tolerances.pulseRate, 'Tune pulse rate closer to the chamber rhythm.'],
    ['brightness', Math.abs(ecology.brightness - chamber.target.brightness), chamber.tolerances.brightness, 'Tune filter brightness closer to the chamber timbre.'],
    ['phase', phaseDistance(ecology.phase, chamber.target.phase), chamber.tolerances.phase, 'Tune phase closer to the cancellation point.'],
  ]

  const missing = checks.filter(([, value, tolerance]) => value > tolerance).map(([, , , message]) => message)

  if (chamber.requiresGraft && !ecology.grafted) missing.push('Create and plant a grafted seed.')
  if (photosynthesis && !photosynthesis.active) missing.push('Raise brightness until the photosynthetic canopy opens.')
  if (thermalShutters && !thermalShutters.open) missing.push('Tune brightness until the thermal shutters open without overheating.')
  if (pressureSails && !pressureSails.steady) missing.push('Tune pulse until the pressure sails hold steady.')
  if (timbrePuzzle && !timbrePuzzle.active) missing.push('Use a bright edged timbre to open the brightness/timbre puzzle.')
  if (chamber.plantingPattern) {
    const coverage = plantingCoverage(chamber, plantedSeeds)
    if (!coverage.complete) {
      missing.push(`Cover ${coverage.requiredCount - coverage.coveredCount} more multi-position planting slot(s).`)
    }
  }
  for (const hazard of chamber.hazards ?? []) {
    if (plantedSeeds.some((seed) => Math.abs(seed.pitchRatio - hazard.pitchRatio) <= hazard.radius)) {
      missing.push(hazard.message)
    }
  }

  const score = checks.reduce((total, [, value, tolerance]) => total + Math.max(0, 1 - value / Math.max(tolerance, 0.01)), 0) / checks.length
  return {
    solved: missing.length === 0,
    score: Number(score.toFixed(2)),
    missing,
    ecology,
    photosynthesis,
    pressureSails,
    thermalShutters,
    timbrePuzzle,
    plantingCoverage: chamber.plantingPattern ? plantingCoverage(chamber, plantedSeeds) : undefined,
  }
}

export function unlockNext(chambers, solvedIds) {
  const solved = new Set(solvedIds)
  return availableChambers(chambers, solvedIds).map((chamber) => chamber.id)
}

export function availableChambers(chambers, solvedIds) {
  const solved = new Set(solvedIds)
  return chambers.filter((chamber, index) => {
    if (index === 0) return true
    if (chamber.requires?.length) return chamber.requires.every((id) => solved.has(id))
    return solved.has(chambers[index - 1].id)
  })
}

export function restorationPlanningSession(chambers, solvedIds, target = { min: 20, max: 40 }, arkClock = 0) {
  const solved = new Set(solvedIds)
  const ready = new Set(availableChambers(chambers, solvedIds).map((chamber) => chamber.id))
  const contracts = []
  let min = 0
  let max = 0

  for (const chamber of chambers) {
    if (solved.has(chamber.id)) continue
    const nextMin = min + chamber.solveTimeMinutes.min
    const nextMax = max + chamber.solveTimeMinutes.max
    if (contracts.length && min >= target.min && nextMax > target.max) break
    contracts.push({ ...chamber, ready: ready.has(chamber.id), weatherWindow: weatherWindowState(chamber, arkClock) })
    min = nextMin
    max = nextMax
    if (min >= target.min) break
  }

  return { contracts, min, max, target }
}

export function firstFullCampaignEstimate(scope) {
  const requiredContracts = scope.seasons.reduce((total, season) => total + season.requiredContracts, 0)
  const optionalContracts = scope.seasons.reduce((total, season) => total + season.optionalContracts, 0)
  return {
    ...scope.firstFullCampaignHours,
    seasons: scope.seasons.length,
    requiredContracts,
    optionalContracts,
    totalContracts: requiredContracts + optionalContracts,
  }
}

export function seedCollectionAppraisal(inventory, save, selectedSeed = inventory[0]) {
  const families = Array.from(new Set(inventory.map((seed) => seed.family ?? 'unknown')))
  const materials = Object.entries(save.materials ?? {}).filter(([, value]) => value > 0)
  return {
    gathered: inventory.length,
    identifiedFamilies: families,
    curatedSeed: selectedSeed?.name ?? 'No seed selected',
    playableVoices: inventory.map((seed) => seed.name),
    restorationUse: materials.length
      ? `Exchange ${materials.map(([key, value]) => `${value} ${key}`).join(', ')} for tuning and restoration work.`
      : 'Restore contracts to gather tuning exchange materials.',
    commerceBoundary: 'Exchange remains restoration support, not museum commerce.',
  }
}

export function dreamCompostSummary(save) {
  const count = save.materials?.dreamCompost ?? 0
  return {
    count,
    available: count > 0,
    text: count > 0
      ? `Dream compost ${count}: convert corrupted memory into safer graft experiments and ancestry research.`
      : 'Dream compost: none recovered yet; restore Dream Compost to unlock this research material.',
  }
}

export function pollinatorVaultSummary(save) {
  const count = save.materials?.glassPollen ?? 0
  return {
    count,
    available: count > 0,
    text: count > 0
      ? `Pollinator vault: ${count} glass pollen available for brightness and timbre trait work.`
      : 'Pollinator vault: sealed until the Memory Orchard vault contract yields glass pollen.',
  }
}

export function stewardshipSummary(chambers, save) {
  const restored = chambers.filter((chamber) => save.solvedChambers.includes(chamber.id))
  const lowRated = restored.filter((chamber) => ['Dormant', 'Restored'].includes(save.ratings[chamber.id] ?? 'Restored'))
  const availableMaterials = Object.entries(save.materials ?? {}).filter(([, value]) => value > 0)
  return {
    restoredCount: restored.length,
    totalCount: chambers.length,
    lowRatedTitles: lowRated.map((chamber) => chamber.title),
    materialSummary: availableMaterials.length ? availableMaterials.map(([key, value]) => `${key} ${value}`).join(', ') : 'no stewardship materials yet',
    nextAction: lowRated.length ? `Revisit ${lowRated[0].title} for a stronger restoration.` : 'Choose the next available work order.',
  }
}

export function optionalReturnContracts(chambers, save) {
  const solved = new Set(save.solvedChambers)
  return chambers
    .filter((chamber) => solved.has(chamber.id))
    .filter((chamber) => ['Dormant', 'Restored'].includes(save.ratings[chamber.id] ?? 'Restored'))
    .map((chamber) => ({
      ...chamber,
      optional: true,
      returnContract: true,
      currentRating: save.ratings[chamber.id] ?? 'Restored',
      targetRating: 'Stable',
      text: `Optional return contract: improve ${chamber.title} from ${save.ratings[chamber.id] ?? 'Restored'} toward Stable or Resonant by refining placement, tuning, graft stability, or hazard containment.`,
    }))
}

export function decisionSummary(chambers, solvedIds) {
  const available = availableChambers(chambers, solvedIds).filter((chamber) => !solvedIds.includes(chamber.id))
  const required = available.filter((chamber) => !chamber.optional)
  const optional = available.filter((chamber) => chamber.optional)
  return {
    requiredChoices: required.map((chamber) => chamber.title),
    optionalChoices: optional.map((chamber) => chamber.title),
    recommendation: required[0]?.title ?? optional[0]?.title ?? 'Review restored chambers or compose in the Conservatory.',
  }
}

export function restorationRating(result) {
  if (!result.solved) return 'Dormant'
  if (result.score >= 0.96) return 'Resonant'
  if (result.score >= 0.85) return 'Stable'
  return 'Restored'
}

export function mergeRewards(save, chamber, rating) {
  const rewards = chamber.rewards ?? {}
  const next = structuredClone(save)
  for (const [key, value] of Object.entries(rewards.materials ?? {})) {
    next.materials[key] = (next.materials[key] ?? 0) + value
  }
  for (const seedId of rewards.seeds ?? []) {
    if (!next.inventoryIds.includes(seedId)) next.inventoryIds.push(seedId)
  }
  for (const codexId of rewards.codex ?? []) {
    if (!next.codexIds.includes(codexId)) next.codexIds.push(codexId)
  }
  next.ratings[chamber.id] = rating
  return next
}

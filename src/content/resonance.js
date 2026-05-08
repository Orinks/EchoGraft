import { codexRecords, weatherWindowState } from './chambers.js'
import { plantingCoverage } from './planting.js'
import { graftDiscoveryCatalog, seedAudioPreview, seedFamilies } from './seeds.js'
import { createWorldLayoutIndex } from './world-layout.js'

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

export function droughtPocketState(chamber, plantedSeeds) {
  if (!chamber.droughtPockets) return undefined

  const ecology = averageSeeds(plantedSeeds)
  const { minStablePulseRate } = chamber.droughtPockets
  const drained = ecology.pulseRate < minStablePulseRate

  return {
    drained,
    minStablePulseRate,
    pulseRate: Number(ecology.pulseRate.toFixed(2)),
    stable: !drained,
    text: drained
      ? `Drought pockets draining pulse stability at ${ecology.pulseRate.toFixed(2)}; raise pulse to at least ${minStablePulseRate}.`
      : `Drought pockets contained at pulse ${ecology.pulseRate.toFixed(2)}; ${chamber.droughtPockets.text}.`,
  }
}

export function staticBloomState(chamber, plantedSeeds = []) {
  if (!chamber.staticBloom) return undefined

  const { minBrightness } = chamber.staticBloom
  const maskedSeeds = plantedSeeds
    .filter((seed) => Number.isFinite(seed.brightness) && seed.brightness < minBrightness)
    .map((seed) => ({
      brightness: Number(seed.brightness.toFixed(2)),
      id: seed.id,
      name: seed.name ?? seed.id ?? 'unknown seed',
      position: seed.position ?? { x: 0, y: 0 },
    }))

  return {
    clear: maskedSeeds.length === 0,
    masked: maskedSeeds.length > 0,
    maskedSeeds,
    minBrightness,
    text: maskedSeeds.length
      ? `Static bloom masks ${maskedSeeds.length} weak seed(s) below brightness ${minBrightness}: ${maskedSeeds.map((seed) => `${seed.name} at ${seed.brightness}`).join(', ')}.`
      : `Static bloom clear; all planted seeds meet brightness ${minBrightness}. ${chamber.staticBloom.text}.`,
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

export function resonanceAccuracySummary(resultOrScore = 0) {
  const rawScore = typeof resultOrScore === 'number' ? resultOrScore : resultOrScore.score ?? 0
  const score = Math.max(0, Math.min(1, rawScore))
  const percent = Math.round(score * 100)
  const band = percent >= 96 ? 'precise' : percent >= 85 ? 'stable' : percent >= 50 ? 'rough' : 'weak'
  const ratingContribution = percent >= 96
    ? 'supports Resonant or Harmonic ratings'
    : percent >= 85
      ? 'supports Stable ratings'
      : percent >= 50
        ? 'needs refinement before strong ratings'
        : 'does not yet support restoration ratings'

  return {
    band,
    dimension: 'Resonance accuracy',
    percent,
    ratingContribution,
    score: Number(score.toFixed(2)),
    text: `Resonance accuracy ${percent} percent (${band}); ${ratingContribution}.`,
  }
}

export function seedMoveSummary(chamber, moveCount = 0) {
  const moves = Math.max(0, moveCount)
  const expectedMoves = Math.max(chamber.requiredSeeds ?? 1, chamber.plantingPattern?.slots?.length ?? 1)
  const band = moves <= expectedMoves ? 'efficient' : moves <= expectedMoves + 2 ? 'careful' : 'messy'
  const ratingContribution = band === 'efficient'
    ? 'supports stronger restoration ratings'
    : band === 'careful'
      ? 'keeps the rating stable'
      : 'weakens high-rating stewardship'

  return {
    band,
    dimension: 'Seed moves used',
    expectedMoves,
    moves,
    ratingContribution,
    text: `Seed moves used ${moves}; ${band} against ${expectedMoves} expected placement(s); ${ratingContribution}.`,
  }
}

export function graftStabilitySummary(chamber, plantedSeeds = []) {
  const grafts = plantedSeeds.filter((seed) => seed.grafted)
  const requiresGraft = Boolean(chamber.requiresGraft)
  const catalogued = grafts.filter((seed) => seed.discoveryId && seed.graftAncestry?.length >= 2)
  const mycelialSubstrate = String(chamber.substrate ?? '').toLowerCase().includes('mycel')
  const myceliumBoosted = grafts.filter((seed) => {
    const text = [seed.family, seed.ecologicalAffinity, seed.discoveredOrigin, ...(seed.graftAncestry ?? [])].join(' ').toLowerCase()
    return text.includes('myco') || text.includes('mycel')
  })
  const band = grafts.length
    ? mycelialSubstrate || myceliumBoosted.length ? 'mycelium-boosted' : catalogued.length === grafts.length ? 'catalogued' : 'viable'
    : requiresGraft ? 'missing' : 'not needed'
  const stable = !requiresGraft || grafts.length > 0
  const ratingContribution = band === 'catalogued'
    ? 'supports stronger restoration ratings'
    : band === 'mycelium-boosted'
      ? 'boosts graft stability through mycelium network support'
    : band === 'viable'
      ? 'keeps graft-dependent restoration stable'
      : band === 'missing'
        ? 'blocks graft-dependent restoration'
        : 'neutral for this contract'

  return {
    band,
    cataloguedGrafts: catalogued.length,
    dimension: 'Graft stability',
    grafts: grafts.length,
    myceliumBoosted: mycelialSubstrate ? grafts.length : myceliumBoosted.length,
    ratingContribution,
    requiresGraft,
    stable,
    text: `Graft stability ${band}; ${grafts.length} grafted seed(s), ${catalogued.length} catalogued, ${mycelialSubstrate ? 'mycelial substrate' : `${myceliumBoosted.length} mycelium-linked`}; ${ratingContribution}.`,
  }
}

export function hazardContainmentSummary(chamber, plantedSeeds = []) {
  const hazards = chamber.hazards ?? []
  const hazardAxis = (hazard) => ['pitchRatio', 'pulseRate', 'brightness', 'phase'].find((key) => Number.isFinite(hazard[key]))
  const violations = hazards.flatMap((hazard) =>
    plantedSeeds.filter((seed) => {
      const axis = hazardAxis(hazard)
      return axis && Number.isFinite(seed[axis]) && Math.abs(seed[axis] - hazard[axis]) <= hazard.radius
    }).map((seed) => ({ hazard, seed })),
  )
  const band = hazards.length === 0 ? 'clear' : violations.length === 0 ? 'contained' : 'breached'
  const contained = violations.length === 0
  const ratingContribution = band === 'contained'
    ? 'supports stronger restoration ratings'
    : band === 'breached'
      ? 'blocks safe restoration until resolved'
      : 'neutral for this contract'

  return {
    band,
    contained,
    dimension: 'Hazard containment',
    hazards: hazards.length,
    ratingContribution,
    violations,
    text: `Hazard containment ${band}; ${violations.length} breach(es) across ${hazards.length} known hazard(s); ${ratingContribution}.`,
  }
}

export function forbiddenPitchZoneState(chamber = {}, plantedSeeds = []) {
  const zones = (chamber.hazards ?? [])
    .filter((hazard) => Number.isFinite(hazard.pitchRatio))
    .map((hazard) => {
      const radius = Number(hazard.radius ?? 0)
      const lower = Number((hazard.pitchRatio - radius).toFixed(3))
      const upper = Number((hazard.pitchRatio + radius).toFixed(3))
      const breaches = plantedSeeds
        .filter((seed) => Number.isFinite(seed.pitchRatio) && seed.pitchRatio >= lower && seed.pitchRatio <= upper)
        .map((seed) => ({
          id: seed.id,
          name: seed.name ?? seed.id ?? 'unknown seed',
          pitchRatio: seed.pitchRatio,
          position: seed.position ?? { x: 0, y: 0 },
        }))

      return {
        breaches,
        lower,
        message: hazard.message ?? 'Forbidden pitch zone breached.',
        pitchRatio: hazard.pitchRatio,
        radius,
        upper,
      }
    })
  const breached = zones.some((zone) => zone.breaches.length)

  return {
    breached,
    count: zones.length,
    text: zones.length
      ? `Forbidden pitch zones: ${zones.map((zone) => `${zone.lower}-${zone.upper} around ${zone.pitchRatio}: ${zone.message}`).join('; ')}. ${breached ? `Rejected seeds: ${zones.flatMap((zone) => zone.breaches.map((seed) => `${seed.name} pitch ${seed.pitchRatio}`)).join(', ')}.` : 'No planted seed is inside a forbidden pitch zone.'}`
      : 'Forbidden pitch zones: none in this chamber.',
    zones,
  }
}

function materialTotal(materials = {}) {
  return Object.values(materials).reduce((total, value) => total + value, 0)
}

export function resourceEfficiencySummary(chamber, save = {}) {
  const spent = save.resourcesSpentByChamber?.[chamber.id] ?? {}
  const spentTotal = materialTotal(spent)
  const rewardTotal = materialTotal(chamber.rewards?.materials)
  const band = spentTotal === 0 ? 'conserved' : rewardTotal && spentTotal <= rewardTotal ? 'balanced' : 'costly'
  const ratingContribution = band === 'conserved'
    ? 'supports stronger restoration ratings'
    : band === 'balanced'
      ? 'keeps resource use sustainable'
      : 'weakens resource-efficiency stewardship'

  return {
    band,
    dimension: 'Resource efficiency',
    ratingContribution,
    rewardTotal,
    spent,
    spentTotal,
    text: `Resource efficiency ${band}; spent ${spentTotal} material unit(s) against ${rewardTotal} reward unit(s); ${ratingContribution}.`,
  }
}

export function lowCycleRestorationChallenge(chamber, save = {}) {
  const targetCycles = chamber.lowCycleChallenge?.targetCycles ?? (chamber.contractType === 'challenge' ? 2 : chamber.optional ? 3 : 4)
  const currentCycle = Math.max(0, save.arkClock ?? 0)
  const solved = save.solvedChambers?.includes(chamber.id) ?? false
  const achievedIds = save.lowCycleChallengeIds ?? []
  const achieved = achievedIds.includes(chamber.id)
  const eligible = !solved && currentCycle <= targetCycles
  const remainingCycles = Math.max(0, targetCycles - currentCycle)

  if (achieved) {
    return {
      achieved,
      currentCycle,
      eligible: false,
      remainingCycles: 0,
      targetCycles,
      text: `Low-cycle challenge achieved: ${chamber.title} was restored within ${targetCycles} Ark cycle(s).`,
    }
  }

  if (eligible) {
    return {
      achieved,
      currentCycle,
      eligible,
      remainingCycles,
      targetCycles,
      text: `Low-cycle challenge active: restore ${chamber.title} by Ark cycle ${targetCycles}; ${remainingCycles} cycle(s) remain.`,
    }
  }

  return {
    achieved,
    currentCycle,
    eligible: false,
    remainingCycles,
    targetCycles,
    text: solved
      ? `Low-cycle challenge closed: ${chamber.title} was restored without a low-cycle record.`
      : `Low-cycle challenge missed: Ark cycle ${currentCycle} is beyond the ${targetCycles}-cycle target for ${chamber.title}.`,
  }
}

export function optionalRecordRecoverySummary(chamber, save = {}) {
  const recordIds = chamber.rewards?.codex ?? []
  const recovered = recordIds.filter((id) => save.codexIds?.includes(id))
  const pending = recordIds.filter((id) => !save.codexIds?.includes(id))
  const band = recordIds.length === 0 ? 'none' : pending.length === 0 ? 'recovered' : 'available'
  const ratingContribution = band === 'recovered'
    ? 'supports stronger restoration ratings'
    : band === 'available'
      ? 'can still improve optional stewardship'
      : 'neutral for this contract'

  return {
    band,
    dimension: 'Optional record recovery',
    pending,
    ratingContribution,
    recovered,
    total: recordIds.length,
    text: `Optional record recovery ${band}; recovered ${recovered.length} of ${recordIds.length} record(s); ${ratingContribution}.`,
  }
}

export function finalEcologyPhilosophySummary(save = {}) {
  const philosophy = save.restorationPhilosophy ?? 'preservation'
  const ratings = Object.values(save.ratings ?? {})
  const carefulRestorations = ratings.filter((rating) => ['Stable', 'Resonant'].includes(rating)).length
  const adaptiveSignals = (save.unlockedGraftMechanics?.length ?? 0) + (save.wildMutationIds?.length ?? 0) + (save.customSeeds?.length ?? 0)
  const support = philosophy === 'adaptation' ? adaptiveSignals : carefulRestorations
  const strain = philosophy === 'adaptation' ? Math.max(0, carefulRestorations - adaptiveSignals) : adaptiveSignals
  const band = support === 0
    ? 'unproven'
    : support >= strain
      ? 'aligned'
      : 'strained'
  const ratingContribution = band === 'aligned'
    ? 'supports the chosen Ark philosophy'
    : band === 'strained'
      ? 'asks for more stewardship before the finale'
      : 'needs more restored ecology evidence'

  return {
    adaptiveSignals,
    band,
    carefulRestorations,
    dimension: 'Final ecology philosophy support',
    philosophy,
    ratingContribution,
    strain,
    support,
    text: `Final ecology philosophy support ${band}; ${philosophy} support ${support}, strain ${strain}; ${ratingContribution}.`,
  }
}

export const arkOriginEvidence = {
  abandoned: [
    { id: 'crew-message-07', clue: 'the crew entered preservation sleep before the final mission decision' },
    { id: 'crew-message-09', clue: 'the crew debate ended mid-vote' },
    { id: 'crew-message-10', clue: 'the last bridge voice deferred revival until consent could be remembered' },
  ],
  protected: [
    { id: 'crew-message-08', clue: 'seed dispersal was logged as a mercy protocol' },
    { id: 'gardener-note-09', clue: 'gardeners were instructed to leave return paths through hard repairs' },
    { id: 'seed-ancestry-03', clue: 'Umbra lines were bred to protect silence instead of erase it' },
  ],
  sabotaged: [
    { id: 'crew-message-06', clue: 'unauthorized graft harmonics appeared in the network' },
    { id: 'crew-message-11', clue: 'the crew found no proven sabotage flag' },
    { id: 'system-diagnostic-11', clue: 'environmental evidence is retained rather than overwritten' },
  ],
}

export function arkOriginMysteryState(save = {}) {
  const recovered = new Set(save.codexIds ?? [])
  const tracks = Object.entries(arkOriginEvidence).map(([id, evidence]) => {
    const found = evidence.filter((item) => recovered.has(item.id))
    return {
      evidence,
      found,
      id,
      recoveredCount: found.length,
      text: `${id}: ${found.length} of ${evidence.length} clue(s) recovered${found.length ? `; ${found.map((item) => item.clue).join('; ')}` : ''}.`,
      totalCount: evidence.length,
    }
  })
  const protectedTrack = tracks.find((track) => track.id === 'protected')
  const sabotageTrack = tracks.find((track) => track.id === 'sabotaged')
  const abandonedTrack = tracks.find((track) => track.id === 'abandoned')
  const verdict = protectedTrack.recoveredCount >= 2
    ? 'protected'
    : sabotageTrack.recoveredCount >= 2 && !recovered.has('crew-message-11')
      ? 'sabotaged'
      : abandonedTrack.recoveredCount >= 2
        ? 'abandoned'
        : 'unresolved'
  const interpretation = verdict === 'protected'
    ? 'Current reading: the Ark was protected through emergency stewardship, with sabotage still unproven.'
    : verdict === 'sabotaged'
      ? 'Current reading: sabotage remains plausible, but needs a recovered proof flag before the crew can trust it.'
      : verdict === 'abandoned'
        ? 'Current reading: abandonment is plausible, though the consent and mercy records may reframe it as protection.'
        : 'Current reading: unresolved; recover crew messages, gardener notes, and diagnostics before naming the Ark history.'

  return {
    interpretation,
    tracks,
    verdict,
    text: `Ark origin mystery: abandoned ${abandonedTrack.recoveredCount}/${abandonedTrack.totalCount}, sabotaged ${sabotageTrack.recoveredCount}/${sabotageTrack.totalCount}, protected ${protectedTrack.recoveredCount}/${protectedTrack.totalCount}. ${interpretation}`,
  }
}

export function embersapEndgameMutationState(save = {}) {
  const count = save.materials?.embersap ?? 0
  const mutations = save.wildMutationIds ?? []
  const poweredMutations = Math.min(count, mutations.length)

  return {
    count,
    mutations,
    poweredMutations,
    ready: poweredMutations > 0,
    text: poweredMutations > 0
      ? `Embersap endgame mutations powered: ${poweredMutations} mutation path(s) can influence adaptation endings.`
      : mutations.length
        ? `Embersap needed: ${mutations.length} wild mutation path(s) recorded but no embersap is available to power endgame mutation choices.`
        : 'Embersap endgame mutations dormant: accept and contain Wild restorations to gather embersap.',
  }
}

export function evaluateResonance(chamber, plantedSeeds) {
  if (plantedSeeds.length < chamber.requiredSeeds) {
    return { accuracy: resonanceAccuracySummary(0), graftStability: graftStabilitySummary(chamber, plantedSeeds), hazardContainment: hazardContainmentSummary(chamber, plantedSeeds), solved: false, score: 0, missing: [`Plant ${chamber.requiredSeeds - plantedSeeds.length} more seed(s).`] }
  }

  const ecology = averageSeeds(plantedSeeds)
  const photosynthesis = photosynthesisState(chamber, plantedSeeds)
  const thermalShutters = thermalShutterState(chamber, plantedSeeds)
  const pressureSails = pressureSailState(chamber, plantedSeeds)
  const droughtPockets = droughtPocketState(chamber, plantedSeeds)
  const staticBloom = staticBloomState(chamber, plantedSeeds)
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
  if (droughtPockets?.drained) missing.push('Raise pulse until drought pockets stop draining stability.')
  if (staticBloom?.masked) missing.push('Raise weak seed brightness until static bloom stops masking it.')
  if (timbrePuzzle && !timbrePuzzle.active) missing.push('Use a bright edged timbre to open the brightness/timbre puzzle.')
  if (chamber.plantingPattern) {
    const coverage = plantingCoverage(chamber, plantedSeeds)
    if (!coverage.complete) {
      missing.push(`Cover ${coverage.requiredCount - coverage.coveredCount} more multi-position planting slot(s).`)
    }
  }
  for (const hazard of chamber.hazards ?? []) {
    const axis = ['pitchRatio', 'pulseRate', 'brightness', 'phase'].find((key) => Number.isFinite(hazard[key]))
    if (axis && plantedSeeds.some((seed) => Number.isFinite(seed[axis]) && Math.abs(seed[axis] - hazard[axis]) <= hazard.radius)) {
      missing.push(hazard.message)
    }
  }

  const score = checks.reduce((total, [, value, tolerance]) => total + Math.max(0, 1 - value / Math.max(tolerance, 0.01)), 0) / checks.length
  const roundedScore = Number(score.toFixed(2))
  return {
    solved: missing.length === 0,
    score: roundedScore,
    accuracy: resonanceAccuracySummary(roundedScore),
    graftStability: graftStabilitySummary(chamber, plantedSeeds),
    hazardContainment: hazardContainmentSummary(chamber, plantedSeeds),
    missing,
    ecology,
    droughtPockets,
    photosynthesis,
    pressureSails,
    staticBloom,
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

export function endToEndProgressionState(chambers, save = {}) {
  const mainPath = []
  const solved = new Set()
  let guard = 0

  while (guard < chambers.length) {
    guard += 1
    const next = availableChambers(chambers, Array.from(solved))
      .find((chamber) => !solved.has(chamber.id) && !chamber.optional)
    if (!next) break
    mainPath.push(next)
    solved.add(next.id)
  }

  const blockedMain = chambers.filter((chamber) => !chamber.optional && !solved.has(chamber.id))
  const authoredSolved = new Set(save.solvedChambers ?? [])
  const nextLive = availableChambers(chambers, save.solvedChambers ?? [])
    .find((chamber) => !authoredSolved.has(chamber.id))
  const finale = chambers.find((chamber) => chamber.contractType === 'finale')
  const heartAtria = chambers.find((chamber) => chamber.id === 'heart-atria')
  const postgame = chambers.find((chamber) => chamber.contractType === 'conservatory')
  const finaleReachable = Boolean(finale && mainPath.some((chamber) => chamber.id === finale.id))
  const heartReachable = Boolean(heartAtria && mainPath.some((chamber) => chamber.id === heartAtria.id))
  const postgameReachable = Boolean(postgame && (postgame.requires ?? []).every((id) => solved.has(id) || id === finale?.id))
  const ready = blockedMain.length === 0 && finaleReachable && heartReachable && postgameReachable

  return {
    blockedMain,
    finale,
    finaleReachable,
    heartAtria,
    heartReachable,
    mainPath,
    nextLive,
    postgame,
    postgameReachable,
    ready,
    text: ready
      ? `End-to-end progression ready: ${mainPath.length} main-path contract(s) connect ${mainPath[0].title} through ${heartAtria.title}; finale ${finale.title} and postgame ${postgame.title} are reachable.`
      : `End-to-end progression incomplete: ${blockedMain.map((chamber) => chamber.title).join(', ') || 'finale or postgame handoff'} blocked.`,
  }
}

export function allMenusAccessibleState(save = {}) {
  const postgameOpen = Boolean(save.postgameUnlocked)
  const menus = [
    { id: 'main', title: 'Main menu', route: 'splash or Escape pause return', landmark: 'nav aria-label="Main menu"', feedback: 'current-save status' },
    { id: 'pause', title: 'Pause functions menu', route: 'Escape', landmark: 'nav aria-label="Pause functions menu"', feedback: 'current-save status' },
    { id: 'atlas', title: 'Restoration Atlas', route: 'main, pause, or post-restore', landmark: 'nav aria-label="Restoration atlas actions"', feedback: 'caption log plus atlas status' },
    { id: 'library', title: 'Seed Library', route: 'main, pause, atlas, or research grafts', landmark: 'nav aria-label="Seed library actions"', feedback: 'caption log plus selected seed status' },
    { id: 'grafting', title: 'Grafting Bench', route: 'Seed Library', landmark: 'section aria-labelledby="grafting-bench-title"', feedback: 'captioned graft action and unlocked mechanics' },
    { id: 'materials', title: 'Materials Ledger', route: 'Restoration Atlas or Seed Library', landmark: 'section aria-labelledby materials title', feedback: 'material counts and crafting status' },
    { id: 'codex', title: 'Codex perceptions', route: 'main, pause, atlas, or seed library', landmark: 'nav aria-label="Codex perception actions"', feedback: 'caption log plus recovery status' },
    { id: 'settings', title: 'Settings', route: 'main or pause', landmark: 'form aria-label="Settings controls"', feedback: 'captioned setting updates' },
    { id: 'manual', title: 'Manual/help', route: 'H key or main menu Help', landmark: 'main aria-labelledby="help-title"', feedback: 'controls and no-reflex campaign guidance' },
    { id: 'conservatory', title: 'Conservatory', route: postgameOpen ? 'postgame menu and ending return' : 'locked until postgame', landmark: 'main aria-labelledby="conservatory-title"', feedback: 'composition status and caption log', gated: !postgameOpen },
    { id: 'ending', title: 'Ending resolution', route: postgameOpen ? 'postgame menu' : 'locked until finale', landmark: 'main aria-labelledby="ending-title"', feedback: 'resolution summary', gated: !postgameOpen },
  ]
  const readyMenus = menus.filter((menu) => !menu.gated)
  const ready = readyMenus.every((menu) => menu.title && menu.route && menu.landmark && menu.feedback)

  return {
    menus,
    ready,
    readyMenus,
    text: ready
      ? `All menus accessible: ${readyMenus.length} available menu surface(s) have headings, semantic landmarks, keyboard or button routes, and text/log feedback; ${menus.length - readyMenus.length} gated postgame menu(s) disclose their lock state.`
      : `Menu accessibility incomplete: ${readyMenus.filter((menu) => !menu.title || !menu.route || !menu.landmark || !menu.feedback).map((menu) => menu.id).join(', ')} need accessible structure.`,
  }
}

export const manualCompleteSections = [
  { id: 'sound-play', title: 'How to Play by Sound', text: 'Start by scanning for the chamber heart, move by spatial footsteps, plant phonoseeds, tune DNA, graft when needed, and restore only when resonance checks are satisfied.' },
  { id: 'no-vision-reference', title: 'No-Vision Reference', text: 'O, P, I, L, Shift+L, X, V, C, and ? expose objective, position, inventory, logs, boundaries, planted voices, codex recovery, and controls without requiring the visual layer.' },
  { id: 'functions-menus', title: 'Functions Menus', text: 'Escape and menu buttons route to active chamber, Restoration Atlas, Seed Library, Codex, Settings, Help, Main menu, and postgame surfaces when unlocked.' },
  { id: 'atlas-planning', title: 'Restoration Atlas', text: 'The Atlas explains work orders, dependencies, ratings, materials, optional returns, codex rewards, system progress, philosophy, endings, and planning windows.' },
  { id: 'seed-library', title: 'Seed Library and Grafting', text: 'The Seed Library covers carried and reserve seeds, seed DNA, tuning, material costs, trait locking, graft inheritance, failed graft recovery, and preview audio.' },
  { id: 'codex', title: 'Codex and Perceptions', text: 'The Codex organizes recovered records, memory echoes, first records, completion progress, authored catalog completeness, and the Ark-origin mystery.' },
  { id: 'settings-accessibility', title: 'Settings and Accessibility', text: 'Settings include independent audio mix controls, reduced motion, minimal visual mode, high contrast, scan verbosity, text-only hints, remappable keyboard, and gamepad support.' },
  { id: 'materials', title: 'Materials', text: 'Materials explain biomass, crystal, spores, resin, mycelium, glass pollen, archive loam, dream compost, embersap, and memory as restoration resources.' },
  { id: 'chamber-guide', title: 'Chamber Guide', text: 'The chamber guide covers training, intake, navigation, water, rootworks, canopy, memory, emergency, optional, finale, and conservatory contracts.' },
  { id: 'endings-postgame', title: 'Endings and Postgame', text: 'Ending guidance explains preservation, adaptation, release, and conservatory outcomes, then points players to postgame collection, composition, and mutation play.' },
]

export function manualCompleteState(sections = manualCompleteSections) {
  const missing = sections.filter((section) => !section.id || !section.title || !section.text)
  const requiredIds = manualCompleteSections.map((section) => section.id)
  const coveredIds = new Set(sections.map((section) => section.id))
  const omitted = requiredIds.filter((id) => !coveredIds.has(id))
  const ready = missing.length === 0 && omitted.length === 0

  return {
    missing,
    omitted,
    ready,
    sections,
    text: ready
      ? `Manual complete: ${sections.length} section(s) cover sound-first play, no-vision commands, menus, atlas planning, seed/graft systems, codex, settings accessibility, materials, chamber guide, endings, and postgame.`
      : `Manual incomplete: missing content in ${missing.map((section) => section.id).join(', ') || 'none'}; omitted ${omitted.join(', ') || 'none'}.`,
  }
}

export const screenReaderTestRoutes = [
  { id: 'splash-menu', mode: 'tab navigation', route: 'Splash to Main menu to New game', expected: 'Interact to Begin, main menu buttons, and current-save status are named in order.' },
  { id: 'game-reading-order', mode: 'reading order', route: 'Active chamber', expected: 'H1 chamber title, live HUD, objective controls, inventory, and caption log read without requiring the radar.' },
  { id: 'heading-navigation', mode: 'heading navigation', route: 'Atlas, Seed Library, Codex, Help, Settings', expected: 'Each screen exposes one H1 and section H2 landmarks for fast navigation.' },
  { id: 'settings-forms', mode: 'form navigation', route: 'Settings controls', expected: 'Volume sliders, scan verbosity, checkboxes, and remappable keyboard inputs have explicit labels.' },
  { id: 'live-regions', mode: 'live region review', route: 'Movement, scan, tuning, graft, restore, and settings updates', expected: 'Caption/event logs use polite live regions and repeat important audio cues as text.' },
  { id: 'no-vision-commands', mode: 'keyboard command route', route: 'O/P/I/L/Shift+L/X/V/C/?', expected: 'Objective, position, inventory, logs, boundaries, planted voices, codex, and controls are reachable from the keyboard.' },
]

export function screenReaderTestingState(routes = screenReaderTestRoutes) {
  const modes = new Set(routes.map((route) => route.mode))
  const requiredModes = ['tab navigation', 'reading order', 'heading navigation', 'form navigation', 'live region review', 'keyboard command route']
  const missingModes = requiredModes.filter((mode) => !modes.has(mode))
  const incompleteRoutes = routes.filter((route) => !route.id || !route.mode || !route.route || !route.expected)
  const ready = missingModes.length === 0 && incompleteRoutes.length === 0

  return {
    incompleteRoutes,
    missingModes,
    ready,
    routes,
    text: ready
      ? `Screen reader testing pass ready: ${routes.length} simulated route(s) cover reading order, heading navigation, tab navigation, form navigation, live-region caption updates, and no-vision keyboard commands; real NVDA, JAWS, Narrator, or VoiceOver validation remains recommended before formal accessibility claims.`
      : `Screen reader testing pass incomplete: missing modes ${missingModes.join(', ') || 'none'}; incomplete routes ${incompleteRoutes.map((route) => route.id).join(', ') || 'none'}.`,
  }
}

export const e2eKeyFlowCoverage = [
  { id: 'new-game', flow: 'splash to main menu to new game', assertion: 'first chamber renders with accessible controls' },
  { id: 'no-vision-restore', flow: 'keyboard scan, move, plant, restore', assertion: 'caption log mirrors audio-first completion' },
  { id: 'settings-accessibility', flow: 'settings sliders, toggles, remapping', assertion: 'controls are labeled and setting changes are captioned' },
  { id: 'scan-modes', flow: 'objective, boundary, seed, hazard, memory, network, material, chamber scans', assertion: 'each scan mode produces text feedback' },
  { id: 'seed-graft', flow: 'seed library tuning, grafting, preview', assertion: 'seed DNA, graft discovery, and preview feedback appear' },
  { id: 'atlas-codex', flow: 'restore to atlas to codex', assertion: 'planning, systems, records, and completion audits are visible' },
  { id: 'save-load', flow: 'reload saved tutorial restoration and continue', assertion: 'restored contracts, materials, and current chamber survive reload' },
  { id: 'postgame', flow: 'ending to conservatory composition and mutation garden', assertion: 'postgame surfaces are reachable from an unlocked save' },
]

export function e2eKeyFlowCoverageState(flows = e2eKeyFlowCoverage) {
  const required = e2eKeyFlowCoverage.map((flow) => flow.id)
  const covered = new Set(flows.map((flow) => flow.id))
  const missing = required.filter((id) => !covered.has(id))
  const incomplete = flows.filter((flow) => !flow.id || !flow.flow || !flow.assertion)
  const ready = missing.length === 0 && incomplete.length === 0

  return {
    flows,
    incomplete,
    missing,
    ready,
    text: ready
      ? `E2E key-flow coverage ready: ${flows.length} flow(s) cover new game, no-vision restoration, settings accessibility, scan modes, seed/graft, atlas/codex, save/load, and postgame.`
      : `E2E key-flow coverage incomplete: missing ${missing.join(', ') || 'none'}; incomplete ${incomplete.map((flow) => flow.id).join(', ') || 'none'}.`,
  }
}

export function performancePassState(metrics = {}) {
  const budgets = {
    cssBytes: 50_000,
    jsBytes: 700_000,
    totalBytes: 750_000,
    ...metrics.budgets,
  }
  const measured = {
    authoredChambers: metrics.authoredChambers ?? 0,
    codexRecords: metrics.codexRecords ?? 0,
    cssBytes: metrics.cssBytes ?? 0,
    jsBytes: metrics.jsBytes ?? 0,
    totalBytes: metrics.totalBytes ?? 0,
  }
  const overBudget = Object.entries(budgets)
    .filter(([key, value]) => Number.isFinite(measured[key]) && measured[key] > value)
    .map(([key]) => key)
  const ready = overBudget.length === 0

  return {
    budgets,
    measured,
    overBudget,
    ready,
    text: ready
      ? `Performance pass ready: built JavaScript, CSS, and total static payload stay inside budgets while ${measured.authoredChambers} authored chamber(s) and ${measured.codexRecords} codex record(s) remain data-driven.`
      : `Performance pass over budget: ${overBudget.join(', ')}.`,
  }
}

export function packagingDeploymentState(config = {}) {
  const requiredScripts = ['build', 'preview', 'check:packaging', 'package:electron']
  const scripts = config.scripts ?? {}
  const artifacts = config.artifacts ?? {}
  const electron = config.electron ?? {}
  const missingScripts = requiredScripts.filter((script) => !scripts[script])
  const missingArtifacts = Object.entries({
    'dist/index.html': artifacts.distIndex,
    'dist/vendor/syngen.js': artifacts.syngenRuntime,
    'electron/main.cjs': electron.main,
    'electron/preload.cjs': electron.preload,
  })
    .filter(([, present]) => !present)
    .map(([name]) => name)
  const ready = missingScripts.length === 0 && missingArtifacts.length === 0 && electron.loadsDist === true

  return {
    missingArtifacts,
    missingScripts,
    ready,
    text: ready
      ? 'Packaging and deployment ready: build, preview, packaging checks, Electron directory packaging, dist index, packaged Syngen runtime, and Electron preload/main files are aligned.'
      : `Packaging and deployment incomplete: missing scripts ${missingScripts.join(', ') || 'none'}; missing artifacts ${missingArtifacts.join(', ') || 'none'}; Electron loads dist ${electron.loadsDist === true ? 'yes' : 'no'}.`,
  }
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

export function restorationAtlasV1State(chambers, save = {}, arkClock = 0) {
  const solvedIds = save.solvedChambers ?? []
  const available = availableChambers(chambers, solvedIds).filter((chamber) => !solvedIds.includes(chamber.id))
  const plan = restorationPlanningSession(chambers, solvedIds, { min: 20, max: 40 }, arkClock)
  const returnContracts = optionalReturnContracts(chambers, save)
  const codexRewardCount = chambers.flatMap((chamber) => chamber.rewards?.codex ?? []).length
  const materialsKnown = Object.keys(save.materials ?? {}).length > 0
  const functions = ['active chamber', 'seed library', 'codex perceptions', 'settings', 'main menu']
  const checklist = [
    { id: 'work-orders', ready: available.length > 0, text: `${available.length} available unresolved work order(s).` },
    { id: 'planning-window', ready: plan.min >= 20 && plan.max <= 40, text: `${plan.min} to ${plan.max} minute suggested planning window.` },
    { id: 'materials-ledger', ready: materialsKnown, text: materialsKnown ? 'Materials ledger visible.' : 'Materials ledger missing.' },
    { id: 'return-contracts', ready: true, text: `${returnContracts.length} optional rating-improvement return contract(s) currently available.` },
    { id: 'codex-payoff', ready: codexRewardCount > 0, text: `${codexRewardCount} codex/perception reward hook(s) authored for atlas follow-up.` },
    { id: 'function-menu', ready: functions.length >= 5, text: `Functions menu exits: ${functions.join(', ')}.` },
  ]
  const ready = checklist.every((item) => item.ready)

  return {
    available,
    checklist,
    functions,
    plan,
    ready,
    returnContracts,
    text: ready
      ? `Restoration atlas v1 ready: work orders, planning, materials, return contracts, codex payoff, and function-menu exits are available.`
      : `Restoration atlas v1 incomplete: ${checklist.filter((item) => !item.ready).map((item) => item.id).join(', ')}.`,
  }
}

export function resourceDeadEndState(chambers, save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const available = availableChambers(chambers, save.solvedChambers ?? [])
  const readyRequired = available.filter((chamber) => !chamber.optional && !solved.has(chamber.id))
  const materialGatedRequired = readyRequired.filter((chamber) => Object.values(chamber.materialCost ?? {}).some((cost) => cost > 0))
  const futureMaterialRewards = chambers.filter((chamber) => !solved.has(chamber.id) && Object.values(chamber.rewards?.materials ?? {}).some((value) => value > 0))
  const spores = save.materials?.spores ?? 0
  const resin = save.materials?.resin ?? 0
  const deadEnded = materialGatedRequired.length > 0 && readyRequired.length === materialGatedRequired.length

  return {
    deadEnded,
    freeTuningFallback: spores <= 0,
    futureMaterialRewardCount: futureMaterialRewards.length,
    materialGatedRequired,
    readyRequired,
    resetRecovery: true,
    resin,
    spores,
    text: deadEnded
      ? `Resource dead-end prevention: blocked; required contracts ${materialGatedRequired.map((chamber) => chamber.title).join(', ')} need materials before progress can continue.`
      : `Resource dead-end prevention: safe; ${readyRequired.length} ready required contract(s), ${futureMaterialRewards.length} unresolved material reward contract(s), ${spores} spores and ${resin} resin. Tuning is free when spores are empty, and chamber reset clears local spend penalties.`,
  }
}

export function navigationAtlasState(chambers, save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const restoredSystems = save.restoredSystems ?? []
  const navigationOnline = restoredSystems.includes('Navigation') || restoredSystems.includes('Navigation grove')
  const ready = new Set(availableChambers(chambers, save.solvedChambers ?? []).map((chamber) => chamber.id))
  const layout = createWorldLayoutIndex(chambers)
  const candidates = chambers.filter((chamber) => !solved.has(chamber.id) && (navigationOnline || ready.has(chamber.id)))
  const previews = candidates.slice(0, navigationOnline ? 6 : 3).map((chamber) => ({
    id: chamber.id,
    objective: chamber.objective,
    ready: ready.has(chamber.id),
    solveTimeMinutes: chamber.solveTimeMinutes,
    system: chamber.system,
    text: `${chamber.title}: ${chamber.system}, ${chamber.solveTimeMinutes.min} to ${chamber.solveTimeMinutes.max} minutes, ${ready.has(chamber.id) ? 'ready now' : 'locked by atlas dependencies'}. ${layout.points.find((point) => point.chamberId === chamber.id)?.text ?? 'World layout point pending.'} Objective preview: ${chamber.objective}`,
    title: chamber.title,
  }))

  return {
    layout,
    navigationOnline,
    previews,
    text: navigationOnline
      ? `Navigation atlas previews unlocked: ${previews.length} chamber preview(s) include objectives, readiness, solve-time comparison, and compass planning cues.`
      : `Navigation atlas previews limited: restore Navigation Grove to compare queued chamber objectives, timings, and compass cues.`,
  }
}

export function waterRootRoutingState(chambers, save = {}) {
  const restoredSystems = save.restoredSystems ?? []
  const solved = new Set(save.solvedChambers ?? [])
  const waterOnline = restoredSystems.includes('Water') || restoredSystems.includes('Water pumps') || solved.has('pitch')
  const rootContracts = chambers.filter((chamber) => chamber.system === 'Rootworks')
  const ready = new Set(availableChambers(chambers, save.solvedChambers ?? []).map((chamber) => chamber.id))
  const routedContracts = waterOnline ? rootContracts.filter((chamber) => ready.has(chamber.id) || chamber.requires?.some((id) => solved.has(id))) : []

  return {
    rootContracts,
    routedContracts,
    waterOnline,
    text: waterOnline
      ? `Water root routing unlocked: ${routedContracts.length} Rootworks contract(s) can receive current navigation and pump-flow planning.`
      : `Water root routing locked: restore Water Pumps before root contracts can receive current navigation.`,
  }
}

export function canopyDoorState(chambers, save = {}) {
  const restoredSystems = save.restoredSystems ?? []
  const solved = new Set(save.solvedChambers ?? [])
  const canopyOnline = restoredSystems.includes('Canopy') || restoredSystems.includes('Canopy lights') || solved.has('rhythm')
  const doors = chambers.filter((chamber) => chamber.photosynthesis || chamber.timbrePuzzle || chamber.thermalShutters)

  return {
    canopyOnline,
    doors,
    text: canopyOnline
      ? `Canopy photosynthesis doors unlocked: ${doors.length} chamber door(s) can use brightness tuning, light thresholds, and filter planning.`
      : `Canopy photosynthesis doors locked: restore Canopy Pulse Trellis to unlock brightness-door planning.`,
  }
}

export function firstFourArkSystemsState(chambers, save = {}) {
  const restoredSystems = save.restoredSystems ?? []
  const solved = new Set(save.solvedChambers ?? [])
  const systems = [
    {
      id: 'intake',
      name: 'Intake',
      contract: chambers.find((chamber) => chamber.id === 'direction'),
      online: restoredSystems.includes('Intake') || solved.has('direction'),
      unlock: 'longer scan range and pressure awareness',
    },
    {
      id: 'navigation',
      name: 'Navigation',
      contract: chambers.find((chamber) => chamber.id === 'binaural'),
      online: navigationAtlasState(chambers, save).navigationOnline,
      unlock: 'atlas previews, objective scan, and chamber compass cues',
    },
    {
      id: 'water',
      name: 'Water',
      contract: chambers.find((chamber) => chamber.id === 'pitch'),
      online: waterRootRoutingState(chambers, save).waterOnline,
      unlock: 'current navigation and root contract routing',
    },
    {
      id: 'canopy',
      name: 'Canopy',
      contract: chambers.find((chamber) => chamber.id === 'rhythm'),
      online: canopyDoorState(chambers, save).canopyOnline,
      unlock: 'brightness tuning and photosynthesis doors',
    },
  ].map((system) => ({
    ...system,
    ready: Boolean(system.contract?.id && system.contract?.objective && system.contract?.rewards?.codex?.length),
    text: `${system.name}: ${system.contract?.title ?? 'contract missing'}; ${system.unlock}; ${system.online ? 'online' : 'awaiting restoration'}.`,
  }))
  const ready = systems.every((system) => system.ready)
  const onlineCount = systems.filter((system) => system.online).length

  return {
    onlineCount,
    ready,
    systems,
    text: ready
      ? `Intake, Navigation, Water, and Canopy systems ready: ${systems.length} authored contracts with unlocks; ${onlineCount} online in the current save.`
      : `Intake, Navigation, Water, and Canopy systems incomplete: ${systems.filter((system) => !system.ready).map((system) => system.name).join(', ')}.`,
  }
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
  const rareHunting = rareSeedHuntingState(inventory, save)
  const graftCatalog = graftCatalogCompletionState(save)
  return {
    gathered: inventory.length,
    graftCatalog,
    identifiedFamilies: families,
    curatedSeed: selectedSeed?.name ?? 'No seed selected',
    playableVoices: inventory.map((seed) => seed.name),
    rareHunting,
    restorationUse: materials.length
      ? `Exchange ${materials.map(([key, value]) => `${value} ${key}`).join(', ')} for tuning and restoration work.`
      : 'Restore contracts to gather tuning exchange materials.',
    commerceBoundary: 'Exchange remains restoration support, not museum commerce.',
  }
}

export function seedLibraryMenuState(inventory = [], save = {}, selectedSeedIndex = 0) {
  const selectedSeed = inventory[selectedSeedIndex] ?? inventory[0]
  const appraisal = seedCollectionAppraisal(inventory, save, selectedSeed)
  const actions = [
    'preview selected seed',
    'select seed',
    'tune DNA',
    'lock trait with resin',
    'graft first two seeds',
    'return to atlas',
    'back to chamber',
  ]
  const sections = [
    {
      id: 'materials-ledger',
      ready: Boolean(save.materials),
      text: 'Materials ledger visible for tuning, locking, and graft costs.',
    },
    {
      id: 'collection-appraisal',
      ready: appraisal.gathered > 0,
      text: `${appraisal.gathered} gathered voice(s), ${appraisal.identifiedFamilies.length} identified family/families.`,
    },
    {
      id: 'selected-seed-dna',
      ready: Boolean(selectedSeed),
      text: selectedSeed ? `Selected seed DNA ready: ${selectedSeed.name}.` : 'Selected seed DNA missing.',
    },
    {
      id: 'grafting-bench',
      ready: inventory.length >= 2,
      text: inventory.length >= 2 ? 'Grafting bench ready with two parent seeds.' : 'Grafting bench needs two carried seeds.',
    },
    {
      id: 'family-catalog',
      ready: seedFamilies.length >= 24 && graftDiscoveryCatalog.length >= 80,
      text: `${seedFamilies.length} seed families and ${graftDiscoveryCatalog.length} graft discoveries cataloged.`,
    },
    {
      id: 'caption-actions',
      ready: actions.length >= 7,
      text: `Seed library actions: ${actions.join(', ')}.`,
    },
  ]
  const incomplete = sections.filter((section) => !section.ready)
  const ready = incomplete.length === 0

  return {
    actions,
    appraisal,
    preview: selectedSeed ? seedAudioPreview(selectedSeed) : undefined,
    ready,
    sections,
    selectedSeed,
    text: ready
      ? `Seed library menu ready: ${sections.length} sections cover collection, tuning, grafting, catalog, preview, and navigation.`
      : `Seed library menu incomplete: ${incomplete.map((section) => section.id).join(', ')}.`,
  }
}

export function firstCodexRecordsState(chambers, records = codexRecords) {
  const firstContract = chambers.find((chamber) => chamber.id === 'tutorial') ?? chambers[0]
  const recordIds = firstContract?.rewards?.codex ?? []
  const entries = recordIds.map((id) => ({ id, ...records[id] }))
  const missing = entries.filter((entry) => !entry.title || !entry.text)
  const branches = Array.from(new Set(recordIds.map((id) => id.split('-').slice(0, -1).join('-') || id)))
  const ready = recordIds.length >= 5 && missing.length === 0

  return {
    branches,
    entries,
    firstContract,
    missing,
    ready,
    text: ready
      ? `First codex records ready: ${firstContract.title} rewards ${entries.length} readable record(s) across ${branches.join(', ')}.`
      : `First codex records incomplete: ${missing.length} missing authored record(s) from ${firstContract?.title ?? 'first contract'}.`,
  }
}

export function firstMaterialLoopState(chambers, save = {}) {
  const firstContract = chambers.find((chamber) => chamber.id === 'tutorial') ?? chambers[0]
  const rewardMaterials = firstContract?.rewards?.materials ?? {}
  const rewardEntries = Object.entries(rewardMaterials).filter(([, value]) => value > 0)
  const currentMaterials = save.materials ?? {}
  const gatheredEntries = rewardEntries.filter(([key]) => (currentMaterials[key] ?? 0) > 0)
  const loopSteps = [
    `earn ${rewardEntries.map(([key, value]) => `${value} ${key}`).join(', ')} from ${firstContract.title}`,
    'spend spores on seed tuning when available',
    'use biomass as basic restoration growth and repair stock',
    'reset chambers without losing gathered materials',
  ]
  const ready = rewardEntries.some(([key]) => key === 'spores') && rewardEntries.some(([key]) => key === 'biomass')

  return {
    firstContract,
    gatheredEntries,
    loopSteps,
    ready,
    rewardEntries,
    text: ready
      ? `First material loop ready: ${loopSteps.join('; ')}. Current save has ${gatheredEntries.length} starter material type(s) gathered.`
      : `First material loop incomplete: starter contract needs biomass and spores rewards.`,
  }
}

export function materialsCraftingState(save = {}) {
  const materials = save.materials ?? {}
  const recipes = [
    { id: 'spore-tuning', material: 'spores', text: 'spores tune seed DNA when available' },
    { id: 'resin-lock', material: 'resin', text: 'resin locks seed traits before tuning or grafting' },
    { id: 'mycelium-graft', material: 'mycelium', text: 'mycelium boosts graft stability' },
    { id: 'glass-pollen', material: 'glassPollen', text: 'glass pollen unlocks brightness and timbre traits' },
    { id: 'archive-loam', material: 'archiveLoam', text: 'archive loam reveals hidden ancestry' },
    { id: 'dream-compost', material: 'dreamCompost', text: 'dream compost recovers useful failed grafts' },
    { id: 'embersap', material: 'embersap', text: 'embersap powers endgame mutations' },
  ]
  const knownMaterials = Object.keys(materials)
  const ready = recipes.every((recipe) => knownMaterials.includes(recipe.material))

  return {
    knownMaterials,
    ready,
    recipes,
    text: ready
      ? `Materials and crafting ready: ${recipes.length} recipe path(s) cover ${recipes.map((recipe) => recipe.text).join('; ')}.`
      : `Materials and crafting incomplete: missing ${recipes.filter((recipe) => !knownMaterials.includes(recipe.material)).map((recipe) => recipe.material).join(', ')}.`,
  }
}

function addMaterialTotals(target, source = {}) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value
  }
  return target
}

export function restoredSystemRewardsState(chambers, save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const restoredSystems = new Set(save.restoredSystems ?? [])
  const entriesBySystem = new Map()

  for (const chamber of chambers) {
    const system = chamber.system ?? 'Unknown'
    const entry = entriesBySystem.get(system) ?? {
      codexIds: [],
      materialTotals: {},
      restoredContracts: 0,
      seedIds: [],
      system,
      totalContracts: 0,
    }
    entry.totalContracts += 1
    if (solved.has(chamber.id)) entry.restoredContracts += 1
    addMaterialTotals(entry.materialTotals, chamber.rewards?.materials)
    entry.codexIds.push(...(chamber.rewards?.codex ?? []))
    entry.seedIds.push(...(chamber.rewards?.seeds ?? []))
    entriesBySystem.set(system, entry)
  }

  const entries = Array.from(entriesBySystem.values()).map((entry) => {
    const online = restoredSystems.has(entry.system)
    const materialText = Object.entries(entry.materialTotals)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${value} ${key}`)
      .join(', ') || 'no material rewards authored yet'
    const rewardCount = Object.keys(entry.materialTotals).length + entry.codexIds.length + entry.seedIds.length

    return {
      ...entry,
      materialText,
      online,
      rewardCount,
      text: `${entry.system}: ${online ? 'online' : 'locked'}; ${entry.restoredContracts} of ${entry.totalContracts} contract(s) restored; materials ${materialText}; records ${entry.codexIds.length}; seeds ${entry.seedIds.length}.`,
    }
  })

  const onlineEntries = entries.filter((entry) => entry.online)
  const nextReward = entries.find((entry) => !entry.online && entry.rewardCount > 0) ?? entries.find((entry) => entry.rewardCount > 0)
  const earnedMaterials = Object.entries(save.materials ?? {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${value} ${key}`)
    .join(', ') || 'none carried yet'

  return {
    earnedMaterials,
    entries,
    nextReward,
    onlineEntries,
    ready: entries.length > 0 && entries.every((entry) => entry.rewardCount > 0),
    text: `Restored system rewards ready: ${onlineEntries.length} online system(s) have earned ${earnedMaterials}. ${nextReward ? `Next system reward track: ${nextReward.system} offers ${nextReward.materialText}.` : 'No pending reward track remains.'}`,
  }
}

export function persistentChamberChangesState(chambers, save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const environmentalChanges = save.environmentalChanges ?? []
  const plantedByChamber = save.plantedByChamber ?? {}
  const ratings = save.ratings ?? {}
  const resourcesSpentByChamber = save.resourcesSpentByChamber ?? {}
  const seedMovesByChamber = save.seedMovesByChamber ?? {}
  const entries = chambers
    .filter((chamber) => solved.has(chamber.id))
    .map((chamber) => {
      const environmentalChange = environmentalChanges.find((change) => change.includes(chamber.title)) ?? ''
      const plantedSeeds = plantedByChamber[chamber.id] ?? []
      const materialSpend = resourcesSpentByChamber[chamber.id] ?? {}
      return {
        environmentalChange,
        id: chamber.id,
        materialSpend,
        plantedSeedCount: plantedSeeds.length,
        rating: ratings[chamber.id] ?? 'Restored',
        seedMoves: seedMovesByChamber[chamber.id] ?? 0,
        system: chamber.system,
        title: chamber.title,
        text: `${chamber.title}: ${ratings[chamber.id] ?? 'Restored'} rating, ${plantedSeeds.length} persistent planted seed(s), ${seedMovesByChamber[chamber.id] ?? 0} seed move(s), ${Object.keys(materialSpend).length ? `spend ${Object.entries(materialSpend).map(([key, value]) => `${value} ${key}`).join(', ')}` : 'no saved material spend'}, ${environmentalChange || 'environmental change pending'}.`,
      }
    })
  const missing = entries.filter((entry) => !entry.rating || !entry.environmentalChange)

  return {
    entries,
    missing,
    persistentFields: ['ratings', 'environmental changes', 'planted seeds', 'material spend', 'seed-move history'],
    ready: entries.length === 0 || missing.length === 0,
    text: entries.length
      ? `Persistent chamber changes ready: ${entries.length} restored chamber change(s) preserve ratings, environmental changes, planted seeds, material spend, and seed-move history.`
      : 'Persistent chamber changes ready: no restored chambers yet; save fields are prepared for ratings, environmental changes, planted seeds, material spend, and seed-move history.',
  }
}

export function firstChamberRatingImprovementState(chambers, save = {}) {
  const firstContract = chambers.find((chamber) => chamber.id === 'tutorial') ?? chambers[0]
  const currentRating = save.ratings?.[firstContract.id] ?? 'Unrated'
  const targetRating = currentRating === 'Resonant' ? 'Resonant' : 'Resonant'
  const improvementSteps = [
    'revisit from the Restoration Atlas',
    'plant fewer seed moves',
    'tighten resonance accuracy',
    'recover optional records',
    'conserve materials',
  ]
  const improved = currentRating === targetRating
  const ready = Boolean(firstContract?.id && firstContract?.rewards?.codex?.length && firstContract?.rewards?.materials)

  return {
    currentRating,
    firstContract,
    improved,
    improvementSteps,
    ready,
    targetRating,
    text: ready
      ? `First chamber rating improvements ready: ${firstContract.title} is ${currentRating}; target ${targetRating} by ${improvementSteps.join(', ')}.`
      : `First chamber rating improvements incomplete: starter contract needs rewards and rating dimensions.`,
  }
}

export function graftCatalogCompletionState(save = {}, catalog = graftDiscoveryCatalog) {
  const fromRecords = (save.graftRecords ?? [])
    .map((record) => String(record.id ?? '').replace(/^graft-record-/, ''))
    .filter(Boolean)
  const discoveredIds = Array.from(new Set([...(save.graftDiscoveryIds ?? []), ...fromRecords]))
  const discovered = discoveredIds.filter((id) => catalog.some((entry) => entry.id === id))
  const undiscovered = catalog.filter((entry) => !discovered.includes(entry.id))
  const nextDiscovery = undiscovered[0]

  return {
    complete: undiscovered.length === 0,
    discoveredCount: discovered.length,
    discoveredIds,
    nextDiscovery,
    remainingCount: undiscovered.length,
    total: catalog.length,
    text: undiscovered.length
      ? `Graft catalog completion: ${discovered.length} of ${catalog.length} discoveries recorded; next unknown pairing hint ${nextDiscovery.families.join(' plus ')}.`
      : `Graft catalog complete: all ${catalog.length} graft discoveries recorded.`,
  }
}

export function rareSeedHuntingState(inventory = [], save = {}) {
  const rareFamilyIds = new Set(['prism', 'loam', 'resin', 'pollen', 'chorus', 'drift', 'veil', 'pulse', 'bloom', 'anchor', 'vow', 'hybrid'])
  const targets = seedFamilies.filter((family) => rareFamilyIds.has(family.id))
  const known = new Set([
    ...(save.rareSeedIds ?? []),
    ...inventory.flatMap((seed) => [seed.id, seed.family, seed.name]).filter(Boolean),
  ].map((value) => String(value).toLowerCase()))
  const found = targets.filter((family) => known.has(family.id) || known.has(family.name.toLowerCase()))
  const missing = targets.filter((family) => !found.includes(family))
  const nextLead = missing[0]

  return {
    complete: missing.length === 0,
    foundCount: found.length,
    foundFamilies: found.map((family) => family.name),
    missingFamilies: missing.map((family) => family.name),
    nextLead,
    total: targets.length,
    text: missing.length
      ? `Rare seed hunting: ${found.length} of ${targets.length} rare families found; next lead ${nextLead.name} from ${nextLead.origin}, affinity ${nextLead.affinity}.`
      : `Rare seed hunting complete: all ${targets.length} rare families are catalogued for graft and conservatory play.`,
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

export function codexRecoverySummary(chambers, save) {
  const recovered = new Set(save.codexIds ?? [])
  const ready = new Set(availableChambers(chambers, save.solvedChambers ?? []).map((chamber) => chamber.id))
  const availableRecords = chambers
    .filter((chamber) => ready.has(chamber.id) && !(save.solvedChambers ?? []).includes(chamber.id))
    .flatMap((chamber) => (chamber.rewards?.codex ?? [])
      .filter((id) => !recovered.has(id))
      .map((id) => ({ id, chamberId: chamber.id, chamberTitle: chamber.title })))

  return {
    recoveredCount: recovered.size,
    availableRecords,
    nextRecovery: availableRecords[0],
    text: availableRecords.length
      ? `Codex recovery: ${recovered.size} recovered; next available perception in ${availableRecords[0].chamberTitle}.`
      : `Codex recovery: ${recovered.size} recovered; no ready unrecovered perceptions in available contracts.`,
  }
}

export function codexCompletionState(save = {}, records = codexRecords) {
  const dynamicRecords = Object.fromEntries((save.graftRecords ?? []).map((record) => [record.id, record]))
  const availableRecords = { ...records, ...dynamicRecords }
  const allIds = Object.keys(availableRecords)
  const recoveredIds = Array.from(new Set(save.codexIds ?? [])).filter((id) => availableRecords[id])
  const missingIds = allIds.filter((id) => !recoveredIds.includes(id))
  const nextMissingId = missingIds[0]
  const percent = allIds.length ? Math.round((recoveredIds.length / allIds.length) * 100) : 100

  return {
    availableRecords,
    complete: missingIds.length === 0,
    missingCount: missingIds.length,
    missingIds,
    nextMissing: nextMissingId ? { id: nextMissingId, ...availableRecords[nextMissingId] } : undefined,
    percent,
    recoveredCount: recoveredIds.length,
    recoveredIds,
    total: allIds.length,
    text: missingIds.length
      ? `Codex completion: ${recoveredIds.length} of ${allIds.length} records recovered (${percent} percent); next missing ${availableRecords[nextMissingId].title ?? nextMissingId}.`
      : `Codex completion: all ${allIds.length} available records recovered.`,
  }
}

export function memoryCodexEchoState(chambers, save = {}) {
  const restoredSystems = save.restoredSystems ?? []
  const solved = new Set(save.solvedChambers ?? [])
  const memoryOnline = restoredSystems.includes('Memory') || restoredSystems.includes('Memory Orchard') || solved.has('phase')
  const recovery = codexRecoverySummary(chambers, save)
  const echoes = memoryOnline ? recovery.availableRecords.slice(0, 6) : []

  return {
    echoes,
    memoryOnline,
    text: memoryOnline
      ? `Memory codex echoes unlocked: ${echoes.length} recoverable echo(s) can be heard before restoration.`
      : `Memory codex echoes locked: restore Quiet Mirror or Memory Orchard access to preview hidden records.`,
  }
}

export function centralHeartSummary(chambers, save) {
  const solved = new Set(save.solvedChambers ?? [])
  const ready = new Set(availableChambers(chambers, save.solvedChambers ?? []).map((chamber) => chamber.id))
  const heartContracts = chambers.filter((chamber) => chamber.system === 'Verdancy Heart')
  const central = heartContracts.find((chamber) => chamber.id === 'heart-atria')
  const finaleBranches = heartContracts.filter((chamber) => chamber.id !== central?.id)
  const readyBranches = finaleBranches.filter((chamber) => ready.has(chamber.id) && !solved.has(chamber.id))
  const restoredBranches = finaleBranches.filter((chamber) => solved.has(chamber.id))
  const online = Boolean(central && solved.has(central.id))

  return {
    central,
    finaleBranches,
    online,
    readyBranches,
    restoredBranches,
    text: online
      ? `Central Heart online: ${restoredBranches.length} finale branch(es) tuned and ${readyBranches.length} ready for resolution shaping.`
      : central && ready.has(central.id)
        ? `Central Heart ready: restore ${central.title} to unlock network resonance and ending preparation.`
        : `Central Heart dormant: restore Memory Orchard access before the Verdancy Heart can answer.`,
  }
}

export function multiChamberResonanceNetwork(chambers, save) {
  const solved = new Set(save.solvedChambers ?? [])
  const ratingWeights = { Dormant: 0, Restored: 1, Stable: 2, Resonant: 3, Wild: 2 }
  const restored = chambers.filter((chamber) => solved.has(chamber.id))
  const systems = Array.from(new Set(chambers.map((chamber) => chamber.system)))
  const nodes = systems.map((system) => {
    const chambersForSystem = restored.filter((chamber) => chamber.system === system)
    const strength = chambersForSystem.reduce((total, chamber) => total + (ratingWeights[save.ratings?.[chamber.id] ?? 'Restored'] ?? 1), 0)
    return {
      online: chambersForSystem.length > 0,
      restoredCount: chambersForSystem.length,
      strength,
      system,
      text: `${system}: ${chambersForSystem.length} restored chamber(s), network strength ${strength}.`,
    }
  })
  const onlineNodes = nodes.filter((node) => node.online)
  const totalStrength = nodes.reduce((total, node) => total + node.strength, 0)
  const heartOnline = Boolean(centralHeartSummary(chambers, save).online)
  const readyForFinale = heartOnline && onlineNodes.length >= 6

  return {
    heartOnline,
    nodes,
    onlineNodes,
    readyForFinale,
    restoredCount: restored.length,
    totalStrength,
    text: readyForFinale
      ? `Multi-chamber resonance network ready: ${onlineNodes.length} systems online with strength ${totalStrength}.`
      : `Multi-chamber resonance network building: ${onlineNodes.length} systems online, ${restored.length} chambers restored, strength ${totalStrength}. Restore Heart Atria and more systems before final network resonance.`,
  }
}

export function heartNetworkEndingState(chambers, save = {}) {
  const central = centralHeartSummary(chambers, save)
  const network = multiChamberResonanceNetwork(chambers, save)
  const heartOnline = central.online || (save.restoredSystems ?? []).includes('Heart') || (save.restoredSystems ?? []).includes('Verdancy Heart')
  const endingsUnlocked = heartOnline && (network.readyForFinale || save.postgameUnlocked || (save.solvedChambers ?? []).includes('finale'))

  return {
    endingsUnlocked,
    heartOnline,
    networkStrength: network.totalStrength,
    text: heartOnline
      ? `Heart network resonance unlocked: strength ${network.totalStrength}; ${endingsUnlocked ? 'ending resolutions are available' : 'restore more network branches before endings open'}.`
      : `Heart network resonance locked: restore Heart Atria before ending resolutions can open.`,
  }
}

export function playerBuiltFinalChord(chambers, save, inventory = []) {
  const solved = new Set(save.solvedChambers ?? [])
  const plantedByChamber = save.plantedByChamber ?? {}
  const plantedVoices = Object.entries(plantedByChamber)
    .filter(([chamberId]) => solved.has(chamberId))
    .flatMap(([chamberId, seeds]) => {
      const chamber = chambers.find((item) => item.id === chamberId)
      return (seeds ?? []).map((seed) => ({
        chamberId,
        chamberTitle: chamber?.title ?? chamberId,
        family: seed.family,
        name: seed.name,
        pitchRatio: seed.pitchRatio,
        pulseRate: seed.pulseRate,
        system: chamber?.system ?? 'Unknown',
      }))
    })
  const fallbackVoices = plantedVoices.length ? [] : inventory.map((seed) => ({
    chamberId: 'inventory',
    chamberTitle: 'Seed Library',
    family: seed.family,
    name: seed.name,
    pitchRatio: seed.pitchRatio,
    pulseRate: seed.pulseRate,
    system: 'Library',
  }))
  const voices = [...plantedVoices, ...fallbackVoices]
  const systems = Array.from(new Set(voices.map((voice) => voice.system)))
  const network = multiChamberResonanceNetwork(chambers, save)

  return {
    networkStrength: network.totalStrength,
    systems,
    text: voices.length
      ? `Player-built final chord: ${voices.length} voice(s) from ${systems.join(', ')} carry network strength ${network.totalStrength}. Lead voice ${voices[0].name} from ${voices[0].chamberTitle}.`
      : 'Player-built final chord: no planted voices recorded yet; restore chambers so the ending can use the player-built chord.',
    voices,
  }
}

export const conservatoryCompositionModes = [
  { id: 'balanced', title: 'Balanced Chord', text: 'Layer recovered voices evenly as a stable postgame chord.' },
  { id: 'solo', title: 'Seed Solo', text: 'Feature the selected seed voice while other recovered voices answer softly.' },
  { id: 'network', title: 'Network Braid', text: 'Group voices by restored Ark systems so the composition follows the repair network.' },
]

export function freeCompositionConservatory(save, inventory = [], modeId = 'balanced') {
  const mode = conservatoryCompositionModes.find((item) => item.id === modeId) ?? conservatoryCompositionModes[0]
  const playableVoices = inventory.map((seed) => ({
    family: seed.family,
    name: seed.name,
    pitchRatio: seed.pitchRatio,
    pulseRate: seed.pulseRate,
  }))
  const unlocked = Boolean(save.postgameUnlocked)

  return {
    mode,
    modes: conservatoryCompositionModes,
    playableVoices,
    text: unlocked
      ? `Free-composition conservatory open: ${playableVoices.length} playable voice(s). Mode ${mode.title}: ${mode.text}`
      : 'Free-composition conservatory locked until a finale resolution opens postgame restoration.',
    unlocked,
  }
}

export function conservatoryCompositionSnapshot(save, inventory = [], modeId = 'balanced') {
  const composition = freeCompositionConservatory(save, inventory, modeId)
  const voiceNames = composition.playableVoices.map((voice) => voice.name)
  const voiceSlug = voiceNames
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'silent'

  return {
    id: `composition-${composition.mode.id}-${voiceSlug}`,
    mode: composition.mode,
    playableVoices: composition.playableVoices,
    unlocked: composition.unlocked,
    voiceCount: composition.playableVoices.length,
    text: composition.unlocked
      ? `Conservatory composition saved: ${composition.mode.title} with ${voiceNames.length} voice(s): ${voiceNames.join(', ') || 'no voices'}.`
      : 'Conservatory composition locked until postgame restoration opens.',
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

export function workingRestorationCampaignState(chambers, save = {}, arkClock = 0) {
  const solvedIds = save.solvedChambers ?? []
  const solved = new Set(solvedIds)
  const available = availableChambers(chambers, solvedIds).filter((chamber) => !solved.has(chamber.id))
  const plan = restorationPlanningSession(chambers, solvedIds, { min: 20, max: 40 }, arkClock)
  const returns = optionalReturnContracts(chambers, save)
  const ratingOrder = ['Resonant', 'Stable', 'Restored', 'Dormant', 'Wild']
  const ratingCounts = Object.entries(save.ratings ?? {}).reduce((counts, [, rating]) => {
    counts[rating] = (counts[rating] ?? 0) + 1
    return counts
  }, {})
  const ratingText = ratingOrder
    .filter((rating) => ratingCounts[rating])
    .map((rating) => `${rating} ${ratingCounts[rating]}`)
    .join(', ') || 'no chamber ratings yet'
  const nextRequired = available.find((chamber) => !chamber.optional)
  const nextOptional = available.find((chamber) => chamber.optional)
  const nextAction = returns[0]?.title
    ? `revisit ${returns[0].title} for rating improvement`
    : nextRequired?.title
      ? `restore ${nextRequired.title}`
      : nextOptional?.title
        ? `optional work ${nextOptional.title}`
        : 'review postgame restoration'
  const entries = plan.contracts.map((contract) => ({
    id: contract.id,
    ready: contract.ready,
    rating: save.ratings?.[contract.id] ?? 'Unrated',
    title: contract.title,
    text: `${contract.title}: ${contract.ready ? 'ready' : 'queued'}; ${contract.optional ? 'optional' : 'required'}; ${save.ratings?.[contract.id] ?? 'Unrated'} rating; ${contract.solveTimeMinutes.min} to ${contract.solveTimeMinutes.max} minute solve.`,
  }))

  return {
    availableCount: available.length,
    entries,
    nextAction,
    nextOptional,
    nextRequired,
    plan,
    ratingCounts,
    ratingText,
    ready: plan.contracts.length > 0 && plan.min >= 20 && plan.max <= 40,
    returnContracts: returns,
    text: `Working restoration campaign: ${solved.size} restored, ${available.length} available, ratings ${ratingText}. Planning queue ${plan.min} to ${plan.max} minute(s); ${returns.length} rating return option(s). Next action: ${nextAction}.`,
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

export function restorationOutcomeSummary(chamber, rating) {
  if (rating === 'Stable') {
    const requiredSystem = !chamber.optional
    return {
      campaignCanContinue: requiredSystem,
      outcome: 'Stable',
      rating,
      requiredSystem,
      systemOnline: requiredSystem,
      text: requiredSystem
        ? `Stable outcome: ${chamber.system} comes online and the campaign can continue.`
        : `Stable outcome: optional contract ${chamber.title} strengthens ${chamber.system} without blocking campaign progress.`,
    }
  }

  if (rating === 'Resonant' && chamber.harmonic) {
    return {
      campaignCanContinue: !chamber.optional,
      endgameOptionStrength: 2,
      extraMusicLayer: true,
      outcome: 'Harmonic',
      rating,
      seedArrangement: 'especially elegant',
      systemOnline: !chamber.optional,
      text: `Harmonic outcome: ${chamber.title} preserves an especially elegant seed arrangement and strengthens endgame options for ${chamber.system}.`,
    }
  }

  if (rating === 'Resonant') {
    const materialYield = Object.keys(chamber.rewards?.materials ?? {}).length > 0
    const seedTrait = Boolean(chamber.rewards?.seeds?.length || chamber.requiresGraft || chamber.researchReveal?.kind === 'trait')
    return {
      campaignCanContinue: !chamber.optional,
      extraMusicLayer: true,
      outcome: 'Flourishing',
      rating,
      resourceYield: materialYield,
      seedTrait,
      systemOnline: !chamber.optional,
      text: `Flourishing outcome: ${chamber.title} contributes an extra ${chamber.system} music layer${materialYield ? ', resource yield' : ''}${seedTrait ? ', or seed trait' : ''}.`,
    }
  }

  if (rating === 'Wild') {
    return {
      campaignCanContinue: !chamber.optional,
      outcome: 'Wild',
      rating,
      rareMutationId: `${chamber.id}-wild-mutation`,
      systemOnline: !chamber.optional,
      unusualEndingMaterial: true,
      text: `Wild outcome: ${chamber.title} preserves accepted instability as rare mutation ${chamber.id}-wild-mutation and embersap endgame mutation material.`,
    }
  }

  return {
    campaignCanContinue: false,
    outcome: rating,
    rating,
    requiredSystem: !chamber.optional,
    systemOnline: false,
    text: `${rating} outcome: ${chamber.title} restored; review rating details for progression effects.`,
  }
}

const ratingOrder = ['Dormant', 'Restored', 'Stable', 'Wild', 'Resonant']

function strongerRating(currentRating, targetRating) {
  const currentIndex = ratingOrder.indexOf(currentRating ?? 'Restored')
  const targetIndex = ratingOrder.indexOf(targetRating ?? 'Stable')
  if (targetIndex === -1) return currentRating ?? 'Restored'
  if (currentIndex === -1) return targetRating
  return targetIndex > currentIndex ? targetRating : currentRating
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
  if (rating === 'Wild') {
    const mutationId = `${chamber.id}-wild-mutation`
    next.materials.embersap = (next.materials.embersap ?? 0) + 1
    next.wildMutationIds = next.wildMutationIds ?? []
    if (!next.wildMutationIds.includes(mutationId)) next.wildMutationIds.push(mutationId)
  }
  if (chamber.contractType === 'stabilization' && chamber.stabilization?.improvesChamberId) {
    const improvedId = chamber.stabilization.improvesChamberId
    next.ratings[improvedId] = strongerRating(next.ratings[improvedId], chamber.stabilization.targetRating)
  }
  return next
}

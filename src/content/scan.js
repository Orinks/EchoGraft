import { chamberMovementBounds } from './player.js'
import { chamberSubstrate, substrateMutationChance } from './planting.js'

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function scanPulse(player, target = {}, chamber = {}) {
  const scanRange = chamber.scanRange ?? 8
  const dx = (target.x ?? 0) - player.x
  const dy = (target.y ?? 0) - player.y
  const distance = Math.hypot(dx, dy)
  const horizontal = dx < 0 ? 'west' : dx > 0 ? 'east' : 'center'
  const vertical = dy < 0 ? 'south' : dy > 0 ? 'north' : 'level'
  const side = dx < 0 ? 'left' : dx > 0 ? 'right' : 'centered'
  const inRange = distance <= scanRange
  const brightness = clamp(1 - distance / scanRange)
  const duration = clamp(0.16 + distance * 0.04, 0.18, 0.65)
  const delayTrail = [0, 0.04 + distance * 0.012, 0.09 + distance * 0.018].map((value) => Number(value.toFixed(3)))
  const windEcho = chamber.windEcho ? windCarriedEcho(chamber.windEcho, distance) : undefined

  return {
    brightness,
    delayTrail,
    direction: { dx, dy, horizontal, side, vertical },
    distance,
    duration,
    inRange,
    range: scanRange,
    text: `Scan pulse: ${distance.toFixed(1)} steps, ${horizontal}, ${vertical}; range ${scanRange} step(s), ${inRange ? 'in range' : 'beyond range'}; delay trail ${delayTrail.join('/')}.${windEcho ? ` ${windEcho.text}` : ''}`,
    windEcho,
  }
}

export function scanRangeState(save = {}) {
  const intakeOnline = save.restoredSystems?.includes('Intake') || save.restoredSystems?.includes('Intake lung')
  const range = intakeOnline ? 12 : 8

  return {
    intakeOnline,
    range,
    text: intakeOnline
      ? `Intake scan range unlocked: objective scans reach ${range} steps.`
      : `Base scan range: objective scans reach ${range} steps until Intake comes online.`,
  }
}

export function heartScanState(player, chamber = {}, scanRange = chamber.scanRange ?? 8) {
  const pulse = scanPulse(player, chamber.target, { ...chamber, scanRange })
  const objective = chamber.objective ?? 'Restore the chamber heart.'

  return {
    direction: pulse.direction,
    distance: pulse.distance,
    objective,
    pulse,
    text: `Heart scan: direction ${pulse.direction.horizontal}, ${pulse.direction.vertical} (${pulse.direction.side}); distance ${pulse.distance.toFixed(1)} step(s); objective ${objective}`,
  }
}

export function boundaryScanState(player, chamber = {}) {
  const edges = chamberMovementBounds(chamber)
  const safeReturnPoint = chamber.returnPoint ?? chamber.start ?? { x: 0, y: 0 }
  const exits = chamber.exits ?? [{ id: 'safe-return', name: 'safe return point', position: safeReturnPoint }]
  const exitText = exits.map((exit) => `${exit.name ?? exit.id ?? 'exit'} ${exit.position.x}, ${exit.position.y}`).join('; ')

  return {
    edges,
    exits,
    safeReturnPoint,
    text: `Boundary scan: chamber edges west ${edges.west}, east ${edges.east}, south ${edges.south}, north ${edges.north}. Exits: ${exitText}. Safe return point ${safeReturnPoint.x}, ${safeReturnPoint.y}. Current position ${player.x}, ${player.y}.`,
  }
}

export function seedPositionState(seed = {}, chamber = {}) {
  const position = seed.position ?? { x: 0, y: 0 }
  const target = chamber.target ?? { x: 0, y: 0 }
  const offset = { dx: Number((position.x - target.x).toFixed(3)), dy: Number((position.y - target.y).toFixed(3)) }
  const distance = Number(Math.hypot(offset.dx, offset.dy).toFixed(3))
  const tolerance = chamber.tolerances?.position
  const withinTolerance = Number.isFinite(tolerance) ? distance <= tolerance : undefined

  return {
    distance,
    offset,
    position,
    tolerance,
    withinTolerance,
    text: `Position: ${position.x}, ${position.y}; heart offset ${offset.dx}, ${offset.dy}; distance ${distance} step(s)${Number.isFinite(tolerance) ? `; ${withinTolerance ? 'inside' : 'outside'} position tolerance ${tolerance}` : ''}.`,
  }
}

export function seedFamilyScanState(seed = {}) {
  const family = seed.family ?? 'unknown family'
  const affinity = seed.ecologicalAffinity ?? 'unmapped ecology'
  const origin = seed.discoveredOrigin ?? 'unknown origin'

  return {
    affinity,
    family,
    origin,
    text: `Seed family: ${family}; affinity ${affinity}; discovered origin ${origin}.`,
  }
}

function tuningDelta(value, target) {
  if (!Number.isFinite(value) || !Number.isFinite(target)) return undefined
  return Number((value - target).toFixed(3))
}

export function seedTuningScanState(seed = {}, chamber = {}) {
  const target = chamber.target ?? {}
  const traits = {
    brightness: seed.brightness ?? 0,
    phase: seed.phase ?? 0,
    pitchRatio: seed.pitchRatio ?? 1,
    pulseRate: seed.pulseRate ?? 1,
    waveform: seed.waveform ?? 'sine',
  }
  const deltas = {
    brightness: tuningDelta(traits.brightness, target.brightness),
    phase: tuningDelta(traits.phase, target.phase),
    pitchRatio: tuningDelta(traits.pitchRatio, target.pitchRatio),
    pulseRate: tuningDelta(traits.pulseRate, target.pulseRate),
  }
  const lockedTraits = seed.lockedTraits ?? []

  return {
    deltas,
    lockedTraits,
    traits,
    text: `Tuning state: pitch ${traits.pitchRatio}${Number.isFinite(deltas.pitchRatio) ? ` (delta ${deltas.pitchRatio})` : ''}, pulse ${traits.pulseRate}${Number.isFinite(deltas.pulseRate) ? ` (delta ${deltas.pulseRate})` : ''}, brightness ${traits.brightness}${Number.isFinite(deltas.brightness) ? ` (delta ${deltas.brightness})` : ''}, phase ${traits.phase}${Number.isFinite(deltas.phase) ? ` (delta ${deltas.phase})` : ''}, waveform ${traits.waveform}; locked traits ${lockedTraits.length ? lockedTraits.join(', ') : 'none'}.`,
  }
}

export function seedBrightnessFilterScanState(seed = {}, chamber = {}) {
  const brightness = clamp(Number(seed.brightness ?? 0.5), 0, 1)
  const target = chamber.target?.brightness
  const delta = tuningDelta(brightness, target)
  const tolerance = chamber.tolerances?.brightness
  const withinTolerance = Number.isFinite(tolerance) && Number.isFinite(delta) ? Math.abs(delta) <= tolerance : undefined
  const cutoffHz = Math.round(600 + brightness * 5600)
  const gates = []

  if (chamber.photosynthesis) {
    const minBrightness = chamber.photosynthesis.minBrightness
    gates.push({
      active: brightness >= minBrightness,
      kind: 'photosynthesis',
      text: `photosynthesis needs ${minBrightness}`,
    })
  }

  if (chamber.thermalShutters) {
    const { maxBrightness, minBrightness } = chamber.thermalShutters
    gates.push({
      active: brightness >= minBrightness && brightness <= maxBrightness,
      kind: 'thermal shutters',
      text: `thermal shutters need ${minBrightness}-${maxBrightness}`,
    })
  }

  if (chamber.timbrePuzzle) {
    const minBrightness = chamber.timbrePuzzle.minBrightness
    const waveform = seed.waveform ?? 'sine'
    const waveforms = chamber.timbrePuzzle.waveforms ?? []
    gates.push({
      active: brightness >= minBrightness && waveforms.includes(waveform),
      kind: 'brightness/timbre',
      text: `brightness/timbre needs ${minBrightness} with ${waveforms.join(' or ') || 'any'} timbre`,
    })
  }

  const gateText = gates.length
    ? gates.map((gate) => `${gate.text}, ${gate.active ? 'open' : 'closed'}`).join('; ')
    : 'no chamber brightness gate'
  const toleranceText = Number.isFinite(tolerance) && Number.isFinite(delta)
    ? `; ${withinTolerance ? 'inside' : 'outside'} filter tolerance ${tolerance}`
    : ''

  return {
    brightness,
    cutoffHz,
    delta,
    gates,
    target,
    tolerance,
    withinTolerance,
    text: `Brightness/filter: ${brightness}${Number.isFinite(target) ? `; target ${target} (delta ${delta})` : ''}${toleranceText}; filter cutoff about ${cutoffHz} Hz; ${gateText}.`,
  }
}

export function seedEnvelopeShapeScanState(seed = {}) {
  const envelope = {
    attack: clamp(Number(seed.envelope?.attack ?? 0.02), 0.01, 0.25),
    decay: clamp(Number(seed.envelope?.decay ?? 0.12), 0.04, 0.5),
    sustain: clamp(Number(seed.envelope?.sustain ?? 0.5), 0.1, 1),
    release: clamp(Number(seed.envelope?.release ?? 0.25), 0.05, 1),
  }
  const bloom = envelope.attack <= 0.03 ? 'quick bloom' : envelope.attack >= 0.12 ? 'slow bloom' : 'medium bloom'
  const body = envelope.sustain >= 0.7 ? 'full body' : envelope.sustain <= 0.35 ? 'thin body' : 'balanced body'
  const tail = envelope.release >= 0.35 ? 'long tail' : envelope.release <= 0.12 ? 'short tail' : 'medium tail'

  return {
    body,
    bloom,
    envelope,
    tail,
    text: `Envelope shape: attack ${envelope.attack}, decay ${envelope.decay}, sustain ${envelope.sustain}, release ${envelope.release}; ${bloom}, ${body}, ${tail}.`,
  }
}

export function seedFmDepthScanState(seed = {}) {
  const fmDepth = clamp(Number(seed.fmAmount ?? 0), 0, 1)
  const band = fmDepth >= 0.67 ? 'deep FM grit' : fmDepth >= 0.34 ? 'medium FM edge' : fmDepth > 0 ? 'light FM shimmer' : 'no FM depth'
  const carrier = seed.oscillatorType === 'fm' ? 'primary FM synth route' : 'secondary modulation layer'

  return {
    band,
    carrier,
    fmDepth,
    text: `FM depth: ${fmDepth}; ${band}; ${carrier}.`,
  }
}

export function seedAmDepthScanState(seed = {}) {
  const amDepth = clamp(Number(seed.amAmount ?? 0), 0, 1)
  const band = amDepth >= 0.67 ? 'deep AM current' : amDepth >= 0.34 ? 'medium AM sway' : amDepth > 0 ? 'light AM tremble' : 'no AM depth'
  const carrier = seed.oscillatorType === 'am' ? 'primary AM synth route' : 'secondary amplitude layer'

  return {
    amDepth,
    band,
    carrier,
    text: `AM depth: ${amDepth}; ${band}; ${carrier}.`,
  }
}

export function seedNoiseAmountScanState(seed = {}) {
  const noiseAmount = clamp(Number(seed.noiseAmount ?? 0), 0, 1)
  const texture = noiseAmount >= 0.67 ? 'dense noise veil' : noiseAmount >= 0.34 ? 'textured breath layer' : noiseAmount > 0 ? 'light breath grain' : 'clean tone'
  const carrier = seed.oscillatorType === 'noise-kissed' ? 'primary noise-kissed synth route' : 'secondary masking layer'

  return {
    carrier,
    noiseAmount,
    texture,
    text: `Noise amount: ${noiseAmount}; ${texture}; ${carrier}.`,
  }
}

export function seedSubstrateScanState(seed = {}, chamber = {}) {
  const substrate = seed.chamberSubstrate ?? chamberSubstrate(chamber)
  const mutationChance = seed.mutationChance ?? substrateMutationChance(substrate)

  return {
    mutationChance,
    substrate,
    text: `Chamber substrate: ${substrate}; ${mutationChance.text}`,
  }
}

export function seedNearbyInteractionState(seed = {}, plantedSeeds = []) {
  const position = seed.position ?? { x: 0, y: 0 }
  const nearby = plantedSeeds
    .filter((other) => other !== seed)
    .map((other) => {
      const otherPosition = other.position ?? { x: 0, y: 0 }
      return {
        distance: Number(Math.hypot(otherPosition.x - position.x, otherPosition.y - position.y).toFixed(3)),
        family: other.family ?? 'unknown family',
        name: other.name ?? other.id ?? 'unknown seed',
        position: otherPosition,
      }
    })
    .filter((other) => other.distance <= 2)
    .sort((a, b) => a.distance - b.distance)

  return {
    nearby,
    radius: 2,
    text: `Nearby seed interactions: ${nearby.length ? nearby.map((other) => `${other.name} (${other.family}) ${other.distance} step(s) away`).join(', ') : 'none within 2 steps'}.`,
  }
}

export function seedScanState(plantedSeeds = [], chamber = {}) {
  const seeds = plantedSeeds.map((seed) => ({
    amDepthState: seedAmDepthScanState(seed),
    brightnessFilterState: seedBrightnessFilterScanState(seed, chamber),
    envelopeShapeState: seedEnvelopeShapeScanState(seed),
    family: seed.family ?? 'unknown family',
    familyState: seedFamilyScanState(seed),
    fmDepthState: seedFmDepthScanState(seed),
    name: seed.name ?? seed.id ?? 'unknown seed',
    nearbyState: seedNearbyInteractionState(seed, plantedSeeds),
    noiseAmountState: seedNoiseAmountScanState(seed),
    position: seed.position ?? { x: 0, y: 0 },
    positionState: seedPositionState(seed, chamber),
    substrateState: seedSubstrateScanState(seed, chamber),
    tuningState: seedTuningScanState(seed, chamber),
  }))

  return {
    count: seeds.length,
    seeds,
    text: seeds.length
      ? `Seed scan: ${seeds.map((seed) => `${seed.name} at ${seed.position.x}, ${seed.position.y}; ${seed.positionState.text} ${seed.familyState.text} ${seed.substrateState.text} ${seed.nearbyState.text} ${seed.brightnessFilterState.text} ${seed.envelopeShapeState.text} ${seed.fmDepthState.text} ${seed.amDepthState.text} ${seed.noiseAmountState.text} ${seed.tuningState.text}`).join('; ')}.`
      : 'Seed scan: no planted seed objects in this chamber.',
  }
}

function hazardAxis(hazard = {}) {
  if (Number.isFinite(hazard.pitchRatio)) return { label: 'pitch', key: 'pitchRatio', value: hazard.pitchRatio }
  if (Number.isFinite(hazard.pulseRate)) return { label: 'pulse', key: 'pulseRate', value: hazard.pulseRate }
  if (Number.isFinite(hazard.brightness)) return { label: 'brightness', key: 'brightness', value: hazard.brightness }
  if (Number.isFinite(hazard.phase)) return { label: 'phase', key: 'phase', value: hazard.phase }
  return { label: 'unknown', key: 'unknown', value: 0 }
}

export function hazardScanState(chamber = {}, plantedSeeds = []) {
  const hazards = (chamber.hazards ?? []).map((hazard) => {
    const axis = hazardAxis(hazard)
    const radius = hazard.radius ?? 0
    const lower = Number((axis.value - radius).toFixed(3))
    const upper = Number((axis.value + radius).toFixed(3))
    const breaches = plantedSeeds
      .filter((seed) => Number.isFinite(seed[axis.key]) && Math.abs(seed[axis.key] - axis.value) <= radius)
      .map((seed) => ({
        name: seed.name ?? seed.id ?? 'unknown seed',
        position: seed.position ?? { x: 0, y: 0 },
        value: seed[axis.key],
      }))

    return {
      axis,
      breaches,
      lower,
      message: hazard.message ?? 'Unstable ecology detected.',
      radius,
      upper,
    }
  })
  const unsafeZones = hazards.flatMap((hazard) =>
    hazard.breaches.map((breach) => `${breach.name} at ${breach.position.x}, ${breach.position.y} inside ${hazard.axis.label} ${hazard.lower}-${hazard.upper}`),
  )

  return {
    count: hazards.length,
    hazards,
    unsafeZones,
    text: hazards.length
      ? `Hazard scan: forbidden intervals ${hazards.map((hazard) => `${hazard.axis.label} ${hazard.lower}-${hazard.upper}: ${hazard.message}`).join('; ')}. Unsafe zones: ${unsafeZones.length ? unsafeZones.join('; ') : 'none occupied by planted seeds'}.`
      : 'Hazard scan: no forbidden intervals or unsafe zones detected in this chamber.',
  }
}

function recordTitle(records = {}, id) {
  return records[id]?.title ?? id
}

export function memoryScanState(chamber = {}, save = {}, records = {}) {
  const recoveredIds = save.codexIds ?? []
  const recovered = new Set(recoveredIds)
  const chamberRecordIds = chamber.rewards?.codex ?? []
  const chamberRecords = chamberRecordIds.map((id) => ({
    id,
    recovered: recovered.has(id),
    title: recordTitle(records, id),
  }))
  const pending = chamberRecords.filter((record) => !record.recovered)
  const restoredSystems = save.restoredSystems ?? []
  const solved = new Set(save.solvedChambers ?? [])
  const memoryOnline = restoredSystems.includes('Memory') || restoredSystems.includes('Memory Orchard') || solved.has('phase')
  const hiddenEchoes = memoryOnline ? pending : []
  const recoveredText = recoveredIds.length
    ? recoveredIds.map((id) => recordTitle(records, id)).join(', ')
    : 'none recovered yet'
  const chamberText = chamberRecords.length
    ? chamberRecords.map((record) => `${record.title} ${record.recovered ? 'recovered' : 'hidden'}`).join('; ')
    : 'no chamber record hooks declared'
  const hiddenText = memoryOnline
    ? hiddenEchoes.length
      ? `${hiddenEchoes.map((record) => record.title).join(', ')} audible before restoration`
      : 'no hidden echoes remain in this chamber'
    : 'locked until Quiet Mirror or Memory Orchard comes online'

  return {
    chamberRecords,
    hiddenEchoes,
    memoryOnline,
    recoveredCount: recoveredIds.length,
    text: `Memory scan: records ${recoveredText}. Chamber records: ${chamberText}. Hidden echoes: ${hiddenText}.`,
  }
}

export function networkScanState(network = {}, heart = {}, finalChord = {}) {
  const nodes = network.nodes ?? []
  const onlineNodes = network.onlineNodes ?? nodes.filter((node) => node.online)
  const offlineNodes = nodes.filter((node) => !node.online)
  const strongest = [...onlineNodes].sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0))[0]
  const chordSystems = finalChord.systems ?? []

  return {
    chordSystems,
    heartOnline: Boolean(heart.heartOnline),
    offlineNodes,
    onlineNodes,
    readyForFinale: Boolean(network.readyForFinale),
    strongest,
    totalStrength: network.totalStrength ?? 0,
    text: `Network scan: endgame multi-chamber resonance ${network.readyForFinale ? 'ready' : 'building'}; ${onlineNodes.length} online system(s), ${offlineNodes.length} offline; strength ${network.totalStrength ?? 0}. Heart ${heart.heartOnline ? 'online' : 'locked'}; endings ${heart.endingsUnlocked ? 'available' : 'not ready'}. ${strongest ? `Strongest system ${strongest.system} strength ${strongest.strength}.` : 'No restored system voices online yet.'} Final chord systems: ${chordSystems.length ? chordSystems.join(', ') : 'none recorded yet'}.`,
  }
}

export function navigationScanState(save = {}) {
  const navigationOnline = save.restoredSystems?.includes('Navigation') || save.restoredSystems?.includes('Navigation grove')

  return {
    navigationOnline,
    text: navigationOnline
      ? 'Navigation scan unlocked: objective scans include chamber compass cues and atlas comparison bearings.'
      : 'Navigation offline: objective scans use local heart cues until Navigation Grove comes online.',
  }
}

export function chamberCompassCue(player, target = {}) {
  const dx = (target.x ?? 0) - player.x
  const dy = (target.y ?? 0) - player.y
  const bearing = Math.abs(dx) >= Math.abs(dy)
    ? dx < 0 ? 'west' : dx > 0 ? 'east' : 'center'
    : dy < 0 ? 'south' : 'north'

  return {
    bearing,
    offset: { dx, dy },
    text: `Navigation compass cue: chamber heart bears ${bearing}; offset ${dx}, ${dy}.`,
  }
}

export function windCarriedEcho(windEcho, distance = 0) {
  const horizontal = windEcho.dx < 0 ? 'west' : windEcho.dx > 0 ? 'east' : 'center'
  const vertical = windEcho.dy < 0 ? 'south' : windEcho.dy > 0 ? 'north' : 'level'
  const carriedDelay = Number((0.12 + distance * 0.02 + Math.hypot(windEcho.dx, windEcho.dy) * 0.05).toFixed(3))

  return {
    carriedDelay,
    direction: { dx: windEcho.dx, dy: windEcho.dy, horizontal, vertical },
    name: windEcho.name,
    text: `Wind-carried echo: ${windEcho.name}, ${horizontal}, ${vertical}, delayed ${carriedDelay}. ${windEcho.text}.`,
  }
}

import { chamberMovementBounds } from './player.js'

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

export function seedScanState(plantedSeeds = [], chamber = {}) {
  const seeds = plantedSeeds.map((seed) => ({
    family: seed.family ?? 'unknown family',
    name: seed.name ?? seed.id ?? 'unknown seed',
    position: seed.position ?? { x: 0, y: 0 },
    positionState: seedPositionState(seed, chamber),
    traits: {
      brightness: seed.brightness ?? 0,
      phase: seed.phase ?? 0,
      pitchRatio: seed.pitchRatio ?? 1,
      pulseRate: seed.pulseRate ?? 1,
      waveform: seed.waveform ?? 'sine',
    },
  }))

  return {
    count: seeds.length,
    seeds,
    text: seeds.length
      ? `Seed scan: ${seeds.map((seed) => `${seed.name} at ${seed.position.x}, ${seed.position.y}; ${seed.positionState.text} family ${seed.family}; traits pitch ${seed.traits.pitchRatio}, pulse ${seed.traits.pulseRate}, brightness ${seed.traits.brightness}, phase ${seed.traits.phase}, waveform ${seed.traits.waveform}`).join('; ')}.`
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

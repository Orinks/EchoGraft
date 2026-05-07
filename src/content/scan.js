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

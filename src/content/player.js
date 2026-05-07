export const movementSafeRadius = 5

export function createPlayer(start = { x: 0, y: 0, facing: 0 }) {
  return { x: start.x, y: start.y, facing: start.facing }
}

export function chamberMovementBounds(chamber = {}) {
  const start = chamber.start ?? { x: 0, y: 0 }
  return {
    east: start.x + movementSafeRadius,
    north: start.y + movementSafeRadius,
    south: start.y - movementSafeRadius,
    west: start.x - movementSafeRadius,
  }
}

function clampPosition(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function chamberCurrent(chamber = {}) {
  if (!chamber.current) return null
  return {
    dx: Math.sign(chamber.current.dx ?? 0),
    dy: Math.sign(chamber.current.dy ?? 0),
    name: chamber.current.name ?? 'water current',
    text: chamber.current.text ?? 'through the chamber',
  }
}

export function waterSystemState(save = {}) {
  const waterOnline = save.restoredSystems?.includes('Water') || save.restoredSystems?.includes('Water pumps')

  return {
    waterOnline,
    text: waterOnline
      ? 'Water current navigation unlocked: restored flow can route Rootworks contracts.'
      : 'Water offline: currents remain local until Water Pumps come online.',
  }
}

export function waterRoutedChamber(chamber = {}, save = {}) {
  const system = chamber.system?.toLowerCase() ?? ''
  const water = waterSystemState(save)
  if (chamber.current || !water.waterOnline || !system.includes('root')) return chamber

  return {
    ...chamber,
    current: {
      dx: 0,
      dy: 1,
      name: 'restored water route',
      text: 'north through the root contract channel',
    },
  }
}

function currentEffect(dx, dy, current) {
  if (!current) return { dx: 0, dy: 0, state: 'none' }

  const dot = (dx * current.dx) + (dy * current.dy)
  if (dot < 0) return { dx: 0, dy: 0, state: 'against' }
  if (dot > 0) return { dx: current.dx, dy: current.dy, state: 'with' }
  return { dx: 0, dy: 0, state: 'cross' }
}

export function movePlayer(player, dx, dy, chamber) {
  if (!chamber) {
    return { ...player, x: player.x + dx, y: player.y + dy }
  }

  const bounds = chamberMovementBounds(chamber)
  const current = chamberCurrent(chamber)
  const flow = currentEffect(dx, dy, current)
  return {
    ...player,
    x: clampPosition(player.x + dx + flow.dx, bounds.west, bounds.east),
    y: clampPosition(player.y + dy + flow.dy, bounds.south, bounds.north),
  }
}

export function movementSurface(chamber = {}) {
  const system = chamber.system?.toLowerCase() ?? ''
  if (system.includes('water')) return 'wet channel tile'
  if (system.includes('canopy')) return 'leafglass lattice'
  if (system.includes('root') || system.includes('mycel')) return 'rootfelt floor'
  if (system.includes('memory')) return 'archive loam'
  if (system.includes('heart')) return 'resonant heartwood'
  if (system.includes('navigation')) return 'compass rail'
  return 'intake deck'
}

export function movementFeedback(player, previous, chamber = {}) {
  const bounds = chamberMovementBounds(chamber)
  const target = chamber.target ?? { x: 0, y: 0 }
  const exitPosition = chamber.exit?.position ?? chamber.returnPoint ?? chamber.start ?? { x: 0, y: 0 }
  const nearestWall = Math.min(player.x - bounds.west, bounds.east - player.x, player.y - bounds.south, bounds.north - player.y)
  const exitDistance = Math.hypot(exitPosition.x - player.x, exitPosition.y - player.y)
  const heartDistance = Math.hypot(target.x - player.x, target.y - player.y)
  const surface = movementSurface(chamber)
  const moved = player.x !== previous.x || player.y !== previous.y
  const current = chamberCurrent(chamber)
  const intended = { dx: Math.sign(player.x - previous.x), dy: Math.sign(player.y - previous.y) }
  const flow = currentEffect(intended.dx, intended.dy, current)
  const currentText = current
    ? `${current.name} ${flow.state === 'with' ? 'assisted this step' : flow.state === 'against' ? 'pressed against this step' : 'runs nearby'}, ${current.text}`
    : 'current between start and heart'

  return {
    bounds,
    currentPosition: {
      x: (chamber.start?.x ?? 0) + (target.x - (chamber.start?.x ?? 0)) / 2,
      y: (chamber.start?.y ?? 0) + (target.y - (chamber.start?.y ?? 0)) / 2,
    },
    footstepPosition: {
      x: player.x,
      y: player.y,
    },
    exitDistance,
    exitPosition,
    heartDistance,
    moved,
    nearestWall,
    surface,
    text: `${moved ? 'Moved' : 'Boundary held'} to ${player.x}, ${player.y}. Facing ${player.facing} degrees. Movement audio: spatial footstep, wall ${nearestWall.toFixed(1)} steps away, current ${currentText}, landmark heart ${heartDistance.toFixed(1)} steps away, surface ${surface}.`,
  }
}

export function rotatePlayer(player, degrees) {
  return { ...player, facing: (player.facing + degrees + 360) % 360 }
}

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

export function movePlayer(player, dx, dy, chamber) {
  if (!chamber) {
    return { ...player, x: player.x + dx, y: player.y + dy }
  }

  const bounds = chamberMovementBounds(chamber)
  return {
    ...player,
    x: clampPosition(player.x + dx, bounds.west, bounds.east),
    y: clampPosition(player.y + dy, bounds.south, bounds.north),
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
  const nearestWall = Math.min(player.x - bounds.west, bounds.east - player.x, player.y - bounds.south, bounds.north - player.y)
  const heartDistance = Math.hypot(target.x - player.x, target.y - player.y)
  const surface = movementSurface(chamber)
  const moved = player.x !== previous.x || player.y !== previous.y

  return {
    bounds,
    currentPosition: {
      x: (chamber.start?.x ?? 0) + (target.x - (chamber.start?.x ?? 0)) / 2,
      y: (chamber.start?.y ?? 0) + (target.y - (chamber.start?.y ?? 0)) / 2,
    },
    heartDistance,
    moved,
    nearestWall,
    surface,
    text: `${moved ? 'Moved' : 'Boundary held'} to ${player.x}, ${player.y}. Facing ${player.facing} degrees. Movement audio: spatial footstep, wall ${nearestWall.toFixed(1)} steps away, current between start and heart, landmark heart ${heartDistance.toFixed(1)} steps away, surface ${surface}.`,
  }
}

export function rotatePlayer(player, degrees) {
  return { ...player, facing: (player.facing + degrees + 360) % 360 }
}

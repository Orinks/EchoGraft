export function createPlayer(start = { x: 0, y: 0, facing: 0 }) {
  return { x: start.x, y: start.y, facing: start.facing }
}

export function movePlayer(player, dx, dy) {
  return { ...player, x: player.x + dx, y: player.y + dy }
}

export function rotatePlayer(player, degrees) {
  return { ...player, facing: (player.facing + degrees + 360) % 360 }
}

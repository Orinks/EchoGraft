function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function scanPulse(player, target = {}) {
  const dx = (target.x ?? 0) - player.x
  const dy = (target.y ?? 0) - player.y
  const distance = Math.hypot(dx, dy)
  const horizontal = dx < 0 ? 'west' : dx > 0 ? 'east' : 'center'
  const vertical = dy < 0 ? 'south' : dy > 0 ? 'north' : 'level'
  const side = dx < 0 ? 'left' : dx > 0 ? 'right' : 'centered'
  const brightness = clamp(1 - distance / 8)
  const duration = clamp(0.16 + distance * 0.04, 0.18, 0.65)
  const delayTrail = [0, 0.04 + distance * 0.012, 0.09 + distance * 0.018].map((value) => Number(value.toFixed(3)))

  return {
    brightness,
    delayTrail,
    direction: { dx, dy, horizontal, side, vertical },
    distance,
    duration,
    text: `Scan pulse: ${distance.toFixed(1)} steps, ${horizontal}, ${vertical}; delay trail ${delayTrail.join('/')}.`,
  }
}

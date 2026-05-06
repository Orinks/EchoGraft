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

export function evaluateResonance(chamber, plantedSeeds) {
  if (plantedSeeds.length < chamber.requiredSeeds) {
    return { solved: false, score: 0, missing: [`Plant ${chamber.requiredSeeds - plantedSeeds.length} more seed(s).`] }
  }

  const ecology = averageSeeds(plantedSeeds)
  const checks = [
    ['position', distance(ecology.position, chamber.target), chamber.tolerances.position, 'Move planted seed position closer to the heart.'],
    ['pitchRatio', Math.abs(ecology.pitchRatio - chamber.target.pitchRatio), chamber.tolerances.pitchRatio, 'Tune pitch ratio closer to the chamber heart.'],
    ['pulseRate', Math.abs(ecology.pulseRate - chamber.target.pulseRate), chamber.tolerances.pulseRate, 'Tune pulse rate closer to the chamber rhythm.'],
    ['brightness', Math.abs(ecology.brightness - chamber.target.brightness), chamber.tolerances.brightness, 'Tune filter brightness closer to the chamber timbre.'],
    ['phase', phaseDistance(ecology.phase, chamber.target.phase), chamber.tolerances.phase, 'Tune phase closer to the cancellation point.'],
  ]

  const missing = checks.filter(([, value, tolerance]) => value > tolerance).map(([, , , message]) => message)

  if (chamber.requiresGraft && !ecology.grafted) missing.push('Create and plant a grafted seed.')
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
  }
}

export function unlockNext(chambers, solvedIds) {
  const solved = new Set(solvedIds)
  return chambers.filter((chamber, index) => index === 0 || solved.has(chambers[index - 1].id)).map((chamber) => chamber.id)
}

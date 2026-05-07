content.game = (() => {
  const mission = {
    title: 'Mission: Restart the Verdancy Ark',
    premise: 'The Ark has one night of breathable air left. Restore each resonance heart so the sleeping greenhouse can feed its crew again.',
    completion: 'Mission complete. The Ark can grow food, clean air, and wake the crew.',
  }

  const chambers = [
    {
      id: 'tutorial',
      title: 'Tutorial: First Breath',
      directive: 'Stabilize the intake lung.',
      restoredSystem: 'Intake lung',
      objective: 'Plant a matching seed at the chamber heart to restart oxygen flow.',
      start: {x: 0, y: -2, facing: 0},
      target: {x: 0, y: 0, pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0},
    },
    {
      id: 'direction',
      title: 'Directional Bloom',
      directive: 'Wake the navigation grove.',
      restoredSystem: 'Navigation grove',
      objective: 'Use scan direction and place the seed east of the heart to point the Ark back toward sunlight.',
      start: {x: -2, y: 0, facing: 90},
      target: {x: 2, y: 0, pitchRatio: 1.25, pulseRate: 1.5, brightness: 0.6, phase: 45},
    },
  ]

  const seeds = [
    {name: 'Lumen phonoseed', pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0, waveform: 'sine'},
    {name: 'Verdant phonoseed', pitchRatio: 1.25, pulseRate: 1.5, brightness: 0.6, phase: 45, waveform: 'triangle'},
  ]

  let chamberIndex = 0,
    eventLog = [],
    plantedSeeds = [],
    player = {...chambers[0].start},
    selectedSeed = 0,
    solved = false

  function chamber() {
    return chambers[chamberIndex]
  }

  function progress() {
    const restored = chambers.slice(0, chamberIndex).length + (solved ? 1 : 0)
    return {restored, total: chambers.length, percent: Math.round(restored / chambers.length * 100)}
  }

  function currentSeed() {
    return seeds[selectedSeed] || seeds[0]
  }

  function log(message) {
    eventLog.unshift(message)
    eventLog = eventLog.slice(0, 8)
    return message
  }

  function resonance() {
    if (!plantedSeeds.length) return {score: 0, solved: false, message: 'Plant a seed at the chamber heart.'}

    const seed = plantedSeeds[0]
    const target = chamber().target
    const distance = Math.hypot(seed.position.x - target.x, seed.position.y - target.y)
    const pitch = Math.abs(seed.pitchRatio - target.pitchRatio)
    const pulse = Math.abs(seed.pulseRate - target.pulseRate)
    const score = Math.max(0, 1 - distance * 0.25 - pitch - pulse * 0.25)
    return {
      score,
      solved: score >= 0.88,
      message: score >= 0.88 ? `${chamber().title} solved. The garden blooms.` : `Resonance ${Math.round(score * 100)} percent. Keep listening.`,
    }
  }

  return {
    chamber,
    currentSeed,
    get: () => ({chamber: chamber(), eventLog, mission, plantedSeeds, player, progress: progress(), selectedSeed, solved}),
    graft: function () {
      content.cues.success()
      return log('Grafted the first two seed patterns into a brighter hybrid voice.')
    },
    move: function (dx, dy) {
      player = {...player, x: player.x + dx, y: player.y + dy}
      content.cues.move(player)
      return log(`Moved to ${player.x}, ${player.y}.`)
    },
    next: function () {
      chamberIndex = Math.min(chambers.length - 1, chamberIndex + 1)
      player = {...chamber().start}
      plantedSeeds = []
      solved = false
      content.music.start('game', {chamber: chamber(), score: 0})
      return log(`${chamber().title}. ${chamber().directive} ${chamber().objective}`)
    },
    advance: function () {
      if (!solved) return log(`Not yet. ${chamber().restoredSystem} is still offline. Solve this chamber before advancing.`)
      if (chamberIndex >= chambers.length - 1) {
        content.cues.success()
        return log(mission.completion)
      }
      return this.next()
    },
    plant: function () {
      const seed = {...currentSeed(), position: {x: player.x, y: player.y}}
      plantedSeeds = [seed]
      content.cues.seed(seed)
      const result = resonance()
      solved = result.solved
      content.music.start('game', {chamber: chamber(), score: result.score})
      if (solved) content.cues.success()
      return log(solved ? `${chamber().restoredSystem} restored. ${result.message}` : result.message)
    },
    reset: function () {
      chamberIndex = 0
      player = {...chamber().start}
      plantedSeeds = []
      selectedSeed = 0
      solved = false
      eventLog = []
      content.music.start('game', {chamber: chamber(), score: 0})
      return log(`${mission.title}. ${mission.premise} ${chamber().title}. ${chamber().directive} ${chamber().objective}`)
    },
    scan: function () {
      const target = chamber().target
      const distance = Math.hypot(target.x - player.x, target.y - player.y).toFixed(1)
      const side = target.x < player.x ? 'left' : target.x > player.x ? 'right' : 'centered'
      content.cues.scan(player, target)
      return log(`Scan pulse: heart is ${distance} steps away, ${side}. Target pitch ${target.pitchRatio}, pulse ${target.pulseRate}.`)
    },
    selectSeed: function (direction = 1) {
      selectedSeed = (selectedSeed + direction + seeds.length) % seeds.length
      content.cues.menuMove()
      return log(`Selected ${currentSeed().name}.`)
    },
    seeds: () => seeds,
    tune: function (direction = 1) {
      const seed = currentSeed()
      seed.pitchRatio = Math.max(0.5, Math.min(2, Number((seed.pitchRatio + direction * 0.05).toFixed(2))))
      content.cues.seed(seed)
      return log(`Tuned ${seed.name}: pitch ${seed.pitchRatio}.`)
    },
  }
})()

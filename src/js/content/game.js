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
    {
      id: 'pulse',
      title: 'Pulse Trellis',
      directive: 'Restart the water pumps.',
      restoredSystem: 'Water pumps',
      objective: 'Tune Verdant higher and plant it at the pump heart so irrigation can move again.',
      start: {x: 0, y: -3, facing: 0},
      target: {x: 0, y: 0, pitchRatio: 1.35, pulseRate: 1.5, brightness: 0.6, phase: 45},
    },
    {
      id: 'canopy',
      title: 'Canopy Choir',
      directive: 'Open the photosynthetic canopy.',
      restoredSystem: 'Canopy lights',
      objective: 'Graft a brighter hybrid voice and plant it where the canopy heart can hear it.',
      start: {x: -1, y: -3, facing: 0},
      target: {x: 1, y: 1, pitchRatio: 1.12, pulseRate: 1.25, brightness: 0.52, phase: 22},
      requiresGraft: true,
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

  engine.seed.set('echograft-verdancy-ark')

  function chamber() {
    return chambers[chamberIndex]
  }

  function exportState() {
    return {
      chamberIndex,
      eventLog,
      plantedSeeds,
      player,
      seeds,
      selectedSeed,
      solved,
    }
  }

  function importState(data = {}) {
    chamberIndex = Math.max(0, Math.min(chambers.length - 1, data.chamberIndex || 0))
    eventLog = Array.isArray(data.eventLog) ? data.eventLog.slice(0, 8) : []
    plantedSeeds = Array.isArray(data.plantedSeeds) ? data.plantedSeeds : []
    player = data.player || {...chamber().start}
    if (Array.isArray(data.seeds)) {
      seeds.splice(0, seeds.length, ...data.seeds)
    }
    selectedSeed = Math.max(0, Math.min(seeds.length - 1, data.selectedSeed || 0))
    solved = Boolean(data.solved)
    updateListener()
  }

  function updateListener() {
    engine.position.setVector({x: player.x, y: player.y, z: 0})
    engine.position.setEuler({yaw: engine.fn.deg2rad(player.facing || 0)})
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

  function objectiveSummary() {
    return `${chamber().title}. ${chamber().directive} ${chamber().objective} Current system: ${chamber().restoredSystem}, ${solved ? 'online' : 'offline'}.`
  }

  function positionSummary() {
    const status = progress()
    return `Player ${player.x}, ${player.y}, facing ${player.facing} degrees. Ark restored ${status.restored} of ${status.total} systems, ${status.percent} percent.`
  }

  function inventorySummary() {
    return `Selected ${currentSeed().name}, pitch ${currentSeed().pitchRatio}, pulse ${currentSeed().pulseRate}, brightness ${currentSeed().brightness}. Inventory: ${seeds.map((seed, index) => `${index + 1}. ${seed.name}`).join('; ')}.`
  }

  engine.state.on('export', (data = {}) => data.echograft = exportState())
  engine.state.on('import', (data = {}) => importState(data.echograft))
  engine.state.on('reset', () => importState({
    chamberIndex: 0,
    eventLog: [],
    plantedSeeds: [],
    player: {...chambers[0].start},
    selectedSeed: 0,
    solved: false,
  }))
  updateListener()

  function resonance() {
    if (!plantedSeeds.length) return {score: 0, solved: false, message: 'Plant a seed at the chamber heart.'}

    const seed = plantedSeeds[0]
    const target = chamber().target
    const distance = Math.hypot(seed.position.x - target.x, seed.position.y - target.y)
    const pitch = Math.abs(seed.pitchRatio - target.pitchRatio)
    const pulse = Math.abs(seed.pulseRate - target.pulseRate)
    const needsGraft = chamber().requiresGraft && !seed.grafted
    const score = Math.max(0, 1 - distance * 0.25 - pitch - pulse * 0.25)
    return {
      score,
      solved: score >= 0.88 && !needsGraft,
      message: score >= 0.88 && !needsGraft
        ? `${chamber().title} solved. The garden blooms.`
        : needsGraft
          ? 'This chamber needs a grafted seed before it will restore.'
          : `Resonance ${Math.round(score * 100)} percent. Keep listening.`,
    }
  }

  return {
    chamber,
    currentSeed,
    get: () => ({chamber: chamber(), eventLog, mission, plantedSeeds, player, progress: progress(), selectedSeed, solved}),
    graft: function () {
      const graft = {
        name: 'Lumen-Verdant graft',
        pitchRatio: Number(((seeds[0].pitchRatio + seeds[1].pitchRatio) / 2).toFixed(2)),
        pulseRate: Number(((seeds[0].pulseRate + seeds[1].pulseRate) / 2).toFixed(2)),
        brightness: Number(((seeds[0].brightness + seeds[1].brightness) / 2).toFixed(2)),
        phase: Math.round((seeds[0].phase + seeds[1].phase) / 2),
        waveform: 'triangle',
        grafted: true,
      }
      seeds[2] = graft
      selectedSeed = 2
      content.cues.success()
      return log(`Grafted ${graft.name}. Selected hybrid pitch ${graft.pitchRatio}.`)
    },
    move: function (dx, dy) {
      player = {...player, x: player.x + dx, y: player.y + dy}
      updateListener()
      content.cues.move(player, {dx, dy})
      return log(`Moved to ${player.x}, ${player.y}.`)
    },
    next: function () {
      chamberIndex = Math.min(chambers.length - 1, chamberIndex + 1)
      player = {...chamber().start}
      plantedSeeds = []
      solved = false
      updateListener()
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
      engine.state.reset()
      engine.seed.set('echograft-verdancy-ark')
      updateListener()
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
    summarizeInventory: () => log(inventorySummary()),
    summarizeObjective: () => log(objectiveSummary()),
    summarizePosition: () => log(positionSummary()),
    tune: function (direction = 1) {
      const seed = currentSeed()
      seed.pitchRatio = Math.max(0.5, Math.min(2, Number((seed.pitchRatio + direction * 0.05).toFixed(2))))
      content.cues.seed(seed)
      return log(`Tuned ${seed.name}: pitch ${seed.pitchRatio}.`)
    },
  }
})()

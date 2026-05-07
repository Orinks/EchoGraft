import { createRng } from '../content/rng.js'
import { syngen } from './syngen.js'

const categoryDefaults = {
  master: 0.8,
  ambience: 0.55,
  music: 0.6,
  ui: 0.7,
  seeds: 0.75,
  hazards: 0.65,
  scans: 0.75,
}

const categoryBus = {
  ambience: 'ambience',
  hazard: 'hazards',
  music: 'music',
  scan: 'scans',
  seed: 'seeds',
  ui: 'ui',
}

function clamp(value, min = 0, max = 1) {
  return syngen?.utility?.clamp ? syngen.utility.clamp(value, min, max) : Math.min(max, Math.max(min, value))
}

function dbGain(decibels) {
  return syngen?.utility?.fromDb ? syngen.utility.fromDb(decibels) : 10 ** (decibels / 20)
}

function ratioToFrequency(ratio, rootMidi = 48) {
  const midiToFrequency = syngen?.utility?.midiToFrequency ?? ((midi) => 440 * 2 ** ((midi - 69) / 12))
  return midiToFrequency(rootMidi) * ratio
}

function semanticRatio(label) {
  const rng = createRng(`audio-${label}`)
  return 0.75 + rng() * 1.75
}

function semanticPulse(label) {
  const rng = createRng(`pulse-${label}`)
  return 0.5 + rng() * 3
}

function phaseToDetune(phase) {
  const toRadians = syngen?.utility?.degreesToRadians ?? ((degrees) => degrees * Math.PI / 180)
  return Math.sin(toRadians(phase)) * 18
}

function panFromPosition(position = {}) {
  return clamp((position.x ?? 0) / 5, -1, 1)
}

function durationFromPulse(pulseRate) {
  return clamp(0.65 / Math.max(pulseRate, 0.25), 0.08, 0.85)
}

function seedHarmonics(seed) {
  const brightness = clamp(seed.brightness)
  return [
    { coefficient: 1, gain: 1, type: seed.waveform },
    { coefficient: 1 + seed.fmAmount, gain: 0.25 + brightness * 0.45, type: seed.waveform },
    { coefficient: 2 + seed.amAmount, gain: 0.12 + seed.noiseAmount * 0.35, type: 'sine' },
  ]
}

function scheduleEnvelope(synth, { attack = 0.02, duration = 0.2, gain = 0.1, release = 0.08 }) {
  const now = syngen.audio.time()
  synth.param.gain.setValueAtTime(syngen.const.zeroGain, now)
  synth.param.gain.exponentialRampToValueAtTime(Math.max(syngen.const.zeroGain, gain), now + attack)
  synth.param.gain.exponentialRampToValueAtTime(syngen.const.zeroGain, now + Math.max(attack + release, duration))
  synth.stop(now + duration + release)
}

function connectVoice(synth, bus) {
  synth.connect(bus)
  return synth
}

function createSpatialVoicePrototype() {
  if (!syngen?.prop?.base?.invent) return null
  return syngen.prop.base.invent({
    name: 'echograft-spatial-voice',
    reverb: true,
    onConstruct({
      duration,
      gain,
      seed,
      tone,
    } = {}) {
      this.synth = createSynthForTone(tone, seed)
        .filtered({
          frequency: syngen.utility.lerp(600, 6200, clamp(seed?.brightness ?? tone.brightness ?? 0.5)),
          Q: 1 + clamp(seed?.fmAmount ?? 0) * 7,
          type: tone.filterType ?? 'lowpass',
        })
        .connect(this.output)

      scheduleEnvelope(this.synth, {
        attack: seed?.envelope?.attack ?? tone.attack,
        duration,
        gain,
        release: seed?.envelope?.release ?? tone.release,
      })
    },
    onDestroy() {
      this.synth?.stop?.()
    },
  })
}

function createSynthForTone(tone, seed) {
  const frequency = tone.frequency
  const gain = syngen.const.zeroGain

  if (seed?.oscillatorType === 'fm' || tone.mode === 'fm') {
    return syngen.audio.synth.createFm({
      carrierFrequency: frequency,
      carrierType: seed?.waveform ?? tone.type,
      gain,
      modDepth: frequency * clamp(seed?.fmAmount ?? tone.modAmount ?? 0.2, 0.05, 0.9),
      modFrequency: frequency * (1 + clamp(seed?.amAmount ?? 0.2, 0, 1)),
    })
  }

  if (seed?.oscillatorType === 'am' || tone.mode === 'am') {
    return syngen.audio.synth.createAm({
      carrierFrequency: frequency,
      carrierGain: 0.8,
      carrierType: seed?.waveform ?? tone.type,
      gain,
      modDepth: clamp(seed?.amAmount ?? tone.modAmount ?? 0.25, 0.05, 0.9),
      modFrequency: Math.max(0.25, seed?.pulseRate ?? tone.pulseRate ?? 1),
    })
  }

  if (seed?.oscillatorType === 'noise-kissed' || tone.mode === 'noise') {
    return syngen.audio.synth.createAmBuffer({
      buffer: syngen.audio.buffer.noise.pink(),
      gain,
      modDepth: clamp(seed?.noiseAmount ?? 0.2, 0.05, 0.8),
      modFrequency: Math.max(0.25, seed?.pulseRate ?? tone.pulseRate ?? 1),
      playbackRate: clamp(frequency / syngen.utility.midiToFrequency(48), 0.25, 4),
    })
  }

  if (tone.mode === 'additive') {
    return syngen.audio.synth.createAdditive({
      detune: tone.detune ?? 0,
      frequency,
      gain,
      harmonic: tone.harmonic,
    })
  }

  return syngen.audio.synth.createAdditive({
    detune: tone.detune ?? 0,
    frequency,
    gain,
    harmonic: seed ? seedHarmonics(seed) : [{ coefficient: 1, gain: 1, type: tone.type ?? 'sine' }],
  })
}

export class AudioEngine {
  constructor(settings = {}) {
    this.settings = { ...categoryDefaults, ...settings }
    this.enabled = false
    this.syngen = syngen
    this.buses = {}
    this.hasAudioStack = Boolean(syngen?.audio?.synth && syngen?.audio?.mixer && syngen?.prop?.base)
    this.spatialVoice = createSpatialVoicePrototype()
    this.music = {
      chamber: null,
      enabled: true,
      generation: 0,
      inventory: [],
      mode: 'menu',
      nextBeat: 0,
      plantedSeeds: [],
      resonance: null,
      step: 0,
    }
    this.musicFrameHandler = null
    this.seedLoops = new Map()
  }

  syncSeedObjects(chamberId, plantedSeeds = []) {
    const active = new Set(plantedSeeds.map((seed, index) => `${chamberId}:${seed.id}:${seed.position.x}:${seed.position.y}:${index}`))
    for (const [key, loop] of this.seedLoops.entries()) {
      if (active.has(key)) continue
      clearInterval(loop.timer)
      this.seedLoops.delete(key)
    }
    plantedSeeds.forEach((seed, index) => {
      const key = `${chamberId}:${seed.id}:${seed.position.x}:${seed.position.y}:${index}`
      if (this.seedLoops.has(key)) return
      const play = () => this.seed({ ...seed, persistent: true })
      play()
      const timer = setInterval(play, Math.max(900, 2200 / Math.max(seed.pulseRate ?? 1, 0.25)))
      this.seedLoops.set(key, { timer })
    })
  }

  clearSeedObjects() {
    for (const loop of this.seedLoops.values()) clearInterval(loop.timer)
    this.seedLoops.clear()
  }

  async start() {
    if (!this.hasAudioStack) {
      syngen?.ready?.(() => {})
      this.enabled = true
      return true
    }
    syngen.audio.start()
    await syngen.audio.context().resume()
    if (!syngen.loop.isRunning()) syngen.loop.start()
    this.createBuses()
    this.applySettings()
    this.startMusicLoop()
    this.enabled = true
    return true
  }

  startMusicLoop() {
    if (!this.hasAudioStack) return
    if (this.musicFrameHandler) return
    this.musicFrameHandler = () => this.tickMusic()
    syngen.loop.on('frame', this.musicFrameHandler)
  }

  createBuses() {
    if (!this.hasAudioStack) return
    if (Object.keys(this.buses).length) return
    for (const key of Object.values(categoryBus)) {
      this.buses[key] = syngen.audio.mixer.createBus()
    }
    syngen.audio.mixer.auxiliary.reverb.setImpulse(syngen.audio.buffer.impulse.medium())
    syngen.audio.mixer.auxiliary.reverb.param.delay.value = 1 / 12
  }

  setSettings(settings) {
    this.settings = { ...this.settings, ...settings }
    this.applySettings()
  }

  applySettings() {
    if (!this.hasAudioStack) return
    syngen.audio.mixer.master.param.gain.value = this.settings.master ?? 1
    for (const [key, bus] of Object.entries(this.buses)) {
      bus.gain.value = this.settings[key] ?? 1
    }
  }

  bus(category) {
    this.createBuses()
    return this.buses[categoryBus[category] ?? category] ?? this.buses.ui
  }

  setMusicScene(mode, options = {}) {
    this.music = {
      ...this.music,
      ...options,
      generation: this.music.generation + 1,
      mode,
      nextBeat: 0,
      step: 0,
    }
  }

  updateListener(player) {
    if (!syngen?.position?.setVector || !syngen?.position?.setEuler) return
    syngen.position.setVector({ x: player.x, y: player.y, z: 0 })
    const toRadians = syngen?.utility?.degreesToRadians ?? ((degrees) => degrees * Math.PI / 180)
    syngen.position.setEuler({ yaw: toRadians(player.facing) })
  }

  voice({
    category = 'ui',
    duration = 0.15,
    gain = dbGain(-12),
    position,
    seed,
    spatial = Boolean(position),
    tone,
  }) {
    if (!this.enabled || !this.hasAudioStack) return
    const bus = this.bus(category)
    if (!spatial) {
      const synth = createSynthForTone(tone, seed)
        .filtered({
          frequency: syngen.utility.lerp(700, 7200, clamp(seed?.brightness ?? tone.brightness ?? 0.5)),
          Q: 0.8 + clamp(seed?.fmAmount ?? 0) * 6,
          type: tone.filterType ?? 'lowpass',
        })
      connectVoice(synth, bus)
      scheduleEnvelope(synth, {
        attack: seed?.envelope?.attack ?? tone.attack,
        duration,
        gain,
        release: seed?.envelope?.release ?? tone.release,
      })
      return
    }

    const x = position?.x ?? 0
    const y = position?.y ?? 0
    const prop = syngen.props.create(this.spatialVoice, {
      destination: bus,
      duration,
      gain,
      seed,
      tone,
      x,
      y,
      z: 0,
    })
    setTimeout(() => syngen.props.destroy(prop), (duration + 0.1) * 1000)
  }

  tickMusic() {
    if (!this.enabled || !this.music.enabled) return
    const now = syngen.audio.time()
    if (this.music.nextBeat && now < this.music.nextBeat) return

    const phrase = this.createMusicPhrase()
    const beatDuration = 60 / phrase.tempo
    const step = this.music.step
    const ratio = phrase.ratios[step % phrase.ratios.length]
    const pulse = phrase.pulses[step % phrase.pulses.length]
    const brightness = phrase.brightness[step % phrase.brightness.length]
    const harmonic = phrase.harmonics.map((coefficient, index) => ({
      coefficient,
      gain: index === 0 ? 1 : 0.2 + brightness * 0.25,
      type: phrase.waveforms[(step + index) % phrase.waveforms.length],
    }))

    this.voice({
      category: 'music',
      duration: beatDuration * phrase.sustain,
      gain: phrase.gain,
      position: phrase.position,
      spatial: false,
      tone: {
        brightness,
        detune: phaseToDetune(phrase.phase + step * phrase.phaseMotion),
        frequency: ratioToFrequency(ratio, phrase.rootMidi + (step % phrase.octaveSpan) * 3),
        harmonic,
        mode: phrase.mode,
        pulseRate: pulse,
        type: phrase.waveforms[step % phrase.waveforms.length],
      },
    })

    if (phrase.counterline && step % phrase.counterline.every === 0) {
      this.voice({
        category: 'music',
        duration: beatDuration * phrase.counterline.sustain,
        gain: phrase.counterline.gain,
        position: phrase.counterline.position,
        spatial: false,
        tone: {
          brightness: phrase.counterline.brightness,
          frequency: ratioToFrequency(phrase.counterline.ratio, phrase.rootMidi - 12),
          harmonic: [{ coefficient: 1, gain: 1, type: phrase.counterline.type }],
          mode: 'additive',
          pulseRate: phrase.counterline.pulseRate,
          type: phrase.counterline.type,
        },
      })
    }

    this.music.step += 1
    this.music.nextBeat = now + beatDuration * phrase.spacing
  }

  createMusicPhrase() {
    if (this.music.mode === 'game') return this.createChamberMusicPhrase()
    if (this.music.mode === 'ending') return this.createEndingMusicPhrase()
    return this.createMenuMusicPhrase()
  }

  createMenuMusicPhrase() {
    const rng = createRng('menu-music-verdancy-ark')
    const ratios = Array.from({ length: 5 }, (_, index) => semanticRatio(`menu-${index}`))
    return {
      brightness: ratios.map((_, index) => 0.35 + rng() * 0.3 + index * 0.02),
      counterline: {
        brightness: 0.28,
        every: 4,
        gain: dbGain(-19),
        position: { x: -2, y: 1 },
        pulseRate: 0.5 + rng(),
        ratio: ratios[0] / 2,
        sustain: 2.8,
        type: 'sine',
      },
      gain: dbGain(-18),
      harmonics: [1, ratios[1], 2],
      mode: 'additive',
      octaveSpan: 2,
      phase: 0,
      phaseMotion: 8,
      position: { x: 0, y: 2 },
      pulses: [0.75, 1, 1.25, 1.5],
      ratios,
      rootMidi: 45,
      spacing: 1,
      sustain: 1.8,
      tempo: 54,
      waveforms: ['sine', 'triangle'],
    }
  }

  createChamberMusicPhrase() {
    const chamber = this.music.chamber ?? { id: 'default', target: { brightness: 0.5, phase: 0, pitchRatio: 1, pulseRate: 1, x: 0, y: 0 } }
    const target = chamber.target
    const planted = this.music.plantedSeeds ?? []
    const score = this.music.resonance?.score ?? 0
    const seedRatios = planted.length ? planted.map((seed) => seed.pitchRatio) : [target.pitchRatio]
    const seedPulses = planted.length ? planted.map((seed) => seed.pulseRate) : [target.pulseRate]
    const rng = createRng(`music-${chamber.id}`)
    const tension = 1 - score
    const hazard = chamber.hazards?.length ? 0.2 : 0

    return {
      brightness: [
        clamp(target.brightness * 0.8 + score * 0.2),
        clamp(target.brightness + hazard),
        clamp((planted[0]?.brightness ?? target.brightness) * 0.9),
      ],
      counterline: {
        brightness: clamp(target.brightness * 0.6),
        every: chamber.requiresGraft ? 3 : 4,
        gain: dbGain(-22 + score * 4),
        position: { x: -target.x || -1, y: target.y || 1 },
        pulseRate: Math.max(0.5, target.pulseRate / 2),
        ratio: Math.max(0.5, target.pitchRatio / 2),
        sustain: 2,
        type: chamber.hazards?.length ? 'sawtooth' : 'sine',
      },
      gain: dbGain(-20 + score * 6),
      harmonics: [1, target.pitchRatio, chamber.harmonic ? 1.5 : 2 + rng() * 0.25],
      mode: chamber.hazards?.length ? 'fm' : planted.length ? 'additive' : 'am',
      octaveSpan: chamber.ending ? 5 : 3,
      phase: target.phase,
      phaseMotion: chamber.id === 'phase' ? 24 : 6 + tension * 12,
      position: target,
      pulses: [target.pulseRate, ...seedPulses].map((pulse) => Math.max(0.4, pulse)),
      ratios: [target.pitchRatio, ...seedRatios, target.pitchRatio * (chamber.harmonic ? 1.5 : 1.25)],
      rootMidi: 38 + Math.round(target.brightness * 12),
      spacing: clamp(1.2 - score * 0.45, 0.55, 1.3),
      sustain: chamber.hazards?.length ? 0.8 : 1.45 + score,
      tempo: 44 + target.pulseRate * 14 + score * 10,
      waveforms: planted.length ? planted.map((seed) => seed.waveform) : ['sine', 'triangle'],
    }
  }

  createEndingMusicPhrase() {
    const inventory = this.music.inventory ?? []
    const ratios = inventory.length ? inventory.map((seed) => seed.pitchRatio) : [1, 1.25, 1.5, 2]
    const brightness = inventory.length ? inventory.map((seed) => seed.brightness) : [0.45, 0.6, 0.75]
    return {
      brightness,
      counterline: {
        brightness: 0.8,
        every: 2,
        gain: dbGain(-17),
        position: { x: 0, y: -3 },
        pulseRate: 1.5,
        ratio: ratios[0],
        sustain: 2.5,
        type: 'triangle',
      },
      gain: dbGain(-16),
      harmonics: [1, 1.5, 2, 3],
      mode: 'additive',
      octaveSpan: 5,
      phase: 90,
      phaseMotion: 18,
      position: { x: 0, y: 0 },
      pulses: [1, 1.5, 2, 2.5],
      ratios: [...ratios, 2, 1.5],
      rootMidi: 43,
      spacing: 0.7,
      sustain: 2.4,
      tempo: 72,
      waveforms: ['sine', 'triangle', 'sawtooth'],
    }
  }

  ui(kind = 'confirm') {
    const ratio = semanticRatio(kind)
    this.voice({
      category: 'ui',
      duration: durationFromPulse(semanticPulse(kind)),
      gain: dbGain(kind === 'error' ? -6 : -8),
      spatial: false,
      tone: {
        brightness: kind === 'error' ? 0.25 : 0.65,
        frequency: ratioToFrequency(ratio, kind === 'cancel' ? 43 : 55),
        mode: kind === 'error' ? 'fm' : 'additive',
        pulseRate: semanticPulse(kind),
        type: kind === 'success' ? 'triangle' : 'sine',
        harmonic: [
          { coefficient: 1, gain: 1, type: 'sine' },
          { coefficient: ratio, gain: 0.45, type: 'triangle' },
        ],
      },
    })
  }

  scan(player, target) {
    this.updateListener(player)
    const dx = target.x - player.x
    const dy = target.y - player.y
    const distance = Math.hypot(dx, dy)
    const brightness = clamp(1 - distance / 8)
    this.voice({
      category: 'scan',
      duration: clamp(0.16 + distance * 0.04, 0.18, 0.65),
      gain: dbGain(-10),
      position: target,
      tone: {
        brightness,
        detune: phaseToDetune(target.phase),
        frequency: ratioToFrequency(target.pitchRatio, 52 + brightness * 12),
        mode: 'additive',
        pulseRate: target.pulseRate,
        type: 'sine',
        harmonic: [
          { coefficient: 1, gain: 1, type: 'sine' },
          { coefficient: target.pulseRate, gain: 0.25 + brightness * 0.45, type: 'triangle' },
        ],
      },
    })
  }

  resonance(result = {}, chamber = {}) {
    const score = clamp(result.score ?? 0)
    this.voice({
      category: result.solved ? 'ui' : 'scan',
      duration: 0.18 + score * 0.35,
      gain: dbGain(result.solved ? -8 : -12),
      position: chamber.target,
      tone: {
        brightness: clamp((chamber.target?.brightness ?? 0.45) + score * 0.3),
        frequency: ratioToFrequency((chamber.target?.pitchRatio ?? 1) * (0.75 + score * 0.5), 50),
        harmonic: [
          { coefficient: 1, gain: 1, type: result.solved ? 'triangle' : 'sine' },
          { coefficient: 1 + score, gain: 0.35, type: 'triangle' },
        ],
        mode: result.solved ? 'additive' : 'am',
        pulseRate: chamber.target?.pulseRate ?? 1,
        type: result.solved ? 'triangle' : 'sine',
      },
    })
  }

  movement(player, previous, chamber = {}) {
    this.updateListener(player)
    const movedDistance = Math.hypot(player.x - previous.x, player.y - previous.y)
    const safeRadius = 5
    const westWall = (chamber.start?.x ?? 0) - safeRadius
    const eastWall = (chamber.start?.x ?? 0) + safeRadius
    const southWall = (chamber.start?.y ?? 0) - safeRadius
    const northWall = (chamber.start?.y ?? 0) + safeRadius
    const nearestWall = Math.min(player.x - westWall, eastWall - player.x, player.y - southWall, northWall - player.y)
    const currentPosition = {
      x: (chamber.start?.x ?? 0) + ((chamber.target?.x ?? 0) - (chamber.start?.x ?? 0)) / 2,
      y: (chamber.start?.y ?? 0) + ((chamber.target?.y ?? 0) - (chamber.start?.y ?? 0)) / 2,
    }
    const wallPosition = {
      x: player.x <= westWall + 1 ? westWall : player.x >= eastWall - 1 ? eastWall : player.x,
      y: player.y <= southWall + 1 ? southWall : player.y >= northWall - 1 ? northWall : player.y,
    }

    this.voice({
      category: 'ui',
      duration: 0.11 + movedDistance * 0.04,
      gain: dbGain(-13),
      spatial: false,
      tone: {
        brightness: 0.35,
        frequency: ratioToFrequency(1 + ((Math.abs(player.x) + Math.abs(player.y)) % 4) * 0.05, 41),
        harmonic: [{ coefficient: 1, gain: 1, type: 'triangle' }],
        mode: 'additive',
        pulseRate: 1,
        type: 'triangle',
      },
    })

    this.voice({
      category: 'ambience',
      duration: 0.35,
      gain: dbGain(-23),
      position: currentPosition,
      tone: {
        brightness: chamber.target?.brightness ?? 0.45,
        frequency: ratioToFrequency(chamber.target?.pulseRate ?? 1, 36),
        mode: 'am',
        pulseRate: chamber.target?.pulseRate ?? 1,
        type: 'sine',
      },
    })

    this.voice({
      category: 'scan',
      duration: 0.2,
      gain: dbGain(-20),
      position: chamber.target,
      tone: {
        brightness: chamber.target?.brightness ?? 0.45,
        frequency: ratioToFrequency(chamber.target?.pitchRatio ?? 1, 54),
        harmonic: [
          { coefficient: 1, gain: 1, type: 'sine' },
          { coefficient: 2, gain: 0.25, type: 'triangle' },
        ],
        mode: 'additive',
        pulseRate: chamber.target?.pulseRate ?? 1,
        type: 'sine',
      },
    })

    if (nearestWall <= 1.5) {
      this.voice({
        category: 'hazard',
        duration: 0.22,
        gain: dbGain(-16),
        position: wallPosition,
        tone: {
          brightness: 0.22,
          frequency: ratioToFrequency(0.75, 38),
          mode: 'fm',
          modAmount: 0.45,
          pulseRate: 0.8,
          type: 'square',
        },
      })
    }
  }

  seed(seed) {
    const pulses = Math.max(1, Math.min(6, Math.ceil(seed.pulseRate)))
    const baseDuration = durationFromPulse(seed.pulseRate)
    for (let index = 0; index < pulses; index += 1) {
      setTimeout(() => {
        this.voice({
          category: 'seed',
          duration: baseDuration,
          gain: dbGain(-13 + seed.brightness * 5),
          position: seed.position,
          seed,
          tone: {
            brightness: seed.brightness,
            detune: phaseToDetune(seed.phase),
            frequency: ratioToFrequency(seed.pitchRatio, 50),
            pulseRate: seed.pulseRate,
            type: seed.waveform,
          },
        })
      }, index * (1000 / Math.max(seed.pulseRate, 0.25)))
    }
  }

  hazard(chamber = {}, seed = {}) {
    const target = chamber.hazards?.[0] ?? chamber.target ?? { pitchRatio: semanticRatio('hazard'), pulseRate: semanticPulse('hazard') }
    this.voice({
      category: 'hazard',
      duration: durationFromPulse(target.pulseRate ?? 0.75) * 1.8,
      gain: dbGain(-7),
      position: chamber.target,
      seed: {
        ...seed,
        brightness: 0.18,
        fmAmount: 0.75,
        oscillatorType: 'fm',
        pulseRate: target.pulseRate ?? 0.75,
        waveform: 'sawtooth',
      },
      tone: {
        brightness: 0.18,
        frequency: ratioToFrequency(target.pitchRatio ?? 0.75, 42),
        mode: 'fm',
        modAmount: 0.7,
        pulseRate: target.pulseRate ?? 0.75,
        type: 'sawtooth',
      },
    })
  }

  chamber(chamber, plantedSeeds = []) {
    this.setMusicScene('game', { chamber, plantedSeeds })
    this.syncSeedObjects(chamber.id, plantedSeeds)
    const ecology = plantedSeeds.length ? plantedSeeds : [{ ...chamber.target, waveform: 'sine', oscillatorType: 'am', fmAmount: 0.1, amAmount: 0.2, noiseAmount: 0.05 }]
    ecology.forEach((seed, index) => {
      const ratio = seed.pitchRatio ?? chamber.target.pitchRatio
      const pulseRate = seed.pulseRate ?? chamber.target.pulseRate
      setTimeout(() => {
        this.voice({
          category: 'ambience',
          duration: durationFromPulse(pulseRate) * 2.5,
          gain: dbGain(-20 + clamp(chamber.target.brightness) * 5),
          position: seed.position ?? chamber.target,
          seed: {
            ...seed,
            brightness: seed.brightness ?? chamber.target.brightness,
            oscillatorType: seed.oscillatorType ?? 'am',
            pulseRate,
            waveform: seed.waveform ?? 'sine',
          },
          tone: {
            brightness: seed.brightness ?? chamber.target.brightness,
            frequency: ratioToFrequency(ratio, 38 + index * 5),
            mode: 'am',
            pulseRate,
            type: seed.waveform ?? 'sine',
          },
        })
      }, index * 140)
    })
  }

  ending(chambers = [], inventory = []) {
    this.setMusicScene('ending', { inventory })
    const solvedTargets = chambers.map((item) => item.target)
    const voices = [...solvedTargets, ...inventory].filter(Boolean)
    voices.forEach((voice, index) => {
      const pitchRatio = voice.pitchRatio ?? semanticRatio(`ending-${index}`)
      const pulseRate = voice.pulseRate ?? semanticPulse(`ending-${index}`)
      setTimeout(() => {
        this.voice({
          category: 'ambience',
          duration: durationFromPulse(pulseRate) * 3,
          gain: dbGain(-18 + clamp(voice.brightness ?? 0.5) * 6),
          position: voice.position ?? { x: Math.cos(index) * 3, y: Math.sin(index) * 3 },
          seed: {
            ...voice,
            brightness: voice.brightness ?? 0.5,
            oscillatorType: index % 2 ? 'fm' : 'am',
            pulseRate,
            waveform: voice.waveform ?? 'triangle',
          },
          tone: {
            brightness: voice.brightness ?? 0.5,
            frequency: ratioToFrequency(pitchRatio, 45 + (index % 5) * 4),
            mode: index % 3 ? 'additive' : 'fm',
            pulseRate,
            type: voice.waveform ?? 'triangle',
          },
        })
      }, index * 180)
    })
  }
}

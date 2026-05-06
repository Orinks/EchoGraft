import { createRng } from '../content/rng.js'
import { syngen } from './syngen.js'

const categoryDefaults = {
  master: 0.8,
  ambience: 0.55,
  ui: 0.7,
  seeds: 0.75,
  hazards: 0.65,
  scans: 0.75,
}

const categoryBus = {
  ambience: 'ambience',
  hazard: 'hazards',
  scan: 'scans',
  seed: 'seeds',
  ui: 'ui',
}

function clamp(value, min = 0, max = 1) {
  return syngen.utility.clamp(value, min, max)
}

function dbGain(decibels) {
  return syngen.utility.fromDb(decibels)
}

function ratioToFrequency(ratio, rootMidi = 48) {
  return syngen.utility.midiToFrequency(rootMidi) * ratio
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
  return Math.sin(syngen.utility.degreesToRadians(phase)) * 18
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
    this.spatialVoice = createSpatialVoicePrototype()
  }

  async start() {
    syngen.audio.start()
    if (!syngen.loop.isRunning()) syngen.loop.start()
    this.createBuses()
    this.applySettings()
    this.enabled = true
    return true
  }

  createBuses() {
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
    syngen.audio.mixer.master.param.gain.value = this.settings.master ?? 1
    for (const [key, bus] of Object.entries(this.buses)) {
      bus.gain.value = this.settings[key] ?? 1
    }
  }

  bus(category) {
    this.createBuses()
    return this.buses[categoryBus[category] ?? category] ?? this.buses.ui
  }

  updateListener(player) {
    syngen.position.setVector({ x: player.x, y: player.y, z: 0 })
    syngen.position.setEuler({ yaw: syngen.utility.degreesToRadians(player.facing) })
  }

  voice({
    category = 'ui',
    duration = 0.15,
    gain = dbGain(-12),
    position,
    seed,
    tone,
  }) {
    if (!this.enabled) return
    const bus = this.bus(category)
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

  ui(kind = 'confirm') {
    const ratio = semanticRatio(kind)
    this.voice({
      category: 'ui',
      duration: durationFromPulse(semanticPulse(kind)),
      gain: dbGain(kind === 'error' ? -8 : -11),
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

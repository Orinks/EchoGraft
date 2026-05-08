import { createRng } from '../content/rng.js'
import { movementFeedback } from '../content/player.js'
import { scanPulse } from '../content/scan.js'
import { createListenerPositionState } from './position.js'
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

function fallbackShape(values = [-1, 0, 1]) {
  return new Float32Array(values)
}

function curveStats(curve = fallbackShape()) {
  const samples = Array.from(curve)
  const total = samples.reduce((sum, value) => sum + value, 0)
  const positive = samples.filter((value) => value > 0).length
  const max = Math.max(...samples)
  const min = Math.min(...samples)

  return {
    edge: Number((max - min).toFixed(3)),
    mean: Number((total / Math.max(samples.length, 1)).toFixed(3)),
    positiveRatio: Number((positive / Math.max(samples.length, 1)).toFixed(3)),
  }
}

const shapeFactories = {
  brightness: {
    equalFadeIn: () => (syngen?.shape?.equalFadeIn ? syngen.shape.equalFadeIn() : fallbackShape([-1, 0.25, 1])),
    equalFadeOut: () => (syngen?.shape?.equalFadeOut ? syngen.shape.equalFadeOut() : fallbackShape([1, 0.25, -1])),
    linear: () => (syngen?.shape?.linear ? syngen.shape.linear() : fallbackShape()),
  },
  distortion: {
    distort: () => (syngen?.shape?.distort ? syngen.shape.distort() : fallbackShape([-1, -0.75, 0, 0.75, 1])),
    hot: () => (syngen?.shape?.hot ? syngen.shape.hot() : fallbackShape([-1, -0.5, 0, 0.5, 1])),
    warm: () => (syngen?.shape?.warm ? syngen.shape.warm() : fallbackShape()),
  },
  mutation: {
    crush8: () => (syngen?.shape?.crush8 ? syngen.shape.crush8() : fallbackShape([-1, -0.5, 0, 0.5, 1])),
    crush12: () => (syngen?.shape?.crush12 ? syngen.shape.crush12() : fallbackShape([-1, -0.25, 0, 0.25, 1])),
    dither: () => (syngen?.shape?.dither ? syngen.shape.dither() : fallbackShape([0, 0])),
    noise16: () => (syngen?.shape?.noise16 ? syngen.shape.noise16() : fallbackShape([-0.25, 0, 0.25])),
    seededNoise: (seed) => (syngen?.shape?.createNoise ? syngen.shape.createNoise(clamp(seed?.noiseAmount ?? 0.05, 0.02, 0.35), 16) : fallbackShape([-0.15, 0, 0.15])),
  },
  pulse: {
    doublePulse: () => (syngen?.shape?.doublePulse ? syngen.shape.doublePulse() : fallbackShape([1, 0, 0.5, 0])),
    pulse: () => (syngen?.shape?.pulse ? syngen.shape.pulse() : fallbackShape([0, 0, 1])),
    triplePulse: () => (syngen?.shape?.triplePulse ? syngen.shape.triplePulse() : fallbackShape([1, 0, 0.5, 0, 0.25, 0])),
  },
}

export function seedShapeTimbreProfile(seed = {}, tone = {}) {
  const brightness = clamp(seed?.brightness ?? tone.brightness ?? 0.5)
  const noiseAmount = clamp(seed?.noiseAmount ?? tone.noiseAmount ?? 0)
  const pulseRate = Math.max(seed?.pulseRate ?? tone.pulseRate ?? 1, 0.25)
  const distortionCurve = noiseAmount > 0.45 || tone.mode === 'fm'
    ? 'distort'
    : noiseAmount > 0.18
      ? 'hot'
      : 'warm'
  const pulseCurve = pulseRate >= 2.25
    ? 'triplePulse'
    : pulseRate >= 1.35
      ? 'doublePulse'
      : 'pulse'
  const brightnessCurve = brightness >= 0.68
    ? 'equalFadeIn'
    : brightness <= 0.32
      ? 'equalFadeOut'
      : 'linear'
  const mutationCurve = noiseAmount >= 0.45
    ? 'crush8'
    : noiseAmount >= 0.25
      ? 'crush12'
      : noiseAmount >= 0.08
        ? 'noise16'
        : 'dither'
  const curves = {
    brightness: shapeFactories.brightness[brightnessCurve](),
    distortion: shapeFactories.distortion[distortionCurve](),
    mutation: noiseAmount >= 0.08 ? shapeFactories.mutation.seededNoise(seed) : shapeFactories.mutation[mutationCurve](),
    pulse: shapeFactories.pulse[pulseCurve](),
  }
  const stats = Object.fromEntries(Object.entries(curves).map(([key, curve]) => [key, curveStats(curve)]))

  return {
    brightnessCurve,
    brightnessTilt: clamp(0.75 + stats.brightness.positiveRatio * 0.4 + brightness * 0.15, 0.5, 1.35),
    curves,
    distortionCurve,
    distortionDrive: clamp(0.8 + stats.distortion.edge * 0.18 + noiseAmount * 0.45, 0.65, 1.65),
    mutationCurve,
    mutationSpread: clamp(stats.mutation.edge * 0.12 + noiseAmount * 0.7, 0, 0.65),
    pulseAccent: clamp(0.75 + stats.pulse.positiveRatio * 0.45 + Math.min(pulseRate, 3) * 0.05, 0.75, 1.5),
    pulseCurve,
    stats,
    text: `Shape timbre: distortion ${distortionCurve}, pulse ${pulseCurve}, brightness ${brightnessCurve}, mutation ${mutationCurve}.`,
  }
}

export function generatedNoiseBedRole(seed = {}, tone = {}) {
  const noiseAmount = clamp(seed?.noiseAmount ?? tone.noiseAmount ?? 0.05)
  const family = tone.noiseBed === 'white'
    ? 'whiteNoise'
    : tone.noiseBed === 'brown' || noiseAmount >= 0.45
      ? 'brownNoise'
      : noiseAmount >= 0.12
        ? 'pinkNoise'
        : 'whiteNoise'

  return {
    channels: 1,
    duration: Number((0.8 + noiseAmount * 1.6).toFixed(2)),
    family,
    text: `Generated noise bed: ${family} for synthesized seed noise; no external audio file.`,
  }
}

function generatedNoiseBedBuffer(seed = {}, tone = {}) {
  const role = generatedNoiseBedRole(seed, tone)
  const options = {
    channels: role.channels,
    duration: role.duration,
  }

  if (role.family === 'brownNoise') return syngen.buffer.brownNoise(options)
  if (role.family === 'pinkNoise') return syngen.buffer.pinkNoise(options)
  return syngen.buffer.whiteNoise(options)
}

function generatedImpulseBuffer({ channels = 2, duration = 2, power = 2 } = {}) {
  return syngen.buffer.impulse({
    buffer: syngen.buffer.whiteNoise({ channels, duration }),
    power,
  })
}

const surfaceFootstepTimbres = {
  'archive loam': {
    brightness: 0.28,
    harmonic: [{ coefficient: 1, gain: 1, type: 'triangle' }],
    mode: 'am',
    pulseRate: 0.75,
    rootMidi: 39,
    type: 'triangle',
  },
  'compass rail': {
    brightness: 0.5,
    harmonic: [
      { coefficient: 1, gain: 1, type: 'triangle' },
      { coefficient: 2, gain: 0.24, type: 'sine' },
    ],
    mode: 'additive',
    pulseRate: 1.25,
    rootMidi: 44,
    type: 'triangle',
  },
  'intake deck': {
    brightness: 0.35,
    harmonic: [{ coefficient: 1, gain: 1, type: 'triangle' }],
    mode: 'additive',
    pulseRate: 1,
    rootMidi: 41,
    type: 'triangle',
  },
  'leafglass lattice': {
    brightness: 0.72,
    harmonic: [
      { coefficient: 1, gain: 1, type: 'triangle' },
      { coefficient: 3, gain: 0.2, type: 'sawtooth' },
    ],
    mode: 'additive',
    pulseRate: 1.8,
    rootMidi: 48,
    type: 'triangle',
  },
  'resonant heartwood': {
    brightness: 0.62,
    harmonic: [
      { coefficient: 1, gain: 1, type: 'sine' },
      { coefficient: 1.5, gain: 0.28, type: 'triangle' },
    ],
    mode: 'additive',
    pulseRate: 1.1,
    rootMidi: 43,
    type: 'sine',
  },
  'rootfelt floor': {
    brightness: 0.22,
    harmonic: [
      { coefficient: 1, gain: 1, type: 'triangle' },
      { coefficient: 0.5, gain: 0.18, type: 'sine' },
    ],
    modAmount: 0.18,
    mode: 'fm',
    pulseRate: 0.65,
    rootMidi: 36,
    type: 'triangle',
  },
  'wet channel tile': {
    brightness: 0.44,
    mode: 'am',
    pulseRate: 1.45,
    rootMidi: 40,
    type: 'sine',
  },
}

function footstepTone(surface, player = {}) {
  const { rootMidi = 41, ...timbre } = surfaceFootstepTimbres[surface] ?? surfaceFootstepTimbres['intake deck']
  return {
    ...timbre,
    frequency: ratioToFrequency(1 + ((Math.abs(player.x ?? 0) + Math.abs(player.y ?? 0)) % 4) * 0.05, rootMidi),
  }
}

function directionalFootstepPosition(player = {}, previous = {}) {
  const dx = (player.x ?? 0) - (previous.x ?? 0)
  const dy = (player.y ?? 0) - (previous.y ?? 0)
  const distance = Math.hypot(dx, dy)
  if (!distance) return { x: player.x ?? 0, y: player.y ?? 0 }

  const offset = 0.75
  return {
    x: (player.x ?? 0) + (dx / distance) * offset,
    y: (player.y ?? 0) + (dy / distance) * offset,
  }
}

function boundaryPresencePosition(player = {}, feedback = {}) {
  const bounds = feedback.bounds ?? {}
  return {
    x: player.x <= (bounds.west ?? player.x) + 1 ? bounds.west : player.x >= (bounds.east ?? player.x) - 1 ? bounds.east : player.x,
    y: player.y <= (bounds.south ?? player.y) + 1 ? bounds.south : player.y >= (bounds.north ?? player.y) - 1 ? bounds.north : player.y,
  }
}

function seedHarmonics(seed) {
  const brightness = clamp(seed.brightness)
  const shape = seedShapeTimbreProfile(seed)
  return [
    { coefficient: 1, gain: 1, type: seed.waveform },
    { coefficient: 1 + seed.fmAmount + shape.mutationSpread * 0.2, gain: (0.25 + brightness * 0.45) * shape.brightnessTilt, type: seed.waveform },
    { coefficient: 2 + seed.amAmount, gain: (0.12 + seed.noiseAmount * 0.35) * shape.distortionDrive, type: seed.noiseAmount > 0.2 ? 'sawtooth' : 'sine' },
  ]
}

function scheduleEnvelope(synth, { attack = 0.02, decay = 0.08, duration = 0.2, gain = 0.1, release = 0.08, sustain = 0.6 }) {
  const now = syngen.audio.time()
  const peakTime = now + Math.max(attack, 0.001)
  const decayTime = Math.min(now + duration, peakTime + Math.max(decay, 0))
  const releaseStart = Math.max(decayTime, now + duration)
  const stopTime = releaseStart + Math.max(release, 0.001)
  const sustainGain = Math.max(syngen.const.zeroGain, gain * clamp(sustain, 0.1, 1))
  synth.param.gain.setValueAtTime(syngen.const.zeroGain, now)
  synth.param.gain.exponentialRampToValueAtTime(Math.max(syngen.const.zeroGain, gain), peakTime)
  synth.param.gain.exponentialRampToValueAtTime(sustainGain, decayTime)
  synth.param.gain.exponentialRampToValueAtTime(syngen.const.zeroGain, stopTime)
  synth.stop(stopTime)
}

function connectVoice(synth, bus) {
  synth.connect(bus)
  return synth
}

function createSpatialVoicePrototype() {
  if (!syngen?.sound?.extend) return null
  return syngen.sound.extend({
    name: 'echograft-spatial-voice',
    reverb: true,
    onConstruct({
      duration,
      gain,
      seed,
      tone,
    } = {}) {
      this.synth = applyEffectChain(createSynthForTone(tone, seed), tone.effectChain, tone)
        .filtered({
          frequency: syngen.utility.lerp(600, 6200, clamp(seed?.brightness ?? tone.brightness ?? 0.5)) * seedShapeTimbreProfile(seed, tone).brightnessTilt,
          Q: 1 + clamp(seed?.fmAmount ?? seedShapeTimbreProfile(seed, tone).mutationSpread) * 7,
          type: tone.filterType ?? 'lowpass',
        })
        .connect(this.output)

      scheduleEnvelope(this.synth, {
        attack: seed?.envelope?.attack ?? tone.attack,
        decay: seed?.envelope?.decay ?? tone.decay,
        duration,
        gain,
        release: seed?.envelope?.release ?? tone.release,
        sustain: seed?.envelope?.sustain ?? tone.sustain,
      })
    },
    onDestroy() {
      this.synth?.stop?.()
    },
  })
}

export function spatialVoiceRoleForCategory(category = 'ui') {
  if (category === 'seed') return 'seed'
  if (category === 'scan') return 'scan'
  if (category === 'hazard') return 'hazard'
  if (category === 'music') return 'chamber'
  if (category === 'ambience' || category === 'ui') return 'landmark'
  return 'chamber'
}

export function seedSynthFactoryName(seed = {}, tone = {}) {
  if (seed?.oscillatorType === 'fm' || tone.mode === 'fm') return 'fm'
  if (seed?.oscillatorType === 'am' || tone.mode === 'am') return 'am'
  if (seed?.oscillatorType === 'noise-kissed' || tone.mode === 'noise') return 'amBuffer'
  return 'additive'
}

export function chamberEffectChain(chamber = {}) {
  const system = String(chamber.system ?? '').toLowerCase()
  const mechanic = String(chamber.mechanic ?? '').toLowerCase()
  const id = String(chamber.id ?? '').toLowerCase()
  const chain = []

  if (system.includes('water') || mechanic.includes('current') || mechanic.includes('rain')) chain.push('feedbackDelay')
  if (system.includes('canopy') || mechanic.includes('brightness') || mechanic.includes('prism')) chain.push('phaser')
  if (system.includes('memory') || mechanic.includes('echo') || mechanic.includes('record') || mechanic.includes('loop')) chain.push('multitapDelay')
  if (system.includes('heart') || mechanic.includes('finale') || mechanic.includes('network')) chain.push('pingPongDelay')
  if (mechanic.includes('phase') || id.includes('phase')) chain.push('phaser')
  if (system.includes('memory') || mechanic.includes('formant') || mechanic.includes('record')) chain.push('talkbox')
  if ((chamber.hazards?.length ?? 0) > 0) chain.push('feedbackDelay')

  return Array.from(new Set(chain))
}

export function memoryRecordVoiceProfile(record = {}) {
  const id = String(record.id ?? '').toLowerCase()
  const title = String(record.title ?? record.id ?? 'Ark memory').toLowerCase()
  const text = String(record.text ?? '').toLowerCase()
  const source = `${id} ${title} ${text}`
  const formantPair = source.includes('crew')
    ? ['createO', 'createA']
    : source.includes('plant-memory')
      ? ['createU', 'createO']
      : source.includes('gardener')
        ? ['createE', 'createA']
        : source.includes('seed-ancestry') || source.includes('archive')
          ? ['createI', 'createE']
          : source.includes('system')
            ? ['createO', 'createU']
            : ['createU', 'createA']

  return {
    formantMix: source.includes('memory') ? 0.62 : 0.42,
    formantPair,
    pitchRatio: source.includes('warning') || source.includes('diagnostic') ? 0.75 : 1,
    pulseRate: source.includes('crew') ? 0.8 : 0.55,
    text: `Memory voice: ${record.title ?? record.id ?? 'Ark record'} routed through ${formantPair.join(' to ')} talkbox formants.`,
  }
}

export class SeedVoice {
  constructor({ chamberId = 'unknown', index = 0, seed = {}, startedAt = 0 } = {}) {
    this.chamberId = chamberId
    this.index = index
    this.interval = SeedVoice.intervalFor(seed)
    this.key = SeedVoice.key(chamberId, seed, index)
    this.nextBeat = startedAt + this.interval
    this.seed = structuredClone({
      ...seed,
      persistent: true,
      role: 'planted-seed-voice',
      seedVoice: true,
    })
    this.text = `SeedVoice: ${this.seed.name ?? this.seed.id ?? 'planted seed'} persists at ${this.seed.position?.x ?? 0}, ${this.seed.position?.y ?? 0}; pulse interval ${this.interval.toFixed(2)} second(s).`
  }

  static intervalFor(seed = {}) {
    return Math.max(0.9, 2.2 / Math.max(seed.pulseRate ?? 1, 0.25))
  }

  static key(chamberId, seed = {}, index = 0) {
    const position = seed.position ?? { x: 0, y: 0 }
    return `${chamberId}:${seed.id}:${position.x}:${position.y}:${index}`
  }

  play(engine) {
    engine.seed(structuredClone(this.seed))
  }

  tick(engine, now = engine.audioTime()) {
    if (now < this.nextBeat) return false
    this.play(engine)
    this.nextBeat = now + this.interval
    return true
  }
}

export class HeartVoice {
  constructor({ chamber = {}, player, result = {}, restored = false } = {}) {
    this.chamber = chamber
    this.target = chamber.target ?? { brightness: 0.45, phase: 0, pitchRatio: 1, pulseRate: 1, x: 0, y: 0 }
    this.pulse = player ? scanPulse(player, this.target) : null
    this.restored = restored || Boolean(result?.solved)
    this.role = this.restored ? 'restored-heart' : 'target-heart'
    this.score = clamp(result?.score ?? (this.restored ? 1 : 0))
    this.text = this.restored
      ? `HeartVoice: ${chamber.title ?? 'chamber'} restored-state sound at ${this.target.x ?? 0}, ${this.target.y ?? 0}; consonance score ${this.score.toFixed(2)}.`
      : `HeartVoice: chamber target sound at ${this.target.x ?? 0}, ${this.target.y ?? 0}; pulse ${this.target.pulseRate ?? 1}, brightness ${this.target.brightness ?? 0.45}.`
  }

  toVoicePayload() {
    const brightness = this.restored
      ? clamp((this.target.brightness ?? 0.45) + this.score * 0.3)
      : this.pulse?.brightness ?? (this.target.brightness ?? 0.45)
    const pulseRate = this.target.pulseRate ?? 1
    const pitchRatio = this.target.pitchRatio ?? 1
    const waveform = this.restored ? 'triangle' : 'sine'

    return {
      category: this.restored ? 'ui' : 'scan',
      duration: this.restored ? 0.18 + this.score * 0.35 : this.pulse?.duration ?? durationFromPulse(pulseRate),
      gain: dbGain(this.restored ? -8 : -10),
      position: this.target,
      seed: {
        ...this.target,
        brightness,
        heartVoice: true,
        oscillatorType: this.restored ? 'additive' : 'am',
        pulseRate,
        restored: this.restored,
        role: this.role,
        successCadence: this.restored,
        waveform,
      },
      tone: {
        brightness,
        detune: phaseToDetune(this.target.phase ?? 0),
        frequency: ratioToFrequency(pitchRatio * (this.restored ? 0.75 + this.score * 0.5 : 1), this.restored ? 50 : 52 + brightness * 12),
        harmonic: this.restored
          ? [
              { coefficient: 1, gain: 1, type: 'triangle' },
              { coefficient: 1 + this.score, gain: 0.35, type: 'triangle' },
            ]
          : [
              { coefficient: 1, gain: 1, type: 'sine' },
              { coefficient: pulseRate, gain: 0.25 + brightness * 0.45, type: 'triangle' },
            ],
        mode: this.restored ? 'additive' : 'additive',
        pulseRate,
        type: waveform,
      },
    }
  }

  play(engine) {
    engine.voice(this.toVoicePayload())
  }
}

export class ScanPulse {
  constructor({ player, target = {} } = {}) {
    this.player = player
    this.target = target
    this.pulse = player ? scanPulse(player, target) : { brightness: target.brightness ?? 0.45, distance: 0, duration: durationFromPulse(target.pulseRate ?? 1) }
    this.heartVoice = new HeartVoice({ chamber: { target }, player })
    this.text = `ScanPulse: short spatial ping to ${target.x ?? 0}, ${target.y ?? 0}; delay trail ${Math.max(0.08, this.pulse.duration * 0.55).toFixed(2)} second(s).`
  }

  toVoicePayloads() {
    const ping = this.heartVoice.toVoicePayload()
    const trailDuration = Math.max(0.08, this.pulse.duration * 0.55)
    const pulseRate = this.target.pulseRate ?? 1

    return [
      {
        ...ping,
        duration: Math.min(0.24, ping.duration),
        gain: dbGain(-10),
        seed: {
          ...ping.seed,
          role: 'scan-response-ping',
          scanResponseLayer: true,
        },
        tone: {
          ...ping.tone,
          effectChain: ['feedbackDelay'],
        },
      },
      {
        category: 'scan',
        duration: trailDuration,
        gain: dbGain(-22),
        position: this.target,
        seed: {
          ...this.target,
          brightness: clamp((this.target.brightness ?? 0.45) * 0.8),
          oscillatorType: 'am',
          pulseRate,
          role: 'scan-response-trail',
          scanPulseTrail: true,
          scanResponseLayer: true,
          waveform: 'triangle',
        },
        tone: {
          brightness: clamp((this.target.brightness ?? 0.45) * 0.8),
          effectChain: ['feedbackDelay', 'multitapDelay'],
          frequency: ratioToFrequency((this.target.pitchRatio ?? 1) * 0.5, 45),
          harmonic: [
            { coefficient: 1, gain: 1, type: 'triangle' },
            { coefficient: pulseRate, gain: 0.22 + this.pulse.brightness * 0.3, type: 'sine' },
          ],
          mode: 'am',
          pulseRate,
          type: 'triangle',
        },
      },
    ]
  }

  play(engine) {
    this.toVoicePayloads().forEach((payload) => engine.voice(payload))
  }
}

export class HazardVoice {
  constructor({ chamber = {}, seed = {} } = {}) {
    this.chamber = chamber
    this.hazard = chamber.hazards?.[0] ?? chamber.target ?? { pitchRatio: semanticRatio('hazard'), pulseRate: semanticPulse('hazard') }
    this.position = chamber.target ?? this.hazard.position ?? { x: 0, y: 0 }
    this.seed = seed
    this.forbiddenAxis = this.hazard.pitchRatio ? 'pitchRatio' : this.hazard.pulseRate ? 'pulseRate' : 'ecology'
    this.role = `hazard-${this.forbiddenAxis}-voice`
    this.text = `HazardVoice: ${this.hazard.message ?? 'unstable ecology'} at ${this.position.x ?? 0}, ${this.position.y ?? 0}; forbidden ${this.forbiddenAxis}.`
  }

  toVoicePayload() {
    const pulseRate = this.hazard.pulseRate ?? 0.75
    const pitchRatio = this.hazard.pitchRatio ?? 0.75

    return {
      category: 'hazard',
      duration: durationFromPulse(pulseRate) * 1.8,
      gain: dbGain(-7),
      position: this.position,
      seed: {
        ...this.seed,
        brightness: 0.18,
        fmAmount: 0.75,
        hazardVoice: true,
        oscillatorType: 'fm',
        pulseRate,
        role: this.role,
        waveform: 'sawtooth',
      },
      tone: {
        brightness: 0.18,
        effectChain: ['feedbackDelay'],
        frequency: ratioToFrequency(pitchRatio, 42),
        mode: 'fm',
        modAmount: 0.7,
        pulseRate,
        type: 'sawtooth',
      },
    }
  }

  play(engine) {
    engine.voice(this.toVoicePayload())
  }
}

export class BoundaryVoice {
  constructor({ kind = 'edge', position = { x: 0, y: 0 }, proximity = 0 } = {}) {
    this.kind = kind
    this.position = position
    this.proximity = proximity
    this.text = `BoundaryVoice: ${kind} locator at ${position.x ?? 0}, ${position.y ?? 0}; proximity ${Number(proximity).toFixed(1)} step(s).`
  }

  toVoicePayload() {
    if (this.kind === 'doorway') {
      return {
        category: 'ambience',
        duration: 0.3,
        gain: dbGain(-30),
        position: this.position,
        seed: { boundaryVoice: true, kind: this.kind },
        tone: {
          brightness: 0.42,
          frequency: ratioToFrequency(1.2, 45),
          harmonic: [
            { coefficient: 1, gain: 1, type: 'sine' },
            { coefficient: 2, gain: 0.16, type: 'triangle' },
          ],
          mode: 'additive',
          pulseRate: 0.8,
          type: 'sine',
        },
      }
    }

    if (this.kind === 'return') {
      return {
        category: 'scan',
        duration: 0.32,
        gain: dbGain(-24),
        position: this.position,
        seed: { boundaryVoice: true, kind: this.kind },
        tone: {
          brightness: 0.5,
          effectChain: ['feedbackDelay'],
          frequency: ratioToFrequency(1, 42),
          mode: 'additive',
          pulseRate: 0.7,
          type: 'triangle',
        },
      }
    }

    if (this.kind === 'edge-warning') {
      return {
        category: 'hazard',
        duration: 0.22,
        gain: dbGain(-16),
        position: this.position,
        seed: { boundaryVoice: true, kind: this.kind },
        tone: {
          brightness: 0.22,
          frequency: ratioToFrequency(0.75, 38),
          mode: 'fm',
          modAmount: 0.45,
          pulseRate: 0.8,
          type: 'square',
        },
      }
    }

    return {
      category: 'ambience',
      duration: 0.28,
      gain: dbGain(-31),
      position: this.position,
      seed: { boundaryVoice: true, kind: this.kind },
      tone: {
        brightness: 0.18,
        frequency: ratioToFrequency(0.65, 34),
        mode: 'am',
        pulseRate: 0.5,
        type: 'sine',
      },
    }
  }

  play(engine) {
    engine.voice(this.toVoicePayload())
  }
}

export class MemoryVoice {
  constructor({ record = {}, position = { x: 0, y: 0 } } = {}) {
    this.record = record
    this.position = position
    this.profile = memoryRecordVoiceProfile(record)
    this.text = `MemoryVoice: ${record.title ?? record.id ?? 'codex perception'} reveal through ${this.profile.formantPair.join(' to ')} formants.`
  }

  toVoicePayload() {
    return {
      category: 'ambience',
      duration: 0.9,
      gain: dbGain(-15),
      position: this.position,
      seed: {
        brightness: 0.38,
        fmAmount: 0.12,
        memoryVoice: true,
        oscillatorType: 'am',
        pulseRate: this.profile.pulseRate,
        waveform: 'triangle',
      },
      tone: {
        brightness: 0.38,
        effectChain: ['talkbox', 'multitapDelay'],
        formantMix: this.profile.formantMix,
        formantPair: this.profile.formantPair,
        frequency: ratioToFrequency(this.profile.pitchRatio, 44),
        mode: 'am',
        pulseRate: this.profile.pulseRate,
        type: 'triangle',
      },
    }
  }

  play(engine) {
    engine.voice(this.toVoicePayload())
  }
}

const systemDroneProfiles = {
  Canopy: { brightness: 0.72, ratio: 1.5, type: 'triangle' },
  Heart: { brightness: 0.8, ratio: 2, type: 'triangle' },
  Intake: { brightness: 0.42, ratio: 1, type: 'sine' },
  Memory: { brightness: 0.38, ratio: 0.75, type: 'triangle' },
  Navigation: { brightness: 0.55, ratio: 1.25, type: 'sine' },
  Water: { brightness: 0.48, ratio: 1.2, type: 'sine' },
}

export class SystemDrone {
  constructor({ chamber = {}, restored = true } = {}) {
    this.chamber = chamber
    this.restored = restored
    this.role = restored ? 'restored-system-drone' : 'preview-system-drone'
    this.profile = systemDroneProfiles[chamber.system] ?? { brightness: 0.5, ratio: 1, type: 'sine' }
    this.text = `SystemDrone: ${chamber.system ?? 'Ark'} ${restored ? 'restored' : 'preview'} layer for ${chamber.title ?? 'chamber'}.`
  }

  toVoicePayload() {
    const target = this.chamber.target ?? { brightness: this.profile.brightness, pitchRatio: this.profile.ratio, pulseRate: 1, x: 0, y: 0 }
    const pulseRate = Math.max(0.4, target.pulseRate ?? 1)
    const brightness = clamp((target.brightness ?? this.profile.brightness) * (this.restored ? 1.05 : 0.75))

    return {
      category: 'music',
      duration: durationFromPulse(pulseRate) * (this.restored ? 5 : 3),
      gain: dbGain(this.restored ? -22 : -27),
      position: target,
      seed: {
        brightness,
        oscillatorType: 'am',
        pulseRate,
        role: this.role,
        systemDrone: true,
        system: this.chamber.system,
        waveform: this.profile.type,
      },
      tone: {
        brightness,
        effectChain: chamberEffectChain(this.chamber),
        frequency: ratioToFrequency((target.pitchRatio ?? 1) * this.profile.ratio, 36),
        harmonic: [
          { coefficient: 1, gain: 1, type: this.profile.type },
          { coefficient: 2, gain: this.restored ? 0.28 : 0.14, type: 'triangle' },
        ],
        mode: 'additive',
        pulseRate,
        type: this.profile.type,
      },
    }
  }

  play(engine) {
    engine.voice(this.toVoicePayload())
  }
}

export class StepVoice {
  constructor({ chamber = {}, player = {}, previous = {} } = {}) {
    this.chamber = chamber
    this.player = player
    this.previous = previous
    this.feedback = movementFeedback(player, previous, chamber)
    this.movedDistance = Math.hypot((player.x ?? 0) - (previous.x ?? 0), (player.y ?? 0) - (previous.y ?? 0))
    this.position = directionalFootstepPosition(player, previous)
    this.text = `StepVoice: ${this.feedback.surface ?? 'surface'} movement cue at ${this.position.x ?? 0}, ${this.position.y ?? 0}; distance ${this.movedDistance.toFixed(1)}.`
  }

  toVoicePayload() {
    return {
      category: 'ui',
      duration: 0.11 + this.movedDistance * 0.04,
      gain: dbGain(-13),
      position: this.position,
      seed: {
        stepVoice: true,
        surface: this.feedback.surface,
      },
      spatial: true,
      tone: footstepTone(this.feedback.surface, this.player),
    }
  }

  play(engine) {
    engine.voice(this.toVoicePayload())
  }
}

export class AmbientBed {
  constructor({ chamber = {}, index = 0, seed = {} } = {}) {
    this.chamber = chamber
    this.index = index
    this.seed = seed
    this.target = chamber.target ?? { brightness: 0.45, pitchRatio: 1, pulseRate: 1, x: 0, y: 0 }
    this.ratio = seed.pitchRatio ?? this.target.pitchRatio
    this.pulseRate = seed.pulseRate ?? this.target.pulseRate
    this.text = `Ambient bed: ${chamber.title ?? 'chamber'} layer ${index + 1} at ${seed.position?.x ?? this.target.x ?? 0}, ${seed.position?.y ?? this.target.y ?? 0}.`
  }

  toVoicePayload() {
    return {
      category: 'ambience',
      duration: durationFromPulse(this.pulseRate) * 2.5,
      gain: dbGain(-20 + clamp(this.target.brightness) * 5),
      position: this.seed.position ?? this.target,
      seed: {
        ...this.seed,
        ambientBed: true,
        brightness: this.seed.brightness ?? this.target.brightness,
        oscillatorType: this.seed.oscillatorType ?? 'am',
        pulseRate: this.pulseRate,
        waveform: this.seed.waveform ?? 'sine',
      },
      tone: {
        brightness: this.seed.brightness ?? this.target.brightness,
        frequency: ratioToFrequency(this.ratio, 38 + this.index * 5),
        mode: 'am',
        pulseRate: this.pulseRate,
        type: this.seed.waveform ?? 'sine',
      },
    }
  }

  play(engine) {
    engine.voice(this.toVoicePayload())
  }
}

const formantFactories = {
  createA: () => syngen.formant.createA(),
  createE: () => syngen.formant.createE(),
  createI: () => syngen.formant.createI(),
  createO: () => syngen.formant.createO(),
  createU: () => syngen.formant.createU(),
}

function createFormant(factoryName = 'createU') {
  return (formantFactories[factoryName] ?? formantFactories.createU)()
}

function createEffectPlugin(effect, tone = {}) {
  if (effect === 'feedbackDelay') return syngen.effect.feedbackDelay({ delay: 0.18, feedback: 0.28, wet: 0.18 })
  if (effect === 'multitapDelay') {
    return syngen.effect.multitapDelay({
      tap: [
        { delay: 0.12, feedback: 0.18, gain: 0.36 },
        { delay: 0.28, feedback: 0.12, gain: 0.2 },
      ],
      wet: 0.22,
    })
  }
  if (effect === 'phaser') return syngen.effect.phaser({ depth: 0.0008, delay: 0.006, feedback: 0.12, frequency: 0.18, wet: 0.2 })
  if (effect === 'pingPongDelay') return syngen.effect.pingPongDelay({ delay: 0.24, feedback: 0.2, wet: 0.16 })
  if (effect === 'talkbox') {
    const [formant0, formant1] = tone.formantPair ?? ['createU', 'createA']
    return syngen.effect.talkbox({
      dry: 0.18,
      formant0: createFormant(formant0),
      formant1: createFormant(formant1),
      mix: tone.formantMix ?? 0.5,
      wet: 0.72,
    })
  }
  return undefined
}

function applyEffectChain(synth, effects = [], tone = {}) {
  for (const effect of effects) {
    const plugin = createEffectPlugin(effect, tone)
    if (plugin) synth.chain(plugin)
  }
  return synth
}

function createSynthForTone(tone, seed) {
  const frequency = tone.frequency
  const gain = syngen.const.zeroGain
  const factory = seedSynthFactoryName(seed, tone)
  const shape = seedShapeTimbreProfile(seed, tone)

  if (factory === 'fm') {
    return syngen.synth.fm({
      carrierFrequency: frequency,
      carrierType: seed?.waveform ?? tone.type,
      gain,
      modDepth: frequency * clamp((seed?.fmAmount ?? tone.modAmount ?? 0.2) * shape.distortionDrive, 0.05, 1.1),
      modFrequency: frequency * (1 + clamp(seed?.amAmount ?? 0.2, 0, 1)),
    })
  }

  if (factory === 'am') {
    return syngen.synth.am({
      carrierFrequency: frequency,
      carrierGain: 0.8,
      carrierType: seed?.waveform ?? tone.type,
      gain,
      modDepth: clamp((seed?.amAmount ?? tone.modAmount ?? 0.25) * shape.pulseAccent, 0.05, 0.95),
      modFrequency: Math.max(0.25, seed?.pulseRate ?? tone.pulseRate ?? 1) * shape.pulseAccent,
    })
  }

  if (factory === 'amBuffer') {
    return syngen.synth.amBuffer({
      buffer: generatedNoiseBedBuffer(seed, tone),
      gain,
      modDepth: clamp((seed?.noiseAmount ?? 0.2) + shape.mutationSpread, 0.05, 0.9),
      modFrequency: Math.max(0.25, seed?.pulseRate ?? tone.pulseRate ?? 1) * shape.pulseAccent,
      playbackRate: clamp(frequency / syngen.utility.midiToFrequency(48), 0.25, 4),
    })
  }

  if (tone.mode === 'additive') {
    return syngen.synth.additive({
      detune: tone.detune ?? 0,
      frequency,
      gain,
      harmonic: tone.harmonic,
    })
  }

  return syngen.synth.additive({
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
    this.listenerPosition = createListenerPositionState()
    this.buses = {}
    this.hasAudioStack = Boolean(syngen?.synth?.additive && syngen?.synth?.am && syngen?.synth?.amBuffer && syngen?.synth?.fm && syngen?.audio?.mixer && syngen?.buffer?.whiteNoise && syngen?.buffer?.pinkNoise && syngen?.buffer?.brownNoise && syngen?.buffer?.impulse && syngen?.shape?.distort && syngen?.shape?.pulse && syngen?.effect?.talkbox && syngen?.formant?.createA && syngen?.sound?.extend && syngen?.sound?.instantiate)
    this.spatialVoice = createSpatialVoicePrototype()
    this.chamberEffectChain = []
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
    this.frameHandler = null
    this.seedLoops = new Map()
  }

  syncSeedObjects(chamberId, plantedSeeds = []) {
    const active = new Set(plantedSeeds.map((seed, index) => SeedVoice.key(chamberId, seed, index)))
    for (const [key, loop] of this.seedLoops.entries()) {
      if (active.has(key)) continue
      this.seedLoops.delete(key)
    }
    plantedSeeds.forEach((seed, index) => {
      const key = SeedVoice.key(chamberId, seed, index)
      if (this.seedLoops.has(key)) return
      const voice = new SeedVoice({ chamberId, index, seed, startedAt: this.audioTime() })
      voice.play(this)
      this.seedLoops.set(key, voice)
    })
    this.startFrameLoop()
  }

  clearSeedObjects() {
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
    this.startFrameLoop()
    this.enabled = true
    return true
  }

  audioTime() {
    return this.hasAudioStack ? syngen.audio.time() : Date.now() / 1000
  }

  startFrameLoop() {
    if (!this.hasAudioStack) return
    if (this.frameHandler) return
    this.frameHandler = () => {
      this.tickSeedObjects()
      this.tickMusic()
    }
    syngen.loop.on('frame', this.frameHandler)
  }

  createBuses() {
    if (!this.hasAudioStack) return
    if (Object.keys(this.buses).length) return
    for (const key of Object.values(categoryBus)) {
      this.buses[key] = syngen.audio.mixer.createBus()
    }
    syngen.audio.mixer.auxiliary.reverb.setImpulse(generatedImpulseBuffer({ channels: 2, duration: 2, power: 2 }))
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
    return this.listenerPosition.update(player)
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
    const activeTone = {
      ...tone,
      effectChain: tone.effectChain ?? (category === 'ui' ? [] : this.chamberEffectChain),
    }
    const bus = this.bus(category)
    if (!spatial) {
      const shape = seedShapeTimbreProfile(seed, activeTone)
      const synth = applyEffectChain(createSynthForTone(activeTone, seed), activeTone.effectChain, activeTone)
        .filtered({
          frequency: syngen.utility.lerp(700, 7200, clamp(seed?.brightness ?? activeTone.brightness ?? 0.5)) * shape.brightnessTilt,
          Q: 0.8 + clamp(seed?.fmAmount ?? shape.mutationSpread) * 6,
          type: activeTone.filterType ?? 'lowpass',
        })
      connectVoice(synth, bus)
      scheduleEnvelope(synth, {
        attack: seed?.envelope?.attack ?? activeTone.attack,
        decay: seed?.envelope?.decay ?? activeTone.decay,
        duration,
        gain,
        release: seed?.envelope?.release ?? activeTone.release,
        sustain: seed?.envelope?.sustain ?? activeTone.sustain,
      })
      return
    }

    const x = position?.x ?? 0
    const y = position?.y ?? 0
    const sound = syngen.sound.instantiate.call(this.spatialVoice, {
      destination: bus,
      duration,
      gain,
      seed,
      tone: activeTone,
      voiceRole: spatialVoiceRoleForCategory(category),
      x,
      y,
      z: 0,
    })
    setTimeout(() => sound.destroy(), (duration + 0.1) * 1000)
  }

  tickMusic() {
    if (!this.enabled || !this.music.enabled) return
    const now = this.audioTime()
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

  tickSeedObjects() {
    if (!this.enabled || !this.seedLoops.size) return
    const now = this.audioTime()
    for (const loop of this.seedLoops.values()) {
      loop.tick(this, now)
    }
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
    new ScanPulse({ player, target }).play(this)
  }

  resonance(result = {}, chamber = {}) {
    new HeartVoice({ chamber, result }).play(this)
    if (result.solved) new SystemDrone({ chamber, restored: true }).play(this)
  }

  movement(player, previous, chamber = {}) {
    this.updateListener(player)
    const feedback = movementFeedback(player, previous, chamber)
    const wallPosition = boundaryPresencePosition(player, feedback)

    new StepVoice({ chamber, player, previous }).play(this)

    this.voice({
      category: 'ambience',
      duration: 0.35,
      gain: dbGain(-23),
      position: feedback.currentPosition,
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

    if (feedback.nearestWall <= 2.5) {
      new BoundaryVoice({ kind: 'edge', position: wallPosition, proximity: feedback.nearestWall }).play(this)
    }

    if (feedback.exitDistance <= 2.5) {
      new BoundaryVoice({ kind: 'doorway', position: feedback.exitPosition, proximity: feedback.exitDistance }).play(this)
    }

    if (feedback.nearestWall <= 1.5) {
      new BoundaryVoice({ kind: 'edge-warning', position: wallPosition, proximity: feedback.nearestWall }).play(this)
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
    new HazardVoice({ chamber, seed }).play(this)
  }

  memory(record = {}, position = { x: 0, y: 0 }) {
    new MemoryVoice({ record, position }).play(this)
  }

  chamber(chamber, plantedSeeds = []) {
    this.setMusicScene('game', { chamber, plantedSeeds })
    this.chamberEffectChain = chamberEffectChain(chamber)
    this.syncSeedObjects(chamber.id, plantedSeeds)
    const ecology = plantedSeeds.length ? plantedSeeds : [{ ...chamber.target, waveform: 'sine', oscillatorType: 'am', fmAmount: 0.1, amAmount: 0.2, noiseAmount: 0.05 }]
    ecology.forEach((seed, index) => {
      setTimeout(() => {
        new AmbientBed({ chamber, index, seed }).play(this)
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

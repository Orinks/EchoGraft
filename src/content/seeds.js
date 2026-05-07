import { createRng, pick } from './rng.js'

export const waveforms = ['sine', 'triangle', 'sawtooth', 'square']
export const oscillatorTypes = ['pure', 'fm', 'am', 'noise-kissed']
export const growthBehaviors = ['steady', 'climbing', 'breathing', 'twining']
export const tuningParameters = ['pitchRatio', 'pulseRate', 'brightness', 'phase', 'envelope.attack', 'envelope.release', 'fmAmount', 'amAmount', 'noiseAmount', 'growthBehavior']

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function createSeedDNA(seedId, overrides = {}) {
  const rng = createRng(seedId)
  const dna = {
    id: seedId,
    name: overrides.name ?? `Seed ${seedId}`,
    waveform: pick(waveforms, rng),
    pitchRatio: Number((0.75 + rng() * 1.75).toFixed(2)),
    oscillatorType: pick(oscillatorTypes, rng),
    brightness: Number((0.25 + rng() * 0.7).toFixed(2)),
    fmAmount: Number((rng() * 0.45).toFixed(2)),
    amAmount: Number((rng() * 0.45).toFixed(2)),
    noiseAmount: Number((rng() * 0.25).toFixed(2)),
    envelope: {
      attack: Number((0.01 + rng() * 0.08).toFixed(2)),
      decay: Number((0.08 + rng() * 0.18).toFixed(2)),
      sustain: Number((0.35 + rng() * 0.45).toFixed(2)),
      release: Number((0.15 + rng() * 0.35).toFixed(2)),
    },
    pulseRate: Number((0.5 + rng() * 3.5).toFixed(2)),
    position: {
      x: Number((rng() * 8 - 4).toFixed(1)),
      y: Number((rng() * 8 - 4).toFixed(1)),
    },
    phase: Number((rng() * 360).toFixed(0)),
    growthBehavior: pick(growthBehaviors, rng),
    ...overrides,
  }
  return normalizeSeed(dna)
}

export function normalizeSeed(seed) {
  return {
    ...seed,
    envelope: {
      attack: clamp(Number(seed.envelope?.attack ?? 0.02), 0.01, 0.25),
      decay: clamp(Number(seed.envelope?.decay ?? 0.12), 0.04, 0.5),
      sustain: clamp(Number(seed.envelope?.sustain ?? 0.5), 0.1, 1),
      release: clamp(Number(seed.envelope?.release ?? 0.25), 0.05, 1),
    },
    pitchRatio: clamp(Number(seed.pitchRatio), 0.5, 3),
    brightness: clamp(Number(seed.brightness), 0, 1),
    fmAmount: clamp(Number(seed.fmAmount ?? 0), 0, 1),
    amAmount: clamp(Number(seed.amAmount ?? 0), 0, 1),
    noiseAmount: clamp(Number(seed.noiseAmount ?? 0), 0, 1),
    pulseRate: clamp(Number(seed.pulseRate), 0.25, 6),
    phase: ((Number(seed.phase) % 360) + 360) % 360,
  }
}

export function tuneSeed(seed, parameter, direction, step = 1) {
  const tuned = structuredClone(seed)
  tuned.envelope = tuned.envelope ?? { attack: 0.02, decay: 0.12, sustain: 0.5, release: 0.25 }
  const delta = direction * step
  if (parameter === 'pitchRatio') tuned.pitchRatio = Number((tuned.pitchRatio + delta * 0.05).toFixed(2))
  if (parameter === 'pulseRate') tuned.pulseRate = Number((tuned.pulseRate + delta * 0.25).toFixed(2))
  if (parameter === 'brightness') tuned.brightness = Number((tuned.brightness + delta * 0.05).toFixed(2))
  if (parameter === 'phase') tuned.phase = tuned.phase + delta * 15
  if (parameter === 'envelope.attack') tuned.envelope.attack = Number((tuned.envelope.attack + delta * 0.01).toFixed(2))
  if (parameter === 'envelope.release') tuned.envelope.release = Number((tuned.envelope.release + delta * 0.05).toFixed(2))
  if (parameter === 'fmAmount') tuned.fmAmount = Number((tuned.fmAmount + delta * 0.05).toFixed(2))
  if (parameter === 'amAmount') tuned.amAmount = Number((tuned.amAmount + delta * 0.05).toFixed(2))
  if (parameter === 'noiseAmount') tuned.noiseAmount = Number((tuned.noiseAmount + delta * 0.05).toFixed(2))
  if (parameter === 'growthBehavior') {
    const current = growthBehaviors.indexOf(tuned.growthBehavior)
    tuned.growthBehavior = growthBehaviors[(current + direction + growthBehaviors.length) % growthBehaviors.length]
  }
  return normalizeSeed(tuned)
}

export function graftSeeds(seedA, seedB, id = `${seedA.id}-${seedB.id}-graft`) {
  return normalizeSeed({
    id,
    name: `${seedA.name.split(' ')[0]}-${seedB.name.split(' ')[0]} graft`,
    waveform: seedA.waveform,
    oscillatorType: seedB.oscillatorType,
    pitchRatio: Number(((seedA.pitchRatio + seedB.pitchRatio) / 2).toFixed(2)),
    brightness: Number(((seedA.brightness + seedB.brightness) / 2).toFixed(2)),
    fmAmount: Math.max(seedA.fmAmount, seedB.fmAmount),
    amAmount: Math.max(seedA.amAmount, seedB.amAmount),
    noiseAmount: Number(((seedA.noiseAmount + seedB.noiseAmount) / 2).toFixed(2)),
    envelope: seedA.envelope,
    pulseRate: Number(((seedA.pulseRate + seedB.pulseRate) / 2).toFixed(2)),
    position: seedA.position,
    phase: Math.round((seedA.phase + seedB.phase) / 2),
    growthBehavior: seedB.growthBehavior,
    grafted: true,
  })
}

export function graftDiscoveries(seed) {
  const discoveries = ['hybrid resonance planting']
  if (seed.fmAmount >= 0.4) discoveries.push('FM pressure grafting')
  if (seed.amAmount >= 0.4) discoveries.push('AM current shaping')
  if (seed.noiseAmount >= 0.2) discoveries.push('noise-bed masking')
  if (seed.growthBehavior === 'twining') discoveries.push('twined multi-position growth')
  return discoveries
}

export const starterSeeds = [
  createSeedDNA('sol', { name: 'Sol phonoseed', waveform: 'sine', pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0 }),
  createSeedDNA('lumen', { name: 'Lumen phonoseed', waveform: 'triangle', pitchRatio: 1.5, pulseRate: 2, brightness: 0.7, phase: 90 }),
  createSeedDNA('umbra', { name: 'Umbra phonoseed', waveform: 'square', pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.25, phase: 180 }),
  createSeedDNA('spire', { name: 'Spire phonoseed', waveform: 'sawtooth', pitchRatio: 2, pulseRate: 3, brightness: 0.85, phase: 270 }),
]

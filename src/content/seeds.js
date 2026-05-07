import { createRng, pick } from './rng.js'

export const waveforms = ['sine', 'triangle', 'sawtooth', 'square']
export const oscillatorTypes = ['pure', 'fm', 'am', 'noise-kissed']
export const growthBehaviors = ['steady', 'climbing', 'breathing', 'twining']
export const tuningParameters = ['pitchRatio', 'pulseRate', 'brightness', 'phase', 'envelope.attack', 'envelope.release', 'fmAmount', 'amAmount', 'noiseAmount', 'growthBehavior']

export const tuningParameterDetails = {
  amAmount: { label: 'AM modulation', role: 'current sway and rhythmic amplitude motion' },
  brightness: { label: 'brightness/filter', role: 'filter opening and canopy light color' },
  'envelope.attack': { label: 'envelope attack', role: 'how quickly the seed voice blooms' },
  'envelope.release': { label: 'envelope release', role: 'how long the seed voice lingers' },
  fmAmount: { label: 'FM modulation', role: 'pressure, root grit, and harmonic edge' },
  growthBehavior: { label: 'growth behavior', role: 'how the planted voice behaves over time' },
  noiseAmount: { label: 'noise amount', role: 'breath, compost, and masking texture' },
  phase: { label: 'phase', role: 'alignment, cancellation, and hidden echo behavior' },
  pitchRatio: { label: 'pitch ratio', role: 'root interval against the chamber heart' },
  pulseRate: { label: 'pulse rate', role: 'rhythmic growth and system timing' },
}

export const seedFamilies = [
  { id: 'sol', name: 'Sol', affinity: 'oxygen and stable pitch', origin: 'Intake lung' },
  { id: 'lumen', name: 'Lumen', affinity: 'canopy light and brightness', origin: 'Glass leaves' },
  { id: 'umbra', name: 'Umbra', affinity: 'phase cancellation and hidden records', origin: 'Quiet mirror' },
  { id: 'spire', name: 'Spire', affinity: 'altitude and canopy access', origin: 'Mold pressure lock' },
  { id: 'verdant', name: 'Verdant', affinity: 'growth rhythm and pulse timing', origin: 'Canopy pulse trellis' },
  { id: 'myco', name: 'Myco', affinity: 'noise, compost, and root networks', origin: 'Mycelium gate' },
  { id: 'glass', name: 'Glass', affinity: 'high brightness and reflections', origin: 'Sun prism' },
  { id: 'tide', name: 'Tide', affinity: 'AM current systems', origin: 'Water pumps' },
  { id: 'ember', name: 'Ember', affinity: 'heat and thermal shutters', origin: 'Pressure orchard' },
  { id: 'archive', name: 'Archive', affinity: 'formant memory and codex echoes', origin: 'Memory pond' },
  { id: 'moss', name: 'Moss', affinity: 'surface timbre and soft landings', origin: 'Root reservoir' },
  { id: 'reed', name: 'Reed', affinity: 'airflow and wind bellows', origin: 'Wind bellows' },
  { id: 'prism', name: 'Prism', affinity: 'weather refraction and scan trails', origin: 'Prism duet' },
  { id: 'loam', name: 'Loam', affinity: 'archive loam and ancestry reveal', origin: 'Dream compost' },
  { id: 'resin', name: 'Resin', affinity: 'trait locking and graft stability', origin: 'Rhizome splice' },
  { id: 'pollen', name: 'Pollen', affinity: 'glass pollen and brightness traits', origin: 'Rain return' },
  { id: 'chorus', name: 'Chorus', affinity: 'two-seed harmonic relationships', origin: 'Root choir' },
  { id: 'drift', name: 'Drift', affinity: 'slow weather windows and planning', origin: 'Fog harp' },
  { id: 'veil', name: 'Veil', affinity: 'phase fog and inverted direction cues', origin: 'Fog braid' },
  { id: 'pulse', name: 'Pulse', affinity: 'restoration timing and crew wake cycles', origin: 'Heart atria' },
  { id: 'bloom', name: 'Bloom', affinity: 'static bloom and weak-seed masking', origin: 'Heart glass' },
  { id: 'anchor', name: 'Anchor', affinity: 'deep root stability and release endings', origin: 'Heart root' },
  { id: 'vow', name: 'Vow', affinity: 'memory choices and conservatory endings', origin: 'Heart memory' },
  { id: 'hybrid', name: 'Hybrid', affinity: 'adaptation endings and inherited mechanics', origin: 'Heart graft' },
]

export const graftDiscoveryCatalog = seedFamilies.flatMap((familyA, index) =>
  seedFamilies.slice(index + 1).map((familyB) => ({
    id: `${familyA.id}-${familyB.id}`,
    title: `${familyA.name}-${familyB.name} graft`,
    families: [familyA.name, familyB.name],
    mechanic: `${familyA.affinity} braided with ${familyB.affinity}`,
    record: `A ${familyA.name}-${familyB.name} graft can reveal how ${familyA.origin} and ${familyB.origin} respond to shared restoration pressure.`,
  })),
).slice(0, 96)

export function graftDiscoveryForFamilies(seedA, seedB) {
  const families = [seedA.family, seedB.family].filter(Boolean).sort()
  return graftDiscoveryCatalog.find((discovery) => [...discovery.families].sort().join('|') === families.join('|'))
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function createSeedDNA(seedId, overrides = {}) {
  const rng = createRng(seedId)
  const family = seedFamilies.find((item) => seedId.toLowerCase().startsWith(item.id)) ?? seedFamilies[Math.floor(rng() * seedFamilies.length)]
  const dna = {
    id: seedId,
    name: overrides.name ?? `Seed ${seedId}`,
    family: overrides.family ?? family.name,
    ecologicalAffinity: overrides.ecologicalAffinity ?? family.affinity,
    discoveredOrigin: overrides.discoveredOrigin ?? family.origin,
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

export function tuningLabel(parameter) {
  return tuningParameterDetails[parameter]?.label ?? parameter
}

export function tuningValue(seed, parameter) {
  if (parameter === 'envelope.attack') return seed.envelope?.attack
  if (parameter === 'envelope.release') return seed.envelope?.release
  return seed[parameter]
}

export function tuneSeedWithReport(seed, parameter, direction, step = 1) {
  const before = tuningValue(seed, parameter)
  const tuned = tuneSeed(seed, parameter, direction, step)
  const after = tuningValue(tuned, parameter)
  const label = tuningLabel(parameter)
  const role = tuningParameterDetails[parameter]?.role ?? 'seed voice behavior'

  return {
    after,
    before,
    label,
    role,
    seed: tuned,
    text: `Tuned ${tuned.name}: ${parameter} is ${after} (was ${before}; ${label}). Single-seed tuning role: ${role}.`,
  }
}

export function graftSeeds(seedA, seedB, id = `${seedA.id}-${seedB.id}-graft`) {
  const discovery = graftDiscoveryForFamilies(seedA, seedB)
  return normalizeSeed({
    id,
    name: `${seedA.name.split(' ')[0]}-${seedB.name.split(' ')[0]} graft`,
    family: discovery?.title ?? `${seedA.family ?? 'Unknown'}-${seedB.family ?? 'Unknown'}`,
    ecologicalAffinity: discovery?.mechanic ?? 'hybrid restoration behavior',
    discoveredOrigin: discovery?.record ?? 'Uncatalogued graft discovery.',
    graftAncestry: [seedA.family ?? seedA.id, seedB.family ?? seedB.id],
    discoveryId: discovery?.id,
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

export function graftSeedsWithReport(seedA, seedB, id = `${seedA.id}-${seedB.id}-graft`) {
  const seed = graftSeeds(seedA, seedB, id)
  const discoveries = graftDiscoveries(seed)
  const inheritedTraits = [
    `waveform ${seed.waveform} from ${seedA.name}`,
    `synth ${seed.oscillatorType} from ${seedB.name}`,
    `growth ${seed.growthBehavior} from ${seedB.name}`,
    `envelope attack ${seed.envelope.attack} from ${seedA.name}`,
  ]

  return {
    discoveries,
    inheritedTraits,
    seed,
    text: `First graft: ${seedA.name} plus ${seedB.name} created ${seed.name}. Inherited ${inheritedTraits.join('; ')}. Discovery ${seed.discoveryId ?? 'uncatalogued'}; unlocked ${discoveries.join(', ')}.`,
  }
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

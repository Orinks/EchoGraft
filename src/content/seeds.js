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
    lineageHistory: overrides.lineageHistory ?? [`${family.name} lineage first recovered from ${family.origin}; affinity: ${family.affinity}.`],
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
    name: String(seed.name ?? (seed.id ? `Seed ${seed.id}` : 'Unnamed phonoseed')),
    family: String(seed.family ?? 'Unknown'),
    ecologicalAffinity: String(seed.ecologicalAffinity ?? 'unmapped ecology'),
    discoveredOrigin: String(seed.discoveredOrigin ?? 'unknown origin'),
    waveform: waveforms.includes(seed.waveform) ? seed.waveform : 'sine',
    oscillatorType: oscillatorTypes.includes(seed.oscillatorType) ? seed.oscillatorType : 'pure',
    envelope: {
      attack: clamp(Number(seed.envelope?.attack ?? 0.02), 0.01, 0.25),
      decay: clamp(Number(seed.envelope?.decay ?? 0.12), 0.04, 0.5),
      sustain: clamp(Number(seed.envelope?.sustain ?? 0.5), 0.1, 1),
      release: clamp(Number(seed.envelope?.release ?? 0.25), 0.05, 1),
    },
    pitchRatio: clamp(Number(seed.pitchRatio ?? 1), 0.5, 3),
    brightness: clamp(Number(seed.brightness ?? 0.5), 0, 1),
    fmAmount: clamp(Number(seed.fmAmount ?? 0), 0, 1),
    amAmount: clamp(Number(seed.amAmount ?? 0), 0, 1),
    noiseAmount: clamp(Number(seed.noiseAmount ?? 0), 0, 1),
    pulseRate: clamp(Number(seed.pulseRate ?? 1), 0.25, 6),
    phase: ((Number(seed.phase ?? 0) % 360) + 360) % 360,
    growthBehavior: growthBehaviors.includes(seed.growthBehavior) ? seed.growthBehavior : 'steady',
  }
}

export function seedNameState(seed) {
  const name = String(seed.name ?? (seed.id ? `Seed ${seed.id}` : 'Unnamed phonoseed'))
  const id = String(seed.id ?? name.toLowerCase().replace(/\s+/g, '-'))

  return {
    id,
    name,
    text: `Seed name: ${name}; catalog id ${id}.`,
  }
}

export function seedFamilyState(seed) {
  const family = String(seed.family ?? 'Unknown')
  const affinity = String(seed.ecologicalAffinity ?? 'unmapped ecology')
  const origin = String(seed.discoveredOrigin ?? 'unknown origin')

  return {
    affinity,
    family,
    origin,
    text: `Seed family: ${family}; affinity ${affinity}; discovered origin ${origin}.`,
  }
}

export function seedEcologicalAffinityState(seed) {
  const affinity = String(seed.ecologicalAffinity ?? 'unmapped ecology')
  const family = String(seed.family ?? 'Unknown')
  const role = affinity === 'unmapped ecology'
    ? 'restoration role not mapped yet'
    : `restoration role for ${family} ecology`

  return {
    affinity,
    family,
    role,
    text: `Ecological affinity: ${affinity}; ${role}.`,
  }
}

export function seedDiscoveredOriginState(seed) {
  const family = String(seed.family ?? 'Unknown')
  const origin = String(seed.discoveredOrigin ?? 'unknown origin')
  const recordRole = origin === 'unknown origin'
    ? 'origin record not recovered yet'
    : `origin record for ${family} lineage and Memory codex echoes`

  return {
    family,
    origin,
    recordRole,
    text: `Discovered origin: ${origin}; ${recordRole}.`,
  }
}

export function seedGraftAncestryState(seed) {
  const parents = Array.isArray(seed.graftAncestry) ? seed.graftAncestry.filter(Boolean) : []
  const grafted = Boolean(seed.grafted || parents.length)
  const parentText = parents.length ? parents.join(' plus ') : 'none'
  const record = seed.discoveryId ?? 'no graft discovery record'

  return {
    grafted,
    parents,
    record,
    text: grafted
      ? `Graft ancestry: ${parentText}; archive record ${record}; hybrid traits inherited from parent seed lines.`
      : 'Graft ancestry: none; base seed line.',
  }
}

export function seedPitchRatioState(seed, targetPitchRatio) {
  const pitchRatio = clamp(Number(seed.pitchRatio ?? 1), 0.5, 3)
  const targetDelta = targetPitchRatio === undefined ? undefined : Number((pitchRatio - targetPitchRatio).toFixed(2))
  const role = tuningParameterDetails.pitchRatio.role

  return {
    pitchRatio,
    role,
    targetDelta,
    text: targetDelta === undefined
      ? `Pitch ratio: ${pitchRatio}; ${role}.`
      : `Pitch ratio: ${pitchRatio}; target delta ${targetDelta}; ${role}.`,
  }
}

export function seedPulseRateState(seed, targetPulseRate) {
  const pulseRate = clamp(Number(seed.pulseRate ?? 1), 0.25, 6)
  const targetDelta = targetPulseRate === undefined ? undefined : Number((pulseRate - targetPulseRate).toFixed(2))
  const role = tuningParameterDetails.pulseRate.role

  return {
    pulseRate,
    role,
    targetDelta,
    text: targetDelta === undefined
      ? `Pulse rate: ${pulseRate}; ${role}.`
      : `Pulse rate: ${pulseRate}; target delta ${targetDelta}; ${role}.`,
  }
}

export function seedBrightnessState(seed, targetBrightness) {
  const brightness = clamp(Number(seed.brightness ?? 0.5), 0, 1)
  const targetDelta = targetBrightness === undefined ? undefined : Number((brightness - targetBrightness).toFixed(2))
  const role = tuningParameterDetails.brightness.role

  return {
    brightness,
    role,
    targetDelta,
    text: targetDelta === undefined
      ? `Brightness/filter: ${brightness}; ${role}.`
      : `Brightness/filter: ${brightness}; target delta ${targetDelta}; ${role}.`,
  }
}

export function seedPhaseState(seed, targetPhase) {
  const phase = ((Number(seed.phase ?? 0) % 360) + 360) % 360
  const targetDelta = targetPhase === undefined ? undefined : Number((((phase - targetPhase + 540) % 360) - 180).toFixed(0))
  const role = tuningParameterDetails.phase.role

  return {
    phase,
    role,
    targetDelta,
    text: targetDelta === undefined
      ? `Phase: ${phase} degrees; ${role}.`
      : `Phase: ${phase} degrees; target offset ${targetDelta} degrees; ${role}.`,
  }
}

export function seedWaveformState(seed, requiredWaveforms = []) {
  const waveform = waveforms.includes(seed.waveform) ? seed.waveform : 'sine'
  const required = requiredWaveforms.length ? requiredWaveforms.join(' or ') : 'any chamber-compatible waveform'
  const matchesRequirement = requiredWaveforms.length ? requiredWaveforms.includes(waveform) : true

  return {
    matchesRequirement,
    requiredWaveforms,
    text: `Waveform: ${waveform}; timbre shape for synthesis and graft inheritance; ${matchesRequirement ? 'matches' : 'does not match'} ${required}.`,
    waveform,
  }
}

export function seedSynthTypeState(seed) {
  const oscillatorType = oscillatorTypes.includes(seed.oscillatorType) ? seed.oscillatorType : 'pure'
  const routingByType = {
    am: 'amplitude-modulated Syngen voice',
    fm: 'frequency-modulated Syngen voice',
    'noise-kissed': 'buffer-noise kissed Syngen voice',
    pure: 'additive Syngen voice',
  }
  const routing = routingByType[oscillatorType]

  return {
    oscillatorType,
    routing,
    text: `Synth type: ${oscillatorType}; routes to ${routing}.`,
  }
}

export function seedModulationProfileState(seed) {
  const fmAmount = clamp(Number(seed.fmAmount ?? 0), 0, 1)
  const amAmount = clamp(Number(seed.amAmount ?? 0), 0, 1)
  const noiseAmount = clamp(Number(seed.noiseAmount ?? 0), 0, 1)
  const layers = [
    { amount: fmAmount, label: 'FM', role: tuningParameterDetails.fmAmount.role },
    { amount: amAmount, label: 'AM', role: tuningParameterDetails.amAmount.role },
    { amount: noiseAmount, label: 'noise', role: tuningParameterDetails.noiseAmount.role },
  ]
  const dominant = layers.reduce((best, layer) => (layer.amount > best.amount ? layer : best), layers[0])
  const dominantLayer = dominant.amount > 0 ? dominant.label : 'none'

  return {
    amAmount,
    dominantLayer,
    fmAmount,
    noiseAmount,
    text: `Modulation profile: FM ${fmAmount} (${tuningParameterDetails.fmAmount.role}), AM ${amAmount} (${tuningParameterDetails.amAmount.role}), noise ${noiseAmount} (${tuningParameterDetails.noiseAmount.role}); dominant layer ${dominantLayer}.`,
  }
}

export function seedEnvelopeState(seed) {
  const envelope = {
    attack: clamp(Number(seed.envelope?.attack ?? 0.02), 0.01, 0.25),
    decay: clamp(Number(seed.envelope?.decay ?? 0.12), 0.04, 0.5),
    sustain: clamp(Number(seed.envelope?.sustain ?? 0.5), 0.1, 1),
    release: clamp(Number(seed.envelope?.release ?? 0.25), 0.05, 1),
  }

  return {
    envelope,
    text: `Envelope: attack ${envelope.attack} (${tuningParameterDetails['envelope.attack'].role}), decay ${envelope.decay}, sustain ${envelope.sustain}, release ${envelope.release} (${tuningParameterDetails['envelope.release'].role}); ADSR shape controls bloom, body, and lingering tail.`,
  }
}

export function seedNoiseProfileState(seed) {
  const noiseAmount = clamp(Number(seed.noiseAmount ?? 0), 0, 1)
  const texture = noiseAmount >= 0.5
    ? 'dense masking bed'
    : noiseAmount >= 0.2
      ? 'compost hiss'
      : noiseAmount > 0
        ? 'breath trace'
        : 'clean tone'
  const synthRoute = seed.oscillatorType === 'noise-kissed'
    ? 'noise-kissed Syngen buffer voice'
    : 'additive or modulated Syngen voice with harmonic noise color'

  return {
    noiseAmount,
    synthRoute,
    text: `Noise profile: ${noiseAmount}; ${texture}; ${tuningParameterDetails.noiseAmount.role}; routes through ${synthRoute}.`,
    texture,
  }
}

export function seedGrowthBehaviorState(seed, chamber = {}) {
  const profiles = {
    breathing: { pulses: 4, role: 'expands and rests between pulses' },
    climbing: { pulses: 5, role: 'steps upward through the chamber over several pulses' },
    steady: { pulses: 3, role: 'settles evenly before joining resonance' },
    twining: { pulses: 6, role: 'braids with nearby planted voices over a longer cycle' },
  }
  const behavior = growthBehaviors.includes(seed.growthBehavior) ? seed.growthBehavior : 'steady'
  const profile = profiles[behavior]
  const pulseRate = Math.max(Number(seed.pulseRate ?? chamber.target?.pulseRate ?? 1), 0.25)
  const seconds = Number(((profile.pulses / pulseRate) * 4).toFixed(1))

  return {
    behavior,
    pulses: profile.pulses,
    role: profile.role,
    seconds,
    text: `Growth behavior: ${behavior}; ${profile.role}; ${profile.pulses} pulse growth window, about ${seconds} seconds; no reflex timing required.`,
  }
}

export function seedLockedTraits(seed = {}) {
  return Array.from(new Set((seed.lockedTraits ?? []).filter((trait) => tuningParameters.includes(trait))))
}

export function resinTraitLockState(saveOrMaterials = {}, seed = {}, parameter = 'pitchRatio') {
  const materials = saveOrMaterials.materials ?? saveOrMaterials
  const balance = Math.max(0, materials.resin ?? 0)
  const cost = 1
  const lockedTraits = seedLockedTraits(seed)
  const alreadyLocked = lockedTraits.includes(parameter)
  const canLock = balance >= cost && !alreadyLocked
  const label = tuningLabel(parameter)

  return {
    alreadyLocked,
    balance,
    canLock,
    cost,
    lockedTraits,
    remaining: Math.max(0, balance - (canLock ? cost : 0)),
    text: alreadyLocked
      ? `Resin lock: ${label} is already locked on ${seed.name ?? 'this seed'}.`
      : canLock
        ? `Resin lock ready: spend ${cost} resin to preserve ${label}; ${balance - cost} will remain.`
        : `Resin lock unavailable: gather resin to preserve ${label} before tuning or grafting.`,
  }
}

export function lockSeedTrait(seed, parameter = 'pitchRatio') {
  if (!tuningParameters.includes(parameter)) return normalizeSeed(seed)
  return normalizeSeed({
    ...seed,
    lockedTraits: Array.from(new Set([...seedLockedTraits(seed), parameter])),
  })
}

export function tuneSeed(seed, parameter, direction, step = 1) {
  if (seedLockedTraits(seed).includes(parameter)) return normalizeSeed(seed)
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

export function canopyBrightnessTuningState(save = {}) {
  const canopyOnline = save.restoredSystems?.includes('Canopy') || save.restoredSystems?.includes('Canopy lights')
  const brightnessStep = canopyOnline ? 0.03 : 0.05

  return {
    brightnessStep,
    canopyOnline,
    text: canopyOnline
      ? `Canopy brightness tuning unlocked: brightness changes in ${brightnessStep.toFixed(2)} steps for photosynthesis doors.`
      : `Basic brightness tuning: restore Canopy to unlock finer photosynthesis-door control.`,
  }
}

export function tuningLabel(parameter) {
  return tuningParameterDetails[parameter]?.label ?? parameter
}

export function tuningValue(seed, parameter) {
  if (parameter === 'envelope.attack') return seed.envelope?.attack
  if (parameter === 'envelope.release') return seed.envelope?.release
  return seed[parameter]
}

export function sporeTuningCurrencyState(saveOrMaterials = {}, parameter = 'pitchRatio') {
  const materials = saveOrMaterials.materials ?? saveOrMaterials
  const balance = Math.max(0, materials.spores ?? 0)
  const cost = 1
  const label = tuningLabel(parameter)
  const role = tuningParameterDetails[parameter]?.role ?? 'seed voice behavior'
  const canSpend = balance >= cost

  return {
    balance,
    canSpend,
    cost,
    remaining: Math.max(0, balance - (canSpend ? cost : 0)),
    text: canSpend
      ? `Spores spent as tuning currency: ${cost} spore for ${label}; ${role}; ${balance - cost} remain.`
      : `Spores are the common tuning currency; none are available, so this training adjustment is free.`,
  }
}

export function tuneSeedWithReport(seed, parameter, direction, step = 1) {
  const before = tuningValue(seed, parameter)
  const locked = seedLockedTraits(seed).includes(parameter)
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
    text: locked
      ? `Tuned ${tuned.name}: ${parameter} is locked by resin at ${after} (was ${before}; ${label}). Single-seed tuning role: ${role}.`
      : `Tuned ${tuned.name}: ${parameter} is ${after} (was ${before}; ${label}). Single-seed tuning role: ${role}.`,
  }
}

export function seedAudioPreview(seed) {
  const envelope = seed.envelope ?? {}
  const parts = [
    `pitch ${seed.pitchRatio}`,
    `pulse ${seed.pulseRate}`,
    `brightness ${seed.brightness}`,
    `phase ${seed.phase}`,
    `waveform ${seed.waveform}`,
    `synth ${seed.oscillatorType}`,
    `envelope attack ${envelope.attack}`,
    `release ${envelope.release}`,
    `growth ${seed.growthBehavior}`,
  ]

  return {
    parts,
    seed,
    text: `Previewing ${seed.name}. Audio preview: ${parts.join(', ')}.`,
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
    lineageHistory: [
      ...(seedA.lineageHistory ?? [`${seedA.family ?? seedA.id} lineage history unknown.`]),
      ...(seedB.lineageHistory ?? [`${seedB.family ?? seedB.id} lineage history unknown.`]),
      discovery?.record ?? `A graft between ${seedA.family ?? seedA.id} and ${seedB.family ?? seedB.id} has no archive record yet.`,
    ],
    lockedTraits: Array.from(new Set([...seedLockedTraits(seedA), ...seedLockedTraits(seedB)])),
    discoveryId: discovery?.id,
    waveform: seedA.waveform,
    oscillatorType: seedB.oscillatorType,
    pitchRatio: seedA.pitchRatio,
    brightness: Number(((seedA.brightness + seedB.brightness) / 2).toFixed(2)),
    fmAmount: seedB.fmAmount,
    amAmount: seedB.amAmount,
    noiseAmount: seedB.noiseAmount,
    envelope: seedA.envelope,
    pulseRate: Number(((seedA.pulseRate + seedB.pulseRate) / 2).toFixed(2)),
    position: seedA.position,
    phase: Math.round((seedA.phase + seedB.phase) / 2),
    growthBehavior: seedB.growthBehavior,
    grafted: true,
  })
}

export function failedGraftUtility(seedA, seedB, id = `${seedA.id}-${seedB.id}-failed-graft`) {
  const noisyTool = normalizeSeed({
    amAmount: Math.max(seedA.amAmount ?? 0, seedB.amAmount ?? 0),
    brightness: Number((((seedA.brightness ?? 0.5) + (seedB.brightness ?? 0.5)) / 2).toFixed(2)),
    ecologicalAffinity: 'compost, masking texture, and noisy utility',
    failedGraft: true,
    family: 'Failed graft',
    fmAmount: Math.max(seedA.fmAmount ?? 0, seedB.fmAmount ?? 0),
    graftAncestry: [seedA.family, seedB.family],
    grafted: true,
    growthBehavior: 'twining',
    id,
    name: `${seedA.name.split(' ')[0]}-${seedB.name.split(' ')[0]} noisy graft tool`,
    noiseAmount: Math.max(0.35, seedA.noiseAmount ?? 0, seedB.noiseAmount ?? 0),
    oscillatorType: 'noise-kissed',
    pitchRatio: Number((((seedA.pitchRatio ?? 1) + (seedB.pitchRatio ?? 1)) / 2).toFixed(2)),
    pulseRate: Number((((seedA.pulseRate ?? 1) + (seedB.pulseRate ?? 1)) / 2).toFixed(2)),
    waveform: 'square',
  })

  return {
    compostYield: 1,
    noisyTool,
    status: 'failed',
    text: `Failed graft: ${seedA.name} plus ${seedB.name} did not stabilize. Recovered 1 dream compost and ${noisyTool.name} as a noise-kissed tool for masking hazards.`,
  }
}

export function graftFailureReason(seedA, seedB) {
  if ((seedA.family ?? seedA.id) === (seedB.family ?? seedB.id)) return 'matching family lines need a second family to stabilize'
  return undefined
}

export function restoredSystemInheritedTraits(restoredSystems = []) {
  const restored = new Set(restoredSystems)
  const systemTraits = [
    { system: 'Intake', trait: 'breath-root sustain', text: 'Intake unlocks breath-root sustain inheritance for oxygen-stable seed lines.' },
    { system: 'Navigation', trait: 'compass phase tag', text: 'Navigation unlocks compass phase tags for orientation-aware grafts.' },
    { system: 'Water', trait: 'current-carried AM sway', text: 'Water unlocks current-carried AM sway inheritance.' },
    { system: 'Canopy', trait: 'photosynthetic brightness bloom', text: 'Canopy unlocks photosynthetic brightness bloom inheritance.' },
    { system: 'Memory', trait: 'archive ancestry echo', text: 'Memory unlocks archive ancestry echo inheritance.' },
    { system: 'Heart', trait: 'network resonance braid', text: 'Heart unlocks network resonance braid inheritance.' },
  ]

  return systemTraits.filter(({ system }) =>
    restored.has(system) || Array.from(restored).some((item) => item.toLowerCase().includes(system.toLowerCase())))
}

export function glassPollenUnlockedTraits(saveOrMaterials = {}) {
  const materials = saveOrMaterials.materials ?? saveOrMaterials
  const count = Math.max(0, materials.glassPollen ?? 0)
  const traits = count > 0
    ? [
        { trait: 'brightness bloom tuning', text: 'Glass pollen unlocks brightness bloom tuning for light-reactive seed lines.' },
        { trait: 'edged timbre inheritance', text: 'Glass pollen unlocks edged timbre inheritance for triangle, sawtooth, and square waveforms.' },
      ]
    : []

  return {
    count,
    traits,
    unlocked: traits.length > 0,
    text: traits.length
      ? `Glass pollen traits unlocked: ${traits.map((item) => item.trait).join(', ')}.`
      : 'Glass pollen traits locked: recover glass pollen to unlock brightness and timbre traits.',
  }
}

export function rareGraftRewards(seed, discoveries = graftDiscoveries(seed), record = graftRecordForSeed(seed)) {
  const rareSignals = discoveries.filter((discovery) => discovery !== 'hybrid resonance planting')
  const rare = Boolean(record) || rareSignals.length > 0 || (seed.unlockedInheritedTraits?.length ?? 0) > 0
  const rewards = []

  if (record) rewards.push({ kind: 'record', id: record.id, text: `record reveal ${record.title}` })
  if (rareSignals.length) {
    rewards.push({
      kind: 'bonus-contract',
      id: `bonus-${seed.discoveryId ?? seed.id}`,
      text: `bonus contract lead from ${rareSignals.join(', ')}`,
    })
  }
  if ((seed.unlockedInheritedTraits?.length ?? 0) > 0 || rareSignals.length >= 2) {
    rewards.push({
      kind: 'rating-improvement',
      id: `rating-${seed.discoveryId ?? seed.id}`,
      text: 'improved restoration rating option for graft-compatible chambers',
    })
  }

  return {
    rare,
    rewards,
    text: rare
      ? `Rare graft rewards: ${rewards.map((reward) => reward.text).join('; ')}.`
      : 'Rare graft rewards: none yet; keep experimenting with stronger trait contrasts.',
  }
}

export function graftSeedsWithReport(seedA, seedB, id = `${seedA.id}-${seedB.id}-graft`, options = {}) {
  const failureReason = options.forceFailure ? 'forced graft instability' : graftFailureReason(seedA, seedB)
  if (failureReason) {
    const failure = failedGraftUtility(seedA, seedB, id)
    return {
      ...failure,
      failureReason,
      text: `${failure.text} Failure reason: ${failureReason}.`,
    }
  }

  const seed = graftSeeds(seedA, seedB, id)
  const discoveries = graftDiscoveries(seed)
  const record = graftRecordForSeed(seed)
  const unlockedInheritedTraits = restoredSystemInheritedTraits(options.restoredSystems ?? [])
  const glassPollenTraits = glassPollenUnlockedTraits(options.materials ?? {}).traits
  const seedWithUnlocks = {
    ...seed,
    glassPollenTraits,
    unlockedInheritedTraits,
  }
  const rareRewards = rareGraftRewards(seedWithUnlocks, discoveries, record)
  const inheritedTraits = [
    `root pitch ${seed.pitchRatio} from ${seedA.name}`,
    `waveform ${seed.waveform} from ${seedA.name}`,
    `synth ${seed.oscillatorType} from ${seedB.name}`,
    `modulation FM ${seed.fmAmount}, AM ${seed.amAmount}, noise ${seed.noiseAmount} from ${seedB.name}`,
    `growth ${seed.growthBehavior} from ${seedB.name}`,
    `envelope attack ${seed.envelope.attack} from ${seedA.name}`,
    ...(seedLockedTraits(seed).length ? [`resin locked ${seedLockedTraits(seed).map(tuningLabel).join(', ')}`] : []),
    ...glassPollenTraits.map(({ trait }) => `glass pollen unlocked ${trait}`),
    ...unlockedInheritedTraits.map(({ system, trait }) => `restored ${system} unlocked ${trait}`),
  ]

  return {
    discoveries,
    inheritedTraits,
    rareRewards,
    record,
    seed: seedWithUnlocks,
    glassPollenTraits,
    unlockedInheritedTraits,
    text: `First graft: ${seedA.name} plus ${seedB.name} created ${seed.name}. Inherited ${inheritedTraits.join('; ')}. Discovery ${seed.discoveryId ?? 'uncatalogued'}; unlocked ${discoveries.join(', ')}${record ? `; recovered record ${record.title}` : ''}. ${rareRewards.text}`,
  }
}

export function graftRecordForSeed(seed) {
  if (!seed.discoveryId || !seed.discoveredOrigin) return undefined

  return {
    id: `graft-record-${seed.discoveryId}`,
    title: `${seed.family} record`,
    text: seed.discoveredOrigin,
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

export function seedLineageText(seed) {
  const history = seed.lineageHistory?.length ? seed.lineageHistory.join(' ') : `${seed.family ?? seed.name} lineage history unknown.`
  const ancestry = seed.graftAncestry?.length ? ` Graft ancestry: ${seed.graftAncestry.join(' plus ')}.` : ''
  return `Lineage: ${history}${ancestry}`
}

export function historicalSeedTraitState(seed, save = {}) {
  const memoryOnline = save.restoredSystems?.includes('Memory') || save.restoredSystems?.includes('Memory Orchard')

  return {
    memoryOnline,
    text: memoryOnline
      ? `Historical seed trait: ${seed.family ?? 'unknown family'} from ${seed.discoveredOrigin ?? 'unknown origin'} carries ${seed.ecologicalAffinity ?? 'unmapped ecology'}.`
      : 'Historical seed traits locked until Memory comes online.',
  }
}

export const starterSeeds = [
  createSeedDNA('sol', { name: 'Sol phonoseed', waveform: 'sine', pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0 }),
  createSeedDNA('lumen', { name: 'Lumen phonoseed', waveform: 'triangle', pitchRatio: 1.5, pulseRate: 2, brightness: 0.7, phase: 90 }),
  createSeedDNA('umbra', { name: 'Umbra phonoseed', waveform: 'square', pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.25, phase: 180 }),
  createSeedDNA('spire', { name: 'Spire phonoseed', waveform: 'sawtooth', pitchRatio: 2, pulseRate: 3, brightness: 0.85, phase: 270 }),
]

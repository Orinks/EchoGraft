import { createSeedDNA } from './seeds.js'

export function solveTimeText(chamber) {
  const { min, max } = chamber.solveTimeMinutes
  return min === max ? `${min} minute solve` : `${min} to ${max} minute solve`
}

export function estimatedDifficulty(chamber) {
  if (chamber.difficulty) return chamber.difficulty
  if (chamber.contractType === 'training') return 'introductory'
  if (chamber.contractType === 'finale' || chamber.contractType === 'conservatory') return 'endgame'
  if (chamber.requiresGraft || chamber.optional || chamber.solveTimeMinutes.max >= 10) return 'advanced'
  return 'standard'
}

export function contractRequirementStatus(chamber) {
  const status = chamber.optional ? 'optional' : 'required'

  return {
    status,
    required: !chamber.optional,
    optional: Boolean(chamber.optional),
    text: `Requirement status: ${status}.`,
  }
}

export function knownHazardsSummary(chamber) {
  const hazards = chamber.hazards ?? []
  return {
    count: hazards.length,
    hazards,
    text: hazards.length
      ? `Known hazards: ${hazards.map((hazard) => hazard.message).join('; ')}`
      : 'Known hazards: none recorded for this contract.',
  }
}

export function rewardSummary(chamber) {
  const rewards = chamber.rewards ?? {}
  const parts = []
  const materials = Object.entries(rewards.materials ?? {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${key} ${value}`)

  if (materials.length) parts.push(`materials ${materials.join(', ')}`)
  if (rewards.codex?.length) parts.push(`records ${rewards.codex.join(', ')}`)
  if (rewards.seeds?.length) parts.push(`seeds ${rewards.seeds.join(', ')}`)

  return {
    parts,
    text: parts.length ? `Reward: ${parts.join('; ')}.` : 'Reward: no immediate reward recorded.',
  }
}

export function chamberCycleState(chamber, arkClock = 0) {
  if (!chamber.cycle?.states?.length) return undefined

  const interval = Math.max(1, chamber.cycle.interval ?? 1)
  const index = Math.floor(arkClock / interval) % chamber.cycle.states.length
  const state = chamber.cycle.states[index]
  const nextIn = interval - (arkClock % interval)

  return {
    ...state,
    index,
    interval,
    nextIn,
    text: `${chamber.cycle.name}: ${state.name}. ${state.text} Next change in ${nextIn} Ark cycle(s).`,
  }
}

export function weatherWindowState(chamber, arkClock = 0) {
  if (!chamber.weatherWindow) return undefined

  const cycle = chamberCycleState(chamber, arkClock)
  if (!cycle) return undefined

  const preferredStateIds = chamber.weatherWindow.preferredStateIds ?? []
  const favorable = preferredStateIds.includes(cycle.id)
  let nextFavorableIn = favorable ? 0 : undefined

  if (!favorable) {
    for (let offset = 1; offset <= cycle.interval * chamber.cycle.states.length; offset += 1) {
      const next = chamberCycleState(chamber, arkClock + offset)
      if (preferredStateIds.includes(next.id)) {
        nextFavorableIn = offset
        break
      }
    }
  }

  return {
    cycle,
    favorable,
    nextFavorableIn,
    reward: chamber.weatherWindow.reward,
    text: favorable
      ? `Weather window favorable: ${cycle.name}. ${chamber.weatherWindow.reward} ${chamber.weatherWindow.text}.`
      : `Weather window planning: ${cycle.name} is not ideal. ${chamber.weatherWindow.reward} in ${nextFavorableIn} Ark cycle(s) if you wait.`,
  }
}

export function restorationContractSummary(chamber) {
  if (chamber.contractType !== 'restoration') return undefined

  return {
    subsystem: chamber.system,
    text: `Restoration contract: repairs the named Ark subsystem ${chamber.system} through ${chamber.mechanic}.`,
  }
}

export function stabilizationContractSummary(chamber, chamberList = chambers) {
  if (chamber.contractType !== 'stabilization') return undefined

  const target = chamberList.find((item) => item.id === chamber.stabilization?.improvesChamberId)
  return {
    improvesChamberId: chamber.stabilization?.improvesChamberId,
    targetRating: chamber.stabilization?.targetRating ?? 'Stable',
    text: `Stabilization contract: improves restored chamber ${target?.title ?? chamber.stabilization?.improvesChamberId ?? 'unknown'} toward ${chamber.stabilization?.targetRating ?? 'Stable'} rating through ${chamber.mechanic}.`,
  }
}

export function researchContractSummary(chamber) {
  if (chamber.contractType !== 'research') return undefined

  const reveal = chamber.researchReveal ?? { kind: 'record', name: chamber.rewards?.codex?.[0] }
  return {
    kind: reveal.kind,
    name: reveal.name,
    text: `Research contract: reveals ${reveal.kind} ${reveal.name} through ${chamber.mechanic}.`,
  }
}

export function emergencyContractSummary(chamber) {
  if (chamber.contractType !== 'emergency') return undefined

  const deadline = chamber.emergency?.softDeadlineMinutes
  return {
    hazardCount: chamber.hazards?.length ?? 0,
    softDeadlineMinutes: deadline,
    text: `Emergency contract: contains ${chamber.hazards?.length ?? 0} unstable hazard(s) with a soft deadline of ${deadline} minutes; ${chamber.emergency?.consequence ?? 'uncontained hazards reduce rating potential'}.`,
  }
}

export function conservatoryContractSummary(chamber) {
  if (chamber.contractType !== 'conservatory') return undefined

  return {
    compositionModes: chamber.conservatory?.compositionModes ?? [],
    curation: chamber.conservatory?.curation ?? '',
    text: `Conservatory contract: lets the player compose with ${chamber.conservatory?.compositionModes?.join(', ') ?? 'seed voice'} modes and curate seed voices by ${chamber.conservatory?.curation ?? 'reviewing recovered voices'}.`,
  }
}

export function finaleContractSummary(chamber) {
  if (chamber.contractType !== 'finale') return undefined

  return {
    networkContribution: chamber.finaleNetwork?.contribution ?? '',
    systems: chamber.finaleNetwork?.systems ?? [],
    text: `Finale contract: contributes to the endgame Ark network by ${chamber.finaleNetwork?.contribution ?? 'joining restored systems into a final resonance network'}.`,
  }
}

export const campaignScope = {
  firstFullCampaignHours: { min: 6, max: 10 },
  seasons: [
    { id: 1, name: 'Intake and Orientation', requiredContracts: 8, optionalContracts: 2 },
    { id: 2, name: 'Rootworks', requiredContracts: 8, optionalContracts: 4 },
    { id: 3, name: 'Glass Weather', requiredContracts: 8, optionalContracts: 4 },
    { id: 4, name: 'Memory Orchard', requiredContracts: 8, optionalContracts: 4 },
    { id: 5, name: 'Verdancy Heart', requiredContracts: 8, optionalContracts: 4 },
  ],
}

export const majorArkSystems = [
  { id: 'intake', name: 'Intake', unlock: 'longer scan range and pressure awareness' },
  { id: 'navigation', name: 'Navigation', unlock: 'atlas previews, objective scan, and chamber compass cues' },
  { id: 'water', name: 'Water', unlock: 'current navigation and root contract routing' },
  { id: 'canopy', name: 'Canopy', unlock: 'brightness tuning and photosynthesis doors' },
  { id: 'memory', name: 'Memory', unlock: 'codex echoes and historical seed traits' },
  { id: 'heart', name: 'Heart', unlock: 'network resonance and endgame resolutions' },
]

export const chambers = [
  {
    id: 'tutorial',
    title: 'Training Contract: First Breath',
    season: 1,
    system: 'Intake',
    contractType: 'training',
    mechanic: 'movement, listening, and scan',
    training: {
      focus: 'chamber heart scan',
      stakes: 'low',
      text: 'Teaches one safe mechanic: listen, locate, and scan for the chamber heart before any hazard or resource pressure appears.',
    },
    objective: 'Move, scan the chamber heart, plant Sol, and match the calm heart tone.',
    start: { x: 0, y: -2, facing: 0 },
    target: { x: 0, y: 0, pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 5, max: 6 },
    tolerances: { position: 1.5, pitchRatio: 0.15, pulseRate: 0.4, brightness: 0.2, phase: 180 },
    rewards: { codex: ['first-breath', 'gardener-note-01', 'crew-message-12', 'plant-memory-01', 'seed-ancestry-01'], materials: { biomass: 1, spores: 1 } },
  },
  {
    id: 'direction',
    title: 'Contract 1: Intake Lung',
    season: 1,
    system: 'Intake',
    contractType: 'restoration',
    mechanic: 'movement, listening, and chamber heart scan',
    objective: 'Use repeated scans to find and plant at the chamber heart.',
    start: { x: -3, y: -3, facing: 45 },
    target: { x: 1, y: 1, pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 5, max: 7 },
    tolerances: { position: 1.2, pitchRatio: 0.2, pulseRate: 0.5, brightness: 0.25, phase: 180 },
    requires: ['tutorial'],
    rewards: { codex: ['intake-lung', 'crew-message-01', 'system-diagnostic-01'], materials: { biomass: 2 } },
  },
  {
    id: 'binaural',
    title: 'Contract 2: Navigation Grove',
    season: 1,
    system: 'Navigation',
    contractType: 'restoration',
    mechanic: 'direction and distance',
    objective: 'Use scan panning to plant a seed west of the chamber heart.',
    start: { x: 3, y: 0, facing: 270 },
    target: { x: -2, y: 0, pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.2, pitchRatio: 0.2, pulseRate: 0.5, brightness: 0.25, phase: 180 },
    requires: ['direction'],
    rewards: { codex: ['navigation-grove', 'crew-message-02', 'system-diagnostic-02'], materials: { crystal: 1 } },
  },
  {
    id: 'pitch',
    title: 'Contract 3: Water Pump Third',
    season: 1,
    system: 'Water',
    contractType: 'restoration',
    mechanic: 'pitch-ratio matching',
    objective: 'Tune a seed to the bright third: ratio 1.5.',
    start: { x: 0, y: -3, facing: 0 },
    target: { x: 0, y: 1, pitchRatio: 1.5, pulseRate: 1, brightness: 0.45, phase: 0 },
    current: { dx: 0, dy: 1, name: 'pump current', text: 'north toward the water pump heart' },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.5, pitchRatio: 0.08, pulseRate: 0.6, brightness: 0.3, phase: 180 },
    requires: ['binaural'],
    rewards: { codex: ['water-pumps', 'crew-message-03', 'plant-memory-08', 'system-diagnostic-03', 'seed-ancestry-08'], materials: { biomass: 1, crystal: 1 } },
  },
  {
    id: 'rhythm',
    title: 'Contract 4: Canopy Pulse Trellis',
    season: 1,
    system: 'Canopy',
    contractType: 'restoration',
    mechanic: 'pulse-rate rhythm matching',
    objective: 'Match the two-beat trellis pulse.',
    start: { x: 0, y: -3, facing: 0 },
    target: { x: 0, y: 0, pitchRatio: 1, pulseRate: 2, brightness: 0.45, phase: 0 },
    requiredSeeds: 1,
    photosynthesis: { minBrightness: 0.45, text: 'photosynthetic canopy lattice opens when seed brightness reaches the trellis threshold' },
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.5, pitchRatio: 0.25, pulseRate: 0.2, brightness: 0.3, phase: 180 },
    requires: ['pitch'],
    rewards: { codex: ['canopy-pulse', 'crew-message-04', 'plant-memory-05', 'system-diagnostic-04', 'seed-ancestry-05'], materials: { biomass: 2, spores: 1 } },
  },
  {
    id: 'timbre',
    title: 'Contract 5: Glass Leaves',
    season: 1,
    system: 'Canopy',
    contractType: 'stabilization',
    mechanic: 'filter brightness',
    objective: 'Raise brightness until the seed cuts through the glass leaves.',
    start: { x: 0, y: -3, facing: 0 },
    target: { x: 0, y: 0, pitchRatio: 1, pulseRate: 1, brightness: 0.8, phase: 0 },
    requiredSeeds: 1,
    timbrePuzzle: { minBrightness: 0.72, waveforms: ['triangle', 'sawtooth'], text: 'glass leaves open for bright edged timbres instead of dull dark tones' },
    stabilization: { improvesChamberId: 'rhythm', targetRating: 'Stable' },
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.5, pitchRatio: 0.25, pulseRate: 0.6, brightness: 0.08, phase: 180 },
    requires: ['rhythm'],
    rewards: { codex: ['glass-leaves', 'gardener-note-07', 'plant-memory-02', 'system-diagnostic-12', 'seed-ancestry-02'], materials: { crystal: 2 } },
  },
  {
    id: 'harmony',
    title: 'Optional Contract: Twin Roots',
    season: 1,
    system: 'Rootworks',
    contractType: 'research',
    mechanic: 'two-seed harmonic planting',
    objective: 'Plant Sol and Lumen together to form a harmonic pair.',
    start: { x: 0, y: -3, facing: 0 },
    target: { x: 0, y: 0, pitchRatio: 1.25, pulseRate: 1.5, brightness: 0.58, phase: 45 },
    requiredSeeds: 2,
    plantingPattern: {
      name: 'twin root anchor points',
      offsets: [{ x: -1, y: 0 }, { x: 1, y: 0 }],
    },
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 2, pitchRatio: 0.3, pulseRate: 0.6, brightness: 0.25, phase: 180 },
    harmonic: true,
    optional: true,
    researchReveal: { kind: 'record', name: 'twin-roots' },
    requires: ['pitch'],
    rewards: { codex: ['twin-roots', 'gardener-note-05'], materials: { memory: 1 } },
  },
  {
    id: 'phase',
    title: 'Contract 6: Quiet Mirror',
    season: 1,
    system: 'Memory',
    contractType: 'restoration',
    mechanic: 'phase and cancellation',
    objective: 'Tune phase near 180 degrees to cancel the mirror drone.',
    start: { x: 0, y: -3, facing: 0 },
    target: { x: 0, y: 0, pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 180 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.5, pitchRatio: 0.25, pulseRate: 0.6, brightness: 0.3, phase: 20 },
    requires: ['timbre'],
    rewards: { codex: ['quiet-mirror', 'crew-message-05', 'plant-memory-03', 'system-diagnostic-05', 'seed-ancestry-03'], materials: { memory: 2 } },
  },
  {
    id: 'graft',
    title: 'Optional Contract: Splice Nursery',
    season: 1,
    system: 'Research',
    contractType: 'research',
    mechanic: 'grafting',
    objective: 'Graft two seeds and plant the new hybrid near ratio 1.25.',
    start: { x: 0, y: -3, facing: 0 },
    target: { x: 0, y: 0, pitchRatio: 1.25, pulseRate: 1.5, brightness: 0.58, phase: 45 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.5, pitchRatio: 0.15, pulseRate: 0.35, brightness: 0.2, phase: 100 },
    requiresGraft: true,
    optional: true,
    researchReveal: { kind: 'trait', name: 'graft ancestry' },
    requires: ['harmony'],
    rewards: { codex: ['splice-nursery', 'gardener-note-04', 'crew-message-06', 'plant-memory-11', 'system-diagnostic-09'], materials: { biomass: 1, memory: 1 } },
  },
  {
    id: 'mold',
    title: 'Contract 7: Mold Pressure Lock',
    season: 1,
    system: 'Intake',
    contractType: 'emergency',
    mechanic: 'hazard intervals',
    objective: 'Avoid the mold interval near 0.75 and tune to 2.0.',
    start: { x: 0, y: -3, facing: 0 },
    target: { x: 1, y: 0, pitchRatio: 2, pulseRate: 2, brightness: 0.7, phase: 90 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.5, pitchRatio: 0.12, pulseRate: 0.4, brightness: 0.2, phase: 120 },
    hazards: [{ pitchRatio: 0.75, radius: 0.2, message: 'Mold rejects the low fourth interval.' }],
    emergency: { softDeadlineMinutes: 10, consequence: 'mold pressure spreads if the low interval is not contained before the planning window closes' },
    requires: ['phase'],
    rewards: { codex: ['mold-pressure', 'gardener-note-08', 'crew-message-11', 'plant-memory-04', 'seed-ancestry-04'], materials: { biomass: 1, memory: 1, spores: 2 }, seeds: ['spire'] },
  },
  {
    id: 'finale',
    title: 'Contract 8: Verdancy Heart',
    season: 1,
    system: 'Heart',
    contractType: 'finale',
    mechanic: 'finale combination',
    objective: 'Use grafting, position, pitch, rhythm, timbre, and phase to restart the Ark.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: 2, y: 1, pitchRatio: 1.5, pulseRate: 2.5, brightness: 0.75, phase: 90 },
    requiredSeeds: 2,
    solveTimeMinutes: { min: 9, max: 10 },
    tolerances: { position: 1.2, pitchRatio: 0.16, pulseRate: 0.3, brightness: 0.12, phase: 45 },
    harmonic: true,
    requiresGraft: true,
    finaleNetwork: {
      contribution: 'braiding restored Intake, Navigation, Water, Canopy, Memory, and Heart voices into the Verdancy Heart chord',
      systems: ['Intake', 'Navigation', 'Water', 'Canopy', 'Memory', 'Heart'],
    },
    requires: ['mold'],
    rewards: { codex: ['verdancy-heart', 'gardener-note-06', 'crew-message-09', 'system-diagnostic-06'], materials: { biomass: 3, crystal: 2, memory: 2 } },
    ending: true,
  },
  {
    id: 'root-reservoir',
    title: 'Contract 9: Root Pumps',
    season: 2,
    system: 'Rootworks',
    contractType: 'restoration',
    mechanic: 'root pump pulse routing',
    objective: 'Slow the pulse and plant below the root pump heart so water can settle into the root mesh.',
    start: { x: -2, y: -4, facing: 0 },
    target: { x: -1, y: 2, pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.35, phase: 45 },
    requiredSeeds: 1,
    droughtPockets: { minStablePulseRate: 0.65, text: 'root mesh pulse remains stable when slow water does not drop into dry pockets' },
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.4, pitchRatio: 0.12, pulseRate: 0.18, brightness: 0.16, phase: 50 },
    requires: ['finale'],
    rewards: { codex: ['root-pumps', 'gardener-note-02', 'system-diagnostic-07'], materials: { biomass: 2, memory: 1 } },
  },
  {
    id: 'root-choir',
    title: 'Contract 10: Root Choir',
    season: 2,
    system: 'Rootworks',
    contractType: 'restoration',
    mechanic: 'harmonic root pairing',
    objective: 'Plant a paired harmony around the choir node to reconnect split root voices.',
    start: { x: 2, y: -3, facing: 315 },
    target: { x: 1, y: 1, pitchRatio: 1.25, pulseRate: 1.25, brightness: 0.52, phase: 90 },
    requiredSeeds: 2,
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.8, pitchRatio: 0.2, pulseRate: 0.25, brightness: 0.18, phase: 70 },
    harmonic: true,
    requires: ['root-reservoir'],
    rewards: { materials: { biomass: 2, crystal: 1 } },
  },
  {
    id: 'mycelium-gate',
    title: 'Contract 11: Fungus Relays',
    season: 2,
    system: 'Rootworks',
    contractType: 'emergency',
    mechanic: 'fungus relay hazard routing',
    objective: 'Route a bright relay tone past the sour mold band so the fungus network can carry root messages safely.',
    start: { x: -4, y: -1, facing: 90 },
    target: { x: 2, y: -1, pitchRatio: 1.5, pulseRate: 1.75, brightness: 0.68, phase: 120 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.3, pitchRatio: 0.1, pulseRate: 0.3, brightness: 0.14, phase: 55 },
    hazards: [{ pitchRatio: 0.67, radius: 0.18, message: 'Fungus relays buckle around the sour mold band.' }],
    emergency: { softDeadlineMinutes: 10, consequence: 'sour mold keeps relays unstable until routed around the forbidden band' },
    requires: ['root-choir'],
    rewards: { codex: ['fungus-relays', 'plant-memory-06', 'seed-ancestry-06'], materials: { biomass: 1, memory: 2, mycelium: 1, spores: 3 } },
  },
  {
    id: 'optional-root-echo',
    title: 'Optional Contract: Root Echo Survey',
    season: 2,
    system: 'Rootworks',
    contractType: 'survey',
    mechanic: 'phase echo mapping',
    objective: 'Map a delayed root echo by tuning phase before the next mainline gate opens.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: -2, y: 1, pitchRatio: 1, pulseRate: 1.5, brightness: 0.42, phase: 210 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.6, pitchRatio: 0.2, pulseRate: 0.35, brightness: 0.22, phase: 25 },
    optional: true,
    requires: ['root-choir'],
    rewards: { materials: { memory: 2 } },
  },
  {
    id: 'pressure-orchard',
    title: 'Contract 12: Pressure Orchard',
    season: 2,
    system: 'Intake',
    contractType: 'stabilization',
    mechanic: 'pressure rhythm balancing',
    objective: 'Balance intake pressure with a steady two-and-a-half pulse under the orchard vents.',
    start: { x: 3, y: -3, facing: 300 },
    target: { x: 0, y: 2, pitchRatio: 1, pulseRate: 2.5, brightness: 0.58, phase: 60 },
    requiredSeeds: 1,
    stabilization: { improvesChamberId: 'mycelium-gate', targetRating: 'Stable' },
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.5, pitchRatio: 0.18, pulseRate: 0.22, brightness: 0.16, phase: 65 },
    requires: ['mycelium-gate'],
    rewards: { materials: { biomass: 2, crystal: 1 } },
  },
  {
    id: 'optional-rhizome-splice',
    title: 'Optional Contract: Rhizome Splice',
    season: 2,
    system: 'Research',
    contractType: 'research',
    mechanic: 'grafted root behavior',
    objective: 'Use a grafted seed to teach a split rhizome to carry two growth behaviors at once.',
    start: { x: -3, y: -2, facing: 45 },
    target: { x: 1, y: 0, pitchRatio: 1.25, pulseRate: 1.75, brightness: 0.62, phase: 135 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.5, pitchRatio: 0.16, pulseRate: 0.28, brightness: 0.18, phase: 60 },
    requiresGraft: true,
    optional: true,
    researchReveal: { kind: 'trait', name: 'grafted root behavior' },
    requires: ['optional-root-echo'],
    rewards: { materials: { biomass: 1, memory: 2 } },
  },
  {
    id: 'nutrient-lattice',
    title: 'Contract 13: Nutrient Locks',
    season: 2,
    system: 'Rootworks',
    contractType: 'restoration',
    mechanic: 'nutrient lock brightness tuning',
    objective: 'Open the nutrient locks by raising brightness without pushing the buried line into overload.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: -1, y: -1, pitchRatio: 1.5, pulseRate: 2, brightness: 0.78, phase: 45 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.3, pitchRatio: 0.12, pulseRate: 0.25, brightness: 0.1, phase: 55 },
    requires: ['pressure-orchard'],
    hazards: [{ pitchRatio: 1.65, radius: 0.04, message: 'Nutrient locks overload if pitch climbs above the valve tone before brightness is balanced.' }],
    rewards: { codex: ['nutrient-locks'], materials: { crystal: 2, memory: 1 } },
  },
  {
    id: 'optional-deep-root',
    title: 'Optional Contract: Deep Root Solo',
    season: 2,
    system: 'Rootworks',
    contractType: 'challenge',
    mechanic: 'single-seed precision',
    objective: 'Restore a deep root with one seed and a narrow phase window.',
    start: { x: 2, y: -4, facing: 330 },
    target: { x: 2, y: 2, pitchRatio: 0.75, pulseRate: 1, brightness: 0.3, phase: 270 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.1, pitchRatio: 0.08, pulseRate: 0.22, brightness: 0.14, phase: 22 },
    optional: true,
    requires: ['nutrient-lattice'],
    rewards: { codex: ['gardener-note-09'], materials: { biomass: 2, memory: 1 } },
  },
  {
    id: 'glass-rain',
    title: 'Contract 14: Glass Rain',
    season: 3,
    system: 'Glass Weather',
    contractType: 'restoration',
    mechanic: 'rain pulse shaping',
    objective: 'Shape a gentle rain pulse that wets the glass canopy without cracking it.',
    start: { x: -2, y: -3, facing: 20 },
    target: { x: 0, y: 1, pitchRatio: 1, pulseRate: 1.75, brightness: 0.66, phase: 30 },
    requiredSeeds: 1,
    glassShear: { axis: 'vertical', text: 'glass rain sheets mirror objective scans across the canopy seam' },
    cycle: {
      name: 'glass rain weather state',
      interval: 2,
      states: [
        { id: 'mist', name: 'Mist lift', text: 'Soft rain opens distance cues and makes scans carry farther.' },
        { id: 'drizzle', name: 'Drizzle hold', text: 'Steady rain dampens sharp glass reflections for careful planting.' },
        { id: 'sunbreak', name: 'Sunbreak', text: 'Brief light through the rain brightens canopy glass before the next cycle.' },
      ],
    },
    weatherWindow: {
      preferredStateIds: ['drizzle'],
      reward: 'Drizzle planning lowers crack risk and steadies planting echoes',
      text: 'advance the Ark clock or schedule this contract so restoration work lands during steady rain',
    },
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.5, pitchRatio: 0.16, pulseRate: 0.22, brightness: 0.12, phase: 50 },
    requires: ['nutrient-lattice'],
    rewards: { codex: ['gardener-note-03', 'plant-memory-07', 'system-diagnostic-08', 'seed-ancestry-07'], materials: { crystal: 2 } },
  },
  {
    id: 'sun-prism',
    title: 'Contract 15: Sun Prism',
    season: 3,
    system: 'Glass Weather',
    contractType: 'stabilization',
    mechanic: 'high-brightness prism focus',
    objective: 'Focus a high-brightness tone into the prism so the Ark can read sunlight again.',
    start: { x: 3, y: -2, facing: 290 },
    target: { x: 1, y: 2, pitchRatio: 2, pulseRate: 1.5, brightness: 0.85, phase: 90 },
    requiredSeeds: 1,
    thermalShutters: { minBrightness: 0.75, maxBrightness: 0.9, text: 'thermal shutters open when focused light is warm enough but not overheated' },
    stabilization: { improvesChamberId: 'glass-rain', targetRating: 'Stable' },
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.4, pitchRatio: 0.14, pulseRate: 0.28, brightness: 0.08, phase: 50 },
    requires: ['glass-rain'],
    rewards: { codex: ['plant-memory-09', 'seed-ancestry-09'], materials: { crystal: 2, biomass: 1 } },
  },
  {
    id: 'fog-harp',
    title: 'Contract 16: Fog Harp',
    season: 3,
    system: 'Glass Weather',
    contractType: 'restoration',
    mechanic: 'noise-bed thinning',
    objective: 'Thin the fog harp with a clear tone that keeps noise below the chamber heart.',
    start: { x: -4, y: 0, facing: 90 },
    target: { x: 2, y: 0, pitchRatio: 1.25, pulseRate: 1.25, brightness: 0.5, phase: 180 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.5, pitchRatio: 0.16, pulseRate: 0.25, brightness: 0.18, phase: 40 },
    requires: ['sun-prism'],
    rewards: { materials: { memory: 1, crystal: 1 } },
  },
  {
    id: 'optional-rain-return',
    title: 'Optional Contract: Rain Return',
    season: 3,
    system: 'Glass Weather',
    contractType: 'challenge',
    mechanic: 'off-axis weather planting',
    objective: 'Restore a rain return node from an off-axis position using distance scans only.',
    start: { x: 4, y: -4, facing: 315 },
    target: { x: -2, y: 2, pitchRatio: 1, pulseRate: 2.25, brightness: 0.6, phase: 75 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.2, pitchRatio: 0.14, pulseRate: 0.2, brightness: 0.16, phase: 55 },
    optional: true,
    requires: ['glass-rain'],
    rewards: { materials: { crystal: 1, memory: 1 } },
  },
  {
    id: 'hail-damper',
    title: 'Contract 17: Hail Damper',
    season: 3,
    system: 'Glass Weather',
    contractType: 'emergency',
    mechanic: 'phase damper',
    objective: 'Tune a damper phase that turns hail clicks into a slow maintenance pulse.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: 0, y: 2, pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.48, phase: 225 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.4, pitchRatio: 0.1, pulseRate: 0.16, brightness: 0.18, phase: 28 },
    hazards: [{ pulseRate: 3, radius: 0.25, message: 'Hail surge rejects frantic pulses.' }],
    emergency: { softDeadlineMinutes: 10, consequence: 'hail clicks keep cracking the glass rhythm until damped' },
    requires: ['fog-harp'],
    rewards: { materials: { crystal: 2, memory: 1 } },
  },
  {
    id: 'optional-prism-duet',
    title: 'Optional Contract: Prism Duet',
    season: 3,
    system: 'Glass Weather',
    contractType: 'research',
    mechanic: 'two-seed prism harmony',
    objective: 'Plant two bright voices around the prism to recover a lost weather overtone.',
    start: { x: -3, y: -3, facing: 45 },
    target: { x: 1, y: -1, pitchRatio: 1.5, pulseRate: 2, brightness: 0.82, phase: 120 },
    requiredSeeds: 2,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.8, pitchRatio: 0.2, pulseRate: 0.32, brightness: 0.12, phase: 70 },
    harmonic: true,
    optional: true,
    researchReveal: { kind: 'seed family', name: 'glass' },
    requires: ['sun-prism'],
    rewards: { materials: { crystal: 2 } },
  },
  {
    id: 'wind-bellows',
    title: 'Contract 18: Wind Bellows',
    season: 3,
    system: 'Intake',
    contractType: 'restoration',
    mechanic: 'airflow pulse routing',
    objective: 'Route wind through the bellows with a stable pulse and moderate brightness.',
    start: { x: 2, y: -4, facing: 340 },
    target: { x: -1, y: 1, pitchRatio: 1.25, pulseRate: 2, brightness: 0.55, phase: 60 },
    requiredSeeds: 1,
    windEcho: { dx: 1, dy: 0, name: 'east bellows draft', text: 'wind carries scan echoes east before they settle back to the heart' },
    pressureSails: { minPulseRate: 1.75, maxPulseRate: 2.25, text: 'pressure sails hold open when airflow pulse stays steady' },
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.5, pitchRatio: 0.16, pulseRate: 0.22, brightness: 0.16, phase: 55 },
    requires: ['hail-damper'],
    rewards: { materials: { biomass: 1, crystal: 1 } },
  },
  {
    id: 'optional-fog-braid',
    title: 'Optional Contract: Fog Braid',
    season: 3,
    system: 'Research',
    contractType: 'challenge',
    mechanic: 'grafted fog behavior',
    objective: 'Use a grafted seed to braid fog and wind into one navigable corridor.',
    start: { x: -1, y: -4, facing: 0 },
    target: { x: 2, y: 1, pitchRatio: 1.25, pulseRate: 1.75, brightness: 0.58, phase: 150 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.4, pitchRatio: 0.14, pulseRate: 0.24, brightness: 0.14, phase: 45 },
    requiresGraft: true,
    optional: true,
    requires: ['fog-harp'],
    rewards: { materials: { memory: 2 } },
  },
  {
    id: 'memory-pond',
    title: 'Contract 19: Memory Pond',
    season: 4,
    system: 'Memory Orchard',
    contractType: 'restoration',
    mechanic: 'soft phase recall',
    objective: 'Wake the memory pond with a soft phase offset that does not erase old reflections.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: -1, y: 2, pitchRatio: 1, pulseRate: 1, brightness: 0.4, phase: 135 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 6, max: 8 },
    tolerances: { position: 1.5, pitchRatio: 0.18, pulseRate: 0.28, brightness: 0.2, phase: 35 },
    requires: ['wind-bellows'],
    rewards: { codex: ['perception-02'], materials: { memory: 2 } },
  },
  {
    id: 'archive-vines',
    title: 'Contract 20: Archive Vines',
    season: 4,
    system: 'Memory Orchard',
    contractType: 'restoration',
    mechanic: 'braided archive rhythm',
    objective: 'Thread archive vines through a slow rhythm so recovered records stay attached.',
    start: { x: -3, y: -3, facing: 45 },
    target: { x: 1, y: 1, pitchRatio: 1.25, pulseRate: 1.5, brightness: 0.48, phase: 180 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.4, pitchRatio: 0.14, pulseRate: 0.24, brightness: 0.16, phase: 38 },
    requires: ['memory-pond'],
    rewards: { codex: ['system-diagnostic-11', 'plant-memory-10'], materials: { biomass: 1, memory: 2 } },
  },
  {
    id: 'optional-record-grove',
    title: 'Optional Contract: Record Grove',
    season: 4,
    system: 'Memory Orchard',
    contractType: 'survey',
    mechanic: 'record recovery scan',
    objective: 'Recover a quiet record grove by matching a fragile high-phase memory tone.',
    start: { x: 3, y: -4, facing: 320 },
    target: { x: -2, y: 0, pitchRatio: 1.5, pulseRate: 1, brightness: 0.5, phase: 255 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.2, pitchRatio: 0.1, pulseRate: 0.22, brightness: 0.16, phase: 25 },
    optional: true,
    requires: ['memory-pond'],
    rewards: { codex: ['gardener-note-10', 'perception-04'], materials: { memory: 2 } },
  },
  {
    id: 'ancestor-filter',
    title: 'Contract 21: Ancestor Filter',
    season: 4,
    system: 'Memory Orchard',
    contractType: 'stabilization',
    mechanic: 'timbre memory filtering',
    objective: 'Brighten the ancestor filter enough to separate useful memory from static.',
    start: { x: -4, y: 1, facing: 90 },
    target: { x: 2, y: -1, pitchRatio: 1, pulseRate: 2, brightness: 0.76, phase: 90 },
    requiredSeeds: 1,
    stabilization: { improvesChamberId: 'archive-vines', targetRating: 'Stable' },
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.4, pitchRatio: 0.14, pulseRate: 0.24, brightness: 0.08, phase: 45 },
    requires: ['archive-vines'],
    rewards: { codex: ['seed-ancestry-10'], materials: { crystal: 1, memory: 2 } },
  },
  {
    id: 'optional-whisper-formant',
    title: 'Optional Contract: Whisper Formant',
    season: 4,
    system: 'Research',
    contractType: 'research',
    mechanic: 'formant-like graft study',
    objective: 'Use a grafted voice to shape a whisper formant for later seed research.',
    start: { x: 2, y: -3, facing: 315 },
    target: { x: 0, y: 1, pitchRatio: 1.25, pulseRate: 1.25, brightness: 0.64, phase: 210 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.5, pitchRatio: 0.14, pulseRate: 0.24, brightness: 0.14, phase: 45 },
    requiresGraft: true,
    optional: true,
    researchReveal: { kind: 'trait', name: 'formant memory filtering' },
    requires: ['optional-record-grove'],
    rewards: { materials: { memory: 3 } },
  },
  {
    id: 'dream-compost',
    title: 'Contract 22: Dream Compost',
    season: 4,
    system: 'Rootworks',
    contractType: 'restoration',
    mechanic: 'low-memory composting',
    objective: 'Compost corrupted memories with a low interval and a patient pulse.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: 1, y: 2, pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.38, phase: 180 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.5, pitchRatio: 0.1, pulseRate: 0.16, brightness: 0.18, phase: 32 },
    requires: ['ancestor-filter'],
    rewards: { codex: ['plant-memory-12', 'crew-message-08'], materials: { archiveLoam: 1, biomass: 2, dreamCompost: 1, memory: 1 } },
  },
  {
    id: 'optional-pastoral-loop',
    title: 'Optional Contract: Pastoral Loop',
    season: 4,
    system: 'Memory Orchard',
    contractType: 'challenge',
    mechanic: 'looped melody planting',
    objective: 'Tune a pastoral loop that can be replayed later in the Conservatory.',
    start: { x: -2, y: -4, facing: 30 },
    target: { x: 2, y: 2, pitchRatio: 1.5, pulseRate: 2.25, brightness: 0.58, phase: 105 },
    requiredSeeds: 2,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.8, pitchRatio: 0.18, pulseRate: 0.24, brightness: 0.16, phase: 65 },
    harmonic: true,
    optional: true,
    requires: ['archive-vines'],
    rewards: { materials: { memory: 2 } },
  },
  {
    id: 'orchard-gate',
    title: 'Contract 23: Pollinator Vault',
    season: 4,
    system: 'Memory Orchard',
    contractType: 'restoration',
    mechanic: 'pollinator vault alignment',
    objective: 'Open the pollinator vault by lining memory phase with a bright navigation tone.',
    start: { x: 4, y: -3, facing: 300 },
    target: { x: -1, y: 1, pitchRatio: 1.5, pulseRate: 1.75, brightness: 0.7, phase: 180 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 7, max: 9 },
    tolerances: { position: 1.3, pitchRatio: 0.12, pulseRate: 0.22, brightness: 0.12, phase: 34 },
    requires: ['dream-compost'],
    rewards: { codex: ['perception-07'], materials: { crystal: 1, glassPollen: 1, memory: 2 } },
  },
  {
    id: 'optional-mirror-return',
    title: 'Optional Contract: Mirror Return',
    season: 4,
    system: 'Memory Orchard',
    contractType: 'challenge',
    mechanic: 'narrow phase cancellation',
    objective: 'Return to the mirror technique with a stricter cancellation window.',
    start: { x: -4, y: -2, facing: 70 },
    target: { x: 1, y: 0, pitchRatio: 1, pulseRate: 1, brightness: 0.44, phase: 180 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.1, pitchRatio: 0.08, pulseRate: 0.18, brightness: 0.12, phase: 18 },
    optional: true,
    requires: ['ancestor-filter'],
    rewards: { materials: { memory: 2 } },
  },
  {
    id: 'heart-atria',
    title: 'Contract 24: Heart Atria',
    season: 5,
    system: 'Verdancy Heart',
    contractType: 'restoration',
    mechanic: 'heart rhythm priming',
    objective: 'Prime the Ark heart atria with a strong but steady restoration pulse.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: 0, y: 1, pitchRatio: 1.25, pulseRate: 2.5, brightness: 0.7, phase: 90 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.4, pitchRatio: 0.14, pulseRate: 0.22, brightness: 0.12, phase: 45 },
    requires: ['orchard-gate'],
    rewards: { codex: ['gardener-note-12', 'crew-message-07', 'crew-message-10'], materials: { biomass: 2, crystal: 1, memory: 1 } },
  },
  {
    id: 'optional-heart-glass',
    title: 'Optional Contract: Heart Glass',
    season: 5,
    system: 'Verdancy Heart',
    contractType: 'challenge',
    mechanic: 'bright finale preparation',
    objective: 'Polish the heart glass with a high-brightness tone before choosing an ending posture.',
    start: { x: 3, y: -4, facing: 320 },
    target: { x: -1, y: 2, pitchRatio: 2, pulseRate: 2, brightness: 0.86, phase: 120 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.2, pitchRatio: 0.1, pulseRate: 0.18, brightness: 0.08, phase: 36 },
    optional: true,
    requires: ['heart-atria'],
    rewards: { materials: { crystal: 2, memory: 1 } },
  },
  {
    id: 'optional-heart-root',
    title: 'Optional Contract: Heart Root',
    season: 5,
    system: 'Verdancy Heart',
    contractType: 'challenge',
    mechanic: 'deep finale preparation',
    objective: 'Anchor the heart roots with a low interval that favors slow ecological recovery.',
    start: { x: -3, y: -4, facing: 40 },
    target: { x: 2, y: 1, pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.36, phase: 210 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.3, pitchRatio: 0.1, pulseRate: 0.16, brightness: 0.14, phase: 34 },
    optional: true,
    requires: ['heart-atria'],
    rewards: { materials: { biomass: 2, memory: 1 } },
  },
  {
    id: 'optional-heart-memory',
    title: 'Optional Contract: Heart Memory',
    season: 5,
    system: 'Verdancy Heart',
    contractType: 'challenge',
    mechanic: 'memory finale preparation',
    objective: 'Carry recovered memory into the heart with a precise phase braid.',
    start: { x: 0, y: -4, facing: 0 },
    target: { x: 1, y: 2, pitchRatio: 1.5, pulseRate: 1.5, brightness: 0.62, phase: 240 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.3, pitchRatio: 0.12, pulseRate: 0.2, brightness: 0.12, phase: 30 },
    optional: true,
    requires: ['heart-atria'],
    rewards: { materials: { memory: 3 } },
  },
  {
    id: 'optional-heart-graft',
    title: 'Optional Contract: Heart Graft',
    season: 5,
    system: 'Verdancy Heart',
    contractType: 'research',
    mechanic: 'grafted ending preparation',
    objective: 'Use a grafted voice to prepare a hybrid ending path for the Verdancy Heart.',
    start: { x: -2, y: -4, facing: 25 },
    target: { x: 2, y: 2, pitchRatio: 1.25, pulseRate: 2.25, brightness: 0.72, phase: 150 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 9, max: 10 },
    tolerances: { position: 1.3, pitchRatio: 0.12, pulseRate: 0.2, brightness: 0.12, phase: 38 },
    requiresGraft: true,
    optional: true,
    researchReveal: { kind: 'seed family', name: 'hybrid' },
    requires: ['heart-atria'],
    rewards: { materials: { biomass: 1, crystal: 1, memory: 2 } },
  },
  {
    id: 'postgame-conservatory',
    title: 'Optional Contract: Living Conservatory',
    season: 5,
    system: 'Verdancy Heart',
    contractType: 'conservatory',
    mechanic: 'free composition and seed voice curation',
    objective: 'Compose with recovered seed voices and curate which voices lead the living archive.',
    start: { x: 0, y: -2, facing: 0 },
    target: { x: 0, y: 0, pitchRatio: 1, pulseRate: 1.5, brightness: 0.6, phase: 120 },
    requiredSeeds: 1,
    solveTimeMinutes: { min: 8, max: 10 },
    tolerances: { position: 1.6, pitchRatio: 0.2, pulseRate: 0.35, brightness: 0.18, phase: 70 },
    optional: true,
    conservatory: {
      compositionModes: ['balanced chord', 'seed solo', 'network braid'],
      curation: 'choosing recovered seed voices for the living archive',
    },
    requires: ['finale'],
    rewards: { codex: ['system-diagnostic-10', 'gardener-note-11'], materials: { memory: 2 } },
  },
]

export const chamberSeeds = {
  sol: createSeedDNA('sol', { name: 'Sol phonoseed', waveform: 'sine', pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0 }),
  lumen: createSeedDNA('lumen', { name: 'Lumen phonoseed', waveform: 'triangle', pitchRatio: 1.5, pulseRate: 2, brightness: 0.7, phase: 90 }),
  umbra: createSeedDNA('umbra', { name: 'Umbra phonoseed', waveform: 'square', pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.25, phase: 180 }),
  spire: createSeedDNA('spire', { name: 'Spire phonoseed', waveform: 'sawtooth', pitchRatio: 2, pulseRate: 3, brightness: 0.85, phase: 270 }),
}

const codexPerceptions = Object.fromEntries([
  ['gardener-note-01', { title: 'Gardener Note 01', text: 'Always scan before planting. The Ark rewards care that begins with listening.' }],
  ['gardener-note-02', { title: 'Gardener Note 02', text: 'Root chambers prefer slow pulses. A rushed rhythm makes stored water chatter.' }],
  ['gardener-note-03', { title: 'Gardener Note 03', text: 'Brightness is heat in the glass canopy and attention in the memory orchard.' }],
  ['gardener-note-04', { title: 'Gardener Note 04', text: 'A graft is not a shortcut. It is a promise that two voices can share work.' }],
  ['gardener-note-05', { title: 'Gardener Note 05', text: 'Optional contracts should make the Ark richer, not trap the main restoration.' }],
  ['gardener-note-06', { title: 'Gardener Note 06', text: 'When the heart sounds distant, turn the system online around it first.' }],
  ['gardener-note-07', { title: 'Gardener Note 07', text: 'A stable restoration keeps the campaign moving. A resonant one changes the song.' }],
  ['gardener-note-08', { title: 'Gardener Note 08', text: 'Wild intervals can teach rare mutations, but only if the chamber can survive them.' }],
  ['gardener-note-09', { title: 'Gardener Note 09', text: 'Leave every chamber with a return path. No gardener should get lost in their own repair.' }],
  ['gardener-note-10', { title: 'Gardener Note 10', text: 'If a seed sounds wrong, move it before changing its DNA. Place is part of the voice.' }],
  ['gardener-note-11', { title: 'Gardener Note 11', text: 'The Conservatory is not a trophy room. It is the place where restored work keeps breathing.' }],
  ['gardener-note-12', { title: 'Gardener Note 12', text: 'The Ark clock measures care deferred. Move it forward only when the garden can answer.' }],
  ['crew-message-01', { title: 'Crew Message 01', text: 'Chief agronomist Vale reports Intake pressure falling below song-readable thresholds.' }],
  ['crew-message-02', { title: 'Crew Message 02', text: 'Navigation crew heard the grove pointing at rooms that had not been built yet.' }],
  ['crew-message-03', { title: 'Crew Message 03', text: 'Water team confirms that bright thirds open pumps more safely than manual override.' }],
  ['crew-message-04', { title: 'Crew Message 04', text: 'Canopy crew requests slower restoration schedules after the glass leaves overheated.' }],
  ['crew-message-05', { title: 'Crew Message 05', text: 'Memory orchard archivists warn that phase cancellation can erase evidence if used carelessly.' }],
  ['crew-message-06', { title: 'Crew Message 06', text: 'Heart technicians found graft harmonics in the network before any human authorized them.' }],
  ['crew-message-07', { title: 'Crew Message 07', text: 'The sleeping crew entered preservation believing gardeners would choose the final mission.' }],
  ['crew-message-08', { title: 'Crew Message 08', text: 'A launch-garden memo lists seed dispersal as a mercy protocol, not a failure state.' }],
  ['crew-message-09', { title: 'Crew Message 09', text: 'The crew debate record ends mid-vote between preservation, adaptation, release, and archive.' }],
  ['crew-message-10', { title: 'Crew Message 10', text: 'Last known voice on the bridge asked the Ark to remember consent before revival.' }],
  ['crew-message-11', { title: 'Crew Message 11', text: 'No sabotage flag was ever proven. The systems failed like an ecosystem under stress.' }],
  ['crew-message-12', { title: 'Crew Message 12', text: 'A junior gardener logged that the Ark sang back when treated as a living instrument.' }],
  ['plant-memory-01', { title: 'Plant Memory 01', text: 'Sol remembers oxygen through a clean sine voice and a steady center.' }],
  ['plant-memory-02', { title: 'Plant Memory 02', text: 'Lumen remembers light as a triangle edge that brightens without burning.' }],
  ['plant-memory-03', { title: 'Plant Memory 03', text: 'Umbra remembers absence, phase, and the mercy of quiet cancellation.' }],
  ['plant-memory-04', { title: 'Plant Memory 04', text: 'Spire remembers altitude and thin air, reaching where canopy doors hesitate.' }],
  ['plant-memory-05', { title: 'Plant Memory 05', text: 'Verdant pulse families grow by rhythm first and pitch second.' }],
  ['plant-memory-06', { title: 'Plant Memory 06', text: 'Myco families do not fear noise. They sort it into paths roots can use.' }],
  ['plant-memory-07', { title: 'Plant Memory 07', text: 'Glass families hold reflections long enough for scans to become weather.' }],
  ['plant-memory-08', { title: 'Plant Memory 08', text: 'Tide families bend amplitude into current, carrying seeds along invisible water.' }],
  ['plant-memory-09', { title: 'Plant Memory 09', text: 'Ember families distort heat carefully, warming shutters without igniting them.' }],
  ['plant-memory-10', { title: 'Plant Memory 10', text: 'Archive families talk in remembered vowels and keep old gardeners near the work.' }],
  ['plant-memory-11', { title: 'Plant Memory 11', text: 'Hybrid families inherit responsibility as much as waveform or modulation.' }],
  ['plant-memory-12', { title: 'Plant Memory 12', text: 'Failed grafts still compost into lessons that later seeds can use.' }],
  ['system-diagnostic-01', { title: 'System Diagnostic 01', text: 'Intake lung online state improves scan reach and stabilizes ambient pressure.' }],
  ['system-diagnostic-02', { title: 'System Diagnostic 02', text: 'Navigation grove online state makes atlas previews and direction scans more trustworthy.' }],
  ['system-diagnostic-03', { title: 'System Diagnostic 03', text: 'Water system online state enables current navigation and rootwork dependencies.' }],
  ['system-diagnostic-04', { title: 'System Diagnostic 04', text: 'Canopy system online state unlocks brightness work and photosynthesis doors.' }],
  ['system-diagnostic-05', { title: 'System Diagnostic 05', text: 'Memory system online state reveals codex echoes and historical seed traits.' }],
  ['system-diagnostic-06', { title: 'System Diagnostic 06', text: 'Heart system online state prepares network resonance and ending resolution logic.' }],
  ['system-diagnostic-07', { title: 'System Diagnostic 07', text: 'Rootworks relays report nutrient transfer through pulse-matched mycelium gates.' }],
  ['system-diagnostic-08', { title: 'System Diagnostic 08', text: 'Glass weather relays report rain, prism, fog, and hail states as musical pressure.' }],
  ['system-diagnostic-09', { title: 'System Diagnostic 09', text: 'Research bench reports unlocked graft mechanics as inherited ecological affordances.' }],
  ['system-diagnostic-10', { title: 'System Diagnostic 10', text: 'Conservatory loop reports recovered seed voices available for postgame composition.' }],
  ['system-diagnostic-11', { title: 'System Diagnostic 11', text: 'Environmental changes are retained as chamber-specific evidence, not generic progress.' }],
  ['system-diagnostic-12', { title: 'System Diagnostic 12', text: 'Ratings distinguish viable restoration from especially elegant or intentionally wild outcomes.' }],
  ['seed-ancestry-01', { title: 'Seed Ancestry 01', text: 'Sol line descends from oxygen gardens that were meant to teach first contact by tone.' }],
  ['seed-ancestry-02', { title: 'Seed Ancestry 02', text: 'Lumen line was bred to convert brightness into social cues for canopy crews.' }],
  ['seed-ancestry-03', { title: 'Seed Ancestry 03', text: 'Umbra line was built after archivists needed a seed that could protect silence.' }],
  ['seed-ancestry-04', { title: 'Seed Ancestry 04', text: 'Spire line began as altitude scaffolding and became a way to hear vertical space.' }],
  ['seed-ancestry-05', { title: 'Seed Ancestry 05', text: 'Verdant line is not rare, but it is the first family to carry growth timing clearly.' }],
  ['seed-ancestry-06', { title: 'Seed Ancestry 06', text: 'Myco line came from compost labs where useful failure was treated as curriculum.' }],
  ['seed-ancestry-07', { title: 'Seed Ancestry 07', text: 'Glass line learned to reflect scans before it learned to brighten rooms.' }],
  ['seed-ancestry-08', { title: 'Seed Ancestry 08', text: 'Tide line hid in water pumps until amplitude modulation gave it a name.' }],
  ['seed-ancestry-09', { title: 'Seed Ancestry 09', text: 'Ember line was quarantined until thermal shutters proved heat could be careful.' }],
  ['seed-ancestry-10', { title: 'Seed Ancestry 10', text: 'Archive line carries formants from gardeners who wanted seeds to answer questions.' }],
  ['ending-reflection-01', { title: 'Ending Reflection 01', text: 'Preservation honors the original mission, but it asks whether the original mission still has a world.' }],
  ['ending-reflection-02', { title: 'Ending Reflection 02', text: 'Adaptation trusts the Ark to become different without becoming careless.' }],
  ['ending-reflection-03', { title: 'Ending Reflection 03', text: 'Release turns the Ark from shelter into sender, scattering gardens beyond its hull.' }],
  ['ending-reflection-04', { title: 'Ending Reflection 04', text: 'Conservatory keeps the Ark as an archive of living sound, repair, and unfinished choice.' }],
  ['ending-reflection-05', { title: 'Ending Reflection 05', text: 'A resonant heart does not erase poor stewardship; it only makes the consequences audible.' }],
  ['ending-reflection-06', { title: 'Ending Reflection 06', text: 'A wild heart can open rare futures if the player has contained enough hazards first.' }],
  ['ending-reflection-07', { title: 'Ending Reflection 07', text: 'The sleeping crew may wake into a machine, a garden, or an instrument depending on the player.' }],
  ['ending-reflection-08', { title: 'Ending Reflection 08', text: 'The final chord belongs to every planted seed, including the ones the player moved away from failure.' }],
  ['perception-01', { title: 'Perception 01', text: 'A nearby wall feels like a soft pressure tone before it becomes a boundary.' }],
  ['perception-02', { title: 'Perception 02', text: 'A restored chamber shifts from isolated drone into a layer of the Ark-wide mix.' }],
  ['perception-03', { title: 'Perception 03', text: 'Hazards are unstable ecologies. Their warning tones should sound specific, never decorative.' }],
  ['perception-04', { title: 'Perception 04', text: 'The event log is part of the instrument: every important sound leaves readable evidence.' }],
  ['perception-05', { title: 'Perception 05', text: 'A chamber heart can be centered, off-axis, high, or low, but it should always be findable without sight.' }],
  ['perception-06', { title: 'Perception 06', text: 'The player is learning a garden by ear, not passing an audio reflex test.' }],
  ['perception-07', { title: 'Perception 07', text: 'Optional scan verbosity exists because mastery should never require memorizing hidden state.' }],
  ['perception-08', { title: 'Perception 08', text: 'A good work order says what is broken, what is risky, and why restoring it matters.' }],
])

export const codexRecords = {
  'first-breath': {
    title: 'First Breath',
    text: 'The Ark still answers small acts of care. A single stable tone can wake a dormant chamber.',
  },
  'intake-lung': {
    title: 'Intake Lung',
    text: 'The intake system once taught seedlings to hear pressure before light. Its pulse is the campaign clock.',
  },
  'navigation-grove': {
    title: 'Navigation Grove',
    text: 'The grove maps space by echo density. Direction is a living trait, not a visual coordinate.',
  },
  'water-pumps': {
    title: 'Water Pumps',
    text: 'Water follows intervals that hold. Bright thirds open valves the old crew could no longer reach.',
  },
  'root-pumps': {
    title: 'Root Pumps',
    text: 'Root pumps move water by patience: a slower pulse gives the buried mesh time to breathe and carry nutrients.',
  },
  'fungus-relays': {
    title: 'Fungus Relays',
    text: 'Fungus relays carry messages sideways through the roots. A bright tone can pass safely when it avoids the sour mold band.',
  },
  'nutrient-locks': {
    title: 'Nutrient Locks',
    text: 'The locks respond to brightness before force. A tuned filter opens the route without flooding the rootbed.',
  },
  'canopy-pulse': {
    title: 'Canopy Pulse',
    text: 'Canopy lights wake in rhythm. Too much haste makes them flicker; a patient pulse makes them remember.',
  },
  'glass-leaves': {
    title: 'Glass Leaves',
    text: 'Glass-leaf filters bend timbre into heat. Restoring them gives the Ark a warmer listening floor.',
  },
  'twin-roots': {
    title: 'Twin Roots',
    text: 'Two roots can share one harmonic body. This is the first hint that seed families are meant to combine.',
  },
  'quiet-mirror': {
    title: 'Quiet Mirror',
    text: 'The mirror chamber stores absence as data. Phase is memory folded back against itself.',
  },
  'splice-nursery': {
    title: 'Splice Nursery',
    text: 'The nursery did not invent grafting. It listened until two seed voices volunteered a third.',
  },
  'mold-pressure': {
    title: 'Mold Pressure',
    text: 'The mold is not an enemy. It is failed maintenance, singing in intervals the Ark cannot safely digest.',
  },
  'verdancy-heart': {
    title: 'Verdancy Heart',
    text: 'The heart is not a final room. It is a mixer, asking what kind of greenhouse the player has composed.',
  },
  ...codexPerceptions,
}

export const codexRecordTreeBranches = [
  { id: 'gardener-notes', title: 'Gardener Notes', prefix: 'gardener-note' },
  { id: 'crew-messages', title: 'Crew Messages', prefix: 'crew-message' },
  { id: 'plant-memory', title: 'Plant Memory', prefix: 'plant-memory' },
  { id: 'system-diagnostics', title: 'System Diagnostics', prefix: 'system-diagnostic' },
  { id: 'seed-ancestry', title: 'Seed Ancestry', prefix: 'seed-ancestry' },
  { id: 'ending-reflections', title: 'Ending Reflections', prefix: 'ending-reflection' },
  { id: 'perceptions', title: 'Perceptions', prefix: 'perception' },
]

export function codexRecordTrees(records = codexRecords, unlockedIds = Object.keys(records)) {
  const unlocked = new Set(unlockedIds)
  const branches = codexRecordTreeBranches.map((branch) => ({
    ...branch,
    records: Object.entries(records)
      .filter(([id]) => unlocked.has(id) && id.startsWith(branch.prefix))
      .map(([id, record]) => ({ id, ...record })),
  }))

  branches.push({
    id: 'restoration-records',
    title: 'Restoration Records',
    records: Object.entries(records)
      .filter(([id]) => unlocked.has(id) && !codexRecordTreeBranches.some((branch) => id.startsWith(branch.prefix)))
      .map(([id, record]) => ({ id, ...record })),
  })

  return branches.filter((branch) => branch.records.length)
}

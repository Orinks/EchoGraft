import { defaultProceduralSeed } from './rng.js'

export const saveKey = 'echograft-save-v1'

export const defaultKeyboardBindings = {
  moveUp: 'w, ArrowUp',
  moveDown: 's, ArrowDown',
  moveLeft: 'a, ArrowLeft',
  moveRight: 'd, ArrowRight',
  rotateLeft: 'q',
  rotateRight: 'e',
  scan: 'Space',
  cycleScanMode: 'z, Shift+Space',
  plant: 'Enter',
  cycleSeed: 'Tab',
  previousSeed: 'Shift+Tab',
  tuneDown: '-, [',
  tuneUp: '=, ]',
  graft: 'g',
  restoreAdvance: 'n',
  reset: 'r',
  help: 'h',
  pause: 'Escape',
  objectiveInfo: 'o',
  positionInfo: 'p',
  inventoryInfo: 'i',
  latestLog: 'l',
  recentLog: 'Shift+L',
  boundaryInfo: 'x',
  plantedVoices: 'v',
  codexInfo: 'c',
  controlsInfo: '?',
}

export const onDemandInfoCommands = [
  { action: 'objectiveInfo', label: 'objective/current system', key: 'O' },
  { action: 'positionInfo', label: 'position/facing/progress', key: 'P' },
  { action: 'inventoryInfo', label: 'selected seed/inventory/materials', key: 'I' },
  { action: 'latestLog', label: 'latest log entry', key: 'L' },
  { action: 'recentLog', label: 'recent log history', key: 'Shift+L' },
  { action: 'boundaryInfo', label: 'boundaries and safe return', key: 'X' },
  { action: 'plantedVoices', label: 'planted seed voices', key: 'V' },
  { action: 'codexInfo', label: 'codex/perception updates', key: 'C' },
  { action: 'controlsInfo', label: 'controls help', key: '?' },
]

export function onDemandInfoCommandState(bindings = defaultKeyboardBindings) {
  const commands = onDemandInfoCommands.map((command) => ({
    ...command,
    binding: bindings[command.action] ?? command.key,
    ready: Boolean(bindings[command.action] ?? command.key),
  }))
  const missing = commands.filter((command) => !command.ready)

  return {
    commands,
    ready: missing.length === 0,
    text: missing.length
      ? `On-demand info commands incomplete: missing ${missing.map((command) => command.action).join(', ')}.`
      : `On-demand info commands complete: ${commands.map((command) => `${command.binding} ${command.label}`).join('; ')}.`,
  }
}

export function createDefaultSave() {
  return {
    version: 1,
    arkClock: 0,
    proceduralSeed: defaultProceduralSeed,
    currentChamberId: 'tutorial',
    codexIds: [],
    endgameResolution: null,
    alternateEndingIds: [],
    environmentalChanges: [],
    graftDiscoveryIds: [],
    graftRecords: [],
    materials: {
      biomass: 0,
      crystal: 0,
      dreamCompost: 0,
      embersap: 0,
      glassPollen: 0,
      memory: 0,
      mycelium: 0,
      resin: 0,
      spores: 0,
      archiveLoam: 0,
    },
    plantedByChamber: {},
    postgameUnlocked: false,
    conservatoryCompositions: [],
    endlessMutationSeeds: [],
    lowCycleChallengeIds: [],
    bonusContractIds: [],
    graftRatingBoosts: [],
    unlockedGraftMechanics: [],
    wildChamberIds: [],
    wildMutationIds: [],
    seedMovesByChamber: {},
    resourcesSpentByChamber: {},
    ratings: {},
    restoredSystems: [],
    restorationPhilosophy: 'preservation',
    solvedChambers: [],
    inventoryIds: ['sol', 'lumen', 'umbra'],
    customSeeds: [],
    settings: {
      master: 0.8,
      ambience: 0.55,
      music: 0.6,
      ui: 0.7,
      seeds: 0.75,
      hazards: 0.65,
      scans: 0.75,
      reducedMotion: false,
      minimalVisual: false,
      highContrast: false,
      scanVerbosity: 'detailed',
      textOnlyHints: false,
    },
    keyboardBindings: defaultKeyboardBindings,
  }
}

export const saveArrayFields = [
  'alternateEndingIds',
  'bonusContractIds',
  'codexIds',
  'conservatoryCompositions',
  'customSeeds',
  'endlessMutationSeeds',
  'environmentalChanges',
  'graftDiscoveryIds',
  'graftRatingBoosts',
  'graftRecords',
  'inventoryIds',
  'lowCycleChallengeIds',
  'restoredSystems',
  'solvedChambers',
  'unlockedGraftMechanics',
  'wildChamberIds',
  'wildMutationIds',
]

export const saveObjectFields = [
  'keyboardBindings',
  'materials',
  'plantedByChamber',
  'ratings',
  'resourcesSpentByChamber',
  'seedMovesByChamber',
  'settings',
]

export const persistentSaveFields = [
  'alternateEndingIds',
  'arkClock',
  'bonusContractIds',
  'codexIds',
  'conservatoryCompositions',
  'currentChamberId',
  'customSeeds',
  'endgameResolution',
  'endlessMutationSeeds',
  'environmentalChanges',
  'graftDiscoveryIds',
  'graftRatingBoosts',
  'graftRecords',
  'inventoryIds',
  'keyboardBindings',
  'lowCycleChallengeIds',
  'materials',
  'plantedByChamber',
  'postgameUnlocked',
  'proceduralSeed',
  'ratings',
  'resourcesSpentByChamber',
  'restoredSystems',
  'restorationPhilosophy',
  'seedMovesByChamber',
  'settings',
  'solvedChambers',
  'unlockedGraftMechanics',
  'version',
  'wildChamberIds',
  'wildMutationIds',
]

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function normalizeSave(parsed = {}) {
  const defaults = createDefaultSave()
  const source = isRecord(parsed) ? parsed : {}
  const next = {
    ...defaults,
    ...source,
    keyboardBindings: { ...defaults.keyboardBindings, ...(isRecord(source.keyboardBindings) ? source.keyboardBindings : {}) },
    materials: { ...defaults.materials, ...(isRecord(source.materials) ? source.materials : {}) },
    plantedByChamber: isRecord(source.plantedByChamber) ? source.plantedByChamber : defaults.plantedByChamber,
    ratings: isRecord(source.ratings) ? source.ratings : defaults.ratings,
    resourcesSpentByChamber: isRecord(source.resourcesSpentByChamber) ? source.resourcesSpentByChamber : defaults.resourcesSpentByChamber,
    seedMovesByChamber: isRecord(source.seedMovesByChamber) ? source.seedMovesByChamber : defaults.seedMovesByChamber,
    settings: { ...defaults.settings, ...(isRecord(source.settings) ? source.settings : {}) },
  }

  for (const field of saveArrayFields) {
    next[field] = Array.isArray(source[field]) ? source[field] : defaults[field]
  }

  return next
}

export function saveLoadCompletenessState(save = createDefaultSave()) {
  const normalized = normalizeSave(save)
  const missing = persistentSaveFields.filter((field) => !Object.hasOwn(normalized, field))
  const arrayReady = saveArrayFields.filter((field) => Array.isArray(normalized[field]))
  const objectReady = saveObjectFields.filter((field) => isRecord(normalized[field]))
  const complete = missing.length === 0 && arrayReady.length === saveArrayFields.length && objectReady.length === saveObjectFields.length

  return {
    arrayReady,
    complete,
    fields: persistentSaveFields,
    missing,
    normalized,
    objectReady,
    text: complete
      ? `Save/load complete: ${persistentSaveFields.length} persistent field(s) hydrate with ${saveArrayFields.length} array collection(s), ${saveObjectFields.length} object map(s), settings, bindings, postgame state, and campaign progress.`
      : `Save/load incomplete: missing ${missing.join(', ') || 'no named fields'}; arrays ${arrayReady.length}/${saveArrayFields.length}, object maps ${objectReady.length}/${saveObjectFields.length}.`,
  }
}

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(saveKey)
    const parsed = raw ? JSON.parse(raw) : {}
    return normalizeSave(parsed)
  } catch {
    return createDefaultSave()
  }
}

export function saveGame(save, storage = globalThis.localStorage) {
  storage?.setItem(saveKey, JSON.stringify(save))
  return save
}

export function resetChamberProgress(save, chamberId) {
  const resourcesSpentByChamber = { ...(save.resourcesSpentByChamber ?? {}) }
  delete resourcesSpentByChamber[chamberId]

  return {
    ...save,
    plantedByChamber: { ...(save.plantedByChamber ?? {}), [chamberId]: [] },
    resourcesSpentByChamber,
    seedMovesByChamber: { ...(save.seedMovesByChamber ?? {}), [chamberId]: 0 },
  }
}

export function resetWithoutPunishmentText(chamberTitle = 'current chamber') {
  return `Chamber reset without punishment: ${chamberTitle} planted seeds cleared; seed moves and chamber spend penalties reset; Ark clock, materials, ratings, solved contracts, and codex remain unchanged.`
}

export function clearSave(storage = globalThis.localStorage) {
  storage?.removeItem(saveKey)
}

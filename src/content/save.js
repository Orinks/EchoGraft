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
  tuneDown: '-, [',
  tuneUp: '=, ]',
  graft: 'g',
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

export function createDefaultSave() {
  return {
    version: 1,
    arkClock: 0,
    proceduralSeed: defaultProceduralSeed,
    currentChamberId: 'tutorial',
    codexIds: [],
    endgameResolution: null,
    environmentalChanges: [],
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

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(saveKey)
    const defaults = createDefaultSave()
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      ...defaults,
      ...parsed,
      materials: { ...defaults.materials, ...(parsed.materials ?? {}) },
      settings: { ...defaults.settings, ...(parsed.settings ?? {}) },
      keyboardBindings: { ...defaults.keyboardBindings, ...(parsed.keyboardBindings ?? {}) },
      bonusContractIds: parsed.bonusContractIds ?? defaults.bonusContractIds,
      graftRatingBoosts: parsed.graftRatingBoosts ?? defaults.graftRatingBoosts,
      wildChamberIds: parsed.wildChamberIds ?? defaults.wildChamberIds,
      wildMutationIds: parsed.wildMutationIds ?? defaults.wildMutationIds,
      seedMovesByChamber: parsed.seedMovesByChamber ?? defaults.seedMovesByChamber,
      resourcesSpentByChamber: parsed.resourcesSpentByChamber ?? defaults.resourcesSpentByChamber,
    }
  } catch {
    return createDefaultSave()
  }
}

export function saveGame(save, storage = globalThis.localStorage) {
  storage?.setItem(saveKey, JSON.stringify(save))
  return save
}

export function clearSave(storage = globalThis.localStorage) {
  storage?.removeItem(saveKey)
}

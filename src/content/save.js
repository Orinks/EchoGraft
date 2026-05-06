export const saveKey = 'echograft-save-v1'

export function createDefaultSave() {
  return {
    version: 1,
    currentChamberId: 'tutorial',
    solvedChambers: [],
    inventoryIds: ['sol', 'lumen', 'umbra', 'spire'],
    customSeeds: [],
    settings: {
      master: 0.8,
      ambience: 0.55,
      ui: 0.7,
      seeds: 0.75,
      hazards: 0.65,
      scans: 0.75,
      reducedMotion: false,
      minimalVisual: false,
    },
  }
}

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(saveKey)
    return raw ? { ...createDefaultSave(), ...JSON.parse(raw) } : createDefaultSave()
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

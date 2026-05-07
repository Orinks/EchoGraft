import { describe, expect, it } from 'vitest'
import { createDefaultSave, loadSave, saveGame } from '../src/content/save.js'

function memoryStorage() {
  const store = new Map()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  }
}

describe('save system', () => {
  it('round trips progress', () => {
    const storage = memoryStorage()
    const save = createDefaultSave()
    save.arkClock = 2
    save.endgameResolution = 'preservation'
    save.solvedChambers.push('tutorial')
    save.environmentalChanges.push('Intake stabilized')
    save.plantedByChamber.tutorial = [{ id: 'sol', position: { x: 0, y: 0 } }]
    save.postgameUnlocked = true
    save.unlockedGraftMechanics.push('hybrid resonance planting')
    save.ratings.tutorial = 'Resonant'
    save.restoredSystems.push('Intake')
    save.codexIds.push('first-breath')
    save.materials.biomass = 2
    saveGame(save, storage)
    expect(loadSave(storage).solvedChambers).toEqual(['tutorial'])
    expect(loadSave(storage).arkClock).toBe(2)
    expect(loadSave(storage).endgameResolution).toBe('preservation')
    expect(loadSave(storage).environmentalChanges).toEqual(['Intake stabilized'])
    expect(loadSave(storage).plantedByChamber.tutorial).toHaveLength(1)
    expect(loadSave(storage).postgameUnlocked).toBe(true)
    expect(loadSave(storage).unlockedGraftMechanics).toEqual(['hybrid resonance planting'])
    expect(loadSave(storage).ratings.tutorial).toBe('Resonant')
    expect(loadSave(storage).restoredSystems).toEqual(['Intake'])
    expect(loadSave(storage).codexIds).toEqual(['first-breath'])
    expect(loadSave(storage).materials.biomass).toBe(2)
  })

  it('hydrates new campaign fields into older saves', () => {
    const storage = memoryStorage()
    saveGame({ version: 1, solvedChambers: ['tutorial'] }, storage)
    const loaded = loadSave(storage)
    expect(loaded.arkClock).toBe(0)
    expect(loaded.endgameResolution).toBeNull()
    expect(loaded.materials).toEqual({ biomass: 0, crystal: 0, memory: 0 })
    expect(loaded.environmentalChanges).toEqual([])
    expect(loaded.plantedByChamber).toEqual({})
    expect(loaded.postgameUnlocked).toBe(false)
    expect(loaded.unlockedGraftMechanics).toEqual([])
    expect(loaded.ratings).toEqual({})
    expect(loaded.restoredSystems).toEqual([])
  })
})

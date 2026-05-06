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
    save.solvedChambers.push('tutorial')
    saveGame(save, storage)
    expect(loadSave(storage).solvedChambers).toEqual(['tutorial'])
  })
})

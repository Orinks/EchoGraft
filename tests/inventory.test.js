import { describe, expect, it } from 'vitest'
import { seedCarryLimit, seedCarryState, seedCarryText } from '../src/content/inventory.js'

const seeds = ['Sol', 'Lumen', 'Umbra', 'Tide', 'Myco'].map((name) => ({ name }))

describe('seed carry limits', () => {
  it('separates carried seeds from library reserve voices', () => {
    const carry = seedCarryState(seeds, 4)

    expect(seedCarryLimit).toBe(4)
    expect(carry.carried.map((seed) => seed.name)).toEqual(['Sol', 'Lumen', 'Umbra', 'Tide'])
    expect(carry.reserve.map((seed) => seed.name)).toEqual(['Myco'])
    expect(carry.selectedCarryIndex).toBe(3)
    expect(carry.selectedSeed.name).toBe('Tide')
  })

  it('reports the active carry set for no-vision inventory checks', () => {
    expect(seedCarryText(seeds, 1)).toContain('Selected seed: Lumen')
    expect(seedCarryText(seeds, 1)).toContain('Seed carry limit: 4 of 4 carried')
    expect(seedCarryText(seeds, 1)).toContain('1 seed voice(s) held in the library reserve')
  })
})

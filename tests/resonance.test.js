import { describe, expect, it } from 'vitest'
import { chambers } from '../src/content/chambers.js'
import { evaluateResonance, unlockNext } from '../src/content/resonance.js'
import { createSeedDNA } from '../src/content/seeds.js'

describe('resonance evaluation', () => {
  it('solves the tutorial with a matching planted seed', () => {
    const chamber = chambers[0]
    const seed = createSeedDNA('sol', { pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0, position: { x: 0, y: 0 } })
    expect(evaluateResonance(chamber, [seed]).solved).toBe(true)
  })

  it('reports missing seeds', () => {
    expect(evaluateResonance(chambers[0], []).missing[0]).toContain('Plant')
  })

  it('unlocks only sequential chambers', () => {
    expect(unlockNext(chambers, ['tutorial'])).toContain('direction')
    expect(unlockNext(chambers, [])).toEqual(['tutorial'])
  })

  it('has a solvable ideal target for every chamber', () => {
    for (const chamber of chambers) {
      const ideal = createSeedDNA(`${chamber.id}-ideal`, {
        pitchRatio: chamber.target.pitchRatio,
        pulseRate: chamber.target.pulseRate,
        brightness: chamber.target.brightness,
        phase: chamber.target.phase,
        position: chamber.target,
        grafted: chamber.requiresGraft,
      })
      const planted = Array.from({ length: chamber.requiredSeeds }, () => ideal)
      expect(evaluateResonance(chamber, planted).solved, chamber.id).toBe(true)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { chambers } from '../src/content/chambers.js'
import { chamberSubstrate, growthTiming, plantedSeed, plantingAssessment, plantingCoverage, plantingPositions } from '../src/content/planting.js'
import { createSeedDNA } from '../src/content/seeds.js'

describe('planting', () => {
  it('turns planting into a persistent spatial seed object with substrate context', () => {
    const chamber = chambers.find((item) => item.id === 'pitch')
    const sol = createSeedDNA('sol')
    const planted = plantedSeed(sol, { x: 0, y: 1 }, chamber)

    expect(planted.seed.position).toEqual({ x: 0, y: 1 })
    expect(planted.seed.chamberSubstrate).toBe('wet root channel')
    expect(planted.assessment.meaningful).toBe(true)
    expect(planted.assessment.text).toContain('Substrate wet root channel')
  })

  it('reports nearby seed interactions before resonance evaluation', () => {
    const chamber = chambers.find((item) => item.id === 'harmony')
    const sol = createSeedDNA('sol', { position: { x: 0, y: 0 } })
    const lumen = createSeedDNA('lumen')
    const assessment = plantingAssessment(lumen, { x: 1, y: 0 }, chamber, [sol])

    expect(assessment.nearbyInteractions).toEqual([sol.name])
    expect(assessment.text).toContain(`Nearby seed interactions: ${sol.name}`)
  })

  it('names chamber substrate from the Ark system', () => {
    expect(chamberSubstrate({ system: 'Canopy' })).toBe('photosynthetic lattice')
    expect(chamberSubstrate({ system: 'Memory Orchard' })).toBe('archive loam')
  })

  it('tracks multi-position planting slots for harmonic chambers', () => {
    const chamber = chambers.find((item) => item.id === 'harmony')
    const sol = createSeedDNA('sol', { position: { x: -1, y: 0 } })
    const lumen = createSeedDNA('lumen', { position: { x: 1, y: 0 } })
    const slots = plantingPositions(chamber)
    const assessment = plantingAssessment(sol, sol.position, chamber, [])
    const coverage = plantingCoverage(chamber, [sol, lumen])

    expect(slots).toMatchObject([{ x: -1, y: 0 }, { x: 1, y: 0 }])
    expect(assessment.text).toContain('Planting slot 1 of 2')
    expect(coverage.complete).toBe(true)
    expect(coverage.coveredCount).toBe(2)
  })

  it('turns seed growth behavior into non-reflex timing guidance', () => {
    const chamber = chambers.find((item) => item.id === 'rhythm')
    const verdant = createSeedDNA('verdant', { growthBehavior: 'twining', pulseRate: 2 })
    const planted = plantedSeed(verdant, chamber.target, chamber)
    const timing = growthTiming(verdant, chamber)

    expect(timing).toMatchObject({ behavior: 'twining', pulses: 6, reflexPressure: false })
    expect(timing.text).toContain('No reflex timing required')
    expect(planted.seed.growthTiming.text).toContain('listen for 6 pulse')
    expect(planted.assessment.text).toContain('Growth timing: twining growth')
  })
})

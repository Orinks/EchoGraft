import { describe, expect, it } from 'vitest'
import { createSeedDNA, graftDiscoveries, graftSeeds, tuneSeed } from '../src/content/seeds.js'

describe('seed DNA', () => {
  it('is deterministic for the same id', () => {
    expect(createSeedDNA('ark')).toEqual(createSeedDNA('ark'))
  })

  it('tunes bounded parameters', () => {
    const seed = createSeedDNA('tune', { pitchRatio: 1, pulseRate: 1, brightness: 0.5, phase: 0 })
    expect(tuneSeed(seed, 'pitchRatio', 1).pitchRatio).toBe(1.05)
    expect(tuneSeed(seed, 'phase', -1).phase).toBe(345)
  })

  it('tunes deep seed DNA traits', () => {
    const seed = createSeedDNA('deep-tune', {
      amAmount: 0.1,
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.2 },
      fmAmount: 0.1,
      growthBehavior: 'steady',
      noiseAmount: 0.1,
    })
    expect(tuneSeed(seed, 'envelope.attack', 1).envelope.attack).toBe(0.03)
    expect(tuneSeed(seed, 'envelope.release', 1).envelope.release).toBe(0.25)
    expect(tuneSeed(seed, 'fmAmount', 1).fmAmount).toBe(0.15)
    expect(tuneSeed(seed, 'amAmount', 1).amAmount).toBe(0.15)
    expect(tuneSeed(seed, 'noiseAmount', 1).noiseAmount).toBe(0.15)
    expect(tuneSeed(seed, 'growthBehavior', 1).growthBehavior).toBe('climbing')
  })

  it('creates a grafted hybrid', () => {
    const graft = graftSeeds(createSeedDNA('a', { pitchRatio: 1 }), createSeedDNA('b', { pitchRatio: 2 }))
    expect(graft.grafted).toBe(true)
    expect(graft.pitchRatio).toBe(1.5)
    expect(graftDiscoveries(graft)).toContain('hybrid resonance planting')
  })
})

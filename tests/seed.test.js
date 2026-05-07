import { describe, expect, it } from 'vitest'
import { canopyBrightnessTuningState, createSeedDNA, graftDiscoveries, graftDiscoveryCatalog, graftDiscoveryForFamilies, graftSeeds, graftSeedsWithReport, historicalSeedTraitState, seedAudioPreview, seedFamilies, seedLineageText, tuneSeed, tuneSeedWithReport, tuningParameterDetails } from '../src/content/seeds.js'

describe('seed DNA', () => {
  it('is deterministic for the same id', () => {
    expect(createSeedDNA('ark')).toEqual(createSeedDNA('ark'))
  })

  it('tunes bounded parameters', () => {
    const seed = createSeedDNA('tune', { pitchRatio: 1, pulseRate: 1, brightness: 0.5, phase: 0 })
    expect(tuneSeed(seed, 'pitchRatio', 1).pitchRatio).toBe(1.05)
    expect(tuneSeed(seed, 'phase', -1).phase).toBe(345)
  })

  it('keeps the seed family catalog in the 24 to 36 band', () => {
    expect(seedFamilies).toHaveLength(24)
    expect(seedFamilies.every((family) => family.name && family.affinity && family.origin)).toBe(true)
    expect(createSeedDNA('sol-cutting').family).toBe('Sol')
    expect(seedLineageText(createSeedDNA('sol-cutting'))).toContain('Sol lineage')
  })

  it('unlocks historical seed traits after Memory comes online', () => {
    const seed = createSeedDNA('archive-memory')
    const locked = historicalSeedTraitState(seed, { restoredSystems: [] })
    const unlocked = historicalSeedTraitState(seed, { restoredSystems: ['Memory'] })

    expect(locked.memoryOnline).toBe(false)
    expect(locked.text).toContain('locked')
    expect(unlocked.memoryOnline).toBe(true)
    expect(unlocked.text).toContain(seed.family)
    expect(unlocked.text).toContain(seed.discoveredOrigin)
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

  it('reports single-seed tuning as before and after audio roles', () => {
    const seed = createSeedDNA('single-tune', { pitchRatio: 1, brightness: 0.45 })
    const report = tuneSeedWithReport(seed, 'pitchRatio', 1)

    expect(report.before).toBe(1)
    expect(report.after).toBe(1.05)
    expect(report.label).toBe('pitch ratio')
    expect(report.role).toBe(tuningParameterDetails.pitchRatio.role)
    expect(report.text).toContain('Single-seed tuning role')
  })

  it('unlocks finer brightness tuning after Canopy comes online', () => {
    const seed = createSeedDNA('canopy-tune', { brightness: 0.5 })
    const basic = canopyBrightnessTuningState({ restoredSystems: [] })
    const canopy = canopyBrightnessTuningState({ restoredSystems: ['Canopy'] })
    const tuned = tuneSeedWithReport(seed, 'brightness', 1, canopy.brightnessStep / 0.05)

    expect(basic.brightnessStep).toBe(0.05)
    expect(canopy.canopyOnline).toBe(true)
    expect(canopy.brightnessStep).toBe(0.03)
    expect(canopy.text).toContain('photosynthesis doors')
    expect(tuned.after).toBe(0.53)
  })

  it('summarizes seed audio previews for no-vision playback', () => {
    const seed = createSeedDNA('preview-seed', { name: 'Preview seed', waveform: 'triangle', oscillatorType: 'fm', pitchRatio: 1.5, pulseRate: 2, brightness: 0.7, phase: 90 })
    const preview = seedAudioPreview(seed)

    expect(preview.parts).toContain('waveform triangle')
    expect(preview.parts).toContain('synth fm')
    expect(preview.text).toContain('Audio preview')
    expect(preview.text).toContain('growth')
  })

  it('creates a grafted hybrid', () => {
    const graft = graftSeeds(createSeedDNA('a', { pitchRatio: 1 }), createSeedDNA('b', { pitchRatio: 2 }))
    expect(graft.grafted).toBe(true)
    expect(graft.pitchRatio).toBe(1.5)
    expect(graft.lineageHistory.length).toBeGreaterThan(2)
    expect(seedLineageText(graft)).toContain('Graft ancestry')
    expect(graftDiscoveries(graft)).toContain('hybrid resonance planting')
  })

  it('reports the first graft as inherited traits plus discovery unlocks', () => {
    const report = graftSeedsWithReport(createSeedDNA('sol'), createSeedDNA('lumen'), 'first-graft')

    expect(report.seed.grafted).toBe(true)
    expect(report.discoveries).toContain('hybrid resonance planting')
    expect(report.inheritedTraits).toEqual(expect.arrayContaining([expect.stringContaining('waveform')]))
    expect(report.record).toMatchObject({ id: 'graft-record-sol-lumen', title: 'Sol-Lumen graft record' })
    expect(report.text).toContain('First graft')
    expect(report.text).toContain('recovered record')
    expect(report.text).toContain('unlocked hybrid resonance planting')
  })

  it('catalogs 80 or more graft discoveries from family pairings', () => {
    expect(graftDiscoveryCatalog.length).toBeGreaterThanOrEqual(80)
    expect(graftDiscoveryCatalog.every((discovery) => discovery.title && discovery.mechanic && discovery.record)).toBe(true)
    const solLumen = graftDiscoveryForFamilies(createSeedDNA('sol'), createSeedDNA('lumen'))
    expect(solLumen.title).toBe('Sol-Lumen graft')
    expect(graftSeeds(createSeedDNA('sol'), createSeedDNA('lumen')).discoveryId).toBe(solLumen.id)
  })
})

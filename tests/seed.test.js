import { describe, expect, it } from 'vitest'
import { archiveLoamHiddenAncestryState, canopyBrightnessTuningState, createSeedDNA, failedGraftUtility, glassPollenUnlockedTraits, graftDiscoveries, graftDiscoveryCatalog, graftDiscoveryForFamilies, graftFailureReason, graftSeeds, graftSeedsWithReport, historicalSeedTraitState, lockSeedTrait, postgameEndlessMutationGarden, rareGraftRewards, resinTraitLockState, restoredSystemInheritedTraits, seedAudioPreview, seedBrightnessState, seedDiscoveredOriginState, seedEcologicalAffinityState, seedEnvelopeState, seedFamilies, seedFamilyState, seedGraftAncestryState, seedGrowthBehaviorState, seedLineageText, seedLockedTraits, seedModulationProfileState, seedNameState, seedNoiseProfileState, seedPhaseState, seedPitchRatioState, seedPulseRateState, seedSynthTypeState, seedWaveformState, sporeTuningCurrencyState, tuneSeed, tuneSeedWithReport, tuningParameterDetails } from '../src/content/seeds.js'

describe('seed DNA', () => {
  it('is deterministic for the same id', () => {
    expect(createSeedDNA('ark')).toEqual(createSeedDNA('ark'))
  })

  it('carries a readable seed name and catalog id for no-vision inspection', () => {
    const named = createSeedDNA('sol-cutting', { name: 'Sol cutting' })
    const fallback = createSeedDNA('unnamed-cutting', { name: undefined })

    expect(seedNameState(named)).toEqual({
      id: 'sol-cutting',
      name: 'Sol cutting',
      text: 'Seed name: Sol cutting; catalog id sol-cutting.',
    })
    expect(fallback.name).toBe('Seed unnamed-cutting')
    expect(seedNameState(fallback).text).toContain('Seed name: Seed unnamed-cutting')
  })

  it('tunes bounded parameters', () => {
    const seed = createSeedDNA('tune', { pitchRatio: 1, pulseRate: 1, brightness: 0.5, phase: 0 })
    expect(tuneSeed(seed, 'pitchRatio', 1).pitchRatio).toBe(1.05)
    expect(tuneSeed(seed, 'phase', -1).phase).toBe(345)
  })

  it('reports pitch ratio as a root interval with optional target delta', () => {
    const seed = createSeedDNA('pitch-report', { pitchRatio: 1.5 })
    const state = seedPitchRatioState(seed, 1)

    expect(state.pitchRatio).toBe(1.5)
    expect(state.targetDelta).toBe(0.5)
    expect(state.role).toBe(tuningParameterDetails.pitchRatio.role)
    expect(state.text).toContain('target delta 0.5')
  })

  it('reports pulse rate as rhythmic growth timing with optional target delta', () => {
    const seed = createSeedDNA('pulse-report', { pulseRate: 2.5 })
    const state = seedPulseRateState(seed, 1)

    expect(state.pulseRate).toBe(2.5)
    expect(state.targetDelta).toBe(1.5)
    expect(state.role).toBe(tuningParameterDetails.pulseRate.role)
    expect(state.text).toContain('rhythmic growth and system timing')
  })

  it('reports brightness as filter and canopy light metadata with optional target delta', () => {
    const seed = createSeedDNA('brightness-report', { brightness: 0.7 })
    const state = seedBrightnessState(seed, 0.45)

    expect(state.brightness).toBe(0.7)
    expect(state.targetDelta).toBe(0.25)
    expect(state.role).toBe(tuningParameterDetails.brightness.role)
    expect(state.text).toContain('filter opening and canopy light color')
  })

  it('reports phase as cancellation alignment with shortest target offset', () => {
    const seed = createSeedDNA('phase-report', { phase: 345 })
    const state = seedPhaseState(seed, 0)

    expect(state.phase).toBe(345)
    expect(state.targetDelta).toBe(-15)
    expect(state.role).toBe(tuningParameterDetails.phase.role)
    expect(state.text).toContain('alignment, cancellation, and hidden echo behavior')
  })

  it('reports waveform as synthesis timbre and chamber requirement metadata', () => {
    const seed = createSeedDNA('waveform-report', { waveform: 'triangle' })
    const state = seedWaveformState(seed, ['triangle', 'sawtooth'])

    expect(state.waveform).toBe('triangle')
    expect(state.matchesRequirement).toBe(true)
    expect(state.text).toContain('timbre shape for synthesis and graft inheritance')
    expect(seedWaveformState(seed, ['sine']).matchesRequirement).toBe(false)
  })

  it('reports synth type as Syngen routing metadata', () => {
    const seed = createSeedDNA('synth-report', { oscillatorType: 'fm' })
    const state = seedSynthTypeState(seed)

    expect(state.oscillatorType).toBe('fm')
    expect(state.routing).toBe('frequency-modulated Syngen voice')
    expect(state.text).toBe('Synth type: fm; routes to frequency-modulated Syngen voice.')
    expect(createSeedDNA('bad-synth', { oscillatorType: 'wrong' }).oscillatorType).toBe('pure')
    expect(seedSynthTypeState({ oscillatorType: 'wrong' }).oscillatorType).toBe('pure')
  })

  it('reports modulation profile as readable FM, AM, and noise roles', () => {
    const seed = createSeedDNA('modulation-report', { amAmount: 0.35, fmAmount: 0.2, noiseAmount: 0.1 })
    const state = seedModulationProfileState(seed)

    expect(state).toMatchObject({
      amAmount: 0.35,
      dominantLayer: 'AM',
      fmAmount: 0.2,
      noiseAmount: 0.1,
    })
    expect(state.text).toContain('pressure, root grit, and harmonic edge')
    expect(state.text).toContain('current sway and rhythmic amplitude motion')
    expect(state.text).toContain('breath, compost, and masking texture')
    expect(seedModulationProfileState({ fmAmount: 2, amAmount: -1, noiseAmount: undefined })).toMatchObject({
      amAmount: 0,
      dominantLayer: 'FM',
      fmAmount: 1,
      noiseAmount: 0,
    })
  })

  it('reports envelope as a complete ADSR shape', () => {
    const seed = createSeedDNA('envelope-report', {
      envelope: { attack: 0.03, decay: 0.11, sustain: 0.6, release: 0.4 },
    })
    const state = seedEnvelopeState(seed)

    expect(state.envelope).toEqual({ attack: 0.03, decay: 0.11, sustain: 0.6, release: 0.4 })
    expect(state.text).toContain('how quickly the seed voice blooms')
    expect(state.text).toContain('how long the seed voice lingers')
    expect(state.text).toContain('ADSR shape controls bloom, body, and lingering tail')
    expect(seedEnvelopeState({ envelope: { attack: 2, decay: -1, sustain: 3, release: undefined } }).envelope).toEqual({
      attack: 0.25,
      decay: 0.04,
      sustain: 1,
      release: 0.25,
    })
  })

  it('reports noise profile texture and synthesis route', () => {
    const seed = createSeedDNA('noise-report', { noiseAmount: 0.25, oscillatorType: 'noise-kissed' })
    const state = seedNoiseProfileState(seed)

    expect(state.noiseAmount).toBe(0.25)
    expect(state.texture).toBe('compost hiss')
    expect(state.synthRoute).toBe('noise-kissed Syngen buffer voice')
    expect(state.text).toContain('breath, compost, and masking texture')
    expect(seedNoiseProfileState({ noiseAmount: 0 }).texture).toBe('clean tone')
    expect(seedNoiseProfileState({ noiseAmount: 0.1 }).texture).toBe('breath trace')
    expect(seedNoiseProfileState({ noiseAmount: 0.6 }).texture).toBe('dense masking bed')
    expect(seedNoiseProfileState({ noiseAmount: 2, oscillatorType: 'pure' })).toMatchObject({
      noiseAmount: 1,
      synthRoute: 'additive or modulated Syngen voice with harmonic noise color',
      texture: 'dense masking bed',
    })
  })

  it('reports growth behavior as non-reflex timing guidance', () => {
    const seed = createSeedDNA('growth-report', { growthBehavior: 'twining', pulseRate: 2 })
    const state = seedGrowthBehaviorState(seed)

    expect(state).toMatchObject({
      behavior: 'twining',
      pulses: 6,
      role: 'braids with nearby planted voices over a longer cycle',
      seconds: 12,
    })
    expect(state.text).toContain('no reflex timing required')
    expect(createSeedDNA('bad-growth', { growthBehavior: 'feral' }).growthBehavior).toBe('steady')
    expect(seedGrowthBehaviorState({ growthBehavior: 'feral', pulseRate: 1 }).behavior).toBe('steady')
  })

  it('keeps the seed family catalog in the 24 to 36 band', () => {
    expect(seedFamilies).toHaveLength(24)
    expect(seedFamilies.every((family) => family.name && family.affinity && family.origin)).toBe(true)
    expect(createSeedDNA('sol-cutting').family).toBe('Sol')
    expect(seedLineageText(createSeedDNA('sol-cutting'))).toContain('Sol lineage')
  })

  it('gives Sol seeds a stable sine oxygen pitch archetype', () => {
    const seed = createSeedDNA('sol-cutting')

    expect(seed).toMatchObject({
      brightness: 0.45,
      ecologicalAffinity: 'oxygen and stable pitch',
      family: 'Sol',
      growthBehavior: 'steady',
      noiseAmount: 0,
      oscillatorType: 'pure',
      phase: 0,
      pitchRatio: 1,
      pulseRate: 1,
      waveform: 'sine',
    })
    expect(seedFamilyState(seed).text).toContain('oxygen and stable pitch')
    expect(seedWaveformState(seed, ['sine'])).toMatchObject({ matchesRequirement: true, waveform: 'sine' })
  })

  it('gives Lumen seeds a bright triangle canopy light archetype', () => {
    const seed = createSeedDNA('lumen-cutting')

    expect(seed).toMatchObject({
      brightness: 0.7,
      ecologicalAffinity: 'canopy light and brightness',
      family: 'Lumen',
      growthBehavior: 'climbing',
      oscillatorType: 'pure',
      phase: 90,
      pitchRatio: 1.5,
      pulseRate: 2,
      waveform: 'triangle',
    })
    expect(seedFamilyState(seed).text).toContain('canopy light and brightness')
    expect(seedWaveformState(seed, ['triangle'])).toMatchObject({ matchesRequirement: true, waveform: 'triangle' })
  })

  it('gives Umbra seeds a phase cancellation hidden-record archetype', () => {
    const seed = createSeedDNA('umbra-cutting')

    expect(seed).toMatchObject({
      brightness: 0.25,
      ecologicalAffinity: 'phase cancellation and hidden records',
      family: 'Umbra',
      growthBehavior: 'twining',
      oscillatorType: 'am',
      phase: 180,
      pitchRatio: 0.75,
      pulseRate: 0.75,
      waveform: 'square',
    })
    expect(seedFamilyState(seed).text).toContain('phase cancellation and hidden records')
    expect(seedPhaseState(seed, 0)).toMatchObject({ phase: 180, targetDelta: -180 })
    expect(seedWaveformState(seed, ['square'])).toMatchObject({ matchesRequirement: true, waveform: 'square' })
  })

  it('gives Verdant seeds a pulse rhythm growth archetype', () => {
    const seed = createSeedDNA('verdant-cutting')

    expect(seed).toMatchObject({
      brightness: 0.55,
      ecologicalAffinity: 'growth rhythm and pulse timing',
      family: 'Verdant',
      growthBehavior: 'breathing',
      oscillatorType: 'am',
      phase: 45,
      pitchRatio: 1.25,
      pulseRate: 2.5,
      waveform: 'sine',
    })
    expect(seedPulseRateState(seed, 1)).toMatchObject({ pulseRate: 2.5, targetDelta: 1.5 })
    expect(seedGrowthBehaviorState(seed)).toMatchObject({ behavior: 'breathing' })
  })

  it('gives Spire seeds a saw altitude canopy access archetype', () => {
    const seed = createSeedDNA('spire-cutting')

    expect(seed).toMatchObject({
      brightness: 0.85,
      ecologicalAffinity: 'altitude and canopy access',
      family: 'Spire',
      growthBehavior: 'climbing',
      oscillatorType: 'fm',
      phase: 270,
      pitchRatio: 2,
      pulseRate: 3,
      waveform: 'sawtooth',
    })
    expect(seedWaveformState(seed, ['sawtooth'])).toMatchObject({ matchesRequirement: true, waveform: 'sawtooth' })
    expect(seedGrowthBehaviorState(seed)).toMatchObject({ behavior: 'climbing' })
  })

  it('gives Myco seeds a noise FM root-network archetype', () => {
    const seed = createSeedDNA('myco-thread')

    expect(seed).toMatchObject({
      brightness: 0.38,
      ecologicalAffinity: 'noise, compost, and root networks',
      family: 'Myco',
      fmAmount: 0.35,
      growthBehavior: 'twining',
      noiseAmount: 0.25,
      oscillatorType: 'noise-kissed',
      phase: 135,
      pitchRatio: 0.9,
      pulseRate: 1.5,
      waveform: 'sine',
    })
    expect(seedModulationProfileState(seed)).toMatchObject({ dominantLayer: 'FM', fmAmount: 0.35, noiseAmount: 0.25 })
    expect(seedNoiseProfileState(seed)).toMatchObject({ noiseAmount: 0.25, synthRoute: 'noise-kissed Syngen buffer voice', texture: 'compost hiss' })
    expect(seedGrowthBehaviorState(seed)).toMatchObject({ behavior: 'twining' })
  })

  it('gives Glass seeds a high-brightness reflective chamber archetype', () => {
    const seed = createSeedDNA('glass-cutting')

    expect(seed).toMatchObject({
      brightness: 0.92,
      ecologicalAffinity: 'high brightness and reflections',
      family: 'Glass',
      fmAmount: 0.12,
      growthBehavior: 'steady',
      oscillatorType: 'pure',
      phase: 120,
      pitchRatio: 1.5,
      pulseRate: 2,
      waveform: 'triangle',
    })
    expect(seedBrightnessState(seed, 0.7)).toMatchObject({ brightness: 0.92, targetDelta: 0.22 })
    expect(seedWaveformState(seed, ['triangle'])).toMatchObject({ matchesRequirement: true, waveform: 'triangle' })
  })

  it('gives Tide seeds an AM current-system archetype', () => {
    const seed = createSeedDNA('tide-pump')

    expect(seed).toMatchObject({
      amAmount: 0.42,
      brightness: 0.5,
      ecologicalAffinity: 'AM current systems',
      family: 'Tide',
      growthBehavior: 'breathing',
      oscillatorType: 'am',
      phase: 60,
      pitchRatio: 1.1,
      pulseRate: 1.75,
      waveform: 'sine',
    })
    expect(seedModulationProfileState(seed)).toMatchObject({ amAmount: 0.42, dominantLayer: 'AM' })
    expect(seedPulseRateState(seed, 1)).toMatchObject({ pulseRate: 1.75, targetDelta: 0.75 })
    expect(seedGrowthBehaviorState(seed)).toMatchObject({ behavior: 'breathing' })
  })

  it('gives Ember seeds a distortion heat archetype', () => {
    const seed = createSeedDNA('ember-coal')

    expect(seed).toMatchObject({
      brightness: 0.82,
      ecologicalAffinity: 'heat and thermal shutters',
      family: 'Ember',
      fmAmount: 0.48,
      growthBehavior: 'steady',
      noiseAmount: 0.5,
      oscillatorType: 'fm',
      phase: 30,
      pitchRatio: 1.75,
      pulseRate: 2.25,
      waveform: 'sawtooth',
    })
    expect(seedBrightnessState(seed, 0.75)).toMatchObject({ brightness: 0.82, targetDelta: 0.07 })
    expect(seedModulationProfileState(seed)).toMatchObject({ dominantLayer: 'noise', fmAmount: 0.48, noiseAmount: 0.5 })
    expect(seedNoiseProfileState(seed)).toMatchObject({ noiseAmount: 0.5, texture: 'dense masking bed' })
    expect(seedWaveformState(seed, ['sawtooth'])).toMatchObject({ matchesRequirement: true, waveform: 'sawtooth' })
  })

  it('gives Archive seeds a formant memory archetype', () => {
    const seed = createSeedDNA('archive-memory')

    expect(seed).toMatchObject({
      amAmount: 0.36,
      brightness: 0.28,
      ecologicalAffinity: 'formant memory and codex echoes',
      family: 'Archive',
      fmAmount: 0.08,
      formantMemory: true,
      formantMix: 0.62,
      formantPair: ['createI', 'createE'],
      growthBehavior: 'twining',
      noiseAmount: 0.06,
      oscillatorType: 'am',
      phase: 210,
      pitchRatio: 1.25,
      pulseRate: 0.9,
      waveform: 'triangle',
    })
    expect(seedDiscoveredOriginState(seed)).toMatchObject({ origin: 'Memory pond' })
    expect(seedModulationProfileState(seed)).toMatchObject({ amAmount: 0.36, dominantLayer: 'AM' })
    expect(seedPhaseState(seed, 180)).toMatchObject({ phase: 210, targetDelta: 30 })
    expect(seedWaveformState(seed, ['triangle'])).toMatchObject({ matchesRequirement: true, waveform: 'triangle' })
  })

  it('reports family, affinity, and origin as readable seed DNA metadata', () => {
    const seed = createSeedDNA('lumen-cutting')
    const state = seedFamilyState(seed)

    expect(state).toMatchObject({
      affinity: 'canopy light and brightness',
      family: 'Lumen',
      origin: 'Glass leaves',
    })
    expect(state.text).toBe('Seed family: Lumen; affinity canopy light and brightness; discovered origin Glass leaves.')
  })

  it('reports ecological affinity as a dedicated restoration role', () => {
    const seed = createSeedDNA('myco-thread')
    const state = seedEcologicalAffinityState(seed)

    expect(state).toEqual({
      affinity: 'noise, compost, and root networks',
      family: 'Myco',
      role: 'restoration role for Myco ecology',
      text: 'Ecological affinity: noise, compost, and root networks; restoration role for Myco ecology.',
    })
    expect(createSeedDNA('affinity-fallback', { ecologicalAffinity: undefined }).ecologicalAffinity).toBeTruthy()
    expect(seedEcologicalAffinityState({ family: 'Unknown' })).toMatchObject({
      affinity: 'unmapped ecology',
      role: 'restoration role not mapped yet',
    })
  })

  it('reports discovered origin as a dedicated lore record hook', () => {
    const seed = createSeedDNA('archive-seed')
    const state = seedDiscoveredOriginState(seed)

    expect(state).toMatchObject({
      family: 'Archive',
      origin: 'Memory pond',
      recordRole: 'origin record for Archive lineage and Memory codex echoes',
    })
    expect(state.text).toBe('Discovered origin: Memory pond; origin record for Archive lineage and Memory codex echoes.')
    expect(createSeedDNA('origin-fallback', { discoveredOrigin: undefined }).discoveredOrigin).toBeTruthy()
    expect(seedDiscoveredOriginState({ family: 'Unknown' })).toMatchObject({
      origin: 'unknown origin',
      recordRole: 'origin record not recovered yet',
    })
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

  it('reveals hidden ancestry when archive loam is available', () => {
    const seed = createSeedDNA('loam-archive', {
      discoveredOrigin: 'Dream compost',
      ecologicalAffinity: 'archive loam and ancestry reveal',
      family: 'Loam',
    })
    const locked = archiveLoamHiddenAncestryState(seed, { materials: { archiveLoam: 0 } })
    const revealed = archiveLoamHiddenAncestryState(seed, { materials: { archiveLoam: 1 } })

    expect(locked.revealed).toBe(false)
    expect(locked.text).toContain('locked')
    expect(revealed.revealed).toBe(true)
    expect(revealed.hiddenAncestry).toContain('Loam hidden ancestry')
    expect(revealed.text).toContain('Dream compost')
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

  it('treats spores as the common tuning currency', () => {
    const funded = sporeTuningCurrencyState({ materials: { spores: 2 } }, 'fmAmount')
    const empty = sporeTuningCurrencyState({ materials: { spores: 0 } }, 'pitchRatio')

    expect(funded.canSpend).toBe(true)
    expect(funded.cost).toBe(1)
    expect(funded.remaining).toBe(1)
    expect(funded.text).toContain('Spores spent as tuning currency')
    expect(funded.text).toContain(tuningParameterDetails.fmAmount.role)
    expect(empty.canSpend).toBe(false)
    expect(empty.remaining).toBe(0)
    expect(empty.text).toContain('common tuning currency')
  })

  it('uses resin to lock a seed trait against tuning changes', () => {
    const seed = createSeedDNA('resin-lock', { pitchRatio: 1 })
    const ready = resinTraitLockState({ materials: { resin: 1 } }, seed, 'pitchRatio')
    const locked = lockSeedTrait(seed, 'pitchRatio')
    const report = tuneSeedWithReport(locked, 'pitchRatio', 1)
    const graft = graftSeedsWithReport(locked, createSeedDNA('lumen-lock-partner'), 'resin-locked-graft')

    expect(ready.canLock).toBe(true)
    expect(ready.remaining).toBe(0)
    expect(ready.text).toContain('Resin lock ready')
    expect(seedLockedTraits(locked)).toEqual(['pitchRatio'])
    expect(tuneSeed(locked, 'pitchRatio', 1).pitchRatio).toBe(1)
    expect(report.text).toContain('locked by resin')
    expect(resinTraitLockState({ materials: { resin: 2 } }, locked, 'pitchRatio').alreadyLocked).toBe(true)
    expect(seedLockedTraits(graft.seed)).toEqual(['pitchRatio'])
    expect(graft.inheritedTraits).toContain('resin locked pitch ratio')
  })

  it('unlocks brightness and timbre traits from glass pollen', () => {
    const locked = glassPollenUnlockedTraits({ materials: { glassPollen: 0 } })
    const unlocked = glassPollenUnlockedTraits({ materials: { glassPollen: 1 } })
    const report = graftSeedsWithReport(createSeedDNA('glass-parent'), createSeedDNA('pollen-parent'), 'glass-pollen-graft', {
      materials: { glassPollen: 1 },
    })

    expect(locked.unlocked).toBe(false)
    expect(locked.text).toContain('locked')
    expect(unlocked.unlocked).toBe(true)
    expect(unlocked.traits.map((item) => item.trait)).toEqual(['brightness bloom tuning', 'edged timbre inheritance'])
    expect(report.glassPollenTraits).toHaveLength(2)
    expect(report.inheritedTraits).toEqual(expect.arrayContaining([
      'glass pollen unlocked brightness bloom tuning',
      'glass pollen unlocked edged timbre inheritance',
    ]))
    expect(report.text).toContain('glass pollen unlocked brightness bloom tuning')
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
    expect(graft.pitchRatio).toBe(1)
    expect(graft.lineageHistory.length).toBeGreaterThan(2)
    expect(seedLineageText(graft)).toContain('Graft ancestry')
    expect(graftDiscoveries(graft)).toContain('hybrid resonance planting')
  })

  it('uses parent A for graft root pitch and waveform', () => {
    const parentA = createSeedDNA('parent-a', { name: 'Parent A', pitchRatio: 0.75, waveform: 'square' })
    const parentB = createSeedDNA('parent-b', { name: 'Parent B', pitchRatio: 2, waveform: 'triangle' })
    const report = graftSeedsWithReport(parentA, parentB, 'pitch-waveform-graft')

    expect(report.seed.pitchRatio).toBe(0.75)
    expect(report.seed.waveform).toBe('square')
    expect(report.inheritedTraits).toEqual(expect.arrayContaining([
      'root pitch 0.75 from Parent A',
      'waveform square from Parent A',
    ]))
    expect(report.text).toContain('root pitch 0.75 from Parent A')
  })

  it('uses parent B for graft modulation and growth behavior', () => {
    const parentA = createSeedDNA('parent-a-mod', {
      amAmount: 0.7,
      fmAmount: 0.8,
      growthBehavior: 'steady',
      name: 'Parent A',
      noiseAmount: 0.6,
    })
    const parentB = createSeedDNA('parent-b-mod', {
      amAmount: 0.25,
      fmAmount: 0.15,
      growthBehavior: 'twining',
      name: 'Parent B',
      noiseAmount: 0.35,
    })
    const report = graftSeedsWithReport(parentA, parentB, 'mod-growth-graft')

    expect(report.seed).toMatchObject({
      amAmount: 0.25,
      fmAmount: 0.15,
      growthBehavior: 'twining',
      noiseAmount: 0.35,
    })
    expect(report.inheritedTraits).toEqual(expect.arrayContaining([
      'modulation FM 0.15, AM 0.25, noise 0.35 from Parent B',
      'growth twining from Parent B',
    ]))
    expect(report.text).toContain('modulation FM 0.15, AM 0.25, noise 0.35 from Parent B')
  })

  it('unlocks new inherited graft traits from restored systems', () => {
    const unlocked = restoredSystemInheritedTraits(['Water pumps', 'Canopy lights', 'Memory Orchard'])
    const report = graftSeedsWithReport(createSeedDNA('sol'), createSeedDNA('lumen'), 'system-trait-graft', {
      restoredSystems: ['Water pumps', 'Canopy lights', 'Memory Orchard'],
    })

    expect(unlocked.map((item) => item.trait)).toEqual([
      'current-carried AM sway',
      'photosynthetic brightness bloom',
      'archive ancestry echo',
    ])
    expect(report.unlockedInheritedTraits).toHaveLength(3)
    expect(report.seed.unlockedInheritedTraits.map((item) => item.system)).toEqual(['Water', 'Canopy', 'Memory'])
    expect(report.inheritedTraits).toEqual(expect.arrayContaining([
      'restored Water unlocked current-carried AM sway',
      'restored Canopy unlocked photosynthetic brightness bloom',
      'restored Memory unlocked archive ancestry echo',
    ]))
    expect(report.text).toContain('restored Water unlocked current-carried AM sway')
  })

  it('turns failed grafts into compost and noisy tools', () => {
    const seedA = createSeedDNA('sol-a', { family: 'Sol', name: 'Sol A', noiseAmount: 0.05 })
    const seedB = createSeedDNA('sol-b', { family: 'Sol', name: 'Sol B', noiseAmount: 0.1 })
    const utility = failedGraftUtility(seedA, seedB, 'failed-sol-graft')
    const report = graftSeedsWithReport(seedA, seedB, 'failed-sol-graft')

    expect(graftFailureReason(seedA, seedB)).toBe('matching family lines need a second family to stabilize')
    expect(utility).toMatchObject({
      compostYield: 1,
      status: 'failed',
    })
    expect(utility.noisyTool).toMatchObject({
      failedGraft: true,
      grafted: true,
      noiseAmount: 0.35,
      oscillatorType: 'noise-kissed',
    })
    expect(report.status).toBe('failed')
    expect(report.noisyTool.name).toBe('Sol-Sol noisy graft tool')
    expect(report.text).toContain('Recovered 1 dream compost')
    expect(report.text).toContain('noise-kissed tool')
  })

  it('rewards rare grafts with records, bonus contract leads, and rating options', () => {
    const seed = graftSeeds(createSeedDNA('sol'), createSeedDNA('myco'))
    const rewards = rareGraftRewards(seed)
    const report = graftSeedsWithReport(createSeedDNA('sol'), createSeedDNA('myco'), 'rare-sol-myco', {
      restoredSystems: ['Memory Orchard'],
    })

    expect(rewards.rare).toBe(true)
    expect(rewards.rewards).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'record', id: 'graft-record-sol-myco' }),
      expect.objectContaining({ kind: 'bonus-contract', id: 'bonus-sol-myco' }),
    ]))
    expect(report.rareRewards.rewards).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'rating-improvement', id: 'rating-sol-myco' }),
    ]))
    expect(report.text).toContain('Rare graft rewards')
    expect(report.text).toContain('bonus contract lead')
    expect(report.text).toContain('improved restoration rating option')
  })

  it('grows deterministic postgame endless mutation seeds', () => {
    const save = {
      postgameUnlocked: true,
      proceduralSeed: 'garden-alpha',
      endlessMutationSeeds: [],
      wildMutationIds: ['pitch-wild-mutation'],
    }
    const inventory = [
      createSeedDNA('sol-garden', { name: 'Sol garden' }),
      createSeedDNA('lumen-garden', { name: 'Lumen garden' }),
    ]
    const garden = postgameEndlessMutationGarden(save, inventory)

    expect(garden.ready).toBe(true)
    expect(garden.nextMutation.seed).toMatchObject({
      grafted: true,
      id: 'endless-mutation-1',
      name: 'Endless Mutation 1',
    })
    expect(garden.nextMutation.text).toContain('Endless mutation garden grew Endless Mutation 1')
    expect(postgameEndlessMutationGarden({ postgameUnlocked: false }, inventory).ready).toBe(false)
  })

  it('reports graft ancestry as parent seed lines and archive record', () => {
    const graft = graftSeeds(createSeedDNA('sol'), createSeedDNA('lumen'))
    const state = seedGraftAncestryState(graft)

    expect(state).toMatchObject({
      grafted: true,
      parents: ['Sol', 'Lumen'],
      record: 'sol-lumen',
    })
    expect(state.text).toContain('Graft ancestry: Sol plus Lumen')
    expect(state.text).toContain('hybrid traits inherited from parent seed lines')
    expect(seedGraftAncestryState(createSeedDNA('sol')).text).toBe('Graft ancestry: none; base seed line.')
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

import { describe, expect, it } from 'vitest'
import { chambers } from '../src/content/chambers.js'
import { boundaryObjectiveScanV1State, boundaryScanState, chamberChangeScanState, chamberCompassCue, glassShearReflectionState, hazardScanState, heartScanState, materialScanState, memoryLoopState, memoryScanState, navigationScanState, networkScanState, phaseFogDirectionState, scanLogFeedbackState, scanLogModes, scanModeLabels, scanPulse, scanRangeState, seedAmDepthScanState, seedBrightnessFilterScanState, seedEnvelopeShapeScanState, seedFamilyScanState, seedFmDepthScanState, seedHarmonicRelationshipScanState, seedHazardAvoidanceScanState, seedNearbyInteractionState, seedNetworkContributionScanState, seedNoiseAmountScanState, seedPhaseMatchScanState, seedPitchMatchScanState, seedPositionMatchScanState, seedPositionState, seedRhythmMatchScanState, seedScanState, seedSpatialRadiusScanState, seedSubstrateScanState, seedTimbreMatchScanState, seedTuningScanState, windCarriedEcho } from '../src/content/scan.js'

describe('scan pulse', () => {
  it('reports direction, distance, and delay trail for no-vision scanning', () => {
    const pulse = scanPulse({ x: 3, y: -1 }, { x: -1, y: 2, pitchRatio: 1, pulseRate: 1 })

    expect(pulse.distance).toBe(5)
    expect(pulse.direction).toMatchObject({ horizontal: 'west', side: 'left', vertical: 'north' })
    expect(pulse.delayTrail).toHaveLength(3)
    expect(pulse.delayTrail[2]).toBeGreaterThan(pulse.delayTrail[1])
    expect(pulse.range).toBe(8)
    expect(pulse.text).toContain('Scan pulse')
  })

  it('guarantees readable scan log feedback for every scan mode', () => {
    for (const mode of scanLogModes) {
      const feedback = scanLogFeedbackState(mode, `${mode} scan: readable report.`)

      expect(feedback).toMatchObject({ logged: true, mode })
      expect(feedback.text).toContain(`${mode} scan`)
    }

    expect(scanModeLabels).toMatchObject({
      objective: 'Objective scan',
      boundaries: 'Boundary scan',
      seeds: 'Planted seed scan',
      hazards: 'Hazard scan',
    })
    expect(scanLogModes.every((mode) => scanModeLabels[mode])).toBe(true)

    const fallback = scanLogFeedbackState('unknown-mode', '')
    expect(fallback).toMatchObject({ logged: true, mode: 'objective', originalMode: 'unknown-mode' })
    expect(fallback.text).toContain('Scan log feedback')
    expect(fallback.text).toContain('objective, boundaries, seeds, hazards, memory, network, materials, chamber feedback')
  })

  it('adds material and chamber-change scan reports', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const save = {
      environmentalChanges: ['Intake: Training Contract: First Breath stabilized with Resonant resonance'],
      materials: { biomass: 1, spores: 1 },
      plantedByChamber: { tutorial: [{ id: 'sol' }] },
      ratings: { tutorial: 'Resonant' },
      resourcesSpentByChamber: { tutorial: { spores: 1 } },
      restoredSystems: ['Intake'],
      seedMovesByChamber: { tutorial: 1 },
      solvedChambers: ['tutorial'],
    }
    const material = materialScanState(chamber, save)
    const chamberChange = chamberChangeScanState(chamber, save, [{ id: 'sol' }])

    expect(scanLogModes).toEqual(['objective', 'boundaries', 'seeds', 'hazards', 'memory', 'network', 'materials', 'chamber'])
    expect(material.text).toContain('Material scan: carried biomass 1, spores 1')
    expect(material.text).toContain('saved spend 1 spores')
    expect(chamberChange.text).toContain('Chamber change scan: Training Contract: First Breath is restored with Resonant rating')
    expect(chamberChange.text).toContain('1 saved planted seed')
  })

  it('reflects scans from glass shear chambers', () => {
    const chamber = chambers.find((item) => item.id === 'glass-rain')
    const player = { x: -2, y: -3 }
    const pulse = scanPulse(player, chamber.target, chamber)
    const reflection = glassShearReflectionState(player, chamber.target, chamber, pulse.distance)

    expect(chamber.glassShear).toMatchObject({ axis: 'vertical' })
    expect(pulse.glassShear).toMatchObject({
      axis: 'vertical',
      reflectedDirection: { dx: -2, dy: 4, horizontal: 'west', vertical: 'north' },
    })
    expect(reflection.delay).toBe(pulse.glassShear.delay)
    expect(pulse.text).toContain('Glass shear reflects scan')
    expect(pulse.text).toContain('glass rain sheets mirror objective scans')
  })

  it('inverts direction cues inside phase fog chambers', () => {
    const chamber = chambers.find((item) => item.id === 'fog-harp')
    const player = { x: -4, y: 0 }
    const pulse = scanPulse(player, chamber.target, chamber)
    const fog = phaseFogDirectionState(pulse.direction, chamber)

    expect(chamber.phaseFog).toBeTruthy()
    expect(pulse.direction).toMatchObject({ horizontal: 'east', side: 'right', vertical: 'level' })
    expect(pulse.phaseFog).toMatchObject({
      invertedDirection: { horizontal: 'west', side: 'left', vertical: 'level' },
    })
    expect(fog.text).toContain('Phase fog inverts direction cue')
    expect(pulse.text).toContain('heard west, level')
    expect(pulse.text).toContain('true direction east, level')
  })

  it('keeps nearby scan pulses short and bright', () => {
    const pulse = scanPulse({ x: 0, y: 0 }, { x: 0, y: 1 })

    expect(pulse.brightness).toBeGreaterThan(0.8)
    expect(pulse.duration).toBeLessThan(0.25)
  })

  it('summarizes heart scan direction, distance, and objective together', () => {
    const heartScan = heartScanState(
      { x: 0, y: -2 },
      { objective: 'Restore the intake heart.', target: { x: 0, y: 1 } },
      8,
    )

    expect(heartScan.distance).toBe(3)
    expect(heartScan.direction).toMatchObject({ horizontal: 'center', vertical: 'north' })
    expect(heartScan.objective).toBe('Restore the intake heart.')
    expect(heartScan.text).toContain('Heart scan: direction center, north')
    expect(heartScan.text).toContain('distance 3.0 step(s)')
    expect(heartScan.text).toContain('objective Restore the intake heart.')
  })

  it('summarizes boundary scan edges, exits, and safe return point', () => {
    const boundary = boundaryScanState(
      { x: 1, y: -2 },
      { start: { x: 0, y: -2 }, exits: [{ id: 'east-door', name: 'east door', position: { x: 5, y: -2 } }] },
    )

    expect(boundary.edges).toMatchObject({ west: -5, east: 5, south: -7, north: 3 })
    expect(boundary.exits[0]).toMatchObject({ id: 'east-door', position: { x: 5, y: -2 } })
    expect(boundary.safeReturnPoint).toMatchObject({ x: 0, y: -2 })
    expect(boundary.text).toContain('Boundary scan: chamber edges west -5, east 5, south -7, north 3')
    expect(boundary.text).toContain('Exits: east door 5, -2')
    expect(boundary.text).toContain('Safe return point 0, -2')
  })

  it('summarizes boundary and objective scan v1 readiness', () => {
    const state = boundaryObjectiveScanV1State(
      { x: 0, y: -2 },
      {
        objective: 'Restore the intake heart.',
        start: { x: 0, y: -2 },
        target: { x: 0, y: 1 },
        exits: [{ id: 'east-door', name: 'east door', position: { x: 5, y: -2 } }],
      },
      { restoredSystems: ['Intake'] },
    )

    expect(state.ready).toBe(true)
    expect(state.objective.distance).toBe(3)
    expect(state.range.range).toBe(12)
    expect(state.sections.map((section) => section.id)).toEqual([
      'heart-bearing',
      'scan-range',
      'chamber-boundaries',
      'exits-and-return',
      'navigation-context',
      'captioned-actions',
    ])
    expect(state.text).toContain('Boundary/objective scan v1 ready')
  })

  it('summarizes planted seed positions and traits', () => {
    const seedScan = seedScanState([
      {
        brightness: 0.45,
        amAmount: 0.4,
        ecologicalAffinity: 'oxygen and stable pitch',
        discoveredOrigin: 'Intake lung',
        envelope: { attack: 0.02, decay: 0.12, sustain: 0.5, release: 0.25 },
        family: 'Sol',
        fmAmount: 0.2,
        name: 'Sol phonoseed',
        noiseAmount: 0.12,
        oscillatorType: 'fm',
        phase: 0,
        pitchRatio: 1,
        position: { x: 0, y: 1 },
        pulseRate: 1,
        waveform: 'sine',
      },
    ], { target: { x: 0, y: 0, brightness: 0.45, phase: 0, pitchRatio: 1, pulseRate: 1 }, tolerances: { position: 1.5 } })

    expect(seedScan.count).toBe(1)
    expect(seedScan.seeds[0]).toMatchObject({
      family: 'Sol',
      amDepthState: { amDepth: 0.4, band: 'medium AM sway', carrier: 'secondary amplitude layer' },
      brightnessFilterState: { brightness: 0.45, cutoffHz: 3120, delta: 0, withinTolerance: undefined },
      envelopeShapeState: { bloom: 'quick bloom', body: 'balanced body', tail: 'medium tail' },
      familyState: { affinity: 'oxygen and stable pitch', family: 'Sol', origin: 'Intake lung' },
      fmDepthState: { band: 'light FM shimmer', carrier: 'primary FM synth route', fmDepth: 0.2 },
      harmonicRelationshipState: { pitchRatio: 1, relationships: [] },
      hazardAvoidanceState: { band: 'clear', risks: [] },
      nearbyState: { nearby: [] },
      networkContributionState: { band: 'strong system voice', finaleRelevant: false, score: 0.867, system: 'unassigned system' },
      noiseAmountState: { carrier: 'secondary masking layer', noiseAmount: 0.12, texture: 'light breath grain' },
      phaseMatchState: { band: 'matched', delta: 0, phase: 0, score: 1, target: 0, tolerance: 45, withinTolerance: true },
      pitchMatchState: { band: 'matched', delta: 0, pitchRatio: 1, score: 1, target: 1, tolerance: 0.25, withinTolerance: true },
      position: { x: 0, y: 1 },
      positionMatchState: { band: 'close', distance: 1, score: 0.333, tolerance: 1.5, withinTolerance: true },
      positionState: { distance: 1, offset: { dx: 0, dy: 1 }, withinTolerance: true },
      rhythmMatchState: { band: 'matched', delta: 0, pulseRate: 1, score: 1, target: 1, tolerance: 0.5, withinTolerance: true },
      spatialRadiusState: { falloff: 'close aura', heartDistance: 1, radius: 2.9, reachesHeart: true },
      substrateState: { substrate: 'breathable intake soil' },
      timbreMatchState: { band: 'matched', matched: true, requiredWaveforms: [], waveform: 'sine' },
      tuningState: {
        deltas: { brightness: 0, phase: 0, pitchRatio: 0, pulseRate: 0 },
        traits: { brightness: 0.45, phase: 0, pitchRatio: 1, pulseRate: 1, waveform: 'sine' },
      },
    })
    expect(seedScan.text).toContain('Seed scan: Sol phonoseed at 0, 1')
    expect(seedScan.text).toContain('Position: 0, 1; heart offset 0, 1; distance 1 step(s); inside position tolerance 1.5')
    expect(seedScan.text).toContain('Position match: close; score 0.333; distance 1 of 1.5 allowed step(s).')
    expect(seedScan.text).toContain('Spatial radius: 2.9 step(s); close aura; heart distance 1 step(s), reaches chamber heart.')
    expect(seedScan.text).toContain('Seed family: Sol; affinity oxygen and stable pitch; discovered origin Intake lung.')
    expect(seedScan.text).toContain('Chamber substrate: breathable intake soil; Mutation chance: 5% (low) from breathable intake soil; stable oxygen rooting.')
    expect(seedScan.text).toContain('Nearby seed interactions: none within 2 steps.')
    expect(seedScan.text).toContain('Harmonic relationship: no other planted voices to compare.')
    expect(seedScan.text).toContain('Hazard avoidance: clear; no chamber hazards to avoid.')
    expect(seedScan.text).toContain('Network contribution: strong system voice; Sol phonoseed contributes to unassigned system as Sol voice, score 0.867; no finale braid declared for this chamber.')
    expect(seedScan.text).toContain('Pitch match: matched; pitch 1 vs target 1, delta 0, score 1; tolerance 0.25.')
    expect(seedScan.text).toContain('Rhythm match: matched; pulse 1 vs target 1, delta 0, score 1; tolerance 0.5.')
    expect(seedScan.text).toContain('Timbre match: matched; waveform sine; required any chamber-compatible waveform.')
    expect(seedScan.text).toContain('Phase match: matched; phase 0 vs target 0, offset 0 degree(s), score 1; tolerance 45 degree(s).')
    expect(seedScan.text).toContain('Brightness/filter: 0.45; target 0.45 (delta 0); filter cutoff about 3120 Hz; no chamber brightness gate.')
    expect(seedScan.text).toContain('Envelope shape: attack 0.02, decay 0.12, sustain 0.5, release 0.25; quick bloom, balanced body, medium tail.')
    expect(seedScan.text).toContain('FM depth: 0.2; light FM shimmer; primary FM synth route.')
    expect(seedScan.text).toContain('AM depth: 0.4; medium AM sway; secondary amplitude layer.')
    expect(seedScan.text).toContain('Noise amount: 0.12; light breath grain; secondary masking layer.')
    expect(seedScan.text).toContain('Tuning state: pitch 1 (delta 0), pulse 1 (delta 0), brightness 0.45 (delta 0), phase 0 (delta 0), waveform sine; locked traits none.')
  })

  it('reports a reusable seed family scan state', () => {
    const family = seedFamilyScanState({
      discoveredOrigin: 'Quiet mirror',
      ecologicalAffinity: 'phase cancellation and hidden records',
      family: 'Umbra',
    })

    expect(family).toMatchObject({
      affinity: 'phase cancellation and hidden records',
      family: 'Umbra',
      origin: 'Quiet mirror',
    })
    expect(family.text).toBe('Seed family: Umbra; affinity phase cancellation and hidden records; discovered origin Quiet mirror.')
  })

  it('reports a reusable tuning state with target deltas and locks', () => {
    const tuning = seedTuningScanState(
      { brightness: 0.6, lockedTraits: ['pitchRatio'], phase: 90, pitchRatio: 1.25, pulseRate: 2, waveform: 'triangle' },
      { target: { brightness: 0.45, phase: 0, pitchRatio: 1, pulseRate: 2 } },
    )

    expect(tuning.traits).toMatchObject({ brightness: 0.6, phase: 90, pitchRatio: 1.25, pulseRate: 2, waveform: 'triangle' })
    expect(tuning.deltas).toMatchObject({ brightness: 0.15, phase: 90, pitchRatio: 0.25, pulseRate: 0 })
    expect(tuning.lockedTraits).toEqual(['pitchRatio'])
    expect(tuning.text).toContain('locked traits pitchRatio')
  })

  it('reports a reusable pitch match score', () => {
    const pitch = seedPitchMatchScanState(
      { pitchRatio: 1.12 },
      { target: { pitchRatio: 1 }, tolerances: { pitchRatio: 0.24 } },
    )

    expect(pitch).toMatchObject({
      band: 'close',
      delta: 0.12,
      pitchRatio: 1.12,
      score: 0.5,
      target: 1,
      tolerance: 0.24,
      withinTolerance: true,
    })
    expect(pitch.text).toBe('Pitch match: close; pitch 1.12 vs target 1, delta 0.12, score 0.5; tolerance 0.24.')
  })

  it('reports a reusable rhythm match score', () => {
    const rhythm = seedRhythmMatchScanState(
      { pulseRate: 1.75 },
      { target: { pulseRate: 2 }, tolerances: { pulseRate: 0.5 } },
    )

    expect(rhythm).toMatchObject({
      band: 'close',
      delta: -0.25,
      pulseRate: 1.75,
      score: 0.5,
      target: 2,
      tolerance: 0.5,
      withinTolerance: true,
    })
    expect(rhythm.text).toBe('Rhythm match: close; pulse 1.75 vs target 2, delta -0.25, score 0.5; tolerance 0.5.')
  })

  it('reports a reusable timbre match state', () => {
    const timbre = seedTimbreMatchScanState(
      { waveform: 'sine' },
      { timbrePuzzle: { waveforms: ['triangle', 'sawtooth'] } },
    )

    expect(timbre).toMatchObject({
      band: 'off target',
      matched: false,
      requiredWaveforms: ['triangle', 'sawtooth'],
      waveform: 'sine',
    })
    expect(timbre.text).toBe('Timbre match: off target; waveform sine; required triangle or sawtooth.')
  })

  it('reports a reusable circular phase match score', () => {
    const phase = seedPhaseMatchScanState(
      { phase: 350 },
      { target: { phase: 10 }, tolerances: { phase: 40 } },
    )

    expect(phase).toMatchObject({
      band: 'close',
      delta: -20,
      phase: 350,
      score: 0.5,
      target: 10,
      tolerance: 40,
      withinTolerance: true,
    })
    expect(phase.text).toBe('Phase match: close; phase 350 vs target 10, offset -20 degree(s), score 0.5; tolerance 40 degree(s).')
  })

  it('reports a reusable brightness filter state with chamber gates', () => {
    const filter = seedBrightnessFilterScanState(
      { brightness: 0.76, waveform: 'triangle' },
      {
        target: { brightness: 0.8 },
        timbrePuzzle: { minBrightness: 0.72, waveforms: ['triangle', 'sawtooth'] },
        tolerances: { brightness: 0.08 },
      },
    )

    expect(filter).toMatchObject({
      brightness: 0.76,
      cutoffHz: 4856,
      delta: -0.04,
      target: 0.8,
      withinTolerance: true,
    })
    expect(filter.gates).toEqual([
      expect.objectContaining({ active: true, kind: 'brightness/timbre' }),
    ])
    expect(filter.text).toContain('inside filter tolerance 0.08')
    expect(filter.text).toContain('brightness/timbre needs 0.72 with triangle or sawtooth timbre, open')
  })

  it('reports a reusable envelope shape scan state', () => {
    const envelope = seedEnvelopeShapeScanState({
      envelope: { attack: 0.16, decay: 0.2, sustain: 0.8, release: 0.08 },
    })

    expect(envelope).toMatchObject({
      bloom: 'slow bloom',
      body: 'full body',
      envelope: { attack: 0.16, decay: 0.2, sustain: 0.8, release: 0.08 },
      tail: 'short tail',
    })
    expect(envelope.text).toContain('Envelope shape: attack 0.16, decay 0.2, sustain 0.8, release 0.08')
    expect(envelope.text).toContain('slow bloom, full body, short tail')
  })

  it('reports a reusable FM depth scan state', () => {
    const fm = seedFmDepthScanState({ fmAmount: 0.72, oscillatorType: 'pure' })

    expect(fm).toMatchObject({
      band: 'deep FM grit',
      carrier: 'secondary modulation layer',
      fmDepth: 0.72,
    })
    expect(fm.text).toBe('FM depth: 0.72; deep FM grit; secondary modulation layer.')
  })

  it('reports a reusable AM depth scan state', () => {
    const am = seedAmDepthScanState({ amAmount: 0.72, oscillatorType: 'am' })

    expect(am).toMatchObject({
      amDepth: 0.72,
      band: 'deep AM current',
      carrier: 'primary AM synth route',
    })
    expect(am.text).toBe('AM depth: 0.72; deep AM current; primary AM synth route.')
  })

  it('reports a reusable noise amount scan state', () => {
    const noise = seedNoiseAmountScanState({ noiseAmount: 0.72, oscillatorType: 'noise-kissed' })

    expect(noise).toMatchObject({
      carrier: 'primary noise-kissed synth route',
      noiseAmount: 0.72,
      texture: 'dense noise veil',
    })
    expect(noise.text).toBe('Noise amount: 0.72; dense noise veil; primary noise-kissed synth route.')
  })

  it('reports chamber substrate and mutation pressure for planted seeds', () => {
    const substrate = seedSubstrateScanState({}, { system: 'Memory' })

    expect(substrate.substrate).toBe('archive loam')
    expect(substrate.mutationChance).toMatchObject({ band: 'high', percent: 18, pressure: 'memory-rich ancestry drift' })
    expect(substrate.text).toContain('Chamber substrate: archive loam')
    expect(substrate.text).toContain('Mutation chance: 18% (high)')
  })

  it('reports nearby seed interactions within the scan radius', () => {
    const sol = { family: 'Sol', name: 'Sol phonoseed', position: { x: 0, y: 0 } }
    const lumen = { family: 'Lumen', name: 'Lumen phonoseed', position: { x: 1, y: 1 } }
    const far = { family: 'Spire', name: 'Spire phonoseed', position: { x: 5, y: 0 } }
    const interactions = seedNearbyInteractionState(sol, [sol, lumen, far])

    expect(interactions.radius).toBe(2)
    expect(interactions.nearby).toEqual([
      expect.objectContaining({ distance: 1.414, family: 'Lumen', name: 'Lumen phonoseed' }),
    ])
    expect(interactions.text).toContain('Lumen phonoseed (Lumen) 1.414 step(s) away')
  })

  it('reports harmonic relationships between planted voices', () => {
    const sol = { family: 'Sol', name: 'Sol phonoseed', pitchRatio: 1, position: { x: 0, y: 0 } }
    const lumen = { family: 'Lumen', name: 'Lumen phonoseed', pitchRatio: 1.5, position: { x: 1, y: 1 } }
    const umbra = { family: 'Umbra', name: 'Umbra phonoseed', pitchRatio: 1.26, position: { x: 3, y: 0 } }
    const relationships = seedHarmonicRelationshipScanState(sol, [sol, lumen, umbra])

    expect(relationships.pitchRatio).toBe(1)
    expect(relationships.relationships).toEqual([
      expect.objectContaining({ distance: 1.414, family: 'Lumen', interval: 'perfect fifth', name: 'Lumen phonoseed', pitchRatio: 1.5, ratio: 1.5 }),
      expect.objectContaining({ distance: 3, family: 'Umbra', interval: 'major third', name: 'Umbra phonoseed', pitchRatio: 1.26, ratio: 1.26 }),
    ])
    expect(relationships.text).toContain('Lumen phonoseed (Lumen) perfect fifth, ratio 1.5, 1.414 step(s) away')
    expect(relationships.text).toContain('Umbra phonoseed (Umbra) major third, ratio 1.26, 3 step(s) away')
  })

  it('reports reusable hazard avoidance for planted seeds', () => {
    const avoidance = seedHazardAvoidanceScanState(
      { brightness: 0.6, name: 'Mold mask', pitchRatio: 0.72, pulseRate: 2 },
      {
        hazards: [
          { pitchRatio: 0.75, radius: 0.08, message: 'Mold rejects the sour band.' },
          { pulseRate: 2.2, radius: 0.12, message: 'Pulse eddy buckles.' },
          { brightness: 0.1, radius: 0.05, message: 'Dim pockets stall.' },
        ],
      },
    )

    expect(avoidance.band).toBe('unsafe')
    expect(avoidance.risks).toEqual([
      expect.objectContaining({ band: 'unsafe', breached: true, clearance: -0.05, delta: -0.03 }),
      expect.objectContaining({ band: 'safe', breached: false, clearance: 0.08, delta: -0.2 }),
      expect.objectContaining({ band: 'safe', breached: false, clearance: 0.45, delta: 0.5 }),
    ])
    expect(avoidance.text).toContain('pitch 0.72 vs forbidden 0.75 radius 0.08, unsafe, clearance -0.05')
    expect(avoidance.text).toContain('pulse 2 vs forbidden 2.2 radius 0.12, safe, clearance 0.08')
  })

  it('reports reusable network contribution for planted seed voices', () => {
    const contribution = seedNetworkContributionScanState(
      { family: 'Archive', name: 'Archive phonoseed', phase: 90, pitchRatio: 1.5, position: { x: 0, y: 0 }, pulseRate: 2, waveform: 'triangle' },
      {
        finaleNetwork: { contribution: 'braiding restored voices into the Verdancy Heart chord', systems: ['Intake', 'Memory', 'Heart'] },
        requiredWaveforms: ['triangle'],
        system: 'Memory',
        target: { x: 0, y: 0, phase: 90, pitchRatio: 1.5, pulseRate: 2 },
        tolerances: { phase: 30, pitchRatio: 0.2, position: 1, pulseRate: 0.25 },
      },
    )

    expect(contribution).toMatchObject({
      band: 'strong system voice',
      contribution: 'braiding restored voices into the Verdancy Heart chord',
      family: 'Archive',
      finaleRelevant: true,
      finaleSystems: ['Intake', 'Memory', 'Heart'],
      score: 1,
      system: 'Memory',
    })
    expect(contribution.text).toBe('Network contribution: strong system voice; Archive phonoseed contributes to Memory as Archive voice, score 1; feeds finale systems Intake, Memory, Heart.')
  })

  it('reports a reusable seed position state relative to the chamber heart', () => {
    const position = seedPositionState(
      { position: { x: 3, y: -1 } },
      { target: { x: 1, y: 1 }, tolerances: { position: 2 } },
    )

    expect(position.position).toEqual({ x: 3, y: -1 })
    expect(position.offset).toEqual({ dx: 2, dy: -2 })
    expect(position.distance).toBeCloseTo(2.828)
    expect(position.withinTolerance).toBe(false)
    expect(position.text).toContain('outside position tolerance 2')
  })

  it('reports a reusable position match score', () => {
    const match = seedPositionMatchScanState(
      { position: { x: 1.5, y: 0 } },
      { target: { x: 0, y: 0 }, tolerances: { position: 2 } },
    )

    expect(match).toMatchObject({
      band: 'close',
      distance: 1.5,
      score: 0.25,
      tolerance: 2,
      withinTolerance: true,
    })
    expect(match.text).toBe('Position match: close; score 0.25; distance 1.5 of 2 allowed step(s).')
  })

  it('reports a reusable spatial radius state for planted seeds', () => {
    const radius = seedSpatialRadiusScanState(
      { brightness: 0.6, growthBehavior: 'twining', position: { x: 4, y: 0 } },
      { target: { x: 0, y: 0 } },
    )

    expect(radius).toMatchObject({
      falloff: 'wide field',
      heartDistance: 4,
      radius: 4.2,
      reachesHeart: true,
    })
    expect(radius.text).toBe('Spatial radius: 4.2 step(s); wide field; heart distance 4 step(s), reaches chamber heart.')
  })

  it('summarizes hazard forbidden intervals and unsafe seed zones', () => {
    const hazardScan = hazardScanState(
      {
        hazards: [
          { pitchRatio: 0.75, radius: 0.2, message: 'Mold rejects the low fourth interval.' },
          { pulseRate: 3, radius: 0.25, message: 'Hail surge rejects frantic pulses.' },
        ],
      },
      [
        { name: 'Umbra phonoseed', pitchRatio: 0.8, pulseRate: 0.75, position: { x: -1, y: 2 } },
        { name: 'Spire phonoseed', pitchRatio: 2, pulseRate: 3, position: { x: 2, y: 0 } },
      ],
    )

    expect(hazardScan.count).toBe(2)
    expect(hazardScan.hazards[0]).toMatchObject({ lower: 0.55, upper: 0.95 })
    expect(hazardScan.hazards[1].axis).toMatchObject({ key: 'pulseRate', label: 'pulse' })
    expect(hazardScan.unsafeZones).toContain('Umbra phonoseed at -1, 2 inside pitch 0.55-0.95')
    expect(hazardScan.unsafeZones).toContain('Spire phonoseed at 2, 0 inside pulse 2.75-3.25')
    expect(hazardScan.text).toContain('Hazard scan: forbidden intervals pitch 0.55-0.95')
    expect(hazardScan.text).toContain('Unsafe zones: Umbra phonoseed at -1, 2 inside pitch 0.55-0.95')
  })

  it('reports a clear hazard scan when no chamber hazards exist', () => {
    const hazardScan = hazardScanState({}, [])

    expect(hazardScan.count).toBe(0)
    expect(hazardScan.unsafeZones).toEqual([])
    expect(hazardScan.text).toBe('Hazard scan: no forbidden intervals or unsafe zones detected in this chamber.')
  })

  it('summarizes recovered records and locked hidden memory echoes', () => {
    const memoryScan = memoryScanState(
      { rewards: { codex: ['first-breath', 'perception-02'] } },
      { codexIds: ['first-breath'], restoredSystems: [], solvedChambers: [] },
      {
        'first-breath': { title: 'First Breath' },
        'perception-02': { title: 'Perception 02' },
      },
    )

    expect(memoryScan.recoveredCount).toBe(1)
    expect(memoryScan.memoryOnline).toBe(false)
    expect(memoryScan.chamberRecords).toContainEqual(expect.objectContaining({ id: 'perception-02', recovered: false }))
    expect(memoryScan.hiddenEchoes).toEqual([])
    expect(memoryScan.text).toContain('Memory scan: records First Breath')
    expect(memoryScan.text).toContain('Perception 02 hidden')
    expect(memoryScan.text).toContain('Hidden echoes: locked until Quiet Mirror or Memory Orchard comes online')
  })

  it('reveals pending chamber records as hidden echoes when Memory is online', () => {
    const memoryScan = memoryScanState(
      { rewards: { codex: ['perception-04'] } },
      { codexIds: [], restoredSystems: ['Memory'], solvedChambers: [] },
      { 'perception-04': { title: 'Perception 04' } },
    )

    expect(memoryScan.memoryOnline).toBe(true)
    expect(memoryScan.hiddenEchoes).toContainEqual(expect.objectContaining({ id: 'perception-04', title: 'Perception 04' }))
    expect(memoryScan.text).toContain('Hidden echoes: Perception 04 audible before restoration')
  })

  it('repeats misleading memory loops until the chamber is resolved', () => {
    const chamber = chambers.find((item) => item.id === 'memory-pond')
    const unresolved = memoryScanState(chamber, { codexIds: [], restoredSystems: ['Memory'], solvedChambers: [] })
    const resolved = memoryScanState(chamber, { codexIds: [], restoredSystems: ['Memory'], solvedChambers: ['memory-pond'] })

    expect(memoryLoopState(chamber, { solvedChambers: [] })).toMatchObject({ resolved: false })
    expect(unresolved.memoryLoop).toMatchObject({ oldState: chamber.memoryLoops.oldState, resolved: false })
    expect(unresolved.text).toContain('Memory loop unresolved')
    expect(unresolved.text).toContain('repeats misleading old state')
    expect(resolved.memoryLoop).toMatchObject({ resolved: true })
    expect(resolved.text).toContain('Memory loop resolved')
  })

  it('summarizes endgame multi-chamber network resonance state', () => {
    const networkScan = networkScanState(
      {
        nodes: [
          { online: true, strength: 3, system: 'Intake' },
          { online: true, strength: 2, system: 'Memory' },
          { online: false, strength: 0, system: 'Heart' },
        ],
        onlineNodes: [
          { online: true, strength: 3, system: 'Intake' },
          { online: true, strength: 2, system: 'Memory' },
        ],
        readyForFinale: false,
        totalStrength: 5,
      },
      { endingsUnlocked: false, heartOnline: false },
      { systems: ['Intake', 'Memory'] },
    )

    expect(networkScan.readyForFinale).toBe(false)
    expect(networkScan.onlineNodes).toHaveLength(2)
    expect(networkScan.offlineNodes).toContainEqual(expect.objectContaining({ system: 'Heart' }))
    expect(networkScan.strongest).toMatchObject({ system: 'Intake', strength: 3 })
    expect(networkScan.text).toContain('Network scan: endgame multi-chamber resonance building')
    expect(networkScan.text).toContain('Heart locked; endings not ready')
    expect(networkScan.text).toContain('Final chord systems: Intake, Memory')
  })

  it('reports network scan readiness when the final network is online', () => {
    const networkScan = networkScanState(
      { nodes: [], onlineNodes: [], readyForFinale: true, totalStrength: 18 },
      { endingsUnlocked: true, heartOnline: true },
      { systems: [] },
    )

    expect(networkScan.readyForFinale).toBe(true)
    expect(networkScan.heartOnline).toBe(true)
    expect(networkScan.text).toContain('resonance ready')
    expect(networkScan.text).toContain('Heart online; endings available')
  })

  it('expands scan range after Intake comes online', () => {
    const base = scanRangeState({ restoredSystems: [] })
    const intake = scanRangeState({ restoredSystems: ['Intake'] })
    const farPulse = scanPulse({ x: 0, y: 0 }, { x: 10, y: 0 }, { scanRange: intake.range })

    expect(base.range).toBe(8)
    expect(intake.range).toBe(12)
    expect(intake.text).toContain('Intake scan range unlocked')
    expect(farPulse.inRange).toBe(true)
    expect(farPulse.text).toContain('range 12')
  })

  it('unlocks objective scan compass cues after Navigation comes online', () => {
    const base = navigationScanState({ restoredSystems: [] })
    const navigation = navigationScanState({ restoredSystems: ['Navigation'] })
    const cue = chamberCompassCue({ x: 3, y: 0 }, { x: -2, y: 0 })

    expect(base.navigationOnline).toBe(false)
    expect(base.text).toContain('Navigation offline')
    expect(navigation.navigationOnline).toBe(true)
    expect(navigation.text).toContain('objective scans include chamber compass cues')
    expect(cue.bearing).toBe('west')
    expect(cue.text).toContain('offset -5, 0')
  })

  it('adds wind-carried echo text when a chamber declares a draft', () => {
    const pulse = scanPulse(
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { windEcho: { dx: 1, dy: 0, name: 'east draft', text: 'echo leans into the weather corridor' } },
    )

    expect(pulse.windEcho.direction.horizontal).toBe('east')
    expect(pulse.windEcho.carriedDelay).toBeGreaterThan(pulse.delayTrail[1])
    expect(pulse.text).toContain('Wind-carried echo')
  })

  it('describes standalone wind-carried echo direction and delay', () => {
    const echo = windCarriedEcho({ dx: -1, dy: 1, name: 'crossdraft', text: 'scan bends around glass' }, 4)

    expect(echo.direction).toMatchObject({ horizontal: 'west', vertical: 'north' })
    expect(echo.text).toContain('crossdraft')
  })
})

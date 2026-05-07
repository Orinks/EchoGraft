import { describe, expect, it } from 'vitest'
import { boundaryScanState, chamberCompassCue, hazardScanState, heartScanState, memoryScanState, navigationScanState, networkScanState, scanPulse, scanRangeState, seedAmDepthScanState, seedBrightnessFilterScanState, seedEnvelopeShapeScanState, seedFamilyScanState, seedFmDepthScanState, seedNearbyInteractionState, seedNoiseAmountScanState, seedPositionState, seedScanState, seedSubstrateScanState, seedTuningScanState, windCarriedEcho } from '../src/content/scan.js'

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
      nearbyState: { nearby: [] },
      noiseAmountState: { carrier: 'secondary masking layer', noiseAmount: 0.12, texture: 'light breath grain' },
      position: { x: 0, y: 1 },
      positionState: { distance: 1, offset: { dx: 0, dy: 1 }, withinTolerance: true },
      substrateState: { substrate: 'breathable intake soil' },
      tuningState: {
        deltas: { brightness: 0, phase: 0, pitchRatio: 0, pulseRate: 0 },
        traits: { brightness: 0.45, phase: 0, pitchRatio: 1, pulseRate: 1, waveform: 'sine' },
      },
    })
    expect(seedScan.text).toContain('Seed scan: Sol phonoseed at 0, 1')
    expect(seedScan.text).toContain('Position: 0, 1; heart offset 0, 1; distance 1 step(s); inside position tolerance 1.5')
    expect(seedScan.text).toContain('Seed family: Sol; affinity oxygen and stable pitch; discovered origin Intake lung.')
    expect(seedScan.text).toContain('Chamber substrate: breathable intake soil; Mutation chance: 5% (low) from breathable intake soil; stable oxygen rooting.')
    expect(seedScan.text).toContain('Nearby seed interactions: none within 2 steps.')
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

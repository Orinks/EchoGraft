import { describe, expect, it } from 'vitest'
import { chambers } from '../src/content/chambers.js'
import { createPlayer, movePlayer } from '../src/content/player.js'
import { AmbientBed, AudioEngine, BoundaryVoice, HazardVoice, HeartVoice, MemoryVoice, ScanPulse, SeedVoice, StepVoice, SystemDrone, chamberEffectChain, generatedNoiseBedRole, memoryRecordVoiceProfile, seedShapeTimbreProfile, seedSynthFactoryName, spatialVoiceRoleForCategory } from '../src/engine/audio.js'

function movementVoices(player, previous, chamber) {
  const audio = new AudioEngine()
  const voices = []

  audio.updateListener = () => {}
  audio.voice = (payload) => voices.push(payload)
  audio.movement(player, previous, chamber)

  return voices
}

describe('audio movement cues', () => {
  it('maps memory record families to Ark voice formants', () => {
    expect(memoryRecordVoiceProfile({ id: 'crew-message-01', title: 'Crew Message 01' }).formantPair).toEqual(['createO', 'createA'])
    expect(memoryRecordVoiceProfile({ id: 'plant-memory-01', title: 'Plant Memory 01' }).formantPair).toEqual(['createU', 'createO'])
    expect(memoryRecordVoiceProfile({ id: 'gardener-note-01', title: 'Gardener Note 01' }).formantPair).toEqual(['createE', 'createA'])
    expect(memoryRecordVoiceProfile({ id: 'seed-ancestry-01', title: 'Seed Ancestry 01' }).formantPair).toEqual(['createI', 'createE'])
    expect(memoryRecordVoiceProfile({ id: 'system-diagnostic-01', title: 'System Diagnostic 01' }).formantPair).toEqual(['createO', 'createU'])
  })

  it('selects Syngen effect chains for chamber identity and mechanics', () => {
    expect(chamberEffectChain({ system: 'Water', mechanic: 'water current navigation' })).toEqual(['feedbackDelay'])
    expect(chamberEffectChain({ system: 'Canopy', mechanic: 'high-brightness prism focus' })).toEqual(['phaser'])
    expect(chamberEffectChain({ system: 'Memory', mechanic: 'phase echo mapping' })).toEqual(['multitapDelay', 'phaser', 'talkbox'])
    expect(chamberEffectChain({ system: 'Heart', mechanic: 'multi-chamber network finale' })).toEqual(['pingPongDelay'])
    expect(chamberEffectChain({ hazards: [{ message: 'mold' }] })).toEqual(['feedbackDelay'])
  })

  it('maps seed DNA synth types to Syngen synth factories', () => {
    expect(seedSynthFactoryName({ oscillatorType: 'fm' })).toBe('fm')
    expect(seedSynthFactoryName({ oscillatorType: 'am' })).toBe('am')
    expect(seedSynthFactoryName({ oscillatorType: 'noise-kissed' })).toBe('amBuffer')
    expect(seedSynthFactoryName({ oscillatorType: 'pure' })).toBe('additive')
    expect(seedSynthFactoryName({}, { mode: 'fm' })).toBe('fm')
  })

  it('maps seed traits to Syngen shape timbre curves', () => {
    const brightPulse = seedShapeTimbreProfile({ brightness: 0.82, noiseAmount: 0.04, pulseRate: 2.6 })
    const mutation = seedShapeTimbreProfile({ brightness: 0.18, noiseAmount: 0.5, pulseRate: 0.8 }, { mode: 'fm' })

    expect(brightPulse).toMatchObject({
      brightnessCurve: 'equalFadeIn',
      distortionCurve: 'warm',
      mutationCurve: 'dither',
      pulseCurve: 'triplePulse',
    })
    expect(mutation).toMatchObject({
      brightnessCurve: 'equalFadeOut',
      distortionCurve: 'distort',
      mutationCurve: 'crush8',
      pulseCurve: 'pulse',
    })
    expect(mutation.distortionDrive).toBeGreaterThan(brightPulse.distortionDrive)
    expect(mutation.text).toContain('distortion distort, pulse pulse, brightness equalFadeOut, mutation crush8')
  })

  it('chooses generated Syngen buffer noise beds without external files', () => {
    expect(generatedNoiseBedRole({ noiseAmount: 0.03 })).toMatchObject({
      family: 'whiteNoise',
      text: 'Generated noise bed: whiteNoise for synthesized seed noise; no external audio file.',
    })
    expect(generatedNoiseBedRole({ noiseAmount: 0.2 })).toMatchObject({ family: 'pinkNoise' })
    expect(generatedNoiseBedRole({ noiseAmount: 0.55 })).toMatchObject({ family: 'brownNoise' })
    expect(generatedNoiseBedRole({}, { noiseBed: 'brown' })).toMatchObject({ family: 'brownNoise' })
  })

  it('classifies spatial Syngen sound roles for gameplay voices', () => {
    expect(spatialVoiceRoleForCategory('seed')).toBe('seed')
    expect(spatialVoiceRoleForCategory('scan')).toBe('scan')
    expect(spatialVoiceRoleForCategory('hazard')).toBe('hazard')
    expect(spatialVoiceRoleForCategory('ambience')).toBe('landmark')
    expect(spatialVoiceRoleForCategory('music')).toBe('chamber')
  })

  it('schedules persistent planted seed voices from the frame loop', () => {
    const audio = new AudioEngine()
    const played = []

    audio.enabled = true
    audio.audioTime = () => 10
    audio.seed = (seed) => played.push(seed)
    audio.syncSeedObjects('tutorial', [
      { brightness: 0.5, id: 'sol', pitchRatio: 1, position: { x: 0, y: 0 }, pulseRate: 2, waveform: 'sine' },
    ])

    expect(played).toHaveLength(1)
    expect(played[0]).toMatchObject({ id: 'sol', persistent: true })
    expect([...audio.seedLoops.values()][0]).toMatchObject({ interval: 1.1, nextBeat: 11.1 })

    audio.audioTime = () => 11.2
    audio.tickSeedObjects()

    expect(played).toHaveLength(2)
    expect(played[1]).toMatchObject({ id: 'sol', persistent: true })
    expect([...audio.seedLoops.values()][0].nextBeat).toBeCloseTo(12.3)
  })

  it('models a planted seed as a named persistent SeedVoice', () => {
    const audio = new AudioEngine()
    const played = []
    const seed = {
      brightness: 0.45,
      id: 'lumen',
      name: 'Lumen',
      pitchRatio: 1.25,
      position: { x: 2, y: -1 },
      pulseRate: 1.1,
      waveform: 'triangle',
    }
    const voice = new SeedVoice({ chamberId: 'binaural', index: 2, seed, startedAt: 20 })

    audio.seed = (payload) => played.push(payload)

    expect(voice.key).toBe('binaural:lumen:2:-1:2')
    expect(voice.interval).toBe(2)
    expect(voice.nextBeat).toBe(22)
    expect(voice.text).toContain('SeedVoice: Lumen persists at 2, -1')

    expect(voice.tick(audio, 21.9)).toBe(false)
    expect(played).toHaveLength(0)
    expect(voice.tick(audio, 22)).toBe(true)
    expect(played[0]).toMatchObject({ id: 'lumen', persistent: true, role: 'planted-seed-voice', seedVoice: true })
    expect(voice.nextBeat).toBe(24)
  })

  it('models chamber target and restored cadence as a named HeartVoice', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const targetVoice = new HeartVoice({ chamber, player: createPlayer(chamber.start) })
    const restoredVoice = new HeartVoice({ chamber, result: { score: 1, solved: true } })

    expect(targetVoice.text).toContain('HeartVoice: chamber target sound')
    expect(targetVoice.toVoicePayload()).toMatchObject({
      category: 'scan',
      position: chamber.target,
      seed: { heartVoice: true, restored: false, role: 'target-heart' },
      tone: { type: 'sine' },
    })

    expect(restoredVoice.text).toContain('restored-state sound')
    expect(restoredVoice.toVoicePayload()).toMatchObject({
      category: 'ui',
      position: chamber.target,
      seed: { heartVoice: true, restored: true, role: 'restored-heart' },
      tone: { mode: 'additive', type: 'triangle' },
    })
  })

  it('models scan audio as a short spatial ScanPulse with delay trail', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const pulse = new ScanPulse({ player: createPlayer(chamber.start), target: chamber.target })
    const [ping, trail] = pulse.toVoicePayloads()

    expect(pulse.text).toContain('ScanPulse: short spatial ping')
    expect(ping).toMatchObject({
      category: 'scan',
      position: chamber.target,
      tone: { effectChain: ['feedbackDelay'] },
    })
    expect(ping.duration).toBeLessThanOrEqual(0.24)
    expect(trail).toMatchObject({
      category: 'scan',
      position: chamber.target,
      seed: { scanPulseTrail: true },
      tone: { effectChain: ['feedbackDelay', 'multitapDelay'], type: 'triangle' },
    })
    expect(trail.duration).toBeGreaterThan(0.07)
  })

  it('models forbidden intervals and unstable ecology as a named HazardVoice', () => {
    const chamber = chambers.find((item) => item.hazards?.length)
    const hazardVoice = new HazardVoice({ chamber, seed: { id: 'unsafe' } })
    const payload = hazardVoice.toVoicePayload()

    expect(hazardVoice.text).toContain('HazardVoice:')
    expect(payload).toMatchObject({
      category: 'hazard',
      position: chamber.target,
      seed: { hazardVoice: true, id: 'unsafe', oscillatorType: 'fm', role: 'hazard-pitchRatio-voice' },
      tone: { effectChain: ['feedbackDelay'], mode: 'fm', type: 'sawtooth' },
    })
    expect(payload.duration).toBeGreaterThan(0.1)
  })

  it('models chamber edges, doorways, and return locators as BoundaryVoice payloads', () => {
    const edge = new BoundaryVoice({ kind: 'edge', position: { x: -5, y: 1 }, proximity: 1.4 })
    const doorway = new BoundaryVoice({ kind: 'doorway', position: { x: 0, y: -1 }, proximity: 2 })
    const returns = new BoundaryVoice({ kind: 'return', position: { x: 0, y: 0 }, proximity: 0 })

    expect(edge.text).toContain('BoundaryVoice: edge locator')
    expect(edge.toVoicePayload()).toMatchObject({
      category: 'ambience',
      seed: { boundaryVoice: true, kind: 'edge' },
      tone: { brightness: 0.18, mode: 'am' },
    })
    expect(doorway.toVoicePayload()).toMatchObject({
      category: 'ambience',
      seed: { boundaryVoice: true, kind: 'doorway' },
      tone: { brightness: 0.42, mode: 'additive' },
    })
    expect(returns.toVoicePayload()).toMatchObject({
      category: 'scan',
      seed: { boundaryVoice: true, kind: 'return' },
      tone: { effectChain: ['feedbackDelay'], type: 'triangle' },
    })
  })

  it('models codex perception reveals as a named MemoryVoice', () => {
    const voice = new MemoryVoice({
      position: { x: 1, y: 2 },
      record: { id: 'seed-ancestry-01', title: 'Seed Ancestry 01' },
    })
    const payload = voice.toVoicePayload()

    expect(voice.text).toContain('MemoryVoice: Seed Ancestry 01 reveal')
    expect(payload).toMatchObject({
      category: 'ambience',
      position: { x: 1, y: 2 },
      seed: { memoryVoice: true, oscillatorType: 'am' },
      tone: {
        effectChain: ['talkbox', 'multitapDelay'],
        formantPair: ['createI', 'createE'],
        mode: 'am',
        type: 'triangle',
      },
    })
  })

  it('models restored systems as a named SystemDrone layer', () => {
    const chamber = chambers.find((item) => item.system === 'Water')
    const drone = new SystemDrone({ chamber, restored: true })
    const payload = drone.toVoicePayload()

    expect(drone.text).toContain('SystemDrone: Water restored layer')
    expect(payload).toMatchObject({
      category: 'music',
      position: chamber.target,
      seed: { role: 'restored-system-drone', systemDrone: true, system: 'Water' },
      tone: { effectChain: ['feedbackDelay'], mode: 'additive' },
    })
    expect(payload.duration).toBeGreaterThan(1)
  })

  it('models player movement feedback as a named StepVoice', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const previous = createPlayer(chamber.start)
    const player = movePlayer(previous, 0, 1, chamber)
    const step = new StepVoice({ chamber, player, previous })
    const payload = step.toVoicePayload()

    expect(step.text).toContain('StepVoice:')
    expect(payload).toMatchObject({
      category: 'ui',
      seed: { stepVoice: true },
      spatial: true,
      tone: { mode: 'additive' },
    })
    expect(payload.position.y).toBeGreaterThan(player.y)
  })

  it('models chamber ambience as a named AmbientBed layer', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const bed = new AmbientBed({
      chamber,
      index: 1,
      seed: { ...chamber.target, position: chamber.target, waveform: 'sine' },
    })
    const payload = bed.toVoicePayload()

    expect(bed.text).toContain('Ambient bed:')
    expect(payload).toMatchObject({
      category: 'ambience',
      position: chamber.target,
      seed: { ambientBed: true },
      tone: { mode: 'am', type: 'sine' },
    })
    expect(payload.duration).toBeGreaterThan(0.1)
  })

  it('spatializes every footstep at the current player position', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const previous = createPlayer(chamber.start)
    const player = movePlayer(previous, 0, 1, chamber)
    const voices = movementVoices(player, previous, chamber)

    expect(voices[0]).toMatchObject({
      category: 'ui',
      spatial: true,
    })
    expect(voices[0].position).toMatchObject({ x: player.x })
    expect(voices[0].position.y).toBeGreaterThan(player.y)
  })

  it('still spatializes the footstep cue when a boundary holds the step', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const previous = createPlayer({ x: chamber.start.x, y: chamber.start.y + 5, facing: 0 })
    const player = movePlayer(previous, 0, 1, chamber)
    const voices = movementVoices(player, previous, chamber)

    expect(player).toMatchObject(previous)
    expect(voices[0]).toMatchObject({
      category: 'ui',
      position: { x: player.x, y: player.y },
      spatial: true,
    })
  })

  it('changes footstep timbre by movement surface type', () => {
    const waterChamber = chambers.find((item) => item.system === 'Water')
    const canopyChamber = chambers.find((item) => item.system === 'Canopy')
    const memoryChamber = chambers.find((item) => item.system === 'Memory')
    const waterPlayer = movePlayer(createPlayer(waterChamber.start), 0, 1, waterChamber)
    const canopyPlayer = movePlayer(createPlayer(canopyChamber.start), 0, 1, canopyChamber)
    const memoryPlayer = movePlayer(createPlayer(memoryChamber.start), 0, 1, memoryChamber)
    const waterTone = movementVoices(waterPlayer, createPlayer(waterChamber.start), waterChamber)[0].tone
    const canopyTone = movementVoices(canopyPlayer, createPlayer(canopyChamber.start), canopyChamber)[0].tone
    const memoryTone = movementVoices(memoryPlayer, createPlayer(memoryChamber.start), memoryChamber)[0].tone

    expect(waterTone).toMatchObject({ mode: 'am', type: 'sine' })
    expect(canopyTone).toMatchObject({ brightness: 0.72, mode: 'additive' })
    expect(memoryTone).toMatchObject({ brightness: 0.28, mode: 'am' })
    expect(new Set([waterTone.type, canopyTone.type, memoryTone.type]).size).toBeGreaterThan(1)
  })

  it('moves footstep placement toward the movement direction', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const previous = createPlayer(chamber.start)
    const northPlayer = movePlayer(previous, 0, 1, chamber)
    const eastPlayer = movePlayer(previous, 1, 0, chamber)
    const northPosition = movementVoices(northPlayer, previous, chamber)[0].position
    const eastPosition = movementVoices(eastPlayer, previous, chamber)[0].position

    expect(northPosition.x).toBe(northPlayer.x)
    expect(northPosition.y).toBeGreaterThan(northPlayer.y)
    expect(eastPosition.x).toBeGreaterThan(eastPlayer.x)
    expect(eastPosition.y).toBe(eastPlayer.y)
  })

  it('adds subtle nearby presence tones for walls and exits', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const nearExitPrevious = createPlayer(chamber.start)
    const nearExitPlayer = movePlayer(nearExitPrevious, 0, 1, chamber)
    const wallPrevious = createPlayer({ x: chamber.start.x, y: chamber.start.y + 5, facing: 0 })
    const wallPlayer = movePlayer(wallPrevious, 0, 1, chamber)
    const exitPresence = movementVoices(nearExitPlayer, nearExitPrevious, chamber).find((voice) => (
      voice.category === 'ambience'
      && voice.position?.x === chamber.start.x
      && voice.position?.y === chamber.start.y
    ))
    const wallPresence = movementVoices(wallPlayer, wallPrevious, chamber).find((voice) => (
      voice.category === 'ambience'
      && voice.position?.x === chamber.start.x
      && voice.position?.y === chamber.start.y + 5
    ))

    expect(exitPresence?.tone).toMatchObject({ brightness: 0.42, mode: 'additive' })
    expect(wallPresence?.tone).toMatchObject({ brightness: 0.18, mode: 'am' })
  })
})

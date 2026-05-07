import { describe, expect, it } from 'vitest'
import { campaignScope, chamberCycleState, chambers, codexRecords, codexRecordTrees, majorArkSystems, solveTimeText, weatherWindowState } from '../src/content/chambers.js'
import { chooseEndgameResolution, crewWakeCycleStages, crewWakeCycleSummary, endgameResolutions, restorationPhilosophies } from '../src/content/endings.js'
import { availableChambers, centralHeartSummary, codexRecoverySummary, decisionSummary, dreamCompostSummary, evaluateResonance, firstFullCampaignEstimate, mergeRewards, optionalReturnContracts, photosynthesisState, pollinatorVaultSummary, pressureSailState, restorationPlanningSession, restorationRating, seedCollectionAppraisal, stewardshipSummary, thermalShutterState, timbrePuzzleState, unlockNext } from '../src/content/resonance.js'
import { createDefaultSave } from '../src/content/save.js'
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

  it('uses explicit contract requirements for optional atlas branches', () => {
    expect(availableChambers(chambers, ['tutorial', 'direction', 'binaural', 'pitch']).map((item) => item.id)).toContain('harmony')
    expect(availableChambers(chambers, ['tutorial', 'direction', 'binaural', 'pitch']).map((item) => item.id)).not.toContain('graft')
  })

  it('records rating and rewards when a contract is restored', () => {
    const chamber = chambers[0]
    const result = evaluateResonance(chamber, [
      createSeedDNA('sol', { pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0, position: { x: 0, y: 0 } }),
    ])
    const next = mergeRewards(createDefaultSave(), chamber, restorationRating(result))
    expect(next.ratings[chamber.id]).toBe('Resonant')
    expect(next.codexIds).toContain('first-breath')
    expect(next.materials.biomass).toBe(1)
    expect(next.materials.spores).toBe(1)
  })

  it('collects spores as crafting resources from authored contracts', () => {
    const save = createDefaultSave()
    const fungusRelays = chambers.find((chamber) => chamber.id === 'mycelium-gate')
    const next = mergeRewards(save, fungusRelays, 'Stable')

    expect(fungusRelays.rewards.materials.spores).toBeGreaterThan(0)
    expect(next.materials.spores).toBe(3)
  })

  it('turns Dream Compost into a specific research material', () => {
    const save = createDefaultSave()
    const dreamCompost = chambers.find((chamber) => chamber.id === 'dream-compost')
    const next = mergeRewards(save, dreamCompost, 'Stable')

    expect(dreamCompost.rewards.materials.dreamCompost).toBe(1)
    expect(next.materials.dreamCompost).toBe(1)
    expect(dreamCompostSummary(next).text).toContain('safer graft experiments')
  })

  it('authors Pollinator Vault as a glass pollen reward contract', () => {
    const save = createDefaultSave()
    const vault = chambers.find((chamber) => chamber.id === 'orchard-gate')
    const next = mergeRewards(save, vault, 'Stable')

    expect(vault.title).toBe('Contract 23: Pollinator Vault')
    expect(vault.mechanic).toBe('pollinator vault alignment')
    expect(next.materials.glassPollen).toBe(1)
    expect(pollinatorVaultSummary(next).text).toContain('brightness and timbre')
  })

  it('tracks ready codex and perception recovery opportunities', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['wind-bellows']
    const summary = codexRecoverySummary(chambers, save)

    expect(summary.availableRecords).toContainEqual(expect.objectContaining({ id: 'perception-02', chamberId: 'memory-pond' }))
    expect(summary.text).toContain('next available perception')
  })

  it('gathers seed rewards once into the inventory', () => {
    const save = createDefaultSave()
    save.inventoryIds = ['sol', 'lumen', 'umbra']
    const next = mergeRewards(save, chambers.find((chamber) => chamber.id === 'mold'), 'Stable')
    const duplicate = mergeRewards(next, chambers.find((chamber) => chamber.id === 'mold'), 'Stable')
    expect(next.inventoryIds).toContain('spire')
    expect(duplicate.inventoryIds.filter((id) => id === 'spire')).toHaveLength(1)
  })

  it('has a solvable ideal target for every chamber', () => {
    for (const chamber of chambers) {
      const planted = Array.from({ length: chamber.requiredSeeds }, (_, index) => createSeedDNA(`${chamber.id}-ideal-${index + 1}`, {
        pitchRatio: chamber.target.pitchRatio,
        pulseRate: chamber.target.pulseRate,
        brightness: chamber.target.brightness,
        ...(chamber.timbrePuzzle ? { waveform: chamber.timbrePuzzle.waveforms[0] } : {}),
        phase: chamber.target.phase,
        position: chamber.plantingPattern
          ? { x: chamber.target.x + chamber.plantingPattern.offsets[index % chamber.plantingPattern.offsets.length].x, y: chamber.target.y + chamber.plantingPattern.offsets[index % chamber.plantingPattern.offsets.length].y }
          : chamber.target,
        grafted: chamber.requiresGraft,
      }))
      expect(evaluateResonance(chamber, planted).solved, chamber.id).toBe(true)
    }
  })

  it('requires authored multi-position planting slots when a chamber defines them', () => {
    const chamber = chambers.find((item) => item.id === 'harmony')
    const nearOneSlot = [
      createSeedDNA('sol', { pitchRatio: 1.25, pulseRate: 1.5, brightness: 0.58, phase: 45, position: { x: -1, y: 0 } }),
      createSeedDNA('lumen', { pitchRatio: 1.25, pulseRate: 1.5, brightness: 0.58, phase: 45, position: { x: -4, y: 0 } }),
    ]
    const result = evaluateResonance(chamber, nearOneSlot)

    expect(result.plantingCoverage.complete).toBe(false)
    expect(result.missing).toContain('Cover 1 more multi-position planting slot(s).')
  })

  it('keeps every chamber paced as a 5 to 10 minute solve', () => {
    for (const chamber of chambers) {
      expect(chamber.solveTimeMinutes?.min, chamber.id).toBeGreaterThanOrEqual(5)
      expect(chamber.solveTimeMinutes?.max, chamber.id).toBeLessThanOrEqual(10)
      expect(chamber.solveTimeMinutes.min, chamber.id).toBeLessThanOrEqual(chamber.solveTimeMinutes.max)
      expect(solveTimeText(chamber), chamber.id).toContain('minute solve')
    }
  })

  it('builds a 20 to 40 minute restoration planning session from upcoming contracts', () => {
    const plan = restorationPlanningSession(chambers, [])
    expect(plan.contracts.map((chamber) => chamber.id)).toEqual(['tutorial', 'direction', 'binaural', 'pitch'])
    expect(plan.min).toBeGreaterThanOrEqual(20)
    expect(plan.max).toBeLessThanOrEqual(40)
    expect(plan.contracts[0].ready).toBe(true)
    expect(plan.contracts[1].ready).toBe(false)
  })

  it('tracks the first full campaign as a 6 to 10 hour production scope', () => {
    const campaign = firstFullCampaignEstimate(campaignScope)
    expect(campaign.min).toBe(6)
    expect(campaign.max).toBe(10)
    expect(campaign.seasons).toBe(5)
    expect(campaign.requiredContracts).toBeGreaterThanOrEqual(40)
    expect(campaign.totalContracts).toBeGreaterThanOrEqual(50)
  })

  it('keeps each campaign season in the 7 to 10 required contract band', () => {
    for (const season of campaignScope.seasons) {
      expect(season.requiredContracts, season.name).toBeGreaterThanOrEqual(7)
      expect(season.requiredContracts, season.name).toBeLessThanOrEqual(10)
    }
  })

  it('keeps the authored chamber contract set in the 40 to 50 band', () => {
    expect(chambers.length).toBeGreaterThanOrEqual(40)
    expect(chambers.length).toBeLessThanOrEqual(50)
  })

  it('keeps optional challenge contracts in the 15 to 25 band', () => {
    const optionalContracts = chambers.filter((chamber) => chamber.optional)
    expect(optionalContracts.length).toBeGreaterThanOrEqual(15)
    expect(optionalContracts.length).toBeLessThanOrEqual(25)
    expect(optionalContracts.every((chamber) => chamber.contractType !== 'restoration')).toBe(true)
  })

  it('defines six major Ark systems with permanent benefits', () => {
    expect(majorArkSystems.map((system) => system.name)).toEqual(['Intake', 'Navigation', 'Water', 'Canopy', 'Memory', 'Heart'])
    expect(majorArkSystems.every((system) => system.unlock)).toBe(true)
  })

  it('defines four endgame resolutions from restoration patterns', () => {
    expect(endgameResolutions.map((resolution) => resolution.id)).toEqual(['preservation', 'adaptation', 'release', 'conservatory'])
    expect(chooseEndgameResolution(createDefaultSave()).id).toBe('preservation')
    expect(chooseEndgameResolution({ ...createDefaultSave(), restorationPhilosophy: 'adaptation' }).id).toBe('adaptation')
    expect(chooseEndgameResolution({ ...createDefaultSave(), solvedChambers: ['optional-heart-root'] }).id).toBe('release')
    expect(chooseEndgameResolution({ ...createDefaultSave(), solvedChambers: ['optional-heart-memory'] }).id).toBe('conservatory')
    expect(restorationPhilosophies.map((philosophy) => philosophy.id)).toEqual(['preservation', 'adaptation'])
  })

  it('tracks the Central Heart as the season five network hub', () => {
    const dormant = centralHeartSummary(chambers, createDefaultSave())
    expect(dormant.central.id).toBe('heart-atria')
    expect(dormant.online).toBe(false)
    expect(dormant.text).toContain('dormant')

    const readySave = createDefaultSave()
    readySave.solvedChambers = ['orchard-gate']
    const ready = centralHeartSummary(chambers, readySave)
    expect(ready.text).toContain('Central Heart ready')

    const onlineSave = createDefaultSave()
    onlineSave.solvedChambers = ['orchard-gate', 'heart-atria', 'optional-heart-root']
    const online = centralHeartSummary(chambers, onlineSave)
    expect(online.online).toBe(true)
    expect(online.restoredBranches.map((branch) => branch.id)).toContain('optional-heart-root')
    expect(online.readyBranches.map((branch) => branch.id)).toContain('optional-heart-glass')
  })

  it('models the crew wake cycle from heart and memory restoration', () => {
    expect(crewWakeCycleStages.map((stage) => stage.id)).toEqual(['stasis', 'circulation', 'consent-check', 'wake'])
    expect(crewWakeCycleSummary(createDefaultSave()).stageId).toBe('stasis')
    expect(crewWakeCycleSummary({ ...createDefaultSave(), solvedChambers: ['heart-atria'] }).stageId).toBe('circulation')
    expect(crewWakeCycleSummary({ ...createDefaultSave(), solvedChambers: ['heart-atria', 'optional-heart-memory'] }).stageId).toBe('consent-check')
    expect(crewWakeCycleSummary({ ...createDefaultSave(), solvedChambers: ['finale'], postgameUnlocked: true }).stageId).toBe('wake')
    expect(crewWakeCycleSummary({ ...createDefaultSave(), solvedChambers: ['optional-heart-root', 'finale'], postgameUnlocked: true }).text).toContain('deferred')
  })

  it('keeps codex records and perceptions in the 80 to 120 band', () => {
    const records = Object.values(codexRecords)
    expect(records.length).toBeGreaterThanOrEqual(80)
    expect(records.length).toBeLessThanOrEqual(120)
    expect(records.every((record) => record.title && record.text)).toBe(true)
  })

  it('organizes recovered records into navigable record trees', () => {
    const trees = codexRecordTrees(codexRecords, ['first-breath', 'gardener-note-01', 'crew-message-01', 'plant-memory-01'])

    expect(trees.map((tree) => tree.id)).toEqual(['gardener-notes', 'crew-messages', 'plant-memory', 'restoration-records'])
    expect(trees.find((tree) => tree.id === 'restoration-records').records[0].id).toBe('first-breath')
  })

  it('authors Intake Lung as an intake restoration contract', () => {
    const intake = chambers.find((chamber) => chamber.id === 'direction')
    expect(intake.title).toBe('Contract 1: Intake Lung')
    expect(intake.system).toBe('Intake')
    expect(intake.contractType).toBe('restoration')
    expect(intake.mechanic).toContain('chamber heart scan')
    expect(intake.rewards.codex).toContain('intake-lung')
  })

  it('authors Navigation Grove as a direction and distance contract', () => {
    const navigation = chambers.find((chamber) => chamber.id === 'binaural')
    expect(navigation.title).toBe('Contract 2: Navigation Grove')
    expect(navigation.system).toBe('Navigation')
    expect(navigation.mechanic).toBe('direction and distance')
    expect(navigation.target.x).toBeLessThan(0)
    expect(navigation.rewards.codex).toContain('navigation-grove')
  })

  it('authors Water Pump Third as a water pitch-ratio contract', () => {
    const water = chambers.find((chamber) => chamber.id === 'pitch')
    expect(water.title).toBe('Contract 3: Water Pump Third')
    expect(water.system).toBe('Water')
    expect(water.mechanic).toBe('pitch-ratio matching')
    expect(water.target.pitchRatio).toBe(1.5)
    expect(water.rewards.codex).toContain('water-pumps')
  })

  it('authors Canopy Pulse Trellis as a canopy-light rhythm contract', () => {
    const canopy = chambers.find((chamber) => chamber.id === 'rhythm')
    expect(canopy.title).toBe('Contract 4: Canopy Pulse Trellis')
    expect(canopy.system).toBe('Canopy')
    expect(canopy.mechanic).toBe('pulse-rate rhythm matching')
    expect(canopy.target.pulseRate).toBe(2)
    expect(canopy.photosynthesis.minBrightness).toBe(0.45)
    expect(canopy.rewards.codex).toContain('canopy-pulse')
  })

  it('requires enough brightness to open photosynthetic canopy chambers', () => {
    const canopy = chambers.find((chamber) => chamber.id === 'rhythm')
    const dimSeed = createSeedDNA('dim-canopy', { pitchRatio: 1, pulseRate: 2, brightness: 0.2, phase: 0, position: { x: 0, y: 0 } })
    const brightSeed = createSeedDNA('bright-canopy', { pitchRatio: 1, pulseRate: 2, brightness: 0.45, phase: 0, position: { x: 0, y: 0 } })

    expect(photosynthesisState(canopy, [dimSeed]).active).toBe(false)
    expect(evaluateResonance(canopy, [dimSeed]).missing).toContain('Raise brightness until the photosynthetic canopy opens.')
    expect(photosynthesisState(canopy, [brightSeed]).active).toBe(true)
    expect(evaluateResonance(canopy, [brightSeed]).solved).toBe(true)
  })

  it('authors Sun Prism with thermal shutter brightness limits', () => {
    const prism = chambers.find((chamber) => chamber.id === 'sun-prism')

    expect(prism.thermalShutters.minBrightness).toBe(0.75)
    expect(prism.thermalShutters.maxBrightness).toBe(0.9)
  })

  it('opens thermal shutters only inside the warm brightness window', () => {
    const prism = chambers.find((chamber) => chamber.id === 'sun-prism')
    const coolSeed = createSeedDNA('cool-prism', { pitchRatio: 2, pulseRate: 1.5, brightness: 0.6, phase: 90, position: { x: 1, y: 2 } })
    const hotSeed = createSeedDNA('hot-prism', { pitchRatio: 2, pulseRate: 1.5, brightness: 0.95, phase: 90, position: { x: 1, y: 2 } })
    const warmSeed = createSeedDNA('warm-prism', { pitchRatio: 2, pulseRate: 1.5, brightness: 0.85, phase: 90, position: { x: 1, y: 2 } })

    expect(thermalShutterState(prism, [coolSeed]).state).toBe('too cool')
    expect(thermalShutterState(prism, [hotSeed]).state).toBe('overheated')
    expect(evaluateResonance(prism, [coolSeed]).missing).toContain('Tune brightness until the thermal shutters open without overheating.')
    expect(thermalShutterState(prism, [warmSeed]).open).toBe(true)
    expect(evaluateResonance(prism, [warmSeed]).solved).toBe(true)
  })

  it('cycles authored chamber states slowly from the Ark clock', () => {
    const glassRain = chambers.find((chamber) => chamber.id === 'glass-rain')

    expect(chamberCycleState(glassRain, 0).name).toBe('Mist lift')
    expect(chamberCycleState(glassRain, 1).name).toBe('Mist lift')
    expect(chamberCycleState(glassRain, 2).name).toBe('Drizzle hold')
    expect(chamberCycleState(glassRain, 4).name).toBe('Sunbreak')
    expect(chamberCycleState(glassRain, 6).name).toBe('Mist lift')
  })

  it('rewards planning around favorable weather windows', () => {
    const glassRain = chambers.find((chamber) => chamber.id === 'glass-rain')
    const mist = weatherWindowState(glassRain, 0)
    const drizzle = weatherWindowState(glassRain, 2)

    expect(mist.favorable).toBe(false)
    expect(mist.nextFavorableIn).toBe(2)
    expect(mist.text).toContain('Weather window planning')
    expect(drizzle.favorable).toBe(true)
    expect(drizzle.text).toContain('Drizzle planning lowers crack risk')
  })

  it('adds weather-window advice to restoration planning sessions', () => {
    const solvedThroughRootworks = [
      'tutorial',
      'direction',
      'binaural',
      'pitch',
      'rhythm',
      'timbre',
      'phase',
      'harmony',
      'graft',
      'mold',
      'finale',
      'root-reservoir',
      'root-choir',
      'mycelium-gate',
      'optional-root-echo',
      'pressure-orchard',
      'optional-rhizome-splice',
      'nutrient-lattice',
      'optional-deep-root',
    ]
    const plan = restorationPlanningSession(chambers, solvedThroughRootworks, { min: 6, max: 10 }, 2)
    const glassRain = plan.contracts.find((chamber) => chamber.id === 'glass-rain')

    expect(glassRain.weatherWindow.favorable).toBe(true)
    expect(glassRain.weatherWindow.text).toContain('Weather window favorable')
  })

  it('requires bright edged timbre for brightness/timbre puzzles', () => {
    const glassLeaves = chambers.find((chamber) => chamber.id === 'timbre')
    const dullSeed = createSeedDNA('dull-glass', { waveform: 'sine', pitchRatio: 1, pulseRate: 1, brightness: 0.8, phase: 0, position: { x: 0, y: 0 } })
    const darkSeed = createSeedDNA('dark-glass', { waveform: 'triangle', pitchRatio: 1, pulseRate: 1, brightness: 0.55, phase: 0, position: { x: 0, y: 0 } })
    const brightSeed = createSeedDNA('bright-glass', { waveform: 'triangle', pitchRatio: 1, pulseRate: 1, brightness: 0.8, phase: 0, position: { x: 0, y: 0 } })

    expect(timbrePuzzleState(glassLeaves, [dullSeed]).active).toBe(false)
    expect(timbrePuzzleState(glassLeaves, [darkSeed]).active).toBe(false)
    expect(evaluateResonance(glassLeaves, [dullSeed]).missing).toContain('Use a bright edged timbre to open the brightness/timbre puzzle.')
    expect(timbrePuzzleState(glassLeaves, [brightSeed]).active).toBe(true)
    expect(evaluateResonance(glassLeaves, [brightSeed]).solved).toBe(true)
  })

  it('authors Wind Bellows with steady pressure sail pulse limits', () => {
    const bellows = chambers.find((chamber) => chamber.id === 'wind-bellows')

    expect(bellows.pressureSails.minPulseRate).toBe(1.75)
    expect(bellows.pressureSails.maxPulseRate).toBe(2.25)
  })

  it('holds pressure sails only inside the steady pulse window', () => {
    const bellows = chambers.find((chamber) => chamber.id === 'wind-bellows')
    const slackSeed = createSeedDNA('slack-sail', { pitchRatio: 1.25, pulseRate: 1.2, brightness: 0.55, phase: 60, position: { x: -1, y: 1 } })
    const strainSeed = createSeedDNA('strain-sail', { pitchRatio: 1.25, pulseRate: 2.8, brightness: 0.55, phase: 60, position: { x: -1, y: 1 } })
    const steadySeed = createSeedDNA('steady-sail', { pitchRatio: 1.25, pulseRate: 2, brightness: 0.55, phase: 60, position: { x: -1, y: 1 } })

    expect(pressureSailState(bellows, [slackSeed]).state).toBe('slack')
    expect(pressureSailState(bellows, [strainSeed]).state).toBe('straining')
    expect(evaluateResonance(bellows, [slackSeed]).missing).toContain('Tune pulse until the pressure sails hold steady.')
    expect(pressureSailState(bellows, [steadySeed]).steady).toBe(true)
    expect(evaluateResonance(bellows, [steadySeed]).solved).toBe(true)
  })

  it('authors Root Pumps as the first Rootworks pulse-routing contract', () => {
    const rootPumps = chambers.find((chamber) => chamber.id === 'root-reservoir')
    expect(rootPumps.title).toBe('Contract 9: Root Pumps')
    expect(rootPumps.system).toBe('Rootworks')
    expect(rootPumps.contractType).toBe('restoration')
    expect(rootPumps.mechanic).toBe('root pump pulse routing')
    expect(rootPumps.target.pulseRate).toBeLessThan(1)
    expect(rootPumps.rewards.codex).toContain('root-pumps')
  })

  it('authors Fungus Relays as a Rootworks hazard-routing contract', () => {
    const fungusRelays = chambers.find((chamber) => chamber.id === 'mycelium-gate')
    expect(fungusRelays.title).toBe('Contract 11: Fungus Relays')
    expect(fungusRelays.system).toBe('Rootworks')
    expect(fungusRelays.mechanic).toBe('fungus relay hazard routing')
    expect(fungusRelays.hazards[0].message).toContain('Fungus relays')
    expect(fungusRelays.rewards.codex).toContain('fungus-relays')
  })

  it('authors Nutrient Locks as a brightness-gated Rootworks contract', () => {
    const nutrientLocks = chambers.find((chamber) => chamber.id === 'nutrient-lattice')
    expect(nutrientLocks.title).toBe('Contract 13: Nutrient Locks')
    expect(nutrientLocks.system).toBe('Rootworks')
    expect(nutrientLocks.mechanic).toBe('nutrient lock brightness tuning')
    expect(nutrientLocks.target.brightness).toBeGreaterThan(0.7)
    expect(nutrientLocks.hazards[0].message).toContain('overload')
    expect(nutrientLocks.rewards.codex).toContain('nutrient-locks')
  })

  it('appraises the seed collection as restoration support instead of museum commerce', () => {
    const save = createDefaultSave()
    save.materials.biomass = 2
    const inventory = [
      createSeedDNA('sol', { family: 'Sol', pitchRatio: 1 }),
      createSeedDNA('lumen', { family: 'Lumen', pitchRatio: 1.25 }),
    ]
    const appraisal = seedCollectionAppraisal(inventory, save, inventory[1])
    expect(appraisal.gathered).toBe(2)
    expect(appraisal.identifiedFamilies).toEqual(['Sol', 'Lumen'])
    expect(appraisal.curatedSeed).toBe(inventory[1].name)
    expect(appraisal.playableVoices).toEqual(inventory.map((seed) => seed.name))
    expect(appraisal.restorationUse).toContain('Exchange 2 biomass')
    expect(appraisal.commerceBoundary).toContain('restoration support')
  })

  it('summarizes stewardship progress and next care action', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial']
    save.ratings = { tutorial: 'Restored' }
    save.materials.biomass = 1
    const summary = stewardshipSummary(chambers, save)
    expect(summary.restoredCount).toBe(1)
    expect(summary.totalCount).toBe(chambers.length)
    expect(summary.materialSummary).toContain('biomass 1')
    expect(summary.nextAction).toContain('Revisit')
  })

  it('offers optional return contracts for earlier low-rated restorations', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial', 'direction']
    save.ratings = { tutorial: 'Restored', direction: 'Stable' }
    const returns = optionalReturnContracts(chambers, save)

    expect(returns).toHaveLength(1)
    expect(returns[0]).toMatchObject({ id: 'tutorial', optional: true, returnContract: true, currentRating: 'Restored', targetRating: 'Stable' })
    expect(returns[0].text).toContain('Optional return contract')
  })

  it('summarizes available decisions without hiding optional work', () => {
    const summary = decisionSummary(chambers, ['tutorial', 'direction', 'binaural', 'pitch'])
    expect(summary.requiredChoices).toContain('Contract 4: Canopy Pulse Trellis')
    expect(summary.optionalChoices).toContain('Optional Contract: Twin Roots')
    expect(summary.recommendation).toBe('Contract 4: Canopy Pulse Trellis')
  })
})

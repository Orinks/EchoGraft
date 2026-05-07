import { describe, expect, it } from 'vitest'
import { campaignScope, chamberCycleState, chambers, codexRecords, codexRecordTrees, conservatoryContractSummary, contractRequirementStatus, emergencyContractSummary, estimatedDifficulty, finaleContractSummary, knownHazardsSummary, majorArkSystems, researchContractSummary, restorationContractSummary, rewardSummary, solveTimeText, stabilizationContractSummary, weatherWindowState } from '../src/content/chambers.js'
import { chooseEndgameResolution, crewWakeCycleStages, crewWakeCycleSummary, endgameResolutions, launchGardenStages, launchGardenSummary, resolutionEndingScenes, resolutionSpecificEnding, restorationPhilosophies } from '../src/content/endings.js'
import { availableChambers, canopyDoorState, centralHeartSummary, codexRecoverySummary, conservatoryCompositionModes, decisionSummary, dreamCompostSummary, embersapEndgameMutationState, evaluateResonance, finalEcologyPhilosophySummary, firstFullCampaignEstimate, freeCompositionConservatory, graftStabilitySummary, hazardContainmentSummary, heartNetworkEndingState, memoryCodexEchoState, mergeRewards, multiChamberResonanceNetwork, navigationAtlasState, optionalRecordRecoverySummary, optionalReturnContracts, photosynthesisState, playerBuiltFinalChord, pollinatorVaultSummary, pressureSailState, resonanceAccuracySummary, resourceEfficiencySummary, restorationOutcomeSummary, restorationPlanningSession, restorationRating, seedCollectionAppraisal, seedMoveSummary, stewardshipSummary, thermalShutterState, timbrePuzzleState, unlockNext, waterRootRoutingState } from '../src/content/resonance.js'
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

  it('unlocks richer atlas previews and chamber comparison after Navigation', () => {
    const limited = navigationAtlasState(chambers, { solvedChambers: ['tutorial'], restoredSystems: ['Intake'] })
    const unlocked = navigationAtlasState(chambers, { solvedChambers: ['tutorial', 'direction', 'binaural'], restoredSystems: ['Intake', 'Navigation'] })

    expect(limited.navigationOnline).toBe(false)
    expect(limited.text).toContain('previews limited')
    expect(limited.previews.every((item) => item.ready)).toBe(true)
    expect(unlocked.navigationOnline).toBe(true)
    expect(unlocked.text).toContain('solve-time comparison')
    expect(unlocked.previews.some((item) => !item.ready)).toBe(true)
    expect(unlocked.previews[0].text).toContain('Objective preview')
  })

  it('unlocks current navigation and root contract routing after Water', () => {
    const locked = waterRootRoutingState(chambers, { solvedChambers: ['tutorial', 'direction', 'binaural'], restoredSystems: ['Intake', 'Navigation'] })
    const unlocked = waterRootRoutingState(chambers, { solvedChambers: ['tutorial', 'direction', 'binaural', 'pitch'], restoredSystems: ['Intake', 'Navigation', 'Water'] })

    expect(locked.waterOnline).toBe(false)
    expect(locked.text).toContain('locked')
    expect(unlocked.waterOnline).toBe(true)
    expect(unlocked.rootContracts.map((item) => item.id)).toContain('root-reservoir')
    expect(unlocked.text).toContain('current navigation')
  })

  it('unlocks brightness tuning and photosynthesis door planning after Canopy', () => {
    const locked = canopyDoorState(chambers, { solvedChambers: ['tutorial', 'direction', 'binaural', 'pitch'], restoredSystems: ['Intake', 'Navigation', 'Water'] })
    const unlocked = canopyDoorState(chambers, { solvedChambers: ['tutorial', 'direction', 'binaural', 'pitch', 'rhythm'], restoredSystems: ['Intake', 'Navigation', 'Water', 'Canopy'] })

    expect(locked.canopyOnline).toBe(false)
    expect(locked.text).toContain('locked')
    expect(unlocked.canopyOnline).toBe(true)
    expect(unlocked.doors.map((item) => item.id)).toEqual(expect.arrayContaining(['rhythm', 'timbre', 'sun-prism']))
    expect(unlocked.text).toContain('brightness tuning')
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

  it('maps resonance scores to restoration ratings', () => {
    expect(restorationRating({ solved: false, score: 1 })).toBe('Dormant')
    expect(restorationRating({ solved: true, score: 0.84 })).toBe('Restored')
    expect(restorationRating({ solved: true, score: 0.85 })).toBe('Stable')
    expect(restorationRating({ solved: true, score: 0.96 })).toBe('Resonant')
  })

  it('summarizes resonance accuracy as a rating dimension', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const result = evaluateResonance(chamber, [
      createSeedDNA('near-sol', { pitchRatio: 1, pulseRate: 1, brightness: 0.45, phase: 0, position: { x: 0, y: 0 } }),
    ])

    expect(result.accuracy).toEqual(resonanceAccuracySummary(result.score))
    expect(result.accuracy.dimension).toBe('Resonance accuracy')
    expect(result.accuracy.percent).toBe(100)
    expect(result.accuracy.ratingContribution).toContain('Resonant')
    expect(resonanceAccuracySummary(0.85).band).toBe('stable')
    expect(resonanceAccuracySummary(0.49).ratingContribution).toContain('does not yet support')
  })

  it('summarizes seed moves used as a rating dimension', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const efficient = seedMoveSummary(chamber, 1)
    const messy = seedMoveSummary(chamber, 4)

    expect(efficient.dimension).toBe('Seed moves used')
    expect(efficient.band).toBe('efficient')
    expect(efficient.expectedMoves).toBe(chamber.requiredSeeds)
    expect(efficient.ratingContribution).toContain('stronger restoration ratings')
    expect(messy.band).toBe('messy')
    expect(messy.text).toContain('weakens high-rating stewardship')
  })

  it('summarizes graft stability from planted seed ancestry', () => {
    const chamber = chambers.find((item) => item.requiresGraft)
    const graft = createSeedDNA('catalogued-graft', {
      discoveryId: 'sol-lumen',
      graftAncestry: ['Sol', 'Lumen'],
      grafted: true,
      pitchRatio: chamber.target.pitchRatio,
      pulseRate: chamber.target.pulseRate,
      brightness: chamber.target.brightness,
      phase: chamber.target.phase,
      position: chamber.target,
    })
    const missing = graftStabilitySummary(chamber, [])
    const result = evaluateResonance(chamber, [graft])

    expect(missing.band).toBe('missing')
    expect(missing.stable).toBe(false)
    expect(result.graftStability.band).toBe('catalogued')
    expect(result.graftStability.stable).toBe(true)
    expect(result.graftStability.ratingContribution).toContain('stronger restoration ratings')
  })

  it('boosts graft stability with Mycelium-linked grafts and substrate', () => {
    const chamber = chambers.find((item) => item.requiresGraft)
    const plain = createSeedDNA('plain-graft', {
      discoveredOrigin: 'Intake lung',
      ecologicalAffinity: 'oxygen and stable pitch',
      family: 'Sol-Lumen graft',
      graftAncestry: ['Sol', 'Lumen'],
      grafted: true,
      position: chamber.target,
    })
    const myco = createSeedDNA('myco-graft', {
      discoveredOrigin: 'Mycelium gate',
      ecologicalAffinity: 'mycelium root networks',
      family: 'Myco-Lumen graft',
      graftAncestry: ['Myco', 'Lumen'],
      grafted: true,
      position: chamber.target,
    })
    const substrate = { ...chamber, substrate: 'mycelial rootbed' }

    expect(graftStabilitySummary(chamber, [plain]).band).toBe('viable')
    expect(graftStabilitySummary(chamber, [myco]).band).toBe('mycelium-boosted')
    expect(graftStabilitySummary(chamber, [myco]).myceliumBoosted).toBe(1)
    expect(graftStabilitySummary(substrate, [plain]).band).toBe('mycelium-boosted')
    expect(graftStabilitySummary(substrate, [plain]).ratingContribution).toContain('boosts graft stability')
  })

  it('summarizes hazard containment from forbidden intervals', () => {
    const chamber = chambers.find((item) => item.hazards?.length)
    const hazard = chamber.hazards[0]
    const breachedSeed = createSeedDNA('breach', { pitchRatio: hazard.pitchRatio, position: chamber.target })
    const safeSeed = createSeedDNA('safe', { pitchRatio: hazard.pitchRatio + hazard.radius + 0.5, position: chamber.target })
    const breach = hazardContainmentSummary(chamber, [breachedSeed])
    const contained = hazardContainmentSummary(chamber, [safeSeed])

    expect(breach.band).toBe('breached')
    expect(breach.contained).toBe(false)
    expect(breach.violations[0].seed.id).toBe('breach')
    expect(contained.band).toBe('contained')
    expect(contained.ratingContribution).toContain('stronger restoration ratings')
    expect(evaluateResonance(chamber, [breachedSeed]).hazardContainment.band).toBe('breached')
  })

  it('summarizes resource efficiency from saved chamber material spend', () => {
    const chamber = chambers.find((item) => item.rewards?.materials?.biomass)
    const save = createDefaultSave()

    expect(resourceEfficiencySummary(chamber, save).band).toBe('conserved')
    save.resourcesSpentByChamber[chamber.id] = { biomass: 1 }
    expect(resourceEfficiencySummary(chamber, save).band).toBe('balanced')
    save.resourcesSpentByChamber[chamber.id] = { biomass: 99 }
    expect(resourceEfficiencySummary(chamber, save).text).toContain('weakens resource-efficiency stewardship')
  })

  it('summarizes optional record recovery from chamber rewards', () => {
    const chamber = chambers.find((item) => item.rewards?.codex?.length)
    const save = createDefaultSave()
    const available = optionalRecordRecoverySummary(chamber, save)
    save.codexIds.push(...chamber.rewards.codex)
    const recovered = optionalRecordRecoverySummary(chamber, save)

    expect(available.band).toBe('available')
    expect(available.pending).toContain(chamber.rewards.codex[0])
    expect(recovered.band).toBe('recovered')
    expect(recovered.ratingContribution).toContain('stronger restoration ratings')
    expect(optionalRecordRecoverySummary(chambers.find((item) => !item.rewards?.codex?.length), save).band).toBe('none')
  })

  it('summarizes whether final ecology supports the chosen philosophy', () => {
    const preservation = createDefaultSave()
    preservation.ratings = { tutorial: 'Stable', direction: 'Resonant' }
    const adaptation = createDefaultSave()
    adaptation.restorationPhilosophy = 'adaptation'
    adaptation.unlockedGraftMechanics = ['hybrid resonance planting', 'FM pressure grafting']
    const strained = createDefaultSave()
    strained.restorationPhilosophy = 'preservation'
    strained.ratings = { tutorial: 'Stable' }
    strained.wildMutationIds = ['wild-one', 'wild-two']

    expect(finalEcologyPhilosophySummary(preservation)).toMatchObject({ band: 'aligned', philosophy: 'preservation' })
    expect(finalEcologyPhilosophySummary(adaptation)).toMatchObject({ band: 'aligned', philosophy: 'adaptation' })
    expect(finalEcologyPhilosophySummary(strained).text).toContain('asks for more stewardship')
  })

  it('treats Stable required restorations as online campaign progression', () => {
    const required = chambers.find((chamber) => !chamber.optional)
    const optional = chambers.find((chamber) => chamber.optional)
    const stable = restorationOutcomeSummary(required, 'Stable')

    expect(stable.systemOnline).toBe(true)
    expect(stable.campaignCanContinue).toBe(true)
    expect(stable.text).toContain('comes online')
    expect(stable.text).toContain('campaign can continue')
    expect(restorationOutcomeSummary(optional, 'Stable').campaignCanContinue).toBe(false)
  })

  it('treats Resonant restorations as Flourishing chamber contributions', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const outcome = restorationOutcomeSummary(chamber, 'Resonant')

    expect(outcome.outcome).toBe('Flourishing')
    expect(outcome.extraMusicLayer).toBe(true)
    expect(outcome.resourceYield).toBe(true)
    expect(outcome.text).toContain('extra Intake music layer')
    expect(outcome.text).toContain('resource yield')
  })

  it('treats Resonant harmonic chambers as elegant endgame contributions', () => {
    const chamber = chambers.find((item) => item.harmonic)
    const outcome = restorationOutcomeSummary(chamber, 'Resonant')

    expect(outcome.outcome).toBe('Harmonic')
    expect(outcome.seedArrangement).toBe('especially elegant')
    expect(outcome.endgameOptionStrength).toBe(2)
    expect(outcome.text).toContain('endgame options')
  })

  it('records Wild accepted instability as rare mutation material', () => {
    const chamber = chambers.find((item) => item.hazards?.length)
    const outcome = restorationOutcomeSummary(chamber, 'Wild')
    const next = mergeRewards(createDefaultSave(), chamber, 'Wild')

    expect(outcome.outcome).toBe('Wild')
    expect(outcome.rareMutationId).toBe(`${chamber.id}-wild-mutation`)
    expect(outcome.unusualEndingMaterial).toBe(true)
    expect(outcome.text).toContain('embersap')
    expect(next.ratings[chamber.id]).toBe('Wild')
    expect(next.wildMutationIds).toContain(`${chamber.id}-wild-mutation`)
    expect(next.materials.embersap).toBe(1)
    expect(embersapEndgameMutationState(next)).toMatchObject({ poweredMutations: 1, ready: true })
    expect(embersapEndgameMutationState({ ...next, materials: { ...next.materials, embersap: 0 } }).text).toContain('Embersap needed')
  })

  it('collects spores as crafting resources from authored contracts', () => {
    const save = createDefaultSave()
    const fungusRelays = chambers.find((chamber) => chamber.id === 'mycelium-gate')
    const next = mergeRewards(save, fungusRelays, 'Stable')

    expect(fungusRelays.rewards.materials.spores).toBeGreaterThan(0)
    expect(next.materials.spores).toBe(3)
    expect(next.materials.mycelium).toBe(1)
  })

  it('turns Dream Compost into a specific research material', () => {
    const save = createDefaultSave()
    const dreamCompost = chambers.find((chamber) => chamber.id === 'dream-compost')
    const next = mergeRewards(save, dreamCompost, 'Stable')

    expect(dreamCompost.rewards.materials.archiveLoam).toBe(1)
    expect(next.materials.archiveLoam).toBe(1)
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

  it('unlocks codex echoes after Memory comes online', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial', 'direction', 'binaural', 'pitch', 'rhythm', 'timbre', 'phase']
    save.restoredSystems = ['Intake', 'Navigation', 'Water', 'Canopy', 'Memory']
    const locked = memoryCodexEchoState(chambers, { ...save, restoredSystems: [], solvedChambers: ['tutorial'] })
    const unlocked = memoryCodexEchoState(chambers, save)

    expect(locked.memoryOnline).toBe(false)
    expect(locked.echoes).toEqual([])
    expect(unlocked.memoryOnline).toBe(true)
    expect(unlocked.text).toContain('codex echoes unlocked')
    expect(unlocked.echoes.length).toBeGreaterThan(0)
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

  it('authors a readable chamber name for every contract', () => {
    const names = new Set()

    for (const chamber of chambers) {
      expect(chamber.title, chamber.id).toMatch(/\S/)
      expect(names.has(chamber.title), chamber.id).toBe(false)
      names.add(chamber.title)
    }
  })

  it('authors the affected Ark system for every contract', () => {
    const allowedSystems = new Set([...majorArkSystems.map((system) => system.name), 'Rootworks', 'Glass Weather', 'Memory Orchard', 'Verdancy Heart', 'Research'])

    for (const chamber of chambers) {
      expect(chamber.system, chamber.id).toMatch(/\S/)
      expect(allowedSystems.has(chamber.system), chamber.id).toBe(true)
    }
  })

  it('uses the authored contract type taxonomy for every chamber', () => {
    const contractTypes = new Set(['training', 'restoration', 'stabilization', 'research', 'emergency', 'survey', 'challenge', 'finale', 'conservatory'])

    for (const chamber of chambers) {
      expect(contractTypes.has(chamber.contractType), chamber.id).toBe(true)
    }
  })

  it('estimates difficulty for every chamber contract', () => {
    const difficultyBands = new Set(['introductory', 'standard', 'advanced', 'endgame'])

    for (const chamber of chambers) {
      expect(difficultyBands.has(estimatedDifficulty(chamber)), chamber.id).toBe(true)
    }
    expect(estimatedDifficulty(chambers.find((chamber) => chamber.contractType === 'training'))).toBe('introductory')
    expect(estimatedDifficulty(chambers.find((chamber) => chamber.contractType === 'finale'))).toBe('endgame')
    expect(estimatedDifficulty(chambers.find((chamber) => chamber.optional))).toBe('advanced')
  })

  it('summarizes required or optional status for every chamber contract', () => {
    for (const chamber of chambers) {
      const summary = contractRequirementStatus(chamber)
      expect(['required', 'optional']).toContain(summary.status)
      expect(summary.required, chamber.id).toBe(!chamber.optional)
      expect(summary.optional, chamber.id).toBe(Boolean(chamber.optional))
      expect(summary.text, chamber.id).toContain(summary.status)
    }

    expect(contractRequirementStatus(chambers.find((chamber) => chamber.optional)).text).toContain('optional')
    expect(contractRequirementStatus(chambers.find((chamber) => !chamber.optional)).text).toContain('required')
  })

  it('summarizes known hazards for every chamber contract', () => {
    for (const chamber of chambers) {
      const summary = knownHazardsSummary(chamber)
      expect(summary.count, chamber.id).toBe(chamber.hazards?.length ?? 0)
      expect(summary.text, chamber.id).toContain('Known hazards:')
    }
    expect(knownHazardsSummary(chambers.find((chamber) => chamber.contractType === 'training')).text).toContain('none recorded')
    expect(knownHazardsSummary(chambers.find((chamber) => chamber.contractType === 'emergency')).count).toBeGreaterThan(0)
  })

  it('summarizes rewards for every chamber contract', () => {
    for (const chamber of chambers) {
      const summary = rewardSummary(chamber)
      expect(summary.text, chamber.id).toContain('Reward:')
      expect(summary.parts.length, chamber.id).toBeGreaterThan(0)
    }
    expect(rewardSummary(chambers.find((chamber) => chamber.id === 'mold')).text).toContain('seeds spire')
    expect(rewardSummary(chambers.find((chamber) => chamber.id === 'tutorial')).text).toContain('records first-breath')
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

  it('provides resolution-specific ending scenes', () => {
    expect(Object.keys(resolutionEndingScenes)).toEqual(['preservation', 'adaptation', 'release', 'conservatory'])
    expect(resolutionSpecificEnding({ ...createDefaultSave(), endgameResolution: 'preservation' }).text).toContain('original greenhouse')
    expect(resolutionSpecificEnding({ ...createDefaultSave(), endgameResolution: 'adaptation' }).text).toContain('Hybrid lineages')
    expect(resolutionSpecificEnding({ ...createDefaultSave(), endgameResolution: 'release' }).text).toContain('launch garden')
    expect(resolutionSpecificEnding({ ...createDefaultSave(), endgameResolution: 'conservatory' }).text).toContain('living archive')
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

  it('models launch garden readiness for the release path', () => {
    expect(launchGardenStages.map((stage) => stage.id)).toEqual(['sealed', 'preparing', 'armed', 'launched'])
    expect(launchGardenSummary(createDefaultSave()).stageId).toBe('sealed')
    expect(launchGardenSummary({ ...createDefaultSave(), solvedChambers: ['heart-atria'] }).stageId).toBe('preparing')
    expect(launchGardenSummary({ ...createDefaultSave(), solvedChambers: ['heart-atria', 'optional-heart-root'] }).stageId).toBe('armed')
    expect(launchGardenSummary({ ...createDefaultSave(), solvedChambers: ['optional-heart-root', 'finale'], postgameUnlocked: true }).stageId).toBe('launched')
  })

  it('builds a multi-chamber resonance network from restored systems and ratings', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial', 'binaural', 'pitch', 'rhythm', 'phase', 'heart-atria']
    save.ratings = {
      tutorial: 'Resonant',
      binaural: 'Stable',
      pitch: 'Restored',
      rhythm: 'Stable',
      phase: 'Resonant',
      'heart-atria': 'Stable',
    }
    const network = multiChamberResonanceNetwork(chambers, save)

    expect(network.onlineNodes.map((node) => node.system)).toEqual(expect.arrayContaining(['Intake', 'Navigation', 'Water', 'Canopy', 'Memory', 'Verdancy Heart']))
    expect(network.readyForFinale).toBe(true)
    expect(network.totalStrength).toBe(13)
    expect(network.nodes.find((node) => node.system === 'Intake').text).toContain('network strength 3')
  })

  it('unlocks network resonance and ending access after Heart restoration', () => {
    const locked = heartNetworkEndingState(chambers, createDefaultSave())
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial', 'direction', 'binaural', 'pitch', 'rhythm', 'phase', 'heart-atria', 'finale']
    save.restoredSystems = ['Intake', 'Navigation', 'Water', 'Canopy', 'Memory', 'Verdancy Heart', 'Heart']
    save.postgameUnlocked = true
    const unlocked = heartNetworkEndingState(chambers, save)

    expect(locked.heartOnline).toBe(false)
    expect(locked.text).toContain('locked')
    expect(unlocked.heartOnline).toBe(true)
    expect(unlocked.endingsUnlocked).toBe(true)
    expect(unlocked.text).toContain('ending resolutions are available')
  })

  it('builds the final chord from the player planted restored chamber voices', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial', 'heart-atria']
    save.ratings = { tutorial: 'Resonant', 'heart-atria': 'Stable' }
    save.plantedByChamber = {
      tutorial: [createSeedDNA('sol-final', { name: 'Sol final voice', pitchRatio: 1, pulseRate: 1 })],
      'heart-atria': [createSeedDNA('pulse-final', { name: 'Pulse final voice', family: 'Pulse', pitchRatio: 1.25, pulseRate: 2.5 })],
      pitch: [createSeedDNA('ignored-unrestored', { name: 'Ignored unrestored voice' })],
    }
    const chord = playerBuiltFinalChord(chambers, save)

    expect(chord.voices.map((voice) => voice.name)).toEqual(['Sol final voice', 'Pulse final voice'])
    expect(chord.systems).toEqual(['Intake', 'Verdancy Heart'])
    expect(chord.networkStrength).toBe(5)
    expect(chord.text).toContain('Player-built final chord')
  })

  it('opens postgame free-composition modes in the Conservatory', () => {
    const locked = freeCompositionConservatory(createDefaultSave(), [])
    expect(locked.unlocked).toBe(false)
    expect(locked.text).toContain('locked')

    const save = { ...createDefaultSave(), postgameUnlocked: true }
    const inventory = [
      createSeedDNA('sol-compose', { name: 'Sol compose voice' }),
      createSeedDNA('lumen-compose', { name: 'Lumen compose voice' }),
    ]
    const network = freeCompositionConservatory(save, inventory, 'network')

    expect(conservatoryCompositionModes.map((mode) => mode.id)).toEqual(['balanced', 'solo', 'network'])
    expect(network.unlocked).toBe(true)
    expect(network.mode.title).toBe('Network Braid')
    expect(network.playableVoices.map((voice) => voice.name)).toEqual(['Sol compose voice', 'Lumen compose voice'])
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

  it('rewards every authored gardener note through campaign chamber solves', () => {
    const expectedNotes = Array.from({ length: 12 }, (_, index) => `gardener-note-${String(index + 1).padStart(2, '0')}`)
    const rewardedNotes = chambers.flatMap((chamber) => chamber.rewards?.codex ?? []).filter((id) => id.startsWith('gardener-note'))
    const rewardedNoteSet = new Set(rewardedNotes)
    const tutorialSave = mergeRewards(createDefaultSave(), chambers.find((chamber) => chamber.id === 'tutorial'), 'Stable')
    const tutorialTrees = codexRecordTrees(codexRecords, tutorialSave.codexIds)
    const gardenerTree = tutorialTrees.find((tree) => tree.id === 'gardener-notes')

    expect(rewardedNotes).toHaveLength(expectedNotes.length)
    expect([...rewardedNoteSet].sort()).toEqual(expectedNotes)
    expect(expectedNotes.every((id) => codexRecords[id])).toBe(true)
    expect(gardenerTree.records.map((record) => record.title)).toContain('Gardener Note 01')
  })

  it('authors Intake Lung as an intake restoration contract', () => {
    const intake = chambers.find((chamber) => chamber.id === 'direction')
    expect(intake.title).toBe('Contract 1: Intake Lung')
    expect(intake.system).toBe('Intake')
    expect(intake.contractType).toBe('restoration')
    expect(intake.mechanic).toContain('chamber heart scan')
    expect(intake.rewards.codex).toContain('intake-lung')
  })

  it('summarizes restoration contracts as named Ark subsystem repairs', () => {
    const restorationContracts = chambers.filter((chamber) => chamber.contractType === 'restoration')

    expect(restorationContracts.length).toBeGreaterThan(0)
    for (const contract of restorationContracts) {
      const summary = restorationContractSummary(contract)
      expect(summary.subsystem, contract.id).toBe(contract.system)
      expect(summary.text, contract.id).toContain(`named Ark subsystem ${contract.system}`)
      expect(summary.text, contract.id).toContain(contract.mechanic)
    }
    expect(restorationContractSummary(chambers.find((chamber) => chamber.contractType === 'training'))).toBeUndefined()
  })

  it('uses stabilization contracts to improve a restored chamber rating', () => {
    const stabilizationContracts = chambers.filter((chamber) => chamber.contractType === 'stabilization')
    const glassLeaves = chambers.find((chamber) => chamber.id === 'timbre')
    const save = createDefaultSave()
    save.solvedChambers = ['rhythm']
    save.ratings = { rhythm: 'Restored' }

    expect(stabilizationContracts.length).toBeGreaterThan(0)
    for (const contract of stabilizationContracts) {
      const summary = stabilizationContractSummary(contract)
      expect(summary.improvesChamberId, contract.id).toBeTruthy()
      expect(summary.targetRating, contract.id).toBe('Stable')
      expect(summary.text, contract.id).toContain('improves restored chamber')
      expect(contract.requires, contract.id).toContain(summary.improvesChamberId)
    }
    expect(stabilizationContractSummary(chambers.find((chamber) => chamber.contractType === 'restoration'))).toBeUndefined()
    expect(mergeRewards(save, glassLeaves, 'Stable').ratings.rhythm).toBe('Stable')
  })

  it('summarizes research contracts as seed family, trait, or record reveals', () => {
    const researchContracts = chambers.filter((chamber) => chamber.contractType === 'research')
    const revealKinds = new Set()

    expect(researchContracts.length).toBeGreaterThan(0)
    for (const contract of researchContracts) {
      const summary = researchContractSummary(contract)
      revealKinds.add(summary.kind)
      expect(['seed family', 'trait', 'record']).toContain(summary.kind)
      expect(summary.name, contract.id).toBeTruthy()
      expect(summary.text, contract.id).toContain(`reveals ${summary.kind}`)
      expect(summary.text, contract.id).toContain(contract.mechanic)
    }
    expect(revealKinds).toEqual(new Set(['record', 'trait', 'seed family']))
    expect(researchContractSummary(chambers.find((chamber) => chamber.contractType === 'stabilization'))).toBeUndefined()
  })

  it('summarizes emergency contracts as unstable hazards with soft deadlines', () => {
    const emergencyContracts = chambers.filter((chamber) => chamber.contractType === 'emergency')

    expect(emergencyContracts.length).toBeGreaterThan(0)
    for (const contract of emergencyContracts) {
      const summary = emergencyContractSummary(contract)
      expect(summary.hazardCount, contract.id).toBeGreaterThan(0)
      expect(summary.softDeadlineMinutes, contract.id).toBeGreaterThan(0)
      expect(summary.softDeadlineMinutes, contract.id).toBeLessThanOrEqual(contract.solveTimeMinutes.max)
      expect(summary.text, contract.id).toContain('unstable hazard')
      expect(summary.text, contract.id).toContain('soft deadline')
    }
    expect(emergencyContractSummary(chambers.find((chamber) => chamber.contractType === 'research'))).toBeUndefined()
  })

  it('authors a conservatory contract for composing and curating seed voices', () => {
    const contract = chambers.find((chamber) => chamber.contractType === 'conservatory')
    const summary = conservatoryContractSummary(contract)

    expect(contract.id).toBe('postgame-conservatory')
    expect(contract.optional).toBe(true)
    expect(contract.requires).toContain('finale')
    expect(summary.compositionModes).toEqual(['balanced chord', 'seed solo', 'network braid'])
    expect(summary.curation).toContain('recovered seed voices')
    expect(summary.text).toContain('compose')
    expect(summary.text).toContain('curate seed voices')
    expect(availableChambers(chambers, ['finale']).map((chamber) => chamber.id)).toContain('postgame-conservatory')
    expect(conservatoryContractSummary(chambers.find((chamber) => chamber.contractType === 'emergency'))).toBeUndefined()
  })

  it('summarizes finale contracts as endgame Ark network contributions', () => {
    const finale = chambers.find((chamber) => chamber.contractType === 'finale')
    const summary = finaleContractSummary(finale)

    expect(finale.id).toBe('finale')
    expect(finale.ending).toBe(true)
    expect(summary.systems).toEqual(['Intake', 'Navigation', 'Water', 'Canopy', 'Memory', 'Heart'])
    expect(summary.networkContribution).toContain('Verdancy Heart chord')
    expect(summary.text).toContain('endgame Ark network')
    expect(summary.text).toContain('braiding restored')
    expect(finaleContractSummary(chambers.find((chamber) => chamber.contractType === 'conservatory'))).toBeUndefined()
  })

  it('authors the training contract as one low-stakes mechanic lesson', () => {
    const training = chambers.find((chamber) => chamber.id === 'tutorial')

    expect(training.contractType).toBe('training')
    expect(training.training).toMatchObject({ focus: 'chamber heart scan', stakes: 'low' })
    expect(training.training.text).toContain('Teaches one safe mechanic')
    expect(training.hazards ?? []).toHaveLength(0)
    expect(training.solveTimeMinutes.max).toBeLessThanOrEqual(6)
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

import { describe, expect, it } from 'vitest'
import { allFiveSeasonsBlockedInState, axisCombinationMasterySummary, campaignScope, chamberCycleState, chambers, codexCompleteState, codexRecords, codexRecordTrees, conservatoryContractSummary, contractRequirementStatus, emergencyContractSummary, estimatedDifficulty, finaleContractSummary, knownHazardsSummary, mainChamberCatalogState, majorArkSystems, milestoneChamberSlice, optionalComplexitySummary, optionalContentPassState, researchContractSummary, restorationContractSummary, rewardSummary, seasonOneContractStructureState, seasonOneOpeningContractMix, seasonTwoRootworksState, solveTimeText, stabilizationContractSummary, teachingAxisSummary, weatherWindowState } from '../src/content/chambers.js'
import { adaptationPathState, alternateEndingPaths, chooseEndgameResolution, conservatoryPathState, crewAwakeningQuestionState, crewWakeCycleStages, crewWakeCycleSummary, endingResolutionReflectionRewards, endgameResolutions, firstEndingsState, launchGardenStages, launchGardenSummary, mergeEndingResolutionReflections, originalMissionQuestionState, playerRoleQuestionState, preservationPathState, releasePathState, resolutionEndingScenes, resolutionSpecificEnding, restorationIdentityQuestionState, restoredEcologyQuestionState, restorationPhilosophies } from '../src/content/endings.js'
import { allMenusAccessibleState, arkOriginMysteryState, availableChambers, canopyDoorState, centralHeartSummary, codexCompletionState, codexRecoverySummary, codexStoryPayoffState, conservatoryCompositionModes, conservatoryCompositionSnapshot, decisionSummary, dreamCompostSummary, droughtPocketState, e2eKeyFlowCoverageState, embersapEndgameMutationState, endToEndProgressionState, evaluateResonance, finalEcologyPhilosophySummary, firstChamberRatingImprovementState, firstCodexRecordsState, firstFourArkSystemsState, firstFullCampaignEstimate, firstMaterialLoopState, forbiddenPitchZoneState, freeCompositionConservatory, graftCatalogCompletionState, graftStabilitySummary, hazardContainmentSummary, heartNetworkEndingState, lowCycleRestorationChallenge, manualCompleteState, materialsCraftingState, memoryCodexEchoState, mergeRewards, multiChamberResonanceNetwork, navigationAtlasState, optionalRecordRecoverySummary, optionalReturnContracts, packagingDeploymentState, performancePassState, persistentChamberChangesState, photosynthesisState, playerBuiltFinalChord, pollinatorVaultSummary, pressureSailState, rareSeedHuntingState, resonanceAccuracySummary, resourceDeadEndState, resourceEfficiencySummary, restoredSystemRewardsState, restorationAtlasOpeningFreedomState, restorationAtlasV1State, restorationOutcomeSummary, restorationPlanningSession, restorationRating, screenReaderTestingState, seedCollectionAppraisal, seedLibraryMenuState, seedMoveSummary, staticBloomState, stewardshipSummary, thermalShutterState, timbrePuzzleState, unlockNext, waterRootRoutingState, workingRestorationCampaignState } from '../src/content/resonance.js'
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

  it('tracks Intake Navigation Water and Canopy systems as the first functional arc', () => {
    const locked = firstFourArkSystemsState(chambers, { solvedChambers: ['tutorial'], restoredSystems: ['Intake'] })
    const online = firstFourArkSystemsState(chambers, {
      solvedChambers: ['tutorial', 'direction', 'binaural', 'pitch', 'rhythm'],
      restoredSystems: ['Intake', 'Navigation', 'Water', 'Canopy'],
    })

    expect(locked.ready).toBe(true)
    expect(locked.systems.map((system) => system.name)).toEqual(['Intake', 'Navigation', 'Water', 'Canopy'])
    expect(locked.onlineCount).toBe(1)
    expect(online.onlineCount).toBe(4)
    expect(online.systems.every((system) => system.online)).toBe(true)
    expect(online.text).toContain('Intake, Navigation, Water, and Canopy systems ready')
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

  it('rejects mold forbidden pitch zones during restoration', () => {
    const chamber = chambers.find((item) => item.id === 'mold')
    const sourSeed = createSeedDNA('mold-sour', { pitchRatio: 0.75, pulseRate: 2, brightness: 0.7, phase: 90, position: chamber.target })
    const clearSeed = createSeedDNA('mold-clear', { pitchRatio: 2, pulseRate: 2, brightness: 0.7, phase: 90, position: chamber.target })
    const sourZone = forbiddenPitchZoneState(chamber, [sourSeed])
    const clearZone = forbiddenPitchZoneState(chamber, [clearSeed])

    expect(sourZone).toMatchObject({
      breached: true,
      count: 1,
      zones: [expect.objectContaining({ lower: 0.55, pitchRatio: 0.75, upper: 0.95 })],
    })
    expect(sourZone.text).toContain('Rejected seeds: Seed mold-sour pitch 0.75')
    expect(evaluateResonance(chamber, [sourSeed]).missing).toContain('Mold rejects the low fourth interval.')
    expect(clearZone.breached).toBe(false)
    expect(evaluateResonance(chamber, [clearSeed]).solved).toBe(true)
  })

  it('treats pulse-rate hazard intervals as unsafe zones', () => {
    const chamber = {
      ...chambers.find((item) => item.hazards?.some((hazard) => Number.isFinite(hazard.pulseRate))),
      requiredSeeds: 1,
      target: { x: 0, y: 0, pitchRatio: 2, pulseRate: 2, brightness: 0.45, phase: 0 },
      tolerances: { position: 2, pitchRatio: 1, pulseRate: 2, brightness: 1, phase: 360 },
    }
    const hazard = chamber.hazards[0]
    const breachedSeed = createSeedDNA('pulse-breach', { pitchRatio: 2, pulseRate: hazard.pulseRate, position: chamber.target })
    const safeSeed = createSeedDNA('pulse-safe', { pitchRatio: 2, pulseRate: hazard.pulseRate + hazard.radius + 0.5, position: chamber.target })

    expect(hazardContainmentSummary(chamber, [breachedSeed]).band).toBe('breached')
    expect(evaluateResonance(chamber, [breachedSeed]).missing).toContain(hazard.message)
    expect(hazardContainmentSummary(chamber, [safeSeed]).band).toBe('contained')
  })

  it('drains pulse stability inside drought pockets', () => {
    const chamber = chambers.find((item) => item.id === 'root-reservoir')
    const drainedSeed = createSeedDNA('drought-drain', { pitchRatio: 0.75, pulseRate: 0.4, brightness: 0.35, phase: 45, position: chamber.target })
    const stableSeed = createSeedDNA('drought-stable', { pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.35, phase: 45, position: chamber.target })

    expect(chamber.droughtPockets).toMatchObject({ minStablePulseRate: 0.65 })
    expect(droughtPocketState(chamber, [drainedSeed])).toMatchObject({ drained: true, pulseRate: 0.4, stable: false })
    expect(evaluateResonance(chamber, [drainedSeed]).missing).toContain('Raise pulse until drought pockets stop draining stability.')
    expect(droughtPocketState(chamber, [stableSeed])).toMatchObject({ drained: false, pulseRate: 0.75, stable: true })
    expect(evaluateResonance(chamber, [stableSeed]).solved).toBe(true)
  })

  it('masks weak seeds inside static bloom chambers', () => {
    const chamber = chambers.find((item) => item.id === 'hail-damper')
    const weakSeed = createSeedDNA('hail-weak', { pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.3, phase: 225, position: chamber.target })
    const clearSeed = createSeedDNA('hail-clear', { pitchRatio: 0.75, pulseRate: 0.75, brightness: 0.48, phase: 225, position: chamber.target })

    expect(chamber.staticBloom).toMatchObject({ minBrightness: 0.42 })
    expect(staticBloomState(chamber, [weakSeed])).toMatchObject({
      clear: false,
      masked: true,
      maskedSeeds: [expect.objectContaining({ id: 'hail-weak', brightness: 0.3 })],
    })
    expect(evaluateResonance(chamber, [weakSeed]).missing).toContain('Raise weak seed brightness until static bloom stops masking it.')
    expect(staticBloomState(chamber, [clearSeed])).toMatchObject({ clear: true, masked: false })
    expect(evaluateResonance(chamber, [clearSeed]).solved).toBe(true)
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

  it('avoids dead-end resource states on required progression', () => {
    const save = createDefaultSave()
    const empty = resourceDeadEndState(chambers, save)
    const progressed = createDefaultSave()
    progressed.solvedChambers = ['tutorial', 'direction', 'binaural', 'pitch']
    progressed.materials.spores = 0

    expect(empty).toMatchObject({
      deadEnded: false,
      freeTuningFallback: true,
      resetRecovery: true,
    })
    expect(empty.readyRequired.map((chamber) => chamber.id)).toContain('tutorial')
    expect(empty.materialGatedRequired).toEqual([])
    expect(empty.futureMaterialRewardCount).toBeGreaterThan(0)
    expect(empty.text).toContain('Resource dead-end prevention: safe')
    expect(empty.text).toContain('Tuning is free when spores are empty')
    expect(progressed.deadEnded).toBeUndefined()
    expect(resourceDeadEndState(chambers, progressed).readyRequired.map((chamber) => chamber.id)).toContain('rhythm')
  })

  it('tracks the first material earn and spend loop', () => {
    const empty = firstMaterialLoopState(chambers, createDefaultSave())
    const gathered = firstMaterialLoopState(chambers, { ...createDefaultSave(), materials: { biomass: 1, spores: 1 } })

    expect(empty.ready).toBe(true)
    expect(empty.rewardEntries).toEqual([['biomass', 1], ['spores', 1]])
    expect(empty.text).toContain('earn 1 biomass, 1 spores')
    expect(gathered.gatheredEntries).toEqual([['biomass', 1], ['spores', 1]])
    expect(gathered.text).toContain('2 starter material type')
  })

  it('summarizes materials and crafting recipe paths', () => {
    const state = materialsCraftingState(createDefaultSave())

    expect(state.ready).toBe(true)
    expect(state.recipes.map((recipe) => recipe.id)).toEqual(['spore-tuning', 'resin-lock', 'mycelium-graft', 'glass-pollen', 'archive-loam', 'dream-compost', 'embersap'])
    expect(state.text).toContain('Materials and crafting ready')
    expect(state.text).toContain('resin locks seed traits')
  })

  it('summarizes materials and rewards for restored systems', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial']
    save.restoredSystems = ['Intake']
    save.materials.biomass = 1
    save.materials.spores = 1
    const state = restoredSystemRewardsState(chambers, save)
    const intake = state.entries.find((entry) => entry.system === 'Intake')
    const navigation = state.entries.find((entry) => entry.system === 'Navigation')

    expect(state.ready).toBe(true)
    expect(state.onlineEntries.map((entry) => entry.system)).toContain('Intake')
    expect(state.text).toContain('Restored system rewards ready: 1 online system')
    expect(state.text).toContain('earned 1 biomass, 1 spores')
    expect(intake.text).toContain('Intake: online; 1 of')
    expect(intake.text).toContain('materials')
    expect(navigation.text).toContain('Navigation: locked')
    expect(navigation.materialText).toContain('crystal')
  })

  it('summarizes persistent chamber changes from the save', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial']
    save.environmentalChanges = ['Intake: Training Contract: First Breath stabilized with Resonant resonance']
    save.plantedByChamber.tutorial = [createSeedDNA('sol', { position: { x: 0, y: 0 } })]
    save.ratings.tutorial = 'Resonant'
    save.seedMovesByChamber.tutorial = 1
    save.resourcesSpentByChamber.tutorial = { spores: 1 }
    const state = persistentChamberChangesState(chambers, save)

    expect(state.ready).toBe(true)
    expect(state.entries).toHaveLength(1)
    expect(state.entries[0]).toMatchObject({
      id: 'tutorial',
      plantedSeedCount: 1,
      rating: 'Resonant',
      seedMoves: 1,
    })
    expect(state.text).toContain('Persistent chamber changes ready: 1 restored chamber change')
    expect(state.entries[0].text).toContain('spend 1 spores')
    expect(state.entries[0].text).toContain('stabilized with Resonant resonance')
  })

  it('describes first chamber rating improvement paths', () => {
    const fresh = firstChamberRatingImprovementState(chambers, createDefaultSave())
    const restored = firstChamberRatingImprovementState(chambers, { ...createDefaultSave(), ratings: { tutorial: 'Restored' } })

    expect(fresh.ready).toBe(true)
    expect(fresh.currentRating).toBe('Unrated')
    expect(restored.firstContract.id).toBe('tutorial')
    expect(restored.targetRating).toBe('Resonant')
    expect(restored.improvementSteps).toContain('tighten resonance accuracy')
    expect(restored.text).toContain('First chamber rating improvements ready')
  })

  it('tracks low-cycle restoration challenge timing', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const save = createDefaultSave()

    expect(lowCycleRestorationChallenge(chamber, save)).toMatchObject({
      eligible: true,
      targetCycles: 4,
    })

    save.arkClock = 5
    expect(lowCycleRestorationChallenge(chamber, save).text).toContain('missed')

    save.lowCycleChallengeIds = ['tutorial']
    expect(lowCycleRestorationChallenge(chamber, save).text).toContain('achieved')
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

  it('tracks whether the Ark was abandoned, sabotaged, or protected', () => {
    const unknown = arkOriginMysteryState(createDefaultSave())
    const protectedSave = createDefaultSave()
    protectedSave.codexIds = ['crew-message-08', 'gardener-note-09', 'seed-ancestry-03', 'crew-message-11']

    const protectedState = arkOriginMysteryState(protectedSave)

    expect(unknown.verdict).toBe('unresolved')
    expect(protectedState.verdict).toBe('protected')
    expect(protectedState.text).toContain('sabotage still unproven')
    expect(protectedState.tracks.find((track) => track.id === 'sabotaged').text).toContain('no proven sabotage flag')
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

  it('verifies the first codex records from the training contract', () => {
    const state = firstCodexRecordsState(chambers, codexRecords)

    expect(state.ready).toBe(true)
    expect(state.firstContract.id).toBe('tutorial')
    expect(state.entries.map((record) => record.id)).toEqual(['first-breath', 'gardener-note-01', 'crew-message-12', 'plant-memory-01', 'seed-ancestry-01', 'story-payoff-01'])
    expect(state.entries.every((record) => record.title && record.text)).toBe(true)
    expect(state.text).toContain('First codex records ready')
  })

  it('tracks codex completion including dynamic graft records', () => {
    const save = createDefaultSave()
    save.codexIds = ['first-breath', 'graft-record-sol-lumen']
    save.graftRecords = [{ id: 'graft-record-sol-lumen', title: 'Sol-Lumen graft record', text: 'A remembered graft.' }]
    const completion = codexCompletionState(save)

    expect(completion.recoveredCount).toBe(2)
    expect(completion.total).toBe(Object.keys(codexRecords).length + 1)
    expect(completion.missingCount).toBe(completion.total - 2)
    expect(completion.nextMissing).toMatchObject({ id: 'intake-lung', title: 'Intake Lung' })
    expect(completion.text).toContain('Codex completion: 2 of')
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

  it('keeps main campaign timing free of mandatory reflex tests', () => {
    for (const chamber of chambers.filter((item) => !item.optional)) {
      const timingText = `${chamber.objective} ${chamber.mechanic} ${chamber.emergency?.consequence ?? ''}`.toLowerCase()
      expect(timingText, chamber.id).not.toContain('reflex')
      expect(timingText, chamber.id).not.toContain('instant')
      expect(timingText, chamber.id).not.toContain('game over')
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

  it('turns ratings and atlas planning into a working restoration campaign queue', () => {
    const save = createDefaultSave()
    save.solvedChambers = ['tutorial', 'direction']
    save.ratings = { tutorial: 'Restored', direction: 'Stable' }
    const state = workingRestorationCampaignState(chambers, save)

    expect(state.ready).toBe(true)
    expect(state.ratingText).toContain('Stable 1')
    expect(state.ratingText).toContain('Restored 1')
    expect(state.returnContracts.map((contract) => contract.id)).toContain('tutorial')
    expect(state.nextAction).toContain('revisit Training Contract: First Breath')
    expect(state.entries[0]).toMatchObject({ id: 'binaural', ready: true, rating: 'Unrated' })
    expect(state.text).toContain('Working restoration campaign')
    expect(state.text).toContain('rating return option')
  })

  it('tracks restoration atlas v1 as a concrete planning and functions surface', () => {
    const state = restorationAtlasV1State(chambers, createDefaultSave())

    expect(state.ready).toBe(true)
    expect(state.available.map((chamber) => chamber.id)).toContain('tutorial')
    expect(state.plan.contracts.map((chamber) => chamber.id)).toEqual(['tutorial', 'direction', 'binaural', 'pitch'])
    expect(state.functions).toEqual(['active chamber', 'seed library', 'codex perceptions', 'settings', 'main menu'])
    expect(state.checklist.map((item) => item.id)).toEqual(['work-orders', 'planning-window', 'materials-ledger', 'return-contracts', 'codex-payoff', 'function-menu'])
    expect(state.checklist.every((item) => item.ready)).toBe(true)
    expect(state.text).toContain('Restoration atlas v1 ready')
  })

  it('answers how much freedom the restoration atlas offers at campaign start', () => {
    const state = restorationAtlasOpeningFreedomState(chambers, createDefaultSave())

    expect(state.guided).toBe(true)
    expect(state.policy).toBe('guided-freedom')
    expect(state.readyRequired.map((chamber) => chamber.id)).toEqual(['tutorial'])
    expect(state.readyOptional).toEqual([])
    expect(state.queued.map((chamber) => chamber.id)).toEqual(['direction', 'binaural', 'pitch'])
    expect(state.seasonOneOptional.map((chamber) => chamber.id)).toContain('graft')
    expect(state.text).toContain('Opening atlas freedom: guided-freedom')
    expect(state.text).toContain('unlock broader choice after restored systems come online')
  })

  it('audits end-to-end campaign progression from tutorial to heart', () => {
    const state = endToEndProgressionState(chambers, createDefaultSave())

    expect(state.ready).toBe(true)
    expect(state.mainPath[0].id).toBe('tutorial')
    expect(state.mainPath.at(-1).id).toBe('heart-atria')
    expect(state.mainPath.map((chamber) => chamber.id)).toContain('finale')
    expect(state.blockedMain).toEqual([])
    expect(state.finaleReachable).toBe(true)
    expect(state.heartReachable).toBe(true)
    expect(state.postgameReachable).toBe(true)
    expect(state.nextLive.id).toBe('tutorial')
    expect(state.text).toContain('End-to-end progression ready')
  })

  it('audits accessible menu surfaces and gated postgame menus', () => {
    const locked = allMenusAccessibleState(createDefaultSave())
    const unlocked = allMenusAccessibleState({ ...createDefaultSave(), postgameUnlocked: true })

    expect(locked.ready).toBe(true)
    expect(locked.readyMenus).toHaveLength(9)
    expect(locked.menus.map((menu) => menu.id)).toEqual(['main', 'pause', 'atlas', 'library', 'grafting', 'materials', 'codex', 'settings', 'manual', 'conservatory', 'ending'])
    expect(locked.menus.find((menu) => menu.id === 'conservatory').gated).toBe(true)
    expect(locked.text).toContain('All menus accessible')
    expect(locked.text).toContain('gated postgame menu')
    expect(unlocked.readyMenus).toHaveLength(11)
  })

  it('audits the complete in-game manual coverage', () => {
    const state = manualCompleteState()

    expect(state.ready).toBe(true)
    expect(state.sections).toHaveLength(10)
    expect(state.sections.map((section) => section.id)).toEqual([
      'sound-play',
      'no-vision-reference',
      'functions-menus',
      'atlas-planning',
      'seed-library',
      'codex',
      'settings-accessibility',
      'materials',
      'chamber-guide',
      'endings-postgame',
    ])
    expect(state.text).toContain('Manual complete')
    expect(state.text).toContain('postgame')
  })

  it('audits simulated screen reader testing routes without overclaiming real AT validation', () => {
    const state = screenReaderTestingState()

    expect(state.ready).toBe(true)
    expect(state.routes).toHaveLength(6)
    expect(state.routes.map((route) => route.mode)).toEqual([
      'tab navigation',
      'reading order',
      'heading navigation',
      'form navigation',
      'live region review',
      'keyboard command route',
    ])
    expect(state.text).toContain('Screen reader testing pass ready')
    expect(state.text).toContain('real NVDA, JAWS, Narrator, or VoiceOver validation remains recommended')
  })

  it('audits e2e coverage for key flows', () => {
    const state = e2eKeyFlowCoverageState()

    expect(state.ready).toBe(true)
    expect(state.flows.map((flow) => flow.id)).toEqual([
      'new-game',
      'no-vision-restore',
      'settings-accessibility',
      'scan-modes',
      'seed-graft',
      'atlas-codex',
      'save-load',
      'postgame',
    ])
    expect(state.text).toContain('E2E key-flow coverage ready')
    expect(state.text).toContain('save/load')
  })

  it('audits the performance pass against static payload budgets', () => {
    const state = performancePassState({
      authoredChambers: chambers.length,
      codexRecords: Object.keys(codexRecords).length,
      cssBytes: 3000,
      jsBytes: 560000,
      totalBytes: 570000,
    })

    expect(state.ready).toBe(true)
    expect(state.overBudget).toEqual([])
    expect(state.budgets).toMatchObject({
      cssBytes: 50000,
      jsBytes: 700000,
      totalBytes: 750000,
    })
    expect(state.text).toContain('Performance pass ready')
    expect(state.text).toContain('authored chamber')
  })

  it('tracks packaging and deployment readiness', () => {
    const state = packagingDeploymentState({
      artifacts: { distIndex: true, syngenRuntime: true },
      electron: { loadsDist: true, main: true, preload: true },
      scripts: { build: true, preview: true, 'check:packaging': true, 'package:electron': true },
    })

    expect(state.ready).toBe(true)
    expect(state.text).toContain('Packaging and deployment ready')

    const incomplete = packagingDeploymentState({
      artifacts: { distIndex: true },
      electron: { loadsDist: false, main: true },
      scripts: { build: true },
    })
    expect(incomplete.ready).toBe(false)
    expect(incomplete.missingScripts).toContain('preview')
    expect(incomplete.missingArtifacts).toContain('dist/vendor/syngen.js')
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

  it('keeps the prototype chamber slice in the 8 to 10 chamber target', () => {
    const slice = milestoneChamberSlice(chambers, 1)

    expect(slice.count).toBeGreaterThanOrEqual(8)
    expect(slice.count).toBeLessThanOrEqual(10)
    expect(slice.training.map((chamber) => chamber.id)).toEqual(['tutorial'])
    expect(slice.required.map((chamber) => chamber.id)).toContain('finale')
    expect(slice.optional.map((chamber) => chamber.id)).toEqual(['harmony', 'graft'])
    expect(slice.inRange).toBe(true)
    expect(slice.text).toContain('8 to 10')
  })

  it('audits the 40 plus main chamber catalog', () => {
    const state = mainChamberCatalogState(chambers)

    expect(state.ready).toBe(true)
    expect(state.count).toBe(40)
    expect(state.required).toHaveLength(24)
    expect(state.optional).toHaveLength(16)
    expect(state.mainChambers.map((chamber) => chamber.id)).not.toContain('tutorial')
    expect(state.mainChambers.map((chamber) => chamber.id)).not.toContain('postgame-conservatory')
    expect(state.seasons.map((season) => season.chambers.length)).toEqual([10, 8, 8, 9, 5])
    expect(state.text).toContain('40+ main chambers ready')
  })

  it('audits the optional content pass across campaign seasons', () => {
    const state = optionalContentPassState(chambers)

    expect(state.ready).toBe(true)
    expect(state.count).toBe(17)
    expect(state.advanced).toHaveLength(17)
    expect(state.rewarded).toHaveLength(17)
    expect(state.gated).toHaveLength(17)
    expect(state.seasons.map((season) => season.chambers.length)).toEqual([2, 3, 3, 4, 5])
    expect(state.optional.map((chamber) => chamber.id)).toContain('postgame-conservatory')
    expect(state.text).toContain('Optional content pass ready')
  })

  it('stages the Season 1 opening mix with 6 required contracts and 2 optional contracts', () => {
    const mix = seasonOneOpeningContractMix(chambers)

    expect(mix.ready).toBe(true)
    expect(mix.required).toHaveLength(6)
    expect(mix.optional).toHaveLength(2)
    expect(mix.required.map((chamber) => chamber.id)).toEqual(['direction', 'binaural', 'pitch', 'rhythm', 'timbre', 'phase'])
    expect(mix.optional.map((chamber) => chamber.id)).toEqual(['harmony', 'graft'])
    expect(mix.text).toContain('6 required and 2 optional')
  })

  it('replaces the old four-chamber prototype with the Season 1 eight-contract spine', () => {
    const state = seasonOneContractStructureState(chambers)

    expect(state.ready).toBe(true)
    expect(state.required).toHaveLength(8)
    expect(state.required.map((chamber) => chamber.id)).toEqual(['direction', 'binaural', 'pitch', 'rhythm', 'timbre', 'phase', 'mold', 'finale'])
    expect(state.optional.map((chamber) => chamber.id)).toEqual(['harmony', 'graft'])
    expect(state.instantComplete).toEqual([])
    expect(state.chained).toBe(true)
    expect(state.text).toContain('replace the four-chamber prototype')
  })

  it('blocks in Season 2 as a Rootworks-focused season', () => {
    const state = seasonTwoRootworksState(chambers)

    expect(state.ready).toBe(true)
    expect(state.season).toBe(2)
    expect(state.rootworks.length).toBeGreaterThanOrEqual(6)
    expect(state.required.map((chamber) => chamber.id)).toEqual(expect.arrayContaining(['root-reservoir', 'root-choir', 'mycelium-gate', 'nutrient-lattice']))
    expect(state.optional.map((chamber) => chamber.id)).toEqual(expect.arrayContaining(['optional-root-echo', 'optional-deep-root']))
    expect(state.text).toContain('Season 2 Rootworks ready')
  })

  it('blocks in all five authored campaign seasons', () => {
    const state = allFiveSeasonsBlockedInState(chambers)

    expect(state.ready).toBe(true)
    expect(state.seasons).toHaveLength(5)
    expect(state.seasons.every((season) => season.blockedIn)).toBe(true)
    expect(state.seasons.map((season) => season.id)).toEqual([1, 2, 3, 4, 5])
    expect(state.seasons.map((season) => season.playable.length)).toEqual([10, 8, 8, 9, 6])
    expect(state.seasons.find((season) => season.id === 5).systems).toEqual(['Verdancy Heart'])
    expect(state.text).toContain('All five seasons blocked in')
    expect(state.text).toContain('Season 5 Verdancy Heart has 6 playable')
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

  it('reports alternate ending path availability', () => {
    const save = createDefaultSave()
    save.restorationPhilosophy = 'adaptation'
    save.solvedChambers = ['optional-heart-root', 'optional-heart-memory']
    save.ratings = { tutorial: 'Stable' }

    const endings = alternateEndingPaths(save)

    expect(endings.availableIds).toEqual(['preservation', 'adaptation', 'release', 'conservatory'])
    expect(endings.paths.find((path) => path.id === 'release').text).toContain('available')
    expect(alternateEndingPaths(createDefaultSave()).paths.find((path) => path.id === 'release').text).toContain('locked')
  })

  it('tracks first playable endings after finale completion', () => {
    const locked = firstEndingsState(createDefaultSave())
    expect(locked.ready).toBe(false)
    expect(locked.text).toContain('First endings locked')

    const save = {
      ...createDefaultSave(),
      endgameResolution: 'conservatory',
      postgameUnlocked: true,
      solvedChambers: ['finale', 'optional-heart-memory'],
    }
    const state = firstEndingsState(save)
    expect(state.ready).toBe(true)
    expect(state.authoredCount).toBe(4)
    expect(state.selected).toBe('conservatory')
    expect(state.playable.map((ending) => ending.id)).toEqual(['conservatory'])
    expect(state.availableIds).toContain('conservatory')
    expect(state.text).toContain('First endings ready: Conservatory is playable now')
  })

  it('answers whether the Ark should return to its original mission from restoration evidence', () => {
    const preservation = createDefaultSave()
    preservation.ratings = { tutorial: 'Stable', direction: 'Resonant' }
    const adaptation = createDefaultSave()
    adaptation.restorationPhilosophy = 'adaptation'
    adaptation.customSeeds = [createSeedDNA('hybrid-question')]
    const release = createDefaultSave()
    release.solvedChambers = ['optional-heart-root']

    expect(originalMissionQuestionState(preservation).stance).toBe('return')
    expect(originalMissionQuestionState(adaptation).stance).toBe('revise')
    expect(originalMissionQuestionState(release).stance).toBe('release')
    expect(originalMissionQuestionState(createDefaultSave()).text).toContain('Original mission question')
  })

  it('answers whether the restored ecology should be preserved or adapted', () => {
    const preservation = createDefaultSave()
    preservation.ratings = { tutorial: 'Stable', direction: 'Resonant' }
    const adaptation = createDefaultSave()
    adaptation.restorationPhilosophy = 'adaptation'
    adaptation.customSeeds = [createSeedDNA('hybrid-question')]
    adaptation.unlockedGraftMechanics = ['hybrid resonance planting']
    const balanced = createDefaultSave()
    balanced.ratings = { tutorial: 'Stable' }
    balanced.unlockedGraftMechanics = ['hybrid resonance planting']
    const release = createDefaultSave()
    release.solvedChambers = ['optional-heart-root']

    expect(restoredEcologyQuestionState(preservation).stance).toBe('preserve')
    expect(restoredEcologyQuestionState(adaptation).stance).toBe('adapt')
    expect(restoredEcologyQuestionState(balanced).stance).toBe('balance')
    expect(restoredEcologyQuestionState(release).stance).toBe('defer-to-release')
    expect(restoredEcologyQuestionState(createDefaultSave()).text).toContain('Restored ecology question')
  })

  it('answers whether the player is restoring a machine garden or living instrument', () => {
    const machine = createDefaultSave()
    machine.restoredSystems = ['Intake', 'Navigation']
    machine.ratings = { tutorial: 'Stable' }
    const garden = createDefaultSave()
    garden.solvedChambers = ['tutorial', 'direction']
    garden.codexIds = ['plant-memory-01', 'seed-ancestry-01']
    const instrument = createDefaultSave()
    instrument.codexIds = ['crew-message-12', 'perception-02']
    instrument.unlockedGraftMechanics = ['hybrid resonance planting']

    expect(restorationIdentityQuestionState(createDefaultSave()).role).toBe('undecided')
    expect(restorationIdentityQuestionState(machine).role).toBe('machine')
    expect(restorationIdentityQuestionState(garden).role).toBe('garden')
    expect(restorationIdentityQuestionState(instrument).role).toBe('living-instrument')
    expect(restorationIdentityQuestionState(instrument).text).toContain('Restoration identity question')
  })

  it('answers whether the player is human gardener crew or Ark caretaker intelligence', () => {
    const early = playerRoleQuestionState(createDefaultSave())
    const evidenced = createDefaultSave()
    evidenced.codexIds = ['story-payoff-01', 'crew-message-10', 'gardener-note-01', 'crew-message-07']
    evidenced.restoredSystems = ['Intake']
    const state = playerRoleQuestionState(evidenced)

    expect(early.role).toBe('ark-caretaker-intelligence')
    expect(state.role).toBe('ark-caretaker-intelligence')
    expect(state.candidates.find((candidate) => candidate.id === 'ark-caretaker-intelligence').selected).toBe(true)
    expect(state.candidates.find((candidate) => candidate.id === 'human-gardener').selected).toBe(false)
    expect(state.candidates.find((candidate) => candidate.id === 'awakened-crew-member').selected).toBe(false)
    expect(state.text).toContain('Player role question: Ark caretaker intelligence')
    expect(state.text).toContain('not waking as crew')
  })

  it('tracks the preservation path for restoring the Ark as designed', () => {
    const recovering = createDefaultSave()
    recovering.ratings = { tutorial: 'Stable', direction: 'Resonant' }
    recovering.restoredSystems = ['Intake', 'Navigation']
    const strained = createDefaultSave()
    strained.ratings = { tutorial: 'Stable' }
    strained.unlockedGraftMechanics = ['hybrid resonance planting', 'FM pressure grafting']
    const designed = createDefaultSave()
    designed.restoredSystems = ['Intake', 'Navigation', 'Water', 'Canopy', 'Memory', 'Heart']
    designed.ratings = { tutorial: 'Stable', direction: 'Resonant', pitch: 'Stable' }
    designed.solvedChambers = ['heart-atria']

    expect(preservationPathState(createDefaultSave()).stage).toBe('foundation')
    expect(preservationPathState(recovering).stage).toBe('recovering-design')
    expect(preservationPathState(strained).stage).toBe('strained')
    expect(preservationPathState(designed).stage).toBe('as-designed')
    expect(preservationPathState(recovering).text).toContain('Preservation path')
  })

  it('tracks the adaptation path for evolving the Ark for a new world', () => {
    const experimental = createDefaultSave()
    experimental.customSeeds = [createSeedDNA('hybrid-question')]
    const evolving = createDefaultSave()
    evolving.restorationPhilosophy = 'adaptation'
    evolving.unlockedGraftMechanics = ['hybrid resonance planting']
    const newWorld = createDefaultSave()
    newWorld.restorationPhilosophy = 'adaptation'
    newWorld.solvedChambers = ['optional-heart-graft']
    newWorld.unlockedGraftMechanics = ['hybrid resonance planting', 'FM pressure grafting']
    newWorld.customSeeds = [createSeedDNA('hybrid-question')]

    expect(adaptationPathState(createDefaultSave()).stage).toBe('dormant')
    expect(adaptationPathState(experimental).stage).toBe('experimental')
    expect(adaptationPathState(evolving).stage).toBe('evolving')
    expect(adaptationPathState(newWorld).stage).toBe('new-world')
    expect(adaptationPathState(newWorld).text).toContain('Adaptation path')
  })

  it('recovers ending reflections for each finale resolution path', () => {
    const resolutionIds = endgameResolutions.map((resolution) => resolution.id)
    const reflectionIds = resolutionIds.flatMap((resolution) => endingResolutionReflectionRewards({ ...createDefaultSave(), endgameResolution: resolution }).recordIds)
    const merged = mergeEndingResolutionReflections({ ...createDefaultSave(), endgameResolution: 'preservation' })
    const trees = codexRecordTrees(codexRecords, merged.codexIds)
    const reflectionTree = trees.find((tree) => tree.id === 'ending-reflections')

    expect([...new Set(reflectionIds)].sort()).toEqual(Array.from({ length: 8 }, (_, index) => `ending-reflection-${String(index + 1).padStart(2, '0')}`))
    expect(endingResolutionReflectionRewards({ ...createDefaultSave(), endgameResolution: 'release' }).recordIds).toContain('ending-reflection-03')
    expect(merged.codexIds).toEqual(expect.arrayContaining(['ending-reflection-01', 'ending-reflection-05', 'ending-reflection-07', 'ending-reflection-08']))
    expect(reflectionTree.records.map((record) => record.title)).toContain('Ending Reflection 01')
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

  it('answers whether the sleeping crew should be awakened unchanged', () => {
    expect(crewAwakeningQuestionState(createDefaultSave()).stance).toBe('not-ready')
    expect(crewAwakeningQuestionState({ ...createDefaultSave(), solvedChambers: ['heart-atria'] }).stance).toBe('unchanged')
    expect(crewAwakeningQuestionState({ ...createDefaultSave(), solvedChambers: ['heart-atria', 'optional-heart-memory'] }).stance).toBe('consent-first')
    expect(crewAwakeningQuestionState({ ...createDefaultSave(), restorationPhilosophy: 'adaptation', solvedChambers: ['heart-atria'] }).stance).toBe('changed-context')
    expect(crewAwakeningQuestionState({ ...createDefaultSave(), solvedChambers: ['optional-heart-root', 'finale'], endgameResolution: 'release' }).stance).toBe('defer')
  })

  it('models launch garden readiness for the release path', () => {
    expect(launchGardenStages.map((stage) => stage.id)).toEqual(['sealed', 'preparing', 'armed', 'launched'])
    expect(launchGardenSummary(createDefaultSave()).stageId).toBe('sealed')
    expect(launchGardenSummary({ ...createDefaultSave(), solvedChambers: ['heart-atria'] }).stageId).toBe('preparing')
    expect(launchGardenSummary({ ...createDefaultSave(), solvedChambers: ['heart-atria', 'optional-heart-root'] }).stageId).toBe('armed')
    expect(launchGardenSummary({ ...createDefaultSave(), solvedChambers: ['optional-heart-root', 'finale'], postgameUnlocked: true }).stageId).toBe('launched')
  })

  it('tracks the release path for dispersing seed libraries instead of waking the crew', () => {
    const catalogued = createDefaultSave()
    catalogued.codexIds = ['plant-memory-01', 'seed-ancestry-01', 'plant-memory-02', 'seed-ancestry-02']
    const armed = createDefaultSave()
    armed.solvedChambers = ['optional-heart-root']
    const dispersed = createDefaultSave()
    dispersed.solvedChambers = ['optional-heart-root', 'finale']
    dispersed.endgameResolution = 'release'
    dispersed.postgameUnlocked = true

    expect(releasePathState(createDefaultSave()).stage).toBe('sealed')
    expect(releasePathState(catalogued).stage).toBe('catalogued')
    expect(releasePathState(armed)).toMatchObject({ stage: 'armed', crewWakeDeferred: true })
    expect(releasePathState(dispersed)).toMatchObject({ stage: 'dispersed', resolutionSelected: true })
    expect(releasePathState(dispersed).text).toContain('Release path')
  })

  it('tracks the conservatory path for keeping the Ark as a living musical archive', () => {
    const cataloguing = createDefaultSave()
    cataloguing.codexIds = ['first-breath']
    const open = createDefaultSave()
    open.codexIds = Array.from({ length: 20 }, (_, index) => `record-${index}`)
    const archive = createDefaultSave()
    archive.endgameResolution = 'conservatory'
    archive.postgameUnlocked = true
    archive.conservatoryCompositions = [{ id: 'composition-1' }]

    expect(conservatoryPathState(createDefaultSave()).stage).toBe('sealed')
    expect(conservatoryPathState(cataloguing).stage).toBe('cataloguing')
    expect(conservatoryPathState(open).stage).toBe('open')
    expect(conservatoryPathState(archive)).toMatchObject({ stage: 'living-archive', resolutionSelected: true })
    expect(conservatoryPathState(archive).text).toContain('Conservatory path')
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

    const snapshot = conservatoryCompositionSnapshot(save, inventory, 'network')
    expect(snapshot).toMatchObject({
      unlocked: true,
      voiceCount: 2,
    })
    expect(snapshot.id).toBe('composition-network-sol-compose-voice-lumen-compose-voice')
    expect(snapshot.text).toContain('Conservatory composition saved: Network Braid')
  })

  it('keeps codex records and perceptions in the 80 to 120 band', () => {
    const records = Object.values(codexRecords)
    expect(records.length).toBeGreaterThanOrEqual(80)
    expect(records.length).toBeLessThanOrEqual(120)
    expect(records.every((record) => record.title && record.text)).toBe(true)
  })

  it('audits complete codex authorship, rewards, and trees', () => {
    const state = codexCompleteState(chambers, codexRecords)

    expect(state.ready).toBe(true)
    expect(state.recordCount).toBe(96)
    expect(state.inRange).toBe(true)
    expect(state.missingRewardIds).toEqual([])
    expect(state.trees.map((tree) => tree.id)).toEqual([
      'gardener-notes',
      'crew-messages',
      'plant-memory',
      'system-diagnostics',
      'seed-ancestry',
      'ending-reflections',
      'perceptions',
      'story-payoffs',
      'restoration-records',
    ])
    expect(state.treeRecordCount).toBe(96)
    expect(state.text).toContain('Codex complete ready')
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

  it('rewards story payoff records and summarizes recovered arc evidence', () => {
    const expectedPayoffs = Array.from({ length: 8 }, (_, index) => `story-payoff-${String(index + 1).padStart(2, '0')}`)
    const rewardedPayoffs = chambers.flatMap((chamber) => chamber.rewards?.codex ?? []).filter((id) => id.startsWith('story-payoff'))
    const save = createDefaultSave()
    save.codexIds = ['story-payoff-01', 'story-payoff-02']
    const state = codexStoryPayoffState(save, codexRecords)
    const trees = codexRecordTrees(codexRecords, save.codexIds)
    const payoffTree = trees.find((tree) => tree.id === 'story-payoffs')

    expect(rewardedPayoffs).toHaveLength(expectedPayoffs.length)
    expect([...new Set(rewardedPayoffs)].sort()).toEqual(expectedPayoffs)
    expect(expectedPayoffs.every((id) => codexRecords[id])).toBe(true)
    expect(state.unlockedCount).toBe(2)
    expect(state.text).toContain('Story payoff: 2 of 8 arc record')
    expect(state.entries[0].text).toContain('Ark caretaker')
    expect(state.next.recordId).toBe('story-payoff-03')
    expect(payoffTree.records.map((record) => record.title)).toEqual(['Story Payoff 01', 'Story Payoff 02'])
  })

  it('rewards every authored crew message through campaign chamber solves', () => {
    const expectedMessages = Array.from({ length: 12 }, (_, index) => `crew-message-${String(index + 1).padStart(2, '0')}`)
    const rewardedMessages = chambers.flatMap((chamber) => chamber.rewards?.codex ?? []).filter((id) => id.startsWith('crew-message'))
    const rewardedMessageSet = new Set(rewardedMessages)
    const intakeSave = mergeRewards(createDefaultSave(), chambers.find((chamber) => chamber.id === 'direction'), 'Stable')
    const intakeTrees = codexRecordTrees(codexRecords, intakeSave.codexIds)
    const crewTree = intakeTrees.find((tree) => tree.id === 'crew-messages')

    expect(rewardedMessages).toHaveLength(expectedMessages.length)
    expect([...rewardedMessageSet].sort()).toEqual(expectedMessages)
    expect(expectedMessages.every((id) => codexRecords[id])).toBe(true)
    expect(crewTree.records.map((record) => record.title)).toContain('Crew Message 01')
  })

  it('rewards every authored plant memory through campaign chamber solves', () => {
    const expectedMemories = Array.from({ length: 12 }, (_, index) => `plant-memory-${String(index + 1).padStart(2, '0')}`)
    const rewardedMemories = chambers.flatMap((chamber) => chamber.rewards?.codex ?? []).filter((id) => id.startsWith('plant-memory'))
    const rewardedMemorySet = new Set(rewardedMemories)
    const tutorialSave = mergeRewards(createDefaultSave(), chambers.find((chamber) => chamber.id === 'tutorial'), 'Stable')
    const tutorialTrees = codexRecordTrees(codexRecords, tutorialSave.codexIds)
    const plantMemoryTree = tutorialTrees.find((tree) => tree.id === 'plant-memory')

    expect(rewardedMemories).toHaveLength(expectedMemories.length)
    expect([...rewardedMemorySet].sort()).toEqual(expectedMemories)
    expect(expectedMemories.every((id) => codexRecords[id])).toBe(true)
    expect(plantMemoryTree.records.map((record) => record.title)).toContain('Plant Memory 01')
  })

  it('rewards every authored system diagnostic through campaign chamber solves', () => {
    const expectedDiagnostics = Array.from({ length: 12 }, (_, index) => `system-diagnostic-${String(index + 1).padStart(2, '0')}`)
    const rewardedDiagnostics = chambers.flatMap((chamber) => chamber.rewards?.codex ?? []).filter((id) => id.startsWith('system-diagnostic'))
    const rewardedDiagnosticSet = new Set(rewardedDiagnostics)
    const intakeSave = mergeRewards(createDefaultSave(), chambers.find((chamber) => chamber.id === 'direction'), 'Stable')
    const intakeTrees = codexRecordTrees(codexRecords, intakeSave.codexIds)
    const diagnosticTree = intakeTrees.find((tree) => tree.id === 'system-diagnostics')

    expect(rewardedDiagnostics).toHaveLength(expectedDiagnostics.length)
    expect([...rewardedDiagnosticSet].sort()).toEqual(expectedDiagnostics)
    expect(expectedDiagnostics.every((id) => codexRecords[id])).toBe(true)
    expect(diagnosticTree.records.map((record) => record.title)).toContain('System Diagnostic 01')
  })

  it('rewards every authored seed ancestry record through campaign chamber solves', () => {
    const expectedAncestries = Array.from({ length: 10 }, (_, index) => `seed-ancestry-${String(index + 1).padStart(2, '0')}`)
    const rewardedAncestries = chambers.flatMap((chamber) => chamber.rewards?.codex ?? []).filter((id) => id.startsWith('seed-ancestry'))
    const rewardedAncestrySet = new Set(rewardedAncestries)
    const tutorialSave = mergeRewards(createDefaultSave(), chambers.find((chamber) => chamber.id === 'tutorial'), 'Stable')
    const tutorialTrees = codexRecordTrees(codexRecords, tutorialSave.codexIds)
    const ancestryTree = tutorialTrees.find((tree) => tree.id === 'seed-ancestry')

    expect(rewardedAncestries).toHaveLength(expectedAncestries.length)
    expect([...rewardedAncestrySet].sort()).toEqual(expectedAncestries)
    expect(expectedAncestries.every((id) => codexRecords[id])).toBe(true)
    expect(ancestryTree.records.map((record) => record.title)).toContain('Seed Ancestry 01')
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

  it('teaches one new axis at a time before finale combinations', () => {
    const earlyContracts = ['tutorial', 'direction', 'binaural', 'pitch', 'rhythm', 'timbre']
      .map((id) => chambers.find((chamber) => chamber.id === id))
    const finale = chambers.find((chamber) => chamber.id === 'finale')

    expect(earlyContracts.every((contract) => teachingAxisSummary(contract).newAxisCount === 1)).toBe(true)
    expect(teachingAxisSummary(chambers.find((chamber) => chamber.id === 'tutorial')).axis).toBe('chamber heart scan')
    expect(teachingAxisSummary(finale)).toMatchObject({ combinesMasteredAxes: true, newAxisCount: 0 })
    expect(teachingAxisSummary(earlyContracts[1]).text).toContain('introduces one new axis')
  })

  it('combines axes only after prerequisite mastery', () => {
    const harmony = chambers.find((chamber) => chamber.id === 'harmony')
    const finale = chambers.find((chamber) => chamber.id === 'finale')
    const locked = createDefaultSave()
    locked.solvedChambers = ['rhythm']
    locked.ratings = { rhythm: 'Restored' }
    const ready = createDefaultSave()
    ready.solvedChambers = ['pitch', 'mold']
    ready.ratings = { pitch: 'Stable', mold: 'Resonant' }

    expect(axisCombinationMasterySummary(chambers.find((chamber) => chamber.id === 'direction'), ready).combinesAxes).toBe(false)
    expect(axisCombinationMasterySummary(harmony, locked)).toMatchObject({ combinesAxes: true, ready: false, masteredCount: 0 })
    expect(axisCombinationMasterySummary(harmony, ready)).toMatchObject({ combinesAxes: true, ready: true, masteredCount: 1 })
    expect(axisCombinationMasterySummary(finale, ready)).toMatchObject({ combinesAxes: true, ready: true, masteredCount: 1 })
    expect(axisCombinationMasterySummary(harmony, ready).text).toContain('Axis combination mastery: ready')
  })

  it('allows optional chambers to carry richer complexity than the required path', () => {
    const required = chambers.find((chamber) => chamber.id === 'direction')
    const optional = chambers.find((chamber) => chamber.id === 'harmony')
    const optionalGraft = chambers.find((chamber) => chamber.id === 'graft')

    expect(optionalComplexitySummary(required)).toMatchObject({
      optional: false,
      status: 'main-path',
      markers: [],
    })
    expect(optionalComplexitySummary(required).text).toContain('keeps complexity on the required campaign path')
    expect(optionalComplexitySummary(optional)).toMatchObject({
      optional: true,
      status: 'expanded optional',
    })
    expect(optionalComplexitySummary(optional).markers).toEqual(expect.arrayContaining(['multi-seed planting', 'multi-position pattern', 'harmonic relationship']))
    expect(optionalComplexitySummary(optional).text).toContain('may be more complex without blocking the campaign')
    expect(optionalComplexitySummary(optionalGraft).markers).toContain('graft requirement')
    expect(chambers.filter((chamber) => chamber.optional).every((chamber) => estimatedDifficulty(chamber) === 'advanced' || estimatedDifficulty(chamber) === 'endgame')).toBe(true)
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
    expect(appraisal.rareHunting.text).toContain('Rare seed hunting')
    expect(appraisal.graftCatalog.text).toContain('Graft catalog completion')
    expect(appraisal.restorationUse).toContain('Exchange 2 biomass')
    expect(appraisal.commerceBoundary).toContain('restoration support')
  })

  it('tracks seed library menu responsibilities for no-vision graft planning', () => {
    const inventory = [
      createSeedDNA('sol', { family: 'Sol', name: 'Sol phonoseed' }),
      createSeedDNA('lumen', { family: 'Lumen', name: 'Lumen phonoseed' }),
    ]
    const state = seedLibraryMenuState(inventory, createDefaultSave(), 0)

    expect(state.ready).toBe(true)
    expect(state.selectedSeed.name).toBe('Sol phonoseed')
    expect(state.preview.text).toContain('Audio preview')
    expect(state.sections.map((section) => section.id)).toEqual([
      'materials-ledger',
      'collection-appraisal',
      'selected-seed-dna',
      'grafting-bench',
      'family-catalog',
      'caption-actions',
    ])
    expect(state.actions).toContain('preview selected seed')
    expect(state.text).toContain('Seed library menu ready')
  })

  it('tracks graft catalog completion from discovered pairings and graft records', () => {
    const summary = graftCatalogCompletionState({
      graftDiscoveryIds: ['sol-lumen'],
      graftRecords: [{ id: 'graft-record-sol-umbra' }],
    })

    expect(summary).toMatchObject({
      complete: false,
      discoveredCount: 2,
      remainingCount: 274,
      total: 276,
    })
    expect(summary.discoveredIds).toEqual(['sol-lumen', 'sol-umbra'])
    expect(summary.nextDiscovery).toMatchObject({ families: ['Sol', 'Spire'] })
    expect(summary.text).toContain('2 of 276 discoveries recorded')
  })

  it('tracks rare seed hunting leads from the collection', () => {
    const inventory = [
      createSeedDNA('prism-shard', { family: 'Prism' }),
      createSeedDNA('loam-memory', { family: 'Loam' }),
    ]
    const hunting = rareSeedHuntingState(inventory, { rareSeedIds: ['resin'] })

    expect(hunting).toMatchObject({
      complete: false,
      foundCount: 3,
      total: 12,
    })
    expect(hunting.foundFamilies).toEqual(['Prism', 'Loam', 'Resin'])
    expect(hunting.missingFamilies).toContain('Pollen')
    expect(hunting.nextLead).toMatchObject({ name: 'Pollen', origin: 'Rain return' })
    expect(hunting.text).toContain('next lead Pollen from Rain return')
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

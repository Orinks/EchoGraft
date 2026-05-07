import { describe, expect, it } from 'vitest'
import { campaignScope, chambers, codexRecords, majorArkSystems, solveTimeText } from '../src/content/chambers.js'
import { chooseEndgameResolution, endgameResolutions } from '../src/content/endings.js'
import { availableChambers, decisionSummary, evaluateResonance, firstFullCampaignEstimate, mergeRewards, restorationPlanningSession, restorationRating, seedCollectionAppraisal, stewardshipSummary, unlockNext } from '../src/content/resonance.js'
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
      const ideal = createSeedDNA(`${chamber.id}-ideal`, {
        pitchRatio: chamber.target.pitchRatio,
        pulseRate: chamber.target.pulseRate,
        brightness: chamber.target.brightness,
        phase: chamber.target.phase,
        position: chamber.target,
        grafted: chamber.requiresGraft,
      })
      const planted = Array.from({ length: chamber.requiredSeeds }, () => ideal)
      expect(evaluateResonance(chamber, planted).solved, chamber.id).toBe(true)
    }
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
    expect(chooseEndgameResolution({ ...createDefaultSave(), solvedChambers: ['optional-heart-graft'] }).id).toBe('adaptation')
    expect(chooseEndgameResolution({ ...createDefaultSave(), solvedChambers: ['optional-heart-root'] }).id).toBe('release')
    expect(chooseEndgameResolution({ ...createDefaultSave(), solvedChambers: ['optional-heart-memory'] }).id).toBe('conservatory')
  })

  it('keeps codex records and perceptions in the 80 to 120 band', () => {
    const records = Object.values(codexRecords)
    expect(records.length).toBeGreaterThanOrEqual(80)
    expect(records.length).toBeLessThanOrEqual(120)
    expect(records.every((record) => record.title && record.text)).toBe(true)
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
    expect(canopy.rewards.codex).toContain('canopy-pulse')
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

  it('summarizes available decisions without hiding optional work', () => {
    const summary = decisionSummary(chambers, ['tutorial', 'direction', 'binaural', 'pitch'])
    expect(summary.requiredChoices).toContain('Contract 4: Canopy Pulse Trellis')
    expect(summary.optionalChoices).toContain('Optional Contract: Twin Roots')
    expect(summary.recommendation).toBe('Contract 4: Canopy Pulse Trellis')
  })
})

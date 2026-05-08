import { AudioEngine } from '../engine/audio.js'
import { createSyngenInputPoller, syngenInputSnapshot } from '../engine/input.js'
import { createSyngenStateBridge } from '../engine/runtime-state.js'
import { campaignScope, chamberCycleState, chambers, chamberSeeds, codexRecords, codexRecordTrees, conservatoryContractSummary, contractRequirementStatus, emergencyContractSummary, estimatedDifficulty, finaleContractSummary, knownHazardsSummary, majorArkSystems, researchContractSummary, restorationContractSummary, rewardSummary, solveTimeText, stabilizationContractSummary, weatherWindowState } from '../content/chambers.js'
import { chooseEndgameResolution, crewWakeCycleSummary, endingResolutionReflectionRewards, endgameResolutions, launchGardenSummary, mergeEndingResolutionReflections, resolutionSpecificEnding, restorationPhilosophies } from '../content/endings.js'
import { seedCarryLimit, seedCarryState, seedCarryText } from '../content/inventory.js'
import { createEventLog } from '../content/log.js'
import { plantedSeed, plantingAssessment } from '../content/planting.js'
import { createPlayer, movePlayer, movementFeedback, rotatePlayer, waterRoutedChamber } from '../content/player.js'
import { availableChambers, canopyDoorState, centralHeartSummary, codexCompletionState, codexRecoverySummary, decisionSummary, dreamCompostSummary, embersapEndgameMutationState, evaluateResonance, finalEcologyPhilosophySummary, firstFullCampaignEstimate, freeCompositionConservatory, heartNetworkEndingState, memoryCodexEchoState, mergeRewards, multiChamberResonanceNetwork, navigationAtlasState, optionalRecordRecoverySummary, optionalReturnContracts, playerBuiltFinalChord, pollinatorVaultSummary, resourceEfficiencySummary, restorationOutcomeSummary, restorationPlanningSession, restorationRating, seedCollectionAppraisal, seedMoveSummary, stewardshipSummary, waterRootRoutingState } from '../content/resonance.js'
import { boundaryScanState, chamberCompassCue, hazardScanState, heartScanState, memoryScanState, navigationScanState, networkScanState, scanPulse, scanRangeState, seedScanState } from '../content/scan.js'
import { setProceduralSeed } from '../content/rng.js'
import { clearSave, createDefaultSave, defaultKeyboardBindings, loadSave, saveGame } from '../content/save.js'
import { archiveLoamHiddenAncestryState, canopyBrightnessTuningState, glassPollenUnlockedTraits, graftDiscoveryCatalog, graftSeedsWithReport, historicalSeedTraitState, lockSeedTrait, resinTraitLockState, seedAudioPreview, seedBrightnessState, seedDiscoveredOriginState, seedEcologicalAffinityState, seedEnvelopeState, seedFamilies, seedFamilyState, seedGraftAncestryState, seedGrowthBehaviorState, seedLineageText, seedLockedTraits, seedModulationProfileState, seedNameState, seedNoiseProfileState, seedPhaseState, seedPitchRatioState, seedPulseRateState, seedSynthTypeState, seedWaveformState, sporeTuningCurrencyState, tuneSeedWithReport, tuningLabel, tuningParameters, tuningValue } from '../content/seeds.js'

const app = document.querySelector('#app')
const eventLog = createEventLog()
let save = loadSave()
setProceduralSeed(save.proceduralSeed)
let audio = new AudioEngine(save.settings)
let screen = 'splash'
let chamber = chambers.find((item) => item.id === save.currentChamberId) ?? chambers[0]
let player = createPlayer(chamber.start)
let inventory = buildInventory()
let selectedSeedIndex = 0
let tuningIndex = 0
let scanMode = 'objective'
let conservatoryMode = 'balanced'
let plantedSeeds = loadPlanted(chamber.id)
let lastResult = evaluateResonance(chamber, plantedSeeds)
const inputPoller = createSyngenInputPoller((intent) => {
  if (screen === 'game' && intent.source === 'gamepad') handleInputIntent(intent)
})
inputPoller.start()
const runtimeState = createSyngenStateBridge({
  exportState: exportRuntimeState,
  importState: importRuntimeState,
  resetState: resetRuntimeState,
})
runtimeState.attach()

const settingLabels = {
  master: 'Master volume',
  ambience: 'Ambience volume',
  music: 'Music volume',
  ui: 'UI volume',
  seeds: 'Seed voice volume',
  hazards: 'Hazard voice volume',
  scans: 'Scan pulse volume',
  reducedMotion: 'Reduced motion',
  minimalVisual: 'Minimal visual mode',
  highContrast: 'High contrast',
  scanVerbosity: 'Scan verbosity',
  textOnlyHints: 'Text-only chamber hints',
}

const keyBindingLabels = {
  moveUp: 'Move up',
  moveDown: 'Move down',
  moveLeft: 'Move left',
  moveRight: 'Move right',
  scan: 'Primary scan',
  plant: 'Plant or interact',
  cycleSeed: 'Cycle seed',
  previousSeed: 'Previous seed',
  cycleScanMode: 'Cycle scan mode',
  tuneDown: 'Tune down',
  tuneUp: 'Tune up',
  graft: 'Graft',
  restoreAdvance: 'Restore or advance',
  objectiveInfo: 'Objective info',
  positionInfo: 'Position info',
  inventoryInfo: 'Inventory info',
  latestLog: 'Latest log',
}

function buildInventory() {
  const base = save.inventoryIds.map((id) => chamberSeeds[id]).filter(Boolean)
  return [...base, ...save.customSeeds]
}

function currentSeed() {
  return seedCarryState(inventory, selectedSeedIndex).selectedSeed
}

function currentCarry() {
  return seedCarryState(inventory, selectedSeedIndex)
}

function currentTuningParameter() {
  return tuningParameters[tuningIndex]
}

function seedDnaText(seed) {
  const locked = seedLockedTraits(seed)
  const lockedText = locked.length ? `Resin locked traits: ${locked.map(tuningLabel).join(', ')}.` : 'Resin locked traits: none.'
  return `${seedNameState(seed).text} ${seedFamilyState(seed).text} ${seedEcologicalAffinityState(seed).text} ${seedDiscoveredOriginState(seed).text} ${seedGraftAncestryState(seed).text} ${seedPitchRatioState(seed, chamber.target.pitchRatio).text} ${seedPulseRateState(seed, chamber.target.pulseRate).text} ${seedBrightnessState(seed, chamber.target.brightness).text} ${seedPhaseState(seed, chamber.target.phase).text} ${seedWaveformState(seed, chamber.timbrePuzzle?.waveforms).text} ${seedSynthTypeState(seed).text} ${seedModulationProfileState(seed).text} ${seedEnvelopeState(seed).text} ${seedNoiseProfileState(seed).text} ${seedGrowthBehaviorState(seed, chamber).text} ${lockedText} ${archiveLoamHiddenAncestryState(seed, save).text} ${seedLineageText(seed)} ${historicalSeedTraitState(seed, save).text}`
}

function loadPlanted(chamberId) {
  return save.plantedByChamber?.[chamberId] ? structuredClone(save.plantedByChamber[chamberId]) : []
}

function unlockedContracts() {
  return availableChambers(chambers, save.solvedChambers)
}

function contractStatus(item) {
  if (save.solvedChambers.includes(item.id)) return save.ratings[item.id] ?? 'Restored'
  if (unlockedContracts().some((contract) => contract.id === item.id)) return 'Available'
  return 'Locked'
}

function restorationProgressText() {
  return `Progress: ${save.solvedChambers.length} of ${chambers.length} contracts restored; ${save.restoredSystems.length} of ${majorArkSystems.length} Ark systems online.`
}

function materialsText() {
  return Object.entries(save.materials).map(([key, value]) => `${key} ${value}`).join(', ')
}

function materialLedgerEntries() {
  const roles = {
    biomass: 'basic restoration growth and repair work',
    crystal: 'bright structural tuning and reflective chambers',
    dreamCompost: 'safer graft experiments and failed-graft recovery',
    embersap: 'endgame mutation choices after Wild restorations',
    glassPollen: 'brightness and timbre inheritance traits',
    memory: 'codex recovery and historical chamber work',
    mycelium: 'graft stability and root network support',
    resin: 'locking seed traits before tuning or grafting',
    spores: 'common tuning currency',
    archiveLoam: 'hidden ancestry and seed lineage reveals',
  }
  return Object.entries(save.materials).map(([key, value]) => ({
    key,
    role: roles[key] ?? 'restoration support',
    value,
  }))
}

function materialLedgerHtml() {
  return `<ul>${materialLedgerEntries().map((item) => `<li>${item.key}: ${item.value}; ${item.role}.</li>`).join('')}</ul>`
}

function captionLogHtml() {
  return `
    <section class="log" aria-label="Caption and event log" aria-live="polite">
      <h2>Caption Log</h2>
      <ol>${eventLog.entries.map((entry) => `<li class="${entry.type}">${entry.message}</li>`).join('')}</ol>
    </section>
  `
}

function availableCodexRecords() {
  return {
    ...codexRecords,
    ...Object.fromEntries((save.graftRecords ?? []).map((record) => [record.id, record])),
  }
}

function materialRewardText(materials = {}) {
  const gathered = Object.entries(materials).filter(([, value]) => value > 0)
  return gathered.map(([key, value]) => `${value} ${key}`).join(', ')
}

function log(message, type = 'info') {
  eventLog.push(message, type)
  render()
}

function persist() {
  save.settings = { ...save.settings }
  save.currentChamberId = chamber.id
  save.customSeeds = inventory.filter((seed) => seed.grafted)
  save.plantedByChamber[chamber.id] = structuredClone(plantedSeeds)
  saveGame(save)
}

function exportRuntimeState() {
  return {
    conservatoryMode,
    player,
    plantedSeeds,
    save,
    scanMode,
    screen,
    selectedSeedIndex,
    tuningIndex,
  }
}

function hydrateRuntimeSave(nextSave = {}) {
  const defaults = createDefaultSave()
  return {
    ...defaults,
    ...nextSave,
    materials: { ...defaults.materials, ...(nextSave.materials ?? {}) },
    settings: { ...defaults.settings, ...(nextSave.settings ?? {}) },
    keyboardBindings: { ...defaults.keyboardBindings, ...(nextSave.keyboardBindings ?? {}) },
  }
}

function importRuntimeState(state = {}) {
  save = hydrateRuntimeSave(state.save)
  setProceduralSeed(save.proceduralSeed)
  audio.setSettings(save.settings)
  chamber = chambers.find((item) => item.id === save.currentChamberId) ?? chambers[0]
  player = state.player ?? createPlayer(chamber.start)
  inventory = buildInventory()
  selectedSeedIndex = state.selectedSeedIndex ?? 0
  tuningIndex = state.tuningIndex ?? 0
  scanMode = state.scanMode ?? 'objective'
  conservatoryMode = state.conservatoryMode ?? 'balanced'
  plantedSeeds = state.plantedSeeds ?? loadPlanted(chamber.id)
  lastResult = evaluateResonance(chamber, plantedSeeds)
  audio.updateListener(player)
  audio.chamber(chamber, plantedSeeds, { restoredSystems: save.restoredSystems, solved: save.solvedChambers.includes(chamber.id) })
  render()
}

function resetRuntimeState() {
  audio.clearSeedObjects()
  save = createDefaultSave()
  setProceduralSeed(save.proceduralSeed)
  audio.setSettings(save.settings)
  chamber = chambers.find((item) => item.id === save.currentChamberId) ?? chambers[0]
  player = createPlayer(chamber.start)
  inventory = buildInventory()
  selectedSeedIndex = 0
  tuningIndex = 0
  scanMode = 'objective'
  conservatoryMode = 'balanced'
  plantedSeeds = loadPlanted(chamber.id)
  lastResult = evaluateResonance(chamber, plantedSeeds)
  screen = 'splash'
  render()
}

function seedMoveCount() {
  return save.seedMovesByChamber?.[chamber.id] ?? 0
}

function recordSeedMove() {
  save.seedMovesByChamber = save.seedMovesByChamber ?? {}
  save.seedMovesByChamber[chamber.id] = seedMoveCount() + 1
}

function startChamber(nextChamber = chamber) {
  chamber = nextChamber
  player = createPlayer(chamber.start)
  plantedSeeds = loadPlanted(chamber.id)
  lastResult = evaluateResonance(chamber, plantedSeeds)
  save.currentChamberId = chamber.id
  persist()
  screen = 'game'
  audio.updateListener(player)
  audio.chamber(chamber, plantedSeeds, { restoredSystems: save.restoredSystems, solved: save.solvedChambers.includes(chamber.id) })
  log(`${chamber.title}. ${chamber.objective}`)
}

async function ensureAudio() {
  const started = await audio.start()
  if (started) audio.ui('confirm')
}

function newGame() {
  clearSave()
  audio.clearSeedObjects()
  save = createDefaultSave()
  setProceduralSeed(save.proceduralSeed)
  audio.setSettings(save.settings)
  inventory = buildInventory()
  selectedSeedIndex = 0
  startChamber(chambers[0])
}

function continueGame() {
  startChamber(chamber)
}

function movement(dx, dy) {
  const previous = player
  const routedChamber = waterRoutedChamber(chamber, save)
  player = movePlayer(player, dx, dy, routedChamber)
  audio.movement(player, previous, routedChamber)
  log(movementFeedback(player, previous, routedChamber).text)
}

function rotate(degrees) {
  player = rotatePlayer(player, degrees)
  audio.updateListener(player)
  const direction = degrees < 0 ? 'left' : 'right'
  log(`Rotated ${direction} to ${player.facing} degrees. Listen ${direction}: chamber audio is reoriented for left/right spatial cues.`)
}

function listen() {
  audio.chamber(chamber, plantedSeeds, { restoredSystems: save.restoredSystems, solved: save.solvedChambers.includes(chamber.id) })
  const planted = plantedSeeds.length ? `${plantedSeeds.length} planted seed voice(s)` : 'no planted seed voices'
  const status = lastResult.solved ? 'restored' : lastResult.accuracy.text
  const cycle = chamberCycleState(chamber, save.arkClock)
  const cycleText = cycle ? ` ${cycle.text}` : ''
  const weatherWindow = weatherWindowState(chamber, save.arkClock)
  const windowText = weatherWindow ? ` ${weatherWindow.text}` : ''
  log(`Listen: ${chamber.title} is ${status}; ${planted}; heart pulse ${chamber.target.pulseRate}, brightness ${chamber.target.brightness}.${cycleText}${windowText}`)
}

function locate() {
  const range = scanRangeState(save)
  const heartScan = heartScanState(player, chamber, range.range)
  const pulse = heartScan.pulse
  audio.scan(player, chamber.target)
  log(`Locate: chamber heart is ${pulse.distance.toFixed(1)} steps away, ${pulse.direction.horizontal}, ${pulse.direction.vertical}. ${heartScan.text}. ${range.text} ${pulse.text}`)
}

function heartShapeText(target) {
  if (Math.abs(target.x) > Math.abs(target.y)) return 'wide lateral heart'
  if (Math.abs(target.y) > Math.abs(target.x)) return 'tall vertical heart'
  return target.x === 0 && target.y === 0 ? 'centered round heart' : 'balanced diagonal heart'
}

function requiredChangesText() {
  return lastResult.missing.length ? lastResult.missing.join(' ') : 'No required changes; resonance is ready for restoration.'
}

function hazardsText() {
  return hazardScanState(chamber, plantedSeeds).text
}

function latestLogText() {
  const entry = eventLog.entries.find((item) => !item.message.startsWith('Latest log entry:'))
  return entry?.message ?? 'No log entries yet.'
}

function recentLogText() {
  const recent = eventLog.entries.slice(0, 6).map((entry, index) => `${index + 1}. ${entry.message}`)
  return recent.length ? `Recent log entries ${recent.length} of ${eventLog.entries.length}: ${recent.join(' | ')}` : 'No log entries yet.'
}

function boundaryInfoText() {
  const boundary = boundaryScanState(player, chamber)
  const returnPulse = scanPulse(player, boundary.safeReturnPoint, chamber)
  return `Boundaries for ${chamber.title ?? chamber.name ?? 'current chamber'}: west ${boundary.edges.west}, east ${boundary.edges.east}, south ${boundary.edges.south}, north ${boundary.edges.north}. Return point ${boundary.safeReturnPoint.x}, ${boundary.safeReturnPoint.y}; ${returnPulse.distance.toFixed(1)} step(s) ${returnPulse.direction.horizontal}, ${returnPulse.direction.vertical}. ${boundary.text}`
}

function plantedVoicesText() {
  const scan = seedScanState(plantedSeeds, chamber)
  return scan.seeds.length
    ? `Planted voices: ${scan.seeds.map((seed) => `${seed.name} at ${seed.position.x}, ${seed.position.y}; persistent ${seed.family} voice; ${seed.tuningState.text} ${seed.spatialRadiusState.text} ${seed.nearbyState.text} ${plantedSeeds.find((item) => item.name === seed.name)?.growthTiming?.text ?? 'Growth timing: not recorded yet. No reflex timing required.'}`).join('; ')}.`
    : 'Planted voices: none in this chamber.'
}

function codexInfoText() {
  const records = availableCodexRecords()
  const recovered = save.codexIds.map((id) => records[id]?.title).filter(Boolean)
  const recovery = codexRecoverySummary(chambers, save)
  const completion = codexCompletionState(save, records)
  const memory = memoryScanState(chamber, save, records)
  const recoveredText = recovered.length ? recovered.join(', ') : 'no records recovered yet'
  return `Codex: ${recoveredText}. Perception updates: ${recovery.text} ${memory.text} ${completion.text}`
}

function controlsText() {
  const bindings = { ...defaultKeyboardBindings, ...(save.keyboardBindings ?? {}) }
  return `Controls: move ${bindings.moveUp}/${bindings.moveDown}/${bindings.moveLeft}/${bindings.moveRight}; scan ${bindings.scan}; scan mode ${bindings.cycleScanMode}; plant/interact/confirm ${bindings.plant}; cycle seeds ${bindings.cycleSeed}; previous seed ${bindings.previousSeed}; tune ${bindings.tuneDown}/${bindings.tuneUp}; Shift cycles tuning parameter; graft ${bindings.graft}; restore or advance ${bindings.restoreAdvance}; objective ${bindings.objectiveInfo}, position ${bindings.positionInfo}, inventory ${bindings.inventoryInfo}, latest log ${bindings.latestLog}, recent log ${bindings.recentLog}, boundaries ${bindings.boundaryInfo}, planted voices ${bindings.plantedVoices}, codex ${bindings.codexInfo}, controls ${bindings.controlsInfo}; reset ${bindings.reset}; help ${bindings.help}; pause ${bindings.pause}. Gamepad: left stick or D-pad moves, south button plants/interacts, east button scans, west button cycles seeds, north button interacts/confirms, shoulder buttons tune, hold either trigger plus D-pad for objective, position, inventory, or latest log, and menu button pauses.`
}

function mainMenuStatusText() {
  return `Current save: ${save.solvedChambers.length} of ${chambers.length} contracts restored; ${save.restoredSystems.length} of ${majorArkSystems.length} Ark systems online. Active work: ${chamber.title ?? 'no active chamber'}.`
}

function atlasStatusText() {
  const available = unlockedContracts()
  const next = available.find((item) => !save.solvedChambers.includes(item.id))
  return `Atlas status: active work ${chamber.title}; next available contract ${next?.title ?? 'none available'}; ${restorationProgressText()}`
}

function settingsStatusText() {
  return `Audio mix: master ${save.settings.master}, ambience ${save.settings.ambience}, music ${save.settings.music}, UI ${save.settings.ui}, seeds ${save.settings.seeds}, hazards ${save.settings.hazards}, scans ${save.settings.scans}. Reduced motion ${save.settings.reducedMotion ? 'on' : 'off'}; minimal visual mode ${save.settings.minimalVisual ? 'on' : 'off'}; high contrast ${save.settings.highContrast ? 'on' : 'off'}; scan verbosity ${save.settings.scanVerbosity}; text-only hints ${save.settings.textOnlyHints ? 'on' : 'off'}.`
}

function graftingBenchText() {
  const parentA = inventory[0]
  const parentB = inventory[1]
  if (!parentA || !parentB) return 'Grafting bench needs two carried seeds before a graft can be attempted.'
  return `Parent A: ${parentA.name}, controls root pitch ${parentA.pitchRatio} and waveform ${parentA.waveform}. Parent B: ${parentB.name}, controls modulation FM ${parentB.fmAmount}, AM ${parentB.amAmount}, noise ${parentB.noiseAmount}, and growth ${parentB.growthBehavior}. Materials: ${materialsText()}.`
}

function positionMeaningText(position) {
  return plantingAssessment(currentSeed(), position, chamber, plantedSeeds).text
}

function scan() {
  const range = scanRangeState(save)
  const navigation = navigationScanState(save)
  const compass = chamberCompassCue(player, chamber.target)
  const heartScan = heartScanState(player, chamber, range.range)
  const pulse = heartScan.pulse
  if (scanMode === 'objective') {
    audio.scan(player, chamber.target)
    if (save.settings.scanVerbosity === 'concise') {
      log(`Objective scan: heart ${pulse.distance.toFixed(1)} steps ${pulse.direction.side}; ${range.text} Required changes: ${requiredChangesText()}`)
    } else {
      log(`Objective scan: heart is ${pulse.distance.toFixed(1)} steps away, ${pulse.direction.side}; ${heartScan.text}. ${range.text} ${navigation.text} ${navigation.navigationOnline ? compass.text : ''} ${pulse.text} shape ${heartShapeText(chamber.target)}. Target traits: pitch ${chamber.target.pitchRatio}, pulse ${chamber.target.pulseRate}, brightness ${chamber.target.brightness}, phase ${chamber.target.phase}. Hazards: ${hazardsText()} Required changes: ${requiredChangesText()}`)
    }
  }
  if (scanMode === 'boundaries') log(boundaryScanState(player, chamber).text)
  if (scanMode === 'seeds') log(seedScanState(plantedSeeds, chamber).text)
  if (scanMode === 'hazards') log(hazardScanState(chamber, plantedSeeds).text)
  if (scanMode === 'memory') log(memoryScanState(chamber, save, availableCodexRecords()).text)
  if (scanMode === 'network') log(networkScanState(multiChamberResonanceNetwork(chambers, save), heartNetworkEndingState(chambers, save), playerBuiltFinalChord(chambers, save, inventory)).text)
}

function textOnlyHintHtml() {
  if (!save.settings.textOnlyHints) return ''
  return `
    <section aria-labelledby="text-hints-title">
      <h2 id="text-hints-title">Text-Only Chamber Hints</h2>
      <p>Hint: ${requiredChangesText()}</p>
      <p>Objective: ${chamber.objective}</p>
    </section>
  `
}

function plantOrPickUp() {
  const existing = plantedSeeds.findIndex((seed) => seed.position.x === player.x && seed.position.y === player.y)
  if (existing >= 0) {
    const [seed] = plantedSeeds.splice(existing, 1)
    recordSeedMove()
    log(`Picked up ${seed.name}.`)
  } else {
    const planted = plantedSeed(currentSeed(), { x: player.x, y: player.y }, chamber, plantedSeeds)
    const seed = planted.seed
    plantedSeeds.push(seed)
    recordSeedMove()
    audio.seed(seed)
    log(`Planted ${seed.name} at ${player.x}, ${player.y}. ${planted.assessment.text}`)
  }
  audio.syncSeedObjects(chamber.id, plantedSeeds)
  evaluate()
}

function enterInteractConfirm() {
  if (lastResult.solved) {
    log('Enter confirm: choosing the next restoration contract from the Atlas.')
    setScreen('atlas')
    return
  }
  plantOrPickUp()
}

function tune(direction) {
  const seed = currentSeed()
  if (!seed) return
  const parameter = currentTuningParameter()
  const canopyTuning = canopyBrightnessTuningState(save)
  const step = parameter === 'brightness' ? canopyTuning.brightnessStep / 0.05 : 1
  const currency = sporeTuningCurrencyState(save, parameter)
  const report = tuneSeedWithReport(seed, parameter, direction, step)
  if (currency.canSpend) save.materials.spores -= currency.cost
  inventory[selectedSeedIndex] = report.seed
  log(`${report.text} ${currency.text}${parameter === 'brightness' ? ` ${canopyTuning.text}` : ''}`)
  audio.seed(inventory[selectedSeedIndex])
  persist()
}

function lockSelectedTrait() {
  const seed = currentSeed()
  if (!seed) return
  const parameter = currentTuningParameter()
  const lock = resinTraitLockState(save, seed, parameter)
  if (!lock.canLock) {
    log(lock.text)
    return
  }
  save.materials.resin -= lock.cost
  inventory[selectedSeedIndex] = lockSeedTrait(seed, parameter)
  log(`Locked ${tuningLabel(parameter)} on ${seed.name}. ${lock.text}`)
  persist()
}

function graft() {
  if (inventory.length < 2) return
  const report = graftSeedsWithReport(inventory[0], inventory[1], `graft-${Date.now()}`, { materials: save.materials, restoredSystems: save.restoredSystems })
  if (report.status === 'failed') {
    inventory.push(report.noisyTool)
    save.materials.dreamCompost = (save.materials.dreamCompost ?? 0) + report.compostYield
    selectedSeedIndex = seedCarryState(inventory, inventory.length - 1).selectedCarryIndex
    log(report.text)
    log(`Recovered failed graft utility: ${report.noisyTool.name}; dream compost now ${save.materials.dreamCompost}.`)
    audio.seed(report.noisyTool)
    persist()
    return
  }
  const next = report.seed
  inventory.push(next)
  const heldInReserve = inventory.indexOf(next) >= seedCarryLimit
  selectedSeedIndex = seedCarryState(inventory, inventory.length - 1).selectedCarryIndex
  const newDiscoveries = report.discoveries.filter((discovery) => !save.unlockedGraftMechanics.includes(discovery))
  save.unlockedGraftMechanics = [...save.unlockedGraftMechanics, ...newDiscoveries]
  if (next.discoveryId) {
    save.graftDiscoveryIds = Array.from(new Set([...(save.graftDiscoveryIds ?? []), next.discoveryId]))
  }
  if (report.record && !(save.graftRecords ?? []).some((record) => record.id === report.record.id)) {
    save.graftRecords = [...(save.graftRecords ?? []), report.record]
    if (!save.codexIds.includes(report.record.id)) save.codexIds.push(report.record.id)
  }
  const bonusContractRewards = report.rareRewards?.rewards.filter((reward) => reward.kind === 'bonus-contract') ?? []
  const ratingRewards = report.rareRewards?.rewards.filter((reward) => reward.kind === 'rating-improvement') ?? []
  save.bonusContractIds = Array.from(new Set([...(save.bonusContractIds ?? []), ...bonusContractRewards.map((reward) => reward.id)]))
  save.graftRatingBoosts = Array.from(new Set([...(save.graftRatingBoosts ?? []), ...ratingRewards.map((reward) => reward.id)]))
  log(report.text, 'success')
  if (report.rareRewards?.rare) log(report.rareRewards.text, 'success')
  log(`Grafted ${next.name}. ${heldInReserve ? 'Added to the library reserve because carried seeds are full' : 'Selected graft'}; pitch ${next.pitchRatio}, pulse ${next.pulseRate}, brightness ${next.brightness}.`, 'success')
  if (newDiscoveries.length) log(`Unlocked graft mechanic: ${newDiscoveries.join(', ')}.`, 'success')
  if (report.record) {
    log(`Graft record recovered: ${report.record.title}.`, 'success')
    audio.memory(report.record, player)
  }
  audio.ui('success')
  persist()
}

function previewSelectedSeed() {
  const seed = currentSeed()
  if (!seed) return
  audio.seed(seed)
  log(seedAudioPreview(seed).text)
}

function acceptWildInstability() {
  save.wildChamberIds = save.wildChamberIds ?? []
  if (!save.wildChamberIds.includes(chamber.id)) save.wildChamberIds.push(chamber.id)
  persist()
  log(`Wild instability accepted for ${chamber.title}. A successful restoration here will preserve unusual mutation material instead of a conventional rating path.`, 'success')
}

function composeConservatory() {
  const composition = freeCompositionConservatory(save, inventory, conservatoryMode)
  audio.ending(chambers.filter((item) => save.solvedChambers.includes(item.id)), inventory, { restoredSystems: save.restoredSystems, solvedChambers: save.solvedChambers })
  log(`Compose: playing ${inventory.length} recovered seed voice(s) as a living conservatory chord. Mode ${composition.mode.title}: ${composition.mode.text}`)
}

function selectSeed(index) {
  selectedSeedIndex = seedCarryState(inventory, index).selectedCarryIndex
  audio.seed(currentSeed())
  log(`Selected ${currentSeed().name}. ${seedCarryText(inventory, selectedSeedIndex)}`)
}

function setTuningParameter(parameter) {
  const index = tuningParameters.indexOf(parameter)
  if (index < 0) return
  tuningIndex = index
  log(`Tuning parameter: ${tuningLabel(currentTuningParameter())}.`)
}

function evaluate() {
  lastResult = evaluateResonance(chamber, plantedSeeds)
  audio.resonance(lastResult, chamber)
  audio.setMusicScene('game', { chamber, plantedSeeds, resonance: lastResult, restoredSystems: save.restoredSystems, solved: save.solvedChambers.includes(chamber.id) })
  if (lastResult.missing.some((message) => message.includes('Mold'))) audio.hazard(chamber, plantedSeeds.at(-1))
  if (!lastResult.solved) {
    persist()
    log(`${lastResult.accuracy.text} ${lastResult.missing[0] ?? 'Keep listening.'}`)
    return
  }
  const firstSolve = !save.solvedChambers.includes(chamber.id)
  const rating = save.wildChamberIds?.includes(chamber.id) ? 'Wild' : restorationRating(lastResult)
  if (firstSolve) save.solvedChambers.push(chamber.id)
  if (firstSolve && !save.restoredSystems.includes(chamber.system)) save.restoredSystems.push(chamber.system)
  if (firstSolve) audio.setMusicScene('game', { chamber, plantedSeeds, resonance: lastResult, restoredSystems: save.restoredSystems, solved: true })
  const environmentalChange = `${chamber.system}: ${chamber.title} stabilized with ${rating} resonance`
  if (firstSolve && !save.environmentalChanges.includes(environmentalChange)) save.environmentalChanges.push(environmentalChange)
  const gatheredSeedNames = (chamber.rewards?.seeds ?? []).filter((id) => !save.inventoryIds.includes(id)).map((id) => chamberSeeds[id]?.name ?? id)
  save = mergeRewards(save, chamber, rating)
  inventory = buildInventory()
  audio.ui('success')
  log(`${chamber.title} solved with ${rating} rating. Rewards now available in the atlas.`, 'success')
  if (firstSolve) {
    log(`${chamber.system} system restored and online.`, 'success')
    const outcome = restorationOutcomeSummary(chamber, rating)
    if (outcome.systemOnline || ['Stable', 'Flourishing', 'Harmonic', 'Wild'].includes(outcome.outcome)) log(outcome.text, 'success')
    log(seedMoveSummary(chamber, seedMoveCount()).text, 'success')
    log(lastResult.graftStability.text, 'success')
    log(lastResult.hazardContainment.text, 'success')
    log(resourceEfficiencySummary(chamber, save).text, 'success')
    log(optionalRecordRecoverySummary(chamber, save).text, 'success')
  }
  if (firstSolve && chamber.rewards?.materials) log(`Collected crafting resources: ${materialRewardText(chamber.rewards.materials)}.`, 'success')
  if (firstSolve && gatheredSeedNames.length) log(`Gathered phonoseed reward: ${gatheredSeedNames.join(', ')}.`, 'success')
  if (firstSolve && chamber.rewards?.codex?.length) {
    log(`Codex updated: ${chamber.rewards.codex.map((id) => availableCodexRecords()[id]?.title).filter(Boolean).join(', ')}.`, 'success')
    audio.memory(availableCodexRecords()[chamber.rewards.codex[0]], chamber.target)
  }
  persist()
  if (chamber.ending) {
    save.endgameResolution = chooseEndgameResolution(save).id
    const reflectionRewards = endingResolutionReflectionRewards(save)
    save = mergeEndingResolutionReflections(save)
    save.postgameUnlocked = true
    log(`Ending reflections recovered: ${reflectionRewards.recordIds.map((id) => availableCodexRecords()[id]?.title).filter(Boolean).join(', ')}.`, 'success')
    persist()
    audio.ending(chambers.filter((item) => save.solvedChambers.includes(item.id)), inventory, { restoredSystems: save.restoredSystems, solvedChambers: save.solvedChambers })
    screen = 'ending'
    render()
  }
}

function evaluateReport() {
  lastResult = evaluateResonance(chamber, plantedSeeds)
  audio.resonance(lastResult, chamber)
  audio.setMusicScene('game', { chamber, plantedSeeds, resonance: lastResult, restoredSystems: save.restoredSystems, solved: save.solvedChambers.includes(chamber.id) })
  const photosynthesis = lastResult.photosynthesis ? ` ${lastResult.photosynthesis.text}` : ''
  const pressureSails = lastResult.pressureSails ? ` ${lastResult.pressureSails.text}` : ''
  const thermalShutters = lastResult.thermalShutters ? ` ${lastResult.thermalShutters.text}` : ''
  const timbrePuzzle = lastResult.timbrePuzzle ? ` ${lastResult.timbrePuzzle.text}` : ''
  const moveSummary = seedMoveSummary(chamber, seedMoveCount())
  const details = lastResult.missing.length ? lastResult.missing.join(' ') : `All resonance checks are inside tolerance.${photosynthesis}${pressureSails}${thermalShutters}${timbrePuzzle} ${moveSummary.text} ${lastResult.graftStability.text} ${lastResult.hazardContainment.text} ${resourceEfficiencySummary(chamber, save).text} ${optionalRecordRecoverySummary(chamber, save).text}`
  log(`Evaluate resonance: ${lastResult.accuracy.text} ${details}`)
}

function restoreChamber() {
  lastResult = evaluateResonance(chamber, plantedSeeds)
  if (!lastResult.solved) {
    audio.ui('error')
    log(`Restore: ${chamber.title} is not ready. ${lastResult.missing[0] ?? 'Keep listening.'}`)
    return
  }
  if (save.solvedChambers.includes(chamber.id)) {
    log(`Restore: ${chamber.title} is already restored with ${save.ratings[chamber.id] ?? 'Restored'} rating.`)
    return
  }
  evaluate()
}

function restoreOrAdvance() {
  if (save.solvedChambers.includes(chamber.id)) advanceArkClock()
  else restoreChamber()
}

function advanceArkClock() {
  save.arkClock += 1
  persist()
  log(`Ark clock advanced to cycle ${save.arkClock}. Decide whether to improve ${chamber.title}, take another work order, research grafts, or continue advancing the Ark.`)
}

function resetChamber() {
  plantedSeeds = []
  save.plantedByChamber[chamber.id] = []
  save.seedMovesByChamber = save.seedMovesByChamber ?? {}
  save.seedMovesByChamber[chamber.id] = 0
  audio.syncSeedObjects(chamber.id, plantedSeeds)
  startChamber(chamber)
  log('Chamber reset.')
}

function setScreen(next) {
  screen = next
  render()
}

async function beginFromSplash() {
  await ensureAudio()
  setScreen('menu')
}

function updateSetting(key, value) {
  const parsed = ['reducedMotion', 'minimalVisual', 'highContrast', 'textOnlyHints', 'scanVerbosity'].includes(key) ? value : Number(value)
  save.settings[key] = parsed
  audio.setSettings(save.settings)
  persist()
  log(`Settings audio/display update: ${settingLabels[key] ?? key} set to ${parsed === true ? 'on' : parsed === false ? 'off' : parsed}.`)
}

function keyBindingText(action) {
  return (save.keyboardBindings ?? defaultKeyboardBindings)[action] ?? defaultKeyboardBindings[action] ?? ''
}

function keyTokens(value = '') {
  return String(value).split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
}

function eventKeyTokens(event) {
  const key = event.key === ' ' ? 'space' : event.key
  const tokens = [key, event.code].filter(Boolean).map((item) => item.toLowerCase())
  if (event.shiftKey && key) tokens.push(`shift+${key.toLowerCase()}`)
  if (event.shiftKey && event.code) tokens.push(`shift+${event.code.toLowerCase()}`)
  return tokens
}

function keyMatches(action, event) {
  const tokens = eventKeyTokens(event)
  return keyTokens(keyBindingText(action)).some((binding) => tokens.includes(binding))
}

function digitIndexFromEvent(event, max = 10) {
  const digit = event.code?.startsWith('Digit') ? Number(event.code.replace('Digit', '')) : Number(event.key)
  if (!Number.isInteger(digit)) return -1
  const index = digit === 0 ? 9 : digit - 1
  return index >= 0 && index < max ? index : -1
}

function updateKeyBinding(action, value) {
  save.keyboardBindings = { ...defaultKeyboardBindings, ...(save.keyboardBindings ?? {}), [action]: value.trim() || defaultKeyboardBindings[action] }
  persist()
  log(`Keyboard remap: ${keyBindingLabels[action] ?? action} set to ${save.keyboardBindings[action]}.`)
}

function cycleScanMode() {
  const modes = ['objective', 'boundaries', 'seeds', 'hazards', 'memory', 'network']
  scanMode = modes[(modes.indexOf(scanMode) + 1) % modes.length]
  log(`Scan mode menu: ${scanMode}. Available scan modes: ${modes.join(', ')}.`)
}

function logInformationCommand(action) {
  if (action === 'objectiveInfo') log(`Objective: ${chamber.objective} Current system: ${chamber.system}. Contract ${contractStatus(chamber)}. ${lastResult.missing[0] ?? 'Requirements are satisfied.'}`)
  else if (action === 'positionInfo') log(`Position: ${player.x}, ${player.y}, facing ${player.facing} degrees. ${restorationProgressText()} ${lastResult.accuracy.text}`)
  else if (action === 'inventoryInfo') log(`Inventory: ${seedCarryText(inventory, selectedSeedIndex)} Materials: ${materialsText()}.`)
  else if (action === 'recentLog') log(`Recent log: ${recentLogText()}`)
  else if (action === 'latestLog') log(`Latest log entry: ${latestLogText()}`)
  else if (action === 'boundaryInfo') log(boundaryInfoText())
  else if (action === 'plantedVoices') log(plantedVoicesText())
  else if (action === 'codexInfo') log(codexInfoText())
}

function handleInputIntent(intent) {
  if (intent.action === 'move') movement(intent.dx, intent.dy)
  else if (intent.action === 'scan') scan()
  else if (intent.action === 'plant') enterInteractConfirm()
  else if (intent.action === 'cycleSeed') {
    const carry = currentCarry()
    selectSeed(carry.carried.length ? (selectedSeedIndex + 1) % carry.carried.length : 0)
  } else if (intent.action === 'previousSeed') {
    const carry = currentCarry()
    selectSeed(carry.carried.length ? (selectedSeedIndex - 1 + carry.carried.length) % carry.carried.length : 0)
  } else if (intent.action === 'tuneDown') tune(-1)
  else if (intent.action === 'tuneUp') tune(1)
  else if (intent.action === 'selectSeed') selectSeed(intent.index ?? 0)
  else if (intent.action === 'selectTuningParameter') setTuningParameter(tuningParameters[intent.index ?? 0])
  else if (intent.action === 'graft') graft()
  else if (intent.action === 'restoreAdvance') restoreOrAdvance()
  else if (intent.action === 'cycleScanMode') cycleScanMode()
  else if (['objectiveInfo', 'positionInfo', 'inventoryInfo', 'recentLog', 'latestLog', 'boundaryInfo', 'plantedVoices', 'codexInfo'].includes(intent.action)) logInformationCommand(intent.action)
  else if (intent.action === 'pause') setScreen('pause')
}

function handleGameKey(event, inputState = syngenInputSnapshot(event)) {
  if (keyMatches('moveUp', event)) movement(0, 1)
  else if (keyMatches('moveDown', event)) movement(0, -1)
  else if (keyMatches('moveLeft', event)) movement(-1, 0)
  else if (keyMatches('moveRight', event)) movement(1, 0)
  else if (keyMatches('rotateLeft', event)) rotate(-15)
  else if (keyMatches('rotateRight', event)) rotate(15)
  else if (keyMatches('cycleScanMode', event)) cycleScanMode()
  else if (keyMatches('scan', event)) scan()
  else if (keyMatches('objectiveInfo', event)) logInformationCommand('objectiveInfo')
  else if (keyMatches('positionInfo', event)) logInformationCommand('positionInfo')
  else if (keyMatches('inventoryInfo', event)) logInformationCommand('inventoryInfo')
  else if (keyMatches('recentLog', event)) logInformationCommand('recentLog')
  else if (keyMatches('latestLog', event)) logInformationCommand('latestLog')
  else if (keyMatches('boundaryInfo', event)) logInformationCommand('boundaryInfo')
  else if (keyMatches('plantedVoices', event)) logInformationCommand('plantedVoices')
  else if (keyMatches('codexInfo', event)) logInformationCommand('codexInfo')
  else if (keyMatches('controlsInfo', event)) log(controlsText())
  else if (keyMatches('plant', event)) enterInteractConfirm()
  else if (keyMatches('previousSeed', event)) {
    event.preventDefault()
    const carry = currentCarry()
    selectSeed(carry.carried.length ? (selectedSeedIndex - 1 + carry.carried.length) % carry.carried.length : 0)
  }
  else if (keyMatches('cycleSeed', event)) {
    event.preventDefault()
    const carry = currentCarry()
    selectSeed(carry.carried.length ? (selectedSeedIndex + 1) % carry.carried.length : 0)
  } else if (event.shiftKey && digitIndexFromEvent(event) >= 0) {
    setTuningParameter(tuningParameters[digitIndexFromEvent(event)])
  } else if (digitIndexFromEvent(event, 4) >= 0) {
    selectSeed(digitIndexFromEvent(event, 4))
  } else if (keyMatches('tuneDown', event)) tune(-1)
  else if (keyMatches('tuneUp', event)) tune(1)
  else if (event.key === 'Shift') {
    tuningIndex = (tuningIndex + 1) % tuningParameters.length
    log(`Tuning parameter: ${tuningLabel(currentTuningParameter())}.`)
  } else if (keyMatches('graft', event)) graft()
  else if (keyMatches('restoreAdvance', event)) restoreOrAdvance()
  else if (keyMatches('reset', event)) resetChamber()
  else if (keyMatches('help', event)) setScreen('help')
  else if (keyMatches('pause', event)) setScreen('pause')
}

document.addEventListener('keydown', (event) => {
  const inputState = syngenInputSnapshot(event)
  if (screen === 'splash' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    beginFromSplash()
  } else if (screen === 'game') handleGameKey(event, inputState)
  else if (event.key === 'Escape') setScreen('game')
})

app.addEventListener('click', async (event) => {
  const action = event.target?.dataset?.action
  if (!action) return
  if (action === 'begin') {
    await beginFromSplash()
    return
  }
  await ensureAudio()
  if (action === 'new') newGame()
  if (action === 'continue') continueGame()
  if (action === 'settings') setScreen('settings')
  if (action === 'help') setScreen('help')
  if (action === 'credits') setScreen('credits')
  if (action === 'atlas') setScreen('atlas')
  if (action === 'library') setScreen('library')
  if (action === 'codex') setScreen('codex')
  if (action === 'conservatory') setScreen('conservatory')
  if (action === 'ending') setScreen('ending')
  if (action === 'menu') setScreen('menu')
  if (action === 'game') setScreen('game')
  if (action === 'scan') scan()
  if (action === 'listen') listen()
  if (action === 'locate') locate()
  if (action === 'scanMode') {
    scanMode = event.target.dataset.mode
    log(`Scan mode: ${scanMode}.`)
  }
  if (action === 'tuningParameter') setTuningParameter(event.target.dataset.parameter)
  if (action === 'plant') plantOrPickUp()
  if (action === 'tuneDown') tune(-1)
  if (action === 'tuneUp') tune(1)
  if (action === 'lockTrait') lockSelectedTrait()
  if (action === 'graft') graft()
  if (action === 'evaluate') evaluateReport()
  if (action === 'selectSeed') selectSeed(Number(event.target.dataset.seedIndex))
  if (action === 'previewSeed') previewSelectedSeed()
  if (action === 'wild') acceptWildInstability()
  if (action === 'compose') composeConservatory()
  if (action === 'compositionMode') {
    conservatoryMode = event.target.dataset.mode ?? conservatoryMode
    const composition = freeCompositionConservatory(save, inventory, conservatoryMode)
    log(`Conservatory mode: ${composition.mode.title}. ${composition.mode.text}`)
  }
  if (action === 'restore') restoreChamber()
  if (action === 'advanceClock') advanceArkClock()
  if (action === 'philosophy') {
    save.restorationPhilosophy = event.target.dataset.philosophy
    persist()
    log(`Restoration philosophy: ${restorationPhilosophies.find((item) => item.id === save.restorationPhilosophy)?.title}.`)
  }
  if (action === 'reset') resetChamber()
  if (action === 'next') setScreen('atlas')
  if (action === 'contract') {
    const next = chambers.find((item) => item.id === event.target.dataset.contract)
    if (next && unlockedContracts().some((item) => item.id === next.id)) startChamber(next)
  }
  if (action === 'returnContract') {
    const returns = optionalReturnContracts(chambers, save)
    const next = returns.find((item) => item.id === event.target.dataset.contract)
    if (next) startChamber(chambers.find((item) => item.id === next.id))
  }
})

app.addEventListener('input', (event) => {
  const setting = event.target?.dataset?.setting
  if (setting) updateSetting(setting, event.target.type === 'checkbox' ? event.target.checked : event.target.value)
})

app.addEventListener('change', (event) => {
  const action = event.target?.dataset?.keyBinding
  if (action) updateKeyBinding(action, event.target.value)
})

function shell(content) {
  const classes = [save.settings.reducedMotion ? 'reduced-motion' : '', save.settings.minimalVisual ? 'minimal-visual' : '', save.settings.highContrast ? 'high-contrast' : ''].join(' ')
  app.className = classes
  app.innerHTML = content
}

function menu() {
  audio.setMusicScene('menu')
  shell(`
    <main class="screen menu" aria-labelledby="title">
      <h1 id="title">EchoGraft</h1>
      <p>Repair the Verdancy Ark by listening, planting, tuning, and grafting procedural phonoseeds.</p>
      <p>${mainMenuStatusText()}</p>
      <nav aria-label="Main menu">
        <button data-action="new">New game</button>
        <button data-action="continue">Continue</button>
        <button data-action="atlas">Restoration atlas</button>
        <button data-action="library">Seed library</button>
        <button data-action="codex">Codex</button>
        ${save.postgameUnlocked ? '<button data-action="ending">Ending resolution</button>' : ''}
        ${save.postgameUnlocked ? '<button data-action="conservatory">Conservatory</button>' : ''}
        <button data-action="settings">Settings</button>
        <button data-action="help">Help</button>
        <button data-action="credits">Credits</button>
      </nav>
    </main>
  `)
}

function splash() {
  shell(`
    <main class="screen splash" aria-labelledby="splash-title">
      <div>
        <p class="eyebrow">Accessible procedural audio game</p>
        <h1 id="splash-title">EchoGraft</h1>
        <p>Interact to unlock Syngen audio, then listen through the Verdancy Ark.</p>
      </div>
      <button class="begin-button" data-action="begin" type="button" autofocus>Interact to Begin</button>
    </main>
  `)
  app.querySelector('[data-action="begin"]')?.focus()
}

function game() {
  const carry = currentCarry()
  shell(`
    <main class="game" aria-labelledby="chamber-title">
      <section class="hud" aria-live="polite">
        <h1 id="chamber-title">${chamber.title}</h1>
        <p><strong>Contract:</strong> ${chamber.contractType}; ${chamber.system}; ${contractStatus(chamber)}; ${solveTimeText(chamber)}; scan ${scanMode}.</p>
        <p><strong>Status:</strong> ${lastResult.solved ? 'Solved' : 'Unsolved'}; ${lastResult.accuracy.text} Press O, P, I, L, X, V, C, or ? for details.</p>
      </section>
      <section class="layout">
        <div class="radar" role="img" aria-label="Abstract chamber radar. Player and planted seeds are also described in text.">
          <div class="heart" style="left:${50 + chamber.target.x * 8}%;top:${50 - chamber.target.y * 8}%"></div>
          <div class="player" style="left:${50 + player.x * 8}%;top:${50 - player.y * 8}%"></div>
          ${plantedSeeds.map((seed) => `<div class="seed" style="left:${50 + seed.position.x * 8}%;top:${50 - seed.position.y * 8}%"></div>`).join('')}
        </div>
        <aside>
          ${textOnlyHintHtml()}
          <h2>Actions</h2>
          <button data-action="listen">Listen</button>
          <button data-action="locate">Locate heart</button>
          <button data-action="scan">Scan pulse</button>
          <button data-action="scanMode" data-mode="objective">Objective scan</button>
          <button data-action="scanMode" data-mode="boundaries">Boundary scan</button>
          <button data-action="scanMode" data-mode="seeds">Seed scan</button>
          <button data-action="scanMode" data-mode="hazards">Hazard scan</button>
          <button data-action="scanMode" data-mode="memory">Memory scan</button>
          <button data-action="scanMode" data-mode="network">Network scan</button>
          <button data-action="plant">Plant or pick up</button>
        <button data-action="tuneDown">Tune down</button>
        <button data-action="tuneUp">Tune up</button>
        <button data-action="lockTrait">Lock selected trait with resin</button>
        <button data-action="evaluate">Evaluate resonance</button>
          <button data-action="tuningParameter" data-parameter="envelope.attack">Tune envelope</button>
          <button data-action="tuningParameter" data-parameter="fmAmount">Tune modulation</button>
          <button data-action="tuningParameter" data-parameter="noiseAmount">Tune noise</button>
          <button data-action="tuningParameter" data-parameter="growthBehavior">Tune growth</button>
          <button data-action="graft">Graft first two seeds</button>
          <button data-action="restore">Restore chamber</button>
          <button data-action="wild">Accept wild instability</button>
          <button data-action="reset">Reset chamber</button>
          <button data-action="atlas">Atlas</button>
          <button data-action="library">Seed library</button>
          <button data-action="help">Help</button>
          <button data-action="settings">Settings</button>
          ${lastResult.solved ? '<button data-action="next">Choose next contract</button>' : ''}
        </aside>
      </section>
      <section class="inventory" aria-label="Seed inventory">
        <h2>Carried Seeds</h2>
        <p>Carry limit ${carry.carried.length} of ${seedCarryLimit}. ${carry.reserveCount} seed voice(s) remain in the library reserve.</p>
        <ol>${carry.carried.map((seed, index) => `<li${index === selectedSeedIndex ? ' aria-current="true"' : ''}>${index + 1}. ${seed.name}: ${seedDnaText(seed)}${seed.grafted ? ', grafted' : ''}</li>`).join('')}</ol>
      </section>
      <section class="log" aria-label="Caption and event log" aria-live="polite">
        <h2>Caption Log</h2>
        <ol>${eventLog.entries.map((entry) => `<li class="${entry.type}">${entry.message}</li>`).join('')}</ol>
      </section>
    </main>
  `)
}

function atlas() {
  audio.setMusicScene('menu')
  const available = new Set(unlockedContracts().map((item) => item.id))
  const plan = restorationPlanningSession(chambers, save.solvedChambers, { min: 20, max: 40 }, save.arkClock)
  const campaign = firstFullCampaignEstimate(campaignScope)
  const stewardship = stewardshipSummary(chambers, save)
  const returnContracts = optionalReturnContracts(chambers, save)
  const codexRecovery = codexRecoverySummary(chambers, save)
  const memoryEchoes = memoryCodexEchoState(chambers, save)
  const centralHeart = centralHeartSummary(chambers, save)
  const crewWakeCycle = crewWakeCycleSummary(save)
  const launchGarden = launchGardenSummary(save)
  const resonanceNetwork = multiChamberResonanceNetwork(chambers, save)
  const heartUnlock = heartNetworkEndingState(chambers, save)
  const navigationAtlas = navigationAtlasState(chambers, save)
  const waterRouting = waterRootRoutingState(chambers, save)
  const canopyDoors = canopyDoorState(chambers, save)
  const finalChord = playerBuiltFinalChord(chambers, save, inventory)
  const finalEcology = finalEcologyPhilosophySummary(save)
  const embersapMutations = embersapEndgameMutationState(save)
  const decision = decisionSummary(chambers, save.solvedChambers)
  const activeCycle = chamberCycleState(chamber, save.arkClock)
  const activeWeatherWindow = weatherWindowState(chamber, save.arkClock)
  shell(`
    <main class="screen atlas" aria-labelledby="atlas-title">
      <h1 id="atlas-title">Restoration Atlas</h1>
      <p>Season 1 contracts: ${save.solvedChambers.length} restored. Materials: ${materialsText()}.</p>
      <p>${atlasStatusText()}</p>
      <section aria-labelledby="materials-title">
        <h2 id="materials-title">Materials Ledger</h2>
        ${materialLedgerHtml()}
      </section>
      <p>Systems online: ${save.restoredSystems.join(', ') || 'none yet'}.</p>
      <p>Environmental changes: ${save.environmentalChanges.join('; ') || 'none yet'}.</p>
      <p>Ark clock: cycle ${save.arkClock}.</p>
      ${activeCycle ? `<p>Active chamber cycle: ${activeCycle.text}</p>` : ''}
      ${activeWeatherWindow ? `<p>Active weather window: ${activeWeatherWindow.text}</p>` : ''}
      <p>Full campaign target: ${campaign.min} to ${campaign.max} hours across ${campaign.seasons} seasons, ${campaign.requiredContracts} required contracts, and ${campaign.optionalContracts} optional contracts.</p>
      <section aria-labelledby="major-systems-title">
        <h2 id="major-systems-title">Major Ark Systems</h2>
        <ul>
          ${majorArkSystems.map((system) => `<li>${system.name}: ${system.unlock}.</li>`).join('')}
        </ul>
      </section>
      <section aria-labelledby="stewardship-title">
        <h2 id="stewardship-title">Stewardship Review</h2>
        <p>${stewardship.restoredCount} of ${stewardship.totalCount} contracts restored. Materials: ${stewardship.materialSummary}.</p>
        <p>${stewardship.nextAction}</p>
      </section>
      <section aria-labelledby="navigation-atlas-title">
        <h2 id="navigation-atlas-title">Navigation Atlas</h2>
        <p>${navigationAtlas.text}</p>
        <ol>
          ${navigationAtlas.previews.map((item) => `<li>${item.text}</li>`).join('')}
        </ol>
      </section>
      <section aria-labelledby="water-routing-title">
        <h2 id="water-routing-title">Water Root Routing</h2>
        <p>${waterRouting.text}</p>
        <ol>
          ${waterRouting.rootContracts.slice(0, 6).map((item) => `<li>${item.title}: ${waterRouting.waterOnline ? 'current-routable' : 'awaiting Water'}; ${item.objective}</li>`).join('')}
        </ol>
      </section>
      <section aria-labelledby="canopy-doors-title">
        <h2 id="canopy-doors-title">Canopy Photosynthesis Doors</h2>
        <p>${canopyDoors.text}</p>
        <ol>
          ${canopyDoors.doors.slice(0, 6).map((item) => `<li>${item.title}: ${canopyDoors.canopyOnline ? 'brightness-tunable' : 'awaiting Canopy'}; ${item.photosynthesis ? 'photosynthesis threshold' : item.timbrePuzzle ? 'brightness/timbre filter' : 'thermal shutter window'}.</li>`).join('')}
        </ol>
      </section>
      <section aria-labelledby="return-contracts-title">
        <h2 id="return-contracts-title">Optional Return Contracts</h2>
        ${returnContracts.length ? `<ol>${returnContracts.map((item) => `<li>${item.text} <button data-action="returnContract" data-contract="${item.id}">Return to ${item.title}</button></li>`).join('')}</ol>` : '<p>No low-rated restored chambers need return work.</p>'}
      </section>
      <section aria-labelledby="codex-recovery-title">
        <h2 id="codex-recovery-title">Codex Recovery</h2>
        <p>${codexRecovery.text}</p>
        ${codexRecovery.availableRecords.length ? `<ol>${codexRecovery.availableRecords.map((record) => `<li>${codexRecords[record.id]?.title ?? record.id} in ${record.chamberTitle}.</li>`).join('')}</ol>` : ''}
      </section>
      <section aria-labelledby="memory-echo-title">
        <h2 id="memory-echo-title">Memory Codex Echoes</h2>
        <p>${memoryEchoes.text}</p>
        ${memoryEchoes.echoes.length ? `<ol>${memoryEchoes.echoes.map((record) => `<li>${codexRecords[record.id]?.title ?? record.id}: echo from ${record.chamberTitle}.</li>`).join('')}</ol>` : ''}
      </section>
      <section aria-labelledby="central-heart-title">
        <h2 id="central-heart-title">Central Heart</h2>
        <p>${centralHeart.text}</p>
        <p>Core: ${centralHeart.central?.title ?? 'No central heart contract authored yet'}.</p>
        <p>Ready finale branches: ${centralHeart.readyBranches.map((item) => item.title).join(', ') || 'none ready'}.</p>
        <p>Restored finale branches: ${centralHeart.restoredBranches.map((item) => item.title).join(', ') || 'none restored'}.</p>
      </section>
      <section aria-labelledby="network-title">
        <h2 id="network-title">Multi-Chamber Resonance Network</h2>
        <p>${resonanceNetwork.text}</p>
        <ol>${resonanceNetwork.nodes.map((node) => `<li>${node.text}</li>`).join('')}</ol>
      </section>
      <section aria-labelledby="heart-unlock-title">
        <h2 id="heart-unlock-title">Heart Network Endings</h2>
        <p>${heartUnlock.text}</p>
      </section>
      <section aria-labelledby="final-chord-title">
        <h2 id="final-chord-title">Player-Built Final Chord</h2>
        <p>${finalChord.text}</p>
        ${finalChord.voices.length ? `<ol>${finalChord.voices.slice(0, 8).map((voice) => `<li>${voice.name}: ${voice.system}, pitch ${voice.pitchRatio}, pulse ${voice.pulseRate}.</li>`).join('')}</ol>` : ''}
      </section>
      <section aria-labelledby="final-ecology-title">
        <h2 id="final-ecology-title">Final Ecology Philosophy</h2>
        <p>${finalEcology.text}</p>
        <p>${embersapMutations.text}</p>
      </section>
      <section aria-labelledby="crew-wake-title">
        <h2 id="crew-wake-title">Crew Wake Cycle</h2>
        <p>${crewWakeCycle.text}</p>
      </section>
      <section aria-labelledby="launch-garden-title">
        <h2 id="launch-garden-title">Launch Garden</h2>
        <p>${launchGarden.text}</p>
      </section>
      <section aria-labelledby="decision-title">
        <h2 id="decision-title">Decision Point</h2>
        <p>Recommended next work: ${decision.recommendation}.</p>
        <p>Required choices: ${decision.requiredChoices.join(', ') || 'none ready'}.</p>
        <p>Optional choices: ${decision.optionalChoices.join(', ') || 'none ready'}.</p>
        <p>Restoration philosophy: ${restorationPhilosophies.find((item) => item.id === save.restorationPhilosophy)?.title ?? 'Undecided'}.</p>
        ${restorationPhilosophies.map((item) => `<button data-action="philosophy" data-philosophy="${item.id}">${item.title}</button>`).join('')}
        <p>Post-restore options: improve the active chamber, take another work order, research grafts, or advance the Ark clock.</p>
        <button data-action="game">Improve active chamber</button>
        <button data-action="library">Research grafts</button>
        <button data-action="advanceClock">Advance Ark clock</button>
      </section>
      <section aria-labelledby="planning-title">
        <h2 id="planning-title">Suggested Planning Session</h2>
        <p>${plan.min} to ${plan.max} minutes across ${plan.contracts.length} upcoming contracts.</p>
        <ol>
          ${plan.contracts.map((item) => `<li>${item.title}: ${solveTimeText(item)}, ${item.ready ? 'ready now' : 'queued by atlas dependencies'}${item.weatherWindow ? `; ${item.weatherWindow.text}` : ''}.</li>`).join('')}
        </ol>
      </section>
      <ol class="contract-list">
        ${chambers.map((item) => {
          const disabled = available.has(item.id) ? '' : ' disabled'
          return `<li>
            <h2>${item.title}</h2>
            <p>${item.system}; ${item.contractType}; ${contractRequirementStatus(item).status}; ${contractStatus(item)}; ${solveTimeText(item)}; difficulty ${estimatedDifficulty(item)}.</p>
            <p>${contractRequirementStatus(item).text}</p>
            ${restorationContractSummary(item) ? `<p>${restorationContractSummary(item).text}</p>` : ''}
            ${stabilizationContractSummary(item) ? `<p>${stabilizationContractSummary(item).text}</p>` : ''}
            ${researchContractSummary(item) ? `<p>${researchContractSummary(item).text}</p>` : ''}
            ${emergencyContractSummary(item) ? `<p>${emergencyContractSummary(item).text}</p>` : ''}
            ${conservatoryContractSummary(item) ? `<p>${conservatoryContractSummary(item).text}</p>` : ''}
            ${finaleContractSummary(item) ? `<p>${finaleContractSummary(item).text}</p>` : ''}
            <p>${knownHazardsSummary(item).text}</p>
            <p>${rewardSummary(item).text}</p>
            <p>${item.objective}</p>
            <button data-action="contract" data-contract="${item.id}"${disabled}>Accept work order</button>
          </li>`
        }).join('')}
      </ol>
      <nav aria-label="Restoration atlas actions">
        <button data-action="game">Enter active chamber</button>
        <button data-action="library">Seed library</button>
        <button data-action="codex">Codex</button>
        ${save.postgameUnlocked ? '<button data-action="conservatory">Conservatory</button>' : ''}
        <button data-action="menu">Main menu</button>
      </nav>
      <section class="log" aria-label="Caption and event log" aria-live="polite">
        <h2>Caption Log</h2>
        <ol>${eventLog.entries.map((entry) => `<li class="${entry.type}">${entry.message}</li>`).join('')}</ol>
      </section>
    </main>
  `)
}

function library() {
  audio.setMusicScene('menu')
  const appraisal = seedCollectionAppraisal(inventory, save, currentSeed())
  const dreamCompost = dreamCompostSummary(save)
  const glassPollenTraits = glassPollenUnlockedTraits(save)
  const pollinatorVault = pollinatorVaultSummary(save)
  shell(`
    <main class="screen" aria-labelledby="library-title">
      <h1 id="library-title">Seed Library</h1>
      <p>${seedCarryText(inventory, selectedSeedIndex)}</p>
      <p>Selected tuning: ${tuningLabel(currentTuningParameter())}. Materials: ${materialsText()}.</p>
      <section aria-labelledby="library-materials-title">
        <h2 id="library-materials-title">Materials Ledger</h2>
        ${materialLedgerHtml()}
      </section>
      <section aria-labelledby="appraisal-title">
        <h2 id="appraisal-title">Seed Collection Appraisal</h2>
        <p>Gathered voices: ${appraisal.gathered}. Identified families: ${appraisal.identifiedFamilies.join(', ')}.</p>
        <p>Curated seed: ${appraisal.curatedSeed}. Playable voices: ${appraisal.playableVoices.join(', ')}.</p>
        <p>${appraisal.rareHunting.text}</p>
        <p>${appraisal.graftCatalog.text}</p>
        <p>${appraisal.restorationUse} ${appraisal.commerceBoundary}</p>
        <p>${dreamCompost.text}</p>
        <p>${pollinatorVault.text}</p>
        <p>${glassPollenTraits.text}</p>
      </section>
      <section aria-labelledby="tuning-title">
        <h2 id="tuning-title">Tuning DNA</h2>
        <p>Selected seed DNA: ${seedDnaText(currentSeed())}.</p>
        ${tuningParameters.map((parameter) => `<button data-action="tuningParameter" data-parameter="${parameter}">${tuningLabel(parameter)}</button>`).join('')}
        <button data-action="tuneDown">Tune down</button>
        <button data-action="tuneUp">Tune up</button>
        <button data-action="lockTrait">Lock selected trait with resin</button>
      </section>
      <section aria-labelledby="grafting-bench-title">
        <h2 id="grafting-bench-title">Grafting Bench</h2>
        <p>${graftingBenchText()}</p>
        <p>Bench rule: Parent A passes root pitch and waveform; Parent B passes modulation and growth. Failed grafts return dream compost or noisy tools instead of ending progress.</p>
        <button data-action="graft">Graft first two seeds</button>
      </section>
      <section aria-labelledby="graft-mechanics-title">
        <h2 id="graft-mechanics-title">Unlocked Graft Mechanics</h2>
        <p>${save.unlockedGraftMechanics.length ? save.unlockedGraftMechanics.join(', ') : 'No graft mechanics unlocked yet.'}</p>
      </section>
      <section aria-labelledby="families-title">
        <h2 id="families-title">Seed Family Catalog</h2>
        <p>${seedFamilies.length} known families and ${graftDiscoveryCatalog.length} possible graft discoveries. ${seedFamilies.map((family) => `${family.name}: ${family.affinity}`).join('; ')}.</p>
      </section>
      <ol>${inventory.map((seed, index) => `<li${index === selectedSeedIndex ? ' aria-current="true"' : ''}>${index + 1}. ${seed.name}: ${seedDnaText(seed)}${seed.grafted ? ', grafted' : ''}. <button data-action="selectSeed" data-seed-index="${index}">Select ${seed.name}</button></li>`).join('')}</ol>
      <nav aria-label="Seed library actions">
        <button data-action="previewSeed">Preview selected seed</button>
        <button data-action="atlas">Atlas</button>
        <button data-action="game">Back to chamber</button>
      </nav>
      <section class="log" aria-label="Caption and event log" aria-live="polite">
        <h2>Caption Log</h2>
        <ol>${eventLog.entries.map((entry) => `<li class="${entry.type}">${entry.message}</li>`).join('')}</ol>
      </section>
    </main>
  `)
}

function codex() {
  audio.setMusicScene('menu')
  const trees = codexRecordTrees(availableCodexRecords(), save.codexIds)
  const memoryEchoes = memoryCodexEchoState(chambers, save)
  const recovery = codexRecoverySummary(chambers, save)
  const completion = codexCompletionState(save, availableCodexRecords())
  shell(`
    <main class="screen" aria-labelledby="codex-title">
      <h1 id="codex-title">Codex</h1>
      <p>Perception status: ${save.codexIds.length} recovered. ${recovery.text}</p>
      <section aria-labelledby="codex-completion-title">
        <h2 id="codex-completion-title">Codex Completion</h2>
        <p>${completion.text}</p>
      </section>
      <section aria-labelledby="codex-echo-title">
        <h2 id="codex-echo-title">Memory Codex Echoes</h2>
        <p>${memoryEchoes.text}</p>
      </section>
      ${trees.length ? trees.map((tree) => `<section aria-labelledby="codex-${tree.id}"><h2 id="codex-${tree.id}">${tree.title}</h2><ol>${tree.records.map((record) => `<li><h3>${record.title ?? record.id}</h3><p>${record.text ?? 'Recovered record.'}</p></li>`).join('')}</ol></section>`).join('') : '<p>No perceptions recovered yet.</p>'}
      <nav aria-label="Codex perception actions">
        <button data-action="atlas">Atlas</button>
        <button data-action="library">Seed library</button>
        <button data-action="game">Back to chamber</button>
      </nav>
      ${captionLogHtml()}
    </main>
  `)
}

function conservatory() {
  audio.setMusicScene('ending', { inventory })
  const composition = freeCompositionConservatory(save, inventory, conservatoryMode)
  shell(`
    <main class="screen" aria-labelledby="conservatory-title">
      <h1 id="conservatory-title">Conservatory</h1>
      <p>Postgame restoration is open. Revisit restored contracts, collect remaining records, and compose with recovered seed voices.</p>
      <section aria-labelledby="restored-title">
        <h2 id="restored-title">Restoration Collection</h2>
        <p>${save.solvedChambers.length} contracts restored. ${save.codexIds.length} codex records recovered.</p>
      </section>
      <section aria-labelledby="composition-title">
        <h2 id="composition-title">Composition Palette</h2>
        <p>${composition.text}</p>
        <p>${inventory.map((seed) => seed.name).join(', ')}.</p>
        ${composition.modes.map((mode) => `<button data-action="compositionMode" data-mode="${mode.id}"${mode.id === composition.mode.id ? ' aria-pressed="true"' : ''}>${mode.title}</button>`).join('')}
      </section>
      <button data-action="compose">Compose conservatory chord</button>
      <button data-action="atlas">Atlas</button>
      <button data-action="library">Seed library</button>
      <button data-action="codex">Codex</button>
      <button data-action="menu">Main menu</button>
      <section class="log" aria-label="Caption and event log" aria-live="polite">
        <h2>Caption Log</h2>
        <ol>${eventLog.entries.map((entry) => `<li class="${entry.type}">${entry.message}</li>`).join('')}</ol>
      </section>
    </main>
  `)
}

function settings() {
  audio.setMusicScene('menu')
  const sliders = ['master', 'ambience', 'music', 'ui', 'seeds', 'hazards', 'scans']
    .map((key) => `<label>${settingLabels[key]}<input data-setting="${key}" type="range" min="0" max="1" step="0.05" value="${save.settings[key]}" /></label>`)
    .join('')
  const keyboardFields = Object.entries(keyBindingLabels)
    .map(([action, label]) => `<label>${label}<input data-key-binding="${action}" value="${keyBindingText(action)}" /></label>`)
    .join('')
  shell(`
    <main class="screen" aria-labelledby="settings-title">
      <h1 id="settings-title">Settings</h1>
      <p>${settingsStatusText()}</p>
      <form aria-label="Settings controls">
        <fieldset>
          <legend>Independent volume controls</legend>
          <p>Adjust master, ambience, music, UI, seed voice, hazard voice, and scan pulse levels independently.</p>
          ${sliders}
        </fieldset>
        <fieldset>
          <legend>Display options</legend>
          <p>Reduced motion removes screen transitions and animations while preserving all audio cues and caption-log feedback.</p>
          <p>Minimal visual mode hides the abstract radar and keeps the chamber playable through text, controls, and audio feedback.</p>
          <p>High contrast increases border, focus, radar, and feedback contrast for players who inspect the visual layer.</p>
          <label>Scan verbosity<select data-setting="scanVerbosity">
            <option value="detailed"${save.settings.scanVerbosity === 'detailed' ? ' selected' : ''}>Detailed</option>
            <option value="concise"${save.settings.scanVerbosity === 'concise' ? ' selected' : ''}>Concise</option>
          </select></label>
          <label><input data-setting="reducedMotion" type="checkbox" ${save.settings.reducedMotion ? 'checked' : ''} /> Reduced motion</label>
          <label><input data-setting="minimalVisual" type="checkbox" ${save.settings.minimalVisual ? 'checked' : ''} /> Minimal visual mode</label>
          <label><input data-setting="highContrast" type="checkbox" ${save.settings.highContrast ? 'checked' : ''} /> High contrast</label>
          <label><input data-setting="textOnlyHints" type="checkbox" ${save.settings.textOnlyHints ? 'checked' : ''} /> Text-only chamber hints</label>
        </fieldset>
        <fieldset>
          <legend>Remappable keyboard</legend>
          <p>Enter a key name or comma-separated alternatives such as B, Space, ArrowUp, or Shift+L.</p>
          ${keyboardFields}
        </fieldset>
        <fieldset>
          <legend>Gamepad support</legend>
          <p>Syngen gamepad input supports left stick or D-pad movement, south button plant/interact, east button primary scan, west button seed cycling, north button interact/confirm, shoulder tuning, either trigger plus D-pad for objective, position, inventory, and latest log, and menu/start pause.</p>
        </fieldset>
      </form>
      <nav aria-label="Settings actions">
        <button data-action="game">Back to game</button>
        <button data-action="menu">Main menu</button>
      </nav>
      ${captionLogHtml()}
    </main>
  `)
}

function help() {
  audio.setMusicScene(screen === 'game' ? 'game' : 'menu', { chamber, plantedSeeds, resonance: lastResult })
  shell(`
    <main class="screen" aria-labelledby="help-title">
      <h1 id="help-title">Help</h1>
      <p>${controlsText()}</p>
      <p>Main campaign chambers never require reflex timing. Scan, read the caption log, tune, reset, and plant at your own pace.</p>
      <p>Use Listen for the ambient chamber state, Locate heart for distance and direction, then use scans for detailed boundaries, seeds, and hazards. Every important cue appears in the caption log.</p>
      <button data-action="game">Back to game</button>
      ${captionLogHtml()}
    </main>
  `)
}

function credits() {
  audio.setMusicScene('menu')
  shell(`
    <main class="screen" aria-labelledby="credits-title">
      <h1 id="credits-title">Credits</h1>
      <p>EchoGraft v0.1.0. Built as a procedural Syngen/Web Audio game. No external audio assets are used.</p>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function pause() {
  audio.setMusicScene('menu')
  shell(`
    <main class="screen" aria-labelledby="pause-title">
      <h1 id="pause-title">Pause Functions</h1>
      <p>${mainMenuStatusText()}</p>
      <nav aria-label="Pause functions menu">
        <button data-action="game">Resume</button>
        <button data-action="atlas">Restoration atlas</button>
        <button data-action="library">Seed library</button>
        <button data-action="codex">Codex perceptions</button>
        <button data-action="settings">Settings</button>
        <button data-action="help">Help</button>
        <button data-action="menu">Main menu</button>
      </nav>
    </main>
  `)
}

function ending() {
  audio.setMusicScene('ending', { inventory })
  const resolution = endgameResolutions.find((item) => item.id === save.endgameResolution) ?? chooseEndgameResolution(save)
  const endingScene = resolutionSpecificEnding(save)
  const crewWakeCycle = crewWakeCycleSummary(save)
  const launchGarden = launchGardenSummary(save)
  const finalChord = playerBuiltFinalChord(chambers, save, inventory)
  const heartUnlock = heartNetworkEndingState(chambers, save)
  const embersapMutations = embersapEndgameMutationState(save)
  shell(`
    <main class="screen ending" aria-labelledby="ending-title">
      <h1 id="ending-title">The Verdancy Ark Sings Again</h1>
      <p>Resolution: ${resolution.title}. ${resolution.text}</p>
      <section aria-labelledby="resolution-ending-title">
        <h2 id="resolution-ending-title">${endingScene.title}</h2>
        <p>${endingScene.text}</p>
        <p>${heartUnlock.text}</p>
      </section>
      <p>${crewWakeCycle.text}</p>
      <p>${launchGarden.text}</p>
      <p>${embersapMutations.text}</p>
      <p>${finalChord.text}</p>
      <p>The repaired resonance gardens answer one another. Every grafted voice becomes part of a living orbital chord.</p>
      <button data-action="atlas">Return to atlas</button>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function render() {
  if (screen === 'splash') splash()
  if (screen === 'menu') menu()
  if (screen === 'game') game()
  if (screen === 'atlas') atlas()
  if (screen === 'library') library()
  if (screen === 'codex') codex()
  if (screen === 'conservatory') conservatory()
  if (screen === 'settings') settings()
  if (screen === 'help') help()
  if (screen === 'credits') credits()
  if (screen === 'pause') pause()
  if (screen === 'ending') ending()
}

render()

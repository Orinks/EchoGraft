import { AudioEngine } from '../engine/audio.js'
import { chambers, chamberSeeds, codexRecords } from '../content/chambers.js'
import { createEventLog } from '../content/log.js'
import { createPlayer, movePlayer, rotatePlayer } from '../content/player.js'
import { availableChambers, evaluateResonance, mergeRewards, restorationRating } from '../content/resonance.js'
import { clearSave, createDefaultSave, loadSave, saveGame } from '../content/save.js'
import { graftSeeds, tuneSeed, tuningParameters } from '../content/seeds.js'

const app = document.querySelector('#app')
const eventLog = createEventLog()
let save = loadSave()
let audio = new AudioEngine(save.settings)
let screen = 'splash'
let chamber = chambers.find((item) => item.id === save.currentChamberId) ?? chambers[0]
let player = createPlayer(chamber.start)
let inventory = buildInventory()
let selectedSeedIndex = 0
let tuningIndex = 0
let scanMode = 'objective'
let plantedSeeds = loadPlanted(chamber.id)
let lastResult = evaluateResonance(chamber, plantedSeeds)

function buildInventory() {
  const base = save.inventoryIds.map((id) => chamberSeeds[id]).filter(Boolean)
  return [...base, ...save.customSeeds]
}

function currentSeed() {
  return inventory[selectedSeedIndex] ?? inventory[0]
}

function currentTuningParameter() {
  return tuningParameters[tuningIndex]
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

function materialsText() {
  return Object.entries(save.materials).map(([key, value]) => `${key} ${value}`).join(', ')
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

function startChamber(nextChamber = chamber) {
  chamber = nextChamber
  player = createPlayer(chamber.start)
  plantedSeeds = loadPlanted(chamber.id)
  lastResult = evaluateResonance(chamber, plantedSeeds)
  save.currentChamberId = chamber.id
  persist()
  screen = 'game'
  audio.updateListener(player)
  audio.chamber(chamber, plantedSeeds)
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
  audio.setSettings(save.settings)
  inventory = buildInventory()
  selectedSeedIndex = 0
  startChamber(chambers[0])
}

function continueGame() {
  startChamber(chamber)
}

function movement(dx, dy) {
  player = movePlayer(player, dx, dy)
  audio.updateListener(player)
  log(`Moved to ${player.x}, ${player.y}. Facing ${player.facing} degrees.`)
}

function rotate(degrees) {
  player = rotatePlayer(player, degrees)
  audio.updateListener(player)
  log(`Rotated to ${player.facing} degrees.`)
}

function scan() {
  const distance = Math.hypot(chamber.target.x - player.x, chamber.target.y - player.y).toFixed(1)
  const side = chamber.target.x < player.x ? 'left' : chamber.target.x > player.x ? 'right' : 'centered'
  if (scanMode === 'objective') {
    audio.scan(player, chamber.target)
    log(`Objective scan: heart is ${distance} steps away, ${side}. Target pitch ${chamber.target.pitchRatio}, pulse ${chamber.target.pulseRate}, brightness ${chamber.target.brightness}, phase ${chamber.target.phase}.`)
  }
  if (scanMode === 'boundaries') log(`Boundary scan: safe work zone extends from ${chamber.start.x - 5}, ${chamber.start.y - 5} to ${chamber.start.x + 5}, ${chamber.start.y + 5}. Current position ${player.x}, ${player.y}.`)
  if (scanMode === 'seeds') log(plantedSeeds.length ? `Seed scan: ${plantedSeeds.map((seed) => `${seed.name} at ${seed.position.x}, ${seed.position.y}`).join('; ')}.` : 'Seed scan: no planted seed objects in this chamber.')
  if (scanMode === 'hazards') log(chamber.hazards?.length ? `Hazard scan: ${chamber.hazards.map((hazard) => hazard.message).join(' ')}` : 'Hazard scan: no active hazards detected.')
}

function plantOrPickUp() {
  const existing = plantedSeeds.findIndex((seed) => seed.position.x === player.x && seed.position.y === player.y)
  if (existing >= 0) {
    const [seed] = plantedSeeds.splice(existing, 1)
    log(`Picked up ${seed.name}.`)
  } else {
    const seed = { ...currentSeed(), position: { x: player.x, y: player.y } }
    plantedSeeds.push(seed)
    audio.seed(seed)
    log(`Planted ${seed.name} at ${player.x}, ${player.y}.`)
  }
  audio.syncSeedObjects(chamber.id, plantedSeeds)
  evaluate()
}

function tune(direction) {
  const seed = currentSeed()
  if (!seed) return
  const parameter = currentTuningParameter()
  inventory[selectedSeedIndex] = tuneSeed(seed, parameter, direction)
  log(`Tuned ${inventory[selectedSeedIndex].name}: ${parameter} is ${inventory[selectedSeedIndex][parameter]}.`)
  audio.seed(inventory[selectedSeedIndex])
  persist()
}

function graft() {
  if (inventory.length < 2) return
  const next = graftSeeds(inventory[0], inventory[1], `graft-${Date.now()}`)
  inventory.push(next)
  selectedSeedIndex = inventory.length - 1
  log(`Grafted ${next.name}. Selected graft has pitch ${next.pitchRatio}, pulse ${next.pulseRate}, brightness ${next.brightness}.`, 'success')
  audio.ui('success')
  persist()
}

function evaluate() {
  lastResult = evaluateResonance(chamber, plantedSeeds)
  audio.setMusicScene('game', { chamber, plantedSeeds, resonance: lastResult })
  if (lastResult.missing.some((message) => message.includes('Mold'))) audio.hazard(chamber, plantedSeeds.at(-1))
  if (!lastResult.solved) {
    persist()
    log(`Resonance ${Math.round(lastResult.score * 100)} percent. ${lastResult.missing[0] ?? 'Keep listening.'}`)
    return
  }
  const firstSolve = !save.solvedChambers.includes(chamber.id)
  if (firstSolve) save.solvedChambers.push(chamber.id)
  const rating = restorationRating(lastResult)
  save = mergeRewards(save, chamber, rating)
  inventory = buildInventory()
  audio.ui('success')
  log(`${chamber.title} solved with ${rating} rating. Rewards now available in the atlas.`, 'success')
  if (firstSolve && chamber.rewards?.codex?.length) log(`Codex updated: ${chamber.rewards.codex.map((id) => codexRecords[id]?.title).filter(Boolean).join(', ')}.`, 'success')
  persist()
  if (chamber.ending) {
    audio.ending(chambers, inventory)
    screen = 'ending'
    render()
  }
}

function resetChamber() {
  plantedSeeds = []
  save.plantedByChamber[chamber.id] = []
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
  const parsed = key === 'reducedMotion' || key === 'minimalVisual' ? value : Number(value)
  save.settings[key] = parsed
  audio.setSettings(save.settings)
  persist()
  render()
}

function cycleScanMode() {
  const modes = ['objective', 'boundaries', 'seeds', 'hazards']
  scanMode = modes[(modes.indexOf(scanMode) + 1) % modes.length]
  log(`Scan mode: ${scanMode}.`)
}

function handleGameKey(event) {
  if (event.key === 'w' || event.key === 'ArrowUp') movement(0, 1)
  else if (event.key === 's' || event.key === 'ArrowDown') movement(0, -1)
  else if (event.key === 'a' || event.key === 'ArrowLeft') movement(-1, 0)
  else if (event.key === 'd' || event.key === 'ArrowRight') movement(1, 0)
  else if (event.key.toLowerCase() === 'q') rotate(-15)
  else if (event.key.toLowerCase() === 'e') rotate(15)
  else if (event.key === ' ') scan()
  else if (event.key.toLowerCase() === 'z') cycleScanMode()
  else if (event.key.toLowerCase() === 'o') log(`Objective: ${chamber.objective} Contract ${contractStatus(chamber)}. ${lastResult.missing[0] ?? 'Requirements are satisfied.'}`)
  else if (event.key.toLowerCase() === 'p') log(`Position: ${player.x}, ${player.y}, facing ${player.facing} degrees. Resonance ${Math.round(lastResult.score * 100)} percent.`)
  else if (event.key.toLowerCase() === 'i') log(`Inventory: ${inventory.map((seed) => seed.name).join(', ')}. Materials: ${materialsText()}.`)
  else if (event.key.toLowerCase() === 'c') log(save.codexIds.length ? `Codex: ${save.codexIds.map((id) => codexRecords[id]?.title).filter(Boolean).join(', ')}.` : 'Codex: no records recovered yet.')
  else if (event.key === 'Enter') plantOrPickUp()
  else if (event.key === 'Tab') {
    event.preventDefault()
    selectedSeedIndex = (selectedSeedIndex + 1) % inventory.length
    log(`Selected ${currentSeed().name}.`)
  } else if (/^[1-4]$/.test(event.key)) {
    selectedSeedIndex = Math.min(Number(event.key) - 1, inventory.length - 1)
    log(`Selected ${currentSeed().name}.`)
  } else if (event.key === '-' || event.key === '[') tune(-1)
  else if (event.key === '=' || event.key === ']') tune(1)
  else if (event.key === 'Shift') {
    tuningIndex = (tuningIndex + 1) % tuningParameters.length
    log(`Tuning parameter: ${currentTuningParameter()}.`)
  } else if (event.key.toLowerCase() === 'g') graft()
  else if (event.key.toLowerCase() === 'r') resetChamber()
  else if (event.key.toLowerCase() === 'h') setScreen('help')
  else if (event.key === 'Escape') setScreen('pause')
}

document.addEventListener('keydown', (event) => {
  if (screen === 'splash' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    beginFromSplash()
  } else if (screen === 'game') handleGameKey(event)
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
  if (action === 'menu') setScreen('menu')
  if (action === 'game') setScreen('game')
  if (action === 'scan') scan()
  if (action === 'scanMode') {
    scanMode = event.target.dataset.mode
    log(`Scan mode: ${scanMode}.`)
  }
  if (action === 'plant') plantOrPickUp()
  if (action === 'tuneDown') tune(-1)
  if (action === 'tuneUp') tune(1)
  if (action === 'graft') graft()
  if (action === 'reset') resetChamber()
  if (action === 'next') setScreen('atlas')
  if (action === 'contract') {
    const next = chambers.find((item) => item.id === event.target.dataset.contract)
    if (next && unlockedContracts().some((item) => item.id === next.id)) startChamber(next)
  }
})

app.addEventListener('input', (event) => {
  const setting = event.target?.dataset?.setting
  if (setting) updateSetting(setting, event.target.type === 'checkbox' ? event.target.checked : event.target.value)
})

function shell(content) {
  const classes = [save.settings.reducedMotion ? 'reduced-motion' : '', save.settings.minimalVisual ? 'minimal-visual' : ''].join(' ')
  app.className = classes
  app.innerHTML = content
}

function menu() {
  audio.setMusicScene('menu')
  shell(`
    <main class="screen menu" aria-labelledby="title">
      <h1 id="title">EchoGraft</h1>
      <p>Repair the Verdancy Ark by listening, planting, tuning, and grafting procedural phonoseeds.</p>
      <nav aria-label="Main menu">
        <button data-action="new">New game</button>
        <button data-action="continue">Continue</button>
        <button data-action="atlas">Restoration atlas</button>
        <button data-action="library">Seed library</button>
        <button data-action="codex">Codex</button>
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
  shell(`
    <main class="game" aria-labelledby="chamber-title">
      <section class="hud" aria-live="polite">
        <h1 id="chamber-title">${chamber.title}</h1>
        <p><strong>Contract:</strong> ${chamber.contractType}; ${chamber.system}; ${contractStatus(chamber)}; scan ${scanMode}.</p>
        <p><strong>Status:</strong> ${lastResult.solved ? 'Solved' : 'Unsolved'}; resonance ${Math.round(lastResult.score * 100)} percent. Press O, P, I, or C for details.</p>
      </section>
      <section class="layout">
        <div class="radar" role="img" aria-label="Abstract chamber radar. Player and planted seeds are also described in text.">
          <div class="heart" style="left:${50 + chamber.target.x * 8}%;top:${50 - chamber.target.y * 8}%"></div>
          <div class="player" style="left:${50 + player.x * 8}%;top:${50 - player.y * 8}%"></div>
          ${plantedSeeds.map((seed) => `<div class="seed" style="left:${50 + seed.position.x * 8}%;top:${50 - seed.position.y * 8}%"></div>`).join('')}
        </div>
        <aside>
          <h2>Actions</h2>
          <button data-action="scan">Scan pulse</button>
          <button data-action="scanMode" data-mode="objective">Objective scan</button>
          <button data-action="scanMode" data-mode="boundaries">Boundary scan</button>
          <button data-action="scanMode" data-mode="seeds">Seed scan</button>
          <button data-action="scanMode" data-mode="hazards">Hazard scan</button>
          <button data-action="plant">Plant or pick up</button>
          <button data-action="tuneDown">Tune down</button>
          <button data-action="tuneUp">Tune up</button>
          <button data-action="graft">Graft first two seeds</button>
          <button data-action="reset">Reset chamber</button>
          <button data-action="atlas">Atlas</button>
          <button data-action="library">Seed library</button>
          <button data-action="help">Help</button>
          <button data-action="settings">Settings</button>
          ${lastResult.solved ? '<button data-action="next">Choose next contract</button>' : ''}
        </aside>
      </section>
      <section class="inventory" aria-label="Seed inventory">
        <h2>Inventory</h2>
        <ol>${inventory.map((seed, index) => `<li${index === selectedSeedIndex ? ' aria-current="true"' : ''}>${index + 1}. ${seed.name}: pitch ${seed.pitchRatio}, pulse ${seed.pulseRate}, brightness ${seed.brightness}, phase ${seed.phase}${seed.grafted ? ', grafted' : ''}</li>`).join('')}</ol>
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
  shell(`
    <main class="screen atlas" aria-labelledby="atlas-title">
      <h1 id="atlas-title">Restoration Atlas</h1>
      <p>Season 1 contracts: ${save.solvedChambers.length} restored. Materials: ${materialsText()}.</p>
      <ol class="contract-list">
        ${chambers.map((item) => {
          const disabled = available.has(item.id) ? '' : ' disabled'
          return `<li>
            <h2>${item.title}</h2>
            <p>${item.system}; ${item.contractType}; ${item.optional ? 'optional' : 'required'}; ${contractStatus(item)}.</p>
            <p>${item.objective}</p>
            <button data-action="contract" data-contract="${item.id}"${disabled}>Enter contract</button>
          </li>`
        }).join('')}
      </ol>
      <button data-action="library">Seed library</button>
      <button data-action="codex">Codex</button>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function library() {
  audio.setMusicScene('menu')
  shell(`
    <main class="screen" aria-labelledby="library-title">
      <h1 id="library-title">Seed Library</h1>
      <p>Selected tuning: ${currentTuningParameter()}. Materials: ${materialsText()}.</p>
      <ol>${inventory.map((seed, index) => `<li${index === selectedSeedIndex ? ' aria-current="true"' : ''}>${index + 1}. ${seed.name}: pitch ${seed.pitchRatio}, pulse ${seed.pulseRate}, brightness ${seed.brightness}, phase ${seed.phase}${seed.grafted ? ', grafted' : ''}</li>`).join('')}</ol>
      <button data-action="graft">Graft first two seeds</button>
      <button data-action="atlas">Atlas</button>
      <button data-action="game">Back to chamber</button>
    </main>
  `)
}

function codex() {
  audio.setMusicScene('menu')
  shell(`
    <main class="screen" aria-labelledby="codex-title">
      <h1 id="codex-title">Codex</h1>
      ${save.codexIds.length ? `<ol>${save.codexIds.map((id) => `<li><h2>${codexRecords[id]?.title ?? id}</h2><p>${codexRecords[id]?.text ?? 'Recovered record.'}</p></li>`).join('')}</ol>` : '<p>No perceptions recovered yet.</p>'}
      <button data-action="atlas">Atlas</button>
      <button data-action="game">Back to chamber</button>
    </main>
  `)
}

function settings() {
  audio.setMusicScene('menu')
  const sliders = ['master', 'ambience', 'music', 'ui', 'seeds', 'hazards', 'scans']
    .map((key) => `<label>${key}<input data-setting="${key}" type="range" min="0" max="1" step="0.05" value="${save.settings[key]}" /></label>`)
    .join('')
  shell(`
    <main class="screen" aria-labelledby="settings-title">
      <h1 id="settings-title">Settings</h1>
      <form>${sliders}
        <label><input data-setting="reducedMotion" type="checkbox" ${save.settings.reducedMotion ? 'checked' : ''} /> Reduced motion</label>
        <label><input data-setting="minimalVisual" type="checkbox" ${save.settings.minimalVisual ? 'checked' : ''} /> Minimal visual mode</label>
      </form>
      <button data-action="game">Back to game</button>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function help() {
  audio.setMusicScene(screen === 'game' ? 'game' : 'menu', { chamber, plantedSeeds, resonance: lastResult })
  shell(`
    <main class="screen" aria-labelledby="help-title">
      <h1 id="help-title">Help</h1>
      <p>WASD or arrow keys move. Q and E rotate. Space scans. Z cycles scan mode. Enter plants or picks up. Tab cycles seeds. 1 through 4 select seeds. Minus and equals tune. Shift cycles the tuning parameter. G grafts. O gives objective, P position, I inventory, C codex, R resets, H opens help, Escape pauses.</p>
      <p>Listen to scan pitch and panning, then match the objective text. Every important cue appears in the caption log.</p>
      <button data-action="game">Back to game</button>
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
      <h1 id="pause-title">Paused</h1>
      <button data-action="game">Resume</button>
      <button data-action="atlas">Atlas</button>
      <button data-action="settings">Settings</button>
      <button data-action="help">Help</button>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function ending() {
  audio.setMusicScene('ending', { inventory })
  shell(`
    <main class="screen ending" aria-labelledby="ending-title">
      <h1 id="ending-title">The Verdancy Ark Sings Again</h1>
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
  if (screen === 'settings') settings()
  if (screen === 'help') help()
  if (screen === 'credits') credits()
  if (screen === 'pause') pause()
  if (screen === 'ending') ending()
}

render()

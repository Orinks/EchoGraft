import './styles.css'
import { AudioEngine } from '../engine/audio.js'
import { chambers, chamberSeeds } from '../content/chambers.js'
import { createEventLog } from '../content/log.js'
import { createPlayer, movePlayer, rotatePlayer } from '../content/player.js'
import { evaluateResonance, unlockNext } from '../content/resonance.js'
import { clearSave, createDefaultSave, loadSave, saveGame } from '../content/save.js'
import { graftSeeds, starterSeeds, tuneSeed, tuningParameters } from '../content/seeds.js'

const app = document.querySelector('#app')
const eventLog = createEventLog()
let save = loadSave()
let audio = new AudioEngine(save.settings)
let screen = 'menu'
let chamber = chambers.find((item) => item.id === save.currentChamberId) ?? chambers[0]
let player = createPlayer(chamber.start)
let inventory = buildInventory()
let selectedSeedIndex = 0
let tuningIndex = 0
let plantedSeeds = []
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

function log(message, type = 'info') {
  eventLog.push(message, type)
  render()
}

function persist() {
  save.settings = { ...save.settings }
  save.currentChamberId = chamber.id
  save.customSeeds = inventory.filter((seed) => seed.grafted)
  saveGame(save)
}

function startChamber(nextChamber = chamber) {
  chamber = nextChamber
  player = createPlayer(chamber.start)
  plantedSeeds = []
  lastResult = evaluateResonance(chamber, plantedSeeds)
  save.currentChamberId = chamber.id
  persist()
  screen = 'game'
  log(`${chamber.title}. ${chamber.objective}`)
}

async function ensureAudio() {
  const started = await audio.start()
  if (started) audio.ui('confirm')
}

function newGame() {
  clearSave()
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
  log(`Moved to ${player.x}, ${player.y}. Facing ${player.facing} degrees.`)
}

function rotate(degrees) {
  player = rotatePlayer(player, degrees)
  log(`Rotated to ${player.facing} degrees.`)
}

function scan() {
  audio.scan(player, chamber.target)
  const distance = Math.hypot(chamber.target.x - player.x, chamber.target.y - player.y).toFixed(1)
  const side = chamber.target.x < player.x ? 'left' : chamber.target.x > player.x ? 'right' : 'centered'
  log(`Scan pulse: heart is ${distance} steps away, ${side}. Target pitch ${chamber.target.pitchRatio}, pulse ${chamber.target.pulseRate}, brightness ${chamber.target.brightness}, phase ${chamber.target.phase}.`)
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
  if (lastResult.missing.some((message) => message.includes('Mold'))) audio.hazard()
  if (!lastResult.solved) {
    log(`Resonance ${Math.round(lastResult.score * 100)} percent. ${lastResult.missing[0] ?? 'Keep listening.'}`)
    return
  }
  if (!save.solvedChambers.includes(chamber.id)) save.solvedChambers.push(chamber.id)
  audio.ui('success')
  log(`${chamber.title} solved. The garden blooms.`, 'success')
  persist()
  if (chamber.ending) {
    audio.ending()
    screen = 'ending'
  }
}

function nextChamber() {
  const index = chambers.findIndex((item) => item.id === chamber.id)
  const next = chambers[index + 1]
  if (next) startChamber(next)
  else screen = 'ending'
}

function resetChamber() {
  startChamber(chamber)
  log('Chamber reset.')
}

function setScreen(next) {
  screen = next
  render()
}

function updateSetting(key, value) {
  const parsed = key === 'reducedMotion' || key === 'minimalVisual' ? value : Number(value)
  save.settings[key] = parsed
  audio.setSettings(save.settings)
  persist()
  render()
}

function handleGameKey(event) {
  if (event.key === 'w' || event.key === 'ArrowUp') movement(0, 1)
  else if (event.key === 's' || event.key === 'ArrowDown') movement(0, -1)
  else if (event.key === 'a' || event.key === 'ArrowLeft') movement(-1, 0)
  else if (event.key === 'd' || event.key === 'ArrowRight') movement(1, 0)
  else if (event.key.toLowerCase() === 'q') rotate(-15)
  else if (event.key.toLowerCase() === 'e') rotate(15)
  else if (event.key === ' ') scan()
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
  if (screen === 'game') handleGameKey(event)
  else if (event.key === 'Escape') setScreen('game')
})

app.addEventListener('click', async (event) => {
  const action = event.target?.dataset?.action
  if (!action) return
  await ensureAudio()
  if (action === 'new') newGame()
  if (action === 'continue') continueGame()
  if (action === 'settings') setScreen('settings')
  if (action === 'help') setScreen('help')
  if (action === 'credits') setScreen('credits')
  if (action === 'menu') setScreen('menu')
  if (action === 'game') setScreen('game')
  if (action === 'scan') scan()
  if (action === 'plant') plantOrPickUp()
  if (action === 'tuneDown') tune(-1)
  if (action === 'tuneUp') tune(1)
  if (action === 'graft') graft()
  if (action === 'reset') resetChamber()
  if (action === 'next') nextChamber()
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
  shell(`
    <main class="screen menu" aria-labelledby="title">
      <h1 id="title">EchoGraft</h1>
      <p>Repair the Verdancy Ark by listening, planting, tuning, and grafting procedural phonoseeds.</p>
      <nav aria-label="Main menu">
        <button data-action="new">New game</button>
        <button data-action="continue">Continue</button>
        <button data-action="settings">Settings</button>
        <button data-action="help">Help</button>
        <button data-action="credits">Credits</button>
      </nav>
    </main>
  `)
}

function game() {
  const unlocked = unlockNext(chambers, save.solvedChambers)
  shell(`
    <main class="game" aria-labelledby="chamber-title">
      <section class="hud" aria-live="polite">
        <h1 id="chamber-title">${chamber.title}</h1>
        <p><strong>Objective:</strong> ${chamber.objective}</p>
        <p><strong>Status:</strong> ${lastResult.solved ? 'Solved' : 'Unsolved'}; resonance ${Math.round(lastResult.score * 100)} percent.</p>
        <p><strong>Player:</strong> ${player.x}, ${player.y}, facing ${player.facing} degrees.</p>
        <p><strong>Selected seed:</strong> ${currentSeed()?.name}; tuning ${currentTuningParameter()} value ${currentSeed()?.[currentTuningParameter()]}.</p>
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
          <button data-action="plant">Plant or pick up</button>
          <button data-action="tuneDown">Tune down</button>
          <button data-action="tuneUp">Tune up</button>
          <button data-action="graft">Graft first two seeds</button>
          <button data-action="reset">Reset chamber</button>
          <button data-action="help">Help</button>
          <button data-action="settings">Settings</button>
          ${lastResult.solved && unlocked.includes(chambers[chambers.findIndex((item) => item.id === chamber.id) + 1]?.id) ? '<button data-action="next">Next chamber</button>' : ''}
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

function settings() {
  const sliders = ['master', 'ambience', 'ui', 'seeds', 'hazards', 'scans']
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
  shell(`
    <main class="screen" aria-labelledby="help-title">
      <h1 id="help-title">Help</h1>
      <p>WASD or arrow keys move. Q and E rotate. Space scans. Enter plants or picks up. Tab cycles seeds. 1 through 4 select seeds. Minus and equals tune. Shift cycles the tuning parameter. G grafts. R resets. H opens help. Escape pauses.</p>
      <p>Listen to scan pitch and panning, then match the objective text. Every important cue appears in the caption log.</p>
      <button data-action="game">Back to game</button>
    </main>
  `)
}

function credits() {
  shell(`
    <main class="screen" aria-labelledby="credits-title">
      <h1 id="credits-title">Credits</h1>
      <p>EchoGraft v0.1.0. Built as a procedural Syngen/Web Audio game. No external audio assets are used.</p>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function pause() {
  shell(`
    <main class="screen" aria-labelledby="pause-title">
      <h1 id="pause-title">Paused</h1>
      <button data-action="game">Resume</button>
      <button data-action="settings">Settings</button>
      <button data-action="help">Help</button>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function ending() {
  shell(`
    <main class="screen ending" aria-labelledby="ending-title">
      <h1 id="ending-title">The Verdancy Ark Sings Again</h1>
      <p>The repaired resonance gardens answer one another. Every grafted voice becomes part of a living orbital chord.</p>
      <button data-action="menu">Main menu</button>
    </main>
  `)
}

function render() {
  if (screen === 'menu') menu()
  if (screen === 'game') game()
  if (screen === 'settings') settings()
  if (screen === 'help') help()
  if (screen === 'credits') credits()
  if (screen === 'pause') pause()
  if (screen === 'ending') ending()
}

render()

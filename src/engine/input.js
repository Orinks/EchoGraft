import { syngen } from './syngen.js'

const repeatSeconds = 0.18

function keyboardDown(keyboard = {}, ...codes) {
  return codes.some((code) => Boolean(keyboard[code]))
}

function gamepadDown(gamepad = {}, ...buttons) {
  return buttons.some((button) => Boolean(gamepad.digital?.[button]))
}

function keyboardDigitIndex(keyboard = {}, max = 10) {
  for (let index = 0; index < max; index += 1) {
    const digit = index === 9 ? 0 : index + 1
    if (keyboard[`Digit${digit}`]) return index
  }
  return -1
}

export function syngenInputSnapshot(event) {
  const keyboard = syngen?.input?.keyboard?.get?.() ?? {}
  const gamepad = syngen?.input?.gamepad?.get?.() ?? { analog: {}, axis: {}, digital: {} }

  if (event?.code) keyboard[event.code] = event.type === 'keyup' ? false : true

  return {
    gamepad,
    keyboard,
  }
}

export function inputIntentFromSnapshot(snapshot = {}) {
  const keyboard = snapshot.keyboard ?? {}
  const gamepad = snapshot.gamepad ?? {}
  const axisX = gamepad.axis?.[0] ?? 0
  const axisY = gamepad.axis?.[1] ?? 0

  if (keyboardDown(keyboard, 'KeyW', 'ArrowUp')) return { action: 'move', dx: 0, dy: 1, source: 'keyboard' }
  if (gamepadDown(gamepad, 12) || axisY < -0.55) return { action: 'move', dx: 0, dy: 1, source: 'gamepad' }
  if (keyboardDown(keyboard, 'KeyS', 'ArrowDown')) return { action: 'move', dx: 0, dy: -1, source: 'keyboard' }
  if (gamepadDown(gamepad, 13) || axisY > 0.55) return { action: 'move', dx: 0, dy: -1, source: 'gamepad' }
  if (keyboardDown(keyboard, 'KeyA', 'ArrowLeft')) return { action: 'move', dx: -1, dy: 0, source: 'keyboard' }
  if (gamepadDown(gamepad, 14) || axisX < -0.55) return { action: 'move', dx: -1, dy: 0, source: 'gamepad' }
  if (keyboardDown(keyboard, 'KeyD', 'ArrowRight')) return { action: 'move', dx: 1, dy: 0, source: 'keyboard' }
  if (gamepadDown(gamepad, 15) || axisX > 0.55) return { action: 'move', dx: 1, dy: 0, source: 'gamepad' }
  if (keyboardDown(keyboard, 'Space') && keyboardDown(keyboard, 'ShiftLeft', 'ShiftRight')) return { action: 'cycleScanMode', source: 'keyboard' }
  if (keyboardDown(keyboard, 'Space')) return { action: 'scan', source: 'keyboard' }
  if (gamepadDown(gamepad, 1)) return { action: 'scan', source: 'gamepad' }
  if (keyboardDown(keyboard, 'Enter')) return { action: 'plant', source: 'keyboard' }
  if (gamepadDown(gamepad, 0)) return { action: 'plant', source: 'gamepad' }
  if (keyboardDown(keyboard, 'Tab') && keyboardDown(keyboard, 'ShiftLeft', 'ShiftRight')) return { action: 'previousSeed', source: 'keyboard' }
  if (keyboardDown(keyboard, 'Tab')) return { action: 'cycleSeed', source: 'keyboard' }
  if (gamepadDown(gamepad, 5)) return { action: 'cycleSeed', source: 'gamepad' }
  if (keyboardDown(keyboard, 'ShiftLeft', 'ShiftRight') && keyboardDigitIndex(keyboard) >= 0) return { action: 'selectTuningParameter', index: keyboardDigitIndex(keyboard), source: 'keyboard' }
  if (keyboardDigitIndex(keyboard, 4) >= 0) return { action: 'selectSeed', index: keyboardDigitIndex(keyboard, 4), source: 'keyboard' }
  if (keyboardDown(keyboard, 'BracketLeft', 'Minus')) return { action: 'tuneDown', source: 'keyboard' }
  if (keyboardDown(keyboard, 'BracketRight', 'Equal')) return { action: 'tuneUp', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyG')) return { action: 'graft', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyN')) return { action: 'restoreAdvance', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyO')) return { action: 'objectiveInfo', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyP')) return { action: 'positionInfo', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyI')) return { action: 'inventoryInfo', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyL') && keyboardDown(keyboard, 'ShiftLeft', 'ShiftRight')) return { action: 'recentLog', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyL')) return { action: 'latestLog', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyX')) return { action: 'boundaryInfo', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyV')) return { action: 'plantedVoices', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyC')) return { action: 'codexInfo', source: 'keyboard' }
  if (keyboardDown(keyboard, 'KeyZ')) return { action: 'cycleScanMode', source: 'keyboard' }
  if (gamepadDown(gamepad, 4)) return { action: 'cycleScanMode', source: 'gamepad' }
  if (keyboardDown(keyboard, 'Escape')) return { action: 'pause', source: 'keyboard' }
  if (gamepadDown(gamepad, 9)) return { action: 'pause', source: 'gamepad' }
  return undefined
}

export function createSyngenInputPoller(callback, options = {}) {
  let lastIntentKey = ''
  let lastIntentTime = 0
  const repeat = options.repeatSeconds ?? repeatSeconds
  const clock = options.clock ?? (() => Date.now() / 1000)

  return {
    poll(snapshot = syngenInputSnapshot()) {
      const intent = inputIntentFromSnapshot(snapshot)
      const now = clock()
      const intentKey = intent ? JSON.stringify(intent) : ''

      if (!intent) {
        lastIntentKey = ''
        return undefined
      }

      if (intentKey !== lastIntentKey || now - lastIntentTime >= repeat) {
        lastIntentKey = intentKey
        lastIntentTime = now
        callback(intent, snapshot)
      }

      return intent
    },
    start() {
      if (!syngen?.loop?.on || !syngen?.input?.keyboard || !syngen?.input?.gamepad) return false
      syngen.loop.on('frame', () => this.poll())
      return true
    },
  }
}

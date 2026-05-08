import { describe, expect, it } from 'vitest'
import { createSyngenInputPoller, inputIntentFromSnapshot, syngenInputSnapshot } from '../src/engine/input.js'

describe('syngen input state', () => {
  it('normalizes keyboard state into game intents', () => {
    const snapshot = syngenInputSnapshot({ code: 'KeyW', type: 'keydown' })

    expect(snapshot.keyboard.KeyW).toBe(true)
    expect(inputIntentFromSnapshot(snapshot)).toEqual({ action: 'move', dx: 0, dy: 1, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ArrowUp: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'move', dx: 0, dy: 1, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyS: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'move', dx: 0, dy: -1, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ArrowDown: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'move', dx: 0, dy: -1, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyA: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'move', dx: -1, dy: 0, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ArrowLeft: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'move', dx: -1, dy: 0, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyD: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'move', dx: 1, dy: 0, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ArrowRight: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'move', dx: 1, dy: 0, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { Space: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'scan', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ShiftLeft: true, Space: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'cycleScanMode', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { Enter: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'plant', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ShiftLeft: true, Tab: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'previousSeed', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { Digit2: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'selectSeed', index: 1, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ShiftLeft: true, Digit3: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'selectTuningParameter', index: 2, source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { BracketLeft: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'tuneDown', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { BracketRight: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'tuneUp', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyG: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'graft', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyN: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'restoreAdvance', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyO: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'objectiveInfo', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyP: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'positionInfo', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyI: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'inventoryInfo', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyL: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'latestLog', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { ShiftLeft: true, KeyL: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'recentLog', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyX: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'boundaryInfo', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyV: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'plantedVoices', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { KeyC: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'codexInfo', source: 'keyboard' })
    expect(inputIntentFromSnapshot({ keyboard: { Escape: true }, gamepad: { axis: {}, digital: {} } })).toEqual({ action: 'pause', source: 'keyboard' })
  })

  it('normalizes gamepad state into game intents', () => {
    expect(inputIntentFromSnapshot({ gamepad: { axis: { 0: 0.8 }, digital: {} }, keyboard: {} })).toEqual({ action: 'move', dx: 1, dy: 0, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: { 0: -0.8 }, digital: {} }, keyboard: {} })).toEqual({ action: 'move', dx: -1, dy: 0, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: { 1: -0.8 }, digital: {} }, keyboard: {} })).toEqual({ action: 'move', dx: 0, dy: 1, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: { 1: 0.8 }, digital: {} }, keyboard: {} })).toEqual({ action: 'move', dx: 0, dy: -1, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 12: true } }, keyboard: {} })).toEqual({ action: 'move', dx: 0, dy: 1, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 13: true } }, keyboard: {} })).toEqual({ action: 'move', dx: 0, dy: -1, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 14: true } }, keyboard: {} })).toEqual({ action: 'move', dx: -1, dy: 0, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 15: true } }, keyboard: {} })).toEqual({ action: 'move', dx: 1, dy: 0, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 0: true } }, keyboard: {} })).toEqual({ action: 'plant', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 1: true } }, keyboard: {} })).toEqual({ action: 'scan', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 2: true } }, keyboard: {} })).toEqual({ action: 'cycleSeed', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 3: true } }, keyboard: {} })).toEqual({ action: 'plant', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 4: true } }, keyboard: {} })).toEqual({ action: 'tuneDown', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 5: true } }, keyboard: {} })).toEqual({ action: 'tuneUp', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 9: true } }, keyboard: {} })).toEqual({ action: 'pause', source: 'gamepad' })
  })

  it('throttles repeated Syngen input poll intents', () => {
    const intents = []
    let now = 1
    const poller = createSyngenInputPoller((intent) => intents.push(intent), { clock: () => now, repeatSeconds: 0.2 })
    const snapshot = { gamepad: { axis: {}, digital: { 1: true } }, keyboard: {} }

    poller.poll(snapshot)
    poller.poll(snapshot)
    now = 1.21
    poller.poll(snapshot)
    poller.poll({ gamepad: { axis: {}, digital: {} }, keyboard: {} })
    poller.poll(snapshot)

    expect(intents).toEqual([
      { action: 'scan', source: 'gamepad' },
      { action: 'scan', source: 'gamepad' },
      { action: 'scan', source: 'gamepad' },
    ])
  })
})

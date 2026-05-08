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
  })

  it('normalizes gamepad state into game intents', () => {
    expect(inputIntentFromSnapshot({ gamepad: { axis: { 0: 0.8 }, digital: {} }, keyboard: {} })).toEqual({ action: 'move', dx: 1, dy: 0, source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 0: true } }, keyboard: {} })).toEqual({ action: 'plant', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 1: true } }, keyboard: {} })).toEqual({ action: 'scan', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 4: true } }, keyboard: {} })).toEqual({ action: 'cycleScanMode', source: 'gamepad' })
    expect(inputIntentFromSnapshot({ gamepad: { axis: {}, digital: { 5: true } }, keyboard: {} })).toEqual({ action: 'cycleSeed', source: 'gamepad' })
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

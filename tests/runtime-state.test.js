import { describe, expect, it } from 'vitest'
import { createSyngenStateBridge, runtimeStateKey } from '../src/engine/runtime-state.js'

function fakeStateApi() {
  const handlers = { export: [], import: [], reset: [] }
  return {
    emit(event, payload) {
      for (const handler of handlers[event]) handler(payload)
    },
    export() {
      const data = {}
      this.emit('export', data)
      return data
    },
    import(data = {}) {
      this.reset()
      this.emit('import', data)
    },
    on(event, handler) {
      handlers[event].push(handler)
    },
    reset() {
      this.emit('reset')
    },
  }
}

describe('Syngen runtime state bridge', () => {
  it('exports, imports, and resets EchoGraft runtime state through syngen.state events', () => {
    const events = []
    const stateApi = fakeStateApi()
    const bridge = createSyngenStateBridge({
      exportState: () => ({ save: { currentChamberId: 'tutorial' }, screen: 'game' }),
      importState: (state) => events.push(['import', state.screen]),
      resetState: () => events.push(['reset']),
    }, stateApi)

    expect(bridge.attach()).toBe(true)
    expect(bridge.export()).toEqual({
      [runtimeStateKey]: { save: { currentChamberId: 'tutorial' }, screen: 'game' },
    })

    bridge.import({ [runtimeStateKey]: { screen: 'atlas' } })
    bridge.reset()

    expect(events).toEqual([
      ['reset'],
      ['import', 'atlas'],
      ['reset'],
    ])
  })
})

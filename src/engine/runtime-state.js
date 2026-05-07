import { syngen } from './syngen.js'

export const runtimeStateKey = 'echograft'

export function createSyngenStateBridge({ exportState, importState, resetState }, stateApi = syngen?.state) {
  const bridge = {
    attach() {
      if (!stateApi?.on) return false
      stateApi.on('export', (data = {}) => {
        data[runtimeStateKey] = exportState()
      })
      stateApi.on('import', (data = {}) => {
        if (data[runtimeStateKey]) importState(data[runtimeStateKey])
      })
      stateApi.on('reset', () => resetState())
      return true
    },
    export() {
      return stateApi?.export ? stateApi.export() : { [runtimeStateKey]: exportState() }
    },
    import(data = {}) {
      if (stateApi?.import) stateApi.import(data)
      else if (data[runtimeStateKey]) importState(data[runtimeStateKey])
    },
    reset() {
      if (stateApi?.reset) stateApi.reset()
      else resetState()
    },
  }

  return bridge
}

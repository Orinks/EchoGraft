import { syngen } from './syngen.js'

export function listenerVectorFromPlayer(player = {}) {
  return {
    x: player.x ?? 0,
    y: player.y ?? 0,
    z: player.z ?? 0,
  }
}

export function listenerEulerFromPlayer(player = {}, utility = syngen?.utility) {
  const degreesToRadians = utility?.degreesToRadians ?? ((degrees) => degrees * Math.PI / 180)
  return {
    pitch: 0,
    roll: 0,
    yaw: degreesToRadians(player.facing ?? 0),
  }
}

export function defaultListenerPositionApi() {
  if (!syngen?.position) return undefined
  if (!syngen.position.setVector || !syngen.position.setEuler) return undefined
  return syngen.position
}

export function createListenerPositionState(positionApi = defaultListenerPositionApi(), utility = syngen?.utility) {
  return {
    update(player = {}) {
      if (!positionApi?.setVector || !positionApi?.setEuler) return false
      const vector = listenerVectorFromPlayer(player)
      const euler = listenerEulerFromPlayer(player, utility)
      positionApi.setVector(vector)
      positionApi.setEuler(euler)
      return { euler, vector }
    },
  }
}

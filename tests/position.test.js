import { describe, expect, it } from 'vitest'
import { createListenerPositionState, listenerEulerFromPlayer, listenerVectorFromPlayer } from '../src/engine/position.js'

describe('listener position bridge', () => {
  it('maps player coordinates to a Syngen listener vector', () => {
    expect(listenerVectorFromPlayer({ x: 2, y: -3 })).toEqual({ x: 2, y: -3, z: 0 })
  })

  it('maps player facing to Syngen listener yaw', () => {
    const euler = listenerEulerFromPlayer({ facing: 90 })
    expect(euler.pitch).toBe(0)
    expect(euler.roll).toBe(0)
    expect(euler.yaw).toBeCloseTo(Math.PI / 2)
  })

  it('updates syngen.position vector and orientation together', () => {
    const calls = []
    const positionApi = {
      setEuler: (euler) => calls.push(['euler', euler]),
      setVector: (vector) => calls.push(['vector', vector]),
    }
    const state = createListenerPositionState(positionApi)
    const snapshot = state.update({ facing: 180, x: 4, y: 5 })

    expect(snapshot.vector).toEqual({ x: 4, y: 5, z: 0 })
    expect(snapshot.euler.yaw).toBeCloseTo(Math.PI)
    expect(calls).toEqual([
      ['vector', { x: 4, y: 5, z: 0 }],
      ['euler', expect.objectContaining({ pitch: 0, roll: 0 })],
    ])
  })

  it('reports unsupported Syngen position APIs without throwing', () => {
    expect(createListenerPositionState(null).update({ x: 1, y: 2 })).toBe(false)
  })
})

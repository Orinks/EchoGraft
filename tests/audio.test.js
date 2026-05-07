import { describe, expect, it } from 'vitest'
import { chambers } from '../src/content/chambers.js'
import { createPlayer, movePlayer } from '../src/content/player.js'
import { AudioEngine } from '../src/engine/audio.js'

function movementVoices(player, previous, chamber) {
  const audio = new AudioEngine()
  const voices = []

  audio.updateListener = () => {}
  audio.voice = (payload) => voices.push(payload)
  audio.movement(player, previous, chamber)

  return voices
}

describe('audio movement cues', () => {
  it('spatializes every footstep at the current player position', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const previous = createPlayer(chamber.start)
    const player = movePlayer(previous, 0, 1, chamber)
    const voices = movementVoices(player, previous, chamber)

    expect(voices[0]).toMatchObject({
      category: 'ui',
      position: { x: player.x, y: player.y },
      spatial: true,
    })
  })

  it('still spatializes the footstep cue when a boundary holds the step', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const previous = createPlayer({ x: chamber.start.x, y: chamber.start.y + 5, facing: 0 })
    const player = movePlayer(previous, 0, 1, chamber)
    const voices = movementVoices(player, previous, chamber)

    expect(player).toMatchObject(previous)
    expect(voices[0]).toMatchObject({
      category: 'ui',
      position: { x: player.x, y: player.y },
      spatial: true,
    })
  })
})

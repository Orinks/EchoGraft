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
      spatial: true,
    })
    expect(voices[0].position).toMatchObject({ x: player.x })
    expect(voices[0].position.y).toBeGreaterThan(player.y)
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

  it('changes footstep timbre by movement surface type', () => {
    const waterChamber = chambers.find((item) => item.system === 'Water')
    const canopyChamber = chambers.find((item) => item.system === 'Canopy')
    const memoryChamber = chambers.find((item) => item.system === 'Memory')
    const waterPlayer = movePlayer(createPlayer(waterChamber.start), 0, 1, waterChamber)
    const canopyPlayer = movePlayer(createPlayer(canopyChamber.start), 0, 1, canopyChamber)
    const memoryPlayer = movePlayer(createPlayer(memoryChamber.start), 0, 1, memoryChamber)
    const waterTone = movementVoices(waterPlayer, createPlayer(waterChamber.start), waterChamber)[0].tone
    const canopyTone = movementVoices(canopyPlayer, createPlayer(canopyChamber.start), canopyChamber)[0].tone
    const memoryTone = movementVoices(memoryPlayer, createPlayer(memoryChamber.start), memoryChamber)[0].tone

    expect(waterTone).toMatchObject({ mode: 'am', type: 'sine' })
    expect(canopyTone).toMatchObject({ brightness: 0.72, mode: 'additive' })
    expect(memoryTone).toMatchObject({ brightness: 0.28, mode: 'am' })
    expect(new Set([waterTone.type, canopyTone.type, memoryTone.type]).size).toBeGreaterThan(1)
  })

  it('moves footstep placement toward the movement direction', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const previous = createPlayer(chamber.start)
    const northPlayer = movePlayer(previous, 0, 1, chamber)
    const eastPlayer = movePlayer(previous, 1, 0, chamber)
    const northPosition = movementVoices(northPlayer, previous, chamber)[0].position
    const eastPosition = movementVoices(eastPlayer, previous, chamber)[0].position

    expect(northPosition.x).toBe(northPlayer.x)
    expect(northPosition.y).toBeGreaterThan(northPlayer.y)
    expect(eastPosition.x).toBeGreaterThan(eastPlayer.x)
    expect(eastPosition.y).toBe(eastPlayer.y)
  })
})

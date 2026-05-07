import { describe, expect, it } from 'vitest'
import { chambers } from '../src/content/chambers.js'
import { chamberCurrent, createPlayer, movePlayer, movementFeedback, movementSurface } from '../src/content/player.js'

describe('movement', () => {
  it('keeps early chamber movement grid-like and bounded by audible walls', () => {
    const chamber = chambers.find((item) => item.id === 'tutorial')
    const player = createPlayer(chamber.start)
    const moved = movePlayer(player, 0, 1, chamber)
    const atWall = movePlayer(createPlayer({ x: chamber.start.x, y: chamber.start.y + 5, facing: 0 }), 0, 1, chamber)

    expect(moved).toMatchObject({ x: 0, y: -1 })
    expect(atWall.y).toBe(chamber.start.y + 5)
  })

  it('describes movement with no-vision audio landmarks and surface feedback', () => {
    const chamber = chambers.find((item) => item.id === 'binaural')
    const previous = createPlayer(chamber.start)
    const player = movePlayer(previous, -1, 0, chamber)
    const feedback = movementFeedback(player, previous, chamber)

    expect(feedback.moved).toBe(true)
    expect(feedback.surface).toBe('compass rail')
    expect(feedback.text).toContain('Movement audio: spatial footstep')
    expect(feedback.text).toContain('wall')
    expect(feedback.text).toContain('current between start and heart')
    expect(feedback.text).toContain('landmark heart')
  })

  it('varies movement surface by Ark system', () => {
    expect(movementSurface({ system: 'Water' })).toBe('wet channel tile')
    expect(movementSurface({ system: 'Canopy' })).toBe('leafglass lattice')
    expect(movementSurface({ system: 'Memory Orchard' })).toBe('archive loam')
  })

  it('lets water-current navigation assist movement toward the pump heart', () => {
    const chamber = chambers.find((item) => item.id === 'pitch')
    const player = createPlayer(chamber.start)
    const withCurrent = movePlayer(player, 0, 1, chamber)
    const againstCurrent = movePlayer(withCurrent, 0, -1, chamber)
    const feedback = movementFeedback(withCurrent, player, chamber)

    expect(chamberCurrent(chamber)).toMatchObject({ dx: 0, dy: 1, name: 'pump current' })
    expect(withCurrent.y).toBe(player.y + 2)
    expect(againstCurrent.y).toBe(withCurrent.y - 1)
    expect(feedback.text).toContain('current pump current assisted this step')
    expect(feedback.text).toContain('north toward the water pump heart')
  })
})

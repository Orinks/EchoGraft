import { describe, expect, it } from 'vitest'
import { chambers } from '../src/content/chambers.js'
import { createWorldLayoutIndex, worldLayoutPoint } from '../src/content/world-layout.js'

describe('world layout', () => {
  it('derives stable chamber points for the restoration atlas', () => {
    const point = worldLayoutPoint(chambers.find((chamber) => chamber.id === 'binaural'), 1)

    expect(point).toMatchObject({
      chamberId: 'binaural',
      season: 1,
      system: 'Navigation',
    })
    expect(point.distanceFromStart).toBeGreaterThan(0)
    expect(point.text).toContain('world')
  })

  it('indexes chambers with nearest and chunk queries', () => {
    const layout = createWorldLayoutIndex(chambers)
    const first = layout.points[0]
    const nearest = layout.nearestTo({ x: first.x + 0.1, y: first.y + 0.1 }, 2)
    const nearby = layout.retrieve({ height: 12, width: 12, x: first.x - 1, y: first.y - 1 })
    const chunk = layout.chunkAt(first)

    expect(layout.text).toContain('spatial vectors, chamber lookup, generators, and noise fields')
    expect(nearest?.chamberId).toBe(first.chamberId)
    expect(nearby.map((point) => point.chamberId)).toContain(first.chamberId)
    expect(chunk.text).toContain('generated resonance field')
    expect(chunk.density).toBeGreaterThanOrEqual(0)
    expect(chunk.density).toBeLessThanOrEqual(1)
  })
})

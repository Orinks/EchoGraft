import { describe, expect, it } from 'vitest'
import { scanPulse, windCarriedEcho } from '../src/content/scan.js'

describe('scan pulse', () => {
  it('reports direction, distance, and delay trail for no-vision scanning', () => {
    const pulse = scanPulse({ x: 3, y: -1 }, { x: -1, y: 2, pitchRatio: 1, pulseRate: 1 })

    expect(pulse.distance).toBe(5)
    expect(pulse.direction).toMatchObject({ horizontal: 'west', side: 'left', vertical: 'north' })
    expect(pulse.delayTrail).toHaveLength(3)
    expect(pulse.delayTrail[2]).toBeGreaterThan(pulse.delayTrail[1])
    expect(pulse.text).toContain('Scan pulse')
  })

  it('keeps nearby scan pulses short and bright', () => {
    const pulse = scanPulse({ x: 0, y: 0 }, { x: 0, y: 1 })

    expect(pulse.brightness).toBeGreaterThan(0.8)
    expect(pulse.duration).toBeLessThan(0.25)
  })

  it('adds wind-carried echo text when a chamber declares a draft', () => {
    const pulse = scanPulse(
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { windEcho: { dx: 1, dy: 0, name: 'east draft', text: 'echo leans into the weather corridor' } },
    )

    expect(pulse.windEcho.direction.horizontal).toBe('east')
    expect(pulse.windEcho.carriedDelay).toBeGreaterThan(pulse.delayTrail[1])
    expect(pulse.text).toContain('Wind-carried echo')
  })

  it('describes standalone wind-carried echo direction and delay', () => {
    const echo = windCarriedEcho({ dx: -1, dy: 1, name: 'crossdraft', text: 'scan bends around glass' }, 4)

    expect(echo.direction).toMatchObject({ horizontal: 'west', vertical: 'north' })
    expect(echo.text).toContain('crossdraft')
  })
})

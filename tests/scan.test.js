import { describe, expect, it } from 'vitest'
import { boundaryScanState, chamberCompassCue, heartScanState, navigationScanState, scanPulse, scanRangeState, windCarriedEcho } from '../src/content/scan.js'

describe('scan pulse', () => {
  it('reports direction, distance, and delay trail for no-vision scanning', () => {
    const pulse = scanPulse({ x: 3, y: -1 }, { x: -1, y: 2, pitchRatio: 1, pulseRate: 1 })

    expect(pulse.distance).toBe(5)
    expect(pulse.direction).toMatchObject({ horizontal: 'west', side: 'left', vertical: 'north' })
    expect(pulse.delayTrail).toHaveLength(3)
    expect(pulse.delayTrail[2]).toBeGreaterThan(pulse.delayTrail[1])
    expect(pulse.range).toBe(8)
    expect(pulse.text).toContain('Scan pulse')
  })

  it('keeps nearby scan pulses short and bright', () => {
    const pulse = scanPulse({ x: 0, y: 0 }, { x: 0, y: 1 })

    expect(pulse.brightness).toBeGreaterThan(0.8)
    expect(pulse.duration).toBeLessThan(0.25)
  })

  it('summarizes heart scan direction, distance, and objective together', () => {
    const heartScan = heartScanState(
      { x: 0, y: -2 },
      { objective: 'Restore the intake heart.', target: { x: 0, y: 1 } },
      8,
    )

    expect(heartScan.distance).toBe(3)
    expect(heartScan.direction).toMatchObject({ horizontal: 'center', vertical: 'north' })
    expect(heartScan.objective).toBe('Restore the intake heart.')
    expect(heartScan.text).toContain('Heart scan: direction center, north')
    expect(heartScan.text).toContain('distance 3.0 step(s)')
    expect(heartScan.text).toContain('objective Restore the intake heart.')
  })

  it('summarizes boundary scan edges, exits, and safe return point', () => {
    const boundary = boundaryScanState(
      { x: 1, y: -2 },
      { start: { x: 0, y: -2 }, exits: [{ id: 'east-door', name: 'east door', position: { x: 5, y: -2 } }] },
    )

    expect(boundary.edges).toMatchObject({ west: -5, east: 5, south: -7, north: 3 })
    expect(boundary.exits[0]).toMatchObject({ id: 'east-door', position: { x: 5, y: -2 } })
    expect(boundary.safeReturnPoint).toMatchObject({ x: 0, y: -2 })
    expect(boundary.text).toContain('Boundary scan: chamber edges west -5, east 5, south -7, north 3')
    expect(boundary.text).toContain('Exits: east door 5, -2')
    expect(boundary.text).toContain('Safe return point 0, -2')
  })

  it('expands scan range after Intake comes online', () => {
    const base = scanRangeState({ restoredSystems: [] })
    const intake = scanRangeState({ restoredSystems: ['Intake'] })
    const farPulse = scanPulse({ x: 0, y: 0 }, { x: 10, y: 0 }, { scanRange: intake.range })

    expect(base.range).toBe(8)
    expect(intake.range).toBe(12)
    expect(intake.text).toContain('Intake scan range unlocked')
    expect(farPulse.inRange).toBe(true)
    expect(farPulse.text).toContain('range 12')
  })

  it('unlocks objective scan compass cues after Navigation comes online', () => {
    const base = navigationScanState({ restoredSystems: [] })
    const navigation = navigationScanState({ restoredSystems: ['Navigation'] })
    const cue = chamberCompassCue({ x: 3, y: 0 }, { x: -2, y: 0 })

    expect(base.navigationOnline).toBe(false)
    expect(base.text).toContain('Navigation offline')
    expect(navigation.navigationOnline).toBe(true)
    expect(navigation.text).toContain('objective scans include chamber compass cues')
    expect(cue.bearing).toBe('west')
    expect(cue.text).toContain('offset -5, 0')
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

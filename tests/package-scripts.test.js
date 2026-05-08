import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

describe('package verification scripts', () => {
  it('keeps audio asset and Syngen audio checks mandatory in npm run check', () => {
    const check = packageJson.scripts.check
    const steps = check.split('&&').map((step) => step.trim())

    expect(packageJson.scripts['check:audio-assets']).toBe('node scripts/check-audio-assets.mjs')
    expect(packageJson.scripts['check:syngen-audio']).toBe('node scripts/check-syngen-audio.mjs')
    expect(steps).toContain('npm run check:audio-assets')
    expect(steps).toContain('npm run check:syngen-audio')
    expect(steps.indexOf('npm run check:audio-assets')).toBeLessThan(steps.indexOf('npm run test'))
    expect(steps.indexOf('npm run check:syngen-audio')).toBeLessThan(steps.indexOf('npm run test'))
  })
})

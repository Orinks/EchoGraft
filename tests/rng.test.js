import { describe, expect, it } from 'vitest'
import { createRng, defaultProceduralSeed, setProceduralSeed } from '../src/content/rng.js'

function sequence(label) {
  const rng = createRng(label)
  return [rng(), rng(), rng()]
}

describe('procedural rng', () => {
  it('creates deterministic sequences from the procedural seed and label', () => {
    setProceduralSeed('ark-alpha')
    const first = sequence('sol')
    setProceduralSeed('ark-alpha')
    expect(sequence('sol')).toEqual(first)
  })

  it('varies deterministic sequences when the procedural seed changes', () => {
    setProceduralSeed('ark-alpha')
    const first = sequence('sol')
    setProceduralSeed('ark-beta')
    expect(sequence('sol')).not.toEqual(first)
  })

  it('resets to the default EchoGraft procedural seed', () => {
    expect(setProceduralSeed()).toBe(defaultProceduralSeed)
  })
})

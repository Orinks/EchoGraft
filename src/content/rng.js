export function hashSeed(input) {
  let hash = 2166136261
  for (const char of String(input)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createRng(seed = 'echograft') {
  let state = hashSeed(seed) || 1
  return () => {
    state += 0x6d2b79f5
    let next = state
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export function pick(list, rng) {
  return list[Math.floor(rng() * list.length)]
}

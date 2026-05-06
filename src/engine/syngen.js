import syngen from 'syngen'

export { syngen }

export function getAudioContext() {
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext
  if (!AudioContextClass) return null
  if (!globalThis.__echograftAudioContext) {
    globalThis.__echograftAudioContext = new AudioContextClass()
  }
  return globalThis.__echograftAudioContext
}

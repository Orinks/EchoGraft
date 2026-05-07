import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const audioPaths = [
  join(process.cwd(), 'src', 'engine', 'audio.js'),
  join(process.cwd(), 'src', 'js', 'engine.js'),
  join(process.cwd(), 'src', 'js', 'content', 'cues.js'),
  join(process.cwd(), 'src', 'js', 'content', 'music.js'),
  join(process.cwd(), 'src', 'js', 'app', 'screen', 'splash.js'),
  join(process.cwd(), 'src', 'js', 'main.js'),
]
const source = audioPaths.map((path) => readFileSync(path, 'utf8')).join('\n')

const forbidden = [
  'new AudioContext',
  'new webkitAudioContext',
  '.createOscillator(',
  '.createStereoPanner(',
  'context.createGain(',
  '.destination',
]

const required = [
  'const engine = syngen',
  'engine.mixer.createBus',
  'engine.synth.',
  'engine.loop.start().pause()',
  'engine.loop.resume()',
  'engine.loop.on',
  'content.music',
  'content.cues',
]

const violations = forbidden.filter((needle) => source.includes(needle))
const missing = required.filter((needle) => !source.includes(needle))

if (violations.length || missing.length) {
  if (violations.length) console.error(`Direct Web Audio usage found in audio engine:\n${violations.join('\n')}`)
  if (missing.length) console.error(`Expected Syngen API usage missing from audio engine:\n${missing.join('\n')}`)
  process.exit(1)
}

console.log('Audio engine is routed through Syngen APIs.')

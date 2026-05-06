import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const audioPath = join(process.cwd(), 'src', 'engine', 'audio.js')
const source = readFileSync(audioPath, 'utf8')

const forbidden = [
  'new AudioContext',
  'new webkitAudioContext',
  '.createOscillator(',
  '.createStereoPanner(',
  'context.createGain(',
  '.destination',
]

const required = [
  'syngen.audio.start',
  'syngen.audio.mixer.createBus',
  'syngen.audio.synth.',
  'syngen.props.create',
  'syngen.position.setVector',
  'syngen.loop.start',
  'syngen.loop.on',
  'setMusicScene',
  'tickMusic',
  'createMenuMusicPhrase',
  'createChamberMusicPhrase',
  'createEndingMusicPhrase',
]

const violations = forbidden.filter((needle) => source.includes(needle))
const missing = required.filter((needle) => !source.includes(needle))

if (violations.length || missing.length) {
  if (violations.length) console.error(`Direct Web Audio usage found in audio engine:\n${violations.join('\n')}`)
  if (missing.length) console.error(`Expected Syngen API usage missing from audio engine:\n${missing.join('\n')}`)
  process.exit(1)
}

console.log('Audio engine is routed through Syngen APIs.')

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const audioPaths = [
  join(process.cwd(), 'src', 'engine', 'audio.js'),
  join(process.cwd(), 'src', 'js', 'engine.js'),
  join(process.cwd(), 'src', 'js', 'content', 'cues.js'),
  join(process.cwd(), 'src', 'js', 'content', 'game.js'),
  join(process.cwd(), 'src', 'js', 'content', 'music.js'),
  join(process.cwd(), 'src', 'js', 'app', 'input.js'),
  join(process.cwd(), 'src', 'js', 'app', 'screen', 'splash.js'),
  join(process.cwd(), 'src', 'js', 'main.js'),
]
const source = audioPaths.map((path) => readFileSync(path, 'utf8')).join('\n')
const appAudioSource = [
  join(process.cwd(), 'src', 'engine', 'audio.js'),
  join(process.cwd(), 'src', 'engine', 'position.js'),
].map((path) => readFileSync(path, 'utf8')).join('\n')

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
  'engine.input.keyboard',
  'engine.position.setVector',
  'engine.position.setEuler',
  'engine.sound.extend',
  'engine.state.on',
  'engine.seed.set',
  'engine.effect.',
  'content.music',
  'content.cues',
]

const violations = forbidden.filter((needle) => source.includes(needle))
const missing = required.filter((needle) => !source.includes(needle))
const modernRequired = [
  'syngen.loop.on',
  'syngen.position.setVector',
  'syngen.position.setEuler',
  'syngen.audio.mixer.createBus',
  'syngen.synth.additive',
  'syngen.synth.am',
  'syngen.synth.amBuffer',
  'syngen.synth.fm',
  'syngen.buffer.whiteNoise',
  'syngen.buffer.pinkNoise',
  'syngen.buffer.brownNoise',
  'syngen.buffer.impulse',
  'syngen.sound.extend',
  'syngen.sound.instantiate',
  'syngen.effect.feedbackDelay',
  'syngen.effect.multitapDelay',
  'syngen.effect.phaser',
  'syngen.effect.pingPongDelay',
  'syngen.effect.talkbox',
  'syngen.shape.distort',
  'syngen.shape.hot',
  'syngen.shape.warm',
  'syngen.shape.pulse',
  'syngen.shape.doublePulse',
  'syngen.shape.triplePulse',
  'syngen.shape.equalFadeIn',
  'syngen.shape.equalFadeOut',
  'syngen.shape.linear',
  'syngen.shape.crush8',
  'syngen.shape.crush12',
  'syngen.shape.dither',
  'syngen.shape.noise16',
  'syngen.shape.createNoise',
  'syngen.formant.createA',
  'syngen.formant.createE',
  'syngen.formant.createI',
  'syngen.formant.createO',
  'syngen.formant.createU',
]
const modernMissing = modernRequired.filter((needle) => !appAudioSource.includes(needle))
const modernForbidden = [
  'syngen.audio.buffer',
]
const modernViolations = modernForbidden.filter((needle) => appAudioSource.includes(needle))

if (violations.length || missing.length || modernMissing.length || modernViolations.length) {
  if (violations.length) console.error(`Direct Web Audio usage found in audio engine:\n${violations.join('\n')}`)
  if (missing.length) console.error(`Expected Syngen API usage missing from audio engine:\n${missing.join('\n')}`)
  if (modernMissing.length) console.error(`Expected active app Syngen toolkit usage missing from src/engine/audio.js:\n${modernMissing.join('\n')}`)
  if (modernViolations.length) console.error(`Modern audio layer must use syngen.buffer instead of legacy syngen.audio.buffer:\n${modernViolations.join('\n')}`)
  process.exit(1)
}

console.log('Audio engine is routed through Syngen APIs.')

import { getAudioContext, syngen } from './syngen.js'

const categoryDefaults = {
  master: 0.8,
  ambience: 0.55,
  ui: 0.7,
  seeds: 0.75,
  hazards: 0.65,
  scans: 0.75,
}

export class AudioEngine {
  constructor(settings = {}) {
    this.settings = { ...categoryDefaults, ...settings }
    this.context = null
    this.enabled = false
    this.syngen = syngen
  }

  async start() {
    this.context = getAudioContext()
    if (!this.context) return false
    if (this.context.state === 'suspended') await this.context.resume()
    this.enabled = true
    return true
  }

  setSettings(settings) {
    this.settings = { ...this.settings, ...settings }
  }

  gainFor(category) {
    return (this.settings.master ?? 1) * (this.settings[category] ?? 1) * 0.08
  }

  tone({ frequency = 440, duration = 0.15, type = 'sine', category = 'ui', pan = 0, when = 0 }) {
    if (!this.enabled || !this.context) return
    const now = this.context.currentTime + when
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()
    const panner = this.context.createStereoPanner?.()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, this.gainFor(category)), now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    if (panner) {
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now)
      osc.connect(gain).connect(panner).connect(this.context.destination)
    } else {
      osc.connect(gain).connect(this.context.destination)
    }
    osc.start(now)
    osc.stop(now + duration + 0.05)
  }

  ui(kind = 'confirm') {
    const map = {
      confirm: [660, 0.08],
      cancel: [220, 0.1],
      error: [130, 0.18],
      success: [520, 0.12],
    }
    const [frequency, duration] = map[kind] ?? map.confirm
    this.tone({ frequency, duration, category: 'ui', type: 'triangle' })
  }

  scan(player, target) {
    const dx = target.x - player.x
    const dy = target.y - player.y
    const distance = Math.hypot(dx, dy)
    const pan = Math.max(-1, Math.min(1, dx / 5))
    this.tone({ frequency: 320 + Math.max(0, 6 - distance) * 45, duration: 0.22, category: 'scans', pan, type: 'sine' })
  }

  seed(seed) {
    // Seed DNA maps directly to synthesis: ratio sets pitch, brightness sets perceived filter range,
    // waveform chooses oscillator color, pulseRate schedules a short repeat, and position maps to pan.
    const base = 220 * seed.pitchRatio
    const pan = Math.max(-1, Math.min(1, seed.position.x / 4))
    const pulses = Math.max(1, Math.min(4, Math.round(seed.pulseRate)))
    for (let index = 0; index < pulses; index += 1) {
      this.tone({
        frequency: base + seed.brightness * 160,
        duration: 0.09 + seed.brightness * 0.08,
        category: 'seeds',
        type: seed.waveform,
        pan,
        when: index * 0.16,
      })
    }
  }

  hazard() {
    this.tone({ frequency: 92, duration: 0.35, type: 'sawtooth', category: 'hazards' })
  }

  ending() {
    ;[220, 330, 440, 660, 880].forEach((frequency, index) => {
      this.tone({ frequency, duration: 0.4, type: 'triangle', category: 'ambience', when: index * 0.18 })
    })
  }
}

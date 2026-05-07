content.music = (() => {
  let beat = 0,
    bus,
    currentMode,
    nextBeat = 0,
    state = {}

  function ensureBus() {
    if (!bus) {
      bus = engine.mixer.createBus()
      bus.gain.value = 0.65
    }

    return bus
  }

  function envelope(synth, duration, peak) {
    const when = engine.time()
    const zero = engine.const.zero || 0.000001
    synth.param.gain.setValueAtTime(zero, when)
    synth.param.gain.linearRampToValueAtTime(peak, when + 0.035)
    synth.param.gain.linearRampToValueAtTime(zero, when + duration)
    synth.stop(when + duration + 0.02)
  }

  function play(frequency, duration, gain, harmonic) {
    const synth = engine.synth.additive({
      frequency,
      gain: engine.const.zero || 0.000001,
      harmonic,
      when: engine.time(),
    }).connect(ensureBus())
    envelope(synth, duration, gain)
  }

  function tick() {
    if (!currentMode || engine.loop.isPaused()) return

    const now = engine.time()
    if (now < nextBeat) return

    const score = Math.max(0, Math.min(1, state.score || 0))
    const target = state.chamber && state.chamber.target || {pitchRatio: 1, pulseRate: 1, brightness: 0.45}
    const isMenu = currentMode == 'menu'
    const tempo = isMenu ? 76 : 58 + target.pulseRate * 18 + score * 16
    const interval = 60 / tempo
    const root = isMenu ? 110 : 98 * target.pitchRatio
    const scale = isMenu ? [1, 1.25, 1.5, 2] : [1, target.pitchRatio, 1.5, 2]
    const ratio = scale[beat % scale.length]
    const brightness = target.brightness || 0.5
    const gain = engine.fn.fromDb(isMenu ? -25 : -24 + score * 5)

    play(root * ratio, interval * 1.6, gain, [
      {coefficient: 1, gain: 1, type: 'sine'},
      {coefficient: 2, gain: 0.18 + brightness * 0.22, type: 'triangle'},
    ])

    if (beat % 4 == 0) {
      play(root / 2, interval * 3.5, gain * 0.8, [
        {coefficient: 1, gain: 1, type: 'triangle'},
        {coefficient: 2, gain: 0.2, type: 'sine'},
      ])
    }

    beat += 1
    nextBeat = now + interval
  }

  engine.loop.on('frame', tick)

  return {
    refresh: function () {
      if (bus) bus.gain.value = 0.65
      return this
    },
    start: function (mode = 'menu', nextState = {}) {
      if (currentMode != mode) {
        beat = 0
        nextBeat = 0
      }
      currentMode = mode
      state = nextState
      this.refresh()
      return this
    },
  }
})()

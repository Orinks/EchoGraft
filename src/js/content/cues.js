content.cues = (() => {
  let bus

  function ensureBus() {
    if (!bus) {
      bus = engine.mixer.createBus()
      bus.gain.value = 0.7
    }

    return bus
  }

  function tone(frequency, duration = 0.12, gain = engine.fn.fromDb(-12), type = 'sine') {
    const when = engine.time()
    const synth = engine.synth.simple({
      frequency,
      gain,
      type,
      when,
    }).connect(ensureBus())
    synth.stop(when + duration)
  }

  return {
    confirm: () => tone(523.25, 0.08, engine.fn.fromDb(-10), 'triangle'),
    menuMove: () => tone(329.63, 0.06, engine.fn.fromDb(-16), 'sine'),
    move: (player = {}) => tone(220 + (player.x || 0) * 12 + (player.y || 0) * 7, 0.08, engine.fn.fromDb(-18), 'triangle'),
    scan: (player = {}, target = {}) => {
      const distance = Math.hypot((target.x || 0) - (player.x || 0), (target.y || 0) - (player.y || 0))
      tone(440 + Math.max(0, 8 - distance) * 55, 0.18, engine.fn.fromDb(-13), 'sine')
    },
    seed: (seed = {}) => tone(220 * (seed.pitchRatio || 1), 0.2, engine.fn.fromDb(-12), seed.waveform || 'sine'),
    success: () => {
      tone(523.25, 0.08, engine.fn.fromDb(-12), 'triangle')
      window.setTimeout(() => tone(659.25, 0.12, engine.fn.fromDb(-12), 'triangle'), 90)
    },
  }
})()

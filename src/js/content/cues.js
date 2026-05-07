content.cues = (() => {
  let bus,
    scanDelay

  function ensureBus() {
    if (!bus) {
      bus = engine.mixer.createBus()
      bus.gain.value = 0.7
    }

    return bus
  }

  function ensureScanDelay() {
    if (!scanDelay) {
      scanDelay = engine.effect.multitapDelay({
        dry: 0.85,
        tap: [
          {delay: 0.11, feedback: 0.12, gain: 0.28},
          {delay: 0.23, feedback: 0.08, gain: 0.18},
        ],
        wet: 0.6,
      })
      ensureBus().connect(scanDelay.input)
      scanDelay.output.connect(engine.mixer.input())
    }

    return scanDelay
  }

  function envelope(synth, duration, peak) {
    const when = engine.time()
    const zero = engine.const.zero || 0.000001
    synth.param.gain.setValueAtTime(zero, when)
    synth.param.gain.linearRampToValueAtTime(peak, when + 0.018)
    synth.param.gain.exponentialRampToValueAtTime(zero, when + duration)
    synth.stop(when + duration + 0.03)
    return synth
  }

  function synthFor(seed = {}, frequency, gain, when = engine.time()) {
    if (seed.grafted) {
      return engine.synth.fm({
        carrierFrequency: frequency,
        carrierType: seed.waveform || 'triangle',
        gain,
        modDepth: frequency * 0.35,
        modFrequency: Math.max(0.1, seed.pulseRate || 1),
        modType: 'sine',
        when,
      }).chain(engine.effect.phaser({
        depth: 0.002,
        frequency: Math.max(0.1, (seed.pulseRate || 1) / 3),
        wet: 0.35,
        when,
      }))
    }

    if ((seed.pulseRate || 0) > 1.25) {
      return engine.synth.am({
        carrierFrequency: frequency,
        carrierType: seed.waveform || 'triangle',
        gain,
        modDepth: 0.55,
        modFrequency: seed.pulseRate,
        modType: 'sine',
        when,
      }).filtered({
        frequency: engine.fn.lerp(900, 5200, seed.brightness || 0.5),
        Q: 1.2,
        type: 'lowpass',
        when,
      })
    }

    return engine.synth.simple({
      frequency,
      gain,
      type: seed.waveform || 'sine',
      when,
    }).filtered({
      frequency: engine.fn.lerp(700, 4800, seed.brightness || 0.5),
      Q: 0.9,
      type: 'lowpass',
      when,
    })
  }

  const spatialCue = engine.sound.extend({
    fadeOutDuration: 0.02,
    reverb: true,
    onConstruct: function ({duration = 0.16, frequency = 440, gain = engine.fn.fromDb(-12), seed = {}} = {}) {
      this.synth = synthFor(seed, frequency, engine.const.zero || 0.000001).connect(this.output)
      envelope(this.synth, duration, gain)
    },
  })

  function spatial(options = {}) {
    const instance = spatialCue.instantiate({
      destination: ensureBus(),
      fadeOutDuration: 0.03,
      radius: 0.5,
      reverb: true,
      ...options,
    }, options)

    window.setTimeout(() => instance.destroy(), ((options.duration || 0.16) + 0.08) * 1000)
    return instance
  }

  function tone(frequency, duration = 0.12, gain = engine.fn.fromDb(-12), type = 'sine') {
    return spatial({
      duration,
      frequency,
      gain,
      relative: true,
      seed: {waveform: type, brightness: 0.5, pulseRate: 1},
      z: 0,
    })
  }

  return {
    confirm: () => tone(523.25, 0.08, engine.fn.fromDb(-10), 'triangle'),
    menuMove: () => tone(329.63, 0.06, engine.fn.fromDb(-16), 'sine'),
    move: (player = {}, direction = {}) => {
      const base = 164 + (player.y || 0) * 9 + Math.abs(player.x || 0) * 5
      spatial({
        duration: 0.07,
        frequency: base,
        gain: engine.fn.fromDb(-17),
        relative: true,
        seed: {waveform: 'triangle', brightness: 0.35, pulseRate: 1.7},
        x: (direction.dx || 0) * 0.9,
        y: (direction.dy || 0) * 0.9,
        z: -0.2,
      })
      window.setTimeout(() => spatial({
        duration: 0.06,
        frequency: base * 1.18,
        gain: engine.fn.fromDb(-20),
        relative: true,
        seed: {waveform: 'sine', brightness: 0.55, pulseRate: 1},
        x: (direction.dx || 0) * 0.45,
        y: (direction.dy || 0) * 0.45,
        z: -0.2,
      }), 55)
    },
    scan: (player = {}, target = {}) => {
      const distance = engine.fn.distance(target, player)
      ensureScanDelay()
      spatial({
        destination: bus,
        duration: 0.22,
        frequency: 440 + Math.max(0, 8 - distance) * 55,
        gain: engine.fn.fromDb(-13),
        seed: {waveform: 'sine', brightness: 0.8, pulseRate: 1},
        x: target.x || 0,
        y: target.y || 0,
        z: 0,
      })
    },
    seed: (seed = {}) => spatial({
      duration: 0.35,
      frequency: 220 * (seed.pitchRatio || 1),
      gain: engine.fn.fromDb(-12),
      seed,
      x: seed.position?.x || 0,
      y: seed.position?.y || 0,
      z: 0,
    }),
    success: () => {
      tone(523.25, 0.08, engine.fn.fromDb(-12), 'triangle')
      window.setTimeout(() => tone(659.25, 0.12, engine.fn.fromDb(-12), 'triangle'), 90)
    },
  }
})()

# EchoGraft Audio System

All sound is synthesized at runtime with Syngen/Web Audio primitives. The project must not contain or load MP3, WAV, OGG, FLAC, or other sample assets.

## Mapping
- Chamber heart: steady oscillator pair tuned to the chamber target ratio, brightness, pulse, and phase.
- Seed voice: oscillator chosen by DNA waveform and oscillator type, filtered by brightness, modulated by FM/AM values, pulsed by DNA rhythm.
- Scan pulse: short chirp whose pitch, pan, and decay communicate nearby objects and current objective.
- UI: short synthesized blips with different envelopes for confirm, cancel, error, and success.
- Hazard mold: detuned noise/oscillator tone that reports forbidden intervals and grows louder when planted seeds conflict.
- Bloom and ending: layered procedural arpeggios generated from solved chamber DNA.

## Designer Notes
The audio engine keeps synthesis mappings in `src/engine/audio.js`. Future designers should tune numeric DNA ranges and chamber constraints instead of adding external audio files.

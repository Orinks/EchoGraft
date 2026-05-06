# EchoGraft Audio System

All sound is synthesized at runtime through Syngen APIs, which internally route to Web Audio. EchoGraft code should not create its own `AudioContext`, oscillators, panners, or destination graph directly. The project must not contain or load MP3, WAV, OGG, FLAC, or other sample assets.

## Mapping
- Chamber heart: Syngen additive/AM synth voices derived from chamber target ratio, brightness, pulse, and phase.
- Seed voice: Syngen synth chosen by DNA oscillator type, filtered by brightness, modulated by FM/AM/noise values, pulsed by DNA rhythm, and positioned with Syngen props.
- Scan pulse: Syngen spatial prop whose pitch, binaural position, and decay communicate nearby objects and current objective.
- UI: semantic Syngen synth cues derived from action names, not imported clips.
- Hazard mold: Syngen FM/noise-tinted synth tone derived from chamber hazard intervals.
- Bloom and ending: layered procedural Syngen voices generated from solved chamber targets and seed inventory DNA.

## Designer Notes
The audio engine keeps synthesis mappings in `src/engine/audio.js`. Future designers should tune numeric DNA ranges and chamber constraints instead of adding external audio files or direct Web Audio nodes.

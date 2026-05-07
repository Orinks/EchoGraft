# EchoGraft Game Spec

For the full production direction, campaign scope, Syngen technical design, progression systems, and accessibility model, see `GAME_DESIGN_DOCUMENT.md`. This shorter spec describes the original vertical-slice mechanics and should be treated as implementation context, not the complete target game.

EchoGraft is an accessible audio-first puzzle-strategy game set inside the Verdancy Ark, a derelict orbital greenhouse whose resonance gardens have gone silent. The player repairs chamber hearts by collecting, planting, tuning, and grafting synthesized phonoseeds.

## Core Loop
1. Enter a chamber and listen to the chamber heart.
2. Send scan pulses to hear distance, direction, and target resonance.
3. Select or collect phonoseeds.
4. Plant seeds around the heart and tune DNA parameters.
5. Graft seeds when a chamber requires inherited traits.
6. Solve the chamber when the ecology matches target position, pitch, rhythm, timbre, phase, and hazard constraints.
7. Unlock the next chamber.

## Campaign
- Tutorial: movement, help, scan, seed selection, planting.
- Chamber 1: movement, listening, chamber heart scan.
- Chamber 2: binaural direction and distance.
- Chamber 3: pitch ratio matching.
- Chamber 4: pulse-rate rhythm matching.
- Chamber 5: filter brightness and timbre matching.
- Chamber 6: two-seed harmonic planting.
- Chamber 7: phase/interference cancellation.
- Chamber 8: grafting/crossbreeding DNA.
- Chamber 9: hostile mold tones disrupt forbidden intervals.
- Chamber 10: finale combines position, pitch, rhythm, timbre, and grafting.

## Seed DNA
Each seed is generated from code parameters: waveform, pitch ratio, oscillator type, filter brightness, FM amount, AM amount, noise amount, envelope, pulse rate, stereo/spatial position, phase, and growth behavior.

## Win Conditions
Each chamber defines explicit resonance constraints. The evaluator gives text and sound feedback for nearest missing requirements, allowing no-vision play without reflex timing.

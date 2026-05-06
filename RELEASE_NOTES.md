# EchoGraft v0.1.0

## Features
- Complete browser-playable EchoGraft campaign with tutorial, ten chambers, finale, and ending sequence.
- Procedural Syngen/Web Audio synthesis for UI, scans, seeds, hazards, ambience cues, bloom cues, and ending music.
- Dynamic Syngen-generated music director for menus, chamber play, pause/help/settings, and the ending.
- Deterministic seed DNA, seed tuning, grafting, resonance evaluation, chamber unlocks, and save/load progress.
- Keyboard-first accessible interface with semantic controls, live status, caption log, help, pause, settings, credits, reduced-motion, and minimal-visual modes.

## Testing
- Unit coverage for seed DNA, grafting, resonance, save/load, and unlock logic.
- Playwright smoke coverage for boot, new game, movement, scan, plant, tune, solve, save/reload, settings/help, and external audio requests.
- Automated binary audio asset guard.

## Known Limitations
- Formal screen reader conformance still needs manual assistive technology verification.
- Electron installer signing and publishing are not configured.

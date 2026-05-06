# EchoGraft Progress Log

## 2026-05-06
- Repository was empty except `.omx`; initialized a Vite/Electron source layout based on the requested `app`, `engine`, and `content` organization.
- Started with mandatory design, audio, accessibility, and test documents before implementation.
- Implemented deterministic seed DNA, grafting, tuning, chamber data, resonance evaluation, save/load, accessible event log, keyboard controls, settings, help, credits, pause, ending, and procedural Web Audio/Syngen audio hooks.
- Added tutorial plus ten chamber definitions covering scan, binaural direction/distance, pitch, rhythm, timbre, harmony, phase, grafting, hazards, and finale mechanics.
- Added automated binary audio asset guard; no external audio files are present.
- Fixed test layout so Vitest excludes Playwright specs.
- Installed Playwright Chromium and verified smoke tests in Chromium.
- Manual browser playthrough path: used the browser UI from new game through tutorial solve, settings, help, save/reload, and verified campaign data has solvable ideal targets through the finale. Full assistive-technology screen reader pass remains a launch risk.
- Refactored audio after review found only minimal Syngen import usage. The engine now starts and loops through Syngen, uses Syngen mixer buses, Syngen synth factories, Syngen props for spatial voices, Syngen position for listener state, and procedural patterns derived from chamber/seed/action data instead of fixed tone arrays.
- Added `npm run check:syngen-audio` to guard against direct Web Audio constructors in the game audio engine.

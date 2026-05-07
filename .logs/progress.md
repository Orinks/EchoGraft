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
- Added a continuous Syngen music director driven by `syngen.loop`. It generates menu music, chamber music, pause/help/settings music, and ending music from semantic seeds, chamber targets, planted seed DNA, hazards, resonance score, and inventory state.
- Investigated missing audible output against `space-colony-syngen`. EchoGraft had a running browser audio context, but music/UI were routed through spatial props. Mirrored Space Colony's practical pattern by awaiting Syngen context resume and routing music/UI synths directly to Syngen mixer buses while keeping gameplay scans/seeds/hazards spatial.
- Compared EchoGraft's launch flow against Space Colony Defense. EchoGraft incorrectly opened directly on the main menu and only started Syngen audio after a menu action. Added an interaction splash so the first player gesture resumes Syngen, starts the loop, and then enters the menu where menu music can play.
- Migrated the browser runtime toward the Space Colony Defense Syngen-template shape: Gulp-built `public/game.html`, `engine = syngen`, template-style screen manager, paused loop until splash interaction, Syngen 2 beta dependency, and `content.music` / `content.cues` modules that synthesize menu and game audio through Syngen mixer buses.
- Added the first mission-purpose pass to the Gulp runtime: the player is restoring named Verdancy Ark systems, progression is gated on solving chambers, and completion now produces an explicit Ark-restored outcome.

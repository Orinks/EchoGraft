# EchoGraft Plan

## Milestones
1. Scaffold a Syngen-template-style app with `app`, `engine`, and `content` boundaries.
2. Define the full design, audio system, accessibility requirements, and test plan before heavy implementation.
3. Build deterministic chamber, seed DNA, grafting, resonance, save, settings, and logging systems.
4. Implement tutorial, ten chambers, finale, ending, menus, controls, and accessible text feedback.
5. Add automated unit, smoke, build, and binary audio asset checks.
6. Document the public release package with README, manual, release notes, itch.io copy, and launch checklist.

## Architecture
- `src/app`: DOM UI, menu/settings/help screens, input binding, app lifecycle.
- `src/engine`: Syngen/Web Audio alias layer, procedural synth runtime, storage helpers.
- `src/content`: game data and systems: chambers, seeds, resonance, inventory, player, save, accessibility log.
- `tests`: unit tests for deterministic systems and Playwright smoke coverage.

## Risks
- Browser autoplay policies require user interaction before audio starts.
- Electron packaging may need platform-specific signing outside this environment.
- Syngen APIs are experimental, so the engine layer keeps direct usage isolated.
- Full no-vision verification needs real screen reader testing after automated checks.

## Task Breakdown
- Complete project documents.
- Implement system modules with deterministic data.
- Wire the playable app loop.
- Add procedural audio voices and captions for each important event.
- Add tests and asset guard.
- Run checks, fix failures, and log manual playthrough findings.

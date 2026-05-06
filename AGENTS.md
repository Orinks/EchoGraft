# EchoGraft Agent Instructions

EchoGraft is an accessible audio-first puzzle-strategy game. Preserve the template organization:
- `src/app`: UI, scaffolding, menus, input, DOM lifecycle.
- `src/engine`: Syngen/Web Audio alias and procedural audio runtime.
- `src/content`: game systems, chamber data, seed DNA, resonance, save, logging.

## Commands
```sh
npm install
npm run dev
npm run check
npm run test:e2e
npm run build
```

## Conventions
- Do not add external audio assets. Audio must be synthesized at runtime.
- Keep chamber data editable in JS modules.
- Preserve no-vision play: every important audio cue needs text/log feedback.
- Use semantic HTML for interactive UI.
- Update `.logs/progress.md` with meaningful implementation decisions, bugs, fixes, and manual test findings.
- Run `npm run check:audio-assets` after file additions.
- Run `npm run check:syngen-audio` after audio changes; the game audio layer must use Syngen APIs instead of direct Web Audio construction.
- Prefer small, reviewable changes and keep documentation aligned with gameplay.

# EchoGraft Agent Instructions

EchoGraft is an accessible audio-first puzzle-strategy game. Preserve the template organization:
- `src/app`: UI, scaffolding, menus, input, DOM lifecycle.
- `src/engine`: Syngen/Web Audio alias and procedural audio runtime.
- `src/content`: game systems, chamber data, seed DNA, resonance, save, logging.

## Writing rule: no accessibility or audio marketing talk

This applies to everything you write: READMEs, store and site descriptions,
release notes, changelogs, forum posts (audiogames.net and similar), commit
messages, PR text, and docs.

- Never describe a game or app as audio-first, blind-first, accessibility-first,
  truly accessible, designed with accessibility at the forefront, crafted for
  keyboard and screen reader use, specifically optimized for screen reader
  users, or anything that means the same thing.
- Skip audio puffery too: "rich and immersive soundscapes", "a game designed to
  be heard", "sounds like you're really there", "your eyes don't matter, only
  your ears do", and the like.
- Why: the audience already takes accessibility and audio for granted. Saying
  so is filler. Describe what the thing actually does instead: its features,
  content, controls, and what changed.
- Facts are fine when they are specific and useful, for example "works with
  NVDA and JAWS" in a requirements list or a note about which keys open a menu.


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

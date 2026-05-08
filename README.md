# EchoGraft

EchoGraft is an accessible browser/Electron audio-first puzzle-strategy game set inside the Verdancy Ark, a derelict orbital greenhouse. You repair resonance gardens by planting, tuning, and grafting synthesized phonoseeds around chamber hearts.

All audio is generated procedurally at runtime with Syngen/Web Audio. The project contains no external sound effects, music, samples, MP3, WAV, OGG, FLAC, or paid audio assets.

## Controls
- WASD or arrow keys: move.
- Q/E: rotate/listen left/right.
- Space: send scan pulse.
- Enter: interact, plant, pick up, confirm.
- Tab: cycle inventory.
- Number keys 1-4: select seed.
- Minus/Equals or bracket keys: tune selected parameter.
- Shift: cycle tuning parameter.
- G: graft the first two seeds.
- R: reset chamber.
- H: contextual help.
- Esc: pause/menu.

## Accessibility
- Playable with no vision through spatial audio, screen-reader text, and the caption/event log.
- Semantic HTML menus, buttons, status, settings, inventory, and log regions.
- Independent volume sliders for master, ambience, UI, seed voices, hazards, and scans.
- Dynamic Syngen-generated music for menus, chamber play, pause/help/settings, and the ending.
- Reduced-motion and minimal-visual modes.
- No mandatory reflex timing in the campaign.
- The in-game Help screen includes a screen-reader simulation matrix for reading order, heading navigation, tab navigation, form navigation, live-region caption updates, and no-vision keyboard command routes.

Manual screen reader testing is still recommended before formal accessibility claims.

## Development
```sh
npm install
npm run dev
npm run check
npm run check:performance
npm run test:e2e
```

## Build
```sh
npm run build
npm run preview
```

## Electron
```sh
npm run build
npm run electron
```

Packaging directory build:
```sh
npm run package:electron
```

Platform signing and installer publishing are not configured for v0.1.0.

## Deploy
Upload the `dist` folder to any static host, or use the Electron build instructions above for desktop packaging.

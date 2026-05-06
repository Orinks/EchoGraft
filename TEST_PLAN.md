# EchoGraft Test Plan

## Automated
- Unit tests for seed DNA determinism, grafting, resonance evaluation, save/load shape, and chamber unlock logic.
- Playwright smoke tests for boot, menu, new game, movement, scan, planting, tuning, solving the first chamber, save/reload, settings/help screens, and no external audio asset requirement.
- Asset guard fails on binary audio extensions.
- Build check verifies browser bundle.

## Manual
- Browser playthrough from tutorial through finale using keyboard only.
- Confirm captions/log entries for scans, movement, hazards, grafts, solving, and ending.
- Confirm reduced-motion and minimal-visual settings change the interface.
- Confirm screen-reader output announces current objective, selected seed, tuning value, and chamber state.
- Confirm Electron runs from the built `dist` folder or document packaging limitations.

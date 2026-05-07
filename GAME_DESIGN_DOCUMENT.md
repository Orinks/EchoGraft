# EchoGraft Game Design Document

## 1. High Concept

EchoGraft is an accessible audio-first puzzle-strategy exploration game about restoring the Verdancy Ark, a derelict orbital greenhouse whose living systems have gone silent. The player is an acoustic gardener who navigates by sound, gathers phonoseeds, studies chamber ecologies, grafts new seed voices, and restores the Ark one resonance system at a time.

The game should feel like a playable generative album, a restorative strategy campaign, and a greenhouse mystery. Every restored system changes the soundscape, unlocks new ecological work orders, deepens grafting decisions, and reveals why the Ark failed.

## 2. Design Pillars

### Audio Is the World

The primary world model is sonic, not visual. Spatial audio communicates direction, distance, object identity, hazard state, chamber shape, and musical progress. Visuals support sighted players but never carry mandatory information alone.

### The Game Is an Instrument

Seeds, chambers, restored systems, and player actions are all musical parameters. The player is not solving abstract matching puzzles; they are learning to perform the Ark back to life.

### Purposeful, Nonviolent Progression

The campaign is long-form and systemic. The player restores Ark functions, rescues dormant biomes, uncovers records, and makes endgame choices about what the Ark becomes.

### No-Vision First

Screen reader output is intentional and quiet. There is no always-on HUD spam. Information is requested through command keys, logs, menus, spatial scans, and concise announcements.

### Syngen End to End

Use Syngen as the runtime foundation: input, loop, state, seed, position, sound, synths, effects, generated noise, spatial models, and musical systems should be first-class design tools rather than a thin audio wrapper.

## 2.1. Design Boundaries

EchoGraft should not be a maze of locked paths, combat encounters, or collectible checklists with ambient music on top. Its center is ecological work: choosing a contract, understanding the chamber, shaping seed voices, restoring a living system, and deciding how much care to invest before moving the Ark clock forward.

The campaign should feel like a sequence of meaningful restoration jobs rather than a map to exhaust. Optional content should deepen the player's seed library, story understanding, and final composition, not simply fill space.

## 3. Audience and Experience Goals

EchoGraft is for players who enjoy audio games, ambient music, puzzle exploration, restorative sci-fi, and systems that can be learned at their own pace.

The target session should support:

- 5 to 10 minute short chamber solves.
- 20 to 40 minute restoration-planning sessions.
- A 6 to 10 hour first full campaign.
- Optional postgame restoration, collection, and composition play.

The intended emotional arc is isolation, orientation, care, mastery, then authorship.

## 4. Reference Lessons

This GDD draws inspiration from publicly available material on shiftBacktick projects.

- Periphery Synthetic demonstrates how an interactive generative ambient album can support long-form progression, materials, codex/perceptions, optional objectives, and audio environments that evolve over time and space. EchoGraft should learn from that craft while remaining a contract-based ecological restoration game.
- The Omega Reach suggests a useful collection and appraisal loop: objects are gathered, identified, curated, played, and traded. Its tactile room mapping and blind-friendly control focus are relevant to EchoGraft's chamber navigation and seed-library design, but EchoGraft's core should remain ecological restoration rather than museum curation.
- Syngen itself is explicitly built for spatial audio, synthesis, and game-development systems. EchoGraft should use it as a systemic toolkit, not only as a tone generator.

## 5. Player Fantasy

The player is the last active resonance gardener on the Ark. They cannot repair the greenhouse with tools or combat. They repair it by listening, understanding, and composing living ecological signals.

Core fantasy verbs:

- Listen.
- Locate.
- Plant.
- Tune.
- Graft.
- Restore.
- Steward.
- Compose.
- Decide.

## 6. Core Loop

1. Accept a restoration work order or enter an active chamber.
2. Listen to the ambient system state.
3. Scan to identify heart direction, distance, shape, target traits, and hazards.
4. Move through the chamber by spatial footstep, wall, current, and landmark sounds.
5. Gather or select phonoseeds.
6. Plant seeds in meaningful positions.
7. Tune seed DNA: pitch, pulse, brightness, phase, envelope, modulation, noise, and growth behavior.
8. Graft seeds to inherit traits or unlock new mechanics.
9. Evaluate resonance through audio and requested text.
10. Restore the chamber system.
11. Gain a resource, seed trait, record, chamber rating, or environmental change.
12. Decide whether to improve the same chamber, take another work order, research grafts, or advance the Ark clock.

## 7. Campaign Structure

The current prototype's four-chamber arc should become only a first training contract.

### Total Scope Target

- 5 campaign seasons.
- 7 to 10 restoration contracts per season.
- 40 to 50 authored chambers/contracts.
- 15 to 25 optional challenge contracts.
- 6 major Ark systems.
- 4 endgame resolutions.
- 80 to 120 codex records/perceptions.
- 24 to 36 seed families.
- 80+ graft discoveries.

### Season 1: Intake and Orientation

Theme: air, breath, first movement.

Purpose: teach no-vision navigation and basic restoration.

Systems:

- Intake lung.
- Navigation grove.
- Water pumps.
- Canopy lights.

Mechanics:

- Movement.
- Scan pulse.
- Planting.
- Single-seed tuning.
- On-demand info commands.
- First graft.

Target length: 6 required contracts, 2 optional contracts.

### Season 2: Rootworks

Theme: irrigation, nutrient transport, subterranean maps.

Purpose: introduce chamber scheduling, persistent restoration quality, and resource tradeoffs.

Systems:

- Root pumps.
- Nutrient locks.
- Fungus relays.

Mechanics:

- Water-current navigation.
- Multi-position planting.
- Growth timing without reflex pressure.
- Seed carry limits.
- Collectible spores as crafting resources.

Target length: 8 required contracts, 4 optional contracts.

### Season 3: Glass Weather

Theme: canopy, pressure, light, heat, wind.

Purpose: turn chambers into changing musical weather systems.

Systems:

- Photosynthetic canopy.
- Thermal shutters.
- Pressure sails.

Mechanics:

- Chamber states that cycle slowly.
- Brightness/timbre puzzles.
- Wind-carried scan echoes.
- Weather windows that reward planning.
- Optional return contracts that improve earlier low-rated restorations.

Target length: 9 required contracts, 5 optional contracts.

### Season 4: Memory Orchard

Theme: the Ark's records, old gardeners, failed choices.

Purpose: make story and mechanics converge.

Systems:

- Record trees.
- Dream compost.
- Pollinator vault.

Mechanics:

- Codex/perception recovery.
- Seed lineages with history.
- Grafts that reveal records.
- Moral/strategic choice between preserving original ecosystems and adapting them.

Target length: 9 required contracts, 6 optional contracts.

### Season 5: Verdancy Heart

Theme: authorship, consequence, final composition.

Purpose: use the player's accumulated seed library and restored systems to determine the Ark's future.

Systems:

- Central heart.
- Crew wake cycle.
- Launch garden.

Mechanics:

- Multi-chamber resonance network.
- Player-built final chord.
- Resolution-specific endings.
- Optional postgame free-composition conservatory.

Target length: 8 required contracts, 4 optional contracts.

## 8. Campaign Structure

The Ark should be organized as a restoration atlas: a board of chambers, systems, contracts, deadlines, ratings, and ecological dependencies. The player chooses what to repair next from available work orders. This keeps the game long and strategic without depending on map backtracking as the core progression model.

### Contract Types

- Training contract: teaches one mechanic with low stakes.
- Restoration contract: repairs a named Ark subsystem.
- Stabilization contract: improves a restored chamber's rating.
- Research contract: reveals a seed family, trait, or record.
- Emergency contract: contains unstable hazards and a soft deadline.
- Conservatory contract: lets the player compose and curate seed voices.
- Finale contract: contributes to the endgame Ark network.

### Atlas Model

The atlas is a quiet menu-like planning surface, not a visual map requirement. It should be fully screen-reader navigable and have audio previews for each chamber.

Atlas entries announce:

- Chamber name.
- System affected.
- Contract type.
- Estimated difficulty.
- Known hazards.
- Reward.
- Restoration rating.
- Required or optional status.
- Audio preview.

Inside a chamber, navigation remains spatial and sonic. Between chambers, the player makes deliberate planning choices through the atlas instead of wandering a maze.

### Contract Ratings

Every contract can be completed at a basic level, but careful play can earn stronger restoration ratings. Ratings give long-term purpose without punishing players who only want to move the story forward.

Rating levels:

- Stable: the required system comes online and the campaign can continue.
- Flourishing: the chamber contributes an extra music layer, resource yield, or seed trait.
- Harmonic: the chamber is restored with an especially elegant seed arrangement and contributes to stronger endgame options.
- Wild: the player intentionally accepts instability to unlock rare mutations, records, or unusual ending material.

Rating dimensions:

- Resonance accuracy.
- Number of seed moves used.
- Graft stability.
- Hazard containment.
- Resource efficiency.
- Optional record recovery.
- Whether the final ecology supports the player's chosen Ark philosophy.

The player should be able to revisit a contract from the atlas to improve its rating, but improving ratings is optional stewardship, not required progression.

## 9. Progression Systems

### Restored Systems

Each major system grants permanent benefits:

- Intake: unlocks longer scan range.
- Navigation: unlocks atlas previews, objective scan, and chamber comparison.
- Water: unlocks current navigation and root contracts.
- Canopy: unlocks brightness tuning and photosynthesis doors.
- Memory: unlocks codex echoes and historical seed traits.
- Heart: unlocks network resonance and endings.

### Seed Library

Seeds are both tools and collectibles.

Seed data:

- Name.
- Family.
- Pitch ratio.
- Pulse rate.
- Brightness.
- Phase.
- Waveform.
- Synth type.
- Modulation profile.
- Envelope.
- Noise profile.
- Growth behavior.
- Ecological affinity.
- Discovered origin.
- Graft ancestry.

### Grafting

Grafting should become a strategic system rather than one button that averages two seeds.

Graft rules:

- Parent A controls root pitch and waveform.
- Parent B controls modulation and growth behavior.
- Chamber substrate affects mutation chance.
- Restored systems unlock new inherited traits.
- Failed grafts are still useful as compost or noisy tools.
- Rare grafts reveal records, bonus contracts, or improved restoration ratings.

### Materials

Use a material/crafting structure, but theme it as ecology and restoration labor rather than gear upgrades.

Resources:

- Spores: common tuning currency.
- Resin: locks a seed trait.
- Mycelium: boosts graft stability.
- Glass pollen: unlocks brightness/timbre traits.
- Archive loam: reveals hidden ancestry.
- Embersap: powers endgame mutations.

### Codex and Perceptions

Story should be discovered, not dumped.

Record types:

- Gardener notes.
- Crew messages.
- Plant memory.
- System diagnostics.
- Seed ancestry.
- Ending-resolution reflections.

Records can be unlocked by chamber restoration, rare grafts, optional contracts, and improving previously restored systems.

## 10. Mechanics

### Movement

Movement is grid-like in early areas, then becomes more fluid in advanced zones.

Audio requirements:

- Every step has a spatial footstep cue.
- Surface type changes timbre.
- Direction changes stereo/relative placement.
- Walls and exits have subtle nearby presence tones.
- Movement never requires sight.

### Scanning

Scanning is the player's primary sense.

Scan modes:

- Heart scan: direction/distance/objective.
- Boundary scan: chamber edges, exits, and safe return point.
- Seed scan: planted seed positions and traits.
- Hazard scan: forbidden intervals and unsafe zones.
- Memory scan: records and hidden echoes.
- Network scan: endgame multi-chamber resonance.

### Planting

Planting should create persistent spatial sound objects. A planted seed is not just a solved-state token; it is an audible inhabitant of the room.

Planting decisions:

- Position.
- Seed family.
- Tuning state.
- Graft ancestry.
- Chamber substrate.
- Nearby seed interactions.

### Tuning

Tuning should support precise play and accessible feedback.

Tunable parameters:

- Pitch ratio.
- Pulse rate.
- Brightness/filter.
- Phase.
- Envelope shape.
- FM depth.
- AM depth.
- Noise amount.
- Spatial radius.

Commands should support coarse and fine adjustment.

### Resonance Evaluation

Evaluation should produce both sound and concise requested text.

Evaluation dimensions:

- Position match.
- Pitch match.
- Rhythm match.
- Timbre match.
- Phase match.
- Harmonic relationship.
- Growth behavior.
- Hazard avoidance.
- Network contribution.

## 11. Syngen Technical Design

### Required Syngen Usage

EchoGraft should use:

- `syngen.loop` for frame updates and music scheduling.
- `syngen.input.keyboard` and `syngen.input.gamepad` for input state.
- `syngen.state` for runtime state import/export/reset.
- `syngen.seed` and `syngen.fn.srand` for deterministic procedural generation.
- `syngen.position` for listener position and orientation.
- `syngen.sound` for spatial seed, scan, hazard, landmark, and chamber voices.
- `syngen.synth` factories for seed DNA.
- `syngen.effect` chains for chamber identity and special mechanics.
- `syngen.formant` and `syngen.effect.talkbox` for Ark voice and memory records.
- `syngen.shape` for distortion, pulse, brightness, and mutation timbres.
- `syngen.buffer` for generated noise beds only, never external audio files.
- `syngen.tool.vector3d`, spatial trees, generators, and noise tools for world layout.

### Sound Object Classes

Implement reusable Syngen sound prototypes:

- `SeedVoice`: persistent planted seed sound.
- `HeartVoice`: chamber target and restored-state sound.
- `ScanPulse`: short spatial ping with delay trail.
- `HazardVoice`: forbidden interval or unstable ecology.
- `BoundaryVoice`: chamber edge, doorway, or return locator.
- `MemoryVoice`: codex/perception reveal.
- `SystemDrone`: restored system layer.
- `StepVoice`: player movement feedback.

### Chamber Audio Layers

Each chamber has:

- Ambient bed.
- Heart voice.
- System drone.
- Planted seed voices.
- Hazard voices.
- Scan response layer.
- Success cadence.
- Optional memory whisper/formant.

### Generative Music

Music should be built from chamber state:

- Restored systems add layers.
- Solved rooms modulate toward consonance.
- Hazards add unstable intervals.
- Player-planted seeds join the harmony.
- Endgame network music is literally the player's restored Ark.

## 12. Interface and Accessibility

### Screen Reader Strategy

Do not render a noisy HUD. Use on-demand announcements.

Baseline commands:

- `O`: objective/current system.
- `P`: position, facing, progress.
- `I`: selected seed and inventory.
- `L`: latest log entry.
- `Shift+L`: full recent log.
- `X`: chamber boundaries and return point.
- `V`: planted seed voices.
- `C`: codex/perception updates.
- `?`: controls.

### Menus

Menus use semantic HTML and must be fully keyboard and screen-reader usable.

Needed menus:

- Main menu.
- Pause/functions menu.
- Seed library.
- Grafting bench.
- Materials.
- Restoration atlas.
- Codex/perceptions.
- Settings.
- Manual.

### Accessibility Features

- No-vision complete play path.
- Captions/event log for all important sounds.
- Independent volume controls.
- Reduced motion.
- Minimal visual mode.
- High contrast.
- Remappable keyboard.
- Gamepad support.
- Optional scan verbosity.
- Optional text-only chamber hints.
- No mandatory reflex timing for main campaign.

## 13. Controls

Baseline keyboard:

- Arrow keys/WASD: move.
- Q/E: rotate/listen left/right when rotation returns.
- Space: primary scan.
- Shift+Space: scan mode menu.
- Enter: plant/interact/confirm.
- Tab: cycle seed.
- Shift+Tab: previous seed.
- Brackets: tune selected trait.
- Number row: select tuning trait or seed quick slots.
- G: graft.
- N: restore/advance when solved.
- O/P/I/L/X/V/C: information commands.
- Escape: pause/functions menu.

Gamepad:

- Left stick/D-pad: move.
- Face buttons: scan, plant, cycle seed, interact.
- Shoulder buttons: tune.
- Start/menu: functions menu.
- Hold modifier + D-pad: objective/position/inventory/log commands.

## 14. Content Plan

### Seed Families

Initial families:

- Sol: stable sine, oxygen, basic pitch.
- Lumen: bright triangle, canopy/light.
- Umbra: phase, cancellation, hidden records.
- Verdant: pulse/rhythm, growth.
- Spire: saw, altitude/canopy access.
- Myco: noise/FM, root networks.
- Glass: high brightness, reflective chambers.
- Tide: AM/current systems.
- Ember: distortion/heat.
- Archive: formant/memory.

### Hazard Families

- Mold intervals: reject forbidden pitch zones.
- Drought pockets: drain pulse stability.
- Glass shear: reflects scans.
- Phase fog: inverts direction cues.
- Static bloom: masks weak seeds.
- Memory loops: repeat misleading old states until resolved.

### Optional Activities

- Rare seed hunting.
- Graft catalog completion.
- Codex completion.
- Conservatory composition.
- Low-cycle restoration challenges.
- Alternate endings.
- Postgame endless mutation garden.

## 15. Narrative

### Premise

The Verdancy Ark was built to carry living ecologies between worlds. Its gardeners encoded ecological control into resonance gardens so future crews could repair systems by sound, pattern, and care. Something severed the Ark's central heart and left its crew dormant.

The player wakes as a resonance gardener or caretaker intelligence with partial memory. Repairing the Ark also reconstructs the truth.

### Core Questions

- Was the Ark abandoned, sabotaged, or protected?
- Should the Ark return to its original mission?
- Should the sleeping crew be awakened unchanged?
- Should the restored ecology be preserved or adapted?
- Is the player restoring a machine, a garden, or a living instrument?

### Ending Routes

- Preservation: restore the Ark as designed.
- Adaptation: evolve the Ark for a new world.
- Release: disperse seed libraries instead of waking the crew.
- Conservatory: keep the Ark as a living musical archive.

## 16. Difficulty and Pacing

Difficulty comes from understanding systems, not reflexes.

Pacing rules:

- Teach one new axis at a time.
- Combine axes only after mastery.
- Optional chambers may be more complex.
- Always allow reset without punishment.
- Always provide scan/log feedback.
- Avoid dead-end resource states.

## 17. Prototype-to-Production Roadmap

### Milestone 1: Strong Vertical Slice

- 8 to 10 chambers.
- Restoration atlas v1.
- Seed library menu.
- Persistent planted Syngen sound objects.
- Grafting bench v1.
- Boundary/objective scan v1.
- On-demand info commands complete.

### Milestone 2: Season 1 Complete

- Intake, navigation, water, canopy systems.
- 6 required contracts, 2 optional contracts.
- First codex records.
- First material loop.
- First chamber rating improvements.

### Milestone 3: Systems Expansion

- Season 2 Rootworks.
- Materials and crafting.
- Persistent chamber changes.
- More scan modes.
- Gamepad support.

### Milestone 4: Campaign Alpha

- All five seasons blocked in.
- End-to-end progression.
- All menus accessible.
- First endings.
- Save/load complete.

### Milestone 5: Content Beta

- 40+ main chambers.
- Optional content pass.
- Full seed/graft catalog.
- Codex complete.
- Audio mix and accessibility pass.

### Milestone 6: Release Candidate

- Manual complete.
- Screen reader testing.
- E2E coverage for key flows.
- Performance pass.
- Packaging and deployment.

## 18. Immediate Implementation Priorities

1. Replace the current instant-complete four-chamber slice with Season 1's 8-contract structure.
2. Add a restoration atlas/functions menu instead of staying inside the final chamber after completion.
3. Persist planted seed sound objects instead of one-shot seed tones.
4. Add scan modes for objective, boundaries, planted seeds, and hazards.
5. Add a seed library/grafting screen.
6. Add materials and rewards for restored systems.
7. Add chamber ratings and atlas planning so the Ark feels like a working restoration campaign.
8. Add codex/perception records for story payoff.
9. Expand tests around no-HUD info commands and gated progression.
10. Keep `npm run check:audio-assets` and `npm run check:syngen-audio` mandatory.

## 19. Open Questions

- Is the player a human gardener, an awakened crew member, or an Ark caretaker intelligence?
- How much freedom should the restoration atlas offer at the start of the campaign?
- How complex should graft genetics become before it harms approachability?
- Should endings be explicit choices, emergent from restoration patterns, or both?
- Should the visual presentation stay minimal, or become a richer abstract greenhouse for sighted players?
- Should the Electron build be a first-class release target or secondary to browser?

## 20. Definition of Done for the Full Game

EchoGraft is complete when a player can start with no prior knowledge, learn to navigate by sound, restore a substantial Ark with dozens of chambers, make meaningful seed/graft decisions, uncover the Ark's history, reach at least one ending, continue into optional composition/restoration play, and do all of this without relying on vision or external audio assets.

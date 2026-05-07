export const endgameResolutions = [
  {
    id: 'preservation',
    title: 'Preservation',
    text: 'The Ark returns to its original greenhouse mission, carrying recovered ecologies forward as designed.',
  },
  {
    id: 'adaptation',
    title: 'Adaptation',
    text: 'The Ark accepts hybrid grafts and evolves its gardens for a changed destination.',
  },
  {
    id: 'release',
    title: 'Release',
    text: 'The Ark disperses seed libraries instead of keeping every ecology inside its hull.',
  },
  {
    id: 'conservatory',
    title: 'Conservatory',
    text: 'The Ark remains a living musical archive where restored systems can keep composing.',
  },
]

export const restorationPhilosophies = [
  {
    id: 'preservation',
    title: 'Preserve original ecosystems',
    text: 'Prioritize original chamber ecology, stable ratings, and careful restoration over hybrid shortcuts.',
  },
  {
    id: 'adaptation',
    title: 'Adapt ecosystems for the changed Ark',
    text: 'Prioritize grafted voices, new lineages, and resilient hybrid ecologies when old plans no longer fit.',
  },
]

export const crewWakeCycleStages = [
  {
    id: 'stasis',
    title: 'Stasis',
    text: 'The crew remains asleep while the Ark restores breath, water, canopy, and memory systems.',
  },
  {
    id: 'circulation',
    title: 'Circulation',
    text: 'Heart Atria restoration returns safe pressure and nutrient rhythm to the sleeping berths.',
  },
  {
    id: 'consent-check',
    title: 'Consent Check',
    text: 'Recovered memories and crew records give the Ark enough context to wake people with informed care.',
  },
  {
    id: 'wake',
    title: 'Wake',
    text: 'The crew can wake into the chosen restoration future unless the player chooses seed release instead.',
  },
]

export const launchGardenStages = [
  {
    id: 'sealed',
    title: 'Sealed',
    text: 'Launch garden pods remain closed while the Heart and root anchors are still offline.',
  },
  {
    id: 'preparing',
    title: 'Preparing',
    text: 'The Central Heart can feed launch pods, but release roots still need a dispersal anchor.',
  },
  {
    id: 'armed',
    title: 'Armed',
    text: 'Heart Root restoration prepares seed libraries for launch beyond the Ark hull.',
  },
  {
    id: 'launched',
    title: 'Launched',
    text: 'The Ark disperses living seed libraries as mobile gardens instead of keeping every future aboard.',
  },
]

export const resolutionEndingScenes = {
  preservation: {
    title: 'Preservation Ending',
    text: 'The Ark wakes as close to its original greenhouse design as the restored chambers allow. Old ecosystems remain legible, crew protocols stay intact, and the final chord favors stable continuity over mutation.',
  },
  adaptation: {
    title: 'Adaptation Ending',
    text: 'The Ark accepts grafted ecologies as its new operating plan. Hybrid lineages reshape the greenhouse around changed conditions, and the final chord keeps learning from every inherited voice.',
  },
  release: {
    title: 'Release Ending',
    text: 'The Ark opens its launch garden and sends seed libraries outward before waking the crew. The final chord becomes a dispersal signal, carrying restored life beyond the hull.',
  },
  conservatory: {
    title: 'Conservatory Ending',
    text: 'The Ark remains a living archive where restored systems, recovered records, and seed voices can keep composing. The final chord is preserved as an instrument instead of a single answer.',
  },
}

export function chooseEndgameResolution(save) {
  const solved = new Set(save.solvedChambers ?? [])
  if (solved.has('optional-heart-root')) return endgameResolutions.find((resolution) => resolution.id === 'release')
  if (solved.has('optional-heart-memory') || (save.codexIds?.length ?? 0) >= 40) return endgameResolutions.find((resolution) => resolution.id === 'conservatory')
  if (save.restorationPhilosophy === 'adaptation') return endgameResolutions.find((resolution) => resolution.id === 'adaptation')
  if (save.restorationPhilosophy === 'preservation') return endgameResolutions.find((resolution) => resolution.id === 'preservation')
  if (solved.has('optional-heart-graft') || (save.unlockedGraftMechanics?.length ?? 0) >= 3) return endgameResolutions.find((resolution) => resolution.id === 'adaptation')
  return endgameResolutions.find((resolution) => resolution.id === 'preservation')
}

export function resolutionSpecificEnding(save) {
  const resolution = save.endgameResolution ?? chooseEndgameResolution(save).id
  const scene = resolutionEndingScenes[resolution] ?? resolutionEndingScenes.preservation

  return {
    resolution,
    ...scene,
  }
}

export function crewWakeCycleSummary(save) {
  const solved = new Set(save.solvedChambers ?? [])
  const resolution = save.endgameResolution ?? chooseEndgameResolution(save).id
  const stageId = save.postgameUnlocked || solved.has('finale')
    ? 'wake'
    : solved.has('optional-heart-memory') || (save.codexIds?.length ?? 0) >= 20
      ? 'consent-check'
      : solved.has('heart-atria')
        ? 'circulation'
        : 'stasis'
  const stage = crewWakeCycleStages.find((item) => item.id === stageId)
  const crewOutcome = resolution === 'release'
    ? 'Seed release takes priority; crew wake remains deferred until dispersed libraries report viable ground.'
    : stageId === 'wake'
      ? `Crew wake authorized for the ${resolution} resolution path.`
      : 'Crew wake is not authorized yet; continue restoring heart and memory context.'

  return {
    resolution,
    stage,
    stageId,
    text: `Crew wake cycle: ${stage.title}. ${stage.text} ${crewOutcome}`,
  }
}

export function launchGardenSummary(save) {
  const solved = new Set(save.solvedChambers ?? [])
  const resolution = save.endgameResolution ?? chooseEndgameResolution(save).id
  const stageId = resolution === 'release' && (save.postgameUnlocked || solved.has('finale'))
    ? 'launched'
    : solved.has('optional-heart-root')
      ? 'armed'
      : solved.has('heart-atria')
        ? 'preparing'
        : 'sealed'
  const stage = launchGardenStages.find((item) => item.id === stageId)
  const releaseOutcome = stageId === 'launched'
    ? 'Release resolution active: launch garden is the primary Ark future.'
    : stageId === 'armed'
      ? 'Release is available if the final resolution favors dispersal.'
      : 'Restore Heart Atria and Heart Root to make seed dispersal viable.'

  return {
    releaseOutcome,
    resolution,
    stage,
    stageId,
    text: `Launch garden: ${stage.title}. ${stage.text} ${releaseOutcome}`,
  }
}

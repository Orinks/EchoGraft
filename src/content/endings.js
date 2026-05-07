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

export function chooseEndgameResolution(save) {
  const solved = new Set(save.solvedChambers ?? [])
  if (solved.has('optional-heart-root')) return endgameResolutions.find((resolution) => resolution.id === 'release')
  if (solved.has('optional-heart-memory') || (save.codexIds?.length ?? 0) >= 40) return endgameResolutions.find((resolution) => resolution.id === 'conservatory')
  if (save.restorationPhilosophy === 'adaptation') return endgameResolutions.find((resolution) => resolution.id === 'adaptation')
  if (save.restorationPhilosophy === 'preservation') return endgameResolutions.find((resolution) => resolution.id === 'preservation')
  if (solved.has('optional-heart-graft') || (save.unlockedGraftMechanics?.length ?? 0) >= 3) return endgameResolutions.find((resolution) => resolution.id === 'adaptation')
  return endgameResolutions.find((resolution) => resolution.id === 'preservation')
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

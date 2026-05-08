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

export const endingResolutionReflectionIds = {
  preservation: ['ending-reflection-01', 'ending-reflection-05', 'ending-reflection-07', 'ending-reflection-08'],
  adaptation: ['ending-reflection-02', 'ending-reflection-05', 'ending-reflection-06', 'ending-reflection-08'],
  release: ['ending-reflection-03', 'ending-reflection-06', 'ending-reflection-07', 'ending-reflection-08'],
  conservatory: ['ending-reflection-04', 'ending-reflection-05', 'ending-reflection-07', 'ending-reflection-08'],
}

export const alternateEndingRequirements = {
  preservation: 'available through preservation philosophy or any careful Stable/Resonant restoration pattern',
  adaptation: 'available through adaptation philosophy, heart graft work, or three unlocked graft mechanics',
  release: 'available after Heart Root prepares launch garden dispersal',
  conservatory: 'available after Heart Memory, broad Codex recovery, or a conservatory finale',
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

export function alternateEndingPaths(save) {
  const solved = new Set(save.solvedChambers ?? [])
  const ratings = Object.values(save.ratings ?? {})
  const carefulRestorations = ratings.filter((rating) => ['Stable', 'Resonant'].includes(rating)).length
  const availableById = {
    preservation: save.restorationPhilosophy === 'preservation' || carefulRestorations > 0 || (save.postgameUnlocked && save.endgameResolution === 'preservation'),
    adaptation: save.restorationPhilosophy === 'adaptation' || solved.has('optional-heart-graft') || (save.unlockedGraftMechanics?.length ?? 0) >= 3 || (save.postgameUnlocked && save.endgameResolution === 'adaptation'),
    release: solved.has('optional-heart-root') || (save.postgameUnlocked && save.endgameResolution === 'release'),
    conservatory: solved.has('optional-heart-memory') || (save.codexIds?.length ?? 0) >= 40 || (save.postgameUnlocked && save.endgameResolution === 'conservatory'),
  }
  const selected = save.endgameResolution ?? chooseEndgameResolution(save).id
  const paths = endgameResolutions.map((resolution) => ({
    ...resolution,
    available: Boolean(availableById[resolution.id]),
    requirement: alternateEndingRequirements[resolution.id],
    selected: resolution.id === selected,
    text: `${resolution.title}: ${availableById[resolution.id] ? 'available' : 'locked'}; ${alternateEndingRequirements[resolution.id]}.`,
  }))
  const availableIds = paths.filter((path) => path.available).map((path) => path.id)

  return {
    availableIds,
    paths,
    selected,
    text: `Alternate endings: ${availableIds.length} of ${paths.length} path(s) available; selected path ${selected}.`,
  }
}

export function originalMissionQuestionState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const ratings = Object.values(save.ratings ?? {})
  const carefulRestorations = ratings.filter((rating) => ['Stable', 'Resonant'].includes(rating)).length
  const adaptiveSignals = (save.unlockedGraftMechanics?.length ?? 0) + (save.wildMutationIds?.length ?? 0) + (save.customSeeds?.length ?? 0) + (save.endlessMutationSeeds?.length ?? 0)
  const releasePrepared = solved.has('optional-heart-root') || save.endgameResolution === 'release'
  const preservationFavored = save.restorationPhilosophy === 'preservation' && carefulRestorations >= adaptiveSignals
  const adaptationFavored = save.restorationPhilosophy === 'adaptation' || adaptiveSignals > carefulRestorations
  const stance = releasePrepared
    ? 'release'
    : adaptationFavored
      ? 'revise'
      : preservationFavored
        ? 'return'
        : 'undecided'
  const recommendation = stance === 'release'
    ? 'Do not simply return; prepare the Ark to send seed libraries beyond its hull.'
    : stance === 'revise'
      ? 'Revise the original mission around changed ecology and inherited graft work.'
      : stance === 'return'
        ? 'Return to the original greenhouse mission, with consent and stewardship checks intact.'
        : 'Keep gathering restoration evidence before deciding whether the original mission still fits.'

  return {
    adaptiveSignals,
    carefulRestorations,
    recommendation,
    releasePrepared,
    stance,
    text: `Original mission question: ${stance}; careful restorations ${carefulRestorations}, adaptive signals ${adaptiveSignals}, release prepared ${releasePrepared ? 'yes' : 'no'}. ${recommendation}`,
  }
}

export function restoredEcologyQuestionState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const ratings = Object.values(save.ratings ?? {})
  const carefulRestorations = ratings.filter((rating) => ['Stable', 'Resonant'].includes(rating)).length
  const adaptiveSignals = (save.unlockedGraftMechanics?.length ?? 0) + (save.wildMutationIds?.length ?? 0) + (save.customSeeds?.length ?? 0) + (save.endlessMutationSeeds?.length ?? 0)
  const releasePrepared = solved.has('optional-heart-root') || save.endgameResolution === 'release'
  const preservedEvidence = carefulRestorations + (save.restorationPhilosophy === 'preservation' ? 1 : 0)
  const adaptedEvidence = adaptiveSignals + (save.restorationPhilosophy === 'adaptation' ? 1 : 0)
  const stance = releasePrepared
    ? 'defer-to-release'
    : preservedEvidence >= adaptedEvidence + 2
      ? 'preserve'
      : adaptedEvidence >= preservedEvidence + 2
        ? 'adapt'
        : 'balance'
  const recommendation = stance === 'defer-to-release'
    ? 'Delay the preserve/adapt vote until launch garden dispersal decides which ecologies must travel.'
    : stance === 'preserve'
      ? 'Preserve the restored ecology as a legible greenhouse baseline, with adaptation held as a later tool.'
      : stance === 'adapt'
        ? 'Adapt the restored ecology around hybrid seed lines and changed Ark conditions.'
        : 'Keep both paths viable: preserve stable chamber baselines while testing adaptation in optional gardens.'

  return {
    adaptedEvidence,
    carefulRestorations,
    preservedEvidence,
    recommendation,
    releasePrepared,
    stance,
    text: `Restored ecology question: ${stance}; preserved evidence ${preservedEvidence}, adapted evidence ${adaptedEvidence}, release prepared ${releasePrepared ? 'yes' : 'no'}. ${recommendation}`,
  }
}

export function endingResolutionReflectionRewards(save) {
  const resolution = save.endgameResolution ?? chooseEndgameResolution(save).id
  const recordIds = endingResolutionReflectionIds[resolution] ?? endingResolutionReflectionIds.preservation

  return {
    recordIds,
    resolution,
    text: `Ending reflections recovered for ${resolution}: ${recordIds.join(', ')}.`,
  }
}

export function mergeEndingResolutionReflections(save) {
  const next = {
    ...save,
    codexIds: [...(save.codexIds ?? [])],
  }
  const rewards = endingResolutionReflectionRewards(next)

  for (const recordId of rewards.recordIds) {
    if (!next.codexIds.includes(recordId)) next.codexIds.push(recordId)
  }

  return next
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

export function crewAwakeningQuestionState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const resolution = save.endgameResolution ?? chooseEndgameResolution(save).id
  const heartReady = save.postgameUnlocked || solved.has('finale') || solved.has('heart-atria')
  const memoryContext = solved.has('optional-heart-memory') || (save.codexIds?.length ?? 0) >= 20
  const releasePrepared = resolution === 'release' || solved.has('optional-heart-root')
  const changedEcology = save.restorationPhilosophy === 'adaptation' || (save.unlockedGraftMechanics?.length ?? 0) > 0 || (save.wildMutationIds?.length ?? 0) > 0
  const stance = releasePrepared
    ? 'defer'
    : !heartReady
      ? 'not-ready'
      : memoryContext
        ? 'consent-first'
        : changedEcology
          ? 'changed-context'
          : 'unchanged'
  const recommendation = stance === 'defer'
    ? 'Do not wake unchanged yet; seed release takes priority until dispersed gardens report back.'
    : stance === 'not-ready'
      ? 'Do not wake the crew; restore Heart and memory context first.'
      : stance === 'consent-first'
        ? 'Wake with consent records and orientation, not as if nothing changed.'
        : stance === 'changed-context'
          ? 'Wake slowly into the changed Ark, with adaptation briefings before full revival.'
          : 'Unchanged wake is viable, but still needs consent review before revival.'

  return {
    changedEcology,
    heartReady,
    memoryContext,
    recommendation,
    releasePrepared,
    stance,
    text: `Crew awakening question: ${stance}; heart ready ${heartReady ? 'yes' : 'no'}, memory context ${memoryContext ? 'yes' : 'no'}, changed ecology ${changedEcology ? 'yes' : 'no'}. ${recommendation}`,
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

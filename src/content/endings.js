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

export function endingChoiceModelState(save = {}) {
  const alternateEndings = alternateEndingPaths(save)
  const recommended = chooseEndgameResolution(save).id
  const selected = save.endgameResolution ?? recommended
  const choices = alternateEndings.paths.map((path) => ({
    id: path.id,
    available: path.available,
    recommended: path.id === recommended,
    selected: path.id === selected,
    title: path.title,
    text: `${path.title}: ${path.available ? 'explicit choice available' : 'locked until pattern evidence'}; ${path.id === recommended ? 'emergent recommendation' : 'alternate resolution'}.`,
  }))

  return {
    choices,
    explicitChoices: true,
    emergentPatterns: true,
    policy: 'both',
    recommended,
    selected,
    text: `Ending choice model: both. Explicit resolution choices select the final scene, while restoration patterns recommend ${recommended} and unlock ${alternateEndings.availableIds.length} alternate path(s); locked endings remain visible with requirements.`,
  }
}

export function firstEndingsState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const selected = save.endgameResolution ?? chooseEndgameResolution(save).id
  const alternateEndings = alternateEndingPaths({ ...save, endgameResolution: selected })
  const finaleComplete = solved.has('finale') || Boolean(save.postgameUnlocked)
  const postgameUnlocked = Boolean(save.postgameUnlocked)
  const endings = endgameResolutions.map((resolution) => {
    const scene = resolutionEndingScenes[resolution.id]
    const path = alternateEndings.paths.find((item) => item.id === resolution.id)

    return {
      ...resolution,
      available: Boolean(path?.available),
      firstPlayable: finaleComplete && resolution.id === selected,
      selected: resolution.id === selected,
      scene,
      text: `${resolution.title}: ${path?.available ? 'available' : 'locked'}, ${resolution.id === selected && finaleComplete ? 'first playable ending' : 'alternate path'}; ${scene.title}.`,
    }
  })
  const playable = endings.filter((ending) => ending.firstPlayable)
  const authored = endings.filter((ending) => ending.scene?.text)

  return {
    authoredCount: authored.length,
    availableIds: alternateEndings.availableIds,
    endings,
    finaleComplete,
    playable,
    postgameUnlocked,
    ready: playable.length > 0 && authored.length === endgameResolutions.length && postgameUnlocked,
    selected,
    text: playable.length
      ? `First endings ready: ${playable[0].title} is playable now; ${authored.length} authored resolution scene(s) are present; available alternates ${alternateEndings.availableIds.join(', ') || 'none'}; postgame handoff ${postgameUnlocked ? 'unlocked' : 'pending'}.`
      : `First endings locked: finish the finale to play the first ending; ${authored.length} authored resolution scene(s) are staged and available alternates ${alternateEndings.availableIds.join(', ') || 'none'}.`,
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

export function restorationIdentityQuestionState(save = {}) {
  const codex = new Set(save.codexIds ?? [])
  const systemEvidence = (save.restoredSystems?.length ?? 0) + Object.values(save.ratings ?? {}).filter((rating) => ['Stable', 'Resonant'].includes(rating)).length
  const gardenEvidence = (save.solvedChambers?.length ?? 0) + [...codex].filter((id) => id.startsWith('plant-memory') || id.startsWith('seed-ancestry')).length + (save.endlessMutationSeeds?.length ?? 0)
  const instrumentRecords = [...codex].filter((id) => ['crew-message-12', 'perception-02', 'perception-04', 'ending-reflection-04'].includes(id)).length
  const instrumentEvidence = (save.unlockedGraftMechanics?.length ?? 0) + (save.customSeeds?.length ?? 0) + (save.conservatoryCompositions?.length ?? 0) + (instrumentRecords * 3)
  const role = instrumentEvidence >= Math.max(systemEvidence, gardenEvidence) && instrumentEvidence > 0
    ? 'living-instrument'
    : gardenEvidence >= systemEvidence && gardenEvidence > 0
      ? 'garden'
      : systemEvidence > 0
        ? 'machine'
        : 'undecided'
  const recommendation = role === 'living-instrument'
    ? 'Treat restoration as tuning a living instrument: every system repair, seed voice, and captioned cue becomes part of the Ark-wide chord.'
    : role === 'garden'
      ? 'Treat restoration as garden stewardship: living lineages, plant memories, and return paths matter as much as repaired hardware.'
      : role === 'machine'
        ? 'Treat restoration as machine repair for now: bring Ark systems online before asking the garden to answer.'
        : 'Keep listening before naming the work; the Ark has not shown enough machine, garden, or instrument evidence yet.'

  return {
    gardenEvidence,
    instrumentEvidence,
    recommendation,
    role,
    systemEvidence,
    text: `Restoration identity question: ${role}; machine evidence ${systemEvidence}, garden evidence ${gardenEvidence}, instrument evidence ${instrumentEvidence}. ${recommendation}`,
  }
}

export function playerRoleQuestionState(save = {}) {
  const codex = new Set(save.codexIds ?? [])
  const crewStillAsleep = !(save.postgameUnlocked || (save.solvedChambers ?? []).includes('finale'))
  const caretakerEvidence = [
    'the interface begins with system stewardship rather than a body wake scene',
    codex.has('story-payoff-01') ? 'Story Payoff 01 names the player as the Ark caretaker' : undefined,
    codex.has('crew-message-10') ? 'Crew Message 10 defers revival until consent can be remembered' : undefined,
    (save.restoredSystems?.length ?? 0) > 0 ? 'restored systems respond directly to the player as maintenance authority' : undefined,
  ].filter(Boolean)
  const humanGardenerEvidence = [
    codex.has('gardener-note-01') ? 'gardener notes teach the work as inherited practice' : undefined,
    codex.has('crew-message-12') ? 'Crew Message 12 says the Ark sang back to a junior gardener' : undefined,
  ].filter(Boolean)
  const awakenedCrewEvidence = [
    crewStillAsleep ? undefined : 'finale/postgame state can wake the crew after restoration',
    codex.has('crew-message-07') ? 'Crew Message 07 confirms the crew entered preservation sleep before the final mission decision' : undefined,
  ].filter(Boolean)

  return {
    candidates: [
      { id: 'ark-caretaker-intelligence', selected: true, evidence: caretakerEvidence },
      { id: 'human-gardener', selected: false, evidence: humanGardenerEvidence },
      { id: 'awakened-crew-member', selected: false, evidence: awakenedCrewEvidence },
    ],
    role: 'ark-caretaker-intelligence',
    text: `Player role question: Ark caretaker intelligence. The player is the Ark's listening caretaker process, borrowing gardener practice through records but not waking as crew; caretaker evidence ${caretakerEvidence.length}, human gardener echoes ${humanGardenerEvidence.length}, awakened crew evidence ${awakenedCrewEvidence.length}.`,
  }
}

export function preservationPathState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const ratings = Object.values(save.ratings ?? {})
  const carefulRestorations = ratings.filter((rating) => ['Stable', 'Resonant'].includes(rating)).length
  const requiredSystemsOnline = (save.restoredSystems ?? []).filter((system) => ['Intake', 'Navigation', 'Water', 'Canopy', 'Memory', 'Heart'].includes(system)).length
  const adaptivePressure = (save.unlockedGraftMechanics?.length ?? 0) + (save.wildMutationIds?.length ?? 0) + (save.customSeeds?.length ?? 0)
  const philosophyAligned = save.restorationPhilosophy === 'preservation'
  const heartReady = solved.has('heart-atria') || solved.has('finale') || save.postgameUnlocked
  const stage = philosophyAligned && heartReady && requiredSystemsOnline >= 6
    ? 'as-designed'
    : philosophyAligned && carefulRestorations > adaptivePressure
      ? 'recovering-design'
      : adaptivePressure > carefulRestorations
        ? 'strained'
        : 'foundation'
  const recommendation = stage === 'as-designed'
    ? 'Preservation is ready: original systems, careful ratings, and Heart stewardship can carry the designed Ark forward.'
    : stage === 'recovering-design'
      ? 'Preservation is on course: keep restoring original systems with Stable or Resonant outcomes before final revival.'
      : stage === 'strained'
        ? 'Preservation is strained by hybrid or Wild pressure; stabilize original chambers before claiming the designed path.'
        : 'Preservation foundation set: restore required systems and careful ratings to make the original design legible.'

  return {
    adaptivePressure,
    carefulRestorations,
    heartReady,
    philosophyAligned,
    requiredSystemsOnline,
    stage,
    text: `Preservation path: ${stage}; systems online ${requiredSystemsOnline}/6, careful restorations ${carefulRestorations}, adaptive pressure ${adaptivePressure}, philosophy ${philosophyAligned ? 'preservation' : 'other'}. ${recommendation}`,
  }
}

export function adaptationPathState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const ratings = Object.values(save.ratings ?? {})
  const carefulRestorations = ratings.filter((rating) => ['Stable', 'Resonant'].includes(rating)).length
  const adaptiveSignals = (save.unlockedGraftMechanics?.length ?? 0) + (save.wildMutationIds?.length ?? 0) + (save.customSeeds?.length ?? 0) + (save.endlessMutationSeeds?.length ?? 0)
  const philosophyAligned = save.restorationPhilosophy === 'adaptation'
  const heartGraftReady = solved.has('optional-heart-graft') || solved.has('finale') || save.postgameUnlocked
  const stage = philosophyAligned && heartGraftReady && adaptiveSignals >= 3
    ? 'new-world'
    : philosophyAligned || (adaptiveSignals >= 2 && adaptiveSignals > carefulRestorations)
      ? 'evolving'
      : adaptiveSignals > 0
        ? 'experimental'
        : 'dormant'
  const recommendation = stage === 'new-world'
    ? 'Adaptation is ready: hybrid lineages, Heart graft work, and mutation evidence can carry the Ark into changed conditions.'
    : stage === 'evolving'
      ? 'Adaptation is active: keep testing grafted voices and resilient seed lines before finalizing the new-world path.'
      : stage === 'experimental'
        ? 'Adaptation has early material; prove it through optional graft work before changing the Ark mission.'
        : 'Adaptation dormant: unlock graft mechanics, Wild mutations, or custom lineages before the Ark can evolve for a new world.'

  return {
    adaptiveSignals,
    carefulRestorations,
    heartGraftReady,
    philosophyAligned,
    stage,
    text: `Adaptation path: ${stage}; adaptive signals ${adaptiveSignals}, careful restorations ${carefulRestorations}, Heart graft ready ${heartGraftReady ? 'yes' : 'no'}, philosophy ${philosophyAligned ? 'adaptation' : 'other'}. ${recommendation}`,
  }
}

export function releasePathState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const codex = new Set(save.codexIds ?? [])
  const launchRootReady = solved.has('optional-heart-root')
  const resolutionSelected = save.endgameResolution === 'release'
  const seedLibraryEvidence = [...codex].filter((id) => id.startsWith('seed-ancestry') || id.startsWith('plant-memory')).length + (save.customSeeds?.length ?? 0) + (save.endlessMutationSeeds?.length ?? 0)
  const crewWakeDeferred = resolutionSelected || launchRootReady
  const stage = resolutionSelected && (save.postgameUnlocked || solved.has('finale'))
    ? 'dispersed'
    : launchRootReady
      ? 'armed'
      : seedLibraryEvidence >= 4
        ? 'catalogued'
        : 'sealed'
  const recommendation = stage === 'dispersed'
    ? 'Release is active: seed libraries disperse first, and crew wake remains deferred until living ground reports back.'
    : stage === 'armed'
      ? 'Release is available: Heart Root can launch libraries if the final resolution chooses dispersal over immediate crew wake.'
      : stage === 'catalogued'
        ? 'Release has library depth but needs Heart Root before dispersal can replace crew wake.'
        : 'Release sealed: recover seed libraries and restore Heart Root before choosing dispersal.'

  return {
    crewWakeDeferred,
    launchRootReady,
    resolutionSelected,
    seedLibraryEvidence,
    stage,
    text: `Release path: ${stage}; seed library evidence ${seedLibraryEvidence}, launch root ${launchRootReady ? 'ready' : 'locked'}, crew wake ${crewWakeDeferred ? 'deferred' : 'not deferred'}. ${recommendation}`,
  }
}

export function conservatoryPathState(save = {}) {
  const solved = new Set(save.solvedChambers ?? [])
  const codexCount = save.codexIds?.length ?? 0
  const compositionCount = save.conservatoryCompositions?.length ?? 0
  const memoryArchiveReady = solved.has('optional-heart-memory') || codexCount >= 20
  const resolutionSelected = save.endgameResolution === 'conservatory'
  const archiveEvidence = codexCount + (compositionCount * 3) + (save.endlessMutationSeeds?.length ?? 0)
  const stage = resolutionSelected && (save.postgameUnlocked || compositionCount > 0)
    ? 'living-archive'
    : memoryArchiveReady
      ? 'open'
      : archiveEvidence > 0
        ? 'cataloguing'
        : 'sealed'
  const recommendation = stage === 'living-archive'
    ? 'Conservatory is active: the Ark remains a living musical archive where restored voices can keep composing.'
    : stage === 'open'
      ? 'Conservatory is available: memory context is deep enough to preserve the Ark as an ongoing archive.'
      : stage === 'cataloguing'
        ? 'Conservatory is cataloguing: keep recovering codex records and seed voices before choosing archive life.'
        : 'Conservatory sealed: recover memories, records, and seed voices before the Ark can become a living archive.'

  return {
    archiveEvidence,
    codexCount,
    compositionCount,
    memoryArchiveReady,
    resolutionSelected,
    stage,
    text: `Conservatory path: ${stage}; archive evidence ${archiveEvidence}, codex ${codexCount}, compositions ${compositionCount}, memory archive ${memoryArchiveReady ? 'ready' : 'locked'}. ${recommendation}`,
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

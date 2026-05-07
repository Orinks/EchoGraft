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

export function chooseEndgameResolution(save) {
  const solved = new Set(save.solvedChambers ?? [])
  if (solved.has('optional-heart-graft') || (save.unlockedGraftMechanics?.length ?? 0) >= 3) return endgameResolutions.find((resolution) => resolution.id === 'adaptation')
  if (solved.has('optional-heart-root')) return endgameResolutions.find((resolution) => resolution.id === 'release')
  if (solved.has('optional-heart-memory') || (save.codexIds?.length ?? 0) >= 40) return endgameResolutions.find((resolution) => resolution.id === 'conservatory')
  return endgameResolutions.find((resolution) => resolution.id === 'preservation')
}

export function createEventLog(limit = 80) {
  const entries = []
  return {
    entries,
    push(message, type = 'info') {
      const entry = { id: `${Date.now()}-${entries.length}`, message, type }
      entries.unshift(entry)
      entries.splice(limit)
      return entry
    },
  }
}

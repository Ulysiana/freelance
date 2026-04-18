export function formatDuration(seconds: number, hoursPerDay = 8): string {
  const secondsPerDay = hoursPerDay * 3600
  if (seconds >= secondsPerDay) {
    const days = Math.floor(seconds / secondsPerDay)
    const rem = seconds % secondsPerDay
    const h = Math.floor(rem / 3600)
    const m = Math.floor((rem % 3600) / 60)
    if (h > 0) return `${days}j ${h}h${m.toString().padStart(2, '0')}m`
    if (m > 0) return `${days}j ${m}m`
    return `${days}j`
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`
  if (m > 0) return `${m}m${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

export function formatLive(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

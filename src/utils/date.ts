export function getDayOfWeek(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

export function isTodaysChore(chore: { recurrence: string; days?: string[] }): boolean {
  const today = getDayOfWeek(new Date())
  
  // Daily chores should always show
  if (chore.recurrence === 'daily') {
    return true
  }
  
  // Weekly chores should only show on their scheduled days
  if (chore.recurrence === 'weekly' && chore.days) {
    return chore.days.includes(today)
  }
  
  return false
}

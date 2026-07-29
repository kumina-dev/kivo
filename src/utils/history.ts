import type { HistoryEntry } from '@/types/history'

export type HistoryGroup = {
  key: string
  title: string
  entries: HistoryEntry[]
}

function getDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getGroupTitle(date: Date): string {
  const today = new Date()
  const yesterday = new Date()

  yesterday.setDate(today.getDate() - 1)

  const dateKey = getDateKey(date)

  if (dateKey === getDateKey(today)) {
    return 'Today'
  }

  if (dateKey === getDateKey(yesterday)) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year:
      date.getFullYear() === today.getFullYear()
        ? undefined
        : 'numeric',
  }).format(date)
}

export function groupHistoryEntries(
  entries: HistoryEntry[],
): HistoryGroup[] {
  const groups = new Map<string, HistoryGroup>()

  for (const entry of entries) {
    const date = new Date(entry.createdAt)
    const key = getDateKey(date)

    const existingGroup = groups.get(key)

    if (existingGroup) {
      existingGroup.entries.push(entry)
      continue
    }

    groups.set(key, {
      key,
      title: getGroupTitle(date),
      entries: [entry],
    })
  }

  return Array.from(groups.values())
}

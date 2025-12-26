export function formatDateOnly(startInput: unknown): string {
  if (startInput === null || startInput === undefined) {
    return 'TBD'
  }

  if (typeof startInput === 'string') {
    const trimmed = startInput.trim()
    if (!trimmed) return 'TBD'

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed
    }

    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) {
      return 'TBD'
    }

    return new Intl.DateTimeFormat('en-CA').format(parsed)
  }

  if (typeof startInput === 'number') {
    const parsed = new Date(startInput)
    if (Number.isNaN(parsed.getTime())) {
      return 'TBD'
    }

    return new Intl.DateTimeFormat('en-CA').format(parsed)
  }

  if (startInput instanceof Date) {
    if (Number.isNaN(startInput.getTime())) {
      return 'TBD'
    }

    return new Intl.DateTimeFormat('en-CA').format(startInput)
  }

  return 'TBD'
}

export function formatDateFromRange(dates: unknown): string {
  if (!dates || typeof dates !== 'object' || !('start' in dates)) {
    return 'TBD'
  }

  let startValue: unknown
  try {
    startValue = (dates as { start?: unknown }).start
  } catch {
    return 'TBD'
  }

  return formatDateOnly(startValue)
}

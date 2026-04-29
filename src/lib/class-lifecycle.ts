/** Deadline batch mock (format bebas yang bisa di-parse Date, mis. "11 Apr 2026"). */

export type BatchVisibility = "PUBLISH" | "DRAFT" | "COMPLETE"

export function endOfDeadlineDayUtcMs(deadlineDisplay: string): number | null {
  const t = Date.parse(deadlineDisplay.trim())
  if (Number.isNaN(t)) return null
  const end = new Date(t)
  end.setHours(23, 59, 59, 999)
  return end.getTime()
}

/** True jika hari ini sudah melewati akhir hari deadline (kelas dianggap complete). */
export function isBatchDeadlinePassed(deadlineDisplay: string): boolean {
  const end = endOfDeadlineDayUtcMs(deadlineDisplay)
  if (end === null) return false
  return Date.now() > end
}

/**
 * Deadline lewat → visible COMPLETE. Deadline diundur ke tanggal lebih baru
 * dan belum lewat → PUBLISH (bisa dipublish lagi).
 */
export function syncBatchAfterDeadlineEdit(opts: {
  newDeadline: string
  previousDeadline?: string
  formVisible: BatchVisibility
}): { visible: BatchVisibility } {
  const prevEnd = opts.previousDeadline
    ? endOfDeadlineDayUtcMs(opts.previousDeadline)
    : null
  const nextEnd = endOfDeadlineDayUtcMs(opts.newDeadline)
  const passed = isBatchDeadlinePassed(opts.newDeadline)

  const deadlineWasPostponedLater =
    prevEnd !== null && nextEnd !== null && nextEnd > prevEnd

  if (passed) {
    return { visible: "COMPLETE" }
  }

  if (deadlineWasPostponedLater && !passed) {
    return { visible: "PUBLISH" }
  }

  return { visible: opts.formVisible }
}

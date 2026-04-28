import type { DemoTrackKey } from "@/lib/demo-access"

/**
 * Jumlah course onboarding per track — selaras dengan seed `initialCourses`
 * di `classes-page.tsx` (kategori Onboarding, filter `jabatan`).
 */
export const ONBOARDING_COURSE_COUNT_BY_TRACK: Record<DemoTrackKey, number> = {
  /** cls-01 … cls-05 */
  pkwt: 5,
  /** cls-06 … cls-09 */
  "pro-hire": 4,
  /** Belum ada baris onboarding MT/Organik di seed course */
  "mt-organik": 0,
}

export type ParticipantCourseDashboardStats = {
  total: number
  completed: number
  onProgress: number
  passed: number
  unpassed: number
}

/** Distribusi demo agar jumlahnya konsisten dengan total course (mock). */
function breakdownDemo(total: number): Omit<ParticipantCourseDashboardStats, "total"> {
  if (total <= 0) {
    return { completed: 0, onProgress: 0, passed: 0, unpassed: 0 }
  }
  if (total === 1) {
    return { completed: 0, onProgress: 1, passed: 0, unpassed: 0 }
  }
  if (total === 2) {
    return { completed: 1, onProgress: 1, passed: 0, unpassed: 0 }
  }
  if (total === 3) {
    return { completed: 1, onProgress: 1, passed: 1, unpassed: 0 }
  }
  if (total === 4) {
    return { completed: 1, onProgress: 1, passed: 1, unpassed: 1 }
  }

  const completed = Math.max(1, Math.round(total * 0.2))
  const onProgress = Math.max(1, Math.round(total * 0.25))
  let passed = Math.max(1, Math.round(total * 0.3))
  let unpassed = total - completed - onProgress - passed
  while (unpassed < 0 && passed > 0) {
    passed--
    unpassed++
  }
  if (unpassed < 0) unpassed = 0

  return { completed, onProgress, passed, unpassed }
}

export function getParticipantCourseDashboardStats(
  track: DemoTrackKey | null | undefined
): ParticipantCourseDashboardStats {
  const key = track ?? "pkwt"
  const total = ONBOARDING_COURSE_COUNT_BY_TRACK[key]
  const rest = breakdownDemo(total)
  return { total, ...rest }
}

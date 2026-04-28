import type { CourseQuizQuestion } from "@/types/course-quiz"

export const LMS_COURSE_QUIZ_STORAGE_KEY = "lms-course-quiz-overlay"

export type CourseQuizPersist = {
  preTestQuestions: CourseQuizQuestion[]
  postTestQuestions: CourseQuizQuestion[]
  testsUseSameQuestions: boolean
  passingGrade: number
  testLevelLabel: string
}

export type MateriQuizOverlayMap = Record<string, CourseQuizPersist>

function readMap(): MateriQuizOverlayMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(LMS_COURSE_QUIZ_STORAGE_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw) as unknown
    return p && typeof p === "object" ? (p as MateriQuizOverlayMap) : {}
  } catch {
    return {}
  }
}

export function getCourseQuizOverlay(
  materiId: string | null | undefined
): CourseQuizPersist | null {
  if (!materiId) return null
  return readMap()[materiId] ?? null
}

export function persistCourseQuizForMateri(
  materiId: string,
  data: CourseQuizPersist
) {
  if (typeof window === "undefined") return
  const map = readMap()
  map[materiId] = data
  localStorage.setItem(LMS_COURSE_QUIZ_STORAGE_KEY, JSON.stringify(map))
}

type MateriLike = {
  id: string
  preTest: CourseQuizQuestion[]
  postTest: CourseQuizQuestion[]
}

/** Gabungkan bank soal dari admin (localStorage) ke materi journey. */
export function mergeMateriQuizFromOverlay<M extends MateriLike>(m: M): M {
  const o = getCourseQuizOverlay(m.id)
  if (!o) return m

  const pre =
    o.preTestQuestions.length > 0
      ? o.preTestQuestions
      : m.preTest.length > 0
        ? m.preTest
        : m.postTest
  const post = o.testsUseSameQuestions
    ? pre
    : o.postTestQuestions.length > 0
      ? o.postTestQuestions
      : m.postTest.length > 0
        ? m.postTest
        : pre

  return {
    ...m,
    preTest: pre,
    postTest: post,
  }
}

export function getQuizLevelLabel(materiId: string | null | undefined): string {
  const o = getCourseQuizOverlay(materiId)
  return (o?.testLevelLabel?.trim() || "Lvl 2 — Pengetahuan") as string
}

export function getOverlayPassingGrade(
  materiId: string | null | undefined,
  fallback = 70
): number {
  const o = getCourseQuizOverlay(materiId)
  if (o == null) return fallback
  const n = o.passingGrade
  if (typeof n !== "number" || Number.isNaN(n)) return fallback
  return Math.min(100, Math.max(0, n))
}

export function overlayTestsUseSameQuestions(
  materiId: string | null | undefined
): boolean | null {
  const o = getCourseQuizOverlay(materiId)
  if (!o) return null
  return o.testsUseSameQuestions
}

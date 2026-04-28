import type { CourseQuizQuestion } from "@/types/course-quiz"
import { overlayTestsUseSameQuestions } from "@/lib/course-quiz-bridge"

export const ONBOARDING_PARTICIPANT_QUIZ_CAP = 2

export function shuffleJourneyQuiz(
  qs: CourseQuizQuestion[],
  seed: string
): CourseQuizQuestion[] {
  const arr = [...qs]
  let h = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0
    const j = h % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function trimQsForOnboardingParticipant(
  qs: CourseQuizQuestion[],
  participant: boolean,
  assignedTrackQuery: boolean,
  cap = ONBOARDING_PARTICIPANT_QUIZ_CAP
): CourseQuizQuestion[] {
  if (participant && assignedTrackQuery && qs.length > cap) {
    return qs.slice(0, cap)
  }
  return qs
}

/**
 * Pre/post bank setelah merge overlay; seed berbeda agar urutan post bisa beda
 * saat bank berbeda (sesuai admin).
 */
export function derivePrePostQuizSets(
  materi: {
    preTest: CourseQuizQuestion[]
    postTest: CourseQuizQuestion[]
    id: string
  },
  batchId: string,
  opts: {
    participant: boolean
    assignedTrackQuery: boolean
  }
): { preQs: CourseQuizQuestion[]; postQs: CourseQuizQuestion[] } {
  const preBank =
    materi.preTest.length > 0 ? materi.preTest : materi.postTest
  const postBankDefault =
    materi.postTest.length > 0 ? materi.postTest : materi.preTest

  const sameFromOverlay = overlayTestsUseSameQuestions(materi.id)
  const useSame =
    sameFromOverlay !== null ? sameFromOverlay : true

  const postBank = useSame ? preBank : postBankDefault

  const preQs = trimQsForOnboardingParticipant(
    shuffleJourneyQuiz(preBank, `${batchId}${materi.id}pre`),
    opts.participant,
    opts.assignedTrackQuery
  )
  const postQs = useSame
    ? preQs
    : trimQsForOnboardingParticipant(
        shuffleJourneyQuiz(postBank, `${batchId}${materi.id}post`),
        opts.participant,
        opts.assignedTrackQuery
      )

  return { preQs, postQs }
}

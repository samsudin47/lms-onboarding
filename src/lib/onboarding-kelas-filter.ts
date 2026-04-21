/** Opsi kelas/batch untuk filter admin (dashboard, leaderboard). */
export const ONBOARDING_KELAS_OPTIONS = [
  "Onboarding PKWT Batch 1",
  "Onboarding MT/Organik Batch 2",
  "Onboarding Pro Hire Batch 1",
] as const

export type OnboardingKelasOption = (typeof ONBOARDING_KELAS_OPTIONS)[number]

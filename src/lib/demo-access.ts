export type DemoUser = {
  name: string
  role: string
  email?: string
  access?: string
  track?: string
}

export type DemoRoleKey =
  | "participant"
  | "adminPSP"
  | "mentor"
  | "coMentor"
  | "examiner"

export type DemoTrackKey = "pkwt" | "pro-hire" | "mt-organik"

export type RolePermissions = {
  key: DemoRoleKey
  label: string
  description: string
  canManageClass: boolean
  canManageJourney: boolean
  canManageModules: boolean
  canManageMentor: boolean
  canManageAdmin: boolean
  canManageExaminer: boolean
  canInputScore: boolean
  canReviewTasks: boolean
  canTrackProgress: boolean
  canFinalizeOutcome: boolean
}

export const guestUser: DemoUser = {
  name: "Guest User",
  role: "Belum login",
}

const permissionMap: Record<DemoRoleKey, RolePermissions> = {
  participant: {
    key: "participant",
    label: "Peserta Onboarding",
    description:
      "Hanya melihat dashboard dan course onboarding sesuai track pribadi.",
    canManageClass: false,
    canManageJourney: false,
    canManageModules: false,
    canManageMentor: false,
    canManageAdmin: false,
    canManageExaminer: false,
    canInputScore: false,
    canReviewTasks: false,
    canTrackProgress: false,
    canFinalizeOutcome: false,
  },
  adminPSP: {
    key: "adminPSP",
    label: "Admin PSP",
    description:
      "Dapat kelola class, assignment mentor, materi, soal, dan setting penilaian.",
    canManageClass: true,
    canManageJourney: true,
    canManageModules: true,
    canManageMentor: true,
    canManageAdmin: true,
    canManageExaminer: true,
    canInputScore: true,
    canReviewTasks: true,
    canTrackProgress: true,
    canFinalizeOutcome: true,
  },
  mentor: {
    key: "mentor",
    label: "Mentor",
    description:
      "Dapat memantau progres mentee, review coaching, menilai project, dan memberi rekomendasi kelulusan.",
    canManageClass: false,
    canManageJourney: false,
    canManageModules: false,
    canManageMentor: true,
    canManageAdmin: false,
    canManageExaminer: false,
    canInputScore: false,
    canReviewTasks: true,
    canTrackProgress: true,
    canFinalizeOutcome: true,
  },
  coMentor: {
    key: "coMentor",
    label: "Co-mentor",
    description:
      "Dapat mendampingi mentee, memperbarui progres, dan memberi catatan coaching.",
    canManageClass: false,
    canManageJourney: false,
    canManageModules: false,
    canManageMentor: true,
    canManageAdmin: false,
    canManageExaminer: false,
    canInputScore: false,
    canReviewTasks: true,
    canTrackProgress: true,
    canFinalizeOutcome: false,
  },
  examiner: {
    key: "examiner",
    label: "Penguji Internal",
    description:
      "Dapat melihat peserta siap uji dan menginput nilai hasil evaluasi.",
    canManageClass: false,
    canManageJourney: false,
    canManageModules: false,
    canManageMentor: false,
    canManageAdmin: false,
    canManageExaminer: true,
    canInputScore: true,
    canReviewTasks: false,
    canTrackProgress: true,
    canFinalizeOutcome: true,
  },
}

export function getRoleKey(role?: string): DemoRoleKey {
  const normalized = role?.trim().toLowerCase()

  if (normalized === "admin psp") return "adminPSP"
  if (normalized === "mentor") return "mentor"
  if (normalized === "co-mentor" || normalized === "co mentor") {
    return "coMentor"
  }
  if (normalized === "penguji internal") return "examiner"

  return "participant"
}

export function getRolePermissions(role?: string): RolePermissions {
  return permissionMap[getRoleKey(role)]
}

export function getDemoUserTrack(user?: DemoUser): DemoTrackKey | null {
  const normalizedTrack = user?.track?.trim().toLowerCase()

  if (
    normalizedTrack === "pkwt" ||
    normalizedTrack === "pro-hire" ||
    normalizedTrack === "mt-organik"
  ) {
    return normalizedTrack
  }

  const normalizedEmail = user?.email?.trim().toLowerCase()

  if (normalizedEmail === "pkwt@peruri.co.id") return "pkwt"
  if (normalizedEmail === "prohire@peruri.co.id") return "pro-hire"
  if (
    normalizedEmail === "mtorgani@peuri.co.id" ||
    normalizedEmail === "mtorganik@peruri.co.id"
  ) {
    return "mt-organik"
  }

  return null
}

export function getStoredDemoUser(): DemoUser {
  if (typeof window === "undefined") return guestUser

  const storedUser = window.sessionStorage.getItem("lms-demo-user")
  if (!storedUser) return guestUser

  try {
    return { ...guestUser, ...(JSON.parse(storedUser) as DemoUser) }
  } catch {
    return guestUser
  }
}

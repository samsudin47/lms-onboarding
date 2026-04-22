import type { DemoRoleKey } from "@/lib/demo-access"

export type DashboardNotificationAlert = {
  key: string
  title: string
  boxClass: string
  bulletClass: string
  items: readonly string[]
}

/** Sama dengan kartu "Pemberitahuan" di dashboard peserta onboarding. */
export const participantNotificationAlerts: readonly DashboardNotificationAlert[] =
  [
    {
      key: "eval-l1",
      title: "Belum mengisi Evaluasi Level 1:",
      boxClass: "border-rose-100 bg-rose-50/90",
      bulletClass: "bg-rose-500",
      items: ["Iso 27001"],
    },
    {
      key: "eval-l3",
      title: "Belum mengisi Evaluasi Level 3:",
      boxClass: "border-amber-100 bg-amber-50/90",
      bulletClass: "bg-amber-500",
      items: ["High Team Performance"],
    },
  ] as const

const mentorCoMentorAlerts: readonly DashboardNotificationAlert[] = [
  {
    key: "mentee-attn",
    title: "Mentee perlu perhatian:",
    boxClass: "border-amber-100 bg-amber-50/90",
    bulletClass: "bg-amber-500",
    items: [
      "Citra Dewi — progress 45% (Coaching Sesi 1)",
      "Eka Putri — progress 33% (Coaching Sesi 1)",
    ],
  },
  {
    key: "coaching-today",
    title: "Jadwal coaching hari ini:",
    boxClass: "border-sky-100 bg-sky-50/90",
    bulletClass: "bg-sky-500",
    items: [
      "10:00 — Budi Santoso · review progress modul budaya kerja",
      "14:00 — Eka Putri · sesi coaching awal orientasi goals",
    ],
  },
] as const

const examinerAlerts: readonly DashboardNotificationAlert[] = [
  {
    key: "pending-score",
    title: "Menunggu input nilai:",
    boxClass: "border-amber-100 bg-amber-50/90",
    bulletClass: "bg-amber-500",
    items: [
      "Raka Saputra (Prohire) — belum dinilai",
      "Dina Maharani (MT) — belum dipilih batch",
    ],
  },
  {
    key: "ready-review",
    title: "Siap ditinjau:",
    boxClass: "border-emerald-100 bg-emerald-50/90",
    bulletClass: "bg-emerald-500",
    items: [
      "Ayu Pratama (PKWT) — sudah dinilai, tersimpan",
    ],
  },
] as const

const adminAlerts: readonly DashboardNotificationAlert[] = [
  {
    key: "overview",
    title: "Ringkasan aktivitas:",
    boxClass: "border-sky-100 bg-sky-50/90",
    bulletClass: "bg-sky-500",
    items: [
      "25 peserta aktif di 3 batch yang berjalan",
      "8 top performer tercatat di leaderboard (minggu ini)",
    ],
  },
  {
    key: "batches",
    title: "Batch & kelas:",
    boxClass: "border-violet-100 bg-violet-50/90",
    bulletClass: "bg-violet-500",
    items: [
      "Onboarding PKWT, Pro Hire, dan MT/Organik — skor tersinkron per kelas",
    ],
  },
] as const

export function getDashboardNotificationAlerts(
  role: DemoRoleKey
): readonly DashboardNotificationAlert[] {
  switch (role) {
    case "mentor":
    case "coMentor":
      return mentorCoMentorAlerts
    case "examiner":
      return examinerAlerts
    case "adminPSP":
      return adminAlerts
    default:
      return participantNotificationAlerts
  }
}

export function getDashboardNotificationItemCount(
  alerts: readonly { items: readonly string[] }[]
): number {
  return alerts.reduce((n, a) => n + a.items.length, 0)
}

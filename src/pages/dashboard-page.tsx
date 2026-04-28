import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellRing,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Medal,
  Star,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { participantNotificationAlerts } from "@/lib/dashboard-notifications"
import {
  getDemoUserTrack,
  getRolePermissions,
  getStoredDemoUser,
} from "@/lib/demo-access"
import { ONBOARDING_KELAS_OPTIONS } from "@/lib/onboarding-kelas-filter"
import { getParticipantCourseDashboardStats } from "@/lib/participant-dashboard-course-stats"
import { getParticipantMyClassesHref } from "@/lib/participant-class-deeplink"

const adminStats = [
  {
    label: "Peserta Aktif",
    value: "25",
    unit: "user",
    note: "Dari 3 batch berjalan",
    icon: Users,
    color: "blue",
  },
]

// Top 8 performers across all classes
const topPerformersAll = [
  { rank: 1, name: "Doni Arief", batch: "Prohire", score: 96, progress: 98 },
  { rank: 2, name: "Ayu Pratama", batch: "PKWT", score: 94, progress: 97 },
  {
    rank: 3,
    name: "Rizky Fauzan",
    batch: "MT/Organik",
    score: 92,
    progress: 95,
  },
  { rank: 4, name: "Budi Santoso", batch: "PKWT", score: 89, progress: 91 },
  { rank: 5, name: "Siti Rahma", batch: "Prohire", score: 87, progress: 90 },
  {
    rank: 6,
    name: "Hendra Wijaya",
    batch: "MT/Organik",
    score: 85,
    progress: 88,
  },
  { rank: 7, name: "Melinda Sari", batch: "PKWT", score: 83, progress: 86 },
  { rank: 8, name: "Fajar Nugroho", batch: "Prohire", score: 81, progress: 84 },
]

const rankColors = [
  { bg: "bg-amber-400", text: "text-amber-900", label: "text-amber-700" }, // 1
  { bg: "bg-slate-300", text: "text-slate-800", label: "text-slate-600" }, // 2
  { bg: "bg-orange-300", text: "text-orange-900", label: "text-orange-700" }, // 3
]

// Best of 3 per batch — `kelasKey` sinkron dengan filter di leaderboard
const batchBestOf3 = [
  {
    kelasKey: "Onboarding PKWT Batch 1",
    batch: "PKWT",
    color: "blue",
    top3: [
      { rank: 1, name: "Ayu Pratama", score: 94, progress: 97 },
      { rank: 2, name: "Budi Santoso", score: 89, progress: 91 },
      { rank: 3, name: "Melinda Sari", score: 83, progress: 86 },
    ],
  },
  {
    kelasKey: "Onboarding Pro Hire Batch 1",
    batch: "Prohire",
    color: "violet",
    top3: [
      { rank: 1, name: "Doni Arief", score: 96, progress: 98 },
      { rank: 2, name: "Siti Rahma", score: 87, progress: 90 },
      { rank: 3, name: "Fajar Nugroho", score: 81, progress: 84 },
    ],
  },
  {
    kelasKey: "Onboarding MT/Organik Batch 2",
    batch: "MT/Organik",
    color: "teal",
    top3: [
      { rank: 1, name: "Rizky Fauzan", score: 92, progress: 95 },
      { rank: 2, name: "Hendra Wijaya", score: 85, progress: 88 },
      { rank: 3, name: "Farida Yunita", score: 78, progress: 82 },
    ],
  },
] as const

/** Top 3 + contoh ranking pengguna (dashboard onboarding). */
const onboardingTopPerformersRow = [
  {
    rank: 1,
    name: "Doni Arief",
    department: "Divisi Keamanan Informasi",
    score: 98,
    initials: "DA",
    medalClass: "text-amber-500",
    badgeClass: "bg-amber-500 text-white",
  },
  {
    rank: 2,
    name: "Ayu Pratama",
    department: "Bagian SDM & Organisasi",
    score: 95,
    initials: "AP",
    medalClass: "text-slate-400",
    badgeClass: "bg-slate-400 text-white",
  },
  {
    rank: 3,
    name: "Rizky Fauzan",
    department: "Unit Operasional",
    score: 92,
    initials: "RF",
    medalClass: "text-amber-700",
    badgeClass: "bg-orange-600 text-white",
  },
] as const

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const mentorStats = [
  {
    label: "Mentee Saya",
    value: "8",
    unit: "peserta",
    note: "2 batch aktif berjalan",
    icon: Users,
    color: "blue",
  },
  {
    label: "Sesi Coaching",
    value: "3",
    unit: "sesi",
    note: "Minggu ini",
    icon: BookOpen,
    color: "violet",
  },
  {
    label: "Perlu Ditindak",
    value: "2",
    unit: "mentee",
    note: "Progress di bawah 50%",
    icon: AlertTriangle,
    color: "amber",
  },
]

const mentorMenteeList = [
  {
    name: "Budi Santoso",
    track: "PKWT",
    progress: 72,
    stage: "Coaching Sesi 2",
    status: "On Track",
  },
  {
    name: "Citra Dewi",
    track: "PKWT",
    progress: 45,
    stage: "Coaching Sesi 1",
    status: "Perlu Perhatian",
  },
  {
    name: "Doni Arief",
    track: "Prohire",
    progress: 88,
    stage: "Penilaian Project",
    status: "On Track",
  },
  {
    name: "Eka Putri",
    track: "Prohire",
    progress: 33,
    stage: "Coaching Sesi 1",
    status: "Perlu Perhatian",
  },
]

const mentorCoachingSchedule = [
  {
    time: "10:00",
    mentee: "Budi Santoso",
    topic: "Review progress modul budaya kerja",
    today: true,
  },
  {
    time: "14:00",
    mentee: "Eka Putri",
    topic: "Sesi coaching awal — orientasi goals",
    today: true,
  },
  {
    time: "Besok",
    mentee: "Citra Dewi",
    topic: "Tindak lanjut checklist sesi 1",
    today: false,
  },
  {
    time: "Besok",
    mentee: "Doni Arief",
    topic: "Review penilaian project",
    today: false,
  },
]

const examinerStats = [
  {
    label: "Peserta Eligible",
    value: "3",
    unit: "peserta",
    note: "Siap dievaluasi",
    icon: Users,
    color: "blue",
  },
  {
    label: "Sudah Dinilai",
    value: "1",
    unit: "peserta",
    note: "Nilai sudah tersimpan",
    icon: CheckCircle2,
    color: "teal",
  },
  {
    label: "Menunggu",
    value: "2",
    unit: "peserta",
    note: "Belum diinput nilainya",
    icon: ClipboardList,
    color: "amber",
  },
]

const examinerParticipantList = [
  {
    name: "Ayu Pratama",
    track: "PKWT",
    selected: true,
    scored: true,
    completed: true,
  },
  {
    name: "Raka Saputra",
    track: "Prohire",
    selected: true,
    scored: false,
    completed: false,
  },
  {
    name: "Dina Maharani",
    track: "MT",
    selected: false,
    scored: false,
    completed: false,
  },
]

const dashboardBackgroundStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.96), rgba(248,250,252,0.97)), url('/logo-peruri.jpg')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right bottom",
  backgroundSize: "420px auto",
} satisfies React.CSSProperties

export default function DashboardPage() {
  const [adminKelasFilter, setAdminKelasFilter] = useState<"all" | string>(
    "all"
  )
  const adminBestOf3Rows = useMemo(
    () =>
      adminKelasFilter === "all"
        ? batchBestOf3
        : batchBestOf3.filter((b) => b.kelasKey === adminKelasFilter),
    [adminKelasFilter]
  )

  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const assignedTrack = getDemoUserTrack(currentUser)
  const myClassHref = assignedTrack
    ? getParticipantMyClassesHref(assignedTrack)
    : "/class?section=overview"
  const participantSummary = useMemo(
    () => getParticipantCourseDashboardStats(assignedTrack),
    [assignedTrack]
  )
  const completionPercent =
    participantSummary.total > 0
      ? Math.round(
          (participantSummary.completed / participantSummary.total) * 100
        )
      : 0

  if (permissions.key === "participant") {
    return (
      <div
        className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-5"
        style={dashboardBackgroundStyle}
      >
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h1 className="text-lg font-semibold">
            Dashboard peserta onboarding
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Akses peserta onboarding dibatasi ke <strong>Dashboard</strong> dan
            <strong> My Course</strong> sesuai track yang ditetapkan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to={myClassHref}>
                Buka My Courses
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-xl border border-blue-200/70 bg-linear-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-blue-700">Course</p>
              <p className="mt-2 text-2xl font-semibold text-blue-950">
                {participantSummary.total}
              </p>
              <p className="mt-1 text-xs text-blue-700/80">
                course onboarding pada track{" "}
                {assignedTrack === "pro-hire"
                  ? "Pro Hire"
                  : assignedTrack === "mt-organik"
                    ? "MT/Organik"
                    : "PKWT"}
              </p>
            </div>

            <div className="rounded-xl border border-violet-200/70 bg-linear-to-br from-violet-50 to-fuchsia-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-violet-700">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-violet-950">
                {participantSummary.completed}
              </p>
              <p className="mt-1 text-xs text-violet-700/80">
                course yang sudah selesai.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-200/70 bg-linear-to-br from-cyan-50 to-sky-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-cyan-700">On Progress</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-950">
                {participantSummary.onProgress}
              </p>
              <p className="mt-1 text-xs text-cyan-700/80">
                course yang sedang berjalan.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-xl border border-rose-200/80 bg-linear-to-br from-rose-50 to-red-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="size-4" />
                  <p className="text-sm font-medium">Unpassed</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-rose-600">
                  {participantSummary.unpassed}
                </p>
                <p className="mt-1 text-xs text-rose-500">
                  course yang belum lulus.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200/80 bg-linear-to-br from-sky-50 to-blue-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <CheckCircle2 className="size-4" />
                  <p className="text-sm font-medium">Passed</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-blue-700">
                  {participantSummary.passed}
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  course yang sudah lulus.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200/70 bg-linear-to-br from-slate-50 via-white to-indigo-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-indigo-700">
              Course Progress
            </p>
            <div className="mt-4 flex flex-col items-center justify-center">
              <div
                className="flex size-36 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#4f46e5 0% ${completionPercent * 0.55}%, #8b5cf6 ${completionPercent * 0.78}%, #67e8f9 ${completionPercent}%, #e5e7eb ${completionPercent}% 100%)`,
                }}
              >
                <div className="flex size-20 flex-col items-center justify-center rounded-full border border-indigo-100 bg-white text-center shadow-sm">
                  <span className="text-xl font-semibold">
                    {completionPercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    selesai
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-center text-xs text-muted-foreground">
                <p>Total course: {participantSummary.total}</p>
                <p>Completed: {participantSummary.completed}</p>
                <p>On Progress: {participantSummary.onProgress}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Top Performers
              </h2>
              <p className="text-xs text-muted-foreground">
                Top Employees Ranking
              </p>
            </div>
            <ul className="mt-4 space-y-4">
              {onboardingTopPerformersRow.map((row) => (
                <li key={row.rank} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full bg-linear-to-br text-sm font-semibold shadow-inner",
                        row.rank === 1 &&
                          "from-amber-100 to-amber-50 text-amber-900",
                        row.rank === 2 &&
                          "from-slate-200 to-slate-100 text-slate-800",
                        row.rank === 3 &&
                          "from-orange-100 to-orange-50 text-orange-900"
                      )}
                    >
                      {row.initials}
                    </div>
                    <span
                      className={cn(
                        "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
                        row.badgeClass
                      )}
                    >
                      {row.rank}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {row.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.department}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                    Score: {row.score}/100
                  </span>
                  <Medal
                    className={cn("size-6 shrink-0", row.medalClass)}
                    strokeWidth={1.5}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-5 overflow-hidden rounded-xl border border-sky-200 bg-sky-50/90 shadow-sm">
              <div className="flex items-center gap-3 border-l-4 border-sky-500 py-3 pr-3 pl-3">
                <div className="relative shrink-0">
                  <div className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-sky-200 to-sky-100 text-sm font-semibold text-sky-900">
                    {initialsFromName(currentUser.name)}
                  </div>
                  <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white shadow-sm">
                    7
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {currentUser.name}{" "}
                    <span className="font-normal text-muted-foreground">
                      (You)
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.role}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-bold text-sky-700 tabular-nums">
                  89/100
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50">
                <Bell className="size-5 text-red-500" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Pemberitahuan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Notification Alerts
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {participantNotificationAlerts.map((alert) => (
                <div
                  key={alert.key}
                  className={cn(
                    "rounded-xl border px-4 py-3 shadow-sm",
                    alert.boxClass
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {alert.title}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {alert.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            alert.bulletClass
                          )}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (permissions.key === "mentor" || permissions.key === "coMentor") {
    const roleLabel = permissions.key === "mentor" ? "Mentor" : "Co-Mentor"
    const colorMap = {
      blue: {
        bg: "from-blue-50 to-indigo-50",
        border: "border-blue-200/70",
        text: "text-blue-700",
        val: "text-blue-950",
      },
      violet: {
        bg: "from-violet-50 to-fuchsia-50",
        border: "border-violet-200/70",
        text: "text-violet-700",
        val: "text-violet-950",
      },
      amber: {
        bg: "from-amber-50 to-orange-50",
        border: "border-amber-200/70",
        text: "text-amber-700",
        val: "text-amber-950",
      },
      teal: {
        bg: "from-teal-50 to-cyan-50",
        border: "border-teal-200/70",
        text: "text-teal-700",
        val: "text-teal-950",
      },
    }
    return (
      <div
        className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-5"
        style={dashboardBackgroundStyle}
      >
        {/* Header */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold">Dashboard {roleLabel}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Ringkasan tugas {roleLabel.toLowerCase()} — monitoring mentee,
                jadwal coaching, dan tindak lanjut progres.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/journey-onboarding?section=mentee-list">
                  Daftar Mentee
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/journey-onboarding?section=progress">
                  Progress Mentee
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          {mentorStats.map((stat) => {
            const Icon = stat.icon
            const c = colorMap[stat.color as keyof typeof colorMap]
            return (
              <div
                key={stat.label}
                className={`rounded-xl border ${c.border} bg-linear-to-br ${c.bg} p-4 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${c.text}`}>
                    {stat.label}
                  </p>
                  <Icon className={`size-4 ${c.text} opacity-70`} />
                </div>
                <p className={`mt-2 text-3xl font-semibold ${c.val}`}>
                  {stat.value}
                  <span className={`ml-1 text-sm font-normal ${c.text}`}>
                    {stat.unit}
                  </span>
                </p>
                <p className={`mt-1 text-xs ${c.text} opacity-80`}>
                  {stat.note}
                </p>
              </div>
            )
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Mentee list */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Daftar Mentee Saya</h2>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                <Link to="/journey-onboarding?section=mentee-list">
                  Lihat semua
                </Link>
              </Button>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Track</th>
                    <th className="px-4 py-3 font-medium">Tahap</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorMenteeList.map((mentee) => (
                    <tr key={mentee.name} className="border-t">
                      <td className="px-4 py-3 font-medium">{mentee.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mentee.track}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mentee.stage}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${mentee.progress}%`,
                                backgroundColor:
                                  mentee.progress >= 70
                                    ? "#22c55e"
                                    : mentee.progress >= 50
                                      ? "#f59e0b"
                                      : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {mentee.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${mentee.status === "On Track" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {mentee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Aksi Cepat {roleLabel}</h2>
            <div className="mt-3 grid gap-2">
              <Button asChild size="sm" className="justify-start">
                <Link to="/journey-onboarding?section=mentee-list">
                  Daftar Mentee
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="justify-start"
              >
                <Link to="/journey-onboarding?section=coaching-1">
                  Coaching Sesi 1
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="justify-start"
              >
                <Link to="/journey-onboarding?section=coaching-2">
                  Coaching Sesi 2
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="justify-start"
              >
                <Link to="/journey-onboarding?section=project">
                  Penilaian Project
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="justify-start"
              >
                <Link to="/journey-onboarding?section=graduation">
                  Konfirmasi Kelulusan
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Jadwal coaching */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Jadwal Coaching Hari Ini</h2>
            <BellRing className="size-4 text-muted-foreground" />
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {mentorCoachingSchedule.map((item, i) => (
              <li key={i} className="flex items-start gap-3 py-3 text-sm">
                <span
                  className={`mt-0.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${item.today ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}
                >
                  <Clock className="size-3" />
                  {item.time}
                </span>
                <div>
                  <p className="font-medium text-foreground">{item.mentee}</p>
                  <p className="text-muted-foreground">{item.topic}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    )
  }

  if (permissions.key === "examiner") {
    const colorMap = {
      blue: {
        bg: "from-blue-50 to-indigo-50",
        border: "border-blue-200/70",
        text: "text-blue-700",
        val: "text-blue-950",
      },
      teal: {
        bg: "from-teal-50 to-cyan-50",
        border: "border-teal-200/70",
        text: "text-teal-700",
        val: "text-teal-950",
      },
      amber: {
        bg: "from-amber-50 to-orange-50",
        border: "border-amber-200/70",
        text: "text-amber-700",
        val: "text-amber-950",
      },
    }
    return (
      <div
        className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-5"
        style={dashboardBackgroundStyle}
      >
        {/* Header */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold">Dashboard Penguji</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Ringkasan tugas penguji — daftar peserta eligible, status
                penilaian, dan input nilai.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/evaluasi-feedback?section=participants">
                  Lihat Peserta
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          {examinerStats.map((stat) => {
            const Icon = stat.icon
            const c = colorMap[stat.color as keyof typeof colorMap]
            return (
              <div
                key={stat.label}
                className={`rounded-xl border ${c.border} bg-linear-to-br ${c.bg} p-4 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${c.text}`}>
                    {stat.label}
                  </p>
                  <Icon className={`size-4 ${c.text} opacity-70`} />
                </div>
                <p className={`mt-2 text-3xl font-semibold ${c.val}`}>
                  {stat.value}
                  <span className={`ml-1 text-sm font-normal ${c.text}`}>
                    {stat.unit}
                  </span>
                </p>
                <p className={`mt-1 text-xs ${c.text} opacity-80`}>
                  {stat.note}
                </p>
              </div>
            )
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Participant list */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Daftar Peserta untuk Dinilai
              </h2>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                <Link to="/evaluasi-feedback?section=participants">
                  Lihat semua
                </Link>
              </Button>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Track</th>
                    <th className="px-4 py-3 font-medium">Dipilih</th>
                    <th className="px-4 py-3 font-medium">Status Nilai</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {examinerParticipantList.map((p) => (
                    <tr key={p.name} className="border-t">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.track}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.selected ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {p.selected ? "Dipilih" : "Belum"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.scored ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {p.scored ? "Sudah dinilai" : "Belum dinilai"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.completed ? (
                          <Button asChild size="sm" variant="outline">
                            <Link to="/evaluasi-input-penilaian">
                              Input nilai
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Tugas belum selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Aksi Cepat Penguji</h2>
            <div className="mt-3 grid gap-2">
              <Button asChild size="sm" className="justify-start">
                <Link to="/evaluasi-feedback?section=participants">
                  Nama Peserta
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="justify-start"
              >
                <Link to="/evaluasi-input-penilaian">Input Penilaian</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="justify-start"
              >
                <Link to="/evaluasi-feedback">Evaluasi Feedback</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div
      className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-5"
      style={dashboardBackgroundStyle}
    >
      {/* Stats cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => {
          const Icon = stat.icon
          const colorMap = {
            blue: {
              bg: "from-blue-50 to-indigo-50",
              border: "border-blue-200/70",
              text: "text-blue-700",
              val: "text-blue-950",
            },
            violet: {
              bg: "from-violet-50 to-fuchsia-50",
              border: "border-violet-200/70",
              text: "text-violet-700",
              val: "text-violet-950",
            },
            amber: {
              bg: "from-amber-50 to-orange-50",
              border: "border-amber-200/70",
              text: "text-amber-700",
              val: "text-amber-950",
            },
            teal: {
              bg: "from-teal-50 to-cyan-50",
              border: "border-teal-200/70",
              text: "text-teal-700",
              val: "text-teal-950",
            },
          }
          const c = colorMap[stat.color as keyof typeof colorMap]
          return (
            <div
              key={stat.label}
              className={`rounded-xl border ${c.border} bg-linear-to-br ${c.bg} p-4 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${c.text}`}>{stat.label}</p>
                <Icon className={`size-4 ${c.text} opacity-70`} />
              </div>
              <p className={`mt-2 text-3xl font-semibold ${c.val}`}>
                {stat.value}
                <span className={`ml-1 text-sm font-normal ${c.text}`}>
                  {stat.unit}
                </span>
              </p>
              <p className={`mt-1 text-xs ${c.text} opacity-80`}>{stat.note}</p>
            </div>
          )
        })}
      </section>

      {/* ── Statistik Seluruh Kelas: Top 8 Performers ─────────────────── */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Medal className="size-4 text-amber-500" />
            <h2 className="text-sm font-semibold">
              Top Performer — Seluruh Kelas
            </h2>
          </div>
          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
            <Link to="/leaderboard">Lihat leaderboard</Link>
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          8 peserta dengan skor & progres terbaik dari semua batch yang sedang
          berjalan.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {topPerformersAll.map((p) => {
            const isTop3 = p.rank <= 3
            const rc = rankColors[p.rank - 1]
            return (
              <div
                key={p.rank}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  isTop3
                    ? "border-amber-200/80 bg-linear-to-br from-amber-50 to-orange-50"
                    : "border-slate-200/70 bg-slate-50/60"
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isTop3
                      ? `${rc.bg} ${rc.text}`
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {p.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.batch}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${isTop3 ? rc.label : "text-slate-700"}`}
                  >
                    {p.score}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.progress}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Statistik per Kelas: Best of 3 ────────────────────────────── */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Star className="mt-0.5 size-4 shrink-0 text-violet-500" />
            <div>
              <h2 className="text-sm font-semibold">
                Best of 3 — Per Kelas/Batch
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                3 peserta terbaik di masing-masing batch berdasarkan skor
                evaluasi.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm sm:pt-0.5">
            <label
              htmlFor="dashboard-kelas-filter"
              className="text-muted-foreground"
            >
              Kelas:
            </label>
            <select
              id="dashboard-kelas-filter"
              value={adminKelasFilter}
              onChange={(e) => setAdminKelasFilter(e.target.value)}
              className="min-w-0 max-w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
            >
              <option value="all">Semua Kelas</option>
              {ONBOARDING_KELAS_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {adminBestOf3Rows.length === 0 ? (
            <p className="text-sm text-muted-foreground sm:col-span-2 md:col-span-3">
              Tidak ada data untuk kelas yang dipilih.
            </p>
          ) : null}
          {adminBestOf3Rows.map((cls) => {
            const batchColorMap: Record<
              string,
              { header: string; border: string; bg: string; badge: string }
            > = {
              blue: {
                header: "text-blue-700",
                border: "border-blue-200/70",
                bg: "bg-blue-50/60",
                badge: "bg-blue-100 text-blue-700",
              },
              violet: {
                header: "text-violet-700",
                border: "border-violet-200/70",
                bg: "bg-violet-50/60",
                badge: "bg-violet-100 text-violet-700",
              },
              teal: {
                header: "text-teal-700",
                border: "border-teal-200/70",
                bg: "bg-teal-50/60",
                badge: "bg-teal-100 text-teal-700",
              },
            }
            const bc = batchColorMap[cls.color]
            return (
              <div
                key={cls.kelasKey}
                className={`rounded-xl border ${bc.border} ${bc.bg} p-4`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`text-sm font-semibold ${bc.header}`}>
                    {cls.batch}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bc.badge}`}
                  >
                    Top 3
                  </span>
                </div>
                <ol className="space-y-2">
                  {cls.top3.map((p) => {
                    const isTop = p.rank === 1
                    const rc = rankColors[p.rank - 1]
                    return (
                      <li key={p.rank} className="flex items-center gap-2">
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${rc.bg} ${rc.text}`}
                        >
                          {p.rank}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm ${isTop ? "font-semibold" : "font-medium"}`}
                          >
                            {p.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-semibold ${rc.label ?? "text-slate-700"}`}
                          >
                            {p.score}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {p.progress}%
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

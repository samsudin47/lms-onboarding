import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Info,
  TrendingUp,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getDemoUserTrack,
  getRolePermissions,
  getStoredDemoUser,
} from "@/lib/demo-access"

const adminStats = [
  {
    label: "Peserta Aktif",
    value: "25",
    unit: "user",
    note: "Dari 3 batch berjalan",
    icon: Users,
    color: "blue",
  },
  {
    label: "Batch Berjalan",
    value: "3",
    unit: "batch",
    note: "PKWT · Prohire · MT/Organik",
    icon: TrendingUp,
    color: "violet",
  },
  {
    label: "Evaluasi Menunggu",
    value: "7",
    unit: "peserta",
    note: "Perlu validasi admin",
    icon: ClipboardList,
    color: "amber",
  },
]

const batchProgress = [
  {
    name: "PKWT",
    total: 10,
    active: 8,
    completed: 2,
    completionPct: 20,
    avgModulePct: 68,
    href: "/class?track=pkwt&section=overview",
  },
  {
    name: "Prohire",
    total: 9,
    active: 7,
    completed: 2,
    completionPct: 22,
    avgModulePct: 54,
    href: "/class?track=pro-hire&section=overview",
  },
  {
    name: "MT/Organik",
    total: 6,
    active: 5,
    completed: 1,
    completionPct: 17,
    avgModulePct: 41,
    href: "/class?track=mt-organik&section=overview",
  },
]

const priorityItems = [
  {
    type: "warning" as const,
    text: "Dokumen belum ditandatangani: 4 peserta PKWT menunggu kontrak digital.",
  },
  {
    type: "warning" as const,
    text: "7 peserta memenuhi syarat evaluasi, belum divalidasi admin.",
  },
  {
    type: "info" as const,
    text: "Modul budaya kerja rata-rata 68% — ingatkan peserta lanjut ke video & kuis.",
  },
  {
    type: "info" as const,
    text: "Batch Prohire: 2 peserta belum melengkapi profil onboarding.",
  },
]

const notificationItems = [
  {
    time: "09:00",
    text: "Sesi welcome HR — tautkan ke kalender class",
    today: true,
  },
  {
    time: "13:00",
    text: "Training tools batch April — 12 peserta terdaftar",
    today: true,
  },
  {
    time: "16:00",
    text: "Deadline profil & dokumen — cek reminder otomatis",
    today: true,
  },
  {
    time: "Besok",
    text: "Review modul kuis batch PKWT minggu ke-3",
    today: false,
  },
]

const moduleItems = [
  {
    label: "Pengenalan perusahaan",
    pct: 85,
    to: "/modul-pembelajaran-interaktif",
  },
  {
    label: "Budaya kerja & video",
    pct: 68,
    to: "/modul-pembelajaran-interaktif",
  },
  {
    label: "Pelatihan tools internal",
    pct: 52,
    to: "/modul-pembelajaran-interaktif",
  },
  { label: "Kuis & checklist", pct: 39, to: "/modul-pembelajaran-interaktif" },
]

const participantClassSummary = {
  pkwt: { total: 4, completed: 1, onProgress: 1, passed: 1, unpassed: 0 },
  "pro-hire": { total: 4, completed: 1, onProgress: 1, passed: 1, unpassed: 0 },
  "mt-organik": {
    total: 4,
    completed: 1,
    onProgress: 1,
    passed: 1,
    unpassed: 0,
  },
} as const

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
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const assignedTrack = getDemoUserTrack(currentUser)
  const myClassHref = assignedTrack
    ? `/class?track=${assignedTrack}&section=overview`
    : "/class?section=overview"
  const summaryKey = assignedTrack ?? "pkwt"
  const participantSummary = participantClassSummary[summaryKey]
  const completionPercent = Math.round(
    (participantSummary.completed / participantSummary.total) * 100
  )

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
            <strong> My Class</strong> sesuai track yang ditetapkan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to={myClassHref}>
                Buka My Classes
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-xl border border-blue-200/70 bg-linear-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-blue-700">Class</p>
              <p className="mt-2 text-2xl font-semibold text-blue-950">
                {participantSummary.total}
              </p>
              <p className="mt-1 text-xs text-blue-700/80">
                class yang diikuti pada track{" "}
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
                class yang sudah selesai.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-200/70 bg-linear-to-br from-cyan-50 to-sky-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-cyan-700">On Progress</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-950">
                {participantSummary.onProgress}
              </p>
              <p className="mt-1 text-xs text-cyan-700/80">
                class yang sedang berjalan.
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
                  class yang belum lulus.
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
                  class yang sudah lulus.
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
      {/* Header */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Dashboard Admin PSP</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Ringkasan operasional onboarding harian — monitoring peserta,
              evaluasi, dan reminder dalam satu halaman.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/class?section=batch-list">
                Kelola batch
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/evaluasi-feedback">Buka evaluasi</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/notifikasi-reminder-otomatis">Atur reminder</Link>
            </Button>
          </div>
        </div>
      </section>

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

      {/* Batch progress */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Progres per Batch</h2>
          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
            <Link to="/class?section=batch-list">Lihat semua batch</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {batchProgress.map((batch) => (
            <Link
              key={batch.name}
              to={batch.href}
              className="group rounded-lg border border-slate-200/80 bg-slate-50/60 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{batch.name}</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  {batch.total} peserta
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Penyelesaian onboarding</span>
                    <span className="font-medium text-slate-700">
                      {batch.completionPct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${batch.completionPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Rata-rata progres modul</span>
                    <span className="font-medium text-slate-700">
                      {batch.avgModulePct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${batch.avgModulePct}%`,
                        backgroundColor:
                          batch.avgModulePct >= 70
                            ? "#22c55e"
                            : batch.avgModulePct >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-full bg-teal-500" />
                  Aktif: {batch.active}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-full bg-blue-500" />
                  Selesai: {batch.completed}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Prioritas hari ini */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Prioritas Hari Ini</h2>
          <ul className="mt-3 space-y-3">
            {priorityItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                {item.type === "warning" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                ) : (
                  <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
                )}
                <span className="text-muted-foreground">{item.text}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="mt-4" variant="outline" size="sm">
            <Link to="/riwayat-onboarding">Buka riwayat lengkap</Link>
          </Button>
        </div>

        {/* Aksi cepat */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Aksi Cepat Admin</h2>
          <div className="mt-3 grid gap-2">
            <Button asChild size="sm" className="justify-start">
              <Link to="/class?section=batch-list">
                Update batch onboarding
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="justify-start"
            >
              <Link to="/class?section=mentor">
                Kelola mentor dan co-mentor
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="justify-start"
            >
              <Link to="/evaluasi-feedback">Validasi evaluasi peserta</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="justify-start"
            >
              <Link to="/modul-pembelajaran-interaktif">
                Review modul pembelajaran
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="justify-start"
            >
              <Link to="/notifikasi-reminder-otomatis">
                Kelola notifikasi & reminder
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {/* Modul prioritas */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Progres Modul Minggu Ini</h2>
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
              <Link to="/modul-pembelajaran-interaktif">Lihat semua</Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-4">
            {moduleItems.map((item) => (
              <li key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                  <span
                    className={`text-xs font-semibold ${
                      item.pct >= 70
                        ? "text-teal-600"
                        : item.pct >= 50
                          ? "text-amber-600"
                          : "text-red-500"
                    }`}
                  >
                    {item.pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor:
                        item.pct >= 70
                          ? "#14b8a6"
                          : item.pct >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Notifikasi */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pusat Notifikasi Kegiatan</h2>
            <BellRing className="size-4 text-muted-foreground" />
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {notificationItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 py-3 text-sm">
                <span
                  className={`mt-0.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                    item.today
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Clock className="size-3" />
                  {item.time}
                </span>
                <span className="text-muted-foreground">{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/notifikasi-reminder-otomatis">Kelola notifikasi</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/class">Lihat jadwal class</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

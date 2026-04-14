import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CalendarDays, PencilLine, Route, Trash2, Users } from "lucide-react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFeatureByPath } from "@/lib/app-features"
import { getRolePermissions, getStoredDemoUser } from "@/lib/demo-access"

const feature = getFeatureByPath("/journey-onboarding")!

type StageStatus = "Belum dimulai" | "Berjalan" | "Selesai"

type JourneyStage = {
  id: string
  title: string
  detail: string
  deadline: string
  status: StageStatus
  progress: number
  nextHref: string
  nextLabel: string
}

type MenteeMonitor = {
  id: string
  name: string
  track: string
  stage: string
  progress: number
  note: string
}

type CoachingResultRow = {
  id: string
  menteeName: string
  track: string
  sessionDate: string
  topic: string
  summary: string
  followUp: string
  status: "Butuh tindak lanjut" | "On track" | "Selesai"
}

type ProjectAssessmentRow = {
  id: string
  menteeName: string
  track: string
  projectTitle: string
  score: number
  mentorNote: string
  recommendation: string
  status: "Perlu revisi" | "Layak lanjut" | "Selesai"
}

type GraduationDecisionRow = {
  id: string
  menteeName: string
  track: string
  finalScore: number
  mentorRecommendation: string
  examinerStatus: string
  graduationStatus:
    | "Menunggu"
    | "Direkomendasikan lulus"
    | "Perlu evaluasi ulang"
  nextAction: string
}

type AllClassMenteeRow = {
  id: string
  name: string
  email: string
  className: string
  batch: string
  track: string
  stage: string
  progress: number
  status: string
}

const mentorSections = [
  "mentee-list",
  "progress",
  "coaching-1",
  "coaching-2",
  "coaching-3",
  "project",
  "graduation",
]

const initialStages: JourneyStage[] = [
  {
    id: "stage-docs",
    title: "Verifikasi dokumen & aktivasi akun",
    detail: "NPWP, kontrak, dan data rekening telah divalidasi.",
    deadline: "12 Apr 2026",
    status: "Selesai",
    progress: 100,
    nextHref: "/modul-pembelajaran-interaktif",
    nextLabel: "Buka management class",
  },
  {
    id: "stage-culture",
    title: "Pengenalan perusahaan & budaya kerja",
    detail:
      "Tonton video, baca materi, dan kerjakan pre-test pada modul belajar.",
    deadline: "16 Apr 2026",
    status: "Berjalan",
    progress: 70,
    nextHref: "/modul-pembelajaran-interaktif",
    nextLabel: "Lanjut review tugas",
  },
  {
    id: "stage-class",
    title: "Setup tools kerja & orientasi unit",
    detail: "Ikuti class aktif sesuai track dan selesaikan tugas onboarding.",
    deadline: "20 Apr 2026",
    status: "Belum dimulai",
    progress: 10,
    nextHref: "/class",
    nextLabel: "Lihat my class",
  },
]

const initialMentorQueue: MenteeMonitor[] = [
  {
    id: "queue-ayu",
    name: "Ayu Pratama",
    track: "PKWT",
    stage: "Induksi Karyawan",
    progress: 82,
    note: "Siap dijadwalkan post test.",
  },
  {
    id: "queue-raka",
    name: "Raka Saputra",
    track: "Pro Hire",
    stage: "Organizational Awareness",
    progress: 64,
    note: "Butuh coaching tambahan pada tugas resume.",
  },
  {
    id: "queue-dina",
    name: "Dina Maharani",
    track: "MT/Organik",
    stage: "In Class Training",
    progress: 58,
    note: "Menunggu review mentor untuk project awal.",
  },
]

const coachingSessionOneResults: CoachingResultRow[] = [
  {
    id: "coaching-1-ayu",
    menteeName: "Ayu Pratama",
    track: "PKWT",
    sessionDate: "14 Apr 2026",
    topic: "Adaptasi onboarding dan readiness post-test",
    summary:
      "Peserta memahami alur onboarding dan siap masuk ke evaluasi akhir modul dasar.",
    followUp:
      "Lanjutkan ke post-test dan validasi tugas ringkasan budaya kerja.",
    status: "On track",
  },
  {
    id: "coaching-1-raka",
    menteeName: "Raka Saputra",
    track: "Pro Hire",
    sessionDate: "16 Apr 2026",
    topic: "Pemahaman materi organizational awareness",
    summary:
      "Peserta masih membutuhkan penguatan pada resume materi dan konteks peran di unit kerja.",
    followUp:
      "Jadwalkan coaching tambahan dan review ulang resume orientation class.",
    status: "Butuh tindak lanjut",
  },
  {
    id: "coaching-1-dina",
    menteeName: "Dina Maharani",
    track: "MT/Organik",
    sessionDate: "18 Apr 2026",
    topic: "Kesiapan project awal dan pemetaan learning gap",
    summary:
      "Peserta aktif selama sesi dan sudah menyusun action plan awal untuk project assignment.",
    followUp: "Pantau progress project pada sesi coaching berikutnya.",
    status: "Selesai",
  },
]

const coachingSessionTwoResults: CoachingResultRow[] = [
  {
    id: "coaching-2-ayu",
    menteeName: "Ayu Pratama",
    track: "PKWT",
    sessionDate: "21 Apr 2026",
    topic: "Review hasil post-test dan kesiapan tugas akhir",
    summary:
      "Peserta stabil, sudah menyelesaikan evaluasi dasar dan menunjukkan pemahaman yang baik.",
    followUp:
      "Teruskan ke review project singkat dan finalisasi rekomendasi mentor.",
    status: "Selesai",
  },
  {
    id: "coaching-2-raka",
    menteeName: "Raka Saputra",
    track: "Pro Hire",
    sessionDate: "23 Apr 2026",
    topic: "Pendalaman hasil resume dan ekspektasi unit kerja",
    summary:
      "Masih ada gap pada pemahaman konteks unit sehingga butuh simulasi tambahan.",
    followUp:
      "Tambahkan coaching praktik dan minta revisi resume sebelum project review.",
    status: "Butuh tindak lanjut",
  },
  {
    id: "coaching-2-dina",
    menteeName: "Dina Maharani",
    track: "MT/Organik",
    sessionDate: "25 Apr 2026",
    topic: "Review implementasi action plan project awal",
    summary:
      "Peserta konsisten menjalankan action plan dan aktif meminta feedback selama project berjalan.",
    followUp:
      "Lanjutkan ke sesi coaching 3 untuk evaluasi kesiapan presentasi project.",
    status: "On track",
  },
]

const coachingSessionThreeResults: CoachingResultRow[] = [
  {
    id: "coaching-3-ayu",
    menteeName: "Ayu Pratama",
    track: "PKWT",
    sessionDate: "28 Apr 2026",
    topic: "Final check kesiapan kelulusan onboarding",
    summary:
      "Peserta menyelesaikan seluruh tugas dan menunjukkan kesiapan transisi ke fase kerja reguler.",
    followUp: "Teruskan ke konfirmasi kelulusan dan arsipkan hasil coaching.",
    status: "Selesai",
  },
  {
    id: "coaching-3-raka",
    menteeName: "Raka Saputra",
    track: "Pro Hire",
    sessionDate: "29 Apr 2026",
    topic: "Evaluasi akhir perbaikan materi dan project",
    summary:
      "Performa membaik, namun masih perlu validasi dari penguji sebelum dinyatakan selesai.",
    followUp: "Sinkronkan hasil mentor dengan penguji internal.",
    status: "On track",
  },
  {
    id: "coaching-3-dina",
    menteeName: "Dina Maharani",
    track: "MT/Organik",
    sessionDate: "30 Apr 2026",
    topic: "Review kesiapan presentasi project akhir",
    summary:
      "Peserta siap presentasi dan telah memenuhi target pada sebagian besar indikator pembelajaran.",
    followUp:
      "Lanjutkan ke penilaian project dan finalisasi rekomendasi kelulusan.",
    status: "Selesai",
  },
]

const projectAssessmentResults: ProjectAssessmentRow[] = [
  {
    id: "project-ayu",
    menteeName: "Ayu Pratama",
    track: "PKWT",
    projectTitle: "Ringkasan budaya kerja Peruri",
    score: 88,
    mentorNote:
      "Struktur rapi, contoh implementasi budaya kerja cukup relevan.",
    recommendation: "Siap lanjut ke konfirmasi kelulusan.",
    status: "Selesai",
  },
  {
    id: "project-raka",
    menteeName: "Raka Saputra",
    track: "Pro Hire",
    projectTitle: "Resume orientation class",
    score: 74,
    mentorNote:
      "Konten sudah cukup, tetapi perlu pendalaman konteks unit kerja.",
    recommendation: "Perlu revisi minor sebelum final review.",
    status: "Perlu revisi",
  },
  {
    id: "project-dina",
    menteeName: "Dina Maharani",
    track: "MT/Organik",
    projectTitle: "Action plan project assignment",
    score: 91,
    mentorNote:
      "Analisis kuat dan action plan sudah realistis untuk diimplementasikan.",
    recommendation: "Layak lanjut ke evaluasi akhir.",
    status: "Layak lanjut",
  },
]

const graduationDecisionResults: GraduationDecisionRow[] = [
  {
    id: "graduation-ayu",
    menteeName: "Ayu Pratama",
    track: "PKWT",
    finalScore: 87,
    mentorRecommendation: "Direkomendasikan lulus",
    examinerStatus: "Nilai lengkap",
    graduationStatus: "Direkomendasikan lulus",
    nextAction: "Terbitkan status lulus onboarding.",
  },
  {
    id: "graduation-raka",
    menteeName: "Raka Saputra",
    track: "Pro Hire",
    finalScore: 76,
    mentorRecommendation: "Perlu evaluasi ulang minor",
    examinerStatus: "Menunggu final review",
    graduationStatus: "Menunggu",
    nextAction: "Tunggu review penguji dan revisi minor peserta.",
  },
  {
    id: "graduation-dina",
    menteeName: "Dina Maharani",
    track: "MT/Organik",
    finalScore: 90,
    mentorRecommendation: "Direkomendasikan lulus",
    examinerStatus: "Nilai lengkap",
    graduationStatus: "Direkomendasikan lulus",
    nextAction: "Lanjutkan finalisasi administrasi kelulusan.",
  },
]

function buildAllClassMentees(): AllClassMenteeRow[] {
  const firstNames = [
    "Ayu",
    "Raka",
    "Dina",
    "Rina",
    "Bima",
    "Nia",
    "Putri",
    "Fajar",
    "Sinta",
    "Rizky",
  ]
  const lastNames = [
    "Pratama",
    "Saputra",
    "Maharani",
    "Wijaya",
    "Lestari",
    "Ramadhan",
    "Permata",
    "Kusuma",
    "Nugraha",
    "Handayani",
  ]
  const configs = [
    {
      key: "pkwt",
      className: "PKWT April 2026",
      batch: "Batch 1",
      track: "PKWT",
      stage: "Induksi Karyawan",
      total: 55,
    },
    {
      key: "pro-hire",
      className: "Pro Hire April 2026",
      batch: "Batch 1",
      track: "Pro Hire",
      stage: "Organizational Awareness",
      total: 48,
    },
    {
      key: "mt-organik",
      className: "MT/Organik Mei 2026",
      batch: "Batch 1",
      track: "MT/Organik",
      stage: "In Class Training",
      total: 52,
    },
  ] as const
  const statusList = [
    "Aktif onboarding",
    "Sedang belajar",
    "Siap review mentor",
  ]

  return configs.flatMap((config) =>
    Array.from({ length: config.total }, (_, index) => {
      const name = `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`
      const progress = Math.min(35 + ((index * 9) % 60), 100)

      return {
        id: `${config.key}-mentee-${index + 1}`,
        name,
        email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}.${index + 1}@peruri.co.id`,
        className: config.className,
        batch: config.batch,
        track: config.track,
        stage: config.stage,
        progress,
        status: statusList[index % statusList.length],
      }
    })
  )
}

export default function JourneyOnboardingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const activeSection = searchParams.get("section") ?? ""
  const activeTrackFilter = searchParams.get("track") ?? "all"
  const activeNameFilter = searchParams.get("name") ?? ""
  const isMentorSection =
    permissions.canManageMentor && mentorSections.includes(activeSection)

  const [stages] = useState(initialStages)
  const [mentorQueue, setMentorQueue] = useState(initialMentorQueue)

  const allClassMentees = useMemo(() => buildAllClassMentees(), [])

  const coachingSessionOneSummary = useMemo(
    () => ({
      total: coachingSessionOneResults.length,
      followUp: coachingSessionOneResults.filter(
        (item) => item.status === "Butuh tindak lanjut"
      ).length,
      completed: coachingSessionOneResults.filter(
        (item) => item.status === "Selesai"
      ).length,
    }),
    []
  )

  const coachingSessionTwoSummary = useMemo(
    () => ({
      total: coachingSessionTwoResults.length,
      followUp: coachingSessionTwoResults.filter(
        (item) => item.status === "Butuh tindak lanjut"
      ).length,
      completed: coachingSessionTwoResults.filter(
        (item) => item.status === "Selesai"
      ).length,
    }),
    []
  )

  const coachingSessionThreeSummary = useMemo(
    () => ({
      total: coachingSessionThreeResults.length,
      followUp: coachingSessionThreeResults.filter(
        (item) => item.status === "Butuh tindak lanjut"
      ).length,
      completed: coachingSessionThreeResults.filter(
        (item) => item.status === "Selesai"
      ).length,
    }),
    []
  )

  const projectAssessmentSummary = useMemo(
    () => ({
      total: projectAssessmentResults.length,
      revision: projectAssessmentResults.filter(
        (item) => item.status === "Perlu revisi"
      ).length,
      ready: projectAssessmentResults.filter(
        (item) => item.status !== "Perlu revisi"
      ).length,
    }),
    []
  )

  const graduationSummary = useMemo(
    () => ({
      total: graduationDecisionResults.length,
      waiting: graduationDecisionResults.filter(
        (item) => item.graduationStatus === "Menunggu"
      ).length,
      recommended: graduationDecisionResults.filter(
        (item) => item.graduationStatus === "Direkomendasikan lulus"
      ).length,
    }),
    []
  )

  const overall = useMemo(() => {
    const total = stages.reduce((sum, stage) => sum + stage.progress, 0)
    return Math.round(total / stages.length)
  }, [stages])

  const nextPriority = useMemo(
    () => stages.find((stage) => stage.status !== "Selesai") ?? null,
    [stages]
  )

  const filteredMentees = useMemo(() => {
    return allClassMentees.filter((mentee) => {
      const byTrack =
        activeTrackFilter === "all" ||
        mentee.track.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-") ===
          activeTrackFilter
      const byName =
        activeNameFilter.trim().length === 0 ||
        mentee.name.toLowerCase().includes(activeNameFilter.toLowerCase())

      return byTrack && byName
    })
  }, [activeNameFilter, activeTrackFilter, allClassMentees])

  const selectedTrackLabel = useMemo(() => {
    if (activeTrackFilter === "pkwt") return "PKWT"
    if (activeTrackFilter === "pro-hire") return "Pro Hire"
    if (activeTrackFilter === "mt-organik") return "MT/Organik"
    return "Semua track"
  }, [activeTrackFilter])

  const mentorTrackingRows = useMemo(
    () =>
      mentorQueue.map((item) => ({
        ...item,
        sessionOne: coachingSessionOneResults.find(
          (result) => result.menteeName === item.name
        ),
        sessionTwo: coachingSessionTwoResults.find(
          (result) => result.menteeName === item.name
        ),
        sessionThree: coachingSessionThreeResults.find(
          (result) => result.menteeName === item.name
        ),
        project: projectAssessmentResults.find(
          (result) => result.menteeName === item.name
        ),
        graduation: graduationDecisionResults.find(
          (result) => result.menteeName === item.name
        ),
      })),
    [mentorQueue]
  )

  const averageProjectScore = useMemo(() => {
    const totalScore = projectAssessmentResults.reduce(
      (sum, item) => sum + item.score,
      0
    )

    return Math.round(totalScore / projectAssessmentResults.length)
  }, [])

  function updateQuery(nextValues: Record<string, string>) {
    const params = new URLSearchParams(searchParams)

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })

    setSearchParams(params)
  }

  function advanceMentorQueue(queueId: string) {
    setMentorQueue((current) =>
      current.map((item) => {
        if (item.id !== queueId) return item

        const nextProgress = Math.min(item.progress + 10, 100)

        return {
          ...item,
          progress: nextProgress,
          stage:
            nextProgress >= 90
              ? "Final review mentor"
              : nextProgress >= 75
                ? "Persiapan evaluasi"
                : item.stage,
          note:
            nextProgress >= 90
              ? "Mentee siap masuk ke tahapan evaluasi berikutnya."
              : "Progress diperbarui mentor untuk monitoring berikutnya.",
        }
      })
    )
  }

  return (
    <FeaturePageLayout
      feature={feature}
      showHero={false}
      showStats={false}
      showSupportPanels={false}
      primaryAction={{
        label: permissions.canManageMentor
          ? "Buka proses mentoring"
          : permissions.canManageExaminer
            ? "Buka management penguji"
            : feature.actionLabel,
        to: permissions.canManageMentor
          ? "/journey-onboarding?section=mentee-list"
          : permissions.canManageExaminer
            ? "/evaluasi-feedback"
            : "/dashboard",
      }}
    >
      {isMentorSection ? (
        activeSection === "mentee-list" ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Ringkasan mentee</h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Total mentee</p>
                  <p className="mt-1 text-xl font-semibold">
                    {mentorQueue.length}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Siap evaluasi</p>
                  <p className="mt-1 text-xl font-semibold">
                    {mentorQueue.filter((item) => item.progress >= 80).length}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    Perlu perhatian
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {
                      mentorTrackingRows.filter(
                        (item) =>
                          item.sessionOne?.status === "Butuh tindak lanjut"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Daftar mentee aktif</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Daftar peserta yang sedang dipantau mentor pada periode
                    onboarding ini.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {mentorQueue.length} mentee
                </span>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Track</th>
                      <th className="px-4 py-3 font-medium">Stage aktif</th>
                      <th className="px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 font-medium">Status coaching</th>
                      <th className="px-4 py-3 font-medium">Catatan mentor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorTrackingRows.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.track}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.stage}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-28">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{item.progress}%</span>
                              <span>
                                {item.progress >= 80
                                  ? "Siap review"
                                  : "Berjalan"}
                              </span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                            {item.sessionOne?.status ?? "Belum coaching"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Aksi cepat</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=progress">
                    Buka progress mentee
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/evaluasi-feedback?section=participants">
                    Lanjut ke nama peserta
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : activeSection === "progress" ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">
                Progress mentee onboarding
              </h2>
              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 font-medium">Stage</th>
                      <th className="px-4 py-3 font-medium">Update sesi 1</th>
                      <th className="px-4 py-3 font-medium">Update sesi 2</th>
                      <th className="px-4 py-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorTrackingRows.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.progress}%
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.stage}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionOne?.followUp ?? "Belum ada"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionTwo?.followUp ?? "Belum ada"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => advanceMentorQueue(item.id)}
                          >
                            Update progres
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Aksi cepat</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=coaching-1">
                    Lanjutkan review mentor
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/class">Kembali ke my class</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : activeSection === "coaching-1" ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">
                    Hasil Coaching Sesi 1
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fokus sesi pertama untuk membaca kesiapan awal, gap
                    pembelajaran, dan follow up awal tiap mentee.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {coachingSessionOneSummary.total} sesi
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Total sesi</p>
                  <p className="mt-1 text-xl font-semibold">
                    {coachingSessionOneSummary.total}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    Butuh tindak lanjut
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {coachingSessionOneSummary.followUp}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Selesai</p>
                  <p className="mt-1 text-xl font-semibold">
                    {coachingSessionOneSummary.completed}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Topik awal</th>
                      <th className="px-4 py-3 font-medium">Hasil coaching</th>
                      <th className="px-4 py-3 font-medium">Gap utama</th>
                      <th className="px-4 py-3 font-medium">Tindak lanjut</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coachingSessionOneResults.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">
                          {item.menteeName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.topic}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.summary}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.status === "Butuh tindak lanjut"
                            ? "Perlu penguatan materi dan coaching tambahan"
                            : item.status === "On track"
                              ? "Masih perlu pemantauan ringan"
                              : "Tidak ada gap mayor"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.followUp}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Aksi lanjutan</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=coaching-2">
                    Lanjut ke coaching sesi 2
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/journey-onboarding?section=progress">
                    Kembali ke progress mentee
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : activeSection === "coaching-2" ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Checkpoint sesi 2</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Selesai</p>
                  <p className="mt-1 text-xl font-semibold">
                    {coachingSessionTwoSummary.completed}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    Masih follow up
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {coachingSessionTwoSummary.followUp}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">
                    Hasil Coaching Sesi 2
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review tindak lanjut dari sesi pertama dan validasi apakah
                    mentee sudah menunjukkan perbaikan.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {coachingSessionTwoSummary.total} sesi
                </span>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Status sesi 1</th>
                      <th className="px-4 py-3 font-medium">
                        Review perbaikan
                      </th>
                      <th className="px-4 py-3 font-medium">Hasil sesi 2</th>
                      <th className="px-4 py-3 font-medium">Follow up baru</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorTrackingRows.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionOne?.status ?? "Belum ada"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionTwo?.topic ?? "Belum review"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionTwo?.summary ?? "Belum ada hasil"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionTwo?.followUp ??
                            "Belum ada tindak lanjut"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                            {item.sessionTwo?.status ?? "Belum coaching"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Aksi lanjutan</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=coaching-3">
                    Lanjut ke coaching sesi 3
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/journey-onboarding?section=coaching-1">
                    Kembali ke coaching sesi 1
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : activeSection === "coaching-3" ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">
                Ringkasan kesiapan final
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Selesai</p>
                  <p className="mt-1 text-xl font-semibold">
                    {coachingSessionThreeSummary.completed}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    Perlu validasi
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {coachingSessionThreeSummary.followUp}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">
                    Hasil Coaching Sesi 3
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sesi final untuk memastikan mentee benar-benar siap masuk
                    penilaian project dan konfirmasi kelulusan.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {coachingSessionThreeSummary.total} sesi
                </span>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Review final</th>
                      <th className="px-4 py-3 font-medium">Follow up akhir</th>
                      <th className="px-4 py-3 font-medium">Siap ke project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorTrackingRows.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionThree?.topic ?? "Belum ada review"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.sessionThree?.followUp ?? "Belum ada"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {item.sessionThree?.status === "Selesai"
                              ? "Siap"
                              : "Perlu validasi"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Aksi lanjutan</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=project">
                    Lanjut ke penilaian project
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/journey-onboarding?section=coaching-2">
                    Kembali ke coaching sesi 2
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : activeSection === "project" ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Ringkasan project</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Total project</p>
                  <p className="mt-1 text-xl font-semibold">
                    {projectAssessmentSummary.total}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Perlu revisi</p>
                  <p className="mt-1 text-xl font-semibold">
                    {projectAssessmentSummary.revision}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Layak lanjut</p>
                  <p className="mt-1 text-xl font-semibold">
                    {projectAssessmentSummary.ready}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Penilaian Project</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Monitoring hasil project per mentee untuk menentukan apakah
                    bisa lanjut ke final confirmation.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  Rata-rata nilai {averageProjectScore}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Nilai</th>
                      <th className="px-4 py-3 font-medium">Catatan mentor</th>
                      <th className="px-4 py-3 font-medium">Rekomendasi</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectAssessmentResults.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">
                          {item.menteeName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.projectTitle}
                        </td>
                        <td className="px-4 py-3 font-medium">{item.score}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.mentorNote}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.recommendation}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Aksi lanjutan</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=graduation">
                    Lanjut ke konfirmasi kelulusan
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/journey-onboarding?section=coaching-3">
                    Kembali ke coaching sesi 3
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : activeSection === "graduation" ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Ringkasan keputusan</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Total mentee</p>
                  <p className="mt-1 text-xl font-semibold">
                    {graduationSummary.total}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Menunggu</p>
                  <p className="mt-1 text-xl font-semibold">
                    {graduationSummary.waiting}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    Direkomendasikan lulus
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {graduationSummary.recommended}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">
                    Konfirmasi Kelulusan
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tahap akhir untuk memantau rekomendasi mentor, status
                    penguji, dan keputusan akhir tiap mentee.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {graduationSummary.recommended} direkomendasikan lulus
                </span>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Nilai akhir</th>
                      <th className="px-4 py-3 font-medium">
                        Rekomendasi mentor
                      </th>
                      <th className="px-4 py-3 font-medium">Status penguji</th>
                      <th className="px-4 py-3 font-medium">Kelulusan</th>
                      <th className="px-4 py-3 font-medium">Tindak lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graduationDecisionResults.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">
                          {item.menteeName}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {item.finalScore}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.mentorRecommendation}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.examinerStatus}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              item.graduationStatus === "Direkomendasikan lulus"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.graduationStatus === "Menunggu"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {item.graduationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.nextAction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Aksi akhir</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/evaluasi-feedback">
                    Sinkronkan ke evaluasi penguji
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/journey-onboarding?section=project">
                    Kembali ke penilaian project
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : null
      ) : permissions.canManageAdmin ? (
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Master peserta onboarding
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monitoring seluruh peserta per class, track, dan tahapan
                  onboarding.
                </p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {filteredMentees.length} peserta
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={activeTrackFilter}
                onChange={(event) => updateQuery({ track: event.target.value })}
              >
                <option value="all">Semua track</option>
                <option value="pkwt">PKWT</option>
                <option value="pro-hire">Pro Hire</option>
                <option value="mt-organik">MT/Organik</option>
              </select>
              <Input
                value={activeNameFilter}
                onChange={(event) => updateQuery({ name: event.target.value })}
                placeholder="Cari nama peserta"
              />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Batch</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMentees.slice(0, 18).map((mentee) => (
                    <tr key={mentee.id} className="border-t align-top">
                      <td className="px-4 py-3 font-medium">{mentee.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mentee.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mentee.className}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mentee.batch}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mentee.stage}
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-28">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{mentee.status}</span>
                            <span>{mentee.progress}%</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${mentee.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" type="button">
                            <PencilLine className="mr-1 size-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" type="button">
                            <Trash2 className="mr-1 size-3.5" /> Arsip
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Ringkasan track</h2>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Filter aktif</p>
                  <p className="mt-1 text-lg font-semibold">
                    {selectedTrackLabel}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Total data</p>
                  <p className="mt-1 text-lg font-semibold">
                    {allClassMentees.length}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    Siap review mentor
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {
                      filteredMentees.filter(
                        (item) => item.status === "Siap review mentor"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Route className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Aksi admin</h2>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/class">Kelola batch onboarding</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/journey-onboarding?section=mentee-list">
                    Buka management mentor
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : permissions.canManageExaminer ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">
            Kesiapan peserta menuju evaluasi
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {mentorQueue.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-background p-4"
              >
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.track} • Progress {item.progress}%
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-4">
            <Link to="/evaluasi-feedback">Buka management penguji</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">
                Timeline onboarding saya
              </h2>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                Progress keseluruhan: {overall}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${overall}%` }}
              />
            </div>

            <div className="mt-6 space-y-2">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </div>
                    {index < stages.length - 1 ? (
                      <div className="mt-2 min-h-6 w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{stage.title}</p>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {stage.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stage.detail}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={stage.nextHref}>{stage.nextLabel}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Prioritas berikutnya</h2>
              </div>

              {nextPriority ? (
                <div className="mt-4 rounded-lg border bg-background p-4 text-sm">
                  <p className="font-medium">{nextPriority.title}</p>
                  <p className="mt-2 text-muted-foreground">
                    {nextPriority.detail}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Deadline: {nextPriority.deadline}
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <Link to={nextPriority.nextHref}>
                      {nextPriority.nextLabel}
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Langkah prioritas</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Ikuti class sesuai track yang ditetapkan admin PSP</li>
                <li>• Selesaikan materi dan test sebelum deadline</li>
                <li>• Unggah tugas dan cek nilai secara berkala</li>
              </ul>
              <Button asChild className="mt-4 w-full">
                <Link to="/dashboard">Kembali ke dashboard peserta</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </FeaturePageLayout>
  )
}

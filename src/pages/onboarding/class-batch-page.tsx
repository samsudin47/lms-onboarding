import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  ImagePlus,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react"

import courseImage from "@/assets/course.jpg"
import courseImage2 from "@/assets/course-2.jpg"
import courseImage3 from "@/assets/course-3.jpg"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  getDemoUserTrack,
  getRolePermissions,
  getStoredDemoUser,
} from "@/lib/demo-access"
import { cn } from "@/lib/utils"

type ClassTrack = "PKWT" | "Pro Hire" | "MT/Organik"

type BatchStatus = "Selesai" | "Sedang Berjalan" | "Belum Dimulai" | "Unpassed"

type BatchRow = {
  id: string
  name: string
  batch: string
  period: string
  size: number
  track: ClassTrack
  audience: string
  mentor: string
  coMentor: string
  mentee: string
  deadline: string
  grading: string
  calendarUrl: string
  headerImage?: string
  status?: BatchStatus
  progress?: number
  shortname?: string
  visible?: "PUBLISH" | "DRAFT"
}

type MenteeRow = {
  id: string
  name: string
  track: ClassTrack
  stage: string
  progress: number
  nextReview: string
  status: string
}

type MentorRole = "Mentor" | "Co-Mentor"

type MentorRecord = {
  id: string
  name: string
  email: string
  role: MentorRole
  track: ClassTrack
  assignedClass: string
}

type MultiSelectOption = {
  value: string
  label: string
}

type GeneratedMenteeRow = {
  id: string
  name: string
  email: string
  track: ClassTrack
  status: string
}

type ReviewTaskStatus = "submitted" | "in-progress" | "missing"

type GeneratedTaskReview = {
  title: string
  submissionStatus: ReviewTaskStatus
  submittedAt: string | null
  fileName: string | null
  summary: string
  note: string
}

type QuestionBuilderStep = 1 | 2 | 3 | 4 | 5

type MultipleChoiceOptionKey = "a" | "b" | "c" | "d" | "e"

type MultipleChoiceDraft = {
  question: string
  options: Record<MultipleChoiceOptionKey, string>
  correctAnswer: "A" | "B" | "C" | "D" | "E"
}

type QuestionBuilderDraft = {
  step: QuestionBuilderStep
  descriptionQuestions: string[]
  multipleChoiceQuestions: MultipleChoiceDraft[]
  essayQuestions: string[]
  pdfFileName: string
  videoFileName: string
  completed: boolean
  lastSavedAt: string | null
}

const questionStepLabels: Record<QuestionBuilderStep, string> = {
  1: "Upload Materi PDF",
  2: "Upload Materi Video",
  3: "Soal Deskripsi",
  4: "Soal Pilihan Ganda",
  5: "Soal Essay",
}

type JourneyStep = {
  title: string
  duration: string
  items: string[]
}

const trackJourneys: Record<
  ClassTrack,
  { description: string; steps: JourneyStep[] }
> = {
  PKWT: {
    description:
      "Stepper PKWT mengikuti usulan alur onboarding: informasi awal, pre-boarding, program induksi, lalu selesai.",
    steps: [
      {
        title: "Informasi Awal",
        duration: "H-1 Minggu",
        items: [
          "Penyambutan dan informasi program onboarding dikirim melalui e-mail kepada peserta.",
        ],
      },
      {
        title: "Pre-Boarding",
        duration: "1 Hari",
        items: [
          "Penyambutan oleh tim SDM.",
          "Proses logistik, ID card, dan akses gedung.",
        ],
      },
      {
        title: "Program Induksi",
        duration: "3 Hari",
        items: [
          "Sambutan perwakilan manajemen dan brief strategic overview.",
          "Materi company profile.",
          "Organisasi dan kebijakan umum perusahaan.",
          "Kebijakan SDM.",
          "Pengenalan unit kerja dan tim.",
          "Diskusi dengan line manager: perkenalan dan ekspektasi.",
        ],
      },
      {
        title: "Selesai",
        duration: "Final",
        items: [
          "Peserta menyelesaikan onboarding awal PKWT dan siap lanjut bekerja.",
        ],
      },
    ],
  },
  "Pro Hire": {
    description:
      "Journey Pro Hire dimulai dari pre-boarding, bela negara, pengenalan perusahaan, lalu ekspektasi tim selama masa adaptasi kerja.",
    steps: [
      {
        title: "Informasi Awal",
        duration: "H-1 Minggu",
        items: [
          "Penyambutan dan informasi program onboarding dikirim melalui e-mail kepada peserta.",
        ],
      },
      {
        title: "Pre-Boarding",
        duration: "1 Hari",
        items: [
          "Penyambutan oleh tim SDM.",
          "Proses logistik, ID card, dan akses gedung.",
        ],
      },
      {
        title: "Program Bela Negara",
        duration: "1 Hari",
        items: ["Materi bela negara dan penguatan kesiapan budaya kerja."],
      },
      {
        title: "Pengenalan Perusahaan",
        duration: "2 Hari",
        items: [
          "Company profile dan strategic overview.",
          "Organisasi dan kebijakan umum perusahaan.",
          "Kebijakan kepegawaian SDM.",
        ],
      },
      {
        title: "Ekspektasi Tim",
        duration: "90 Hari",
        items: [
          "Pengenalan unit kerja dan ekspektasi peran.",
          "Self management, focus target, dan action plan.",
          "Buddy program untuk pengembangan lanjutan.",
        ],
      },
    ],
  },
  "MT/Organik": {
    description:
      "Journey MT/Organik lebih panjang: pre-boarding, bela negara, induksi/in class training, on the job training, hingga probation.",
    steps: [
      {
        title: "Informasi Awal",
        duration: "H-1 Minggu",
        items: [
          "Penyambutan dan informasi program onboarding dikirim melalui e-mail kepada peserta.",
        ],
      },
      {
        title: "Pre-Boarding",
        duration: "1 Hari",
        items: [
          "Penyambutan oleh tim SDM.",
          "Proses logistik, ID card, dan akses gedung.",
        ],
      },
      {
        title: "Program Bela Negara",
        duration: "1 Minggu",
        items: ["Materi bela negara dan pembentukan karakter kerja."],
      },
      {
        title: "Program Induksi / In Class Training",
        duration: "1 Minggu",
        items: [
          "Company profile dan strategic overview.",
          "Organisasi dan kebijakan umum perusahaan.",
          "Kebijakan kepegawaian SDM dan pembekalan teknis.",
        ],
      },
      {
        title: "On The Job Training",
        duration: "9 Bulan",
        items: [
          "Pelaksanaan on the job training dan project assignment.",
          "Program mentorship / buddy program sesuai unit kerja.",
        ],
      },
      {
        title: "Probation",
        duration: "3 Bulan",
        items: ["Pelaksanaan masa probation dan evaluasi kesiapan kerja."],
      },
    ],
  },
}

const initialBatches: BatchRow[] = [
  {
    id: "batch-pkwt-apr",
    name: "PKWT April 2026",
    batch: "Batch 1",
    period: "07 Apr 2026 - 11 Apr 2026",
    size: 25,
    track: "PKWT",
    audience: "User onboarding kontrak batch April",
    mentor: "mentor@peruri.co.id",
    coMentor: "co-mentor@peruri.co.id",
    mentee: "ayu.pratama@peruri.co.id",
    deadline: "11 Apr 2026",
    grading: "70% test • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=PKWT+April+2026",
    status: "Sedang Berjalan",
    progress: 82,
  },
  {
    id: "batch-pkwt-mar",
    name: "PKWT Maret 2026",
    batch: "Batch 2",
    period: "03 Mar 2026 - 07 Mar 2026",
    size: 20,
    track: "PKWT",
    audience: "User onboarding kontrak batch Maret",
    mentor: "mentor@peruri.co.id",
    coMentor: "co-mentor@peruri.co.id",
    mentee: "putri.lestari@peruri.co.id",
    deadline: "07 Mar 2026",
    grading: "70% test • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=PKWT+Maret+2026",
    status: "Selesai",
    progress: 100,
  },
  {
    id: "batch-pkwt-feb",
    name: "PKWT Februari 2026",
    batch: "Batch 3",
    period: "03 Feb 2026 - 07 Feb 2026",
    size: 19,
    track: "PKWT",
    audience: "User onboarding kontrak batch Februari",
    mentor: "mentor@peruri.co.id",
    coMentor: "co-mentor@peruri.co.id",
    mentee: "rahmat.akbar@peruri.co.id",
    deadline: "07 Feb 2026",
    grading: "70% test • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=PKWT+Februari+2026",
    status: "Unpassed",
    progress: 48,
  },
  {
    id: "batch-pkwt-may",
    name: "PKWT Mei 2026",
    batch: "Batch 1",
    period: "05 Mei 2026 - 09 Mei 2026",
    size: 28,
    track: "PKWT",
    audience: "User onboarding kontrak batch Mei",
    mentor: "mentor@peruri.co.id",
    coMentor: "co-mentor@peruri.co.id",
    mentee: "fajar.kusuma@peruri.co.id",
    deadline: "09 Mei 2026",
    grading: "70% test • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=PKWT+Mei+2026",
    status: "Belum Dimulai",
    progress: 0,
  },
  {
    id: "batch-pkwt-jun",
    name: "PKWT Juni 2026",
    batch: "Batch 2",
    period: "09 Jun 2026 - 13 Jun 2026",
    size: 26,
    track: "PKWT",
    audience: "User onboarding kontrak batch Juni",
    mentor: "mentor@peruri.co.id",
    coMentor: "co-mentor@peruri.co.id",
    mentee: "nadia.prameswari@peruri.co.id",
    deadline: "13 Jun 2026",
    grading: "70% test • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=PKWT+Juni+2026",
    status: "Belum Dimulai",
    progress: 0,
  },
  {
    id: "batch-prohire-apr",
    name: "Pro Hire April 2026",
    batch: "Batch 1",
    period: "14 Apr 2026 - 18 Apr 2026",
    size: 18,
    track: "Pro Hire",
    audience: "Karyawan baru level supervisor & specialist",
    mentor: "mentor.prohire@peruri.co.id",
    coMentor: "co-mentor.prohire@peruri.co.id",
    mentee: "raka.saputra@peruri.co.id",
    deadline: "18 Apr 2026",
    grading: "60% post-test • 40% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pro+Hire+April+2026",
    status: "Sedang Berjalan",
    progress: 64,
  },
  {
    id: "batch-prohire-mar",
    name: "Pro Hire Maret 2026",
    batch: "Batch 3",
    period: "10 Mar 2026 - 14 Mar 2026",
    size: 15,
    track: "Pro Hire",
    audience: "Supervisor baru divisi operasional",
    mentor: "mentor.prohire@peruri.co.id",
    coMentor: "co-mentor.prohire@peruri.co.id",
    mentee: "nanda.wijaya@peruri.co.id",
    deadline: "14 Mar 2026",
    grading: "60% post-test • 40% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pro+Hire+Maret+2026",
    status: "Selesai",
    progress: 100,
  },
  {
    id: "batch-prohire-may",
    name: "Pro Hire Mei 2026",
    batch: "Batch 1",
    period: "12 Mei 2026 - 16 Mei 2026",
    size: 16,
    track: "Pro Hire",
    audience: "Karyawan baru spesialis dan strategic hire",
    mentor: "mentor.prohire@peruri.co.id",
    coMentor: "co-mentor.prohire@peruri.co.id",
    mentee: "sinta.permata@peruri.co.id",
    deadline: "16 Mei 2026",
    grading: "60% post-test • 40% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pro+Hire+Mei+2026",
    status: "Belum Dimulai",
    progress: 0,
  },
  {
    id: "batch-prohire-jun",
    name: "Pro Hire Juni 2026",
    batch: "Batch 2",
    period: "09 Jun 2026 - 13 Jun 2026",
    size: 17,
    track: "Pro Hire",
    audience: "Strategic hire dan supervisor batch Juni",
    mentor: "mentor.prohire@peruri.co.id",
    coMentor: "co-mentor.prohire@peruri.co.id",
    mentee: "galih.pratama@peruri.co.id",
    deadline: "13 Jun 2026",
    grading: "60% post-test • 40% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pro+Hire+Juni+2026",
    status: "Belum Dimulai",
    progress: 0,
  },
  {
    id: "batch-mt-may",
    name: "MT/Organik Mei 2026",
    batch: "Batch 1",
    period: "05 Mei 2026 - 16 Mei 2026",
    size: 22,
    track: "MT/Organik",
    audience: "Management trainee & karyawan organik",
    mentor: "mentor.mt@peruri.co.id",
    coMentor: "co-mentor.mt@peruri.co.id",
    mentee: "dina.maharani@peruri.co.id",
    deadline: "16 Mei 2026",
    grading: "50% test • 20% kehadiran • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=MT+Organik+Mei+2026",
    status: "Sedang Berjalan",
    progress: 58,
  },
  {
    id: "batch-mt-apr",
    name: "MT/Organik April 2026",
    batch: "Batch 2",
    period: "08 Apr 2026 - 19 Apr 2026",
    size: 20,
    track: "MT/Organik",
    audience: "Management trainee batch April",
    mentor: "mentor.mt@peruri.co.id",
    coMentor: "co-mentor.mt@peruri.co.id",
    mentee: "rizky.handayani@peruri.co.id",
    deadline: "19 Apr 2026",
    grading: "50% test • 20% kehadiran • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=MT+Organik+April+2026",
    status: "Selesai",
    progress: 100,
  },
  {
    id: "batch-mt-jun",
    name: "MT/Organik Juni 2026",
    batch: "Batch 1",
    period: "02 Jun 2026 - 13 Jun 2026",
    size: 24,
    track: "MT/Organik",
    audience: "Karyawan organik dan management trainee baru",
    mentor: "mentor.mt@peruri.co.id",
    coMentor: "co-mentor.mt@peruri.co.id",
    mentee: "nia.rahma@peruri.co.id",
    deadline: "13 Jun 2026",
    grading: "50% test • 20% kehadiran • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=MT+Organik+Juni+2026",
    status: "Belum Dimulai",
    progress: 0,
  },
  {
    id: "batch-mt-jul",
    name: "MT/Organik Juli 2026",
    batch: "Batch 2",
    period: "07 Jul 2026 - 18 Jul 2026",
    size: 21,
    track: "MT/Organik",
    audience: "Management trainee dan organik batch Juli",
    mentor: "mentor.mt@peruri.co.id",
    coMentor: "co-mentor.mt@peruri.co.id",
    mentee: "bagas.saputra@peruri.co.id",
    deadline: "18 Jul 2026",
    grading: "50% test • 20% kehadiran • 30% tugas",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=MT+Organik+Juli+2026",
    status: "Belum Dimulai",
    progress: 0,
  },
]

const initialMentees: MenteeRow[] = [
  {
    id: "mentee-ayu",
    name: "Ayu Pratama",
    track: "PKWT",
    stage: "Induksi Karyawan",
    progress: 82,
    nextReview: "14 Apr 2026",
    status: "Siap evaluasi",
  },
  {
    id: "mentee-raka",
    name: "Raka Saputra",
    track: "Pro Hire",
    stage: "Organizational Awareness",
    progress: 64,
    nextReview: "16 Apr 2026",
    status: "Perlu coaching",
  },
  {
    id: "mentee-dina",
    name: "Dina Maharani",
    track: "MT/Organik",
    stage: "In Class Training",
    progress: 58,
    nextReview: "18 Apr 2026",
    status: "Monitoring aktif",
  },
]

const initialMentorRecords: MentorRecord[] = [
  {
    id: "mentor-rina",
    name: "Rina Oktavia",
    email: "mentor@peruri.co.id",
    role: "Mentor",
    track: "PKWT",
    assignedClass: "PKWT April 2026 - Batch 1",
  },
  {
    id: "mentor-bima",
    name: "Bima Saputra",
    email: "mentor.prohire@peruri.co.id",
    role: "Mentor",
    track: "Pro Hire",
    assignedClass: "Pro Hire April 2026 - Batch 1",
  },
  {
    id: "mentor-salsa",
    name: "Salsa Maharani",
    email: "mentor.mt@peruri.co.id",
    role: "Mentor",
    track: "MT/Organik",
    assignedClass: "MT/Organik Mei 2026 - Batch 1",
  },
  {
    id: "co-mentor-dian",
    name: "Dian Lestari",
    email: "co-mentor@peruri.co.id",
    role: "Co-Mentor",
    track: "PKWT",
    assignedClass: "PKWT April 2026 - Batch 1",
  },
  {
    id: "co-mentor-roni",
    name: "Roni Prasetyo",
    email: "co-mentor.prohire@peruri.co.id",
    role: "Co-Mentor",
    track: "Pro Hire",
    assignedClass: "Pro Hire April 2026 - Batch 1",
  },
  {
    id: "co-mentor-nia",
    name: "Nia Ramadhani",
    email: "co-mentor.mt@peruri.co.id",
    role: "Co-Mentor",
    track: "MT/Organik",
    assignedClass: "MT/Organik Mei 2026 - Batch 1",
  },
]

function getTrackFromQuery(value: string | null): ClassTrack {
  if (value === "pro-hire") return "Pro Hire"
  if (value === "mt-organik") return "MT/Organik"
  return "PKWT"
}

function toTrackQuery(track: ClassTrack) {
  if (track === "Pro Hire") return "pro-hire"
  if (track === "MT/Organik") return "mt-organik"
  return "pkwt"
}

function parseAssignmentList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function resolveAssignmentNames(value: string, records: MentorRecord[]) {
  return parseAssignmentList(value)
    .map(
      (item) =>
        records.find((record) => record.email === item || record.name === item)
          ?.name ?? item
    )
    .join(", ")
}

function buildBatchMentees(batch: BatchRow): GeneratedMenteeRow[] {
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
  const statusList = [
    "Aktif onboarding",
    "Sedang belajar",
    "Siap review mentor",
  ]

  return Array.from({ length: batch.size }, (_, index) => {
    const fullName = `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`

    return {
      id: `${batch.id}-mentee-${index + 1}`,
      name: fullName,
      email: `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, ".")}.${index + 1}@peruri.co.id`,
      track: batch.track,
      status: statusList[index % statusList.length],
    }
  })
}

function buildGeneratedTaskReview(
  batch: BatchRow,
  mentee: GeneratedMenteeRow
): GeneratedTaskReview {
  const fileSlug = mentee.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  if (mentee.status === "Siap review mentor") {
    return {
      title: `Tugas akhir onboarding ${batch.track}`,
      submissionStatus: "submitted",
      submittedAt: "10 Apr 2026 • 09:30 WIB",
      fileName: `${fileSlug}-tugas-onboarding.pdf`,
      summary:
        "Onboard telah menyusun ringkasan materi onboarding, nilai budaya kerja, dan rencana implementasi 30 hari pertama.",
      note: "Tugas sudah dikumpulkan dan siap dinilai oleh mentor/admin PSP.",
    }
  }

  if (mentee.status === "Sedang belajar") {
    return {
      title: `Progress tugas onboarding ${batch.track}`,
      submissionStatus: "in-progress",
      submittedAt: null,
      fileName: null,
      summary:
        "Onboard masih menyelesaikan materi dan baru mengisi sebagian tugas pada LMS.",
      note: "Tugas belum selesai. Belum dapat dinilai karena file final belum dikumpulkan.",
    }
  }

  return {
    title: `Tugas onboarding ${batch.track}`,
    submissionStatus: "missing",
    submittedAt: null,
    fileName: null,
    summary:
      "Belum ada dokumen tugas yang diunggah oleh onboard pada batch ini.",
    note: "Belum ada tugas yang dikumpulkan. Silakan tunggu onboard menyelesaikan assignment terlebih dahulu.",
  }
}

function createEmptyMultipleChoiceQuestion(): MultipleChoiceDraft {
  return {
    question: "",
    options: {
      a: "",
      b: "",
      c: "",
      d: "",
      e: "",
    },
    correctAnswer: "A",
  }
}

function createEmptyQuestionDraft(): QuestionBuilderDraft {
  return {
    step: 1,
    descriptionQuestions: Array.from({ length: 10 }, () => ""),
    multipleChoiceQuestions: Array.from({ length: 15 }, () =>
      createEmptyMultipleChoiceQuestion()
    ),
    essayQuestions: Array.from({ length: 10 }, () => ""),
    pdfFileName: "",
    videoFileName: "",
    completed: false,
    lastSavedAt: null,
  }
}

function isQuestionStepComplete(
  step: QuestionBuilderStep,
  draft: QuestionBuilderDraft
) {
  switch (step) {
    case 1:
      return draft.pdfFileName.trim().length > 0
    case 2:
      return draft.videoFileName.trim().length > 0
    case 3:
      return draft.descriptionQuestions.every(
        (question) => question.trim().length > 0
      )
    case 4:
      return draft.multipleChoiceQuestions.every(
        (question) =>
          question.question.trim().length > 0 &&
          Object.values(question.options).every(
            (option) => option.trim().length > 0
          ) &&
          Boolean(question.correctAnswer)
      )
    case 5:
      return draft.essayQuestions.every(
        (question) => question.trim().length > 0
      )
    default:
      return false
  }
}

function getAvailableQuestionStep(
  draft: QuestionBuilderDraft
): QuestionBuilderStep {
  if (!isQuestionStepComplete(1, draft)) return 1
  if (!isQuestionStepComplete(2, draft)) return 2
  if (!isQuestionStepComplete(3, draft)) return 3
  if (!isQuestionStepComplete(4, draft)) return 4
  return 5
}

function getQuestionStepValidationMessage(step: QuestionBuilderStep) {
  switch (step) {
    case 1:
      return "Upload materi PDF terlebih dahulu untuk membuka step 2."
    case 2:
      return "Upload materi video terlebih dahulu untuk membuka step 3."
    case 3:
      return "Lengkapi 10 soal deskripsi terlebih dahulu untuk membuka step 4."
    case 4:
      return "Lengkapi 15 soal pilihan ganda beserta opsi jawaban A-E terlebih dahulu untuk membuka step 5."
    case 5:
      return "Lengkapi 10 soal essay terlebih dahulu sebelum menyelesaikan penyusunan soal."
    default:
      return "Lengkapi step sebelumnya terlebih dahulu."
  }
}

function getCompletedQuestionStepCount(draft: QuestionBuilderDraft) {
  return ([1, 2, 3, 4, 5] as QuestionBuilderStep[]).filter((step) =>
    isQuestionStepComplete(step, draft)
  ).length
}

function normalizeQuestionDraft(
  parsedDraft?: Partial<QuestionBuilderDraft> | null
): QuestionBuilderDraft {
  const emptyDraft = createEmptyQuestionDraft()

  return {
    ...emptyDraft,
    ...parsedDraft,
    descriptionQuestions: Array.isArray(parsedDraft?.descriptionQuestions)
      ? emptyDraft.descriptionQuestions.map(
          (_, index) => parsedDraft.descriptionQuestions?.[index] ?? ""
        )
      : emptyDraft.descriptionQuestions,
    multipleChoiceQuestions: Array.isArray(parsedDraft?.multipleChoiceQuestions)
      ? emptyDraft.multipleChoiceQuestions.map((item, index) => {
          const savedQuestion = parsedDraft.multipleChoiceQuestions?.[index]

          if (typeof savedQuestion === "string") {
            return {
              ...item,
              question: savedQuestion,
            }
          }

          return {
            ...item,
            question:
              typeof savedQuestion?.question === "string"
                ? savedQuestion.question
                : item.question,
            options: {
              a: savedQuestion?.options?.a ?? item.options.a,
              b: savedQuestion?.options?.b ?? item.options.b,
              c: savedQuestion?.options?.c ?? item.options.c,
              d: savedQuestion?.options?.d ?? item.options.d,
              e: savedQuestion?.options?.e ?? item.options.e,
            },
            correctAnswer: savedQuestion?.correctAnswer ?? item.correctAnswer,
          }
        })
      : emptyDraft.multipleChoiceQuestions,
    essayQuestions: Array.isArray(parsedDraft?.essayQuestions)
      ? emptyDraft.essayQuestions.map(
          (_, index) => parsedDraft.essayQuestions?.[index] ?? ""
        )
      : emptyDraft.essayQuestions,
  }
}

function getQuestionDraftKey(batchId: string) {
  return `class-question-builder-${batchId}`
}

const courseCoverImages = [courseImage, courseImage2, courseImage3] as const
const catalogTrackOrder: ClassTrack[] = ["MT/Organik", "PKWT", "Pro Hire"]
const otherTrainingCards = [
  {
    id: "other-sales-excellence",
    label: "OTHER",
    name: "Sales Excellence",
    batch: "Batch 1",
    audience: "Pelatihan komunikasi dan strategi penjualan untuk karyawan.",
    period: "16 Jun 2026 - 18 Jun 2026",
    size: 30,
    status: "Sedang Berjalan" as BatchStatus,
    progress: 45,
  },
  {
    id: "other-business-development",
    label: "OTHER",
    name: "Business Development",
    batch: "Batch 2",
    audience: "Program pengembangan usaha dan peluang bisnis baru.",
    period: "22 Jul 2026 - 24 Jul 2026",
    size: 24,
    status: "Belum Dimulai" as BatchStatus,
    progress: 0,
  },
  {
    id: "other-service-quality",
    label: "OTHER",
    name: "Service Quality",
    batch: "Batch 1",
    audience: "Peningkatan kualitas layanan dan pengalaman pelanggan.",
    period: "03 Mei 2026 - 05 Mei 2026",
    size: 20,
    status: "Selesai" as BatchStatus,
    progress: 100,
  },
]

function MultiSelectField({
  id,
  label,
  options,
  value,
  onChange,
  emptyText,
}: {
  id: string
  label: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  emptyText: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const allSelected = options.length > 0 && value.length === options.length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function toggleOption(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue))
      return
    }

    onChange([...value, optionValue])
  }

  function toggleAll() {
    if (allSelected) {
      onChange([])
      return
    }

    onChange(options.map((option) => option.value))
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-2 flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm"
      >
        <span className={cn(!value.length && "text-muted-foreground")}>
          {value.length ? `${value.length} item dipilih` : emptyText}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border bg-background shadow-lg">
          <button
            type="button"
            onClick={toggleAll}
            className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm hover:bg-muted/50"
          >
            <Check
              className={cn(
                "size-4",
                allSelected ? "opacity-100" : "opacity-0"
              )}
            />
            <span>Pilih Semua</span>
          </button>

          {options.length ? (
            options.map((option) => {
              const checked = value.includes(option.value)

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <Check
                    className={cn(
                      "size-4",
                      checked ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{option.label}</span>
                </button>
              )
            })
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Belum ada data tersedia.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default function ClassBatchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const assignedTrackQuery = getDemoUserTrack(currentUser)
  const activeTrack = getTrackFromQuery(
    permissions.key === "participant" && assignedTrackQuery
      ? assignedTrackQuery
      : searchParams.get("track")
  )
  const requestedSection = searchParams.get("section")
  const activeSection =
    permissions.key === "participant"
      ? requestedSection === "catalog" ||
        requestedSection === "catalog-detail" ||
        requestedSection === "other-training" ||
        requestedSection === "journey-detail"
        ? requestedSection
        : "overview"
      : (requestedSection ?? "overview")
  const activeBatchId = searchParams.get("batch") ?? ""
  const activeJourneyId = searchParams.get("journey") ?? ""
  const activeJourneyStepParam = Math.max(
    1,
    Number.parseInt(searchParams.get("step") ?? "1", 10) || 1
  )
  const activeMenteeId = searchParams.get("mentee") ?? ""
  const activePage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1
  )
  const isDataMentorPage =
    activeSection === "mentor" || activeSection === "co-mentor"
  const activeMentorRole: MentorRole =
    activeSection === "co-mentor" ? "Co-Mentor" : "Mentor"

  useEffect(() => {
    if (permissions.key !== "participant" || !assignedTrackQuery) return

    const nextParams = new URLSearchParams(searchParams)
    let hasChanges = false

    if (nextParams.get("track") !== assignedTrackQuery) {
      nextParams.set("track", assignedTrackQuery)
      hasChanges = true
    }

    const allowedSection =
      nextParams.get("section") === "catalog" ||
      nextParams.get("section") === "catalog-detail" ||
      nextParams.get("section") === "other-training" ||
      nextParams.get("section") === "journey-detail"
        ? nextParams.get("section")!
        : "overview"

    if (nextParams.get("section") !== allowedSection) {
      nextParams.set("section", allowedSection)
      hasChanges = true
    }

    for (const key of ["batch", "mentee", "page"]) {
      if (nextParams.has(key)) {
        nextParams.delete(key)
        hasChanges = true
      }
    }

    if (hasChanges) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [assignedTrackQuery, permissions.key, searchParams, setSearchParams])

  const [batches, setBatches] = useState<BatchRow[]>(initialBatches)
  const [mentees, setMentees] = useState<MenteeRow[]>(initialMentees)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [name, setName] = useState("")
  const [batchLabel, setBatchLabel] = useState("")
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [size, setSize] = useState("20")
  const [audience, setAudience] = useState("")
  const [selectedMentors, setSelectedMentors] = useState<string[]>([])
  const [selectedCoMentors, setSelectedCoMentors] = useState<string[]>([])
  const [deadline, setDeadline] = useState("")
  const [grading, setGrading] = useState("")
  const [headerImageFileName, setHeaderImageFileName] = useState("")
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(
    null
  )
  const [mentorRecords, setMentorRecords] =
    useState<MentorRecord[]>(initialMentorRecords)
  const [showMentorForm, setShowMentorForm] = useState(false)
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null)
  const [mentorFormName, setMentorFormName] = useState("")
  const [mentorFormEmail, setMentorFormEmail] = useState("")
  const [questionDraft, setQuestionDraft] = useState<QuestionBuilderDraft>(
    createEmptyQuestionDraft()
  )
  const [questionDraftReady, setQuestionDraftReady] = useState(false)
  const [savedTaskReviews, setSavedTaskReviews] = useState<
    Record<string, { score: string; notes: string; savedAt: string }>
  >({})
  const [reviewDrafts, setReviewDrafts] = useState<
    Record<string, { score: string; notes: string }>
  >({})
  const [classSearch, setClassSearch] = useState("")
  const [classTrackFilter, setClassTrackFilter] = useState<
    "all" | "PKWT" | "Pro Hire" | "MT/Organik" | "Other Pelatihan"
  >("all")
  const [showJourneyCompletionNotice, setShowJourneyCompletionNotice] =
    useState(false)
  const [evalRatings, setEvalRatings] = useState<Record<string, number>>({})
  const [evalComments, setEvalComments] = useState<Record<string, string>>({})
  const [evalSubmitted, setEvalSubmitted] = useState<Record<string, boolean>>(
    {}
  )
  const [batchSearch, setBatchSearch] = useState("")
  const [batchShowEntries, setBatchShowEntries] = useState(20)
  const [formShortname, setFormShortname] = useState("")
  const [formVisible, setFormVisible] = useState<"PUBLISH" | "DRAFT">("PUBLISH")
  const [formKategoriTrack, setFormKategoriTrack] = useState<ClassTrack | "">(
    ""
  )

  const filteredBatches = useMemo(
    () => batches.filter((batch) => batch.track === activeTrack),
    [activeTrack, batches]
  )
  const filteredMentees = useMemo(
    () => mentees.filter((mentee) => mentee.track === activeTrack),
    [activeTrack, mentees]
  )
  const batchCoverImages = useMemo(
    () =>
      new Map(
        filteredBatches.map((batch, index) => [
          batch.id,
          courseCoverImages[index % courseCoverImages.length],
        ])
      ),
    [filteredBatches]
  )
  const classCatalogSections = useMemo(() => {
    const keyword = classSearch.trim().toLowerCase()
    const visibleTracks =
      permissions.key === "participant" && assignedTrackQuery
        ? [getTrackFromQuery(assignedTrackQuery)]
        : classTrackFilter === "all"
          ? catalogTrackOrder
          : classTrackFilter === "Other Pelatihan"
            ? []
            : [classTrackFilter]

    return visibleTracks
      .map((track) => ({
        track,
        items: batches.filter((batch) => {
          if (batch.track !== track) return false
          if (!keyword) return true

          return [batch.name, batch.batch, batch.audience, batch.period]
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [
    assignedTrackQuery,
    batches,
    classSearch,
    classTrackFilter,
    permissions.key,
  ])
  const filteredOtherTrainingCards = useMemo(() => {
    const keyword = classSearch.trim().toLowerCase()

    if (
      permissions.key === "participant" ||
      !["all", "Other Pelatihan"].includes(classTrackFilter)
    ) {
      return []
    }

    return otherTrainingCards.filter((item) => {
      if (!keyword) return true

      return [item.name, item.batch, item.audience, item.period]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    })
  }, [classSearch, classTrackFilter, permissions.key])
  const selectedCatalogBatches = useMemo(() => {
    const keyword = classSearch.trim().toLowerCase()

    return batches.filter((batch) => {
      if (batch.track !== activeTrack) return false
      if (!keyword) return true

      return [batch.name, batch.batch, batch.audience, batch.period]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    })
  }, [activeTrack, batches, classSearch])
  const selectedCatalogCoverImages = useMemo(
    () =>
      new Map(
        selectedCatalogBatches.map((batch, index) => [
          batch.id,
          courseCoverImages[index % courseCoverImages.length],
        ])
      ),
    [selectedCatalogBatches]
  )
  const filteredMentorRecords = useMemo(
    () => mentorRecords.filter((record) => record.role === activeMentorRole),
    [activeMentorRole, mentorRecords]
  )
  const availableMentors = useMemo(
    () =>
      mentorRecords
        .filter((record) => record.role === "Mentor")
        .map((record) => ({
          value: record.email,
          label: record.name,
        })),
    [mentorRecords]
  )
  const availableCoMentors = useMemo(
    () =>
      mentorRecords
        .filter((record) => record.role === "Co-Mentor")
        .map((record) => ({
          value: record.email,
          label: record.name,
        })),
    [mentorRecords]
  )

  function changeTrack(track: ClassTrack) {
    setSearchParams({ track: toTrackQuery(track) }, { replace: true })
  }

  function closeJourneyDrawer() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete("journey")
    setSearchParams(nextParams, { replace: true })
  }

  function handleFinishJourneyTest() {
    setShowJourneyCompletionNotice(true)
  }

  function openCreateForm() {
    setEditingId(null)
    setShowBatchForm(true)
    setName("")
    setBatchLabel("")
    setPeriodStart("")
    setPeriodEnd("")
    setSize("")
    setAudience("")
    setSelectedMentors([])
    setSelectedCoMentors([])
    setDeadline("")
    setGrading("")
    setHeaderImageFileName("")
    setHeaderImagePreview(null)
    setFormShortname("")
    setFormVisible("PUBLISH")
    setFormKategoriTrack("")
  }

  function resetForm() {
    setEditingId(null)
    setShowBatchForm(false)
    setName("")
    setBatchLabel("")
    setPeriodStart("")
    setPeriodEnd("")
    setSize("")
    setAudience("")
    setSelectedMentors([])
    setSelectedCoMentors([])
    setDeadline("")
    setGrading("")
    setHeaderImageFileName("")
    setHeaderImagePreview(null)
    setFormShortname("")
    setFormVisible("PUBLISH")
    setFormKategoriTrack("")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !periodStart || !periodEnd) return

    const nextBatch: BatchRow = {
      id: editingId ?? `batch-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      batch: batchLabel.trim() || "Batch 1",
      period: `${periodStart} s/d ${periodEnd}`,
      size: Math.max(1, Number.parseInt(size, 10) || 20),
      track: (formKategoriTrack || activeTrack) as ClassTrack,
      audience: audience.trim() || "Peserta onboarding sesuai kebutuhan",
      mentor: selectedMentors.join(", "),
      coMentor: selectedCoMentors.join(", "),
      mentee: "",
      deadline: deadline || periodEnd,
      grading: grading.trim() || "70% test • 30% tugas",
      calendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name.trim())}`,
      headerImage: headerImagePreview ?? undefined,
      shortname: formShortname.trim() || undefined,
      visible: formVisible,
    }

    setBatches((prev) => {
      if (editingId) {
        return prev.map((batch) => (batch.id === editingId ? nextBatch : batch))
      }

      return [...prev, nextBatch]
    })

    resetForm()
  }

  function startEdit(batch: BatchRow) {
    setEditingId(batch.id)
    setShowBatchForm(true)
    changeTrack(batch.track)
    setName(batch.name)
    setBatchLabel(batch.batch)
    setAudience(batch.audience)
    setSelectedMentors(parseAssignmentList(batch.mentor))
    setSelectedCoMentors(parseAssignmentList(batch.coMentor))
    setDeadline(batch.deadline)
    setGrading(batch.grading)
    setSize(String(batch.size))
    setPeriodStart("")
    setPeriodEnd("")
    setHeaderImageFileName(batch.headerImage ? "(gambar tersimpan)" : "")
    setHeaderImagePreview(batch.headerImage ?? null)
    setFormShortname(batch.shortname ?? "")
    setFormVisible(batch.visible ?? "PUBLISH")
    setFormKategoriTrack(batch.track)
  }

  function deleteBatch(id: string) {
    setBatches((prev) => prev.filter((batch) => batch.id !== id))
    if (editingId === id) resetForm()
  }

  function openMentorForm() {
    setEditingMentorId(null)
    setShowMentorForm(true)
    setMentorFormName("")
    setMentorFormEmail("")
  }

  function resetMentorForm() {
    setEditingMentorId(null)
    setShowMentorForm(false)
    setMentorFormName("")
    setMentorFormEmail("")
  }

  function handleMentorSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!mentorFormName.trim() || !mentorFormEmail.trim()) return

    const nextRecord: MentorRecord = {
      id: editingMentorId ?? `mentor-${crypto.randomUUID().slice(0, 8)}`,
      name: mentorFormName.trim(),
      email: mentorFormEmail.trim(),
      role: activeMentorRole,
      track: activeTrack,
      assignedClass: `${activeTrack} 2026 - Batch 1`,
    }

    setMentorRecords((prev) => {
      if (editingMentorId) {
        return prev.map((record) =>
          record.id === editingMentorId ? nextRecord : record
        )
      }

      return [...prev, nextRecord]
    })

    resetMentorForm()
  }

  function startEditMentor(record: MentorRecord) {
    setEditingMentorId(record.id)
    setShowMentorForm(true)
    setMentorFormName(record.name)
    setMentorFormEmail(record.email)
  }

  function deleteMentorRecord(id: string) {
    setMentorRecords((prev) => prev.filter((record) => record.id !== id))
    if (editingMentorId === id) resetMentorForm()
  }

  function updateDescriptionQuestion(index: number, value: string) {
    setQuestionDraft((prev) => ({
      ...prev,
      descriptionQuestions: prev.descriptionQuestions.map(
        (question, itemIndex) => (itemIndex === index ? value : question)
      ),
      lastSavedAt: new Date().toISOString(),
    }))
  }

  function updateMultipleChoiceQuestion(
    index: number,
    field: "question" | "correctAnswer" | MultipleChoiceOptionKey,
    value: string
  ) {
    setQuestionDraft((prev) => ({
      ...prev,
      multipleChoiceQuestions: prev.multipleChoiceQuestions.map(
        (question, itemIndex) => {
          if (itemIndex !== index) return question

          if (field === "question") {
            return { ...question, question: value }
          }

          if (field === "correctAnswer") {
            return {
              ...question,
              correctAnswer: value as MultipleChoiceDraft["correctAnswer"],
            }
          }

          return {
            ...question,
            options: {
              ...question.options,
              [field]: value,
            },
          }
        }
      ),
      lastSavedAt: new Date().toISOString(),
    }))
  }

  function updateEssayQuestion(index: number, value: string) {
    setQuestionDraft((prev) => ({
      ...prev,
      essayQuestions: prev.essayQuestions.map((question, itemIndex) =>
        itemIndex === index ? value : question
      ),
      lastSavedAt: new Date().toISOString(),
    }))
  }

  function updateQuestionFile(
    field: "pdfFileName" | "videoFileName",
    fileName: string
  ) {
    setQuestionDraft((prev) => ({
      ...prev,
      [field]: fileName,
      lastSavedAt: new Date().toISOString(),
    }))
  }

  function moveToQuestionStep(step: QuestionBuilderStep) {
    const highestAccessibleStep = getAvailableQuestionStep(questionDraft)

    if (step > highestAccessibleStep) {
      window.alert(getQuestionStepValidationMessage(highestAccessibleStep))
      return
    }

    setQuestionDraft((prev) => ({
      ...prev,
      step,
      lastSavedAt: new Date().toISOString(),
    }))
  }

  function handleBackToQuestionSummary() {
    if (!selectedBatch) return

    if (!questionDraft.completed) {
      const shouldSave = window.confirm(
        "Progress belum selesai. Simpan perubahan lalu kembali ke summary?"
      )

      if (!shouldSave) return
    }

    const nextDraft = {
      ...questionDraft,
      lastSavedAt: new Date().toISOString(),
    }

    setQuestionDraft(nextDraft)

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        getQuestionDraftKey(selectedBatch.id),
        JSON.stringify(nextDraft)
      )
    }

    setSearchParams(
      {
        track: toTrackQuery(selectedBatch.track),
        section: "batch-setting",
        batch: selectedBatch.id,
      },
      { replace: true }
    )
  }

  function handleFinishQuestionBuilder() {
    if (!selectedBatch) return

    const nextDraft = {
      ...questionDraft,
      step: 5 as QuestionBuilderStep,
      completed: true,
      lastSavedAt: new Date().toISOString(),
    }

    setQuestionDraft(nextDraft)

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        getQuestionDraftKey(selectedBatch.id),
        JSON.stringify(nextDraft)
      )
    }

    setSearchParams(
      {
        track: toTrackQuery(selectedBatch.track),
        section: "batch-setting",
        batch: selectedBatch.id,
      },
      { replace: true }
    )
  }

  function updateReviewDraft(field: "score" | "notes", value: string) {
    if (!activeMenteeId) return

    setReviewDrafts((prev) => {
      const currentDraft = prev[activeMenteeId] ?? { score: "", notes: "" }

      return {
        ...prev,
        [activeMenteeId]: {
          ...currentDraft,
          [field]: value,
        },
      }
    })
  }

  function handleSaveTaskReview(event: React.FormEvent) {
    event.preventDefault()

    if (!activeMenteeId) return

    const currentDraft = reviewDrafts[activeMenteeId] ?? {
      score: savedTaskReviews[activeMenteeId]?.score ?? "",
      notes: savedTaskReviews[activeMenteeId]?.notes ?? "",
    }
    const numericScore = Number(currentDraft.score)

    if (
      currentDraft.score.trim().length === 0 ||
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      window.alert("Masukkan nilai tugas antara 0 sampai 100.")
      return
    }

    const savedAt = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })

    setSavedTaskReviews((prev) => ({
      ...prev,
      [activeMenteeId]: {
        score: String(numericScore),
        notes: currentDraft.notes.trim(),
        savedAt,
      },
    }))

    window.alert("Penilaian tugas berhasil disimpan.")
  }

  function advanceMentee(id: string) {
    setMentees((prev) =>
      prev.map((mentee) => {
        if (mentee.id !== id) return mentee

        const nextProgress = Math.min(mentee.progress + 10, 100)
        return {
          ...mentee,
          progress: nextProgress,
          status: nextProgress >= 80 ? "Siap evaluasi" : "Monitoring aktif",
        }
      })
    )
  }

  function markReady(id: string) {
    setMentees((prev) =>
      prev.map((mentee) =>
        mentee.id === id
          ? {
              ...mentee,
              progress: Math.max(mentee.progress, 85),
              status: "Siap evaluasi",
            }
          : mentee
      )
    )
  }

  const featuredBatch = filteredBatches[0]
  const activeJourney = trackJourneys[activeTrack]
  const groupedOverviewBatches = useMemo(
    () =>
      (
        [
          "Selesai",
          "Sedang Berjalan",
          "Belum Dimulai",
          "Unpassed",
        ] as BatchStatus[]
      )
        .map((status) => ({
          status,
          items: filteredBatches.filter(
            (batch) => (batch.status ?? "Belum Dimulai") === status
          ),
        }))
        .filter((group) => group.items.length > 0),
    [filteredBatches]
  )
  const selectedBatch = batches.find((batch) => batch.id === activeBatchId)
  const selectedJourneyBatch = batches.find(
    (batch) => batch.id === activeJourneyId
  )
  const selectedJourney =
    trackJourneys[selectedJourneyBatch?.track ?? activeTrack]
  const activeJourneyStep = Math.min(
    activeJourneyStepParam,
    selectedJourney.steps.length
  )
  const selectedJourneyStep = selectedJourney.steps[activeJourneyStep - 1]
  const selectedJourneyCoverImage = selectedJourneyBatch
    ? (selectedCatalogCoverImages.get(selectedJourneyBatch.id) ?? courseImage)
    : courseImage
  const questionProgressDraft = useMemo(() => {
    if (!selectedBatch) {
      return createEmptyQuestionDraft()
    }

    if (activeSection === "question-builder") {
      return questionDraft
    }

    if (typeof window === "undefined") {
      return createEmptyQuestionDraft()
    }

    const savedDraft = window.localStorage.getItem(
      getQuestionDraftKey(selectedBatch.id)
    )

    if (!savedDraft) {
      return createEmptyQuestionDraft()
    }

    try {
      return normalizeQuestionDraft(
        JSON.parse(savedDraft) as Partial<QuestionBuilderDraft>
      )
    } catch {
      return createEmptyQuestionDraft()
    }
  }, [activeSection, questionDraft, selectedBatch])
  const completedQuestionSteps = getCompletedQuestionStepCount(
    questionProgressDraft
  )
  const currentQuestionProgressStep = getAvailableQuestionStep(
    questionProgressDraft
  )
  const questionProgressPercent = Math.round((completedQuestionSteps / 5) * 100)
  const questionProgressBadge = questionProgressDraft.completed
    ? "Selesai"
    : completedQuestionSteps === 0
      ? "Belum dimulai"
      : completedQuestionSteps === 5
        ? "Siap finish"
        : `Step ${currentQuestionProgressStep} aktif`
  const questionProgressDescription = questionProgressDraft.completed
    ? "Semua materi dan soal sudah lengkap untuk class ini."
    : completedQuestionSteps === 0
      ? "Belum ada materi atau soal yang diisi untuk class ini."
      : completedQuestionSteps === 5
        ? "Semua step sudah diisi, tinggal klik submit & finish pada halaman Buat Soal."
        : `Progress saat ini berada di ${questionStepLabels[currentQuestionProgressStep]}.`
  const batchMenteeRows = useMemo(
    () => (selectedBatch ? buildBatchMentees(selectedBatch) : []),
    [selectedBatch]
  )
  const totalMenteePages = Math.max(1, Math.ceil(batchMenteeRows.length / 50))
  const currentMenteePage = Math.min(activePage, totalMenteePages)
  const paginatedBatchMentees = batchMenteeRows.slice(
    (currentMenteePage - 1) * 50,
    currentMenteePage * 50
  )
  const selectedReviewMentee = batchMenteeRows.find(
    (mentee) => mentee.id === activeMenteeId
  )
  const selectedTaskReview =
    selectedBatch && selectedReviewMentee
      ? buildGeneratedTaskReview(selectedBatch, selectedReviewMentee)
      : null
  const savedSelectedTaskReview = activeMenteeId
    ? savedTaskReviews[activeMenteeId]
    : null
  const currentReviewDraft = activeMenteeId
    ? (reviewDrafts[activeMenteeId] ?? {
        score: savedSelectedTaskReview?.score ?? "",
        notes: savedSelectedTaskReview?.notes ?? "",
      })
    : { score: "", notes: "" }

  useEffect(() => {
    if (
      activeSection !== "question-builder" ||
      !selectedBatch ||
      typeof window === "undefined"
    ) {
      return
    }

    const emptyDraft = createEmptyQuestionDraft()
    const savedDraft = window.localStorage.getItem(
      getQuestionDraftKey(selectedBatch.id)
    )

    const timeoutId = window.setTimeout(() => {
      if (!savedDraft) {
        setQuestionDraft(emptyDraft)
        setQuestionDraftReady(true)
        return
      }

      try {
        const parsedDraft = JSON.parse(
          savedDraft
        ) as Partial<QuestionBuilderDraft>

        setQuestionDraft({
          ...emptyDraft,
          ...parsedDraft,
          descriptionQuestions: Array.isArray(parsedDraft.descriptionQuestions)
            ? emptyDraft.descriptionQuestions.map(
                (_, index) => parsedDraft.descriptionQuestions?.[index] ?? ""
              )
            : emptyDraft.descriptionQuestions,
          multipleChoiceQuestions: Array.isArray(
            parsedDraft.multipleChoiceQuestions
          )
            ? emptyDraft.multipleChoiceQuestions.map((item, index) => {
                const savedQuestion =
                  parsedDraft.multipleChoiceQuestions?.[index]

                if (typeof savedQuestion === "string") {
                  return {
                    ...item,
                    question: savedQuestion,
                  }
                }

                return {
                  ...item,
                  question:
                    typeof savedQuestion?.question === "string"
                      ? savedQuestion.question
                      : item.question,
                  options: {
                    a: savedQuestion?.options?.a ?? item.options.a,
                    b: savedQuestion?.options?.b ?? item.options.b,
                    c: savedQuestion?.options?.c ?? item.options.c,
                    d: savedQuestion?.options?.d ?? item.options.d,
                    e: savedQuestion?.options?.e ?? item.options.e,
                  },
                  correctAnswer:
                    savedQuestion?.correctAnswer ?? item.correctAnswer,
                }
              })
            : emptyDraft.multipleChoiceQuestions,
          essayQuestions: Array.isArray(parsedDraft.essayQuestions)
            ? emptyDraft.essayQuestions.map(
                (_, index) => parsedDraft.essayQuestions?.[index] ?? ""
              )
            : emptyDraft.essayQuestions,
        })
      } catch {
        setQuestionDraft(emptyDraft)
      }

      setQuestionDraftReady(true)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeSection, selectedBatch])

  useEffect(() => {
    if (
      activeSection !== "question-builder" ||
      !selectedBatch ||
      !questionDraftReady ||
      typeof window === "undefined"
    ) {
      return
    }

    window.localStorage.setItem(
      getQuestionDraftKey(selectedBatch.id),
      JSON.stringify(questionDraft)
    )
  }, [activeSection, questionDraft, questionDraftReady, selectedBatch])

  useEffect(() => {
    if (
      activeSection !== "question-builder" ||
      !selectedBatch ||
      questionDraft.completed
    ) {
      return
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [activeSection, questionDraft.completed, selectedBatch])

  if (permissions.canManageClass && isDataMentorPage) {
    return (
      <div className="space-y-5">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                Data Mentor
              </p>
              <h2 className="mt-1 text-base font-semibold">
                Kelola Mentor & Co-Mentor
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Admin PSP dapat menambah, mengubah, dan menghapus data mentor
                maupun co-mentor dari halaman ini.
              </p>
            </div>
          </div>

          <div className="mt-4 flex w-fit gap-1 rounded-xl border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() =>
                setSearchParams({ section: "mentor" }, { replace: true })
              }
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                activeMentorRole === "Mentor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mentor
            </button>
            <button
              type="button"
              onClick={() =>
                setSearchParams({ section: "co-mentor" }, { replace: true })
              }
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                activeMentorRole === "Co-Mentor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Co-Mentor
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">
                  List {activeMentorRole}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kelola data dan assignment {activeMentorRole.toLowerCase()} di
                  halaman ini.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {filteredMentorRecords.length} data
                </span>
                <Button type="button" size="sm" onClick={openMentorForm}>
                  Tambah {activeMentorRole}
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMentorRecords.length ? (
                    filteredMentorRecords.map((record) => (
                      <tr key={record.id} className="border-t align-top">
                        <td className="px-4 py-3 font-medium">{record.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {record.email}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEditMentor(record)}
                            >
                              <PencilLine className="size-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMentorRecord(record.id)}
                            >
                              <Trash2 className="size-4" />
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-sm text-muted-foreground"
                      >
                        Belum ada data {activeMentorRole.toLowerCase()}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showMentorForm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
              <div className="w-full max-w-xl rounded-2xl border bg-background shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      <h2 className="text-lg font-semibold">
                        {editingMentorId
                          ? `Edit ${activeMentorRole}`
                          : `Tambah ${activeMentorRole}`}
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Lengkapi data {activeMentorRole.toLowerCase()} yang akan
                      dikelola.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={resetMentorForm}
                    className="shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <form
                  onSubmit={handleMentorSubmit}
                  className="space-y-4 px-5 py-5"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="mentor-name"
                      >
                        Nama {activeMentorRole}
                      </label>
                      <Input
                        id="mentor-name"
                        className="mt-2"
                        placeholder={`Nama ${activeMentorRole.toLowerCase()}`}
                        value={mentorFormName}
                        onChange={(event) =>
                          setMentorFormName(event.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="mentor-email"
                      >
                        Email
                      </label>
                      <Input
                        id="mentor-email"
                        type="email"
                        className="mt-2"
                        placeholder="nama@peruri.co.id"
                        value={mentorFormEmail}
                        onChange={(event) =>
                          setMentorFormEmail(event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetMentorForm}
                    >
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingMentorId ? "Update data" : "Simpan data"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    )
  }

  if (permissions.canManageClass && activeSection === "question-builder") {
    const stepItems: Array<{
      id: QuestionBuilderStep
      title: string
    }> = [
      { id: 1, title: "Upload Materi PDF" },
      { id: 2, title: "Upload Materi Video" },
      { id: 3, title: "Soal Deskripsi" },
      { id: 4, title: "Soal Pilihan Ganda" },
      { id: 5, title: "Soal Essay" },
    ]
    const highestAccessibleQuestionStep =
      getAvailableQuestionStep(questionDraft)
    const activeQuestionStep = Math.min(
      questionDraft.step,
      highestAccessibleQuestionStep
    ) as QuestionBuilderStep

    return (
      <div className="space-y-5">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                Buat Soal
              </p>
              <h2 className="mt-1 text-base font-semibold">
                {selectedBatch
                  ? `Penyusunan soal ${selectedBatch.name}`
                  : "Penyusunan soal"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ikuti urutan step untuk upload materi dan menyusun soal.
                Progress akan tersimpan otomatis ke step terakhir.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {questionDraft.completed
                  ? "Progress sudah selesai dan tersimpan."
                  : `Draft tersimpan di step ${activeQuestionStep} dari ${stepItems.length}.`}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToQuestionSummary}
            >
              Kembali ke summary
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {stepItems.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveToQuestionStep(step.id)}
                  disabled={step.id > highestAccessibleQuestionStep}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    step.id > highestAccessibleQuestionStep
                      ? "cursor-not-allowed bg-muted/80 text-muted-foreground opacity-60"
                      : activeQuestionStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : activeQuestionStep > step.id
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.id}. {step.title}
                </button>
                {index < stepItems.length - 1 ? (
                  <ArrowRight className="size-4 text-muted-foreground" />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {!selectedBatch ? (
          <section className="rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            Data class tidak ditemukan.
          </section>
        ) : activeQuestionStep === 1 ? (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">
              Step 1 - Upload Materi PDF
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload materi tugas dalam format PDF untuk batch ini.
            </p>

            <div className="mt-4 max-w-xl">
              <label className="text-sm font-medium" htmlFor="question-pdf">
                Upload materi PDF
              </label>
              <Input
                id="question-pdf"
                type="file"
                accept=".pdf"
                className="mt-2"
                onChange={(event) =>
                  updateQuestionFile(
                    "pdfFileName",
                    event.target.files?.[0]?.name ?? ""
                  )
                }
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {questionDraft.pdfFileName
                  ? `File tersimpan: ${questionDraft.pdfFileName}`
                  : "Belum ada file PDF dipilih."}
              </p>
            </div>

            <div className="mt-4 flex flex-col items-end gap-2">
              {!isQuestionStepComplete(1, questionDraft) ? (
                <p className="text-xs text-destructive">
                  {getQuestionStepValidationMessage(1)}
                </p>
              ) : null}
              <Button
                type="button"
                onClick={() => moveToQuestionStep(2)}
                disabled={!isQuestionStepComplete(1, questionDraft)}
              >
                Submit step 1
              </Button>
            </div>
          </section>
        ) : activeQuestionStep === 2 ? (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">
              Step 2 - Upload Materi Video
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload materi video yang akan mendampingi tugas batch ini.
            </p>

            <div className="mt-4 max-w-xl">
              <label className="text-sm font-medium" htmlFor="question-video">
                Upload materi video
              </label>
              <Input
                id="question-video"
                type="file"
                accept="video/*"
                className="mt-2"
                onChange={(event) =>
                  updateQuestionFile(
                    "videoFileName",
                    event.target.files?.[0]?.name ?? ""
                  )
                }
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {questionDraft.videoFileName
                  ? `Video tersimpan: ${questionDraft.videoFileName}`
                  : "Belum ada file video dipilih."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => moveToQuestionStep(1)}
              >
                Kembali ke step 1
              </Button>
              <div className="flex flex-col items-end gap-2">
                {!isQuestionStepComplete(2, questionDraft) ? (
                  <p className="text-xs text-destructive">
                    {getQuestionStepValidationMessage(2)}
                  </p>
                ) : null}
                <Button
                  type="button"
                  onClick={() => moveToQuestionStep(3)}
                  disabled={!isQuestionStepComplete(2, questionDraft)}
                >
                  Submit step 2
                </Button>
              </div>
            </div>
          </section>
        ) : activeQuestionStep === 3 ? (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Step 3 - Soal Deskripsi</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Buat 10 soal deskripsi untuk batch ini.
            </p>

            <div className="mt-4 grid gap-3">
              {questionDraft.descriptionQuestions.map((question, index) => (
                <div key={`desc-${index}`}>
                  <label
                    className="text-sm font-medium"
                    htmlFor={`desc-${index}`}
                  >
                    Soal deskripsi {index + 1}
                  </label>
                  <textarea
                    id={`desc-${index}`}
                    className="mt-2 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={`Tulis soal deskripsi ${index + 1}`}
                    value={question}
                    onChange={(event) =>
                      updateDescriptionQuestion(index, event.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => moveToQuestionStep(2)}
              >
                Kembali ke step 2
              </Button>
              <div className="flex flex-col items-end gap-2">
                {!isQuestionStepComplete(3, questionDraft) ? (
                  <p className="text-xs text-destructive">
                    {getQuestionStepValidationMessage(3)}
                  </p>
                ) : null}
                <Button
                  type="button"
                  onClick={() => moveToQuestionStep(4)}
                  disabled={!isQuestionStepComplete(3, questionDraft)}
                >
                  Submit step 3
                </Button>
              </div>
            </div>
          </section>
        ) : activeQuestionStep === 4 ? (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">
              Step 4 - Soal Pilihan Ganda
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Lengkapi 15 soal pilihan ganda beserta opsi jawaban A-E.
            </p>

            <div className="mt-4 grid gap-4">
              {questionDraft.multipleChoiceQuestions.map((question, index) => (
                <div
                  key={`mc-${index}`}
                  className="rounded-xl border border-dashed bg-background/80 p-4"
                >
                  <label
                    className="text-sm font-medium"
                    htmlFor={`mc-${index}`}
                  >
                    Pilihan ganda {index + 1}
                  </label>
                  <textarea
                    id={`mc-${index}`}
                    className="mt-2 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={`Tulis soal pilihan ganda ${index + 1}`}
                    value={question.question}
                    onChange={(event) =>
                      updateMultipleChoiceQuestion(
                        index,
                        "question",
                        event.target.value
                      )
                    }
                  />

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor={`mc-${index}-a`}
                      >
                        Jawaban A
                      </label>
                      <Input
                        id={`mc-${index}-a`}
                        className="mt-1"
                        placeholder="Opsi jawaban A"
                        value={question.options.a}
                        onChange={(event) =>
                          updateMultipleChoiceQuestion(
                            index,
                            "a",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor={`mc-${index}-b`}
                      >
                        Jawaban B
                      </label>
                      <Input
                        id={`mc-${index}-b`}
                        className="mt-1"
                        placeholder="Opsi jawaban B"
                        value={question.options.b}
                        onChange={(event) =>
                          updateMultipleChoiceQuestion(
                            index,
                            "b",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor={`mc-${index}-c`}
                      >
                        Jawaban C
                      </label>
                      <Input
                        id={`mc-${index}-c`}
                        className="mt-1"
                        placeholder="Opsi jawaban C"
                        value={question.options.c}
                        onChange={(event) =>
                          updateMultipleChoiceQuestion(
                            index,
                            "c",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor={`mc-${index}-d`}
                      >
                        Jawaban D
                      </label>
                      <Input
                        id={`mc-${index}-d`}
                        className="mt-1"
                        placeholder="Opsi jawaban D"
                        value={question.options.d}
                        onChange={(event) =>
                          updateMultipleChoiceQuestion(
                            index,
                            "d",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor={`mc-${index}-e`}
                      >
                        Jawaban E
                      </label>
                      <Input
                        id={`mc-${index}-e`}
                        className="mt-1"
                        placeholder="Opsi jawaban E"
                        value={question.options.e}
                        onChange={(event) =>
                          updateMultipleChoiceQuestion(
                            index,
                            "e",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor={`mc-${index}-answer`}
                      >
                        Kunci jawaban
                      </label>
                      <select
                        id={`mc-${index}-answer`}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={question.correctAnswer}
                        onChange={(event) =>
                          updateMultipleChoiceQuestion(
                            index,
                            "correctAnswer",
                            event.target.value
                          )
                        }
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => moveToQuestionStep(3)}
              >
                Kembali ke step 3
              </Button>
              <div className="flex flex-col items-end gap-2">
                {!isQuestionStepComplete(4, questionDraft) ? (
                  <p className="max-w-sm text-right text-xs text-destructive">
                    {getQuestionStepValidationMessage(4)}
                  </p>
                ) : null}
                <Button
                  type="button"
                  onClick={() => moveToQuestionStep(5)}
                  disabled={!isQuestionStepComplete(4, questionDraft)}
                >
                  Submit step 4
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Step 5 - Soal Essay</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tambahkan 10 soal essay lalu simpan sampai selesai.
            </p>

            <div className="mt-4 grid gap-3">
              {questionDraft.essayQuestions.map((question, index) => (
                <div key={`essay-${index}`}>
                  <label
                    className="text-sm font-medium"
                    htmlFor={`essay-${index}`}
                  >
                    Essay {index + 1}
                  </label>
                  <textarea
                    id={`essay-${index}`}
                    className="mt-2 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={`Tulis soal essay ${index + 1}`}
                    value={question}
                    onChange={(event) =>
                      updateEssayQuestion(index, event.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => moveToQuestionStep(4)}
              >
                Kembali ke step 4
              </Button>
              <div className="flex flex-col items-end gap-2">
                {!isQuestionStepComplete(5, questionDraft) ? (
                  <p className="text-xs text-destructive">
                    {getQuestionStepValidationMessage(5)}
                  </p>
                ) : null}
                <Button
                  type="button"
                  onClick={handleFinishQuestionBuilder}
                  disabled={!isQuestionStepComplete(5, questionDraft)}
                >
                  Submit & Finish
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    )
  }

  if (permissions.canManageClass && activeSection === "mentee-review") {
    const reviewStatusLabel =
      selectedTaskReview?.submissionStatus === "submitted"
        ? "Tugas selesai"
        : selectedTaskReview?.submissionStatus === "in-progress"
          ? "Belum selesai"
          : "Belum ada tugas"
    const reviewStatusTone =
      selectedTaskReview?.submissionStatus === "submitted"
        ? "bg-emerald-100 text-emerald-700"
        : selectedTaskReview?.submissionStatus === "in-progress"
          ? "bg-amber-100 text-amber-700"
          : "bg-muted text-muted-foreground"

    return (
      <div className="space-y-5">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                Review Tugas
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-base font-semibold">
                <ClipboardCheck className="size-4 text-primary" />
                {selectedReviewMentee
                  ? `Penilaian tugas ${selectedReviewMentee.name}`
                  : "Detail penilaian tugas onboard"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Menampilkan hasil tugas yang telah diselesaikan onboard beserta
                form penilaian.
              </p>
            </div>
            {selectedBatch ? (
              <Button asChild variant="outline">
                <Link
                  to={`/class?track=${toTrackQuery(selectedBatch.track)}&section=batch-mentees&batch=${selectedBatch.id}&page=${currentMenteePage}`}
                >
                  Kembali ke daftar mentee
                </Link>
              </Button>
            ) : null}
          </div>
        </section>

        {selectedBatch && selectedReviewMentee && selectedTaskReview ? (
          <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Data onboard</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Detail peserta dan status pengerjaan tugas saat ini.
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    reviewStatusTone
                  )}
                >
                  {reviewStatusLabel}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <strong>Nama mentee:</strong> {selectedReviewMentee.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedReviewMentee.email}
                </p>
                <p>
                  <strong>Class:</strong> {selectedBatch.name}
                </p>
                <p>
                  <strong>Batch:</strong> {selectedBatch.batch}
                </p>
                <p>
                  <strong>Track:</strong> {selectedReviewMentee.track}
                </p>
                <p>
                  <strong>Status onboarding:</strong>{" "}
                  {selectedReviewMentee.status}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Status tugas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedTaskReview.note}
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <strong>Judul tugas:</strong> {selectedTaskReview.title}
                </p>
                <p>
                  <strong>Waktu submit:</strong>{" "}
                  {selectedTaskReview.submittedAt ?? "Belum dikumpulkan"}
                </p>
                <p>
                  <strong>File tugas:</strong>{" "}
                  {selectedTaskReview.fileName ?? "Belum ada file"}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                {selectedTaskReview.summary}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-semibold">Penilaian tugas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedTaskReview.submissionStatus === "submitted"
                  ? "Berikan nilai dan catatan untuk hasil tugas onboard."
                  : "Penilaian belum dapat dilakukan karena tugas belum ada atau belum selesai."}
              </p>

              {selectedTaskReview.submissionStatus === "submitted" ? (
                <form
                  onSubmit={handleSaveTaskReview}
                  className="mt-4 space-y-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="review-score"
                      >
                        Nilai tugas
                      </label>
                      <Input
                        id="review-score"
                        type="number"
                        min={0}
                        max={100}
                        className="mt-2"
                        placeholder="0 - 100"
                        value={currentReviewDraft.score}
                        onChange={(event) =>
                          updateReviewDraft("score", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="review-notes"
                      >
                        Catatan penilaian
                      </label>
                      <textarea
                        id="review-notes"
                        className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Tulis feedback untuk onboard"
                        value={currentReviewDraft.notes}
                        onChange={(event) =>
                          updateReviewDraft("notes", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  {savedSelectedTaskReview ? (
                    <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      Penilaian terakhir tersimpan pada{" "}
                      {savedSelectedTaskReview.savedAt}
                      {savedSelectedTaskReview.score
                        ? ` • Nilai: ${savedSelectedTaskReview.score}`
                        : ""}
                    </div>
                  ) : null}

                  <div className="flex justify-end">
                    <Button type="submit">Simpan penilaian</Button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                  {selectedTaskReview.submissionStatus === "in-progress"
                    ? "Keterangan: onboard masih menyelesaikan tugas. Penilaian akan tersedia setelah file final dikumpulkan."
                    : "Keterangan: belum ada tugas yang dikumpulkan oleh onboard, sehingga belum bisa dilakukan penilaian."}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            Data tugas atau mentee tidak ditemukan.
          </section>
        )}
      </div>
    )
  }

  if (permissions.canManageClass && activeSection === "batch-mentees") {
    return (
      <div className="space-y-5">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                Daftar Mentee
              </p>
              <h2 className="mt-1 text-base font-semibold">
                {selectedBatch
                  ? `Mentee ${selectedBatch.name}`
                  : "Daftar mentee"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Menampilkan tabel mentee sesuai total peserta yang mengikuti
                class ini.
              </p>
            </div>
            {selectedBatch ? (
              <Button asChild variant="outline">
                <Link
                  to={`/class?track=${toTrackQuery(selectedBatch.track)}&section=batch-setting&batch=${selectedBatch.id}`}
                >
                  Kembali ke summary
                </Link>
              </Button>
            ) : null}
          </div>
        </section>

        {selectedBatch ? (
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Tabel mentee</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Menampilkan {batchMenteeRows.length} peserta onboarding
                    untuk {selectedBatch.name}.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {batchMenteeRows.length} mentee
                </span>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">No</th>
                      <th className="px-4 py-3 font-medium">Nama mentee</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Track</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-center font-medium">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBatchMentees.map((mentee, index) => (
                      <tr key={mentee.id} className="border-t align-top">
                        <td className="px-4 py-3 text-muted-foreground">
                          {(currentMenteePage - 1) * 50 + index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">{mentee.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {mentee.email}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {mentee.track}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {mentee.status}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <Button
                              asChild
                              type="button"
                              size="sm"
                              variant="outline"
                            >
                              <Link
                                to={`/class?track=${toTrackQuery(selectedBatch.track)}&section=mentee-review&batch=${selectedBatch.id}&mentee=${mentee.id}&page=${currentMenteePage}`}
                              >
                                Review Tugas
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Halaman {currentMenteePage} dari {totalMenteePages} •
                Menampilkan {paginatedBatchMentees.length} dari{" "}
                {batchMenteeRows.length} data
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentMenteePage === 1}
                  onClick={() =>
                    setSearchParams(
                      {
                        track: toTrackQuery(selectedBatch.track),
                        section: "batch-mentees",
                        batch: selectedBatch.id,
                        page: String(currentMenteePage - 1),
                      },
                      { replace: true }
                    )
                  }
                >
                  Sebelumnya
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentMenteePage === totalMenteePages}
                  onClick={() =>
                    setSearchParams(
                      {
                        track: toTrackQuery(selectedBatch.track),
                        section: "batch-mentees",
                        batch: selectedBatch.id,
                        page: String(currentMenteePage + 1),
                      },
                      { replace: true }
                    )
                  }
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            Data class tidak ditemukan.
          </section>
        )}
      </div>
    )
  }

  if (permissions.canManageClass && activeSection === "batch-setting") {
    return (
      <div className="space-y-5">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                Setting Class
              </p>
              <h2 className="mt-1 text-base font-semibold">
                Summary Data Class
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ringkasan data class/batch yang telah ditambahkan ditampilkan di
                halaman ini.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedBatch ? (
                <Button asChild>
                  <Link
                    to={`/class?track=${toTrackQuery(selectedBatch.track)}&section=batch-mentees&batch=${selectedBatch.id}&page=1`}
                  >
                    Lihat daftar mentee ({selectedBatch.size} peserta)
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link to={`/class?track=${toTrackQuery(activeTrack)}`}>
                  Kembali ke my class
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {selectedBatch ? (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Informasi utama</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <strong>Nama class:</strong> {selectedBatch.name}
                </p>
                <p>
                  <strong>Batch:</strong> {selectedBatch.batch}
                </p>
                <p>
                  <strong>Track:</strong> {selectedBatch.track}
                </p>
                <p>
                  <strong>Peserta onboarding:</strong> {selectedBatch.audience}
                </p>
                <p>
                  <strong>Target peserta:</strong> {selectedBatch.size} peserta
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Jadwal & penilaian</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <strong>Periode:</strong> {selectedBatch.period}
                </p>
                <p>
                  <strong>Deadline:</strong> {selectedBatch.deadline}
                </p>
                <p>
                  <strong>Setting penilaian:</strong> {selectedBatch.grading}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-2">
              <h3 className="text-sm font-semibold">Assignment mentor</h3>
              <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="font-medium">Mentor</p>
                  <p className="mt-1 text-muted-foreground">
                    {selectedBatch.mentor
                      ? resolveAssignmentNames(
                          selectedBatch.mentor,
                          mentorRecords
                        )
                      : "Belum ada mentor dipilih."}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Co-Mentor</p>
                  <p className="mt-1 text-muted-foreground">
                    {selectedBatch.coMentor
                      ? resolveAssignmentNames(
                          selectedBatch.coMentor,
                          mentorRecords
                        )
                      : "Belum ada co-mentor dipilih."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Status progress pembuatan soal
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {questionProgressDescription}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    questionProgressDraft.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : completedQuestionSteps === 0
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                  )}
                >
                  {questionProgressBadge}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${questionProgressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {completedQuestionSteps}/5 step selesai
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {([1, 2, 3, 4, 5] as QuestionBuilderStep[]).map((step) => {
                  const isComplete = isQuestionStepComplete(
                    step,
                    questionProgressDraft
                  )
                  const isCurrentStep =
                    !questionProgressDraft.completed &&
                    !isComplete &&
                    step === currentQuestionProgressStep

                  return (
                    <div
                      key={`progress-${step}`}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs",
                        isComplete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : isCurrentStep
                            ? "border-primary/30 bg-primary/5 text-primary"
                            : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      <p className="font-medium">
                        {step}. {questionStepLabels[step]}
                      </p>
                      <p className="mt-1">
                        {isComplete
                          ? "Selesai"
                          : isCurrentStep
                            ? "Sedang dikerjakan"
                            : "Belum diisi"}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <Button asChild>
                  <Link
                    to={`/class?track=${toTrackQuery(selectedBatch.track)}&section=question-builder&batch=${selectedBatch.id}`}
                  >
                    Buat Soal
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            Data class tidak ditemukan.
          </section>
        )}
      </div>
    )
  }

  const isCatalogPage = activeSection === "catalog"
  const isCatalogDetailPage = activeSection === "catalog-detail"
  const isJourneyDetailPage = activeSection === "journey-detail"
  const isOtherTrainingPage = activeSection === "other-training"
  const isOverviewPage = activeSection === "overview"
  const isManagementClassPage =
    permissions.canManageClass && activeSection === "batch-list"

  const adminFilteredBatches = batches
    .filter((b) => ["PKWT", "Pro Hire"].includes(b.track))
    .filter(
      (b) =>
        !batchSearch ||
        b.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
        b.track.toLowerCase().includes(batchSearch.toLowerCase()) ||
        (b.shortname ?? b.batch)
          .toLowerCase()
          .includes(batchSearch.toLowerCase())
    )
  const adminDisplayedBatches = adminFilteredBatches.slice(0, batchShowEntries)

  return (
    <div className="space-y-5">
      {isCatalogPage ? (
        <section className="space-y-5">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                  Katalog Class
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Class</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Telusuri class onboarding berdasarkan kategori seperti PKWT,
                  Pro Hire, dan MT/Organik dengan tampilan katalog course.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="w-full md:max-w-[360px]">
                <label className="text-sm font-medium" htmlFor="class-search">
                  Filter
                </label>
                <Input
                  id="class-search"
                  className="mt-2 h-10"
                  placeholder="Nama pelatihan/Kategori pelatihan"
                  value={classSearch}
                  onChange={(event) => setClassSearch(event.target.value)}
                />
              </div>

              {permissions.key !== "participant" ? (
                <div className="w-full md:max-w-[260px]">
                  <label
                    className="text-sm font-medium"
                    htmlFor="class-track-filter"
                  >
                    Kategori
                  </label>
                  <select
                    id="class-track-filter"
                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={classTrackFilter}
                    onChange={(event) =>
                      setClassTrackFilter(
                        event.target.value as
                          | "all"
                          | "PKWT"
                          | "Pro Hire"
                          | "MT/Organik"
                          | "Other Pelatihan"
                      )
                    }
                  >
                    <option value="all">Semua kategori</option>
                    <option value="MT/Organik">MT/Organik</option>
                    <option value="PKWT">PKWT</option>
                    <option value="Pro Hire">Pro Hire</option>
                    <option value="Other Pelatihan">Other Pelatihan</option>
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          {classCatalogSections.length || filteredOtherTrainingCards.length ? (
            <>
              {classCatalogSections.map((section, sectionIndex) => (
                <div key={section.track} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">{section.track}</h3>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="px-0 text-primary hover:text-primary"
                    >
                      <Link
                        to={`/class?track=${toTrackQuery(section.track)}&section=catalog-detail`}
                      >
                        More
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {section.items.slice(0, 3).map((batch, batchIndex) => {
                      const statusLabel = batch.status ?? "Belum Dimulai"
                      const progressValue =
                        batch.progress ??
                        (statusLabel === "Selesai"
                          ? 100
                          : statusLabel === "Sedang Berjalan"
                            ? 60
                            : 0)
                      const coverImage =
                        courseCoverImages[
                          (sectionIndex + batchIndex) % courseCoverImages.length
                        ]

                      return (
                        <article
                          key={`catalog-${batch.id}`}
                          className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        >
                          <div
                            className="relative min-h-28 overflow-hidden p-4 text-white"
                            style={{
                              backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.36), rgba(37,99,235,0.4)), url(${coverImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute inset-0 bg-slate-950/10" />
                            <div className="relative">
                              <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                                {batch.track}
                              </p>
                              <h3 className="mt-2 text-[1.05rem] leading-tight font-semibold drop-shadow-sm">
                                {batch.name}
                              </h3>
                              <p className="mt-1 text-sm text-white/90">
                                {batch.batch}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 p-3">
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {batch.audience}
                            </p>

                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>
                                <strong>Periode:</strong> {batch.period}
                              </p>
                              <p>
                                <strong>Peserta:</strong> {batch.size} orang
                              </p>
                            </div>

                            <div>
                              <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                                <span>Progress kelas</span>
                                <span>{progressValue}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted">
                                <div
                                  className={cn(
                                    "h-2 rounded-full",
                                    statusLabel === "Selesai"
                                      ? "bg-emerald-500"
                                      : statusLabel === "Sedang Berjalan"
                                        ? "bg-sky-600"
                                        : "bg-slate-400"
                                  )}
                                  style={{ width: `${progressValue}%` }}
                                />
                              </div>
                            </div>

                            <Button asChild size="sm" variant="outline">
                              <Link
                                to={`/class?track=${toTrackQuery(batch.track)}&section=catalog-detail&journey=${batch.id}`}
                              >
                                Lihat kelas
                              </Link>
                            </Button>
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  {section.track === "Pro Hire" ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-base font-semibold">
                          Other Pelatihan
                        </h4>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="px-0 text-primary hover:text-primary"
                        >
                          <Link to="/class?section=other-training">
                            More
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {otherTrainingCards.map((item, itemIndex) => {
                          const coverImage =
                            courseCoverImages[
                              (sectionIndex + itemIndex + 1) %
                                courseCoverImages.length
                            ]

                          return (
                            <article
                              key={item.id}
                              className="overflow-hidden rounded-xl border bg-card shadow-sm"
                            >
                              <div
                                className="relative min-h-28 overflow-hidden p-4 text-white"
                                style={{
                                  backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.36), rgba(37,99,235,0.4)), url(${coverImage})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              >
                                <div className="absolute inset-0 bg-slate-950/10" />
                                <div className="relative">
                                  <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                                    {item.label}
                                  </p>
                                  <h3 className="mt-2 text-[1.05rem] leading-tight font-semibold drop-shadow-sm">
                                    {item.name}
                                  </h3>
                                  <p className="mt-1 text-sm text-white/90">
                                    {item.batch}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3 p-3">
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                  {item.audience}
                                </p>

                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <p>
                                    <strong>Periode:</strong> {item.period}
                                  </p>
                                  <p>
                                    <strong>Peserta:</strong> {item.size} orang
                                  </p>
                                </div>

                                <div>
                                  <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                                    <span>Progress kelas</span>
                                    <span>{item.progress}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-muted">
                                    <div
                                      className={cn(
                                        "h-2 rounded-full",
                                        item.status === "Selesai"
                                          ? "bg-emerald-500"
                                          : item.status === "Sedang Berjalan"
                                            ? "bg-sky-600"
                                            : "bg-slate-400"
                                      )}
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                </div>

                                <Button asChild size="sm" variant="outline">
                                  <Link to="/modul-pembelajaran-interaktif">
                                    Lihat kelas
                                  </Link>
                                </Button>
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}

              {classTrackFilter === "Other Pelatihan" &&
              filteredOtherTrainingCards.length ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">Other Pelatihan</h3>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="px-0 text-primary hover:text-primary"
                    >
                      <Link to="/class?section=other-training">
                        More
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredOtherTrainingCards.map((item, itemIndex) => {
                      const coverImage =
                        courseCoverImages[itemIndex % courseCoverImages.length]

                      return (
                        <article
                          key={item.id}
                          className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        >
                          <div
                            className="relative min-h-28 overflow-hidden p-4 text-white"
                            style={{
                              backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.36), rgba(37,99,235,0.4)), url(${coverImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute inset-0 bg-slate-950/10" />
                            <div className="relative">
                              <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                                {item.label}
                              </p>
                              <h3 className="mt-2 text-[1.05rem] leading-tight font-semibold drop-shadow-sm">
                                {item.name}
                              </h3>
                              <p className="mt-1 text-sm text-white/90">
                                {item.batch}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 p-3">
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {item.audience}
                            </p>

                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>
                                <strong>Periode:</strong> {item.period}
                              </p>
                              <p>
                                <strong>Peserta:</strong> {item.size} orang
                              </p>
                            </div>

                            <div>
                              <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                                <span>Progress kelas</span>
                                <span>{item.progress}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted">
                                <div
                                  className={cn(
                                    "h-2 rounded-full",
                                    item.status === "Selesai"
                                      ? "bg-emerald-500"
                                      : item.status === "Sedang Berjalan"
                                        ? "bg-sky-600"
                                        : "bg-slate-400"
                                  )}
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>

                            <Button asChild size="sm" variant="outline">
                              <Link to="/modul-pembelajaran-interaktif">
                                Lihat kelas
                              </Link>
                            </Button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Tidak ada class yang cocok dengan filter{" "}
              <strong>{classSearch}</strong>.
            </div>
          )}
        </section>
      ) : isOtherTrainingPage ? (
        <section className="space-y-5">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                  Other Pelatihan
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Semua Pelatihan Lainnya
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Menampilkan seluruh pelatihan tambahan di luar kategori utama.
                </p>
              </div>

              <Button asChild variant="outline">
                <Link to="/class?section=catalog">Kembali ke katalog</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {otherTrainingCards.map((item, itemIndex) => {
              const coverImage =
                courseCoverImages[itemIndex % courseCoverImages.length]

              return (
                <article
                  key={`other-training-${item.id}`}
                  className="overflow-hidden rounded-xl border bg-card shadow-sm"
                >
                  <div
                    className="relative min-h-28 overflow-hidden p-4 text-white"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.36), rgba(37,99,235,0.4)), url(${coverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-slate-950/10" />
                    <div className="relative">
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                        {item.label}
                      </p>
                      <h3 className="mt-2 text-[1.05rem] leading-tight font-semibold drop-shadow-sm">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/90">{item.batch}</p>
                    </div>
                  </div>

                  <div className="space-y-3 p-3">
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {item.audience}
                    </p>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        <strong>Periode:</strong> {item.period}
                      </p>
                      <p>
                        <strong>Peserta:</strong> {item.size} orang
                      </p>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Progress kelas</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            item.status === "Selesai"
                              ? "bg-emerald-500"
                              : item.status === "Sedang Berjalan"
                                ? "bg-sky-600"
                                : "bg-slate-400"
                          )}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <Button asChild size="sm" variant="outline">
                      <Link to="/modul-pembelajaran-interaktif">
                        Lihat kelas
                      </Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : isJourneyDetailPage ? (
        <section className="space-y-5">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                  Detail Journey
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {selectedJourneyBatch?.name ?? `Journey ${activeTrack}`}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tahapan onboarding sekarang dibuat seperti stepper, jadi tiap
                  tahap bisa dibuka pada halaman tersendiri.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link
                    to={`/class?track=${toTrackQuery(selectedJourneyBatch?.track ?? activeTrack)}&section=catalog-detail${selectedJourneyBatch ? `&journey=${selectedJourneyBatch.id}` : ""}`}
                  >
                    Kembali ke class
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/class?section=catalog">Katalog</Link>
                </Button>
              </div>
            </div>
          </div>

          {selectedJourneyBatch ? (
            <>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div
                      className="relative min-h-36 overflow-hidden p-5 text-white"
                      style={{
                        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.42), rgba(37,99,235,0.5)), url(${selectedJourneyCoverImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-slate-950/10" />
                      <div className="relative space-y-2">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                          {selectedJourneyBatch.track}
                        </p>
                        <h3 className="text-xl font-semibold drop-shadow-sm">
                          {selectedJourneyBatch.batch}
                        </h3>
                        <p className="max-w-2xl text-sm text-white/90">
                          {selectedJourney.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 border-t p-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-primary/5 px-3 py-3 text-sm">
                        <p className="text-xs font-medium text-muted-foreground">
                          Progress class
                        </p>
                        <p className="mt-1 text-lg font-semibold text-primary">
                          {selectedJourneyBatch.progress ?? 0}%
                        </p>
                      </div>
                      <div className="rounded-xl bg-primary/5 px-3 py-3 text-sm">
                        <p className="text-xs font-medium text-muted-foreground">
                          Tahap aktif
                        </p>
                        <p className="mt-1 text-lg font-semibold text-primary">
                          {activeJourneyStep}/{selectedJourney.steps.length}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/60 px-3 py-3 text-sm">
                        <p className="text-xs font-medium text-muted-foreground">
                          Periode
                        </p>
                        <p className="mt-1 font-semibold">
                          {selectedJourneyBatch.period}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/60 px-3 py-3 text-sm">
                        <p className="text-xs font-medium text-muted-foreground">
                          Mentor
                        </p>
                        <p className="mt-1 font-semibold">
                          {selectedJourneyBatch.mentor}
                        </p>
                      </div>
                    </div>
                  </div>

                  <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-start justify-between gap-3 border-b bg-[linear-gradient(135deg,#1e3a8a,#1d4ed8)] px-4 py-3 text-white">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                          {activeJourneyStep}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {selectedJourneyStep.title}
                          </h3>
                          <p className="text-sm text-white/80">
                            {selectedJourneyStep.duration}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                        Tahap {activeJourneyStep}
                      </span>
                    </div>

                    <div className="space-y-2 p-4">
                      {selectedJourneyStep.items.map((item) => (
                        <div
                          key={`${selectedJourneyStep.title}-${item}`}
                          className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                      {activeJourneyStep > 1 ? (
                        <Button asChild variant="outline">
                          <Link
                            to={`/class?track=${toTrackQuery(selectedJourneyBatch.track)}&section=journey-detail&journey=${selectedJourneyBatch.id}&step=${activeJourneyStep - 1}`}
                          >
                            Tahap sebelumnya
                          </Link>
                        </Button>
                      ) : (
                        <div />
                      )}

                      {activeJourneyStep < selectedJourney.steps.length ? (
                        <Button asChild>
                          <Link
                            to={`/class?track=${toTrackQuery(selectedJourneyBatch.track)}&section=journey-detail&journey=${selectedJourneyBatch.id}&step=${activeJourneyStep + 1}`}
                          >
                            Lanjut ke tahap berikutnya
                          </Link>
                        </Button>
                      ) : (
                        <Button type="button" onClick={handleFinishJourneyTest}>
                          Selesai
                        </Button>
                      )}
                    </div>
                  </article>
                </div>

                <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                  <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold">
                          Stepper Tahapan
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Klik tiap tahap untuk membuka halaman proses yang
                          berbeda.
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Tahap {activeJourneyStep}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedJourney.steps.map((step, index) => {
                        const stepNumber = index + 1
                        const isActiveStep = stepNumber === activeJourneyStep
                        const isCompletedStep = stepNumber < activeJourneyStep

                        return (
                          <Link
                            key={`${selectedJourneyBatch.id}-${step.title}`}
                            to={`/class?track=${toTrackQuery(selectedJourneyBatch.track)}&section=journey-detail&journey=${selectedJourneyBatch.id}&step=${stepNumber}`}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border bg-card px-3 py-3 shadow-sm transition",
                              isActiveStep
                                ? "border-blue-300 bg-blue-50/70"
                                : "border-border bg-white hover:border-blue-200 hover:bg-blue-50/30",
                              isCompletedStep &&
                                "border-emerald-200 bg-emerald-50/40"
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                                isActiveStep
                                  ? "bg-[linear-gradient(135deg,#1e3a8a,#2563eb)] text-white"
                                  : isCompletedStep
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-200 text-slate-700"
                              )}
                            >
                              {stepNumber}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground">
                                {step.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {step.duration}
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              Halaman {stepNumber}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </aside>
              </div>

              {permissions.key === "participant" && (
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="border-b px-5 py-4">
                    <h3 className="text-base font-semibold">Evaluasi Kelas</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Berikan penilaian Anda untuk kelas{" "}
                      <strong>{selectedJourneyBatch.name}</strong>.
                    </p>
                  </div>
                  {evalSubmitted[selectedJourneyBatch.id] ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100">
                        <ClipboardCheck className="size-7 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">
                          Evaluasi Terkirim!
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Terima kasih atas penilaian Anda untuk kelas ini.
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "size-5",
                              star <=
                                (evalRatings[selectedJourneyBatch.id] ?? 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 p-5">
                      <div>
                        <p className="mb-2 text-sm font-medium">Rating Kelas</p>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const currentRating =
                              evalRatings[selectedJourneyBatch.id] ?? 0
                            return (
                              <button
                                key={star}
                                type="button"
                                className="cursor-pointer rounded p-0.5 transition hover:scale-110"
                                onClick={() =>
                                  setEvalRatings((prev) => ({
                                    ...prev,
                                    [selectedJourneyBatch.id]: star,
                                  }))
                                }
                              >
                                <Star
                                  className={cn(
                                    "size-8 transition",
                                    star <= currentRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground/40"
                                  )}
                                />
                              </button>
                            )
                          })}
                        </div>
                        {(evalRatings[selectedJourneyBatch.id] ?? 0) > 0 && (
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {
                              [
                                "",
                                "Sangat Buruk",
                                "Buruk",
                                "Cukup",
                                "Baik",
                                "Sangat Baik",
                              ][evalRatings[selectedJourneyBatch.id]]
                            }
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="mb-2 block text-sm font-medium"
                          htmlFor="eval-comment"
                        >
                          Catatan / Umpan Balik
                        </label>
                        <textarea
                          id="eval-comment"
                          rows={4}
                          placeholder="Tuliskan pendapat Anda mengenai materi, penyampaian, dan pengalaman belajar di kelas ini..."
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                          value={evalComments[selectedJourneyBatch.id] ?? ""}
                          onChange={(e) =>
                            setEvalComments((prev) => ({
                              ...prev,
                              [selectedJourneyBatch.id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          disabled={
                            !(evalRatings[selectedJourneyBatch.id] ?? 0)
                          }
                          onClick={() =>
                            setEvalSubmitted((prev) => ({
                              ...prev,
                              [selectedJourneyBatch.id]: true,
                            }))
                          }
                        >
                          Kirim Evaluasi
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Pilih class terlebih dahulu dari katalog untuk melihat tahapan
              belajar secara detail.
            </div>
          )}
        </section>
      ) : isCatalogDetailPage ? (
        <section className="space-y-5">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                  Detail Kategori
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Semua Class {activeTrack}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Menampilkan seluruh class pada kategori{" "}
                  <strong>{activeTrack}</strong>.
                </p>
              </div>

              <Button asChild variant="outline">
                <Link to="/class?section=catalog">Kembali ke katalog</Link>
              </Button>
            </div>
          </div>

          {selectedCatalogBatches.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedCatalogBatches.map((batch) => {
                const statusLabel = batch.status ?? "Belum Dimulai"
                const progressValue =
                  batch.progress ??
                  (statusLabel === "Selesai"
                    ? 100
                    : statusLabel === "Sedang Berjalan"
                      ? 60
                      : 0)
                const coverImage =
                  selectedCatalogCoverImages.get(batch.id) ?? courseImage

                return (
                  <article
                    key={`catalog-detail-${batch.id}`}
                    className="overflow-hidden rounded-xl border bg-card shadow-sm"
                  >
                    <div
                      className="relative min-h-28 overflow-hidden p-4 text-white"
                      style={{
                        backgroundImage:
                          statusLabel === "Selesai"
                            ? `linear-gradient(135deg, rgba(5,150,105,0.72), rgba(16,185,129,0.58)), url(${coverImage})`
                            : statusLabel === "Sedang Berjalan"
                              ? `linear-gradient(135deg, rgba(3,105,161,0.72), rgba(79,70,229,0.6)), url(${coverImage})`
                              : `linear-gradient(135deg, rgba(51,65,85,0.78), rgba(71,85,105,0.64)), url(${coverImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-slate-950/10" />
                      <div className="relative">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                          {batch.track}
                        </p>
                        <h3 className="mt-2 text-[1.1rem] leading-tight font-semibold drop-shadow-sm">
                          {batch.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/90">
                          {batch.batch}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 p-3">
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {batch.audience}
                      </p>

                      <div className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                        <p>
                          <strong>Periode:</strong> {batch.period}
                        </p>
                        <p>
                          <strong>Peserta:</strong> {batch.size} orang
                        </p>
                        <p>
                          <strong>Deadline:</strong> {batch.deadline}
                        </p>
                        <p>
                          <strong>Penilaian:</strong> {batch.grading}
                        </p>
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span>Progress kelas</span>
                          <span>{progressValue}%</span>
                        </div>

                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-2 rounded-full",
                              statusLabel === "Selesai"
                                ? "bg-emerald-500"
                                : statusLabel === "Sedang Berjalan"
                                  ? "bg-sky-600"
                                  : "bg-slate-400"
                            )}
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        variant={
                          selectedJourneyBatch?.id === batch.id
                            ? "default"
                            : "outline"
                        }
                      >
                        <Link
                          to={`/class?track=${toTrackQuery(batch.track)}&section=catalog-detail&journey=${batch.id}`}
                        >
                          Lihat kelas
                        </Link>
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Belum ada class untuk kategori <strong>{activeTrack}</strong>.
            </div>
          )}

          <Drawer
            open={Boolean(selectedJourneyBatch)}
            direction="right"
            onOpenChange={(open) => {
              if (!open) closeJourneyDrawer()
            }}
          >
            <DrawerContent className="h-full w-full sm:max-w-[70vw] lg:max-w-[46vw] xl:max-w-[40vw] 2xl:max-w-[38vw]">
              <DrawerHeader className="border-b px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                      Journey Belajar
                    </p>
                    <DrawerTitle className="mt-1 text-lg">
                      {selectedJourneyBatch?.name ?? `Tahapan ${activeTrack}`}
                    </DrawerTitle>
                    <DrawerDescription className="mt-1">
                      {selectedJourneyBatch
                        ? `Menampilkan urutan proses belajar untuk ${selectedJourneyBatch.batch}.`
                        : "Klik tombol Lihat kelas pada card untuk menampilkan tahapan belajar."}
                    </DrawerDescription>
                  </div>

                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm">
                      <X className="size-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="overflow-hidden rounded-xl border bg-card">
                  <div
                    className="relative min-h-32 overflow-hidden p-4 text-white"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.4), rgba(37,99,235,0.45)), url(${selectedJourneyCoverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-slate-950/15" />
                    <div className="relative">
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                        {selectedJourneyBatch?.track ?? activeTrack}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold drop-shadow-sm">
                        {selectedJourneyBatch?.batch ?? "The Journey"}
                      </h3>
                      <p className="mt-1 text-sm text-white/90">
                        {selectedJourneyBatch?.period ??
                          "Pilih class untuk melihat detail tahapan."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="rounded-xl bg-primary/5 px-3 py-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-primary">
                        <span>The Journey</span>
                        <span>{selectedJourneyBatch?.progress ?? 0}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-primary/10">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${selectedJourneyBatch?.progress ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {selectedJourney.steps.map((step, index) => (
                        <details
                          key={`${selectedJourneyBatch?.id ?? activeTrack}-${step.title}`}
                          open={index === 0}
                          className="overflow-hidden rounded-xl border border-blue-900/30 bg-background"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-[linear-gradient(135deg,#172554,#1d4ed8)] px-3 py-2 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">
                            <span>
                              {index + 1}. {step.title}
                            </span>
                            <span className="text-[11px] text-white/85">
                              {step.duration}
                            </span>
                          </summary>
                          <div className="space-y-2 bg-white px-3 py-3 text-sm">
                            {step.items.map((item) => (
                              <div
                                key={`${step.title}-${item}`}
                                className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700"
                              >
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>

                    {selectedJourneyBatch ? (
                      <div className="mt-4">
                        <Button asChild className="w-full sm:w-auto">
                          <Link
                            to={`/class?track=${toTrackQuery(selectedJourneyBatch.track)}&section=journey-detail&journey=${selectedJourneyBatch.id}&step=1`}
                          >
                            Lihat tahapan detail
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </section>
      ) : isOverviewPage ? (
        <section className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">
              Ringkasan alur {activeTrack}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeJourney.description}
            </p>

            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {activeJourney.steps.map((step, index) => (
                <div
                  key={`${step.title}-summary-${index}`}
                  className="flex items-start gap-3 rounded-xl border bg-background px-3 py-2"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {groupedOverviewBatches.length ? (
              groupedOverviewBatches.map((group) => (
                <div key={group.status} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        group.status === "Selesai"
                          ? "bg-emerald-100 text-emerald-700"
                          : group.status === "Sedang Berjalan"
                            ? "bg-sky-100 text-sky-700"
                            : group.status === "Unpassed"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {group.status}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {group.items.length} kelas
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {group.items.map((batch) => {
                      const statusLabel = batch.status ?? "Belum Dimulai"
                      const progressValue =
                        batch.progress ??
                        (statusLabel === "Selesai"
                          ? 100
                          : statusLabel === "Sedang Berjalan"
                            ? 60
                            : statusLabel === "Unpassed"
                              ? 45
                              : 0)
                      const coverImage =
                        batchCoverImages.get(batch.id) ?? courseImage

                      return (
                        <article
                          key={batch.id}
                          className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        >
                          <div
                            className="relative min-h-28 overflow-hidden p-4 text-white"
                            style={{
                              backgroundImage:
                                statusLabel === "Selesai"
                                  ? `linear-gradient(135deg, rgba(5,150,105,0.72), rgba(16,185,129,0.58)), url(${coverImage})`
                                  : statusLabel === "Sedang Berjalan"
                                    ? `linear-gradient(135deg, rgba(3,105,161,0.72), rgba(79,70,229,0.6)), url(${coverImage})`
                                    : statusLabel === "Unpassed"
                                      ? `linear-gradient(135deg, rgba(190,18,60,0.76), rgba(239,68,68,0.6)), url(${coverImage})`
                                      : `linear-gradient(135deg, rgba(51,65,85,0.78), rgba(71,85,105,0.64)), url(${coverImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute inset-0 bg-slate-950/10" />
                            <div className="relative flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                                  {batch.track}
                                </p>
                                <h3 className="mt-2 text-[1.1rem] leading-tight font-semibold drop-shadow-sm">
                                  {batch.name}
                                </h3>
                                <p className="mt-1 text-sm text-white/90">
                                  {batch.batch}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2.5 p-3">
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {batch.audience}
                            </p>

                            <div className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                              <p>
                                <strong>Periode:</strong> {batch.period}
                              </p>
                              <p>
                                <strong>Peserta:</strong> {batch.size} orang
                              </p>
                              <p>
                                <strong>Deadline:</strong> {batch.deadline}
                              </p>
                              <p>
                                <strong>Penilaian:</strong> {batch.grading}
                              </p>
                            </div>

                            <div>
                              <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                                <span>Progress kelas</span>
                                <span>{progressValue}%</span>
                              </div>

                              <div className="h-2 rounded-full bg-muted">
                                <div
                                  className={cn(
                                    "h-2 rounded-full",
                                    statusLabel === "Selesai"
                                      ? "bg-emerald-500"
                                      : statusLabel === "Sedang Berjalan"
                                        ? "bg-sky-600"
                                        : statusLabel === "Unpassed"
                                          ? "bg-rose-500"
                                          : "bg-slate-400"
                                  )}
                                  style={{ width: `${progressValue}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {permissions.key === "participant" ? (
                                <>
                                  <Button asChild size="sm">
                                    <Link to="/dashboard">
                                      Kembali ke dashboard
                                    </Link>
                                  </Button>
                                  <Button asChild size="sm" variant="outline">
                                    <Link
                                      to={`/class?track=${toTrackQuery(batch.track)}&section=catalog-detail&journey=${batch.id}`}
                                    >
                                      Lihat kelas
                                    </Link>
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button asChild size="sm">
                                    <Link to="/journey-onboarding">
                                      Lihat progress
                                    </Link>
                                  </Button>
                                  <Button asChild size="sm" variant="outline">
                                    <Link to="/modul-pembelajaran-interaktif">
                                      Buka materi
                                    </Link>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
                Belum ada kelas yang tersedia untuk track{" "}
                <strong>{activeTrack}</strong>.
              </div>
            )}
          </div>
        </section>
      ) : isManagementClassPage ? (
        <section className="space-y-4">
          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              show
              <select
                value={batchShowEntries}
                onChange={(e) => setBatchShowEntries(Number(e.target.value))}
                className="rounded-md border bg-background px-2 py-1 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              entries
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  className="w-56 pl-9"
                />
              </div>
              <Button type="button" onClick={openCreateForm}>
                <Plus className="size-4" />
                Tambah Courses
              </Button>
            </div>
          </div>

          {/* Unified table */}
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[linear-gradient(90deg,#1d4ed8,#4338ca,#7c3aed)] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                      Fullname
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                      Shortname
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                      Visible
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                      Sertifikat
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                      <Settings2 className="mx-auto size-4" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adminDisplayedBatches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Tidak ada course ditemukan.
                      </td>
                    </tr>
                  ) : (
                    adminDisplayedBatches.map((batch, index) => {
                      const visibleStatus =
                        batch.visible ??
                        (batch.status === "Selesai" ||
                        batch.status === "Sedang Berjalan"
                          ? "PUBLISH"
                          : "DRAFT")
                      return (
                        <tr
                          key={batch.id}
                          className={cn(
                            "transition hover:bg-muted/40",
                            index % 2 === 0 ? "bg-background" : "bg-muted/20"
                          )}
                        >
                          <td className="px-4 py-4 font-medium text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 font-bold">
                            {batch.track === "Pro Hire"
                              ? "Prohire"
                              : batch.track}
                          </td>
                          <td className="px-4 py-4">{batch.name}</td>
                          <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                            {batch.shortname ||
                              batch.batch.toLowerCase().replace(/\s+/g, "_")}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {batch.period}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                                visibleStatus === "PUBLISH"
                                  ? "border-emerald-400 text-emerald-600"
                                  : "border-slate-300 text-slate-500"
                              )}
                            >
                              {visibleStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              className="cursor-pointer rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              Unduh
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(batch)}
                                className="cursor-pointer text-muted-foreground transition hover:text-primary"
                                title="Edit"
                              >
                                <PencilLine className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteBatch(batch.id)}
                                className="cursor-pointer text-muted-foreground transition hover:text-red-500"
                                title="Hapus"
                              >
                                <Trash2 className="size-4" />
                              </button>
                              <Button
                                asChild
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                title="Setting"
                              >
                                <Link
                                  to={`/class?track=${toTrackQuery(batch.track)}&section=batch-setting&batch=${batch.id}`}
                                >
                                  <Settings2 className="size-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Menampilkan {adminDisplayedBatches.length} dari{" "}
            {adminFilteredBatches.length} course
          </p>

          {showBatchForm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
              <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      <h2 className="text-lg font-semibold">
                        {editingId ? "Edit course" : "Tambah course"}
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Admin PSP dapat menentukan kategori, peserta onboarding,
                      deadline tiap tahapan, dan skema penilaian.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={resetForm}
                    className="shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
                  {/* Kategori Course */}
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="kategori-course"
                    >
                      Kategori Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="kategori-course"
                      className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                      value={formKategoriTrack}
                      onChange={(e) =>
                        setFormKategoriTrack(e.target.value as ClassTrack)
                      }
                      required
                    >
                      <option value="">Choose Kategori</option>
                      <option value="PKWT">PKWT</option>
                      <option value="Pro Hire">Prohire</option>
                      <option value="MT/Organik">Magang Trainee</option>
                    </select>
                  </div>

                  {/* Fullname */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="batch-name">
                      Fullname course
                    </label>
                    <Input
                      id="batch-name"
                      className="mt-2"
                      placeholder="Contoh: Training Dasar PKWT"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>

                  {/* Shortname */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="shortname">
                      Shortname
                    </label>
                    <Input
                      id="shortname"
                      className="mt-2 font-mono"
                      placeholder="Contoh: pkwt_base"
                      value={formShortname}
                      onChange={(event) => setFormShortname(event.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Kode unik untuk course (tanpa spasi).
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium" htmlFor="batch">
                        Batch
                      </label>
                      <Input
                        id="batch"
                        className="mt-2"
                        placeholder="Batch 1"
                        value={batchLabel}
                        onChange={(event) => setBatchLabel(event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium" htmlFor="audience">
                        Untuk user onboarding siapa
                      </label>
                      <Input
                        id="audience"
                        className="mt-2"
                        placeholder="Peserta onboarding sesuai kebutuhan"
                        value={audience}
                        onChange={(event) => setAudience(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium" htmlFor="start">
                        Mulai
                      </label>
                      <Input
                        id="start"
                        type="date"
                        className="mt-2"
                        value={periodStart}
                        onChange={(event) => setPeriodStart(event.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="end">
                        Selesai
                      </label>
                      <Input
                        id="end"
                        type="date"
                        className="mt-2"
                        value={periodEnd}
                        onChange={(event) => setPeriodEnd(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium" htmlFor="deadline">
                        Deadline tiap tahapan
                      </label>
                      <Input
                        id="deadline"
                        type="date"
                        className="mt-2"
                        value={deadline}
                        onChange={(event) => setDeadline(event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="size">
                        Target peserta
                      </label>
                      <Input
                        id="size"
                        type="number"
                        min={1}
                        className="mt-2"
                        placeholder="0"
                        value={size}
                        onChange={(event) => setSize(event.target.value)}
                      />
                    </div>
                  </div>

                  {/* Visible */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="visible">
                      Visible
                    </label>
                    <select
                      id="visible"
                      className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                      value={formVisible}
                      onChange={(e) =>
                        setFormVisible(e.target.value as "PUBLISH" | "DRAFT")
                      }
                    >
                      <option value="PUBLISH">PUBLISH</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MultiSelectField
                      id="mentor"
                      label="Tambah mentor"
                      options={availableMentors}
                      value={selectedMentors}
                      onChange={setSelectedMentors}
                      emptyText="Pilih mentor"
                    />
                    <MultiSelectField
                      id="co-mentor"
                      label="Tambah co-mentor"
                      options={availableCoMentors}
                      value={selectedCoMentors}
                      onChange={setSelectedCoMentors}
                      emptyText="Pilih co-mentor"
                    />
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="header-image"
                    >
                      Upload header image class
                    </label>
                    <div className="mt-2 space-y-2">
                      {headerImagePreview ? (
                        <div className="relative overflow-hidden rounded-lg border">
                          <img
                            src={headerImagePreview}
                            alt="Preview header class"
                            className="h-20 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setHeaderImagePreview(null)
                              setHeaderImageFileName("")
                            }}
                            className="absolute top-2 right-2 rounded-full bg-slate-950/60 p-1 text-white hover:bg-slate-950/80"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="header-image"
                          className="flex h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground transition hover:bg-muted/50"
                        >
                          <ImagePlus className="size-7 opacity-60" />
                          <span className="text-xs">
                            Klik untuk pilih gambar header
                          </span>
                        </label>
                      )}
                      <Input
                        id="header-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (!file) return
                          setHeaderImageFileName(file.name)
                          const objectUrl = URL.createObjectURL(file)
                          setHeaderImagePreview(objectUrl)
                        }}
                      />
                      {headerImageFileName &&
                      !headerImagePreview ? null : headerImageFileName ? (
                        <p className="text-xs text-muted-foreground">
                          File: {headerImageFileName}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Format yang didukung: JPG, PNG, WEBP.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor="mentee-excel"
                      >
                        Upload mentee format excel
                      </label>
                      <Input
                        id="mentee-excel"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="mt-2"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Format: `.xlsx`, `.xls`, atau `.csv`.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium" htmlFor="grading">
                        Setting penilaian
                      </label>
                      <Input
                        id="grading"
                        className="mt-2"
                        placeholder="70% test • 30% tugas"
                        value={grading}
                        onChange={(event) => setGrading(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingId ? "Update course" : "Simpan course"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </section>
      ) : permissions.canManageMentor ? (
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Daftar mentee aktif</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {permissions.label} dapat memantau progres, memberi coaching, dan
              menyiapkan mentee untuk evaluasi sesuai track {activeTrack}.
            </p>

            <div className="mt-4 space-y-3">
              {filteredMentees.map((mentee) => (
                <div
                  key={mentee.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{mentee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Tahap aktif: {mentee.stage}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {mentee.status}
                    </span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${mentee.progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>Progress: {mentee.progress}%</span>
                    <span>• Review berikutnya: {mentee.nextReview}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => advanceMentee(mentee.id)}
                    >
                      Update progres
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => markReady(mentee.id)}
                    >
                      {permissions.canFinalizeOutcome
                        ? "Rekomendasikan evaluasi"
                        : "Tandai siap review"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">
                  Ringkasan pendampingan
                </h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  • {filteredMentees.length} mentee aktif pada track{" "}
                  {activeTrack}
                </li>
                <li>• Fokus hari ini: review tugas dan coaching session</li>
                <li>
                  •{" "}
                  {permissions.canFinalizeOutcome
                    ? "Mentor dapat memberi rekomendasi kelulusan awal"
                    : "Co-mentor memberi catatan pendamping sebelum final review"}
                </li>
              </ul>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Aksi cepat</h2>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding">Buka management mentor</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/modul-pembelajaran-interaktif">
                    Review tugas mentee
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : permissions.canManageExaminer ? (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Peserta siap diuji</h2>
            <div className="mt-4 space-y-3">
              {filteredMentees.map((mentee) => (
                <div
                  key={mentee.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <p className="font-medium">{mentee.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track {mentee.track} • Progress {mentee.progress}%
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Status saat ini: {mentee.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Lanjut ke penilaian</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Penguji Internal fokus pada peserta yang sudah siap mengikuti
              evaluasi dan dapat langsung melanjutkan input nilai pada menu
              Management Penguji.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/evaluasi-feedback">Buka input nilai</Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Akses class saya</h2>
            {featuredBatch ? (
              <div className="mt-4 rounded-xl border bg-background p-4">
                <p className="text-base font-semibold">{featuredBatch.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {featuredBatch.period}
                </p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Batch:</strong> {featuredBatch.batch}
                  </p>
                  <p>
                    <strong>Tipe:</strong> {featuredBatch.track}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {featuredBatch.deadline}
                  </p>
                  <p>
                    <strong>Skema nilai:</strong> {featuredBatch.grading}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link to="/modul-pembelajaran-interaktif">
                      Akses materi & tugas
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/evaluasi-feedback">Kerjakan test</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
                Belum ada class aktif untuk tipe <strong>{activeTrack}</strong>.
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Tahapan class</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeJourney.description}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {activeJourney.steps.map((step, index) => {
                const isDoneStep = step.title.toLowerCase() === "selesai"

                return (
                  <div key={`${step.title}-${index}`} className="relative">
                    {index < activeJourney.steps.length - 1 ? (
                      <>
                        <div className="absolute top-[calc(100%-0.5rem)] -bottom-3 left-4 w-px bg-border md:hidden" />
                        <div className="absolute top-5 left-[calc(100%-0.25rem)] hidden h-px w-4 bg-border xl:block" />
                      </>
                    ) : null}

                    <div
                      className={cn(
                        "h-full rounded-2xl border p-4 shadow-sm",
                        isDoneStep
                          ? "border-emerald-200 bg-emerald-50/80"
                          : activeTrack === "PKWT" && index === 2
                            ? "border-sky-200 bg-sky-50/70"
                            : "bg-background"
                      )}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                            isDoneStep ? "bg-emerald-600" : "bg-slate-900"
                          )}
                        >
                          {isDoneStep ? (
                            <Check className="size-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            {step.duration}
                          </p>
                          <h3 className="text-sm leading-tight font-semibold">
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {step.items.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/journey-onboarding">Lihat progress onboarding</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/dashboard">Kembali ke dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {showJourneyCompletionNotice ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="size-6" />
            </div>
            <h3 className="mt-4 text-center text-lg font-semibold">
              Telah menyelesaikan tes
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Anda telah menyelesaikan tes pada tahapan ini.
            </p>
            <div className="mt-5 flex justify-center">
              <Button
                type="button"
                onClick={() => setShowJourneyCompletionNotice(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

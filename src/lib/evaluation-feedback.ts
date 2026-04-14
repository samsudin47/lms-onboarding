export type EvaluationLevelRow = {
  id: number
  level: string
}

export type FeedbackAnswer = {
  question: string
  score: 1 | 2 | 3 | 4
}

export type FeedbackSection = {
  title: string
  answers: FeedbackAnswer[]
}

export type FeedbackSubmission = {
  id: string
  participantName: string
  participantTrack: "PKWT" | "Prohire" | "MT"
  level: number
  trainingDate: string
  organizer: string
  instructor: string
  submittedAt: string
  averageScore: number
  status: "Butuh Review" | "Sudah Ditinjau"
  notes: string
  sections: FeedbackSection[]
}

export type ParticipantFlowRow = {
  id: string
  name: string
  track: "PKWT" | "Prohire" | "MT"
  vendor: string
  level: number
  selected: boolean
  scored: boolean
  completed: boolean
}

export const evaluationLevelRows: EvaluationLevelRow[] = [
  {
    id: 1,
    level: "Level 1 - Pre-Test Dasar",
  },
  {
    id: 2,
    level: "Level 2 - Evaluasi Kelas",
  },
  {
    id: 3,
    level: "Level 3 - Post-Test",
  },
]

export const feedbackSubmissions: FeedbackSubmission[] = [
  {
    id: "fb-001",
    participantName: "Ayu Pratama",
    participantTrack: "PKWT",
    level: 1,
    trainingDate: "10 Apr 2026",
    organizer: "Divisi SDM",
    instructor: "Rina Amalia",
    submittedAt: "11 Apr 2026, 09:42",
    averageScore: 3.3,
    status: "Butuh Review",
    notes:
      "Materi sudah jelas, namun peserta meminta tambahan studi kasus untuk unit operasional.",
    sections: [
      {
        title: "Bagian 1: Penilaian Materi Pelatihan",
        answers: [
          {
            question:
              "Materi pelatihan sesuai dengan harapan dan kebutuhan saat ini",
            score: 3,
          },
          {
            question: "Materi pelatihan dapat dipahami dengan mudah",
            score: 4,
          },
          {
            question: "Materi bisa diterapkan di unit kerja",
            score: 3,
          },
        ],
      },
      {
        title: "Bagian 2: Penilaian Instruktur",
        answers: [
          { question: "Instruktur menyampaikan materi dengan jelas", score: 4 },
          {
            question: "Instruktur responsif terhadap pertanyaan peserta",
            score: 3,
          },
        ],
      },
    ],
  },
  {
    id: "fb-002",
    participantName: "Raka Saputra",
    participantTrack: "Prohire",
    level: 2,
    trainingDate: "08 Apr 2026",
    organizer: "Corporate University",
    instructor: "Andri Nugraha",
    submittedAt: "09 Apr 2026, 13:18",
    averageScore: 2.9,
    status: "Butuh Review",
    notes:
      "Ada sesi yang terlalu cepat sehingga beberapa materi teknis belum sepenuhnya dipahami.",
    sections: [
      {
        title: "Bagian 1: Penilaian Materi Pelatihan",
        answers: [
          {
            question:
              "Materi pelatihan sesuai dengan harapan dan kebutuhan saat ini",
            score: 3,
          },
          {
            question: "Materi pelatihan dapat dipahami dengan mudah",
            score: 2,
          },
        ],
      },
      {
        title: "Bagian 3: Penilaian Penyelenggaraan Diklat",
        answers: [
          {
            question: "Jadwal pelatihan sesuai agenda yang disampaikan",
            score: 3,
          },
          {
            question: "Informasi administrasi disampaikan lengkap",
            score: 3,
          },
        ],
      },
    ],
  },
  {
    id: "fb-003",
    participantName: "Dina Maharani",
    participantTrack: "MT",
    level: 3,
    trainingDate: "05 Apr 2026",
    organizer: "Learning Center",
    instructor: "Yusuf Maulana",
    submittedAt: "06 Apr 2026, 16:05",
    averageScore: 3.8,
    status: "Sudah Ditinjau",
    notes:
      "Sesi praktik sangat membantu. Direkomendasikan jadi template untuk batch berikutnya.",
    sections: [
      {
        title: "Bagian 2: Penilaian Instruktur",
        answers: [
          { question: "Instruktur menyampaikan materi dengan jelas", score: 4 },
          {
            question: "Instruktur responsif terhadap pertanyaan peserta",
            score: 4,
          },
        ],
      },
      {
        title: "Bagian 3: Penilaian Penyelenggaraan Diklat",
        answers: [
          {
            question: "Fasilitas pelatihan mendukung proses belajar",
            score: 3,
          },
          {
            question: "Informasi administrasi disampaikan lengkap",
            score: 4,
          },
        ],
      },
    ],
  },
]

export const participantFlowRows: ParticipantFlowRow[] = [
  {
    id: "pf-001",
    name: "Ayu Pratama",
    track: "PKWT",
    vendor: "Vendor A",
    level: 1,
    selected: true,
    scored: true,
    completed: true,
  },
  {
    id: "pf-002",
    name: "Raka Saputra",
    track: "Prohire",
    vendor: "Vendor B",
    level: 2,
    selected: true,
    scored: false,
    completed: false,
  },
  {
    id: "pf-003",
    name: "Dina Maharani",
    track: "MT",
    vendor: "Vendor A",
    level: 3,
    selected: false,
    scored: false,
    completed: false,
  },
]

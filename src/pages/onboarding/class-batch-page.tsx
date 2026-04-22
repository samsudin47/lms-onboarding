import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleX,
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
import {
  PhaseFaseEvaluasiFeedback,
  isEvaluasiFeedbackMateri,
} from "@/components/phase-fase-evaluasi-feedback"
import { JourneyCertificateSection } from "@/components/journey-certificate-section"
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

type ClassFaseEntry = {
  id: string
  batchId: string
  faseKode: string
  faseNama: string
  urutan: number
  materi: string[]
  evaluasi: string
}

type ClassMenteeEntry = {
  id: string
  batchId: string
  nama: string
  nomorPokok: string
  jabatan: string
  mentor: string
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

type JourneyStep = {
  title: string
  duration: string
  items: string[]
}

// ── Rich journey types for the participant fase/materi flow ──────────────────
type JQuizOption = { id: string; text: string }
type JQuizQuestion = {
  id: string
  text: string
  options: JQuizOption[]
  correct: string
}
type JMateri = {
  id: string
  title: string
  deskripsi: string
  contentLabel: string
  preTest: JQuizQuestion[]
  postTest: JQuizQuestion[]
  /** Form umpan balik (tanpa pre/materi/post) — hanya ujung tiap fase. */
  variant?: "standard" | "evaluasi-feedback"
}
type JFase = {
  id: string
  kode: string
  nama: string
  deadline: string
  materi: JMateri[]
  evaluasiLabel?: string // MT only: evaluasi per fase
}

function buildEvaluasiMateriForFase(fase: JFase): JMateri {
  return {
    id: `${fase.id}__m-evaluasi`,
    title: "Evaluasi",
    deskripsi:
      "Umpan balik fase: isi kuesioner Evaluasi Level 1 (tanpa pre-test, materi, atau post-test).",
    contentLabel: "Evaluasi",
    preTest: [],
    postTest: [],
    variant: "evaluasi-feedback",
  }
}

function appendEvaluasiMateriToFases(fases: JFase[]): JFase[] {
  return fases.map((f) => ({
    ...f,
    materi: [...f.materi, buildEvaluasiMateriForFase(f)],
  }))
}

/** Pre/post test per materi: dibatasi untuk peserta onboarding agar demo presentasi singkat (1–2 soal). */
const ONBOARDING_PARTICIPANT_QUIZ_CAP = 2

function shuffleJourneyQuiz(
  qs: JQuizQuestion[],
  seed: string
): JQuizQuestion[] {
  const arr = [...qs]
  let h = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0
    const j = h % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

type PostQuizAttemptRecord = {
  at: string
  score: number
  total: number
  percent: number
}

function formatQuizAttemptDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const JOURNEY_FASES_BY_TRACK: Record<ClassTrack, JFase[]> = {
  PKWT: [
    {
      id: "jf-pkwt-01",
      kode: "F01",
      nama: "Orientasi & Pengenalan",
      deadline: "11 Apr 2026",
      materi: [
        {
          id: "jm-pkwt-01-01",
          title: "Pengenalan Perusahaan",
          deskripsi:
            "Memahami sejarah, visi misi, dan nilai-nilai Peruri sebagai perusahaan percetakan keamanan negara.",
          contentLabel: "Slide Presentasi",
          preTest: [
            {
              id: "q1",
              text: "Apa kepanjangan dari Peruri?",
              options: [
                { id: "a", text: "Perum Percetakan Uang Republik Indonesia" },
                { id: "b", text: "Perusahaan Rekayasa Uang Indonesia" },
                { id: "c", text: "Percetakan Umum Rupiah Indonesia" },
                { id: "d", text: "Perum Pengaman Rupiah Indonesia" },
              ],
              correct: "a",
            },
            {
              id: "q2",
              text: "Peruri merupakan Badan Usaha Milik...",
              options: [
                { id: "a", text: "Swasta" },
                { id: "b", text: "Negara" },
                { id: "c", text: "Daerah" },
                { id: "d", text: "Asing" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Produk utama yang dicetak oleh Peruri adalah...",
              options: [
                { id: "a", text: "Buku teks" },
                { id: "b", text: "Koran harian" },
                { id: "c", text: "Uang rupiah dan dokumen keamanan" },
                { id: "d", text: "Kartu identitas digital" },
              ],
              correct: "c",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Tahun berapa Peruri berdiri?",
              options: [
                { id: "a", text: "1960" },
                { id: "b", text: "1968" },
                { id: "c", text: "1975" },
                { id: "d", text: "1980" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Peruri berada di bawah naungan kementerian...",
              options: [
                { id: "a", text: "Keuangan" },
                { id: "b", text: "Dalam Negeri" },
                { id: "c", text: "BUMN" },
                { id: "d", text: "Perdagangan" },
              ],
              correct: "c",
            },
            {
              id: "pq3",
              text: "Selain uang, Peruri juga memproduksi dokumen...",
              options: [
                { id: "a", text: "Izin mengemudi" },
                { id: "b", text: "Paspor dan meterai" },
                { id: "c", text: "Akta kelahiran" },
                { id: "d", text: "Kartu keluarga" },
              ],
              correct: "b",
            },
          ],
        },
        {
          id: "jm-pkwt-01-02",
          title: "Budaya AKHLAK",
          deskripsi:
            "Memahami nilai-nilai AKHLAK sebagai core values BUMN dan penerapannya di lingkungan kerja Peruri.",
          contentLabel: "Video & Diskusi",
          preTest: [
            {
              id: "q1",
              text: "AKHLAK merupakan core values yang ditetapkan oleh...",
              options: [
                { id: "a", text: "Kementerian Keuangan" },
                { id: "b", text: "Kementerian BUMN" },
                { id: "c", text: "Presiden RI" },
                { id: "d", text: "Direksi Peruri" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Huruf 'A' pertama dalam AKHLAK melambangkan nilai...",
              options: [
                { id: "a", text: "Aktif" },
                { id: "b", text: "Amanah" },
                { id: "c", text: "Adaptif" },
                { id: "d", text: "Andalan" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Nilai 'Kolaboratif' dalam AKHLAK berarti...",
              options: [
                { id: "a", text: "Bekerja sendiri" },
                { id: "b", text: "Bersinergi dengan pihak lain" },
                { id: "c", text: "Mengutamakan kompetisi" },
                { id: "d", text: "Menjaga kerahasiaan" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Nilai 'Harmonis' dalam AKHLAK berkaitan dengan...",
              options: [
                { id: "a", text: "Perbedaan pendapat" },
                { id: "b", text: "Keselarasan dalam keberagaman" },
                { id: "c", text: "Strategi bisnis" },
                { id: "d", text: "Keuntungan perusahaan" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Contoh penerapan nilai 'Loyal' adalah...",
              options: [
                { id: "a", text: "Membocorkan data ke pihak luar" },
                { id: "b", text: "Menjaga nama baik perusahaan" },
                { id: "c", text: "Menolak hasil keputusan pimpinan" },
                { id: "d", text: "Bekerja hanya jika ada bonus" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Nilai 'Kompeten' mendorong karyawan untuk...",
              options: [
                { id: "a", text: "Terus belajar dan meningkatkan kemampuan" },
                { id: "b", text: "Mengandalkan rekan kerja" },
                { id: "c", text: "Menghindari tantangan baru" },
                { id: "d", text: "Fokus pada jabatan semata" },
              ],
              correct: "a",
            },
          ],
        },
        {
          id: "jm-pkwt-01-03",
          title: "Kebijakan SDM",
          deskripsi:
            "Memahami kebijakan ketenagakerjaan terkait kontrak, cuti, tunjangan, dan kode etik karyawan PKWT.",
          contentLabel: "Dokumen PDF",
          preTest: [
            {
              id: "q1",
              text: "Dokumen utama yang mengatur hubungan kerja PKWT adalah...",
              options: [
                { id: "a", text: "Surat Keputusan" },
                { id: "b", text: "Perjanjian Kerja Waktu Tertentu" },
                { id: "c", text: "Nota Dinas" },
                { id: "d", text: "SK Pengangkatan" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Cuti tahunan berhak diperoleh setelah masa kerja...",
              options: [
                { id: "a", text: "3 bulan" },
                { id: "b", text: "6 bulan" },
                { id: "c", text: "12 bulan" },
                { id: "d", text: "24 bulan" },
              ],
              correct: "c",
            },
            {
              id: "q3",
              text: "Kode etik karyawan bertujuan untuk...",
              options: [
                { id: "a", text: "Membatasi kreativitas" },
                { id: "b", text: "Menjaga integritas dan profesionalisme" },
                { id: "c", text: "Mengatur jam kerja" },
                { id: "d", text: "Menentukan gaji" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Tunjangan berdasarkan kehadiran disebut...",
              options: [
                { id: "a", text: "Tunjangan jabatan" },
                { id: "b", text: "Tunjangan transport" },
                { id: "c", text: "Tunjangan kehadiran" },
                { id: "d", text: "Tunjangan kesehatan" },
              ],
              correct: "c",
            },
            {
              id: "pq2",
              text: "Pelanggaran kode etik yang berat dapat mengakibatkan...",
              options: [
                { id: "a", text: "Pemotongan cuti" },
                { id: "b", text: "Peringatan lisan" },
                { id: "c", text: "Pemutusan hubungan kerja" },
                { id: "d", text: "Penundaan gaji" },
              ],
              correct: "c",
            },
            {
              id: "pq3",
              text: "Jam kerja standar dalam satu minggu adalah...",
              options: [
                { id: "a", text: "35 jam" },
                { id: "b", text: "40 jam" },
                { id: "c", text: "45 jam" },
                { id: "d", text: "48 jam" },
              ],
              correct: "b",
            },
          ],
        },
      ],
    },
    {
      id: "jf-pkwt-02",
      kode: "F02",
      nama: "Pembelajaran Teknis",
      deadline: "11 Apr 2026",
      materi: [
        {
          id: "jm-pkwt-02-01",
          title: "Pengenalan Sistem Kerja",
          deskripsi:
            "Pengenalan sistem, tools, dan proses kerja yang digunakan di unit kerja masing-masing peserta.",
          contentLabel: "Demo & Praktik",
          preTest: [
            {
              id: "q1",
              text: "Sistem yang umum digunakan untuk absensi di Peruri adalah...",
              options: [
                { id: "a", text: "Sistem manual" },
                { id: "b", text: "Aplikasi HR digital" },
                { id: "c", text: "Buku absen" },
                { id: "d", text: "Email supervisor" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Laporan pekerjaan disampaikan kepada...",
              options: [
                { id: "a", text: "HRD" },
                { id: "b", text: "Atasan langsung/Line Manager" },
                { id: "c", text: "Direktur" },
                { id: "d", text: "Rekan kerja" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "SLA (Service Level Agreement) berarti...",
              options: [
                { id: "a", text: "Singkatan jabatan" },
                { id: "b", text: "Kesepakatan tingkat layanan/penyelesaian" },
                { id: "c", text: "Surat izin atasan" },
                { id: "d", text: "Standar liburan angkatan" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Pengajuan cuti dilakukan melalui...",
              options: [
                { id: "a", text: "Telepon ke HRD" },
                { id: "b", text: "Surat manual" },
                { id: "c", text: "Aplikasi sistem HR" },
                { id: "d", text: "Langsung ke direktur" },
              ],
              correct: "c",
            },
            {
              id: "pq2",
              text: "Menghadapi masalah teknis pekerjaan, langkah pertama adalah...",
              options: [
                { id: "a", text: "Menelepon keluarga" },
                { id: "b", text: "Melaporkan ke atasan langsung" },
                { id: "c", text: "Menunggu masalah selesai sendiri" },
                { id: "d", text: "Meninggalkan kantor" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Target kerja individu umumnya ditetapkan dalam...",
              options: [
                { id: "a", text: "Rapat mingguan" },
                { id: "b", text: "KPI (Key Performance Indicator)" },
                { id: "c", text: "Absensi" },
                { id: "d", text: "Surat peringatan" },
              ],
              correct: "b",
            },
          ],
        },
        {
          id: "jm-pkwt-02-02",
          title: "SOP Unit Kerja",
          deskripsi:
            "Memahami Standar Operasional Prosedur yang berlaku di unit kerja dan cara penerapannya sehari-hari.",
          contentLabel: "Dokumen & Simulasi",
          preTest: [
            {
              id: "q1",
              text: "SOP singkatan dari...",
              options: [
                { id: "a", text: "Standar Operasional Prosedur" },
                { id: "b", text: "Sistematika Operasi Perusahaan" },
                { id: "c", text: "Standar Output Produksi" },
                { id: "d", text: "Sistem Operasi Peruri" },
              ],
              correct: "a",
            },
            {
              id: "q2",
              text: "SOP dibuat untuk tujuan...",
              options: [
                { id: "a", text: "Membatasi kreativitas" },
                { id: "b", text: "Memastikan konsistensi dan kualitas kerja" },
                { id: "c", text: "Meningkatkan beban kerja" },
                { id: "d", text: "Mengawasi karyawan" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Jika SOP tidak diketahui, langkah yang benar adalah...",
              options: [
                { id: "a", text: "Abaikan dan kerjakan sendiri" },
                { id: "b", text: "Tanyakan kepada atasan atau senior" },
                { id: "c", text: "Menunggu instruksi via email" },
                { id: "d", text: "Tidak mengerjakan tugas" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Revisi SOP biasanya dilakukan oleh...",
              options: [
                { id: "a", text: "Semua karyawan bebas" },
                { id: "b", text: "Pihak yang berwenang sesuai prosedur" },
                { id: "c", text: "Karyawan baru" },
                { id: "d", text: "Secara otomatis setiap tahun" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Melanggar SOP dapat mengakibatkan...",
              options: [
                { id: "a", text: "Tidak ada konsekuensi" },
                { id: "b", text: "Sanksi sesuai aturan perusahaan" },
                { id: "c", text: "Kenaikan gaji" },
                { id: "d", text: "Kenaikan jabatan" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Dokumentasi SOP disimpan di...",
              options: [
                { id: "a", text: "Komputer pribadi" },
                {
                  id: "b",
                  text: "Sistem manajemen dokumen perusahaan",
                },
                { id: "c", text: "Email atasan" },
                { id: "d", text: "Buku catatan pribadi" },
              ],
              correct: "b",
            },
          ],
        },
      ],
    },
  ],
  "Pro Hire": [
    {
      id: "jf-prohire-01",
      kode: "F01",
      nama: "Orientasi & Bela Negara",
      deadline: "18 Apr 2026",
      materi: [
        {
          id: "jm-prohire-01-01",
          title: "Pengenalan Perusahaan",
          deskripsi:
            "Memahami sejarah, visi misi, dan nilai-nilai Peruri untuk karyawan level supervisor & specialist.",
          contentLabel: "Slide Presentasi",
          preTest: [
            {
              id: "q1",
              text: "Apa kepanjangan dari Peruri?",
              options: [
                { id: "a", text: "Perum Percetakan Uang Republik Indonesia" },
                { id: "b", text: "Perusahaan Rekayasa Uang Indonesia" },
                { id: "c", text: "Percetakan Umum Rupiah Indonesia" },
                { id: "d", text: "Perum Pengaman Rupiah Indonesia" },
              ],
              correct: "a",
            },
            {
              id: "q2",
              text: "Peruri berperan penting dalam pengamanan...",
              options: [
                { id: "a", text: "Data digital pemerintah" },
                { id: "b", text: "Dokumen berharga dan alat negara" },
                { id: "c", text: "Investasi asing" },
                { id: "d", text: "Infrastruktur telekomunikasi" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Pro Hire adalah jalur rekrutmen untuk level...",
              options: [
                { id: "a", text: "Entry level fresh graduate" },
                { id: "b", text: "Supervisor dan specialist" },
                { id: "c", text: "Direktur" },
                { id: "d", text: "Tenaga outsourcing" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Nilai AKHLAK yang mendorong inovasi adalah...",
              options: [
                { id: "a", text: "Amanah" },
                { id: "b", text: "Kolaboratif" },
                { id: "c", text: "Adaptif" },
                { id: "d", text: "Harmonis" },
              ],
              correct: "c",
            },
            {
              id: "pq2",
              text: "Visi Peruri berkaitan dengan menjadi perusahaan...",
              options: [
                { id: "a", text: "Terbesar di Asia" },
                { id: "b", text: "Terpercaya dalam solusi keamanan" },
                { id: "c", text: "Paling menguntungkan" },
                { id: "d", text: "Paling banyak karyawan" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Sebagai Pro Hire, ekspektasi peran dimulai dari...",
              options: [
                { id: "a", text: "Memimpin tim besar" },
                {
                  id: "b",
                  text: "Memahami konteks bisnis dan berkontribusi aktif",
                },
                { id: "c", text: "Merekrut karyawan baru" },
                { id: "d", text: "Mengaudit laporan keuangan" },
              ],
              correct: "b",
            },
          ],
        },
        {
          id: "jm-prohire-01-02",
          title: "Bela Negara",
          deskripsi:
            "Pembekalan nilai-nilai bela negara sebagai fondasi semangat kerja di perusahaan pelat merah.",
          contentLabel: "Video & Ceramah",
          preTest: [
            {
              id: "q1",
              text: "Program Bela Negara di BUMN bertujuan untuk...",
              options: [
                { id: "a", text: "Wajib militer" },
                {
                  id: "b",
                  text: "Menumbuhkan cinta tanah air dan semangat nasionalisme",
                },
                { id: "c", text: "Menguji kemampuan fisik" },
                { id: "d", text: "Mengganti pelatihan teknis" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Wujud bela negara di tempat kerja adalah...",
              options: [
                { id: "a", text: "Bekerja dengan integritas dan dedikasi" },
                { id: "b", text: "Mengkritik pemerintah" },
                { id: "c", text: "Menghindari tanggung jawab" },
                { id: "d", text: "Mengutamakan kepentingan pribadi" },
              ],
              correct: "a",
            },
            {
              id: "q3",
              text: "Nilai nasionalisme tercermin dalam sikap...",
              options: [
                { id: "a", text: "Individualis" },
                {
                  id: "b",
                  text: "Mencintai dan memajukan produk dalam negeri",
                },
                { id: "c", text: "Pasif dalam pekerjaan" },
                { id: "d", text: "Mengutamakan produk asing" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Bela negara bagi karyawan Peruri diwujudkan dengan...",
              options: [
                { id: "a", text: "Menjaga kerahasiaan data dan aset negara" },
                { id: "b", text: "Bekerja lembur tanpa bayaran" },
                { id: "c", text: "Mengikuti demonstrasi" },
                { id: "d", text: "Menolak kebijakan perusahaan" },
              ],
              correct: "a",
            },
            {
              id: "pq2",
              text: "Sikap tepat sebagai karyawan BUMN adalah...",
              options: [
                {
                  id: "a",
                  text: "Memprioritaskan kepentingan pribadi di atas segalanya",
                },
                {
                  id: "b",
                  text: "Menjalankan tugas dengan jujur dan bertanggung jawab",
                },
                { id: "c", text: "Menghindari konflik" },
                { id: "d", text: "Mengikuti tren" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Budaya kerja baik di BUMN harus mencerminkan...",
              options: [
                { id: "a", text: "Kepentingan pejabat semata" },
                { id: "b", text: "Nilai-nilai luhur bangsa dan integritas" },
                { id: "c", text: "Gaya hidup modern" },
                { id: "d", text: "Profit maksimal" },
              ],
              correct: "b",
            },
          ],
        },
        {
          id: "jm-prohire-01-03",
          title: "Budaya AKHLAK",
          deskripsi:
            "Memahami dan menginternalisasi nilai AKHLAK dalam konteks peran supervisor & specialist.",
          contentLabel: "Workshop",
          preTest: [
            {
              id: "q1",
              text: "AKHLAK pertama kali diluncurkan pada tahun...",
              options: [
                { id: "a", text: "2018" },
                { id: "b", text: "2019" },
                { id: "c", text: "2020" },
                { id: "d", text: "2021" },
              ],
              correct: "c",
            },
            {
              id: "q2",
              text: "Sebagai supervisor, nilai 'Kolaboratif' berarti...",
              options: [
                { id: "a", text: "Bekerja mandiri saja" },
                { id: "b", text: "Membangun sinergi lintas tim dan divisi" },
                { id: "c", text: "Menghindari rapat" },
                { id: "d", text: "Mengerjakan tugas bawahan" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Nilai 'Amanah' bagi supervisor berarti...",
              options: [
                { id: "a", text: "Menjaga kepercayaan tim dan atasan" },
                { id: "b", text: "Menyimpan semua informasi" },
                { id: "c", text: "Menghindari tanggung jawab" },
                { id: "d", text: "Bekerja sendirian" },
              ],
              correct: "a",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Nilai 'Loyal' bagi Pro Hire berarti...",
              options: [
                { id: "a", text: "Tidak pernah resign" },
                {
                  id: "b",
                  text: "Mendukung keputusan perusahaan dan menjaga nama baik",
                },
                { id: "c", text: "Melakukan apapun yang diminta" },
                { id: "d", text: "Tidak pernah mengkritik" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Penerapan AKHLAK saat ada konflik tim adalah...",
              options: [
                { id: "a", text: "Menghindar" },
                {
                  id: "b",
                  text: "Menyelesaikan dengan musyawarah dan saling menghormati",
                },
                { id: "c", text: "Melaporkan ke media" },
                { id: "d", text: "Melapor ke polisi" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Karyawan yang 'Kompeten' selalu...",
              options: [
                {
                  id: "a",
                  text: "Menunjukkan hasil kerja terbaik dan terus belajar",
                },
                { id: "b", text: "Menghindari tanggung jawab" },
                { id: "c", text: "Mengandalkan junior" },
                { id: "d", text: "Tidak ikut pelatihan" },
              ],
              correct: "a",
            },
          ],
        },
      ],
    },
    {
      id: "jf-prohire-02",
      kode: "F02",
      nama: "Ekspektasi Peran & Tim",
      deadline: "18 Apr 2026",
      materi: [
        {
          id: "jm-prohire-02-01",
          title: "Pengenalan Unit Kerja",
          deskripsi:
            "Memahami struktur organisasi, kolega, dan ekspektasi peran sebagai Pro Hire di unit kerja.",
          contentLabel: "Sesi Perkenalan",
          preTest: [
            {
              id: "q1",
              text: "Langkah pertama beradaptasi di unit kerja baru adalah...",
              options: [
                { id: "a", text: "Langsung meminta naik jabatan" },
                {
                  id: "b",
                  text: "Memahami proses dan membangun relasi dengan tim",
                },
                { id: "c", text: "Mengganti semua sistem kerja" },
                { id: "d", text: "Mengkritik prosedur lama" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Line manager berperan sebagai...",
              options: [
                { id: "a", text: "Teman bermain" },
                {
                  id: "b",
                  text: "Pemberi arahan dan evaluator kinerja langsung",
                },
                { id: "c", text: "Pengganti HRD" },
                { id: "d", text: "Perwakilan serikat pekerja" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "KPI digunakan untuk...",
              options: [
                { id: "a", text: "Mengukur kehadiran" },
                {
                  id: "b",
                  text: "Mengukur pencapaian kinerja sesuai target",
                },
                { id: "c", text: "Mengatur jam kerja" },
                { id: "d", text: "Menentukan cuti" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Buddy program dalam Pro Hire bertujuan untuk...",
              options: [
                { id: "a", text: "Mengawasi karyawan baru" },
                {
                  id: "b",
                  text: "Mendampingi adaptasi dan pembelajaran awal",
                },
                { id: "c", text: "Menilai kompetensi" },
                { id: "d", text: "Mengganti mentor" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Cara terbaik menyampaikan progress ke atasan adalah...",
              options: [
                { id: "a", text: "Menunggu ditanya" },
                {
                  id: "b",
                  text: "Laporan berkala sesuai kesepakatan",
                },
                { id: "c", text: "Mengirim email setiap jam" },
                { id: "d", text: "Langsung ke direktur" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Konflik dengan rekan kerja sebaiknya diselesaikan dengan...",
              options: [
                { id: "a", text: "Diam dan menghindar" },
                {
                  id: "b",
                  text: "Diskusi langsung dan mediasi atasan jika perlu",
                },
                { id: "c", text: "Melapor ke media" },
                { id: "d", text: "Resign" },
              ],
              correct: "b",
            },
          ],
        },
        {
          id: "jm-prohire-02-02",
          title: "Self Management & Action Plan",
          deskripsi:
            "Menyusun rencana kerja 90 hari pertama dan strategi manajemen diri sebagai karyawan baru.",
          contentLabel: "Workshop & Template",
          preTest: [
            {
              id: "q1",
              text: "Rencana 90 hari pertama kerja bertujuan untuk...",
              options: [
                { id: "a", text: "Membuat jadwal liburan" },
                {
                  id: "b",
                  text: "Menetapkan prioritas adaptasi dan kontribusi awal",
                },
                { id: "c", text: "Mengatur gaji" },
                { id: "d", text: "Mencari pekerjaan lain" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Self management yang baik meliputi...",
              options: [
                { id: "a", text: "Mengabaikan deadline" },
                {
                  id: "b",
                  text: "Perencanaan waktu, prioritas, dan evaluasi diri",
                },
                { id: "c", text: "Bekerja tanpa istirahat" },
                { id: "d", text: "Mengandalkan atasan sepenuhnya" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Metode SMART dalam menetapkan target berarti...",
              options: [
                {
                  id: "a",
                  text: "Specific, Measurable, Achievable, Relevant, Time-bound",
                },
                {
                  id: "b",
                  text: "Simple, Modern, Agile, Relevant, Timely",
                },
                {
                  id: "c",
                  text: "Strategic, Meaningful, Aspirational, Relevant, Tactical",
                },
                {
                  id: "d",
                  text: "Simple, Massive, Accurate, Reliable, Transparent",
                },
              ],
              correct: "a",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Evaluasi diri secara berkala berguna untuk...",
              options: [
                { id: "a", text: "Meminta kenaikan gaji" },
                {
                  id: "b",
                  text: "Mengidentifikasi kekuatan dan area pengembangan",
                },
                { id: "c", text: "Menghindari tanggung jawab" },
                { id: "d", text: "Mengkritik atasan" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Prioritas utama di 30 hari pertama kerja adalah...",
              options: [
                { id: "a", text: "Langsung memimpin proyek besar" },
                {
                  id: "b",
                  text: "Memahami lingkungan, tim, dan proses kerja",
                },
                { id: "c", text: "Mengubah semua prosedur" },
                { id: "d", text: "Meminta transfer divisi" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Action plan yang efektif mencakup...",
              options: [
                {
                  id: "a",
                  text: "Target, timeline, dan indikator keberhasilan",
                },
                { id: "b", text: "Daftar belanja" },
                { id: "c", text: "Jadwal rapat saja" },
                { id: "d", text: "Anggaran perusahaan" },
              ],
              correct: "a",
            },
          ],
        },
      ],
    },
  ],
  "MT/Organik": [
    {
      id: "jf-mt-01",
      kode: "F01",
      nama: "Informasi Awal & Pre-Boarding",
      deadline: "06 Mei 2026",
      materi: [
        {
          id: "jm-mt-01-01",
          title: "Penyambutan & Orientasi Awal",
          deskripsi:
            "Pengenalan program MT/Organik, jadwal, dan persiapan awal sebelum program dimulai.",
          contentLabel: "Briefing",
          preTest: [
            {
              id: "q1",
              text: "Program MT (Management Trainee) dirancang untuk...",
              options: [
                { id: "a", text: "Semua karyawan kontrak" },
                { id: "b", text: "Calon pemimpin perusahaan masa depan" },
                { id: "c", text: "Tenaga outsourcing" },
                { id: "d", text: "Karyawan tetap senior" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Pre-boarding dimulai...",
              options: [
                { id: "a", text: "Setelah resign" },
                { id: "b", text: "Sebelum hari pertama kerja resmi" },
                { id: "c", text: "Di akhir program" },
                { id: "d", text: "Saat evaluasi akhir" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Tujuan program onboarding MT adalah...",
              options: [
                { id: "a", text: "Mengosongkan jadwal peserta" },
                {
                  id: "b",
                  text: "Mempersiapkan peserta menjadi pemimpin yang kompeten",
                },
                { id: "c", text: "Mengisi waktu luang" },
                { id: "d", text: "Menggantikan pelatihan teknis" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Salah satu kegiatan pre-boarding adalah...",
              options: [
                { id: "a", text: "Mengerjakan proyek besar" },
                { id: "b", text: "Pengurusan ID card dan akses gedung" },
                { id: "c", text: "Evaluasi kinerja" },
                { id: "d", text: "Presentasi hasil kerja" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Program MT biasanya berlangsung selama...",
              options: [
                { id: "a", text: "1 minggu" },
                { id: "b", text: "1 bulan" },
                { id: "c", text: "6-12 bulan" },
                { id: "d", text: "5 tahun" },
              ],
              correct: "c",
            },
            {
              id: "pq3",
              text: "Komitmen yang diperlukan dari peserta MT adalah...",
              options: [
                { id: "a", text: "Hadir sesekali" },
                { id: "b", text: "Aktif, belajar, dan berkontribusi penuh" },
                { id: "c", text: "Mengerjakan tugas minimal" },
                { id: "d", text: "Hanya lulus tes" },
              ],
              correct: "b",
            },
          ],
        },
      ],
      evaluasiLabel: "Evaluasi Fase 1",
    },
    {
      id: "jf-mt-02",
      kode: "F02",
      nama: "Program Bela Negara",
      deadline: "09 Mei 2026",
      materi: [
        {
          id: "jm-mt-02-01",
          title: "Bela Negara & Karakter Kerja",
          deskripsi:
            "Pembekalan nilai bela negara, nasionalisme, dan pembentukan karakter kerja tangguh.",
          contentLabel: "Ceramah & Kegiatan",
          preTest: [
            {
              id: "q1",
              text: "Bela negara bagi karyawan BUMN diwujudkan dalam...",
              options: [
                { id: "a", text: "Wajib militer" },
                { id: "b", text: "Dedikasi dan integritas dalam bekerja" },
                { id: "c", text: "Ikut demonstrasi" },
                { id: "d", text: "Tidak pernah absen" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Karakter kerja yang kuat mencerminkan...",
              options: [
                { id: "a", text: "Ketidakpedulian terhadap hasil" },
                {
                  id: "b",
                  text: "Disiplin, tanggung jawab, dan etos kerja tinggi",
                },
                { id: "c", text: "Gaya hidup santai" },
                { id: "d", text: "Ketergantungan pada orang lain" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Nasionalisme di tempat kerja diterapkan dengan cara...",
              options: [
                { id: "a", text: "Memprioritaskan produk luar negeri" },
                { id: "b", text: "Bangga dan memajukan produk dalam negeri" },
                { id: "c", text: "Menolak kolaborasi" },
                { id: "d", text: "Bekerja sendiri" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Pembentukan karakter kerja di Bela Negara mencakup...",
              options: [
                { id: "a", text: "Latihan fisik saja" },
                {
                  id: "b",
                  text: "Nilai moral, disiplin, dan semangat berkontribusi",
                },
                { id: "c", text: "Teori akademik" },
                { id: "d", text: "Teknologi informasi" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Semangat nasionalisme di tempat kerja salah satunya adalah...",
              options: [
                { id: "a", text: "Bekerja hanya untuk uang" },
                {
                  id: "b",
                  text: "Menjaga aset dan nama baik perusahaan negara",
                },
                { id: "c", text: "Mengkritik pemerintah di media sosial" },
                { id: "d", text: "Menghindari tugas sulit" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Bela negara mendorong karyawan bersikap...",
              options: [
                { id: "a", text: "Pasif dan menunggu perintah" },
                {
                  id: "b",
                  text: "Proaktif, jujur, dan bertanggung jawab",
                },
                { id: "c", text: "Individualistik" },
                { id: "d", text: "Kompetitif secara berlebihan" },
              ],
              correct: "b",
            },
          ],
        },
      ],
      evaluasiLabel: "Evaluasi Fase 2",
    },
    {
      id: "jf-mt-03",
      kode: "F03",
      nama: "Program Induksi / In Class Training",
      deadline: "16 Mei 2026",
      materi: [
        {
          id: "jm-mt-03-01",
          title: "Company Profile & Strategic Overview",
          deskripsi:
            "Memahami sejarah, visi misi, strategi bisnis, dan posisi Peruri di industri keamanan dokumen.",
          contentLabel: "Presentasi Direksi",
          preTest: [
            {
              id: "q1",
              text: "Apa produk utama Peruri?",
              options: [
                { id: "a", text: "Ponsel" },
                { id: "b", text: "Uang rupiah dan dokumen keamanan" },
                { id: "c", text: "Kendaraan bermotor" },
                { id: "d", text: "Perangkat lunak" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Peruri termasuk kategori BUMN...",
              options: [
                { id: "a", text: "Jasa keuangan" },
                { id: "b", text: "Industri pertahanan dan keamanan" },
                { id: "c", text: "Pertanian" },
                { id: "d", text: "Transportasi" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Strategic overview membantu karyawan memahami...",
              options: [
                { id: "a", text: "Jadwal libur nasional" },
                { id: "b", text: "Arah dan prioritas bisnis perusahaan" },
                { id: "c", text: "Daftar gaji" },
                { id: "d", text: "Lokasi gedung" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Peruri berkontribusi kepada negara melalui...",
              options: [
                { id: "a", text: "Dividen dan produk keamanan negara" },
                { id: "b", text: "Donasi sosial" },
                { id: "c", text: "Program beasiswa" },
                { id: "d", text: "Pajak saja" },
              ],
              correct: "a",
            },
            {
              id: "pq2",
              text: "Strategi bisnis Peruri saat ini berfokus pada...",
              options: [
                { id: "a", text: "Ekspansi ke retail" },
                { id: "b", text: "Digitalisasi dan solusi keamanan" },
                { id: "c", text: "Pengurangan produk" },
                { id: "d", text: "Merger dengan asing" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "MT diharapkan memahami strategic overview untuk...",
              options: [
                { id: "a", text: "Hanya lulus ujian" },
                {
                  id: "b",
                  text: "Berkontribusi selaras dengan arah perusahaan",
                },
                { id: "c", text: "Membuat kebijakan baru" },
                { id: "d", text: "Menilai kinerja direksi" },
              ],
              correct: "b",
            },
          ],
        },
        {
          id: "jm-mt-03-02",
          title: "Kebijakan Kepegawaian SDM",
          deskripsi:
            "Memahami kebijakan HRM: kontrak, kompensasi, pengembangan karir, dan kode etik karyawan MT.",
          contentLabel: "Dokumen & Penjelasan",
          preTest: [
            {
              id: "q1",
              text: "MT/Organik umumnya memiliki masa percobaan (probation) selama...",
              options: [
                { id: "a", text: "1 bulan" },
                { id: "b", text: "3 bulan" },
                { id: "c", text: "6 hingga 12 bulan" },
                { id: "d", text: "2 tahun" },
              ],
              correct: "c",
            },
            {
              id: "q2",
              text: "Penilaian kinerja karyawan MT dilakukan oleh...",
              options: [
                { id: "a", text: "Rekan kerja sesama MT" },
                { id: "b", text: "Atasan langsung dan HRD" },
                { id: "c", text: "Peserta sendiri" },
                { id: "d", text: "Pelanggan" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Jalur karir MT setelah program selesai adalah...",
              options: [
                { id: "a", text: "Langsung menjadi direktur" },
                {
                  id: "b",
                  text: "Penempatan sebagai karyawan tetap sesuai kompetensi",
                },
                { id: "c", text: "Kembali sebagai outsourcing" },
                { id: "d", text: "Mengulangi program" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Pengembangan karir MT difasilitasi melalui...",
              options: [
                { id: "a", text: "Program mentoring dan rotasi penempatan" },
                { id: "b", text: "Kenaikan gaji otomatis" },
                { id: "c", text: "Cuti panjang" },
                { id: "d", text: "Pelatihan di luar negeri wajib" },
              ],
              correct: "a",
            },
            {
              id: "pq2",
              text: "Kode etik karyawan MT melarang...",
              options: [
                { id: "a", text: "Bekerja lebih dari 8 jam" },
                {
                  id: "b",
                  text: "Konflik kepentingan dan penyalahgunaan wewenang",
                },
                { id: "c", text: "Mengikuti pelatihan" },
                { id: "d", text: "Menyampaikan ide" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Kompensasi MT mencakup...",
              options: [
                { id: "a", text: "Hanya gaji pokok" },
                {
                  id: "b",
                  text: "Gaji, tunjangan, dan fasilitas sesuai kebijakan",
                },
                { id: "c", text: "Bonus penjualan" },
                { id: "d", text: "Saham perusahaan" },
              ],
              correct: "b",
            },
          ],
        },
      ],
      evaluasiLabel: "Evaluasi Fase 3",
    },
    {
      id: "jf-mt-04",
      kode: "F04",
      nama: "On The Job Training",
      deadline: "30 Jan 2027",
      materi: [
        {
          id: "jm-mt-04-01",
          title: "Project Assignment & OJT",
          deskripsi:
            "Pelaksanaan on the job training dan project assignment di unit kerja yang ditugaskan.",
          contentLabel: "Praktik Lapangan",
          preTest: [
            {
              id: "q1",
              text: "OJT bertujuan untuk...",
              options: [
                { id: "a", text: "Menghabiskan waktu" },
                {
                  id: "b",
                  text: "Menerapkan pengetahuan secara nyata di pekerjaan",
                },
                { id: "c", text: "Mendapat sertifikat tambahan" },
                { id: "d", text: "Menggantikan atasan" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Project assignment dalam OJT adalah...",
              options: [
                { id: "a", text: "Tugas administratif biasa" },
                {
                  id: "b",
                  text: "Proyek nyata yang berkontribusi pada unit kerja",
                },
                { id: "c", text: "Tugas fiksi" },
                { id: "d", text: "Laporan bacaan" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Mentor dalam OJT berperan sebagai...",
              options: [
                { id: "a", text: "Pengganti atasan" },
                { id: "b", text: "Pembimbing dan role model di unit kerja" },
                { id: "c", text: "Evaluator eksternal" },
                { id: "d", text: "Teman bermain" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Hasil OJT dievaluasi berdasarkan...",
              options: [
                { id: "a", text: "Kehadiran saja" },
                {
                  id: "b",
                  text: "Kualitas hasil kerja, sikap, dan pencapaian target",
                },
                { id: "c", text: "Nilai ujian tertulis" },
                { id: "d", text: "Laporan mentor" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Rotasi penempatan dalam OJT bertujuan untuk...",
              options: [
                { id: "a", text: "Membingungkan peserta" },
                { id: "b", text: "Memperluas wawasan lintas fungsi" },
                { id: "c", text: "Menghindari satu unit kerja" },
                { id: "d", text: "Mengurangi biaya" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Laporan OJT harus berisi...",
              options: [
                { id: "a", text: "Cerita perjalanan pribadi" },
                {
                  id: "b",
                  text: "Dokumentasi kegiatan, pembelajaran, dan rekomendasi",
                },
                { id: "c", text: "Kritik terhadap perusahaan" },
                { id: "d", text: "Daftar pengeluaran" },
              ],
              correct: "b",
            },
          ],
        },
      ],
      evaluasiLabel: "Evaluasi Fase 4",
    },
    {
      id: "jf-mt-05",
      kode: "F05",
      nama: "Probation & Kelulusan",
      deadline: "30 Apr 2027",
      materi: [
        {
          id: "jm-mt-05-01",
          title: "Evaluasi Probation",
          deskripsi:
            "Penilaian akhir masa percobaan: review kinerja, kompetensi, dan kesiapan sebagai karyawan tetap.",
          contentLabel: "Presentasi & Review",
          preTest: [
            {
              id: "q1",
              text: "Masa probation merupakan periode untuk...",
              options: [
                { id: "a", text: "Liburan" },
                {
                  id: "b",
                  text: "Penilaian kesiapan menjadi karyawan tetap",
                },
                { id: "c", text: "Mengikuti pelatihan eksternal" },
                { id: "d", text: "Melamar kerja di tempat lain" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Evaluasi akhir probation dilakukan oleh...",
              options: [
                { id: "a", text: "Peserta sendiri" },
                { id: "b", text: "HRD dan atasan langsung" },
                { id: "c", text: "Rekan kerja sesama MT" },
                { id: "d", text: "Klien eksternal" },
              ],
              correct: "b",
            },
            {
              id: "q3",
              text: "Karyawan yang lulus probation akan mendapatkan...",
              options: [
                { id: "a", text: "Bonus langsung" },
                { id: "b", text: "Status karyawan tetap" },
                { id: "c", text: "Promosi jabatan" },
                { id: "d", text: "Cuti panjang" },
              ],
              correct: "b",
            },
          ],
          postTest: [
            {
              id: "pq1",
              text: "Sertifikat program MT diberikan kepada peserta yang...",
              options: [
                { id: "a", text: "Hadir minimal 50%" },
                {
                  id: "b",
                  text: "Menyelesaikan seluruh tahapan dan lulus evaluasi",
                },
                { id: "c", text: "Membayar biaya" },
                { id: "d", text: "Paling senior" },
              ],
              correct: "b",
            },
            {
              id: "pq2",
              text: "Feedback 360 derajat dalam evaluasi probation melibatkan...",
              options: [
                { id: "a", text: "Hanya atasan" },
                {
                  id: "b",
                  text: "Atasan, rekan, dan bawahan (jika ada)",
                },
                { id: "c", text: "Keluarga" },
                { id: "d", text: "Klien luar" },
              ],
              correct: "b",
            },
            {
              id: "pq3",
              text: "Setelah lulus probation, MT ditempatkan berdasarkan...",
              options: [
                { id: "a", text: "Pilihan sendiri bebas" },
                {
                  id: "b",
                  text: "Hasil evaluasi, kompetensi, dan kebutuhan perusahaan",
                },
                { id: "c", text: "Urutan alphabet" },
                { id: "d", text: "Nilai IPK" },
              ],
              correct: "b",
            },
          ],
        },
      ],
      evaluasiLabel: "Evaluasi Fase 5",
    },
  ],
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

// Courses catalog — mirrors seed data from Courses (classes-page.tsx)
// Used for picking materi when assigning to a fase
const COURSES_CATALOG = [
  {
    id: "cls-01",
    fullname: "PKWT April 2026",
    kategori: "Onboarding",
    preTest: true,
    postTest: true,
  },
  {
    id: "cls-02",
    fullname: "PKWT Maret 2026",
    kategori: "Onboarding",
    preTest: true,
    postTest: true,
  },
  {
    id: "cls-03",
    fullname: "PKWT Februari 2026",
    kategori: "Onboarding",
    preTest: true,
    postTest: false,
  },
  {
    id: "cls-04",
    fullname: "PKWT Mei 2026",
    kategori: "Onboarding",
    preTest: false,
    postTest: false,
  },
  {
    id: "cls-05",
    fullname: "PKWT Juni 2026",
    kategori: "Onboarding",
    preTest: false,
    postTest: false,
  },
  {
    id: "cls-06",
    fullname: "Pro Hire April 2026",
    kategori: "Onboarding",
    preTest: true,
    postTest: true,
  },
  {
    id: "cls-07",
    fullname: "Pro Hire Maret 2026",
    kategori: "Onboarding",
    preTest: true,
    postTest: true,
  },
  {
    id: "cls-08",
    fullname: "Pro Hire Mei 2026",
    kategori: "Onboarding",
    preTest: false,
    postTest: false,
  },
  {
    id: "cls-09",
    fullname: "Pro Hire Juni 2026",
    kategori: "Onboarding",
    preTest: false,
    postTest: false,
  },
  {
    id: "cls-10",
    fullname: "Dasar Kepatuhan & Hukum Korporat",
    kategori: "LMS",
    preTest: true,
    postTest: false,
  },
  {
    id: "cls-11",
    fullname: "Manajemen Keuangan untuk Pimpinan",
    kategori: "LMS",
    preTest: false,
    postTest: false,
  },
]

const MASTER_FASE_OPTIONS = [
  { kode: "F01", nama: "Orientasi & Pengenalan" },
  { kode: "F02", nama: "Pembelajaran Teknis" },
  { kode: "F03", nama: "Coaching & Mentoring" },
  { kode: "F04", nama: "Project & Implementasi" },
  { kode: "F05", nama: "Evaluasi & Graduation" },
]

const EVALUASI_OPTIONS = [
  "Evaluasi Orientasi",
  "Evaluasi Teknis",
  "Evaluasi Coaching",
  "Evaluasi Project",
  "Evaluasi Kelulusan",
]

const initialClassFase: ClassFaseEntry[] = [
  {
    id: "cf-01",
    batchId: "batch-pkwt-apr",
    faseKode: "F01",
    faseNama: "Orientasi & Pengenalan",
    urutan: 1,
    materi: ["Pengenalan Perusahaan", "Budaya AKHLAK", "Kebijakan SDM"],
    evaluasi: "Evaluasi Orientasi",
  },
  {
    id: "cf-02",
    batchId: "batch-pkwt-apr",
    faseKode: "F02",
    faseNama: "Pembelajaran Teknis",
    urutan: 2,
    materi: ["Pengenalan Sistem Kerja", "SOP Unit Kerja"],
    evaluasi: "",
  },
  {
    id: "cf-03",
    batchId: "batch-prohire-apr",
    faseKode: "F01",
    faseNama: "Orientasi & Pengenalan",
    urutan: 1,
    materi: ["Pengenalan Perusahaan", "Bela Negara", "Budaya AKHLAK"],
    evaluasi: "Evaluasi Orientasi",
  },
]

const initialClassMentees: ClassMenteeEntry[] = [
  {
    id: "cm-01",
    batchId: "batch-pkwt-apr",
    nama: "Ayu Pratiwi",
    nomorPokok: "12345",
    jabatan: "PKWT",
    mentor: "",
  },
  {
    id: "cm-02",
    batchId: "batch-pkwt-apr",
    nama: "Budi Santoso",
    nomorPokok: "12346",
    jabatan: "PKWT",
    mentor: "",
  },
  {
    id: "cm-03",
    batchId: "batch-pkwt-apr",
    nama: "Citra Dewi",
    nomorPokok: "12347",
    jabatan: "PKWT",
    mentor: "",
  },
  {
    id: "cm-04",
    batchId: "batch-prohire-apr",
    nama: "Dani Wijaya",
    nomorPokok: "23001",
    jabatan: "Pro Hire",
    mentor: "",
  },
  {
    id: "cm-05",
    batchId: "batch-prohire-apr",
    nama: "Eka Rahayu",
    nomorPokok: "23002",
    jabatan: "Pro Hire",
    mentor: "",
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
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)

  const triggerLabel = !selectedLabels.length
    ? emptyText
    : selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels.length} dipilih`

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
      <label className="mb-1 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between rounded-2xl border border-input bg-background px-4 py-3 text-left text-sm shadow-sm transition",
          open && "border-primary ring-2 ring-primary/10"
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "truncate pr-3",
            !value.length && "text-muted-foreground"
          )}
        >
          {triggerLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-background shadow-xl">
          <button
            type="button"
            onClick={toggleAll}
            className="flex w-full items-center justify-between border-b px-4 py-3 text-left text-sm hover:bg-muted/50"
          >
            <span>Pilih Semua</span>
            <Check
              className={cn(
                "size-4 text-primary transition-opacity",
                allSelected ? "opacity-100" : "opacity-0"
              )}
            />
          </button>

          {options.length ? (
            <div className="max-h-64 overflow-y-auto py-1">
              {options.map((option) => {
                const checked = value.includes(option.value)

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted/50"
                  >
                    <span className="truncate">{option.label}</span>
                    <Check
                      className={cn(
                        "size-4 shrink-0 text-primary transition-opacity",
                        checked ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Belum ada data tersedia.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function SingleSelectField({
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
  value: string
  onChange: (next: string) => void
  emptyText: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedOption = options.find((option) => option.value === value)

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

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between rounded-2xl border border-input bg-background px-4 py-3 text-left text-sm shadow-sm transition",
          open && "border-primary ring-2 ring-primary/10"
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "truncate pr-3",
            !selectedOption && "text-muted-foreground"
          )}
        >
          {selectedOption?.label ?? emptyText}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-background shadow-xl">
          <div className="max-h-64 overflow-y-auto py-1">
            {options.length ? (
              options.map((option) => {
                const checked = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted/50"
                  >
                    <span className="truncate">{option.label}</span>
                    <Check
                      className={cn(
                        "size-4 shrink-0 text-primary transition-opacity",
                        checked ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Belum ada data tersedia.
              </div>
            )}
          </div>
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
      ? requestedSection === "journey-detail" ||
        requestedSection === "quiz-summary"
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

    const s = nextParams.get("section")
    const allowedSection =
      s === "journey-detail" || s === "quiz-summary" ? s : "overview"

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

    if (nextParams.get("section") === "overview") {
      for (const key of [
        "journey",
        "step",
        "fase",
        "materi",
        "mview",
        "quiz",
      ]) {
        if (nextParams.has(key)) {
          nextParams.delete(key)
          hasChanges = true
        }
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
  const [batchSearch, setBatchSearch] = useState("")
  const [batchShowEntries, setBatchShowEntries] = useState(20)
  const [formShortname, setFormShortname] = useState("")
  const [formVisible, setFormVisible] = useState<"PUBLISH" | "DRAFT">("PUBLISH")
  const [formKategoriTrack, setFormKategoriTrack] = useState<ClassTrack | "">(
    ""
  )

  // ── Class detail: Fase & Mentee ──────────────────────────────────────────
  const [settingTab, setSettingTab] = useState<"fase" | "mentee">("fase")
  const [classFase, setClassFase] = useState<ClassFaseEntry[]>(initialClassFase)
  const [classMentees, setClassMentees] =
    useState<ClassMenteeEntry[]>(initialClassMentees)
  // Fase form
  const [showFaseForm, setShowFaseForm] = useState(false)
  const [editingFaseId, setEditingFaseId] = useState<string | null>(null)
  const [faseFormKode, setFaseFormKode] = useState("")
  const [faseFormMateri, setFaseFormMateri] = useState<string[]>([])

  const [faseFormEvaluasi, setFaseFormEvaluasi] = useState("")

  // ── Participant journey fase/materi state ──────────────────────────────────
  // activeFaseId / activeMateriId: currently focused pane in journey-detail
  const [activeFaseId, setActiveFaseId] = useState<string | null>(null)
  const [activeMateriId, setActiveMateriId] = useState<string | null>(null)
  // view inside a materi: "pre-test" | "content" | "post-test"
  const [activeMateriView, setActiveMateriView] = useState<
    "pre-test" | "content" | "post-test"
  >("pre-test")
  const journeyDeepLinkAppliedKey = useRef<string | null>(null)

  useEffect(() => {
    if (activeSection !== "journey-detail") {
      journeyDeepLinkAppliedKey.current = null
      return
    }
    const fp = searchParams.get("fase")
    const mp = searchParams.get("materi")
    const vp = searchParams.get("mview")
    if (!fp || !mp) return

    const key = `${fp}|${mp}|${vp ?? ""}`
    if (journeyDeepLinkAppliedKey.current === key) return
    journeyDeepLinkAppliedKey.current = key

    setActiveFaseId(fp)
    setActiveMateriId(mp)
    if (vp === "content" || vp === "pre-test" || vp === "post-test") {
      setActiveMateriView(vp)
    }

    const next = new URLSearchParams(searchParams)
    next.delete("fase")
    next.delete("materi")
    next.delete("mview")
    setSearchParams(next, { replace: true })
  }, [activeSection, searchParams, setSearchParams])

  // quizAnswers keyed as `${batchId}__${materiId}__${type}__${questionId}`
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  // submitted flag keyed as `${batchId}__${materiId}__pre` or `__post`
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>(
    {}
  )
  /** Riwayat post test sebelum klik Ulangi; key = `${batchId}__${materiId}__post` */
  const [postQuizHistory, setPostQuizHistory] = useState<
    Record<string, PostQuizAttemptRecord[]>
  >({})
  // content viewed flag keyed as `${batchId}__${materiId}__content`
  const [contentViewed, setContentViewed] = useState<Record<string, boolean>>(
    {}
  )
  // per-fase evaluasi for MT (keyed `${batchId}__${faseId}`)
  const [faseEvalRatings, setFaseEvalRatings] = useState<
    Record<string, number>
  >({})
  const [faseEvalSubmitted, setFaseEvalSubmitted] = useState<
    Record<string, boolean>
  >({})
  /** Kuesioner evaluasi feedback per materi ujung fase: `${batchId}__${materiId}` */
  const [faseEvalFeedbackDone, setFaseEvalFeedbackDone] = useState<
    Record<string, boolean>
  >({})
  // Mentee form
  const [showMenteeForm, setShowMenteeForm] = useState(false)
  const [editingMenteeId, setEditingMenteeId] = useState<string | null>(null)
  const [menteeFormNama, setMenteeFormNama] = useState("")
  const [menteeFormNomor, setMenteeFormNomor] = useState("")
  const [menteeFormJabatan, setMenteeFormJabatan] = useState("")
  const [menteeFormMentor, setMenteeFormMentor] = useState("")

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
    const batchFase = classFase
      .filter((f) => f.batchId === activeBatchId)
      .sort((a, b) => a.urutan - b.urutan)
    const batchMentees = classMentees.filter((m) => m.batchId === activeBatchId)
    const needsMentor = selectedBatch?.track === "MT/Organik"

    function openAddFase() {
      setEditingFaseId(null)
      setFaseFormKode(MASTER_FASE_OPTIONS[0]?.kode ?? "")
      setFaseFormMateri([])
      setFaseFormEvaluasi("")
      setShowFaseForm(true)
    }
    function openEditFase(entry: ClassFaseEntry) {
      setEditingFaseId(entry.id)
      setFaseFormKode(entry.faseKode)
      setFaseFormMateri([...entry.materi])
      setFaseFormEvaluasi(entry.evaluasi)
      setShowFaseForm(true)
    }
    function saveFase() {
      if (!faseFormKode) return
      const faseMeta = MASTER_FASE_OPTIONS.find((f) => f.kode === faseFormKode)
      if (!faseMeta) return
      const urutan = editingFaseId
        ? (batchFase.find((f) => f.id === editingFaseId)?.urutan ??
          batchFase.length + 1)
        : batchFase.length + 1
      const entry: ClassFaseEntry = {
        id: editingFaseId ?? `cf-${classFase.length + 1}-${activeBatchId}`,
        batchId: activeBatchId,
        faseKode: faseMeta.kode,
        faseNama: faseMeta.nama,
        urutan,
        materi: faseFormMateri,
        evaluasi: faseFormEvaluasi,
      }
      setClassFase((prev) =>
        editingFaseId
          ? prev.map((f) => (f.id === editingFaseId ? entry : f))
          : [...prev, entry]
      )
      setShowFaseForm(false)
    }
    function openAddMentee() {
      setEditingMenteeId(null)
      setMenteeFormNama("")
      setMenteeFormNomor("")
      setMenteeFormJabatan(selectedBatch?.track ?? "")
      setMenteeFormMentor("")
      setShowMenteeForm(true)
    }
    function openEditMentee(m: ClassMenteeEntry) {
      setEditingMenteeId(m.id)
      setMenteeFormNama(m.nama)
      setMenteeFormNomor(m.nomorPokok)
      setMenteeFormJabatan(m.jabatan)
      setMenteeFormMentor(m.mentor)
      setShowMenteeForm(true)
    }
    function saveMentee() {
      if (!menteeFormNama.trim()) return
      const entry: ClassMenteeEntry = {
        id: editingMenteeId ?? `cm-${classMentees.length + 1}-${activeBatchId}`,
        batchId: activeBatchId,
        nama: menteeFormNama.trim(),
        nomorPokok: menteeFormNomor.trim(),
        jabatan: menteeFormJabatan.trim(),
        mentor: menteeFormMentor.trim(),
      }
      setClassMentees((prev) =>
        editingMenteeId
          ? prev.map((m) => (m.id === editingMenteeId ? entry : m))
          : [...prev, entry]
      )
      setShowMenteeForm(false)
    }

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                Detail Class
              </p>
              <h2 className="mt-0.5 text-xl font-semibold">
                {selectedBatch?.name ?? "Class"}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {selectedBatch?.track} · {selectedBatch?.period}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/class?section=batch-list">← Kembali ke Classes</Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-fit gap-1 rounded-xl border bg-muted p-1">
          {(["fase", "mentee"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSettingTab(tab)}
              className={cn(
                "rounded-lg px-5 py-1.5 text-sm font-medium transition",
                settingTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "fase" ? "Fase & Materi" : "Mentee"}
            </button>
          ))}
        </div>

        {/* ── FASE TAB ── */}
        {settingTab === "fase" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Assign fase dari Master Fase ke class ini. Setiap fase dapat
                memiliki materi dan evaluasi.
              </p>
              <Button type="button" size="sm" onClick={openAddFase}>
                <Plus className="size-4" />
                Tambah Fase
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[linear-gradient(90deg,#1d4ed8,#4338ca,#7c3aed)] text-white">
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Kode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Nama Fase
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Materi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Evaluasi
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                        <Settings2 className="mx-auto size-4" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {batchFase.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Belum ada fase. Klik "Tambah Fase" untuk menambahkan.
                        </td>
                      </tr>
                    ) : (
                      batchFase.map((f, i) => (
                        <tr
                          key={f.id}
                          className={cn(
                            "transition hover:bg-muted/40",
                            i % 2 === 0 ? "bg-background" : "bg-muted/20"
                          )}
                        >
                          <td className="px-4 py-3.5 font-medium text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                              {f.faseKode}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-medium">
                            {f.faseNama}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {f.materi.length === 0 ? (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              ) : (
                                f.materi.map((m) => (
                                  <span
                                    key={m}
                                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                                  >
                                    {m}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {f.evaluasi ? (
                              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                                {f.evaluasi}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditFase(f)}
                                className="cursor-pointer text-muted-foreground transition hover:text-primary"
                              >
                                <PencilLine className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setClassFase((prev) =>
                                    prev.filter((x) => x.id !== f.id)
                                  )
                                }
                                className="cursor-pointer text-muted-foreground transition hover:text-red-500"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fase Modal */}
            {showFaseForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
                <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
                  <h3 className="mb-4 text-lg font-semibold">
                    {editingFaseId ? "Edit Fase" : "Tambah Fase"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Fase <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={faseFormKode}
                        onChange={(e) => setFaseFormKode(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      >
                        <option value="">Pilih fase...</option>
                        {MASTER_FASE_OPTIONS.map((opt) => (
                          <option key={opt.kode} value={opt.kode}>
                            {opt.kode} — {opt.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Materi (pilih dari Courses)
                      </label>
                      <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
                        {COURSES_CATALOG.map((course) => {
                          const checked = faseFormMateri.includes(
                            course.fullname
                          )
                          return (
                            <label
                              key={course.id}
                              className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 shrink-0"
                                checked={checked}
                                onChange={() =>
                                  setFaseFormMateri((prev) =>
                                    checked
                                      ? prev.filter(
                                          (x) => x !== course.fullname
                                        )
                                      : [...prev, course.fullname]
                                  )
                                }
                              />
                              <span className="flex-1">
                                {course.fullname}
                                <span className="ml-1.5 text-[10px] text-muted-foreground">
                                  [{course.kategori}]
                                </span>
                                {course.preTest && (
                                  <span className="ml-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                                    Pre
                                  </span>
                                )}
                                {course.postTest && (
                                  <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                                    Post
                                  </span>
                                )}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                      {faseFormMateri.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {faseFormMateri.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                              {m}
                              <button
                                type="button"
                                onClick={() =>
                                  setFaseFormMateri((prev) =>
                                    prev.filter((x) => x !== m)
                                  )
                                }
                                className="hover:text-red-500"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Centang course yang menjadi materi di fase ini.
                        Konfigurasi pre/post test per course diatur di menu
                        Courses.
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Evaluasi
                      </label>
                      <select
                        value={faseFormEvaluasi}
                        onChange={(e) => setFaseFormEvaluasi(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      >
                        <option value="">Tidak ada evaluasi</option>
                        {EVALUASI_OPTIONS.map((ev) => (
                          <option key={ev} value={ev}>
                            {ev}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowFaseForm(false)}
                    >
                      Batal
                    </Button>
                    <Button type="button" onClick={saveFase}>
                      Simpan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── MENTEE TAB ── */}
        {settingTab === "mentee" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Kelola daftar mentee pada class ini.
                {!needsMentor && (
                  <span className="ml-1 text-xs text-amber-600">
                    (PKWT & Pro Hire tidak perlu assign mentor)
                  </span>
                )}
              </p>
              <Button type="button" size="sm" onClick={openAddMentee}>
                <Plus className="size-4" />
                Tambah Mentee
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[linear-gradient(90deg,#1d4ed8,#4338ca,#7c3aed)] text-white">
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Nomor Pokok
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Jabatan
                      </th>
                      {needsMentor && (
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                          Mentor
                        </th>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                        <Settings2 className="mx-auto size-4" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {batchMentees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={needsMentor ? 6 : 5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Belum ada mentee. Klik "Tambah Mentee" untuk
                          menambahkan.
                        </td>
                      </tr>
                    ) : (
                      batchMentees.map((m, i) => (
                        <tr
                          key={m.id}
                          className={cn(
                            "transition hover:bg-muted/40",
                            i % 2 === 0 ? "bg-background" : "bg-muted/20"
                          )}
                        >
                          <td className="px-4 py-3.5 font-medium text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3.5 font-medium">{m.nama}</td>
                          <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                            {m.nomorPokok || "—"}
                          </td>
                          <td className="px-4 py-3.5">{m.jabatan || "—"}</td>
                          {needsMentor && (
                            <td className="px-4 py-3.5">
                              {m.mentor ? (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                  {m.mentor}
                                </span>
                              ) : (
                                <span className="text-xs text-amber-500">
                                  Belum assign
                                </span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditMentee(m)}
                                className="cursor-pointer text-muted-foreground transition hover:text-primary"
                              >
                                <PencilLine className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setClassMentees((prev) =>
                                    prev.filter((x) => x.id !== m.id)
                                  )
                                }
                                className="cursor-pointer text-muted-foreground transition hover:text-red-500"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Menampilkan {batchMentees.length} mentee
            </p>

            {/* Mentee Modal */}
            {showMenteeForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
                <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
                  <h3 className="mb-4 text-lg font-semibold">
                    {editingMenteeId ? "Edit Mentee" : "Tambah Mentee"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Nama <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={menteeFormNama}
                        onChange={(e) => setMenteeFormNama(e.target.value)}
                        placeholder="Nama lengkap mentee"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Nomor Pokok
                        </label>
                        <Input
                          value={menteeFormNomor}
                          onChange={(e) => setMenteeFormNomor(e.target.value)}
                          placeholder="12345"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Jabatan
                        </label>
                        <Input
                          value={menteeFormJabatan}
                          onChange={(e) => setMenteeFormJabatan(e.target.value)}
                          placeholder="PKWT / Pro Hire / MT"
                        />
                      </div>
                    </div>
                    {needsMentor && (
                      <div>
                        <SingleSelectField
                          id="assign-mentor"
                          label="Assign Mentor"
                          value={menteeFormMentor}
                          onChange={setMenteeFormMentor}
                          emptyText="Pilih mentor"
                          options={mentorRecords
                            .filter((mr) => mr.role === "Mentor")
                            .map((mr) => ({
                              value: mr.name,
                              label: mr.name,
                            }))}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowMenteeForm(false)}
                    >
                      Batal
                    </Button>
                    <Button type="button" onClick={saveMentee}>
                      Simpan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    )
  }

  const isCatalogPage = activeSection === "catalog"
  const isCatalogDetailPage = activeSection === "catalog-detail"
  const isQuizSummaryPage = activeSection === "quiz-summary"
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
              <div className="w-full md:max-w-90">
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
                <div className="w-full md:max-w-65">
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
      ) : isQuizSummaryPage ? (
        <section className="space-y-5">
          {(() => {
            const qJourney = searchParams.get("journey") ?? ""
            const qFase = searchParams.get("fase") ?? ""
            const qMateri = searchParams.get("materi") ?? ""
            const qQuizRaw = searchParams.get("quiz") ?? ""
            const qType: "pre" | "post" | null =
              qQuizRaw === "pre" || qQuizRaw === "post" ? qQuizRaw : null
            const summaryBatch = batches.find((b) => b.id === qJourney)
            const jTrackSum = summaryBatch?.track
            const journeyFasesSum = jTrackSum
              ? appendEvaluasiMateriToFases(
                  JOURNEY_FASES_BY_TRACK[jTrackSum] ?? []
                )
              : []
            const curFaseSum = journeyFasesSum.find((f) => f.id === qFase)
            const curMateriSum =
              curFaseSum?.materi.find((m) => m.id === qMateri) ?? null
            const trimQsSum = (qs: JQuizQuestion[]) => {
              if (
                permissions.key !== "participant" ||
                !assignedTrackQuery ||
                qs.length <= ONBOARDING_PARTICIPANT_QUIZ_CAP
              ) {
                return qs
              }
              return qs.slice(0, ONBOARDING_PARTICIPANT_QUIZ_CAP)
            }
            const quizSourceSum = curMateriSum
              ? curMateriSum.preTest.length > 0
                ? curMateriSum.preTest
                : curMateriSum.postTest
              : []
            const qsSum =
              summaryBatch && curMateriSum
                ? trimQsSum(
                    shuffleJourneyQuiz(
                      quizSourceSum,
                      `${summaryBatch.id}${curMateriSum.id}quiz`
                    )
                  )
                : []
            const aqKeySum = (type: "pre" | "post", qid: string) =>
              `${summaryBatch?.id ?? ""}__${qMateri}__${type}__${qid}`
            const scoreSum =
              summaryBatch && curMateriSum && qType
                ? qsSum.filter(
                    (q) => quizAnswers[aqKeySum(qType, q.id)] === q.correct
                  ).length
                : 0
            const totalSum = qsSum.length
            const percentSum =
              totalSum > 0 ? Math.round((scoreSum / totalSum) * 100) : 0
            const passSum =
              totalSum > 0 && scoreSum >= Math.ceil(totalSum * 0.7)
            const canRetakeSum = jTrackSum !== "MT/Organik" && qType === "post"

            if (
              !summaryBatch ||
              !curMateriSum ||
              !qType ||
              !qFase ||
              !qMateri
            ) {
              return (
                <div className="rounded-xl border border-dashed bg-card p-8 text-center shadow-sm">
                  <p className="font-medium text-foreground">
                    Ringkasan tes tidak tersedia.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Parameter journey atau materi tidak lengkap.
                  </p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link
                      to={`/class?track=${toTrackQuery(activeTrack)}&section=overview`}
                    >
                      Kembali ke class
                    </Link>
                  </Button>
                </div>
              )
            }

            const batchIdSum = summaryBatch.id
            const postKeySum = `${batchIdSum}__${qMateri}__post`

            return (
              <>
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                    Hasil tes
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {qType === "pre" ? "Pre Test" : "Post Test"} —{" "}
                    {curMateriSum.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ringkasan jawaban Anda untuk presentasi dan arsip progres.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-8 shadow-sm">
                  <div
                    className={cn(
                      "mb-6 flex flex-col gap-2 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
                      passSum
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {passSum ? (
                        <Check className="size-6 shrink-0 text-emerald-600" />
                      ) : (
                        <CircleX className="size-6 shrink-0 text-amber-700" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Jawaban benar: {scoreSum} dari {totalSum} soal
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Nilai: <strong>{percentSum}%</strong>
                          {totalSum > 0
                            ? ` (${scoreSum}/${totalSum} benar)`
                            : null}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-sm font-semibold",
                        passSum ? "text-emerald-800" : "text-amber-800"
                      )}
                    >
                      {passSum ? "Lulus" : "Tidak lulus"}
                    </p>
                  </div>

                  {qType === "post" &&
                  (postQuizHistory[postKeySum]?.length ?? 0) > 0 ? (
                    <div className="mb-6 rounded-xl border bg-muted/30 px-4 py-4">
                      <p className="text-sm font-semibold text-foreground">
                        Riwayat percobaan sebelumnya
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Tercatat setiap kali Anda mengulang post test (tanggal &
                        waktu perangkat).
                      </p>
                      <ul className="mt-3 divide-y divide-border rounded-lg border bg-background">
                        {[...(postQuizHistory[postKeySum] ?? [])]
                          .reverse()
                          .map((row, idx) => {
                            const rowPass =
                              row.total > 0 &&
                              row.score >= Math.ceil(row.total * 0.7)
                            return (
                              <li
                                key={`${row.at}-${idx}`}
                                className="flex flex-col gap-1 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                              >
                                <span className="text-muted-foreground">
                                  {formatQuizAttemptDate(row.at)}
                                </span>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
                                  <span className="font-medium tabular-nums text-foreground">
                                    {row.score}/{row.total} benar —{" "}
                                    {row.percent}%
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                                      rowPass
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-900"
                                    )}
                                  >
                                    {rowPass ? "Lulus" : "Tidak lulus"}
                                  </span>
                                </div>
                              </li>
                            )
                          })}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {qType === "pre" ? (
                      <Button
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams()
                          next.set("track", toTrackQuery(summaryBatch.track))
                          next.set("section", "journey-detail")
                          next.set("journey", summaryBatch.id)
                          next.set("fase", qFase)
                          next.set("materi", qMateri)
                          next.set("mview", "content")
                          setSearchParams(next, { replace: true })
                        }}
                      >
                        Lanjut ke Materi
                      </Button>
                    ) : (
                      <>
                        {passSum ? (
                          <Button
                            type="button"
                            className="gap-2"
                            onClick={() => {
                              setActiveMateriId(null)
                              setActiveFaseId(null)
                              const next = new URLSearchParams()
                              next.set(
                                "track",
                                toTrackQuery(summaryBatch.track)
                              )
                              next.set("section", "journey-detail")
                              next.set("journey", summaryBatch.id)
                              setSearchParams(next, { replace: true })
                            }}
                          >
                            Lanjut ke proses selanjutnya
                            <ArrowRight className="size-4" />
                          </Button>
                        ) : null}
                        {canRetakeSum ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const record: PostQuizAttemptRecord = {
                                at: new Date().toISOString(),
                                score: scoreSum,
                                total: totalSum,
                                percent: percentSum,
                              }
                              setPostQuizHistory((prev) => ({
                                ...prev,
                                [postKeySum]: [
                                  ...(prev[postKeySum] ?? []),
                                  record,
                                ],
                              }))
                              setQuizSubmitted((prev) => ({
                                ...prev,
                                [postKeySum]: false,
                              }))
                              setQuizAnswers((prev) => {
                                const next = { ...prev }
                                for (const q of qsSum) {
                                  delete next[
                                    `${batchIdSum}__${qMateri}__post__${q.id}`
                                  ]
                                }
                                return next
                              })
                              const next = new URLSearchParams()
                              next.set(
                                "track",
                                toTrackQuery(summaryBatch.track)
                              )
                              next.set("section", "journey-detail")
                              next.set("journey", summaryBatch.id)
                              next.set("fase", qFase)
                              next.set("materi", qMateri)
                              next.set("mview", "post-test")
                              setSearchParams(next, { replace: true })
                            }}
                          >
                            Ulangi Test
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setActiveMateriId(null)
                            setActiveFaseId(null)
                            const next = new URLSearchParams()
                            next.set("track", toTrackQuery(summaryBatch.track))
                            next.set("section", "journey-detail")
                            next.set("journey", summaryBatch.id)
                            setSearchParams(next, { replace: true })
                          }}
                        >
                          Kembali ke Daftar Fase
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )
          })()}
        </section>
      ) : isJourneyDetailPage ? (
        <section className="space-y-5">
          {/* Back / breadcrumb */}
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
                  Selesaikan setiap fase secara berurutan. Per materi: Pre Test →
                  Materi → Post Test. Di ujung fase, isi{" "}
                  <strong>Evaluasi</strong> (umpan balik, tanpa tes).
                </p>
              </div>
              <Button asChild variant="outline">
                <Link
                  to={`/class?track=${toTrackQuery(selectedJourneyBatch?.track ?? activeTrack)}&section=catalog-detail${selectedJourneyBatch ? `&journey=${selectedJourneyBatch.id}` : ""}`}
                >
                  Kembali ke class
                </Link>
              </Button>
            </div>
          </div>

          {selectedJourneyBatch ? (
            (() => {
              const jBatch = selectedJourneyBatch
              const jTrack = jBatch.track
              const journeyFases = appendEvaluasiMateriToFases(
                JOURNEY_FASES_BY_TRACK[jTrack] ?? []
              )
              const batchId = jBatch.id
              const canRetake = jTrack !== "MT/Organik"

              const preKey = (mid: string) => `${batchId}__${mid}__pre`
              const postKey = (mid: string) => `${batchId}__${mid}__post`
              const ctKey = (mid: string) => `${batchId}__${mid}__content`
              const aqKey = (mid: string, type: "pre" | "post", qid: string) =>
                `${batchId}__${mid}__${type}__${qid}`

              const isPreDone = (mid: string) =>
                quizSubmitted[preKey(mid)] ?? false
              const isCDone = (mid: string) =>
                contentViewed[ctKey(mid)] ?? false
              const isPostDone = (mid: string) =>
                quizSubmitted[postKey(mid)] ?? false
              const faseEvalFeedbackKey = (mid: string) => `${batchId}__${mid}`
              const isMDone = (mid: string) => {
                if (mid.endsWith("__m-evaluasi")) {
                  return faseEvalFeedbackDone[faseEvalFeedbackKey(mid)] ?? false
                }
                return isPreDone(mid) && isCDone(mid) && isPostDone(mid)
              }
              const isFDone = (fase: JFase) =>
                fase.materi.every((m) => isMDone(m.id))
              const isFLocked = (idx: number) =>
                idx > 0 && !isFDone(journeyFases[idx - 1])

              const totalM = journeyFases.reduce(
                (a, f) => a + f.materi.length,
                0
              )
              const doneM = journeyFases.reduce(
                (a, f) => a + f.materi.filter((m) => isMDone(m.id)).length,
                0
              )
              const jProgress =
                totalM > 0 ? Math.round((doneM / totalM) * 100) : 0
              const jComplete =
                journeyFases.length > 0 && journeyFases.every(isFDone)

              const curFase =
                journeyFases.find((f) => f.id === activeFaseId) ?? null
              const curMateri =
                curFase?.materi.find((m) => m.id === activeMateriId) ?? null

              const trimQsForOnboardingParticipant = (qs: JQuizQuestion[]) => {
                if (
                  permissions.key !== "participant" ||
                  !assignedTrackQuery ||
                  qs.length <= ONBOARDING_PARTICIPANT_QUIZ_CAP
                ) {
                  return qs
                }
                return qs.slice(0, ONBOARDING_PARTICIPANT_QUIZ_CAP)
              }

              // Pre & post memakai bank soal yang sama (urutan konsisten); ulang hanya untuk post test.
              const quizSource = curMateri
                ? curMateri.preTest.length > 0
                  ? curMateri.preTest
                  : curMateri.postTest
                : []
              const preQs = curMateri
                ? trimQsForOnboardingParticipant(
                    shuffleJourneyQuiz(
                      quizSource,
                      `${batchId}${curMateri.id}quiz`
                    )
                  )
                : []
              const postQs = preQs

              const participants = buildBatchMentees(jBatch)

              const renderQuiz = (
                qs: JQuizQuestion[],
                type: "pre" | "post",
                mid: string,
                submitted: boolean,
                faseId: string
              ) => {
                const allowRetake = type === "post" && canRetake
                return (
                  <div className="space-y-4">
                    <ol className="space-y-4">
                      {qs.map((q, qi) => {
                        const chosen = quizAnswers[aqKey(mid, type, q.id)]
                        return (
                          <li key={q.id}>
                            <p className="mb-2 text-sm font-medium">
                              {qi + 1}. {q.text}
                            </p>
                            <div className="space-y-1.5">
                              {q.options.map((opt) => {
                                const isChosen = chosen === opt.id
                                return (
                                  <label
                                    key={opt.id}
                                    className={cn(
                                      "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition",
                                      submitted
                                        ? isChosen
                                          ? "cursor-default border-primary/40 bg-primary/10"
                                          : "cursor-default border-border opacity-55"
                                        : isChosen
                                          ? "border-blue-300 bg-blue-50"
                                          : "border-border hover:border-blue-200 hover:bg-blue-50/30",
                                      submitted && "cursor-default"
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name={`${type}-${mid}-${q.id}`}
                                      value={opt.id}
                                      checked={isChosen}
                                      disabled={submitted && !allowRetake}
                                      className="mt-0.5 shrink-0 accent-blue-600"
                                      onChange={() => {
                                        if (submitted && !allowRetake) return
                                        setQuizAnswers((prev) => ({
                                          ...prev,
                                          [aqKey(mid, type, q.id)]: opt.id,
                                        }))
                                      }}
                                    />
                                    <span>{opt.text}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {!submitted ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            !faseId ||
                            qs.some((q) => !quizAnswers[aqKey(mid, type, q.id)])
                          }
                          onClick={() => {
                            if (!faseId) return
                            const pk =
                              type === "pre" ? preKey(mid) : postKey(mid)
                            setQuizSubmitted((prev) => ({
                              ...prev,
                              [pk]: true,
                            }))
                            const next = new URLSearchParams(searchParams)
                            next.set("track", toTrackQuery(jTrack))
                            next.set("section", "quiz-summary")
                            next.set("journey", jBatch.id)
                            next.set("fase", faseId)
                            next.set("materi", mid)
                            next.set("quiz", type)
                            setSearchParams(next, { replace: true })
                          }}
                        >
                          Kumpulkan Jawaban
                        </Button>
                      ) : allowRetake ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const pk = postKey(mid)
                            const prevScore = qs.filter(
                              (q) =>
                                quizAnswers[aqKey(mid, "post", q.id)] ===
                                q.correct
                            ).length
                            const prevTotal = qs.length
                            const prevPercent =
                              prevTotal > 0
                                ? Math.round((prevScore / prevTotal) * 100)
                                : 0
                            setPostQuizHistory((prev) => ({
                              ...prev,
                              [pk]: [
                                ...(prev[pk] ?? []),
                                {
                                  at: new Date().toISOString(),
                                  score: prevScore,
                                  total: prevTotal,
                                  percent: prevPercent,
                                },
                              ],
                            }))
                            setQuizSubmitted((prev) => ({
                              ...prev,
                              [pk]: false,
                            }))
                            setQuizAnswers((prev) => {
                              const next = { ...prev }
                              for (const q of qs)
                                delete next[aqKey(mid, "post", q.id)]
                              return next
                            })
                          }}
                        >
                          Ulangi Test
                        </Button>
                      ) : null}
                      {submitted && type === "pre" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setActiveMateriView("content")}
                        >
                          Lanjut ke Materi
                        </Button>
                      )}
                      {submitted && type === "post" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveMateriId(null)
                            setActiveFaseId(null)
                          }}
                        >
                          Kembali ke Daftar Fase
                        </Button>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <>
                  {/* Class info card */}
                  <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div
                      className="relative min-h-28 overflow-hidden p-5 text-white"
                      style={{
                        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.42), rgba(37,99,235,0.5)), url(${selectedJourneyCoverImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-slate-950/10" />
                      <div className="relative">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
                          {jTrack}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold drop-shadow-sm">
                          {jBatch.name} — {jBatch.batch}
                        </h3>
                        <p className="mt-0.5 text-sm text-white/80">
                          {jBatch.period}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 border-t p-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-primary/5 px-3 py-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Progress Journey
                        </p>
                        <p className="mt-1 text-lg font-semibold text-primary">
                          {jProgress}%
                        </p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-primary/10">
                          <div
                            className="h-1.5 rounded-full bg-primary transition-all"
                            style={{ width: `${jProgress}%` }}
                          />
                        </div>
                      </div>
                      <div className="rounded-xl bg-muted/60 px-3 py-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Mentor
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {jBatch.mentor || "-"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/60 px-3 py-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Deadline Submission
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {jBatch.deadline}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/60 px-3 py-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Peserta ({participants.length})
                        </p>
                        <div className="mt-2 max-h-28 space-y-1 overflow-y-auto rounded-2xl border border-border/80 bg-background px-3 py-3 shadow-sm">
                          {participants.map((p) => (
                            <p
                              key={p.id}
                              className="truncate text-sm text-foreground"
                            >
                              {p.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Journey complete banner */}
                  {jComplete && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="size-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800">
                            Journey Selesai!
                          </p>
                          <p className="text-sm text-emerald-700">
                            Selamat! Anda telah menyelesaikan seluruh fase
                            pembelajaran.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main grid: fase sidebar + content */}
                  <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                    {/* LEFT: Fase list */}
                    <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
                      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        Fase Journey
                      </h3>
                      {journeyFases.map((fase, faseIdx) => {
                        const locked = isFLocked(faseIdx)
                        const done = isFDone(fase)
                        const faseBatchKey = `${batchId}__${fase.id}`
                        const faseEvalDone = faseEvalSubmitted[faseBatchKey]

                        return (
                          <div
                            key={fase.id}
                            className={cn(
                              "overflow-hidden rounded-xl border bg-card shadow-sm",
                              locked && "opacity-60"
                            )}
                          >
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() =>
                                setActiveFaseId(
                                  activeFaseId === fase.id ? null : fase.id
                                )
                              }
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/40 disabled:cursor-not-allowed"
                            >
                              <div
                                className={cn(
                                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                  locked
                                    ? "bg-slate-200 text-slate-500"
                                    : done
                                      ? "bg-emerald-500 text-white"
                                      : "bg-primary text-primary-foreground"
                                )}
                              >
                                {locked ? (
                                  "🔒"
                                ) : done ? (
                                  <Check className="size-4" />
                                ) : (
                                  faseIdx + 1
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {fase.kode} — {fase.nama}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Deadline: {fase.deadline} •{" "}
                                  {fase.materi.length} materi
                                </p>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "size-4 shrink-0 text-muted-foreground transition-transform",
                                  activeFaseId === fase.id && "rotate-180"
                                )}
                              />
                            </button>

                            {activeFaseId === fase.id && !locked && (
                              <div className="space-y-1 border-t bg-muted/10 px-3 pt-2 pb-3">
                                {fase.materi.map((m) => {
                                  const mDone = isMDone(m.id)
                                  const isSelected = activeMateriId === m.id

                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveMateriId(m.id)
                                        if (isEvaluasiFeedbackMateri(m)) return
                                        if (!isPreDone(m.id))
                                          setActiveMateriView("pre-test")
                                        else if (!isCDone(m.id))
                                          setActiveMateriView("content")
                                        else setActiveMateriView("post-test")
                                      }}
                                      className={cn(
                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                                        isSelected
                                          ? "bg-primary/10 font-medium text-primary"
                                          : "hover:bg-muted/60",
                                        mDone && "text-emerald-700"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "size-2 shrink-0 rounded-full",
                                          mDone
                                            ? "bg-emerald-500"
                                            : isEvaluasiFeedbackMateri(m)
                                              ? isSelected
                                                ? "bg-sky-400"
                                                : "bg-slate-300"
                                              : isPreDone(m.id) && isCDone(m.id)
                                                ? "bg-amber-400"
                                                : isPreDone(m.id)
                                                  ? "bg-sky-400"
                                                  : "bg-slate-300"
                                        )}
                                      />
                                      <span className="flex-1 truncate">
                                        {m.title}
                                      </span>
                                      {mDone && (
                                        <Check className="size-3.5 text-emerald-600" />
                                      )}
                                    </button>
                                  )
                                })}

                                {/* MT per-fase evaluasi */}
                                {fase.evaluasiLabel && done && (
                                  <div className="mt-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
                                    {faseEvalDone ? (
                                      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                        <Check className="size-3.5" />{" "}
                                        {fase.evaluasiLabel} terkirim
                                      </p>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-xs font-semibold text-amber-800">
                                          {fase.evaluasiLabel} (Lvl 1 —
                                          Kepuasan)
                                        </p>
                                        <p className="text-xs text-amber-700">
                                          Rating kepuasan fase ini:
                                        </p>
                                        <div className="flex gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              type="button"
                                              className="cursor-pointer"
                                              onClick={() =>
                                                setFaseEvalRatings((prev) => ({
                                                  ...prev,
                                                  [faseBatchKey]: star,
                                                }))
                                              }
                                            >
                                              <Star
                                                className={cn(
                                                  "size-5",
                                                  star <=
                                                    (faseEvalRatings[
                                                      faseBatchKey
                                                    ] ?? 0)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-slate-300"
                                                )}
                                              />
                                            </button>
                                          ))}
                                        </div>
                                        <Button
                                          type="button"
                                          size="sm"
                                          className="h-7 w-full text-xs"
                                          disabled={
                                            !(
                                              faseEvalRatings[faseBatchKey] ?? 0
                                            )
                                          }
                                          onClick={() =>
                                            setFaseEvalSubmitted((prev) => ({
                                              ...prev,
                                              [faseBatchKey]: true,
                                            }))
                                          }
                                        >
                                          Kirim Evaluasi Fase
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </aside>

                    {/* RIGHT: Materi content */}
                    <div>
                      {curMateri && isEvaluasiFeedbackMateri(curMateri) ? (
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                          <PhaseFaseEvaluasiFeedback
                            faseKode={curFase?.kode ?? ""}
                            faseNama={curFase?.nama ?? ""}
                            done={
                              faseEvalFeedbackDone[
                                faseEvalFeedbackKey(curMateri.id)
                              ] ?? false
                            }
                            onComplete={() =>
                              setFaseEvalFeedbackDone((prev) => ({
                                ...prev,
                                [faseEvalFeedbackKey(curMateri.id)]: true,
                              }))
                            }
                          />
                        </div>
                      ) : curMateri ? (
                        <div className="space-y-4">
                          {/* Tabs */}
                          <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
                            {(
                              [
                                { id: "pre-test", label: "Pre Test" },
                                { id: "content", label: "Materi" },
                                { id: "post-test", label: "Post Test" },
                              ] as const
                            ).map((tab) => {
                              const locked =
                                (tab.id === "content" &&
                                  !isPreDone(curMateri.id)) ||
                                (tab.id === "post-test" &&
                                  !isCDone(curMateri.id))
                              const done =
                                tab.id === "pre-test"
                                  ? isPreDone(curMateri.id)
                                  : tab.id === "content"
                                    ? isCDone(curMateri.id)
                                    : isPostDone(curMateri.id)
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  disabled={locked}
                                  onClick={() => setActiveMateriView(tab.id)}
                                  className={cn(
                                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                                    activeMateriView === tab.id
                                      ? "bg-background text-foreground shadow-sm"
                                      : "text-muted-foreground hover:text-foreground",
                                    locked && "cursor-not-allowed opacity-40"
                                  )}
                                >
                                  {done && (
                                    <Check className="size-3.5 text-emerald-600" />
                                  )}
                                  {tab.label}
                                  {locked && " 🔒"}
                                </button>
                              )
                            })}
                          </div>

                          {/* Materi header */}
                          <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
                            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                              {curFase?.kode} — {curFase?.nama}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">
                              {curMateri.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {curMateri.deskripsi}
                            </p>
                          </div>

                          {/* Tab content */}
                          <div className="rounded-xl border bg-card p-5 shadow-sm">
                            {activeMateriView === "pre-test" ? (
                              <>
                                <div className="mb-4 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">
                                      Pre Test — {curMateri.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      Kerjakan sebelum membuka materi. Soal sama
                                      dengan post test; tidak dapat diulang.
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                                    Lvl 2 — Pengetahuan
                                  </span>
                                </div>
                                {renderQuiz(
                                  preQs,
                                  "pre",
                                  curMateri.id,
                                  isPreDone(curMateri.id),
                                  curFase?.id ?? ""
                                )}
                              </>
                            ) : activeMateriView === "content" ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">
                                    Materi — {curMateri.contentLabel}
                                  </h4>
                                  {isCDone(curMateri.id) && (
                                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                      <Check className="size-3" /> Selesai
                                    </span>
                                  )}
                                </div>
                                <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
                                  <p className="text-base font-medium text-foreground">
                                    {curMateri.contentLabel}
                                  </p>
                                  <p className="mt-1">{curMateri.deskripsi}</p>
                                  <p className="mt-3 text-xs">
                                    (Konten ditampilkan di sini pada versi
                                    produksi: slide, video, atau PDF sesuai tipe
                                    materi)
                                  </p>
                                </div>
                                {!isCDone(curMateri.id) ? (
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      setContentViewed((prev) => ({
                                        ...prev,
                                        [ctKey(curMateri.id)]: true,
                                      }))
                                      setActiveMateriView("post-test")
                                    }}
                                  >
                                    Tandai Selesai & Lanjut ke Post Test
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      setActiveMateriView("post-test")
                                    }
                                  >
                                    Lanjut ke Post Test
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="mb-4 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">
                                      Post Test — {curMateri.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      Kerjakan setelah selesai membaca materi.{" "}
                                      {canRetake
                                        ? "Dapat diulang."
                                        : "Tidak dapat diulang."}
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                    Lvl 2 — Pengetahuan
                                  </span>
                                </div>
                                {renderQuiz(
                                  postQs,
                                  "post",
                                  curMateri.id,
                                  isPostDone(curMateri.id),
                                  curFase?.id ?? ""
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-5 py-12 text-center text-muted-foreground shadow-sm">
                          <p className="text-base font-medium text-foreground">
                            Pilih fase & materi
                          </p>
                          <p className="mt-1 text-sm">
                            Klik fase di kiri, lalu pilih materi yang ingin
                            dikerjakan. Fase harus diselesaikan secara
                            berurutan.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PKWT & Pro Hire: sertifikat setelah journey selesai */}
                  {jComplete &&
                    jTrack !== "MT/Organik" &&
                    permissions.key === "participant" && (
                      <JourneyCertificateSection
                        batchName={jBatch.name}
                        batch={jBatch.batch}
                        period={jBatch.period}
                        track={jTrack}
                      />
                    )}
                </>
              )
            })()
          ) : (
            <div className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Pilih class terlebih dahulu dari katalog untuk melihat Journey
              detail.
            </div>
          )}
        </section>
      ) : isCatalogDetailPage ? (
        <section className="space-y-5">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
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
                <JourneyCertificateSection
                  batchName={selectedJourneyBatch.name}
                  batch={selectedJourneyBatch.batch}
                  period={selectedJourneyBatch.period}
                  track={selectedJourneyBatch.track}
                />
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
                          <strong>Deadline Submission:</strong> {batch.deadline}
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
          {permissions.key === "participant" ? (
            (() => {
              const participantGroups: Array<{
                title: string
                status: BatchStatus
                items: BatchRow[]
              }> = (
                [
                  {
                    title: "Passed",
                    status: "Selesai",
                    items: filteredBatches.filter(
                      (batch) => (batch.status ?? "Belum Dimulai") === "Selesai"
                    ),
                  },
                  {
                    title: "On Progress",
                    status: "Sedang Berjalan",
                    items: filteredBatches.filter(
                      (batch) =>
                        (batch.status ?? "Belum Dimulai") === "Sedang Berjalan"
                    ),
                  },
                  {
                    title: "Belum Dimulai",
                    status: "Belum Dimulai",
                    items: filteredBatches.filter(
                      (batch) =>
                        (batch.status ?? "Belum Dimulai") === "Belum Dimulai"
                    ),
                  },
                  {
                    title: "Unpassed",
                    status: "Unpassed",
                    items: filteredBatches.filter(
                      (batch) =>
                        (batch.status ?? "Belum Dimulai") === "Unpassed"
                    ),
                  },
                ] as Array<{
                  title: string
                  status: BatchStatus
                  items: BatchRow[]
                }>
              ).filter((group) => group.items.length > 0)

              return (
                <>
                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                      My Classes - {activeTrack}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">Kelas Saya</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeJourney.description}
                    </p>
                  </div>

                  {participantGroups.length ? (
                    <div className="space-y-6">
                      {participantGroups.map((group) => (
                        <div key={group.status} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase",
                                group.status === "Selesai"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : group.status === "Sedang Berjalan"
                                    ? "bg-sky-100 text-sky-700"
                                    : group.status === "Belum Dimulai"
                                      ? "bg-slate-100 text-slate-700"
                                      : "bg-rose-100 text-rose-700"
                              )}
                            >
                              {group.title}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {group.items.length} kelas
                            </p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {group.items.map((batch) => {
                              const statusLabel =
                                batch.status ?? "Belum Dimulai"
                              const progressValue =
                                batch.progress ??
                                (statusLabel === "Selesai"
                                  ? 100
                                  : statusLabel === "Sedang Berjalan"
                                    ? 60
                                    : statusLabel === "Unpassed"
                                      ? 48
                                      : 0)
                              const coverImage =
                                batchCoverImages.get(batch.id) ?? courseImage
                              const progressTone =
                                statusLabel === "Selesai"
                                  ? "bg-emerald-500"
                                  : statusLabel === "Sedang Berjalan"
                                    ? "bg-sky-500"
                                    : statusLabel === "Unpassed"
                                      ? "bg-slate-400"
                                      : "bg-slate-300"

                              return (
                                <article
                                  key={batch.id}
                                  className="overflow-hidden rounded-3xl border bg-card shadow-sm"
                                >
                                  <div
                                    className="relative min-h-32 overflow-hidden p-5 text-white"
                                    style={{
                                      backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.2), rgba(15,23,42,0.58)), url(${coverImage})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-slate-950/15" />
                                    <div className="relative">
                                      <p className="text-[11px] font-semibold tracking-[0.24em] text-white/95 uppercase">
                                        {batch.track}
                                      </p>
                                      <h3 className="mt-2 text-2xl leading-tight font-semibold drop-shadow-sm">
                                        {batch.name}
                                      </h3>
                                      <p className="mt-1 text-sm font-medium text-white/95">
                                        {batch.batch}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-3 p-4">
                                    <p className="text-sm text-muted-foreground">
                                      {batch.audience}
                                    </p>

                                    <div className="space-y-1 text-sm">
                                      <p>
                                        <strong>Periode:</strong> {batch.period}
                                      </p>
                                      <p>
                                        <strong>Peserta:</strong> {batch.size}{" "}
                                        orang
                                      </p>
                                    </div>

                                    <div>
                                      <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Progress kelas</span>
                                        <span>{progressValue}%</span>
                                      </div>
                                      <div className="h-2 rounded-full bg-slate-100">
                                        <div
                                          className={cn(
                                            "h-2 rounded-full",
                                            progressTone
                                          )}
                                          style={{ width: `${progressValue}%` }}
                                        />
                                      </div>
                                    </div>

                                    <Button asChild size="sm" variant="outline">
                                      <Link
                                        to={`/class?track=${toTrackQuery(batch.track)}&section=journey-detail&journey=${batch.id}`}
                                      >
                                        Lihat kelas
                                      </Link>
                                    </Button>
                                  </div>
                                </article>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                      Belum ada kelas yang tersedia untuk track{" "}
                      <strong>{activeTrack}</strong>.
                    </div>
                  )}
                </>
              )
            })()
          ) : (
            <>
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
                                    <strong>Deadline Submission:</strong>{" "}
                                    {batch.deadline}
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
            </>
          )}
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
                Tambah Class
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
                        {editingId ? "Edit Class" : "Tambah Class"}
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
                  {/* Kategori Class */}
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="kategori-course"
                    >
                      Kategori Class <span className="text-red-500">*</span>
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
                      Fullname Class
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
                    <strong>Deadline Submission:</strong>{" "}
                    {featuredBatch.deadline}
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
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/45 px-4">
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

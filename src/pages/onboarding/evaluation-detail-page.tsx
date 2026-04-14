import { useMemo, useState } from "react"
import {
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Info,
  Send,
  UserRound,
} from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SectionKey = "materi" | "instruktur" | "penyelenggara"

type Section = {
  key: SectionKey
  title: string
  icon: typeof FileText
  questions: string[]
}

const likertScores = [1, 2, 3, 4] as const

const sections: Section[] = [
  {
    key: "materi",
    title: "Bagian 1 : Penilaian Materi Pelatihan",
    icon: FileText,
    questions: [
      "Materi pelatihan ini sesuai dengan harapan dan kebutuhan saya saat ini",
      "Materi pelatihan ini dapat dipahami dengan mudah",
      "Pengetahuan dan keterampilan yang saya pelajari dalam pelatihan ini dapat untuk diterapkan di unit kerja.",
    ],
  },
  {
    key: "instruktur",
    title: "Bagian 2 : Penilaian Instruktur",
    icon: UserRound,
    questions: [
      "Instruktur menyampaikan materi secara jelas dan terstruktur",
      "Instruktur responsif dalam menjawab pertanyaan peserta",
      "Instruktur mampu menciptakan suasana belajar yang interaktif",
    ],
  },
  {
    key: "penyelenggara",
    title: "Bagian 3 : Penilaian Penyelenggaraan Diklat",
    icon: Building2,
    questions: [
      "Jadwal pelatihan sesuai dengan agenda yang disampaikan",
      "Fasilitas pelatihan mendukung proses belajar dengan baik",
      "Informasi administrasi pelatihan disampaikan dengan lengkap",
    ],
  },
]

export default function EvaluationDetailPage() {
  const [searchParams] = useSearchParams()
  const levelFromQuery = Number(searchParams.get("level"))
  const level =
    Number.isNaN(levelFromQuery) || levelFromQuery < 1 ? 1 : levelFromQuery
  const [openSection, setOpenSection] = useState<SectionKey>("materi")
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const pageTitle = useMemo(() => `Evaluasi Level ${level}`, [level])

  function setRating(questionKey: string, score: number) {
    setRatings((prev) => ({ ...prev, [questionKey]: score }))
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-blue-600">
          {pageTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Berikan umpan balik Anda untuk membantu kami meningkatkan kualitas
          pelatihan di masa depan.
        </p>

        <div className="mt-7 rounded-3xl border border-blue-200 bg-blue-50">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-t-3xl bg-blue-600 px-6 py-4 text-left text-xl font-semibold text-white"
          >
            <span className="flex items-center gap-3">
              <span className="rounded-full bg-white/20 p-2">
                <Info className="size-5" />
              </span>
              Announcements
            </span>
            <ChevronDown className="size-5" />
          </button>

          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-blue-100 bg-white p-5">
              <p className="text-xl font-semibold text-blue-600">
                Menggunakan Skala Likert 1-4, dengan keterangan nilai sebagai
                berikut:
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-base font-semibold text-red-600">
                  1 = Kurang
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-center text-base font-semibold text-orange-600">
                  2 = Cukup
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-center text-base font-semibold text-blue-600">
                  3 = Baik
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-base font-semibold text-emerald-600">
                  4 = Sangat Baik
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-base font-semibold text-slate-700">
                    <CalendarDays className="size-5 text-blue-500" />
                    Tanggal Pelatihan
                    <span className="text-red-500">*</span>
                  </label>
                  <Input type="date" className="h-12 text-base" />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-base font-semibold text-slate-700">
                    <Building2 className="size-5 text-blue-500" />
                    Nama Penyelenggara
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Contoh: Divisi SDM"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <label className="flex items-center gap-2 text-base font-semibold text-slate-700">
                  <UserRound className="size-5 text-blue-500" />
                  Nama Instruktur
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nama lengkap instruktur"
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {sections.map((section) => {
          const isOpen = openSection === section.key
          const SectionIcon = section.icon

          return (
            <div
              key={section.key}
              className="mt-5 rounded-3xl border border-blue-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenSection((prev) =>
                    prev === section.key ? prev : section.key
                  )
                }
                className="flex w-full items-center justify-between rounded-3xl bg-blue-600 px-6 py-4 text-left text-xl font-semibold text-white"
              >
                <span className="flex items-center gap-3">
                  <span className="rounded-full bg-white/20 p-2">
                    <SectionIcon className="size-5" />
                  </span>
                  {section.title}
                </span>
                <ChevronDown
                  className={`size-5 transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen ? (
                <div className="space-y-4 p-5">
                  {section.questions.map((question, index) => {
                    const questionKey = `${section.key}-${index}`
                    return (
                      <div
                        key={questionKey}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-base font-semibold text-slate-800">
                          {index + 1}. {question}
                        </p>

                        <div className="mt-4 rounded-xl bg-white px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
                              Sangat tidak sesuai
                            </span>

                            <div className="flex items-center gap-5">
                              {likertScores.map((score) => {
                                const isSelected =
                                  ratings[questionKey] === score
                                return (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() =>
                                      setRating(questionKey, score)
                                    }
                                    className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                                      isSelected
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-500 hover:border-blue-400"
                                    }`}
                                  >
                                    {score}
                                  </button>
                                )
                              })}
                            </div>

                            <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
                              Sangat sesuai
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}

        <div className="mt-8 flex justify-end">
          <Button className="h-12 rounded-2xl bg-blue-600 px-6 text-base font-semibold hover:bg-blue-700">
            <Send className="size-5" />
            Submit Evaluasi
          </Button>
        </div>
      </section>
    </div>
  )
}

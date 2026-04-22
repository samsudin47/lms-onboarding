import { useState, type ReactNode } from "react"
import {
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  Send,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function isEvaluasiFeedbackMateri(m: {
  id: string
  variant?: "standard" | "evaluasi-feedback"
}): boolean {
  return m.variant === "evaluasi-feedback" || m.id.endsWith("__m-evaluasi")
}

const MATERI_Q = [
  "Materi pelatihan ini sesuai dengan harapan dan kebutuhan saya saat ini",
  "Materi pelatihan ini dapat dipahami dengan mudah",
  "Pengetahuan dan keterampilan yang saya pelajari dalam pelatihan ini dapat diterapkan di unit kerja.",
  "Materi pelatihan dapat mendukung rencana pengembangan karir SDM di masa depan",
  "Materi pelatihan didukung oleh sistem informasi dan prosedur pembelajaran",
] as const

const INSTRUKTUR_Q = [
  "Instruktur menguasai materi pelatihan dengan baik",
  "Metode penyampaian materi menarik dan interaktif",
  "Instruktur memberikan kesempatan untuk bertanya dan berdiskusi",
  "Manajemen waktu pelatihan efektif",
] as const

const PENYELENGGARA_Q = [
  "Fasilitas pelatihan memadai dan nyaman",
  "Pelayanan panitia penyelenggara responsif dan membantu",
  "Konsumsi yang disediakan layak dan higienis",
  "Materi pelatihan diterima tepat waktu",
] as const

type Score = 1 | 2 | 3 | 4

type Props = {
  faseKode: string
  faseNama: string
  done: boolean
  onComplete: () => void
}

function Likert4({
  value,
  onChange,
  namePrefix,
  index,
}: {
  value: Score | undefined
  onChange: (v: Score) => void
  namePrefix: string
  index: number
}) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="shrink-0 text-[9px] font-semibold tracking-wide text-muted-foreground sm:max-w-[5.5rem] sm:leading-tight">
        SANGAT TIDAK SESUAI
      </span>
      <div
        className="flex items-center justify-center gap-1.5 sm:px-1"
        role="radiogroup"
        aria-label={`Pertanyaan ${index}`}
      >
        {([1, 2, 3, 4] as const).map((n) => {
          const selected = value === n
          return (
            <button
              key={n}
              type="button"
              name={`${namePrefix}-q${index}`}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(n)}
              className={cn(
                "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition",
                selected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
      <span className="shrink-0 text-right text-[9px] font-semibold tracking-wide text-muted-foreground sm:max-w-[5.5rem] sm:leading-tight">
        SANGAT SESUAI
      </span>
    </div>
  )
}

export function PhaseFaseEvaluasiFeedback({
  faseKode,
  faseNama,
  done,
  onComplete,
}: Props) {
  const [tanggal, setTanggal] = useState("")
  const [penyelenggara, setPenyelenggara] = useState("")
  const [instruktur, setInstruktur] = useState("")
  const [ratings, setRatings] = useState<Record<string, Score>>({})

  if (done) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-8 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="size-7 text-emerald-600" strokeWidth={2.5} />
          </div>
          <p className="mt-3 text-base font-semibold text-emerald-900">
            Evaluasi fase terkirim
          </p>
          <p className="mt-1 text-sm text-emerald-800/90">
            Terima kasih — umpan balik Anda untuk{" "}
            <strong>
              {faseKode} {faseNama}
            </strong>{" "}
            sudah tercatat.
          </p>
        </div>
      </div>
    )
  }

  const canSubmit =
    Boolean(tanggal.trim()) &&
    Boolean(penyelenggara.trim()) &&
    Boolean(instruktur.trim()) &&
    [1, 2, 3, 4, 5].every((i) => ratings[`m${i}`] != null) &&
    [1, 2, 3, 4].every(
      (i) => ratings[`i${i}`] != null && ratings[`o${i}`] != null
    )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          {faseKode} — {faseNama}
        </p>
        <h3 className="mt-1 text-lg font-semibold">Evaluasi Level 1</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Berikan umpan balik Anda untuk membantu kami meningkatkan kualitas
          pelatihan di masa depan.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-primary/10 px-4 py-2.5">
          <p className="text-sm font-medium text-foreground">
            Informasi & skala
          </p>
        </div>
        <div className="space-y-4 bg-muted/20 px-4 py-4">
          <p className="text-xs text-muted-foreground">
            Keterangan skala (pertanyaan penilaian):
          </p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-800">
              1 = Kurang
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800">
              2 = Cukup
            </span>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 font-medium text-sky-800">
              3 = Baik
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800">
              4 = Sangat baik
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            <span className="text-destructive">*</span> Wajib diisi
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="w-full sm:col-span-2">
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="ev-tanggal"
              >
                Tanggal pelatihan <span className="text-destructive">*</span>
              </label>
              <div className="w-full max-w-[12.5rem]">
                <Input
                  id="ev-tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="h-10 w-full max-w-full cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="ev-penyelenggara"
              >
                Nama penyelenggara <span className="text-destructive">*</span>
              </label>
              <Input
                id="ev-penyelenggara"
                placeholder="Contoh: Divisi SDM"
                value={penyelenggara}
                onChange={(e) => setPenyelenggara(e.target.value)}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="ev-instruktur"
              >
                Nama instruktur <span className="text-destructive">*</span>
              </label>
              <Input
                id="ev-instruktur"
                placeholder="Nama lengkap instruktur"
                value={instruktur}
                onChange={(e) => setInstruktur(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <EvalSection
          title="Bagian 1 : Penilaian materi pelatihan"
          icon={<BookOpen className="size-4" />}
        >
          {MATERI_Q.map((q, i) => (
            <div
              key={q}
              className="rounded-lg border border-border/80 bg-card px-4 py-3 shadow-sm"
            >
              <p className="text-sm font-medium text-foreground">
                {i + 1}. {q}
              </p>
              <Likert4
                namePrefix="materi"
                index={i + 1}
                value={ratings[`m${i + 1}`]}
                onChange={(v) =>
                  setRatings((p) => ({ ...p, [`m${i + 1}`]: v }))
                }
              />
            </div>
          ))}
        </EvalSection>

        <EvalSection
          title="Bagian 2 : Penilaian instruktur"
          icon={<User className="size-4" />}
        >
          {INSTRUKTUR_Q.map((q, i) => (
            <div
              key={q}
              className="rounded-lg border border-border/80 bg-card px-4 py-3 shadow-sm"
            >
              <p className="text-sm font-medium text-foreground">
                {i + 1}. {q}
              </p>
              <Likert4
                namePrefix="ins"
                index={i + 1}
                value={ratings[`i${i + 1}`]}
                onChange={(v) =>
                  setRatings((p) => ({ ...p, [`i${i + 1}`]: v }))
                }
              />
            </div>
          ))}
        </EvalSection>

        <EvalSection
          title="Bagian 3 : Penilaian penyelenggaraan diklat"
          icon={<Building2 className="size-4" />}
        >
          {PENYELENGGARA_Q.map((q, i) => (
            <div
              key={q}
              className="rounded-lg border border-border/80 bg-card px-4 py-3 shadow-sm"
            >
              <p className="text-sm font-medium text-foreground">
                {i + 1}. {q}
              </p>
              <Likert4
                namePrefix="org"
                index={i + 1}
                value={ratings[`o${i + 1}`]}
                onChange={(v) =>
                  setRatings((p) => ({ ...p, [`o${i + 1}`]: v }))
                }
              />
            </div>
          ))}
        </EvalSection>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          className="gap-2"
          disabled={!canSubmit}
          onClick={() => onComplete()}
        >
          <Send className="size-4" />
          Submit evaluasi
        </Button>
      </div>
    </div>
  )
}

function EvalSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: ReactNode
}) {
  return (
    <details
      className="group overflow-hidden rounded-xl border bg-card shadow-sm"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-foreground">
          <span className="text-primary">{icon}</span>
          <span className="min-w-0">{title}</span>
        </div>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 p-3">{children}</div>
    </details>
  )
}

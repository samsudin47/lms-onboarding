import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { Plus, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CourseQuizQuestion } from "@/types/course-quiz"
import {
  contiguousFilledOptionsFromEditor,
  normalizeCourseQuizQuestion,
  parseCourseQuizExcelBuffer,
  QUIZ_OPT_IDS as OPT_IDS,
} from "@/lib/course-quiz-excel"

export type CourseTestEditorValues = {
  preTestQuestions: CourseQuizQuestion[]
  postTestQuestions: CourseQuizQuestion[]
  testsUseSameQuestions: boolean
  passingGrade: number
  testLevelLabel: string
  journeyMateriId: string | null
}

export function newEmptyQuestion(): CourseQuizQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: "",
    options: OPT_IDS.map((id) => ({ id, text: "" })),
    correct: "a",
  }
}

function validateQuestions(qs: CourseQuizQuestion[]): string | null {
  for (let i = 0; i < qs.length; i++) {
    const q = normalizeCourseQuizQuestion(qs[i])
    if (!q.text.trim())
      return `Soal ${i + 1}: teks pertanyaan wajib diisi.`
    if (q.options.length < 2 || q.options.length > 4)
      return `Soal ${i + 1}: isi 2–4 opsi berurutan mulai dari opsi A (tanpa melompati huruf).`
    if (!q.options.some((o) => o.id === q.correct))
      return `Soal ${i + 1}: pilih jawaban benar yang sesuai opsi terisi.`
  }
  return null
}

export function validateCourseTestEditor(
  v: CourseTestEditorValues
): string | null {
  if (v.preTestQuestions.length === 0)
    return "Tambahkan minimal satu soal untuk pre test."
  const preErr = validateQuestions(v.preTestQuestions)
  if (preErr) return preErr
  if (!v.testsUseSameQuestions) {
    if (v.postTestQuestions.length === 0)
      return "Tambahkan minimal satu soal untuk post test, atau centang bank soal sama."
    const postErr = validateQuestions(v.postTestQuestions)
    if (postErr) return postErr
  }
  return null
}

type Props = {
  open: boolean
  onClose: () => void
  initial: CourseTestEditorValues
  onSave: (v: CourseTestEditorValues) => void
}

export function CourseTestEditorModal({
  open,
  onClose,
  initial,
  onSave,
}: Props) {
  const [v, setV] = useState(initial)
  const excelInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setV(initial)
  }, [open, initial])

  if (!open) return null

  function updatePre(
    mut: (prev: CourseQuizQuestion[]) => CourseQuizQuestion[]
  ) {
    setV((s) => ({ ...s, preTestQuestions: mut(s.preTestQuestions) }))
  }
  function updatePost(
    mut: (prev: CourseQuizQuestion[]) => CourseQuizQuestion[]
  ) {
    setV((s) => ({ ...s, postTestQuestions: mut(s.postTestQuestions) }))
  }

  function setQuestion(
    which: "pre" | "post",
    index: number,
    next: CourseQuizQuestion
  ) {
    const fn = which === "pre" ? updatePre : updatePost
    fn((arr) => arr.map((q, i) => (i === index ? next : q)))
  }

  async function handleQuizExcelChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const buf = await file.arrayBuffer()
    const { pre, post, errors } = parseCourseQuizExcelBuffer(buf)
    if (errors.length) {
      window.alert(
        errors.slice(0, 15).join("\n") +
          (errors.length > 15 ? `\n… (${errors.length} pesan)` : "")
      )
    }

    setV((s) => {
      if (s.testsUseSameQuestions) {
        const bank = pre.length > 0 ? pre : post
        if (bank.length === 0) {
          if (!errors.length)
            window.alert(
              "Tidak ada baris valid (kolom jenis: pre atau post). "
            )
          return s
        }
        return { ...s, preTestQuestions: bank }
      }
      let next = { ...s }
      if (pre.length) next = { ...next, preTestQuestions: pre }
      if (post.length) next = { ...next, postTestQuestions: post }
      if (!pre.length && !post.length && !errors.length)
        window.alert("Tidak ada baris soal yang terbaca dari Excel.")
      return next
    })

    if (pre.length + post.length > 0 && !errors.length)
      window.alert(
        `Berhasil mengimpor ${pre.length} soal pre dan ${post.length} soal post.`
      )
    else if (pre.length + post.length > 0 && errors.length)
      window.alert(
        `Terimpor parsial: ${pre.length} pre, ${post.length} post (lihat error di atas).`
      )
  }

  const errMsg = validateCourseTestEditor(v)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-3 py-6">
      <div
        className={cn(
          "my-auto w-full max-w-2xl rounded-2xl border bg-card shadow-xl",
          "flex max-h-[min(90vh,840px)] flex-col"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">Atur pre / post test</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Pilihan ganda minimal <strong>2</strong> dan maksimal{" "}
              <strong>4</strong> opsi (isi berurutan A→D). Impor Excel untuk
              bulk isi bank soal.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2">
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="sr-only"
                onChange={handleQuizExcelChange}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => excelInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Impor Excel (soal)
              </Button>
              <span className="text-[11px] text-muted-foreground">
                Kolom: <span className="font-mono">jenis</span> (pre/post),{" "}
                <span className="font-mono">pertanyaan</span>,{" "}
                <span className="font-mono">opsi_a</span> …{" "}
                <span className="font-mono">opsi_d</span>,{" "}
                <span className="font-mono">jawaban_benar</span> (a–d)
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Passing grade (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={String(v.passingGrade)}
                  onChange={(e) =>
                    setV((s) => ({
                      ...s,
                      passingGrade: Math.min(
                        100,
                        Math.max(0, Number.parseInt(e.target.value, 10) || 0)
                      ),
                    }))
                  }
                  className="max-w-32"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Label level (badge)
                </label>
                <Input
                  value={v.testLevelLabel}
                  onChange={(e) =>
                    setV((s) => ({ ...s, testLevelLabel: e.target.value }))
                  }
                  placeholder="Lvl 2 — Pengetahuan"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                ID materi journey{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (opsional, untuk sinkron ke layar peserta)
                </span>
              </label>
              <Input
                className="font-mono text-sm"
                value={v.journeyMateriId ?? ""}
                onChange={(e) =>
                  setV((s) => ({
                    ...s,
                    journeyMateriId:
                      e.target.value.trim() === ""
                        ? null
                        : e.target.value.trim(),
                  }))
                }
                placeholder="mis. jm-pkwt-01-01"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-primary"
                checked={!v.testsUseSameQuestions}
                onChange={(e) =>
                  setV((s) => ({
                    ...s,
                    testsUseSameQuestions: !e.target.checked,
                  }))
                }
              />
              Post test memakai bank soal berbeda dari pre test
            </label>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Bank pre test</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updatePre((arr) => [...arr, newEmptyQuestion()])
                  }
                >
                  <Plus className="size-4" />
                  Tambah soal
                </Button>
              </div>
              {v.preTestQuestions.map((q, qi) => (
                <QuestionCard
                  key={q.id}
                  index={qi}
                  question={q}
                  onChange={(nq) => setQuestion("pre", qi, nq)}
                  onRemove={() =>
                    updatePre((arr) => arr.filter((_, i) => i !== qi))
                  }
                />
              ))}
              {v.preTestQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada soal. Klik &quot;Tambah soal&quot; atau impor Excel.
                </p>
              ) : null}
            </section>

            {!v.testsUseSameQuestions ? (
              <section className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Bank post test</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updatePost((arr) => [...arr, newEmptyQuestion()])
                    }
                  >
                    <Plus className="size-4" />
                    Tambah soal
                  </Button>
                </div>
                {v.postTestQuestions.map((q, qi) => (
                  <QuestionCard
                    key={q.id}
                    index={qi}
                    question={q}
                    onChange={(nq) => setQuestion("post", qi, nq)}
                    onRemove={() =>
                      updatePost((arr) => arr.filter((_, i) => i !== qi))
                    }
                  />
                ))}
                {v.postTestQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Tambah soal untuk post atau centang bank sama.
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t px-5 py-4">
          {errMsg ? (
            <p className="mb-3 text-sm text-red-600">{errMsg}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                const e = validateCourseTestEditor(v)
                if (e) return
                onSave({
                  ...v,
                  preTestQuestions: v.preTestQuestions.map(
                    normalizeCourseQuizQuestion
                  ),
                  postTestQuestions: v.postTestQuestions.map(
                    normalizeCourseQuizQuestion
                  ),
                })
              }}
              disabled={!!errMsg}
            >
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuestionCard({
  index,
  question,
  onChange,
  onRemove,
}: {
  index: number
  question: CourseQuizQuestion
  onChange: (q: CourseQuizQuestion) => void
  onRemove: () => void
}) {
  const filled = contiguousFilledOptionsFromEditor(question)
  const selectOpts =
    filled.length >= 2
      ? filled
      : OPT_IDS.map((id) => ({
          id,
          text: question.options.find((o) => o.id === id)?.text ?? "",
        }))

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-medium">Soal {index + 1}</p>
        <button
          type="button"
          className="text-muted-foreground hover:text-red-600"
          onClick={onRemove}
          title="Hapus soal"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <label className="mb-2 block text-xs font-medium text-muted-foreground">
        Pertanyaan
      </label>
      <textarea
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        className="mb-3 min-h-16 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
        placeholder="Teks soal pilihan ganda"
      />
      <p className="mb-2 text-[11px] text-muted-foreground">
        Isi opsi A–D secara berurutan; kosongkan opsi yang tidak dipakai setelah
        opsi terakhir (minimal A &amp; B).
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPT_IDS.map((oid) => {
          const opt =
            question.options.find((o) => o.id === oid) ?? {
              id: oid,
              text: "",
            }
          return (
            <div key={oid}>
              <label className="mb-1 block text-[11px] font-medium uppercase text-muted-foreground">
                Opsi {oid}
              </label>
              <Input
                value={opt.text}
                onChange={(e) => {
                  onChange({
                    ...question,
                    options: OPT_IDS.map((id) => {
                      const cur =
                        question.options.find((o) => o.id === id) ??
                        ({ id, text: "" } as const)
                      return id === oid
                        ? { ...cur, text: e.target.value }
                        : cur
                    }),
                  })
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Jawaban benar
        </label>
        <select
          value={
            selectOpts.some((o) => o.id === question.correct)
              ? question.correct
              : (selectOpts[0]?.id ?? "a")
          }
          onChange={(e) =>
            onChange({ ...question, correct: e.target.value })
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {selectOpts.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id.toUpperCase()}
              {o.text
                ? ` — ${o.text.slice(0, 48)}${o.text.length > 48 ? "…" : ""}`
                : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

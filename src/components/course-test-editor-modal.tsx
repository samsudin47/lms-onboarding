import { useEffect, useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CourseQuizQuestion } from "@/types/course-quiz"

const OPT_IDS = ["a", "b", "c", "d"] as const

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
    const q = qs[i]
    if (!q.text.trim()) return `Soal ${i + 1}: teks pertanyaan wajib diisi.`
    for (const oid of OPT_IDS) {
      const o = q.options.find((x) => x.id === oid)
      if (!o?.text.trim())
        return `Soal ${i + 1}: opsi ${oid.toUpperCase()} wajib diisi.`
    }
    if (!OPT_IDS.includes(q.correct as (typeof OPT_IDS)[number]))
      return `Soal ${i + 1}: pilih jawaban benar.`
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
              Bank soal pilihan ganda (empat opsi). Cocokkan dengan journey
              peserta lewat ID materi (opsional).
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
                  Belum ada soal. Klik &quot;Tambah soal&quot;.
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
                onSave(v)
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
        onChange={(e) =>
          onChange({ ...question, text: e.target.value })
        }
        className="mb-3 min-h-16 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
        placeholder="Teks soal pilihan ganda"
      />
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
          value={question.correct}
          onChange={(e) =>
            onChange({ ...question, correct: e.target.value })
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {OPT_IDS.map((oid) => (
            <option key={oid} value={oid}>
              {oid.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

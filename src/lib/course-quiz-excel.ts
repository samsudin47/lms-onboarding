import type { CourseQuizQuestion } from "@/types/course-quiz"

import { cellByAliases, normalizeHeaderKey, sheetToDataRows } from "./excel-import"

export const QUIZ_OPT_IDS = ["a", "b", "c", "d"] as const

const OPT_ALIASES: Record<(typeof QUIZ_OPT_IDS)[number], readonly string[]> = {
  a: ["opsi_a", "opsia", "pilihan_a", "option_a", "a"],
  b: ["opsi_b", "opsib", "pilihan_b", "option_b", "b"],
  c: ["opsi_c", "opsic", "pilihan_c", "option_c", "c"],
  d: ["opsi_d", "opsid", "pilihan_d", "option_d", "d"],
}

function rowQuestionText(row: Record<string, unknown>): string {
  return cellByAliases(row, [
    "pertanyaan",
    "pertanyaan_soal",
    "soal",
    "question",
    "text",
  ])
}

function rowKind(row: Record<string, unknown>): "pre" | "post" | null {
  const raw = cellByAliases(row, [
    "jenis",
    "jenistest",
    "test",
    "tipe",
    "prepost",
    "bank",
  ])
  if (!raw.trim()) return null
  const s = normalizeHeaderKey(raw.replace(/\s+/g, ""))
  if (s.includes("post")) return "post"
  if (s.includes("pre")) return "pre"
  const lower = raw.trim().toLowerCase()
  if (lower === "post" || lower === "pasca") return "post"
  if (lower === "pre" || lower === "pra") return "pre"
  return null
}

/** Ambil 2–4 opsi berurutan dari A (tanpa gap kosong di antara opsi terisi). */
export function optionsFromRowCells(
  row: Record<string, unknown>
): { options: Array<{ id: string; text: string }>; error: string | null } {
  const texts = QUIZ_OPT_IDS.map((id) =>
    String(cellByAliases(row, OPT_ALIASES[id]) ?? "").trim()
  )
  const collected: Array<{ id: string; text: string }> = []
  let started = false
  for (let i = 0; i < QUIZ_OPT_IDS.length; i++) {
    const id = QUIZ_OPT_IDS[i]
    const t = texts[i]
    if (!t) {
      if (started) break
      continue
    }
    if (!started && i !== 0) {
      return {
        options: [],
        error: "Opsi pertama yang terisi harus A.",
      }
    }
    started = true
    collected.push({ id, text: t })
  }
  if (collected.length < 2)
    return {
      options: [],
      error: "Minimal 2 opsi (A dan B) yang terisi berurutan.",
    }
  if (collected.length > 4)
    return { options: [], error: "Maksimal 4 opsi." }
  return { options: collected, error: null }
}

function correctFromRow(
  row: Record<string, unknown>,
  validIds: Set<string>
): string | null {
  const raw = cellByAliases(row, [
    "jawaban_benar",
    "jawaban",
    "kunci",
    "correct",
    "benar",
  ])
  const trimmed = raw.trim().toLowerCase()
  const letter =
    trimmed.match(/\b([a-d])\b/)?.[1] ??
    trimmed.match(/^([a-d])/)?.[1] ??
    normalizeHeaderKey(raw).replace(/[^a-d]/g, "").slice(0, 1)
  if (!letter || !validIds.has(letter)) return null
  return letter
}

export function parseCourseQuizExcelBuffer(buf: ArrayBuffer): {
  pre: CourseQuizQuestion[]
  post: CourseQuizQuestion[]
  errors: string[]
} {
  let rows: Record<string, unknown>[]
  try {
    rows = sheetToDataRows(buf)
  } catch {
    return {
      pre: [],
      post: [],
      errors: ["File Excel tidak bisa dibaca."],
    }
  }
  const errors: string[] = []
  const pre: CourseQuizQuestion[] = []
  const post: CourseQuizQuestion[] = []

  rows.forEach((row, idx) => {
    const line = idx + 2
    const qt = rowQuestionText(row)
    if (!qt.trim()) return

    const kind = rowKind(row)
    if (!kind) {
      errors.push(`Baris ${line}: kolom jenis harus pre atau post.`)
      return
    }

    const { options, error: optErr } = optionsFromRowCells(row)
    if (optErr || options.length < 2) {
      errors.push(`Baris ${line}: ${optErr ?? "opsi tidak valid"}`)
      return
    }

    const ids = new Set(options.map((o) => o.id))
    const corr = correctFromRow(row, ids)
    if (!corr) {
      errors.push(
        `Baris ${line}: jawaban_benar harus salah satu huruf opsi yang terisi (${[...ids].join(", ")}).`
      )
      return
    }

    const q: CourseQuizQuestion = {
      id: `xlsx-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      text: qt,
      options,
      correct: corr,
    }
    if (kind === "pre") pre.push(q)
    else post.push(q)
  })

  return { pre, post, errors }
}

/** Opsi terisi berurutan dari editor (untuk dropdown jawaban). */
export function contiguousFilledOptionsFromEditor(
  q: CourseQuizQuestion
): Array<{ id: string; text: string }> {
  const texts = QUIZ_OPT_IDS.map(
    (id) => q.options.find((o) => o.id === id)?.text?.trim() ?? ""
  )
  const collected: Array<{ id: string; text: string }> = []
  let started = false
  for (let i = 0; i < QUIZ_OPT_IDS.length; i++) {
    const id = QUIZ_OPT_IDS[i]
    const t = texts[i]
    if (!t) {
      if (started) break
      continue
    }
    if (!started && i !== 0) return collected
    started = true
    collected.push({ id, text: t })
  }
  return collected
}

/** Normalisasi opsi dari form editor (A→D kontigu), min 2 max 4. Perbaiki `correct` jika perlu. */
export function normalizeCourseQuizQuestion(q: CourseQuizQuestion): CourseQuizQuestion {
  const collected = contiguousFilledOptionsFromEditor(q)
  let correct = q.correct
  if (!collected.some((o) => o.id === correct))
    correct = collected[0]?.id ?? "a"
  return { ...q, options: collected, correct }
}

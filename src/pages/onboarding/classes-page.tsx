import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronDown,
  ClipboardList,
  Download,
  FilePlus,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Trash2,
  XCircle,
  CheckCircle2,
} from "lucide-react"

import {
  CourseTestEditorModal,
  newEmptyQuestion,
  type CourseTestEditorValues,
} from "@/components/course-test-editor-modal"
import { SearchableSelect } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { persistCourseQuizForMateri } from "@/lib/course-quiz-bridge"
import { cn } from "@/lib/utils"
import type { CourseQuizQuestion } from "@/types/course-quiz"

// ─── Types ───────────────────────────────────────────────────────────────────
type CourseCategory = "Onboarding" | "LMS"
type VisibleStatus = "PUBLISH" | "DRAFT"
type JabatanKey =
  | "PKWT"
  | "Pro Hire"
  | "MT"
  | "Staff"
  | "Kaur"
  | "Kasek"
  | "Kadep"
  | "Kadiv"
type KategoriPelatihan =
  | "SDM"
  | "IT"
  | "Hukum"
  | "Keuangan"
  | "Operasional"
  | "Umum"
  | "Teknik"
  | "Kepatuhan"

type ContentType =
  | "Deskripsi"
  | "Pilihan Ganda"
  | "Essay"
  | "PDF"
  | "Video"
  | "Tugas"

type CourseMaterialItem = {
  id: string
  title: string
  type: ContentType
  description: string
  link: string
  deadline: string
}

type CourseRow = {
  id: string
  kategori: CourseCategory
  fullname: string
  shortname: string
  date: string
  jabatan: JabatanKey[]
  kategoriPelatihan: KategoriPelatihan[]
  materials: CourseMaterialItem[]
  preTestQuestions: CourseQuizQuestion[]
  postTestQuestions: CourseQuizQuestion[]
  /** Nilai minimum (%) untuk lulus pre/post test */
  passingGrade: number
  testsUseSameQuestions: boolean
  /** Badge di layar peserta (via overlay journey) */
  testLevelLabel: string
  /** Sinkron bank soal ke materi journey (mock, localStorage) */
  journeyMateriId: string | null
  visible: VisibleStatus
}

function testsConfiguredForPublish(
  c: CourseRow | undefined | null
): boolean {
  if (!c) return false
  const preOk = c.preTestQuestions.length > 0
  const postOk = c.testsUseSameQuestions ? preOk : c.postTestQuestions.length > 0
  return preOk && postOk
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_JABATAN: JabatanKey[] = [
  "PKWT",
  "Pro Hire",
  "MT",
  "Staff",
  "Kaur",
  "Kasek",
  "Kadep",
  "Kadiv",
]
const ALL_KATEGORI: KategoriPelatihan[] = [
  "SDM",
  "IT",
  "Hukum",
  "Keuangan",
  "Operasional",
  "Umum",
  "Teknik",
  "Kepatuhan",
]

const CONTENT_TYPE_OPTIONS: ContentType[] = [
  "Deskripsi",
  "Video",
  "PDF",
  "Pilihan Ganda",
  "Essay",
  "Tugas",
]

function newCourseMaterialId(courseId: string): string {
  return `mat-${courseId}-${Math.random().toString(36).slice(2, 8)}`
}

/** Nilai 0–100; fallback bila kosong/tidak valid */
function clampPassingGrade(raw: string, fallback = 70): number {
  const n = Number.parseInt(raw.trim(), 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(100, Math.max(0, n))
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const PKWT_DEMO_PRE: CourseQuizQuestion[] = [
  {
    id: "admin-q1",
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
    id: "admin-q2",
    text: "Apa kepanjangan dari Peruri?",
    options: [
      { id: "a", text: "Perum Percetakan Uang Republik Indonesia" },
      { id: "b", text: "Perusahaan Rekayasa Uang Indonesia" },
      { id: "c", text: "Percetakan Umum Rupiah Indonesia" },
      { id: "d", text: "Perum Pengaman Rupiah Indonesia" },
    ],
    correct: "a",
  },
]

function ph(key: string, label: string): CourseQuizQuestion[] {
  return [
    {
      id: `ph-${key}`,
      text: `${label} (sesuaikan lewat Atur test).`,
      options: [
        { id: "a", text: "Opsi A" },
        { id: "b", text: "Opsi B" },
        { id: "c", text: "Opsi C" },
        { id: "d", text: "Opsi D" },
      ],
      correct: "a",
    },
  ]
}

const initialCourses: CourseRow[] = [
  {
    id: "cls-01",
    kategori: "Onboarding",
    fullname: "PKWT April 2026",
    shortname: "batch_1",
    date: "07 Apr 2026 - 11 Apr 2026",
    jabatan: ["PKWT"],
    kategoriPelatihan: ["SDM", "Umum"],
    materials: [],
    preTestQuestions: PKWT_DEMO_PRE,
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: true,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: "jm-pkwt-01-01",
    visible: "PUBLISH",
  },
  {
    id: "cls-02",
    kategori: "Onboarding",
    fullname: "PKWT Maret 2026",
    shortname: "batch_2",
    date: "03 Mar 2026 - 07 Mar 2026",
    jabatan: ["PKWT"],
    kategoriPelatihan: ["SDM", "Umum"],
    materials: [],
    preTestQuestions: ph("02-pre", "Pre test"),
    postTestQuestions: ph("02-post", "Post test"),
    passingGrade: 70,
    testsUseSameQuestions: false,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "PUBLISH",
  },
  {
    id: "cls-03",
    kategori: "Onboarding",
    fullname: "PKWT Februari 2026",
    shortname: "batch_3",
    date: "03 Feb 2026 - 07 Feb 2026",
    jabatan: ["PKWT"],
    kategoriPelatihan: ["SDM"],
    materials: [],
    preTestQuestions: ph("03-pre", "Pre test"),
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: false,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "DRAFT",
  },
  {
    id: "cls-04",
    kategori: "Onboarding",
    fullname: "PKWT Mei 2026",
    shortname: "batch_1",
    date: "05 Mei 2026 - 09 Mei 2026",
    jabatan: ["PKWT"],
    kategoriPelatihan: ["SDM", "Umum"],
    materials: [],
    preTestQuestions: [],
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: true,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "DRAFT",
  },
  {
    id: "cls-05",
    kategori: "Onboarding",
    fullname: "PKWT Juni 2026",
    shortname: "batch_2",
    date: "09 Jun 2026 - 13 Jun 2026",
    jabatan: ["PKWT"],
    kategoriPelatihan: ["SDM"],
    materials: [],
    preTestQuestions: [],
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: true,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "DRAFT",
  },
  {
    id: "cls-06",
    kategori: "Onboarding",
    fullname: "Pro Hire April 2026",
    shortname: "batch_1",
    date: "14 Apr 2026 - 18 Apr 2026",
    jabatan: ["Pro Hire"],
    kategoriPelatihan: ["SDM", "IT"],
    materials: [],
    preTestQuestions: ph("06-pre", "Pre test"),
    postTestQuestions: ph("06-post", "Post test"),
    passingGrade: 75,
    testsUseSameQuestions: false,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "PUBLISH",
  },
  {
    id: "cls-07",
    kategori: "Onboarding",
    fullname: "Pro Hire Maret 2026",
    shortname: "batch_3",
    date: "10 Mar 2026 - 14 Mar 2026",
    jabatan: ["Pro Hire"],
    kategoriPelatihan: ["SDM", "Umum"],
    materials: [],
    preTestQuestions: ph("07-pre", "Pre test"),
    postTestQuestions: ph("07-post", "Post test"),
    passingGrade: 70,
    testsUseSameQuestions: false,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "PUBLISH",
  },
  {
    id: "cls-08",
    kategori: "Onboarding",
    fullname: "Pro Hire Mei 2026",
    shortname: "batch_1",
    date: "12 Mei 2026 - 16 Mei 2026",
    jabatan: ["Pro Hire"],
    kategoriPelatihan: ["SDM"],
    materials: [],
    preTestQuestions: [],
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: true,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "DRAFT",
  },
  {
    id: "cls-09",
    kategori: "Onboarding",
    fullname: "Pro Hire Juni 2026",
    shortname: "batch_2",
    date: "09 Jun 2026 - 13 Jun 2026",
    jabatan: ["Pro Hire"],
    kategoriPelatihan: ["SDM", "IT"],
    materials: [],
    preTestQuestions: [],
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: true,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "DRAFT",
  },
  {
    id: "cls-10",
    kategori: "LMS",
    fullname: "Dasar Kepatuhan & Hukum Korporat",
    shortname: "lms_hukum1",
    date: "01 Mei 2026 - 30 Mei 2026",
    jabatan: ["Staff", "Kaur", "Kasek"],
    kategoriPelatihan: ["Hukum", "Kepatuhan"],
    materials: [],
    preTestQuestions: ph("10-pre", "Pre test"),
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: false,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "DRAFT",
  },
  {
    id: "cls-11",
    kategori: "LMS",
    fullname: "Manajemen Keuangan untuk Pimpinan",
    shortname: "lms_keu1",
    date: "01 Jun 2026 - 30 Jun 2026",
    jabatan: ["Kadep", "Kadiv"],
    kategoriPelatihan: ["Keuangan"],
    materials: [],
    preTestQuestions: [],
    postTestQuestions: [],
    passingGrade: 70,
    testsUseSameQuestions: true,
    testLevelLabel: "Lvl 2 — Pengetahuan",
    journeyMateriId: null,
    visible: "DRAFT",
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function nextId(rows: CourseRow[]): string {
  const nums = rows
    .map((r) => parseInt(r.id.replace("cls-", ""), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `cls-${String(next).padStart(2, "0")}`
}

function MultiChip<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: readonly T[]
  selected: T[]
  onChange: (v: T[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function toggle(opt: T) {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    )
  }

  const displayText =
    selected.length === 0 ? (
      <span className="text-muted-foreground">
        Pilih {label.toLowerCase()}...
      </span>
    ) : (
      <span className="flex flex-wrap gap-1">
        {selected.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
          >
            {s}
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
                toggle(s)
              }}
              className="leading-none hover:text-red-500"
            >
              &times;
            </button>
          </span>
        ))}
      </span>
    )

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-9.5 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
      >
        <span className="flex-1 text-left">{displayText}</span>
        <ChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {options.map((opt) => {
            const checked = selected.includes(opt)
            return (
              <label
                key={opt}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition hover:bg-accent",
                  checked && "bg-primary/5 font-medium text-primary"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt)}
                  className="accent-primary"
                />
                {opt}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ClassesPage() {
  const [courses, setCourses] = useState<CourseRow[]>(initialCourses)
  const [showEntries, setShowEntries] = useState(20)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | "All">(
    "All"
  )

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fKategori, setFKategori] = useState<CourseCategory>("Onboarding")
  const [fFullname, setFFullname] = useState("")
  const [fShortname, setFShortname] = useState("")
  const [fDate, setFDate] = useState("")
  const [fJabatan, setFJabatan] = useState<JabatanKey[]>([])
  const [fKategoriPelatihan, setFKategoriPelatihan] = useState<
    KategoriPelatihan[]
  >([])
  const [fVisible, setFVisible] = useState<VisibleStatus>("DRAFT")
  const [publishError, setPublishError] = useState(false)

  const [materialCourseId, setMaterialCourseId] = useState<string | null>(null)
  const [mTitle, setMTitle] = useState("")
  const [mType, setMType] = useState<ContentType>("Deskripsi")
  const [mDescription, setMDescription] = useState("")
  const [mLink, setMLink] = useState("")
  const [mDeadline, setMDeadline] = useState("")

  const [testCourseId, setTestCourseId] = useState<string | null>(null)

  // Delete confirm
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const filtered = courses
    .filter((c) => categoryFilter === "All" || c.kategori === categoryFilter)
    .filter(
      (c) =>
        !search ||
        c.fullname.toLowerCase().includes(search.toLowerCase()) ||
        c.shortname.toLowerCase().includes(search.toLowerCase()) ||
        c.kategori.toLowerCase().includes(search.toLowerCase())
    )
  const displayed = filtered.slice(0, showEntries)

  function openAdd() {
    setEditingId(null)
    setFKategori("Onboarding")
    setFFullname("")
    setFShortname("")
    setFDate("")
    setFJabatan([])
    setFKategoriPelatihan([])
    setFVisible("DRAFT")
    setPublishError(false)
    setShowModal(true)
  }

  function openEdit(row: CourseRow) {
    setEditingId(row.id)
    setFKategori(row.kategori)
    setFFullname(row.fullname)
    setFShortname(row.shortname)
    setFDate(row.date)
    setFJabatan(row.jabatan)
    setFKategoriPelatihan(row.kategoriPelatihan)
    setFVisible(row.visible)
    setPublishError(false)
    setShowModal(true)
  }

  function handleVisibleChange(val: VisibleStatus) {
    if (val !== "PUBLISH") {
      setPublishError(false)
      setFVisible(val)
      return
    }
    const cur =
      editingId != null ? courses.find((c) => c.id === editingId) : null
    if (!testsConfiguredForPublish(cur)) {
      setPublishError(true)
      return
    }
    setPublishError(false)
    setFVisible(val)
  }

  function handleSave() {
    if (!fFullname.trim()) return
    const existing = editingId
      ? courses.find((c) => c.id === editingId)
      : undefined
    const keepTests = testsConfiguredForPublish(existing)
    if (fVisible === "PUBLISH" && !keepTests) {
      setPublishError(true)
      return
    }
    const row: CourseRow = {
      id: editingId ?? nextId(courses),
      kategori: fKategori,
      fullname: fFullname.trim(),
      shortname: fShortname.trim(),
      date: fDate.trim(),
      jabatan: fJabatan,
      kategoriPelatihan: fKategoriPelatihan,
      materials: existing?.materials ?? [],
      preTestQuestions: existing?.preTestQuestions ?? [],
      postTestQuestions: existing?.postTestQuestions ?? [],
      passingGrade: existing?.passingGrade ?? 70,
      testsUseSameQuestions: existing?.testsUseSameQuestions ?? true,
      testLevelLabel: existing?.testLevelLabel ?? "Lvl 2 — Pengetahuan",
      journeyMateriId: existing?.journeyMateriId ?? null,
      visible: fVisible,
    }
    setCourses((prev) =>
      editingId
        ? prev.map((c) => (c.id === editingId ? row : c))
        : [...prev, row]
    )
    setShowModal(false)
  }

  function handleDelete(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id))
    setDeleteTargetId(null)
  }

  function openMaterialModal(courseId: string) {
    setMaterialCourseId(courseId)
    setMTitle("")
    setMType("Deskripsi")
    setMDescription("")
    setMLink("")
    setMDeadline("")
  }

  function saveMaterialQuick() {
    if (!materialCourseId) return
    const titleT = mTitle.trim()
    const descT = mDescription.trim()
    if (!titleT && !descT) return
    const mat: CourseMaterialItem = {
      id: newCourseMaterialId(materialCourseId),
      title: titleT,
      type: titleT ? mType : "Deskripsi",
      description: descT,
      link: mLink.trim(),
      deadline: mDeadline.trim(),
    }
    setCourses((prev) =>
      prev.map((c) =>
        c.id === materialCourseId
          ? { ...c, materials: [...c.materials, mat] }
          : c
      )
    )
    setMaterialCourseId(null)
  }

  function openTestModal(id: string) {
    if (!courses.find((x) => x.id === id)) return
    setTestCourseId(id)
  }

  function saveCourseTests(payload: CourseTestEditorValues) {
    if (!testCourseId) return
    const pre = payload.preTestQuestions
    const post = payload.testsUseSameQuestions ? pre : payload.postTestQuestions
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== testCourseId) return c
        return {
          ...c,
          preTestQuestions: pre,
          postTestQuestions: post,
          testsUseSameQuestions: payload.testsUseSameQuestions,
          passingGrade: clampPassingGrade(
            String(payload.passingGrade),
            c.passingGrade
          ),
          testLevelLabel: payload.testLevelLabel.trim() || "Lvl 2 — Pengetahuan",
          journeyMateriId: payload.journeyMateriId?.trim()
            ? payload.journeyMateriId.trim()
            : null,
        }
      })
    )
    const mid = payload.journeyMateriId?.trim()
    if (mid) {
      persistCourseQuizForMateri(mid, {
        preTestQuestions: pre,
        postTestQuestions: post,
        testsUseSameQuestions: payload.testsUseSameQuestions,
        passingGrade: clampPassingGrade(String(payload.passingGrade), 70),
        testLevelLabel: payload.testLevelLabel.trim() || "Lvl 2 — Pengetahuan",
      })
    }
    setTestCourseId(null)
  }

  /** Snapshot untuk modal sesuai course terbaru */
  const testEditorInitial = useMemo((): CourseTestEditorValues => {
    const c = testCourseId ? courses.find((x) => x.id === testCourseId) : null
    if (!c) {
      return {
        preTestQuestions: [],
        postTestQuestions: [],
        testsUseSameQuestions: true,
        passingGrade: 70,
        testLevelLabel: "Lvl 2 — Pengetahuan",
        journeyMateriId: null,
      }
    }
    return {
      preTestQuestions:
        c.preTestQuestions.length > 0
          ? JSON.parse(JSON.stringify(c.preTestQuestions))
          : [newEmptyQuestion()],
      postTestQuestions:
        c.postTestQuestions.length > 0
          ? JSON.parse(JSON.stringify(c.postTestQuestions))
          : [newEmptyQuestion()],
      testsUseSameQuestions: c.testsUseSameQuestions,
      passingGrade: c.passingGrade,
      testLevelLabel: c.testLevelLabel || "Lvl 2 — Pengetahuan",
      journeyMateriId: c.journeyMateriId,
    }
  }, [testCourseId, courses])

  useEffect(() => {
    const seed = initialCourses.find((x) => x.id === "cls-01")
    if (
      seed?.journeyMateriId &&
      seed.preTestQuestions.length > 0
    ) {
      persistCourseQuizForMateri(seed.journeyMateriId, {
        preTestQuestions: seed.preTestQuestions,
        postTestQuestions: seed.testsUseSameQuestions
          ? seed.preTestQuestions
          : seed.postTestQuestions,
        testsUseSameQuestions: seed.testsUseSameQuestions,
        passingGrade: seed.passingGrade,
        testLevelLabel: seed.testLevelLabel || "Lvl 2 — Pengetahuan",
      })
    }
  }, [])

  const modalCoursePreview =
    editingId != null ? courses.find((c) => c.id === editingId) : null
  const canPublishForm = testsConfiguredForPublish(modalCoursePreview ?? undefined)

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
            Manajemen Kelas
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola daftar course onboarding dan LMS. Course hanya bisa dipublish
            jika bank soal pre/post (pilihan ganda) sudah lengkap lewat ikon
            clipboard — tidak di form Edit. Ikon Tambah materi dan Atur test ada
            di kolom terkanan bersama Edit dan Hapus. Isi opsional ID materi
            journey agar soal tampil di layar peserta (mock: localStorage).
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            show
            <select
              value={showEntries}
              onChange={(e) => setShowEntries(Number(e.target.value))}
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap text-muted-foreground">
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as CourseCategory | "All")
              }
              className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Onboarding">Onboarding</option>
              <option value="LMS">LMS</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 pl-9"
            />
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="size-4" />
            Tambah Courses
          </Button>
        </div>
      </div>

      {/* Table */}
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
                  Jabatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Test
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
              {displayed.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Tidak ada course ditemukan.
                  </td>
                </tr>
              ) : (
                displayed.map((row, index) => {
                  const hasPreTest = row.preTestQuestions.length > 0
                  const hasPostTest = row.testsUseSameQuestions
                    ? hasPreTest
                    : row.postTestQuestions.length > 0
                  const canPublish = hasPreTest && hasPostTest
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition hover:bg-muted/40",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <td className="px-4 py-3.5 font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            row.kategori === "Onboarding"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-violet-100 text-violet-700"
                          )}
                        >
                          {row.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {row.fullname}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {row.shortname}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                        {row.date}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {row.jabatan.slice(0, 3).map((j) => (
                            <span
                              key={j}
                              className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                            >
                              {j}
                            </span>
                          ))}
                          {row.jabatan.length > 3 && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                              +{row.jabatan.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            title={
                              hasPreTest
                                ? `${row.preTestQuestions.length} soal pre`
                                : "Belum ada pre test"
                            }
                          >
                            {hasPreTest ? (
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="size-3.5 text-red-400" />
                            )}
                          </span>
                          <span
                            title={
                              hasPostTest
                                ? row.testsUseSameQuestions
                                  ? "Post = bank sama dengan pre"
                                  : `${row.postTestQuestions.length} soal post`
                                : "Belum ada post test"
                            }
                          >
                            {hasPostTest ? (
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="size-3.5 text-red-400" />
                            )}
                          </span>
                          {!canPublish && (
                            <span className="text-[10px] text-amber-500">
                              Belum lengkap
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            row.visible === "PUBLISH"
                              ? "border-emerald-400 text-emerald-600"
                              : "border-slate-300 text-slate-500"
                          )}
                        >
                          {row.visible}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-blue-600 bg-blue-600 text-xs text-white hover:bg-blue-700"
                        >
                          <Download className="size-3" />
                          Unduh
                        </Button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openMaterialModal(row.id)}
                            className="cursor-pointer text-muted-foreground transition hover:text-violet-600"
                            title="Tambah materi"
                          >
                            <FilePlus className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openTestModal(row.id)}
                            className="cursor-pointer text-muted-foreground transition hover:text-teal-600"
                            title="Tambah / atur test"
                          >
                            <ClipboardList className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="cursor-pointer text-muted-foreground transition hover:text-primary"
                            title="Edit"
                          >
                            <PencilLine className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(row.id)}
                            className="cursor-pointer text-muted-foreground transition hover:text-red-500"
                            title="Hapus"
                          >
                            <Trash2 className="size-4" />
                          </button>
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
        Menampilkan {displayed.length} dari {filtered.length} course
      </p>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6">
          <div className="my-auto w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit Course" : "Tambah Course"}
            </h3>
            <div className="space-y-4">
              {/* Kategori Course */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kategori Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={fKategori}
                  onChange={(e) =>
                    setFKategori(e.target.value as CourseCategory)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="Onboarding">Onboarding</option>
                  <option value="LMS">LMS</option>
                </select>
              </div>

              {/* Fullname */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Fullname <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fFullname}
                  onChange={(e) => setFFullname(e.target.value)}
                  placeholder="Contoh: PKWT April 2026"
                />
              </div>

              {/* Shortname & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Shortname
                  </label>
                  <Input
                    value={fShortname}
                    onChange={(e) => setFShortname(e.target.value)}
                    placeholder="batch_1"
                    className="font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Date</label>
                  <Input
                    value={fDate}
                    onChange={(e) => setFDate(e.target.value)}
                    placeholder="07 Apr - 11 Apr 2026"
                  />
                </div>
              </div>

              {/* Jabatan multi-select */}
              <MultiChip
                label="Jabatan Terkait"
                options={ALL_JABATAN}
                selected={fJabatan}
                onChange={setFJabatan}
              />

              {/* Kategori Pelatihan multi-select */}
              <MultiChip
                label="Kategori Pelatihan"
                options={ALL_KATEGORI}
                selected={fKategoriPelatihan}
                onChange={setFKategoriPelatihan}
              />

              {/* Visible */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Visible
                </label>
                <select
                  value={fVisible}
                  onChange={(e) =>
                    handleVisibleChange(e.target.value as VisibleStatus)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISH" disabled={!canPublishForm}>
                    PUBLISH
                    {!canPublishForm ? " (isi pre & post test dulu)" : ""}
                  </option>
                </select>
                {publishError && (
                  <p className="mt-1 text-xs text-red-500">
                    Pre Test dan Post Test harus diisi sebelum course bisa
                    dipublish.
                  </p>
                )}
                {editingId != null && !canPublishForm ? (
                  <p className="mt-1 text-[11px] text-amber-600">
                    Atur pre/post test lewat ikon clipboard pada baris tabel
                    sebelum memilih PUBLISH.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button type="button" onClick={handleSave}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {materialCourseId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-semibold">
              Tambah materi ke course
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Isi judul dan/atau deskripsi — boleh hanya deskripsi (mis. &quot;Materi
              Pengenalan&quot;). Jika tanpa judul, tipe otomatis Deskripsi.
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Judul materi{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional jika ada deskripsi)
                  </span>
                </label>
                <Input
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  placeholder="Contoh: Video orientasi"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tipe
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (diabaikan jika hanya deskripsi)
                  </span>
                </label>
                <SearchableSelect
                  value={mType}
                  onChange={(v) => setMType(v as ContentType)}
                  options={CONTENT_TYPE_OPTIONS.map((t) => ({
                    value: t,
                    label: t,
                  }))}
                  placeholder={CONTENT_TYPE_OPTIONS[0]}
                  disabled={!mTitle.trim() && !!mDescription.trim()}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deskripsi
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (boleh mengisi ini saja)
                  </span>
                </label>
                <textarea
                  value={mDescription}
                  onChange={(e) => setMDescription(e.target.value)}
                  className="min-h-16 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
                  placeholder='Contoh: Materi Pengenalan'
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Link (opsional)
                </label>
                <Input
                  value={mLink}
                  onChange={(e) => setMLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deadline (opsional)
                </label>
                <Input
                  value={mDeadline}
                  onChange={(e) => setMDeadline(e.target.value)}
                  placeholder="Contoh: 15 Apr 2026"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMaterialCourseId(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={saveMaterialQuick}
                disabled={!mTitle.trim() && !mDescription.trim()}
              >
                Simpan materi
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <CourseTestEditorModal
        open={testCourseId !== null}
        onClose={() => setTestCourseId(null)}
        initial={testEditorInitial}
        onSave={saveCourseTests}
      />

      {/* Delete Confirm */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Hapus Course?</h3>
            <p className="text-sm text-muted-foreground">
              Data course ini akan dihapus dan tidak dapat dikembalikan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setDeleteTargetId(null)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                type="button"
                onClick={() => handleDelete(deleteTargetId)}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

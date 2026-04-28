import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  BookCopy,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  PencilLine,
  PlayCircle,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFeatureByPath } from "@/lib/app-features"
import { getRolePermissions, getStoredDemoUser } from "@/lib/demo-access"
import { cn } from "@/lib/utils"

const feature = getFeatureByPath("/modul-pembelajaran-interaktif")!

// ─── Types ──────────────────────────────────────────────────────────────────
type ContentType =
  | "Deskripsi"
  | "Pilihan Ganda"
  | "Essay"
  | "PDF"
  | "Video"
  | "Tugas"

type ModuleItem = {
  id: string
  title: string
  type: ContentType
  description: string
  link: string
  deadline: string
}

type CourseCategory = "Onboarding" | "LMS"
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

type CourseMaterialItem = {
  id: string
  title: string
  type: ContentType
  description: string
  link: string
  deadline: string
}

type Course = {
  id: string
  title: string
  description: string
  category: CourseCategory
  jabatan: JabatanKey[]
  kategoriPelatihan: KategoriPelatihan[]
  /** Materi per course (admin) */
  materials: CourseMaterialItem[]
  preTest: string
  postTest: string
  /** true: satu input mengisi pre & post; false: boleh beda */
  testsUseSameQuestions: boolean
  published: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────
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
const sectionLabels: Record<string, string> = {
  "class-setting": "Setting class / batch",
  "review-task": "Review tugas mentee",
  harmonisasi: "Harmonisasi hasil belajar",
  "setting-penilaian": "Setting penilaian mentee",
}

// ─── Seed data ───────────────────────────────────────────────────────────────
const seedCourses: Course[] = [
  {
    id: "crs-1",
    title: "Orientasi & Budaya Kerja Peruri",
    description:
      "Course pengenalan nilai, budaya kerja, dan tata tertib perusahaan untuk peserta onboarding baru.",
    category: "Onboarding",
    jabatan: ["PKWT", "Pro Hire", "MT"],
    kategoriPelatihan: ["SDM", "Umum"],
    materials: [],
    preTest: "Kuis 10 soal pilihan ganda — pemahaman awal budaya kerja",
    postTest:
      "Essay refleksi singkat — implementasi nilai AKHLAK di tempat kerja",
    testsUseSameQuestions: false,
    published: true,
  },
  {
    id: "crs-2",
    title: "Pengenalan Tools Internal & Sistem IT",
    description:
      "Pelatihan penggunaan sistem internal, aplikasi kolaborasi, dan keamanan data.",
    category: "Onboarding",
    jabatan: ["PKWT", "Pro Hire", "MT", "Staff"],
    kategoriPelatihan: ["IT"],
    materials: [],
    preTest: "Kuis 5 soal — identifikasi tools yang sudah diketahui",
    postTest: "Praktik singkat — demonstrasi penggunaan aplikasi internal",
    testsUseSameQuestions: false,
    published: true,
  },
  {
    id: "crs-3",
    title: "Dasar Kepatuhan & Hukum Korporat",
    description:
      "Pemahaman dasar regulasi internal, etika bisnis, dan kewajiban hukum karyawan.",
    category: "LMS",
    jabatan: ["Staff", "Kaur", "Kasek", "Kadep"],
    kategoriPelatihan: ["Hukum", "Kepatuhan"],
    materials: [],
    preTest: "Kuis 10 soal — pemahaman regulasi dasar",
    postTest: "",
    testsUseSameQuestions: false,
    published: false,
  },
  {
    id: "crs-4",
    title: "Manajemen Keuangan untuk Pimpinan",
    description:
      "Pengelolaan anggaran, laporan keuangan, dan pengambilan keputusan berbasis data keuangan.",
    category: "LMS",
    jabatan: ["Kadep", "Kadiv"],
    kategoriPelatihan: ["Keuangan"],
    materials: [],
    preTest: "",
    postTest: "",
    testsUseSameQuestions: true,
    published: false,
  },
]

const initialItems: ModuleItem[] = [
  {
    id: "mod-1",
    title: "Deskripsi class & objective onboarding",
    type: "Deskripsi",
    description:
      "Ringkasan tujuan class, kompetensi yang dicapai, dan alur penyelesaian.",
    link: "",
    deadline: "12 Apr 2026",
  },
  {
    id: "mod-2",
    title: "Video budaya kerja Peruri",
    type: "Video",
    description: "Video pengenalan budaya kerja dan nilai AKHLAK.",
    link: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    deadline: "14 Apr 2026",
  },
  {
    id: "mod-3",
    title: "Panduan onboarding PDF",
    type: "PDF",
    description: "Dokumen panduan onboarding perusahaan dan tata tertib kelas.",
    link: "https://developer.mozilla.org/en-US/docs/Learn",
    deadline: "14 Apr 2026",
  },
  {
    id: "mod-4",
    title: "Pre-Test pemahaman awal",
    type: "Pilihan Ganda",
    description: "Kuis pilihan ganda sebelum memulai materi inti.",
    link: "",
    deadline: "15 Apr 2026",
  },
  {
    id: "mod-5",
    title: "Refleksi onboarding",
    type: "Essay",
    description:
      "Tulis refleksi singkat tentang pemahaman Anda terhadap proses onboarding.",
    link: "",
    deadline: "16 Apr 2026",
  },
  {
    id: "mod-6",
    title: "Tugas ringkasan materi",
    type: "Tugas",
    description: "Unggah ringkasan materi atau jawaban tugas ke sistem LMS.",
    link: "",
    deadline: "18 Apr 2026",
  },
]

const mentorReviewQueue = [
  {
    id: "review-ayu",
    user: "Ayu Pratama",
    task: "Ringkasan budaya kerja",
    status: "Siap direview",
    note: "Coaching sesi 2 selesai dan tinggal validasi mentor.",
  },
  {
    id: "review-raka",
    user: "Raka Saputra",
    task: "Resume orientation class",
    status: "Perlu revisi",
    note: "Tambahkan contoh implementasi budaya kerja pada unit.",
  },
  {
    id: "review-dina",
    user: "Dina Maharani",
    task: "Project awal onboarding",
    status: "Monitoring",
    note: "Menunggu konfirmasi akhir sebelum masuk evaluasi.",
  },
]

// ─── Multi-select checkbox helper ────────────────────────────────────────────
function MultiCheckbox<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: readonly T[]
  selected: T[]
  onChange: (val: T[]) => void
}) {
  function toggle(opt: T) {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    )
  }
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-slate-200 bg-muted text-muted-foreground hover:border-primary/50"
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LearningModulesPage() {
  const [searchParams] = useSearchParams()
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)

  // Participant / mentor / examiner state
  const [items] = useState<ModuleItem[]>(initialItems)
  const [taskSubmission, setTaskSubmission] = useState("")
  const [taskSubmitted, setTaskSubmitted] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>([])

  // Admin course management state
  const [courses, setCourses] = useState<Course[]>(seedCourses)
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | "All">(
    "All"
  )
  const [showForm, setShowForm] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [fTitle, setFTitle] = useState("")
  const [fDescription, setFDescription] = useState("")
  const [fCategory, setFCategory] = useState<CourseCategory>("Onboarding")
  const [fJabatan, setFJabatan] = useState<JabatanKey[]>([])
  const [fKategori, setFKategori] = useState<KategoriPelatihan[]>([])
  const [fPreTest, setFPreTest] = useState("")
  const [fPostTest, setFPostTest] = useState("")
  /** Form course: satu field pre+post jika true */
  const [fTestsSame, setFTestsSame] = useState(true)
  const [fTestShared, setFTestShared] = useState("")

  const selectedSection = searchParams.get("section") ?? ""
  const focusLabel = sectionLabels[selectedSection]

  const totalMaterials = items.filter(
    (i) => i.type === "PDF" || i.type === "Video"
  ).length
  const totalAssessments = items.filter(
    (i) => i.type === "Pilihan Ganda" || i.type === "Essay"
  ).length

  const filteredCourses =
    categoryFilter === "All"
      ? courses
      : courses.filter((c) => c.category === categoryFilter)

  function toggleComplete(id: string) {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // ── Course helpers (admin) ─────────────────────────────────────────────────
  function openNewCourse() {
    setEditingCourseId(null)
    setFTitle("")
    setFDescription("")
    setFCategory("Onboarding")
    setFJabatan([])
    setFKategori([])
    setFTestsSame(true)
    setFTestShared("")
    setFPreTest("")
    setFPostTest("")
    setShowForm(true)
  }

  function openEditCourse(c: Course) {
    setEditingCourseId(c.id)
    setFTitle(c.title)
    setFDescription(c.description)
    setFCategory(c.category)
    setFJabatan(c.jabatan)
    setFKategori(c.kategoriPelatihan)
    const pt = c.preTest.trim()
    const po = c.postTest.trim()
    if (pt === po) {
      setFTestsSame(true)
      setFTestShared(c.preTest)
      setFPreTest("")
      setFPostTest("")
    } else {
      setFTestsSame(false)
      setFPreTest(c.preTest)
      setFPostTest(c.postTest)
      setFTestShared("")
    }
    setShowForm(true)
  }

  function handleCourseSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fTitle.trim()) return
    const preT = fTestsSame ? fTestShared.trim() : fPreTest.trim()
    const postT = fTestsSame ? fTestShared.trim() : fPostTest.trim()
    const baseFields = {
      title: fTitle.trim(),
      description: fDescription.trim(),
      category: fCategory,
      jabatan: fJabatan,
      kategoriPelatihan: fKategori,
      preTest: preT,
      postTest: postT,
      testsUseSameQuestions: fTestsSame,
    }
    setCourses((prev) => {
      if (editingCourseId) {
        return prev.map((c) =>
          c.id === editingCourseId ? { ...c, ...baseFields } : c
        )
      }
      const id = `crs-${crypto.randomUUID().slice(0, 6)}`
      return [...prev, { id, published: false, materials: [], ...baseFields }]
    })
    setShowForm(false)
  }

  function deleteCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id))
    if (editingCourseId === id) setShowForm(false)
  }

  function togglePublish(id: string) {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const canPublish = c.preTest.trim() && c.postTest.trim()
        if (!canPublish) return c
        return { ...c, published: !c.published }
      })
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <FeaturePageLayout feature={feature}>
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">
              Materi & konten pembelajaran
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tampilan halaman ini otomatis menyesuaikan hak akses login untuk
              Admin PSP, Mentor / Co-mentor, Penguji Internal, atau peserta
              onboarding.
            </p>
            {focusLabel ? (
              <p className="mt-2 text-xs font-medium text-primary">
                Fokus menu: {focusLabel}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 text-left sm:text-right">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Akses aktif: {permissions.label}
            </span>
            <p className="max-w-xs text-xs text-muted-foreground">
              {permissions.description}
            </p>
          </div>
        </div>
      </section>

      {permissions.canManageModules ? (
        /* ── ADMIN VIEW ──────────────────────────────────────────────────── */
        <section className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                Kategori Course
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
              <span className="text-xs text-muted-foreground">
                {filteredCourses.length} course
              </span>
            </div>
            <Button type="button" onClick={openNewCourse}>
              <BookCopy className="size-4" />
              Buat Course
            </Button>
          </div>

          <div
            className={cn(
              "grid gap-4",
              showForm ? "xl:grid-cols-[1fr_420px]" : ""
            )}
          >
            {/* Course list */}
            <div className="space-y-3">
              {filteredCourses.length === 0 && (
                <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  Belum ada course. Klik "Buat Course" untuk menambah.
                </div>
              )}
              {filteredCourses.map((course) => {
                const hasPreTest = !!course.preTest.trim()
                const hasPostTest = !!course.postTest.trim()
                const canPublish = hasPreTest && hasPostTest
                const sameTestCombined =
                  course.testsUseSameQuestions &&
                  course.preTest.trim() !== "" &&
                  course.preTest.trim() === course.postTest.trim()
                return (
                  <div
                    key={course.id}
                    className="rounded-xl border bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              course.category === "Onboarding"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-violet-100 text-violet-700"
                            )}
                          >
                            {course.category}
                          </span>
                          {course.published ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Published
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                              Draft
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 font-semibold">{course.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    {/* Jabatan & Kategori tags */}
                    <div className="mt-3 space-y-2">
                      {course.jabatan.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Jabatan:
                          </span>
                          {course.jabatan.map((j) => (
                            <span
                              key={j}
                              className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700"
                            >
                              {j}
                            </span>
                          ))}
                        </div>
                      )}
                      {course.kategoriPelatihan.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Pelatihan:
                          </span>
                          {course.kategoriPelatihan.map((k) => (
                            <span
                              key={k}
                              className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] text-teal-700"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pre/Post test status */}
                    <div className="mt-3 flex flex-wrap gap-3">
                      {sameTestCombined ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                          <span className="font-medium text-emerald-700">
                            Pre &amp; Post test (soal sama)
                          </span>
                          <span className="text-muted-foreground">
                            — {course.preTest}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-xs">
                            {hasPreTest ? (
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="size-3.5 text-red-400" />
                            )}
                            <span
                              className={
                                hasPreTest ? "text-emerald-700" : "text-red-500"
                              }
                            >
                              Pre Test
                            </span>
                            {hasPreTest && (
                              <span className="text-muted-foreground">
                                — {course.preTest}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            {hasPostTest ? (
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="size-3.5 text-red-400" />
                            )}
                            <span
                              className={
                                hasPostTest
                                  ? "text-emerald-700"
                                  : "text-red-500"
                              }
                            >
                              Post Test
                            </span>
                            {hasPostTest && (
                              <span className="text-muted-foreground">
                                — {course.postTest}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!canPublish && (
                      <p className="mt-2 text-[11px] text-amber-600">
                        Pre Test dan Post Test harus diisi sebelum bisa
                        dipublish.
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={course.published ? "outline" : "default"}
                        disabled={!canPublish}
                        onClick={() => togglePublish(course.id)}
                        className={cn(
                          !canPublish && "cursor-not-allowed opacity-50"
                        )}
                      >
                        {course.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEditCourse(course)}
                      >
                        <PencilLine className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCourse(course.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Course form panel */}
            {showForm && (
              <form
                onSubmit={handleCourseSave}
                className="space-y-4 self-start rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    {editingCourseId ? "Edit Course" : "Buat Course Baru"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Tutup
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Judul Course
                  </label>
                  <Input
                    value={fTitle}
                    onChange={(e) => setFTitle(e.target.value)}
                    placeholder="Contoh: Orientasi Budaya Kerja"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Deskripsi
                  </label>
                  <textarea
                    value={fDescription}
                    onChange={(e) => setFDescription(e.target.value)}
                    className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Ringkasan tujuan dan isi course..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Kategori Course
                  </label>
                  <select
                    value={fCategory}
                    onChange={(e) =>
                      setFCategory(e.target.value as CourseCategory)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  >
                    <option value="Onboarding">Onboarding</option>
                    <option value="LMS">LMS</option>
                  </select>
                </div>

                <MultiCheckbox
                  label="Jabatan Terkait"
                  options={ALL_JABATAN}
                  selected={fJabatan}
                  onChange={setFJabatan}
                />

                <MultiCheckbox
                  label="Kategori Pelatihan"
                  options={ALL_KATEGORI}
                  selected={fKategori}
                  onChange={setFKategori}
                />

                <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input accent-primary"
                      checked={fTestsSame}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          const merged =
                            fTestShared.trim() ||
                            fPreTest.trim() ||
                            fPostTest.trim()
                          setFTestShared(merged)
                          setFPreTest("")
                          setFPostTest("")
                        } else {
                          const base =
                            fTestShared.trim() ||
                            fPreTest.trim() ||
                            fPostTest.trim()
                          setFPreTest(base)
                          setFPostTest(base)
                          setFTestShared("")
                        }
                        setFTestsSame(checked)
                      }}
                    />
                    Pre dan post test memakai deskripsi/soal yang sama (satu isian)
                  </label>

                  {fTestsSame ? (
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Pre &amp; Post test{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={fTestShared}
                        onChange={(e) => setFTestShared(e.target.value)}
                        className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        placeholder="Contoh: Bank 25 soal pilihan ganda — dipakai untuk pre dan post."
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Pre Test <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={fPreTest}
                          onChange={(e) => setFPreTest(e.target.value)}
                          placeholder="Contoh: Kuis 10 soal pilihan ganda"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Post Test <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={fPostTest}
                          onChange={(e) => setFPostTest(e.target.value)}
                          placeholder="Contoh: Essay refleksi singkat"
                        />
                      </div>
                    </>
                  )}
                </div>

                {!(
                  (fTestsSame ? fTestShared.trim() : fPreTest.trim()) &&
                  (fTestsSame ? fTestShared.trim() : fPostTest.trim())
                ) ? (
                  <p className="text-[11px] text-amber-600">
                    Isi Pre Test dan Post Test agar course bisa dipublish.
                  </p>
                ) : null}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCourseId ? "Simpan Perubahan" : "Buat Course"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      ) : permissions.canReviewTasks ? (
        /* ── MENTOR VIEW ─────────────────────────────────────────────────── */
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Review tugas mentee</h2>
            </div>
            <div className="mt-4 space-y-3">
              {mentorReviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.task}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.note}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/journey-onboarding?section=coaching">
                        Lihat coaching
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/evaluasi-feedback">Buka hasil evaluasi</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Ringkasan materi aktif</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Materi referensi: {totalMaterials} item</li>
                <li>• Soal / assessment: {totalAssessments} item</li>
                <li>• Fokus mentor: coaching, review project, dan progres</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Aksi cepat mentor</h2>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=progress">
                    Pantau progress mentee
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/evaluasi-feedback?section=score-input">
                    Cek kesiapan penilaian
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : permissions.canManageExaminer ? (
        /* ── EXAMINER VIEW ───────────────────────────────────────────────── */
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Materi acuan penguji</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Fokus penguji</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Melihat nama peserta yang siap diuji</li>
                <li>• Membandingkan hasil tugas dengan materi acuan</li>
                <li>• Lanjut ke input nilai pada management penguji</li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link to="/evaluasi-feedback?section=score-input">
                Lanjut input nilai
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        /* ── PARTICIPANT VIEW ────────────────────────────────────────────── */
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Akses konten pembelajaran</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.type}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.link ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={item.link} target="_blank" rel="noreferrer">
                          {item.type === "Video" ? (
                            <PlayCircle className="size-4" />
                          ) : (
                            <LinkIcon className="size-4" />
                          )}
                          Buka materi
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => toggleComplete(item.id)}
                    >
                      {completedIds.includes(item.id)
                        ? "Sudah selesai"
                        : "Tandai selesai"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Pengumpulan tugas</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload materi tugas, jawaban, atau catatan pembelajaran dari
                user onboarding.
              </p>
              <textarea
                value={taskSubmission}
                onChange={(e) => setTaskSubmission(e.target.value)}
                className="mt-4 min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Contoh: tautan file tugas, ringkasan materi, atau jawaban essay..."
              />
              <Button
                type="button"
                className="mt-4 w-full"
                disabled={!taskSubmission.trim()}
                onClick={() => setTaskSubmitted(true)}
              >
                Kumpulkan tugas
              </Button>
              {taskSubmitted ? (
                <p className="mt-2 text-sm text-primary">
                  Tugas berhasil dikirim (demo).
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Progress belajar</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  • Materi selesai: {completedIds.length}/{items.length}
                </li>
                <li>• Tugas terkirim: {taskSubmitted ? "Ya" : "Belum"}</li>
                <li>• Langkah berikutnya: lanjut ke evaluasi dan test</li>
              </ul>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/evaluasi-feedback">
                  Lanjut ke Pre-Test / Post-Test
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </FeaturePageLayout>
  )
}

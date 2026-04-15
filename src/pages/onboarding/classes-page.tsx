import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  Download,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Trash2,
  XCircle,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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

type CourseRow = {
  id: string
  kategori: CourseCategory
  fullname: string
  shortname: string
  date: string
  jabatan: JabatanKey[]
  kategoriPelatihan: KategoriPelatihan[]
  preTest: string
  postTest: string
  visible: VisibleStatus
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

// ─── Seed data ────────────────────────────────────────────────────────────────
const initialCourses: CourseRow[] = [
  {
    id: "cls-01",
    kategori: "Onboarding",
    fullname: "PKWT April 2026",
    shortname: "batch_1",
    date: "07 Apr 2026 - 11 Apr 2026",
    jabatan: ["PKWT"],
    kategoriPelatihan: ["SDM", "Umum"],
    preTest: "Kuis 10 soal pilihan ganda — pemahaman awal budaya kerja",
    postTest: "Essay refleksi nilai AKHLAK",
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
    preTest: "Kuis 10 soal pilihan ganda",
    postTest: "Post test pilihan ganda 10 soal",
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
    preTest: "Kuis awal 5 soal",
    postTest: "",
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
    preTest: "",
    postTest: "",
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
    preTest: "",
    postTest: "",
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
    preTest: "Kuis 10 soal pilihan ganda",
    postTest: "Essay penilaian project awal",
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
    preTest: "Kuis awal onboarding",
    postTest: "Kuis akhir onboarding",
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
    preTest: "",
    postTest: "",
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
    preTest: "",
    postTest: "",
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
    preTest: "Kuis 10 soal regulasi dasar",
    postTest: "",
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
    preTest: "",
    postTest: "",
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
  const [fPreTest, setFPreTest] = useState("")
  const [fPostTest, setFPostTest] = useState("")
  const [fVisible, setFVisible] = useState<VisibleStatus>("DRAFT")
  const [publishError, setPublishError] = useState(false)

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
    setFPreTest("")
    setFPostTest("")
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
    setFPreTest(row.preTest)
    setFPostTest(row.postTest)
    setFVisible(row.visible)
    setPublishError(false)
    setShowModal(true)
  }

  function handleVisibleChange(val: VisibleStatus) {
    if (val === "PUBLISH" && !(fPreTest.trim() && fPostTest.trim())) {
      setPublishError(true)
      return
    }
    setPublishError(false)
    setFVisible(val)
  }

  function handleSave() {
    if (!fFullname.trim()) return
    if (fVisible === "PUBLISH" && !(fPreTest.trim() && fPostTest.trim())) {
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
      preTest: fPreTest.trim(),
      postTest: fPostTest.trim(),
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

  const canPublishForm = fPreTest.trim() && fPostTest.trim()

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
            jika Pre Test dan Post Test sudah diisi.
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
                  const hasPreTest = !!row.preTest.trim()
                  const hasPostTest = !!row.postTest.trim()
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
                              hasPreTest ? row.preTest : "Belum ada pre test"
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
                              hasPostTest ? row.postTest : "Belum ada post test"
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
                        <div className="flex items-center justify-center gap-2">
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

              {/* Pre Test */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Pre Test <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (wajib untuk publish)
                  </span>
                </label>
                <Input
                  value={fPreTest}
                  onChange={(e) => {
                    setFPreTest(e.target.value)
                    setPublishError(false)
                  }}
                  placeholder="Contoh: Kuis 10 soal pilihan ganda"
                />
              </div>

              {/* Post Test */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Post Test <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (wajib untuk publish)
                  </span>
                </label>
                <Input
                  value={fPostTest}
                  onChange={(e) => {
                    setFPostTest(e.target.value)
                    setPublishError(false)
                  }}
                  placeholder="Contoh: Essay refleksi singkat"
                />
              </div>

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
                {!canPublishForm && (
                  <p className="mt-1 text-[11px] text-amber-600">
                    Isi Pre Test dan Post Test agar course bisa dipublish.
                  </p>
                )}
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

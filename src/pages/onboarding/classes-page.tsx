import { useState } from "react"
import { PencilLine, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ClassKategori = "PKWT" | "Prohire" | "Magang Trainee"
type VisibleStatus = "PUBLISH" | "DRAFT"

type ClassRow = {
  id: string
  kategori: ClassKategori
  fullname: string
  shortname: string
  date: string
  visible: VisibleStatus
}

const initialClasses: ClassRow[] = [
  {
    id: "cls-01",
    kategori: "Magang Trainee",
    fullname: "MT-Batch II",
    shortname: "mt2",
    date: "sep - des 2025",
    visible: "PUBLISH",
  },
  {
    id: "cls-02",
    kategori: "PKWT",
    fullname: "PKWT-Batch X",
    shortname: "pkwt10",
    date: "oct - dec 2025",
    visible: "PUBLISH",
  },
  {
    id: "cls-03",
    kategori: "Magang Trainee",
    fullname: "MT-Batch I",
    shortname: "mt1",
    date: "jan - mar 2025",
    visible: "PUBLISH",
  },
  {
    id: "cls-04",
    kategori: "PKWT",
    fullname: "PKWT-Batch IX",
    shortname: "pkwt9",
    date: "feb - apr 2025",
    visible: "DRAFT",
  },
  {
    id: "cls-05",
    kategori: "Magang Trainee",
    fullname: "Leadership Essentials",
    shortname: "mt_lead",
    date: "jan 2025",
    visible: "DRAFT",
  },
  {
    id: "cls-06",
    kategori: "PKWT",
    fullname: "PKWT-Batch VIII",
    shortname: "pkwt8",
    date: "sep - okt 2024",
    visible: "PUBLISH",
  },
  {
    id: "cls-07",
    kategori: "Prohire",
    fullname: "Onboarding Prohire Batch II",
    shortname: "pro_onboard2",
    date: "nov - des 2024",
    visible: "PUBLISH",
  },
  {
    id: "cls-08",
    kategori: "Prohire",
    fullname: "Onboarding Prohire Batch I",
    shortname: "pro_onboard1",
    date: "aug - sep 2024",
    visible: "DRAFT",
  },
]

const KATEGORI_OPTIONS: ClassKategori[] = ["PKWT", "Prohire", "Magang Trainee"]

function nextId(rows: ClassRow[]): string {
  const nums = rows
    .map((r) => parseInt(r.id.replace("cls-", ""), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `cls-${String(next).padStart(2, "0")}`
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>(initialClasses)
  const [showEntries, setShowEntries] = useState(20)
  const [search, setSearch] = useState("")

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formKategori, setFormKategori] = useState<ClassKategori>("PKWT")
  const [formFullname, setFormFullname] = useState("")
  const [formShortname, setFormShortname] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formVisible, setFormVisible] = useState<VisibleStatus>("PUBLISH")

  // Delete confirm
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const filtered = classes.filter(
    (c) =>
      !search ||
      c.fullname.toLowerCase().includes(search.toLowerCase()) ||
      c.shortname.toLowerCase().includes(search.toLowerCase()) ||
      c.kategori.toLowerCase().includes(search.toLowerCase())
  )
  const displayed = filtered.slice(0, showEntries)

  function openAdd() {
    setEditingId(null)
    setFormKategori("PKWT")
    setFormFullname("")
    setFormShortname("")
    setFormDate("")
    setFormVisible("PUBLISH")
    setShowModal(true)
  }

  function openEdit(row: ClassRow) {
    setEditingId(row.id)
    setFormKategori(row.kategori)
    setFormFullname(row.fullname)
    setFormShortname(row.shortname)
    setFormDate(row.date)
    setFormVisible(row.visible)
    setShowModal(true)
  }

  function handleSave() {
    if (!formFullname.trim()) return
    setClasses((prev) => {
      if (editingId) {
        return prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                kategori: formKategori,
                fullname: formFullname,
                shortname: formShortname,
                date: formDate,
                visible: formVisible,
              }
            : c
        )
      }
      const newRow: ClassRow = {
        id: nextId(prev),
        kategori: formKategori,
        fullname: formFullname,
        shortname: formShortname,
        date: formDate,
        visible: formVisible,
      }
      return [...prev, newRow]
    })
    setShowModal(false)
  }

  function handleDelete(id: string) {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setDeleteTargetId(null)
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
            Manajemen Kelas
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Classes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola daftar kelas onboarding berdasarkan kategori dan batch.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            Tambah Classes
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
                  Visible
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  ⚙
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayed.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Tidak ada kelas ditemukan.
                  </td>
                </tr>
              ) : (
                displayed.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition hover:bg-muted/40",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                  >
                    <td className="px-4 py-4 font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 font-bold">{row.kategori}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {row.fullname}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                      {row.shortname}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {row.date}
                    </td>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Menampilkan {displayed.length} dari {filtered.length} entri
      </p>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit Kelas" : "Tambah Kelas"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formKategori}
                  onChange={(e) =>
                    setFormKategori(e.target.value as ClassKategori)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Fullname <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formFullname}
                  onChange={(e) => setFormFullname(e.target.value)}
                  placeholder="Contoh: MT-Batch II"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Shortname
                </label>
                <Input
                  value={formShortname}
                  onChange={(e) => setFormShortname(e.target.value)}
                  placeholder="Contoh: mt2"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Date</label>
                <Input
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  placeholder="Contoh: jan - mar 2025"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Visible
                </label>
                <select
                  value={formVisible}
                  onChange={(e) =>
                    setFormVisible(e.target.value as VisibleStatus)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="PUBLISH">PUBLISH</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
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
            <h3 className="mb-2 text-lg font-semibold">Hapus Kelas?</h3>
            <p className="text-sm text-muted-foreground">
              Data kelas ini akan dihapus dan tidak dapat dikembalikan.
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

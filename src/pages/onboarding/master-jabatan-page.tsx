import { useRef, useState } from "react"
import {
  FileSpreadsheet,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  cellByAliases,
  parseAktifCell,
  sheetToDataRows,
} from "@/lib/excel-import"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────
type JabatanRow = {
  id: string
  kode: string
  nama: string
  deskripsi: string
  urutan: number
  aktif: boolean
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const initialJabatan: JabatanRow[] = [
  {
    id: "jab-01",
    kode: "J01",
    nama: "Staff",
    deskripsi:
      "Posisi pelaksana operasional rutin dalam unit kerja atau fungsi tertentu.",
    urutan: 1,
    aktif: true,
  },
  {
    id: "jab-02",
    kode: "J02",
    nama: "Supervisor",
    deskripsi:
      "Koordinasi tim kecil dan penjamin kualitas pekerjaan harian peserta onboarding.",
    urutan: 2,
    aktif: true,
  },
  {
    id: "jab-03",
    kode: "J03",
    nama: "Manager",
    deskripsi:
      "Perencanaan strategis tingkat departemen serta pengembangan kemampuan anggota tim.",
    urutan: 3,
    aktif: true,
  },
  {
    id: "jab-04",
    kode: "J04",
    nama: "General Manager",
    deskripsi:
      "Akuntabilitas menyeluruh atas kinerja unit bisnis atau entitas wilayah.",
    urutan: 4,
    aktif: true,
  },
  {
    id: "jab-05",
    kode: "J05",
    nama: "Direksi / Pimpinan",
    deskripsi:
      "Kepemimpinan eksekutif, arahan kebijakan, dan representasi organisasi.",
    urutan: 5,
    aktif: true,
  },
]

function nextId(rows: JabatanRow[]): string {
  const nums = rows
    .map((r) => parseInt(r.id.replace("jab-", ""), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `jab-${String(next).padStart(2, "0")}`
}

function nextUrutan(rows: JabatanRow[]): number {
  return rows.length ? Math.max(...rows.map((r) => r.urutan)) + 1 : 1
}

function importJabatanFromSheetRows(
  rows: Record<string, unknown>[],
  current: JabatanRow[]
): { added: JabatanRow[]; skipped: number } {
  const kodeSeen = new Set(current.map((r) => r.kode.toUpperCase()))
  const added: JabatanRow[] = []
  let acc = [...current]
  let skipped = 0

  for (const row of rows) {
    const kode = cellByAliases(row, ["kode", "code"]).trim().toUpperCase()
    const nama = cellByAliases(row, [
      "nama",
      "namajabatan",
      "namajabatanterkait",
      "nama jabatan",
      "title",
    ]).trim()
    if (!kode || !nama) {
      skipped += 1
      continue
    }
    if (kodeSeen.has(kode)) {
      skipped += 1
      continue
    }
    kodeSeen.add(kode)

    const deskripsi = cellByAliases(row, [
      "deskripsi",
      "description",
      "keterangan",
    ]).trim()
    const urutanRaw = cellByAliases(row, ["urutan", "order", "no"])
    const urutanParsed = Number.parseInt(urutanRaw, 10)
    const urutan =
      !Number.isNaN(urutanParsed) && urutanParsed >= 1
        ? urutanParsed
        : nextUrutan(acc)
    const aktifRaw = cellByAliases(row, ["aktif", "status", "active"])

    const newRow: JabatanRow = {
      id: nextId(acc),
      kode,
      nama,
      deskripsi,
      urutan,
      aktif: parseAktifCell(aktifRaw),
    }
    added.push(newRow)
    acc = [...acc, newRow]
  }

  return { added, skipped }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MasterJabatanPage() {
  const [jabatan, setJabatan] = useState<JabatanRow[]>(initialJabatan)
  const [search, setSearch] = useState("")
  const [showEntries, setShowEntries] = useState(20)
  const excelImportInputRef = useRef<HTMLInputElement>(null)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fKode, setFKode] = useState("")
  const [fNama, setFNama] = useState("")
  const [fDeskripsi, setFDeskripsi] = useState("")
  const [fUrutan, setFUrutan] = useState(1)
  const [fAktif, setFAktif] = useState(true)

  // Delete
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const filtered = jabatan
    .filter(
      (f) =>
        !search ||
        f.nama.toLowerCase().includes(search.toLowerCase()) ||
        f.kode.toLowerCase().includes(search.toLowerCase()) ||
        f.deskripsi.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.urutan - b.urutan)

  const displayed = filtered.slice(0, showEntries)

  function openAdd() {
    setEditingId(null)
    setFKode("")
    setFNama("")
    setFDeskripsi("")
    setFUrutan(nextUrutan(jabatan))
    setFAktif(true)
    setShowModal(true)
  }

  function openEdit(row: JabatanRow) {
    setEditingId(row.id)
    setFKode(row.kode)
    setFNama(row.nama)
    setFDeskripsi(row.deskripsi)
    setFUrutan(row.urutan)
    setFAktif(row.aktif)
    setShowModal(true)
  }

  function handleSave() {
    if (!fNama.trim() || !fKode.trim()) return
    const row: JabatanRow = {
      id: editingId ?? nextId(jabatan),
      kode: fKode.trim().toUpperCase(),
      nama: fNama.trim(),
      deskripsi: fDeskripsi.trim(),
      urutan: fUrutan,
      aktif: fAktif,
    }
    setJabatan((prev) =>
      editingId
        ? prev.map((f) => (f.id === editingId ? row : f))
        : [...prev, row]
    )
    setShowModal(false)
  }

  function toggleAktif(id: string) {
    setJabatan((prev) =>
      prev.map((f) => (f.id === id ? { ...f, aktif: !f.aktif } : f))
    )
  }

  function handleDelete(id: string) {
    setJabatan((prev) => prev.filter((f) => f.id !== id))
    setDeleteTargetId(null)
  }

  async function handleExcelImportChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const buf = await file.arrayBuffer()
      const rows = sheetToDataRows(buf)
      const { added, skipped } = importJabatanFromSheetRows(rows, jabatan)
      if (added.length === 0) {
        window.alert(
          "Tidak ada baris baru. Pastikan kolom Kode dan Nama (Jabatan) terisi; kode duplikat dilewati. Baris pertama = header."
        )
        return
      }
      setJabatan((prev) => [...prev, ...added])
      window.alert(
        `Berhasil mengimpor ${added.length} jabatan.${skipped > 0 ? ` ${skipped} baris dilewati.` : ""}`
      )
    } catch {
      window.alert(
        "Gagal membaca file. Gunakan .xlsx, .xls, atau .csv dengan struktur yang valid."
      )
    }
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
          Master Data
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Jabatan Terkait</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola referensi jabatan terkait untuk penugasan peserta, mentor, dan
          struktur evaluasi onboarding.
        </p>
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
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={excelImportInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={handleExcelImportChange}
          />
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-md pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-md"
            onClick={() => excelImportInputRef.current?.click()}
          >
            <FileSpreadsheet className="size-4" />
            Impor Excel
          </Button>
          <Button
            type="button"
            className="h-9 rounded-md"
            onClick={openAdd}
          >
            <Plus className="size-4" />
            Tambah Jabatan
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#202887] text-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Kode
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Nama Jabatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Urutan
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Status
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
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Tidak ada jabatan ditemukan.
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
                    <td className="px-4 py-3.5 font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                        {row.kode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{row.nama}</td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-muted-foreground">
                      {row.deskripsi}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {row.urutan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleAktif(row.id)}
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition",
                          row.aktif
                            ? "border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                            : "border-slate-300 text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        {row.aktif ? "Aktif" : "Nonaktif"}
                      </button>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Menampilkan {displayed.length} dari {filtered.length} jabatan
      </p>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit Jabatan" : "Tambah Jabatan"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Kode <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={fKode}
                    onChange={(e) => setFKode(e.target.value)}
                    placeholder="J01"
                    className="font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Urutan
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={fUrutan}
                    onChange={(e) => setFUrutan(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Jabatan <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fNama}
                  onChange={(e) => setFNama(e.target.value)}
                  placeholder="Contoh: Supervisor"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deskripsi
                </label>
                <Input
                  value={fDeskripsi}
                  onChange={(e) => setFDeskripsi(e.target.value)}
                  placeholder="Deskripsi singkat jabatan ini"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Status</label>
                <button
                  type="button"
                  onClick={() => setFAktif((v) => !v)}
                  className={cn(
                    "rounded-full border px-3 py-0.5 text-xs font-semibold transition",
                    fAktif
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-slate-50 text-slate-500"
                  )}
                >
                  {fAktif ? "Aktif" : "Nonaktif"}
                </button>
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
            <h3 className="mb-2 text-lg font-semibold">Hapus Jabatan?</h3>
            <p className="text-sm text-muted-foreground">
              Data jabatan ini akan dihapus dan tidak dapat dikembalikan.
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

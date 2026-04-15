import { useState } from "react"
import { PencilLine, Plus, Search, Settings2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────
type BagianRow = {
  id: string
  kode: string
  nama: string
  deskripsi: string
  bobotPersen: number
  urutan: number
  aktif: boolean
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const initialBagian: BagianRow[] = [
  {
    id: "bag-01",
    kode: "B01",
    nama: "Pengetahuan & Pemahaman",
    deskripsi:
      "Penilaian pemahaman peserta terhadap materi onboarding dan nilai perusahaan.",
    bobotPersen: 25,
    urutan: 1,
    aktif: true,
  },
  {
    id: "bag-02",
    kode: "B02",
    nama: "Keterampilan Teknis",
    deskripsi: "Penilaian kompetensi teknis sesuai kebutuhan jabatan peserta.",
    bobotPersen: 30,
    urutan: 2,
    aktif: true,
  },
  {
    id: "bag-03",
    kode: "B03",
    nama: "Sikap & Perilaku",
    deskripsi:
      "Penilaian kedisiplinan, etika kerja, dan kesesuaian budaya organisasi.",
    bobotPersen: 20,
    urutan: 3,
    aktif: true,
  },
  {
    id: "bag-04",
    kode: "B04",
    nama: "Project & Implementasi",
    deskripsi:
      "Penilaian hasil project nyata yang dikerjakan selama masa onboarding.",
    bobotPersen: 25,
    urutan: 4,
    aktif: true,
  },
]

function nextId(rows: BagianRow[]): string {
  const nums = rows
    .map((r) => parseInt(r.id.replace("bag-", ""), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `bag-${String(next).padStart(2, "0")}`
}

function nextUrutan(rows: BagianRow[]): number {
  return rows.length ? Math.max(...rows.map((r) => r.urutan)) + 1 : 1
}

function totalBobot(rows: BagianRow[]): number {
  return rows.reduce((sum, r) => sum + r.bobotPersen, 0)
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MasterBagianEvaluasiPage() {
  const [bagian, setBagian] = useState<BagianRow[]>(initialBagian)
  const [search, setSearch] = useState("")
  const [showEntries, setShowEntries] = useState(20)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fKode, setFKode] = useState("")
  const [fNama, setFNama] = useState("")
  const [fDeskripsi, setFDeskripsi] = useState("")
  const [fBobot, setFBobot] = useState(0)
  const [fUrutan, setFUrutan] = useState(1)
  const [fAktif, setFAktif] = useState(true)

  // Delete
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const filtered = bagian
    .filter(
      (b) =>
        !search ||
        b.nama.toLowerCase().includes(search.toLowerCase()) ||
        b.kode.toLowerCase().includes(search.toLowerCase()) ||
        b.deskripsi.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.urutan - b.urutan)

  const displayed = filtered.slice(0, showEntries)
  const totalBobot100 = totalBobot(bagian)

  function openAdd() {
    setEditingId(null)
    setFKode("")
    setFNama("")
    setFDeskripsi("")
    setFBobot(0)
    setFUrutan(nextUrutan(bagian))
    setFAktif(true)
    setShowModal(true)
  }

  function openEdit(row: BagianRow) {
    setEditingId(row.id)
    setFKode(row.kode)
    setFNama(row.nama)
    setFDeskripsi(row.deskripsi)
    setFBobot(row.bobotPersen)
    setFUrutan(row.urutan)
    setFAktif(row.aktif)
    setShowModal(true)
  }

  function handleSave() {
    if (!fNama.trim() || !fKode.trim()) return
    const row: BagianRow = {
      id: editingId ?? nextId(bagian),
      kode: fKode.trim().toUpperCase(),
      nama: fNama.trim(),
      deskripsi: fDeskripsi.trim(),
      bobotPersen: fBobot,
      urutan: fUrutan,
      aktif: fAktif,
    }
    setBagian((prev) =>
      editingId
        ? prev.map((b) => (b.id === editingId ? row : b))
        : [...prev, row]
    )
    setShowModal(false)
  }

  function toggleAktif(id: string) {
    setBagian((prev) =>
      prev.map((b) => (b.id === id ? { ...b, aktif: !b.aktif } : b))
    )
  }

  function handleDelete(id: string) {
    setBagian((prev) => prev.filter((b) => b.id !== id))
    setDeleteTargetId(null)
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
          Master Data
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Master Bagian Evaluasi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola bagian-bagian penilaian evaluasi yang dapat di-assign ke
          evaluasi sebagai parent dari poin-poin evaluasi.
        </p>
      </div>

      {/* Total bobot warning */}
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border px-5 py-3 text-sm",
          totalBobot100 === 100
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-amber-300 bg-amber-50 text-amber-700"
        )}
      >
        <span>
          Total bobot semua bagian:{" "}
          <span className="font-bold">{totalBobot100}%</span>
        </span>
        {totalBobot100 !== 100 && (
          <span className="text-xs">Pastikan total bobot mencapai 100%</span>
        )}
        {totalBobot100 === 100 && (
          <span className="text-xs font-medium">Total bobot sudah sesuai</span>
        )}
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
            Tambah Bagian
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
                  Kode
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Nama Bagian
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Bobot (%)
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
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Tidak ada bagian evaluasi ditemukan.
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
                      <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 font-mono text-xs font-semibold text-violet-700">
                        {row.kode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{row.nama}</td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-muted-foreground">
                      {row.deskripsi}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                          row.bobotPersen >= 25
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {row.bobotPersen}%
                      </span>
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
        Menampilkan {displayed.length} dari {filtered.length} bagian evaluasi
      </p>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit Bagian Evaluasi" : "Tambah Bagian Evaluasi"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Kode <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={fKode}
                    onChange={(e) => setFKode(e.target.value)}
                    placeholder="B01"
                    className="font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Bobot (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={fBobot}
                    onChange={(e) => setFBobot(Number(e.target.value))}
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
                  Nama Bagian <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fNama}
                  onChange={(e) => setFNama(e.target.value)}
                  placeholder="Contoh: Pengetahuan & Pemahaman"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deskripsi
                </label>
                <Input
                  value={fDeskripsi}
                  onChange={(e) => setFDeskripsi(e.target.value)}
                  placeholder="Deskripsi singkat bagian evaluasi ini"
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
            <h3 className="mb-2 text-lg font-semibold">
              Hapus Bagian Evaluasi?
            </h3>
            <p className="text-sm text-muted-foreground">
              Data bagian ini akan dihapus dan tidak dapat dikembalikan.
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

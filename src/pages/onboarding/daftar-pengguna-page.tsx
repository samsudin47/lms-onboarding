import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { PencilLine, Plus, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/searchable-select"
import {
  cellByAliases,
  normalizeHeaderKey,
  parseBooleanLike,
  sheetToDataRows,
} from "@/lib/excel-import"
import type { UserDirectorySeedRow, UserStatus } from "@/lib/user-directory-seed"
import { USER_DIRECTORY_SEED } from "@/lib/user-directory-seed"
import {
  getClassUserColumnsForNomorPokok,
  loadClassUserRows,
} from "@/lib/class-users-storage"
import { cn } from "@/lib/utils"

type UserRow = UserDirectorySeedRow

/** Tanpa kolom Role — akses ditentukan flag LMS / onboarding (keduanya boleh aktif). */
type AccessFilter = "all" | "lms" | "onboarding" | "both"

function parseStatusCell(raw: string): UserStatus {
  const s = normalizeHeaderKey(raw)
  if (
    s.includes("tidak") ||
    s.includes("nonaktif") ||
    s === "0" ||
    s.includes("inactive")
  )
    return "TIDAK AKTIF"
  return "AKTIF"
}

function parseUsersFromExcelBuffer(buf: ArrayBuffer): {
  rows: UserRow[]
  errors: string[]
} {
  let data: Record<string, unknown>[]
  try {
    data = sheetToDataRows(buf)
  } catch {
    return { rows: [], errors: ["File tidak dapat dibaca."] }
  }
  const errors: string[] = []
  const rows: UserRow[] = []
  const seenNp = new Set<string>()

  data.forEach((raw, idx) => {
    const line = idx + 2
    const nomorPokok = cellByAliases(raw, [
      "nomor_pokok",
      "nomorpokok",
      "np",
      "nip",
      "nik",
    ])
    const nama = cellByAliases(raw, ["nama", "nama_lengkap", "namalengkap", "name"])
    if (!nomorPokok.trim() && !nama.trim()) return
    if (!nama.trim()) {
      errors.push(`Baris ${line}: nama wajib diisi.`)
      return
    }

    const np = nomorPokok.trim() || `IMP-${line}`
    if (seenNp.has(np)) {
      errors.push(`Baris ${line}: nomor pokok duplikat (${np}).`)
      return
    }
    seenNp.add(np)

    const kodeSTO = cellByAliases(raw, ["kode_sto", "kodesto", "sto"])
    const namaUnit = cellByAliases(raw, ["nama_unit", "namaunit", "unit"])
    const jabatan = cellByAliases(raw, ["jabatan", "posisi"])

    const isLms = parseBooleanLike(
      cellByAliases(raw, ["is_lms", "islms", "akses_lms", "lms"])
    )
    const isOnboarding = parseBooleanLike(
      cellByAliases(raw, [
        "is_onboarding",
        "isonboarding",
        "akses_onboarding",
        "onboarding",
      ])
    )

    const statusRaw = cellByAliases(raw, ["status", "aktif"])
    const status: UserStatus = statusRaw.trim()
      ? parseStatusCell(statusRaw)
      : "AKTIF"

    rows.push({
      id: np,
      nomorPokok: np,
      nama,
      kodeSTO,
      namaUnit,
      jabatan,
      isLms,
      isOnboarding,
      status,
    })
  })

  return { rows, errors }
}

function nextGeneratedId(existing: UserRow[]): string {
  let n = 1
  while (existing.some((u) => u.id === `USR-${String(n).padStart(4, "0")}`)) {
    n++
  }
  return `USR-${String(n).padStart(4, "0")}`
}

export default function DaftarPenggunaPage() {
  const [users, setUsers] = useState<UserRow[]>(() => [...USER_DIRECTORY_SEED])
  const [classUserRows, setClassUserRows] = useState(loadClassUserRows)

  useEffect(() => {
    function refresh() {
      setClassUserRows(loadClassUserRows())
    }
    window.addEventListener("lms-class-users-updated", refresh)
    return () =>
      window.removeEventListener("lms-class-users-updated", refresh)
  }, [])
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all")
  const [showEntries, setShowEntries] = useState(20)
  const [search, setSearch] = useState("")

  const excelInputRef = useRef<HTMLInputElement>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formNama, setFormNama] = useState("")
  const [formNomorPokok, setFormNomorPokok] = useState("")
  const [formKodeSTO, setFormKodeSTO] = useState("")
  const [formNamaUnit, setFormNamaUnit] = useState("")
  const [formJabatan, setFormJabatan] = useState("")
  const [formIsLms, setFormIsLms] = useState(false)
  const [formIsOnboarding, setFormIsOnboarding] = useState(true)
  const [formStatus, setFormStatus] = useState<UserStatus>("AKTIF")

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const filtered = users
    .filter((r) => {
      if (accessFilter === "all") return true
      if (accessFilter === "lms") return r.isLms
      if (accessFilter === "onboarding") return r.isOnboarding
      return r.isLms && r.isOnboarding
    })
    .filter(
      (r) =>
        r.nama.toLowerCase().includes(search.toLowerCase()) ||
        r.nomorPokok.toLowerCase().includes(search.toLowerCase()) ||
        r.namaUnit.toLowerCase().includes(search.toLowerCase())
    )
  const displayed = filtered.slice(0, showEntries)

  function openAdd() {
    setEditingId(null)
    setFormNama("")
    setFormNomorPokok("")
    setFormKodeSTO("")
    setFormNamaUnit("")
    setFormJabatan("")
    setFormIsLms(false)
    setFormIsOnboarding(true)
    setFormStatus("AKTIF")
    setShowModal(true)
  }

  function openEdit(row: UserRow) {
    setEditingId(row.id)
    setFormNama(row.nama)
    setFormNomorPokok(row.nomorPokok)
    setFormKodeSTO(row.kodeSTO)
    setFormNamaUnit(row.namaUnit)
    setFormJabatan(row.jabatan)
    setFormIsLms(row.isLms)
    setFormIsOnboarding(row.isOnboarding)
    setFormStatus(row.status)
    setShowModal(true)
  }

  function handleSave() {
    if (!formNama.trim()) return
    setUsers((prev) => {
      if (editingId) {
        return prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                nama: formNama,
                nomorPokok: formNomorPokok,
                kodeSTO: formKodeSTO,
                namaUnit: formNamaUnit,
                jabatan: formJabatan,
                isLms: formIsLms,
                isOnboarding: formIsOnboarding,
                status: formStatus,
              }
            : r
        )
      }
      const newId = nextGeneratedId(prev)
      const np = formNomorPokok.trim() || newId
      const newRow: UserRow = {
        id: np,
        nomorPokok: np,
        nama: formNama,
        kodeSTO: formKodeSTO,
        namaUnit: formNamaUnit,
        jabatan: formJabatan,
        isLms: formIsLms,
        isOnboarding: formIsOnboarding,
        status: formStatus,
      }
      return [...prev, newRow]
    })
    setShowModal(false)
  }

  async function handleUserExcelChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const buf = await file.arrayBuffer()
    const { rows, errors } = parseUsersFromExcelBuffer(buf)
    if (errors.length) {
      window.alert(
        errors.slice(0, 20).join("\n") +
          (errors.length > 20 ? `\n… (${errors.length} pesan)` : "")
      )
    }
    if (rows.length === 0) {
      if (!errors.length) window.alert("Tidak ada baris pengguna yang valid.")
      return
    }
    setUsers((prev) => {
      const byNp = new Map(prev.map((u) => [u.nomorPokok, u]))
      for (const r of rows) {
        byNp.set(r.nomorPokok, r)
      }
      return Array.from(byNp.values())
    })
    window.alert(`Berhasil mengimpor / memperbarui ${rows.length} pengguna.`)
  }

  function handleDelete(id: string) {
    setUsers((prev) => prev.filter((r) => r.id !== id))
    setDeleteTargetId(null)
  }

  const filterCounts = (
    [
      ["all", "Semua"],
      ["lms", "Akses LMS"],
      ["onboarding", "Akses Onboarding"],
      ["both", "LMS & Onboarding"],
    ] as const
  ).map(([value, label]) => ({
    value,
    label,
    count:
      value === "all"
        ? users.length
        : users.filter((u) =>
              value === "lms"
                ? u.isLms
                : value === "onboarding"
                  ? u.isOnboarding
                  : u.isLms && u.isOnboarding
            ).length,
  }))

  return (
    <section className="space-y-5">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
              Manajemen Pengguna
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Daftar Pengguna</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Akses LMS dan onboarding diatur per pengguna (boleh keduanya).
              Impor Excel dengan kolom <span className="font-mono">is_lms</span>{" "}
              dan <span className="font-mono">is_onboarding</span> (Ya/Tidak atau
              1/0).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="sr-only"
              onChange={handleUserExcelChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => excelInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Impor Excel
            </Button>
            <Button type="button" onClick={openAdd}>
              <Plus className="size-4" />
              Tambah Pengguna
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
          <label className="text-sm font-medium whitespace-nowrap text-muted-foreground">
            Filter akses
          </label>
          <SearchableSelect
            value={accessFilter}
            onChange={(v) => {
              setAccessFilter(v as AccessFilter)
              setSearch("")
            }}
            options={filterCounts.map(({ value, label, count }) => ({
              value,
              label: `${label} (${count})`,
            }))}
            dynamic
            selectClassName="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none min-w-[220px]"
          />
        </div>

        <div className="space-y-4 p-4">
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
            <Input
              placeholder="Cari nama, nomor pokok, unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#202887] text-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Nomor Pokok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    LMS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Onboarding
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Kode STO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Nama Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Jabatan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Status kelas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Enrolled at
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayed.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Tidak ada data pengguna.
                    </td>
                  </tr>
                ) : (
                  displayed.map((row, index) => {
                    const cu = getClassUserColumnsForNomorPokok(
                      row.nomorPokok,
                      classUserRows
                    )
                    return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition hover:bg-muted/40",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-bold">{row.nomorPokok}</td>
                      <td className="px-4 py-3 font-semibold uppercase">
                        {row.nama.toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            row.isLms
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {row.isLms ? "Ya" : "Tidak"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            row.isOnboarding
                              ? "bg-sky-100 text-sky-800"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {row.isOnboarding ? "Ya" : "Tidak"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.kodeSTO}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.namaUnit}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.jabatan}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {cu.statusKelas}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {cu.enrolledAt}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
                            row.status === "AKTIF"
                              ? "bg-emerald-500 text-white"
                              : "bg-red-500 text-white"
                          )}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                          >
                            <PencilLine className="size-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(row.id)}
                            className="flex cursor-pointer items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-500 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-3.5" />
                            Hapus
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

          <p className="text-xs text-muted-foreground">
            Menampilkan {displayed.length} dari {filtered.length} entri
          </p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit Pengguna" : "Tambah Pengguna"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor Pokok
                </label>
                <Input
                  value={formNomorPokok}
                  onChange={(e) => setFormNomorPokok(e.target.value)}
                  placeholder="Unik per pengguna"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nama</label>
                <Input
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Nama lengkap pengguna"
                />
              </div>
              <div className="rounded-lg border bg-muted/25 px-3 py-2 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Akses aplikasi
                </p>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input accent-primary"
                    checked={formIsLms}
                    onChange={(e) => setFormIsLms(e.target.checked)}
                  />
                  <span>is_lms — akses LMS</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input accent-primary"
                    checked={formIsOnboarding}
                    onChange={(e) => setFormIsOnboarding(e.target.checked)}
                  />
                  <span>is_onboarding — akses onboarding</span>
                </label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kode STO
                </label>
                <Input
                  value={formKodeSTO}
                  onChange={(e) => setFormKodeSTO(e.target.value)}
                  placeholder="Contoh: 42D10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Unit
                </label>
                <Input
                  value={formNamaUnit}
                  onChange={(e) => setFormNamaUnit(e.target.value)}
                  placeholder="Contoh: Unit IT"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Jabatan
                </label>
                <Input
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  placeholder="Contoh: Staff"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="TIDAK AKTIF">TIDAK AKTIF</option>
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

      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Hapus Pengguna?</h3>
            <p className="text-sm text-muted-foreground">
              Data pengguna ini akan dihapus secara permanen dan tidak dapat
              dikembalikan.
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

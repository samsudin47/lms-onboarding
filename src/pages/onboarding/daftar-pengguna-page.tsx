import { useState } from "react"
import { PencilLine, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type UserStatus = "AKTIF" | "TIDAK AKTIF"

type RoleKey =
  | "Onboarding"
  | "User"
  | "Mentor"
  | "Co-Mentor"
  | "Admin PSP"
  | "Superadmin"
  | "Penguji"

type UserRow = {
  id: string
  nomorPokok: string
  nama: string
  kodeSTO: string
  namaUnit: string
  jabatan: string
  role: RoleKey
  status: UserStatus
}

const ALL_ROLES: RoleKey[] = [
  "Onboarding",
  "User",
  "Mentor",
  "Co-Mentor",
  "Admin PSP",
  "Superadmin",
  "Penguji",
]

// ─────────────────────────────────────────
// Seed data (flat list)
// ─────────────────────────────────────────
const seedUsers: UserRow[] = [
  // Onboarding
  {
    id: "ONB01",
    nomorPokok: "ONB01",
    nama: "Andi Pratama",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Magang Trainee",
    role: "Onboarding",
    status: "AKTIF",
  },
  {
    id: "ONB02",
    nomorPokok: "ONB02",
    nama: "Budi Santoso",
    kodeSTO: "33X10",
    namaUnit: "Unit SDM",
    jabatan: "Magang Trainee",
    role: "Onboarding",
    status: "TIDAK AKTIF",
  },
  {
    id: "ONB03",
    nomorPokok: "ONB03",
    nama: "Chandra Wijaya",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Magang Trainee",
    role: "Onboarding",
    status: "AKTIF",
  },
  {
    id: "ONB04",
    nomorPokok: "ONB04",
    nama: "Dedi Kurniawan",
    kodeSTO: "33X10",
    namaUnit: "Unit SDM",
    jabatan: "Magang Trainee",
    role: "Onboarding",
    status: "AKTIF",
  },
  {
    id: "ONB05",
    nomorPokok: "ONB05",
    nama: "Eko Prasetyo",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Magang Trainee",
    role: "Onboarding",
    status: "AKTIF",
  },
  {
    id: "ONB06",
    nomorPokok: "ONB06",
    nama: "Fajar Shodiq",
    kodeSTO: "33X10",
    namaUnit: "Unit SDM",
    jabatan: "Magang Trainee",
    role: "Onboarding",
    status: "AKTIF",
  },
  {
    id: "ONB07",
    nomorPokok: "ONB07",
    nama: "Gilang Ramadhan",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Magang Trainee",
    role: "Onboarding",
    status: "AKTIF",
  },
  // User
  {
    id: "USR01",
    nomorPokok: "USR01",
    nama: "Hendra Putra",
    kodeSTO: "10A01",
    namaUnit: "Unit Keuangan",
    jabatan: "Staff",
    role: "User",
    status: "AKTIF",
  },
  {
    id: "USR02",
    nomorPokok: "USR02",
    nama: "Indah Lestari",
    kodeSTO: "22B05",
    namaUnit: "Unit HRD",
    jabatan: "Staff",
    role: "User",
    status: "AKTIF",
  },
  {
    id: "USR03",
    nomorPokok: "USR03",
    nama: "Joko Widodo",
    kodeSTO: "33X10",
    namaUnit: "Unit SDM",
    jabatan: "Senior Staff",
    role: "User",
    status: "TIDAK AKTIF",
  },
  // Mentor
  {
    id: "MNT01",
    nomorPokok: "MNT01",
    nama: "Rina Oktavia",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Mentor",
    role: "Mentor",
    status: "AKTIF",
  },
  {
    id: "MNT02",
    nomorPokok: "MNT02",
    nama: "Bima Saputra",
    kodeSTO: "22B05",
    namaUnit: "Unit HRD",
    jabatan: "Mentor",
    role: "Mentor",
    status: "AKTIF",
  },
  {
    id: "MNT03",
    nomorPokok: "MNT03",
    nama: "Salsa Maharani",
    kodeSTO: "33X10",
    namaUnit: "Unit SDM",
    jabatan: "Mentor",
    role: "Mentor",
    status: "AKTIF",
  },
  // Co-Mentor
  {
    id: "COM01",
    nomorPokok: "COM01",
    nama: "Tono Santoso",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Co-Mentor",
    role: "Co-Mentor",
    status: "AKTIF",
  },
  {
    id: "COM02",
    nomorPokok: "COM02",
    nama: "Wulan Sari",
    kodeSTO: "22B05",
    namaUnit: "Unit HRD",
    jabatan: "Co-Mentor",
    role: "Co-Mentor",
    status: "AKTIF",
  },
  // Admin PSP
  {
    id: "ADM01",
    nomorPokok: "ADM01",
    nama: "Admin Peruri",
    kodeSTO: "00P00",
    namaUnit: "Unit PSP",
    jabatan: "Admin PSP",
    role: "Admin PSP",
    status: "AKTIF",
  },
  // Superadmin
  {
    id: "SUP01",
    nomorPokok: "SUP01",
    nama: "Super Admin",
    kodeSTO: "00P00",
    namaUnit: "Unit PSP",
    jabatan: "Superadmin",
    role: "Superadmin",
    status: "AKTIF",
  },
  // Penguji
  {
    id: "PNJ01",
    nomorPokok: "PNJ01",
    nama: "Dr. Ahmad Fauzi",
    kodeSTO: "EXT01",
    namaUnit: "Eksternal",
    jabatan: "Penguji Eksternal",
    role: "Penguji",
    status: "AKTIF",
  },
  {
    id: "PNJ02",
    nomorPokok: "PNJ02",
    nama: "Ir. Soekarno",
    kodeSTO: "EXT02",
    namaUnit: "Eksternal",
    jabatan: "Penguji Eksternal",
    role: "Penguji",
    status: "AKTIF",
  },
  {
    id: "PNJ03",
    nomorPokok: "PNJ03",
    nama: "Putri Rahayu",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Penguji Internal",
    role: "Penguji",
    status: "AKTIF",
  },
  {
    id: "PNJ04",
    nomorPokok: "PNJ04",
    nama: "Rizky Firmansyah",
    kodeSTO: "33X10",
    namaUnit: "Unit SDM",
    jabatan: "Penguji Internal",
    role: "Penguji",
    status: "TIDAK AKTIF",
  },
]

const roleBadgeColors: Record<RoleKey, string> = {
  Onboarding: "bg-blue-100 text-blue-700",
  User: "bg-slate-100 text-slate-700",
  Mentor: "bg-violet-100 text-violet-700",
  "Co-Mentor": "bg-fuchsia-100 text-fuchsia-700",
  "Admin PSP": "bg-amber-100 text-amber-700",
  Superadmin: "bg-rose-100 text-rose-700",
  Penguji: "bg-teal-100 text-teal-700",
}

function generateId(users: UserRow[], role: RoleKey): string {
  const prefixMap: Record<RoleKey, string> = {
    Onboarding: "ONB",
    User: "USR",
    Mentor: "MNT",
    "Co-Mentor": "COM",
    "Admin PSP": "ADM",
    Superadmin: "SUP",
    Penguji: "PNJ",
  }
  const prefix = prefixMap[role]
  const nums = users
    .filter((r) => r.nomorPokok.startsWith(prefix))
    .map((r) => parseInt(r.nomorPokok.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(2, "0")}`
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export default function DaftarPenggunaPage() {
  const [users, setUsers] = useState<UserRow[]>(seedUsers)
  const [roleFilter, setRoleFilter] = useState<RoleKey | "All">("All")
  const [showEntries, setShowEntries] = useState(20)
  const [search, setSearch] = useState("")

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formNama, setFormNama] = useState("")
  const [formNomorPokok, setFormNomorPokok] = useState("")
  const [formKodeSTO, setFormKodeSTO] = useState("")
  const [formNamaUnit, setFormNamaUnit] = useState("")
  const [formJabatan, setFormJabatan] = useState("")
  const [formRole, setFormRole] = useState<RoleKey>("Onboarding")
  const [formStatus, setFormStatus] = useState<UserStatus>("AKTIF")

  // Delete confirm
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const filtered = users
    .filter((r) => roleFilter === "All" || r.role === roleFilter)
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
    setFormRole(roleFilter !== "All" ? roleFilter : "Onboarding")
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
    setFormRole(row.role)
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
                role: formRole,
                status: formStatus,
              }
            : r
        )
      }
      const newId = generateId(prev, formRole)
      const newRow: UserRow = {
        id: newId,
        nomorPokok: formNomorPokok || newId,
        nama: formNama,
        kodeSTO: formKodeSTO,
        namaUnit: formNamaUnit,
        jabatan: formJabatan,
        role: formRole,
        status: formStatus,
      }
      return [...prev, newRow]
    })
    setShowModal(false)
  }

  function handleDelete(id: string) {
    setUsers((prev) => prev.filter((r) => r.id !== id))
    setDeleteTargetId(null)
  }

  const roleCounts = (["All", ...ALL_ROLES] as const).map((r) => ({
    role: r,
    count:
      r === "All" ? users.length : users.filter((u) => u.role === r).length,
  }))

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
              Manajemen Pengguna
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Daftar Pengguna</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola seluruh pengguna sistem. Gunakan filter role untuk
              mempersempit tampilan.
            </p>
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="size-4" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Role filter dropdown */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <label className="text-sm font-medium whitespace-nowrap text-muted-foreground">
            Filter Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as RoleKey | "All")
              setSearch("")
            }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          >
            {roleCounts.map(({ role, count }) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 p-4">
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
            <Input
              placeholder="Cari nama, nomor pokok, unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[linear-gradient(135deg,#1e3a8a,#5b21b6)] text-white">
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
                    Role
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
                      colSpan={9}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Tidak ada data pengguna.
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
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            roleBadgeColors[row.role]
                          )}
                        >
                          {row.role}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Menampilkan {displayed.length} dari {filtered.length} entri
          </p>
        </div>
      </div>

      {/* Add / Edit Modal */}
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
                  placeholder="Contoh: ONB01"
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
              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as RoleKey)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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
                  placeholder="Contoh: Magang Trainee"
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

      {/* Delete Confirm */}
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

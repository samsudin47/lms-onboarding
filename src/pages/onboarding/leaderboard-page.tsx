import { useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "onboarding" | "user"

interface LeaderEntry {
  id: number
  nomorPokok: string
  nama: string
  kodeSto: string
  namaUnit: string
  jabatan: string
  status: "AKTIF" | "TIDAK AKTIF"
}

const ONBOARDING_DATA: LeaderEntry[] = [
  {
    id: 1,
    nomorPokok: "90123",
    nama: "ANDI PRATAMA",
    kodeSto: "42D10",
    namaUnit: "Unit Teknologi Informasi",
    jabatan: "Senior Developer",
    status: "AKTIF",
  },
  {
    id: 2,
    nomorPokok: "78890",
    nama: "BUDI SANTOSO",
    kodeSto: "33X10",
    namaUnit: "Unit SDM & Umum",
    jabatan: "HR Specialist",
    status: "TIDAK AKTIF",
  },
  {
    id: 3,
    nomorPokok: "12456",
    nama: "CITRA LESTARI",
    kodeSto: "49H00",
    namaUnit: "Unit Keuangan",
    jabatan: "Financial Analyst",
    status: "AKTIF",
  },
  {
    id: 4,
    nomorPokok: "55432",
    nama: "DEWI KARTIKA",
    kodeSto: "12B30",
    namaUnit: "Unit Pemasaran",
    jabatan: "Marketing Manager",
    status: "AKTIF",
  },
  {
    id: 5,
    nomorPokok: "88765",
    nama: "EKO PRASETYO",
    kodeSto: "67C50",
    namaUnit: "Unit Operasional",
    jabatan: "Operations Staff",
    status: "AKTIF",
  },
  {
    id: 6,
    nomorPokok: "34521",
    nama: "FARIDA YUNITA",
    kodeSto: "28A20",
    namaUnit: "Unit Hukum",
    jabatan: "Legal Officer",
    status: "AKTIF",
  },
  {
    id: 7,
    nomorPokok: "61089",
    nama: "GUNAWAN SETIADI",
    kodeSto: "55K40",
    namaUnit: "Unit Produksi",
    jabatan: "Production Supervisor",
    status: "AKTIF",
  },
  {
    id: 8,
    nomorPokok: "47332",
    nama: "HANA PERMATA",
    kodeSto: "31M10",
    namaUnit: "Unit Pengadaan",
    jabatan: "Procurement Officer",
    status: "TIDAK AKTIF",
  },
  {
    id: 9,
    nomorPokok: "29874",
    nama: "IRFAN HAKIM",
    kodeSto: "44G30",
    namaUnit: "Unit Keamanan",
    jabatan: "Security Analyst",
    status: "AKTIF",
  },
  {
    id: 10,
    nomorPokok: "72156",
    nama: "JULIA AMANDA",
    kodeSto: "18F50",
    namaUnit: "Unit Audit",
    jabatan: "Internal Auditor",
    status: "AKTIF",
  },
]

const USER_DATA: LeaderEntry[] = [
  {
    id: 1,
    nomorPokok: "11001",
    nama: "KEVIN PRATAMA",
    kodeSto: "10A10",
    namaUnit: "Unit IT",
    jabatan: "System Analyst",
    status: "AKTIF",
  },
  {
    id: 2,
    nomorPokok: "22002",
    nama: "LUNA SARI",
    kodeSto: "20B20",
    namaUnit: "Unit HR",
    jabatan: "Recruiter",
    status: "AKTIF",
  },
  {
    id: 3,
    nomorPokok: "33003",
    nama: "MARIO RIZKI",
    kodeSto: "30C30",
    namaUnit: "Unit Finance",
    jabatan: "Accountant",
    status: "TIDAK AKTIF",
  },
  {
    id: 4,
    nomorPokok: "44004",
    nama: "NADIA PERMATA",
    kodeSto: "40D40",
    namaUnit: "Unit Marketing",
    jabatan: "Brand Manager",
    status: "AKTIF",
  },
  {
    id: 5,
    nomorPokok: "55005",
    nama: "OSCAR BUDIMAN",
    kodeSto: "50E50",
    namaUnit: "Unit Legal",
    jabatan: "Compliance Officer",
    status: "AKTIF",
  },
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("onboarding")
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState(20)

  const source = tab === "onboarding" ? ONBOARDING_DATA : USER_DATA

  const filtered = source.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.nomorPokok.includes(search) ||
      r.namaUnit.toLowerCase().includes(search.toLowerCase()) ||
      r.jabatan.toLowerCase().includes(search.toLowerCase())
  )

  const displayed = filtered.slice(0, pageSize)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Leaderboard
        </p>
        <h1 className="mt-1 text-2xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Peringkat peserta onboarding berdasarkan progres dan pencapaian.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-0">
        {(["onboarding", "user"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t)
              setSearch("")
            }}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition",
              tab === t
                ? "bg-[linear-gradient(135deg,#1e3a8a,#2563eb)] text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t === "onboarding" ? "Onboarding" : "User"}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border border-border bg-background px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded border border-border bg-background py-1.5 pr-4 pl-9 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[linear-gradient(90deg,#1d4ed8,#4338ca,#7c3aed)] text-white">
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                Ranking
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                Nomor Pokok
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                Nama
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
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayed.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  Tidak ada data ditemukan.
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
                  <td className="px-4 py-4 font-bold">{row.nomorPokok}</td>
                  <td className="px-4 py-4 font-bold">{row.nama}</td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                    {row.kodeSto}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {row.namaUnit}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {row.jabatan}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold text-white",
                        row.status === "AKTIF" ? "bg-emerald-500" : "bg-red-500"
                      )}
                    >
                      {row.status}
                    </span>
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
  )
}

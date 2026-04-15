import { useMemo, useState } from "react"
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
  kelas: string
  // avg post-test score across all courses & phases (0–100)
  nilai: number
  // days from enroll to last post-test submit (lower = faster)
  submitDurasiHari: number
}

// Seed classes for filter
const KELAS_OPTIONS = [
  "Onboarding PKWT Batch 1",
  "Onboarding MT/Organik Batch 2",
  "Onboarding Pro Hire Batch 1",
]

const ONBOARDING_DATA: LeaderEntry[] = [
  {
    id: 1,
    nomorPokok: "90123",
    nama: "ANDI PRATAMA",
    kodeSto: "42D10",
    namaUnit: "Unit Teknologi Informasi",
    jabatan: "Senior Developer",
    status: "AKTIF",
    kelas: "Onboarding MT/Organik Batch 2",
    nilai: 94.75,
    submitDurasiHari: 28,
  },
  {
    id: 2,
    nomorPokok: "78890",
    nama: "BUDI SANTOSO",
    kodeSto: "33X10",
    namaUnit: "Unit SDM & Umum",
    jabatan: "HR Specialist",
    status: "TIDAK AKTIF",
    kelas: "Onboarding PKWT Batch 1",
    nilai: 88.0,
    submitDurasiHari: 35,
  },
  {
    id: 3,
    nomorPokok: "12456",
    nama: "CITRA LESTARI",
    kodeSto: "49H00",
    namaUnit: "Unit Keuangan",
    jabatan: "Financial Analyst",
    status: "AKTIF",
    kelas: "Onboarding PKWT Batch 1",
    nilai: 92.33,
    submitDurasiHari: 30,
  },
  {
    id: 4,
    nomorPokok: "55432",
    nama: "DEWI KARTIKA",
    kodeSto: "12B30",
    namaUnit: "Unit Pemasaran",
    jabatan: "Marketing Manager",
    status: "AKTIF",
    kelas: "Onboarding Pro Hire Batch 1",
    nilai: 88.0,
    submitDurasiHari: 29,
  },
  {
    id: 5,
    nomorPokok: "88765",
    nama: "EKO PRASETYO",
    kodeSto: "67C50",
    namaUnit: "Unit Operasional",
    jabatan: "Operations Staff",
    status: "AKTIF",
    kelas: "Onboarding PKWT Batch 1",
    nilai: 85.5,
    submitDurasiHari: 32,
  },
  {
    id: 6,
    nomorPokok: "34521",
    nama: "FARIDA YUNITA",
    kodeSto: "28A20",
    namaUnit: "Unit Hukum",
    jabatan: "Legal Officer",
    status: "AKTIF",
    kelas: "Onboarding MT/Organik Batch 2",
    nilai: 91.0,
    submitDurasiHari: 27,
  },
  {
    id: 7,
    nomorPokok: "61089",
    nama: "GUNAWAN SETIADI",
    kodeSto: "55K40",
    namaUnit: "Unit Produksi",
    jabatan: "Production Supervisor",
    status: "AKTIF",
    kelas: "Onboarding Pro Hire Batch 1",
    nilai: 79.67,
    submitDurasiHari: 40,
  },
  {
    id: 8,
    nomorPokok: "47332",
    nama: "HANA PERMATA",
    kodeSto: "31M10",
    namaUnit: "Unit Pengadaan",
    jabatan: "Procurement Officer",
    status: "TIDAK AKTIF",
    kelas: "Onboarding PKWT Batch 1",
    nilai: 83.25,
    submitDurasiHari: 38,
  },
  {
    id: 9,
    nomorPokok: "29874",
    nama: "IRFAN HAKIM",
    kodeSto: "44G30",
    namaUnit: "Unit Keamanan",
    jabatan: "Security Analyst",
    status: "AKTIF",
    kelas: "Onboarding MT/Organik Batch 2",
    nilai: 94.75,
    submitDurasiHari: 31,
  },
  {
    id: 10,
    nomorPokok: "72156",
    nama: "JULIA AMANDA",
    kodeSto: "18F50",
    namaUnit: "Unit Audit",
    jabatan: "Internal Auditor",
    status: "AKTIF",
    kelas: "Onboarding Pro Hire Batch 1",
    nilai: 96.0,
    submitDurasiHari: 22,
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
    kelas: "Onboarding MT/Organik Batch 2",
    nilai: 90.5,
    submitDurasiHari: 25,
  },
  {
    id: 2,
    nomorPokok: "22002",
    nama: "LUNA SARI",
    kodeSto: "20B20",
    namaUnit: "Unit HR",
    jabatan: "Recruiter",
    status: "AKTIF",
    kelas: "Onboarding PKWT Batch 1",
    nilai: 87.33,
    submitDurasiHari: 33,
  },
  {
    id: 3,
    nomorPokok: "33003",
    nama: "MARIO RIZKI",
    kodeSto: "30C30",
    namaUnit: "Unit Finance",
    jabatan: "Accountant",
    status: "TIDAK AKTIF",
    kelas: "Onboarding Pro Hire Batch 1",
    nilai: 75.0,
    submitDurasiHari: 45,
  },
  {
    id: 4,
    nomorPokok: "44004",
    nama: "NADIA PERMATA",
    kodeSto: "40D40",
    namaUnit: "Unit Marketing",
    jabatan: "Brand Manager",
    status: "AKTIF",
    kelas: "Onboarding PKWT Batch 1",
    nilai: 93.25,
    submitDurasiHari: 20,
  },
  {
    id: 5,
    nomorPokok: "55005",
    nama: "OSCAR BUDIMAN",
    kodeSto: "50E50",
    namaUnit: "Unit Legal",
    jabatan: "Compliance Officer",
    status: "AKTIF",
    kelas: "Onboarding MT/Organik Batch 2",
    nilai: 87.33,
    submitDurasiHari: 28,
  },
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("onboarding")
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState(20)
  const [kelasFilter, setKelasFilter] = useState("all")

  const source = tab === "onboarding" ? ONBOARDING_DATA : USER_DATA

  // Sort: nilai desc, then submitDurasiHari asc as tiebreaker
  const sorted = useMemo(
    () =>
      [...source].sort((a, b) => {
        if (b.nilai !== a.nilai) return b.nilai - a.nilai
        return a.submitDurasiHari - b.submitDurasiHari
      }),
    [source]
  )

  const filtered = sorted.filter((r) => {
    const matchesSearch =
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.nomorPokok.includes(search) ||
      r.namaUnit.toLowerCase().includes(search.toLowerCase()) ||
      r.jabatan.toLowerCase().includes(search.toLowerCase())
    const matchesKelas = kelasFilter === "all" || r.kelas === kelasFilter
    return matchesSearch && matchesKelas
  })

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
          Peringkat peserta onboarding berdasarkan rata-rata nilai post test per
          course & fase.
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
              setKelasFilter("all")
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
        <div className="flex flex-wrap items-center gap-3">
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

          {/* Class filter */}
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="kelas-filter" className="text-muted-foreground">
              Kelas:
            </label>
            <select
              id="kelas-filter"
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
            >
              <option value="all">Semua Kelas</option>
              {KELAS_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
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
        <div className="overflow-x-auto">
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
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Nilai
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Durasi Submit
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
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                displayed.map((row, index) => {
                  // Rank is based on position in the globally-sorted+filtered list
                  const rank = index + 1
                  const isTop3 = rank <= 3
                  const medalColor =
                    rank === 1
                      ? "text-amber-500"
                      : rank === 2
                        ? "text-slate-400"
                        : rank === 3
                          ? "text-amber-700"
                          : null

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition hover:bg-muted/40",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "text-sm font-bold",
                            medalColor ?? "text-muted-foreground"
                          )}
                        >
                          {isTop3 ? (
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-current/10 text-xs font-bold">
                              <span className={medalColor ?? ""}>{rank}</span>
                            </span>
                          ) : (
                            rank
                          )}
                        </span>
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
                      <td className="px-4 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
                            row.nilai >= 90
                              ? "bg-emerald-100 text-emerald-700"
                              : row.nilai >= 75
                                ? "bg-sky-100 text-sky-700"
                                : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {row.nilai.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-xs text-muted-foreground tabular-nums">
                        {row.submitDurasiHari} hari
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold text-white",
                            row.status === "AKTIF"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          )}
                        >
                          {row.status}
                        </span>
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
        Menampilkan {displayed.length} dari {filtered.length} entri &mdash;
        diurutkan berdasarkan nilai tertinggi, tiebreaker: durasi submit
        tercepat sejak enroll
      </p>
    </div>
  )
}

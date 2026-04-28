import { useMemo, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react"
import * as XLSX from "xlsx"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/searchable-select"
import {
  getDemoUserTrack,
  getRolePermissions,
  getStoredDemoUser,
} from "@/lib/demo-access"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
type EvaluasiStatus = "Draft" | "Aktif" | "Selesai"

type EvaluasiEntry = {
  id: string
  kelas: string
  track: string
  periode: string
  status: EvaluasiStatus
}

type BagianEvaluasiEntry = {
  id: string
  evaluasiId: string
  kode: string
  nama: string
  urutan: number
}

type PoinEvaluasiEntry = {
  id: string
  bagianId: string
  namaPoin: string
  deskripsi: string
  nilaiMaks: number
}

// ─── Master Bagian Options (from Bagian Evaluasi master data) ─────────────────────
const MASTER_BAGIAN = [
  { kode: "B01", nama: "Pengetahuan & Pemahaman" },
  { kode: "B02", nama: "Keterampilan Teknis" },
  { kode: "B03", nama: "Sikap & Perilaku" },
  { kode: "B04", nama: "Project & Implementasi" },
]

// ─── Seed data ────────────────────────────────────────────────────────────────
const initialEvaluasi: EvaluasiEntry[] = [
  {
    id: "ev-01",
    kelas: "Onboarding PKWT Batch 1",
    track: "PKWT",
    periode: "Jan – Mar 2026",
    status: "Aktif",
  },
  {
    id: "ev-02",
    kelas: "Onboarding MT/Organik Batch 2",
    track: "MT/Organik",
    periode: "Feb – Apr 2026",
    status: "Aktif",
  },
  {
    id: "ev-03",
    kelas: "Onboarding Pro Hire Batch 1",
    track: "Pro Hire",
    periode: "Mar – Mei 2026",
    status: "Draft",
  },
]

const initialBagian: BagianEvaluasiEntry[] = [
  {
    id: "bev-01",
    evaluasiId: "ev-01",
    kode: "B01",
    nama: "Pengetahuan & Pemahaman",
    urutan: 1,
  },
  {
    id: "bev-02",
    evaluasiId: "ev-01",
    kode: "B02",
    nama: "Keterampilan Teknis",
    urutan: 2,
  },
  {
    id: "bev-03",
    evaluasiId: "ev-01",
    kode: "B03",
    nama: "Sikap & Perilaku",
    urutan: 3,
  },
  {
    id: "bev-04",
    evaluasiId: "ev-01",
    kode: "B04",
    nama: "Project & Implementasi",
    urutan: 4,
  },
  {
    id: "bev-05",
    evaluasiId: "ev-02",
    kode: "B01",
    nama: "Pengetahuan & Pemahaman",
    urutan: 1,
  },
  {
    id: "bev-06",
    evaluasiId: "ev-02",
    kode: "B02",
    nama: "Keterampilan Teknis",
    urutan: 2,
  },
  {
    id: "bev-07",
    evaluasiId: "ev-02",
    kode: "B03",
    nama: "Sikap & Perilaku",
    urutan: 3,
  },
]

const initialPoin: PoinEvaluasiEntry[] = [
  {
    id: "p-01",
    bagianId: "bev-01",
    namaPoin: "Pemahaman Nilai Perusahaan",
    deskripsi: "Sejauh mana peserta memahami visi, misi, dan nilai Peruri",
    nilaiMaks: 100,
  },
  {
    id: "p-02",
    bagianId: "bev-01",
    namaPoin: "Penguasaan Materi Onboarding",
    deskripsi: "Kemampuan peserta menjawab soal post-test per fase",
    nilaiMaks: 100,
  },
  {
    id: "p-03",
    bagianId: "bev-01",
    namaPoin: "Pemahaman Struktur Organisasi",
    deskripsi: "Pemahaman struktur unit kerja dan alur koordinasi",
    nilaiMaks: 100,
  },
  {
    id: "p-04",
    bagianId: "bev-02",
    namaPoin: "Kompetensi Tools Kerja",
    deskripsi: "Kemampuan menggunakan alat kerja sesuai jabatan",
    nilaiMaks: 100,
  },
  {
    id: "p-05",
    bagianId: "bev-02",
    namaPoin: "Kualitas Hasil Kerja",
    deskripsi: "Mutu output tugas-tugas yang dikerjakan selama onboarding",
    nilaiMaks: 100,
  },
  {
    id: "p-06",
    bagianId: "bev-03",
    namaPoin: "Kedisiplinan & Kehadiran",
    deskripsi: "Tingkat kehadiran dan ketepatan waktu selama program",
    nilaiMaks: 100,
  },
  {
    id: "p-07",
    bagianId: "bev-03",
    namaPoin: "Etika & Komunikasi",
    deskripsi: "Kesesuaian perilaku dengan budaya organisasi Peruri",
    nilaiMaks: 100,
  },
  {
    id: "p-08",
    bagianId: "bev-04",
    namaPoin: "Relevansi Project dengan Unit Kerja",
    deskripsi: "Keterkaitan project dengan kebutuhan nyata unit kerja",
    nilaiMaks: 100,
  },
  {
    id: "p-09",
    bagianId: "bev-04",
    namaPoin: "Presentasi & Dokumentasi",
    deskripsi: "Kualitas presentasi dan kelengkapan dokumentasi project",
    nilaiMaks: 100,
  },
  {
    id: "p-10",
    bagianId: "bev-05",
    namaPoin: "Pemahaman Nilai Perusahaan",
    deskripsi: "Sejauh mana peserta memahami visi, misi, dan nilai Peruri",
    nilaiMaks: 100,
  },
  {
    id: "p-11",
    bagianId: "bev-05",
    namaPoin: "Penguasaan Materi Onboarding",
    deskripsi: "Kemampuan peserta menjawab soal post-test per fase",
    nilaiMaks: 100,
  },
  {
    id: "p-12",
    bagianId: "bev-06",
    namaPoin: "Kompetensi Tools Kerja",
    deskripsi: "Kemampuan menggunakan alat kerja sesuai jabatan",
    nilaiMaks: 100,
  },
  {
    id: "p-13",
    bagianId: "bev-06",
    namaPoin: "Kualitas Hasil Kerja",
    deskripsi: "Mutu output tugas-tugas yang dikerjakan selama onboarding",
    nilaiMaks: 100,
  },
  {
    id: "p-14",
    bagianId: "bev-07",
    namaPoin: "Kedisiplinan & Kehadiran",
    deskripsi: "Tingkat kehadiran dan ketepatan waktu selama program",
    nilaiMaks: 100,
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────
function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeHeaderKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "")
}

/** Ambil nilai baris Excel jika header cocok dengan salah satu alias. */
function cellByAliases(
  row: Record<string, unknown>,
  aliases: readonly string[]
): string {
  const normalizedAliases = aliases.map(normalizeHeaderKey)
  for (const [header, value] of Object.entries(row)) {
    const nk = normalizeHeaderKey(header)
    if (normalizedAliases.includes(nk)) {
      if (value == null || value === "") return ""
      return String(value).trim()
    }
  }
  return ""
}

function parseEvaluasiStatus(raw: string): EvaluasiStatus {
  const s = normalizeHeaderKey(raw)
  if (s === "aktif") return "Aktif"
  if (s === "selesai") return "Selesai"
  if (s === "draft" || s === "") return "Draft"
  return "Draft"
}

/** Baris pertama sheet = header; kolom wajib: Kelas, Track, Periode; Status opsional. */
function rowsFromExcelBuffer(buf: ArrayBuffer): EvaluasiEntry[] {
  const wb = XLSX.read(buf, { type: "array" })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) return []
  const sheet = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  })
  const out: EvaluasiEntry[] = []
  const kelasAliases = ["kelas", "class", "namakelas"]
  const trackAliases = ["track"]
  const periodeAliases = ["periode", "period"]
  const statusAliases = ["status"]

  for (const row of rows) {
    const kelas = cellByAliases(row, kelasAliases)
    const track = cellByAliases(row, trackAliases)
    const periode = cellByAliases(row, periodeAliases)
    if (!kelas || !track || !periode) continue
    const statusRaw = cellByAliases(row, statusAliases)
    out.push({
      id: uid("ev"),
      kelas,
      track,
      periode,
      status: parseEvaluasiStatus(statusRaw),
    })
  }
  return out
}

export default function EvaluationFeedbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const currentTrack = getDemoUserTrack(currentUser)

  // ── shared state ──────────────────────────────────────────────────────────
  const [evaluasi, setEvaluasi] = useState<EvaluasiEntry[]>(initialEvaluasi)
  const [bagian, setBagian] = useState<BagianEvaluasiEntry[]>(initialBagian)
  const [poin, setPoin] = useState<PoinEvaluasiEntry[]>(initialPoin)

  // ── list-view state ───────────────────────────────────────────────────────
  const [search, setSearch] = useState("")
  const [showEntries, setShowEntries] = useState(20)
  const excelImportInputRef = useRef<HTMLInputElement>(null)

  // ── evaluasi form (add/edit evaluasi) ────────────────────────────────────
  const [showEvalForm, setShowEvalForm] = useState(false)
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null)
  const [evalFormKelas, setEvalFormKelas] = useState("")
  const [evalFormTrack, setEvalFormTrack] = useState("")
  const [evalFormPeriode, setEvalFormPeriode] = useState("")
  const [evalFormStatus, setEvalFormStatus] = useState<EvaluasiStatus>("Draft")

  // ── detail-view expanded sections ────────────────────────────────────────
  const [expandedBagian, setExpandedBagian] = useState<Set<string>>(new Set())

  // ── bagian form ───────────────────────────────────────────────────────────
  const [showBagianForm, setShowBagianForm] = useState(false)
  const [editingBagianId, setEditingBagianId] = useState<string | null>(null)
  const [bagianFormEvalId, setBagianFormEvalId] = useState("")
  const [bagianFormKode, setBagianFormKode] = useState("")

  // ── poin form ─────────────────────────────────────────────────────────────
  const [showPoinForm, setShowPoinForm] = useState(false)
  const [editingPoinId, setEditingPoinId] = useState<string | null>(null)
  const [poinFormBagianId, setPoinFormBagianId] = useState("")
  const [poinFormNama, setPoinFormNama] = useState("")
  const [poinFormDeskripsi, setPoinFormDeskripsi] = useState("")
  const [poinFormNilaiMaks, setPoinFormNilaiMaks] = useState(100)

  const activeId = searchParams.get("id") ?? ""
  const activeSection = searchParams.get("section") ?? ""
  const isDetailView = activeSection === "detail" && Boolean(activeId)

  const selectedEval = evaluasi.find((e) => e.id === activeId) ?? null

  // ── filtered list ─────────────────────────────────────────────────────────
  const filteredEval = useMemo(
    () =>
      evaluasi.filter(
        (e) =>
          !search ||
          e.kelas.toLowerCase().includes(search.toLowerCase()) ||
          e.track.toLowerCase().includes(search.toLowerCase()) ||
          e.periode.toLowerCase().includes(search.toLowerCase())
      ),
    [evaluasi, search]
  )
  const displayedEval = filteredEval.slice(0, showEntries)

  // ── detail data ───────────────────────────────────────────────────────────
  const evalBagian = useMemo(
    () =>
      bagian
        .filter((b) => b.evaluasiId === activeId)
        .sort((a, b) => a.urutan - b.urutan),
    [bagian, activeId]
  )

  const usedBagianKodes = useMemo(
    () => new Set(evalBagian.map((b) => b.kode)),
    [evalBagian]
  )

  const availableBagian = MASTER_BAGIAN.filter(
    (m) => !usedBagianKodes.has(m.kode)
  )

  // ── handlers – evaluasi ───────────────────────────────────────────────────
  function openAddEval() {
    setEditingEvalId(null)
    setEvalFormKelas("")
    setEvalFormTrack("")
    setEvalFormPeriode("")
    setEvalFormStatus("Draft")
    setShowEvalForm(true)
  }

  function openEditEval(e: EvaluasiEntry) {
    setEditingEvalId(e.id)
    setEvalFormKelas(e.kelas)
    setEvalFormTrack(e.track)
    setEvalFormPeriode(e.periode)
    setEvalFormStatus(e.status)
    setShowEvalForm(true)
  }

  function saveEval() {
    if (
      !evalFormKelas.trim() ||
      !evalFormTrack.trim() ||
      !evalFormPeriode.trim()
    )
      return
    if (editingEvalId) {
      setEvaluasi((prev) =>
        prev.map((e) =>
          e.id === editingEvalId
            ? {
                ...e,
                kelas: evalFormKelas,
                track: evalFormTrack,
                periode: evalFormPeriode,
                status: evalFormStatus,
              }
            : e
        )
      )
    } else {
      setEvaluasi((prev) => [
        ...prev,
        {
          id: uid("ev"),
          kelas: evalFormKelas,
          track: evalFormTrack,
          periode: evalFormPeriode,
          status: evalFormStatus,
        },
      ])
    }
    setShowEvalForm(false)
  }

  function deleteEval(id: string) {
    setEvaluasi((prev) => prev.filter((e) => e.id !== id))
    setBagian((prev) => prev.filter((b) => b.evaluasiId !== id))
    setPoin((prev) => {
      const removedBagianIds = bagian
        .filter((b) => b.evaluasiId === id)
        .map((b) => b.id)
      return prev.filter((p) => !removedBagianIds.includes(p.bagianId))
    })
  }

  async function handleExcelImportChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const buf = await file.arrayBuffer()
      const imported = rowsFromExcelBuffer(buf)
      if (imported.length === 0) {
        window.alert(
          "Tidak ada baris valid. Baris pertama harus berisi header (Kelas, Track, Periode; Status opsional). Isi minimal satu baris data di bawahnya."
        )
        return
      }
      setEvaluasi((prev) => [...prev, ...imported])
      window.alert(`Berhasil mengimpor ${imported.length} evaluasi dari Excel.`)
    } catch {
      window.alert(
        "Gagal membaca file. Gunakan .xlsx, .xls, atau .csv dengan struktur yang valid."
      )
    }
  }

  // ── handlers – bagian ─────────────────────────────────────────────────────
  function openAddBagian(evalId: string) {
    setBagianFormEvalId(evalId)
    setEditingBagianId(null)
    setBagianFormKode(availableBagian[0]?.kode ?? "")
    setShowBagianForm(true)
  }

  function openEditBagian(b: BagianEvaluasiEntry) {
    setBagianFormEvalId(b.evaluasiId)
    setEditingBagianId(b.id)
    setBagianFormKode(b.kode)
    setShowBagianForm(true)
  }

  function saveBagian() {
    const master = MASTER_BAGIAN.find((m) => m.kode === bagianFormKode)
    if (!master) return
    if (editingBagianId) {
      setBagian((prev) =>
        prev.map((b) =>
          b.id === editingBagianId
            ? {
                ...b,
                kode: master.kode,
                nama: master.nama,
              }
            : b
        )
      )
    } else {
      const maxUrutan = evalBagian.length
        ? Math.max(...evalBagian.map((b) => b.urutan))
        : 0
      setBagian((prev) => [
        ...prev,
        {
          id: uid("bev"),
          evaluasiId: bagianFormEvalId,
          kode: master.kode,
          nama: master.nama,
          urutan: maxUrutan + 1,
        },
      ])
    }
    setShowBagianForm(false)
  }

  function deleteBagian(id: string) {
    setBagian((prev) => prev.filter((b) => b.id !== id))
    setPoin((prev) => prev.filter((p) => p.bagianId !== id))
  }

  // ── handlers – poin ───────────────────────────────────────────────────────
  function openAddPoin(bagianId: string) {
    setPoinFormBagianId(bagianId)
    setEditingPoinId(null)
    setPoinFormNama("")
    setPoinFormDeskripsi("")
    setPoinFormNilaiMaks(100)
    setShowPoinForm(true)
  }

  function openEditPoin(p: PoinEvaluasiEntry) {
    setPoinFormBagianId(p.bagianId)
    setEditingPoinId(p.id)
    setPoinFormNama(p.namaPoin)
    setPoinFormDeskripsi(p.deskripsi)
    setPoinFormNilaiMaks(p.nilaiMaks)
    setShowPoinForm(true)
  }

  function savePoin() {
    if (!poinFormNama.trim()) return
    if (editingPoinId) {
      setPoin((prev) =>
        prev.map((p) =>
          p.id === editingPoinId
            ? {
                ...p,
                namaPoin: poinFormNama,
                deskripsi: poinFormDeskripsi,
                nilaiMaks: poinFormNilaiMaks,
              }
            : p
        )
      )
    } else {
      setPoin((prev) => [
        ...prev,
        {
          id: uid("poin"),
          bagianId: poinFormBagianId,
          namaPoin: poinFormNama,
          deskripsi: poinFormDeskripsi,
          nilaiMaks: poinFormNilaiMaks,
        },
      ])
    }
    setShowPoinForm(false)
  }

  function deletePoin(id: string) {
    setPoin((prev) => prev.filter((p) => p.id !== id))
  }

  function toggleBagian(id: string) {
    setExpandedBagian((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const participantLabel = useMemo(() => {
    if (currentTrack === "pkwt") return "PKWT"
    if (currentTrack === "mt-organik") return "MT"
    if (currentTrack === "pro-hire") return "Prohire"
    return "PKWT"
  }, [currentTrack])

  // ─── Admin / Examiner view ─────────────────────────────────────────────────
  if (permissions.canManageAdmin || permissions.canManageExaminer) {
    return (
      <div className="space-y-5 p-6">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Evaluasi
          </p>
          {isDetailView && selectedEval ? (
            <>
              <h1 className="mt-1 text-2xl font-bold">{selectedEval.kelas}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedEval.track} &mdash; {selectedEval.periode}
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-1 text-2xl font-bold">Manajemen Evaluasi</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Kelola struktur evaluasi per kelas — bagian dan poin-poin
                evaluasi.
              </p>
            </>
          )}
        </div>

        {/* ── DETAIL VIEW ──────────────────────────────────────────────────── */}
        {isDetailView && selectedEval ? (
          <>
            {/* Back + info bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/evaluasi-feedback")}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  ← Kembali ke Evaluasi
                </button>
                <span className="h-4 w-px bg-border" />
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    selectedEval.status === "Aktif"
                      ? "bg-emerald-100 text-emerald-700"
                      : selectedEval.status === "Selesai"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-600"
                  )}
                >
                  {selectedEval.status}
                </span>
              </div>
            </div>

            {/* Bagian list */}
            <div className="space-y-3">
              {evalBagian.length === 0 && (
                <div className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                  Belum ada bagian evaluasi. Klik &ldquo;Tambah Bagian&rdquo;
                  untuk memulai.
                </div>
              )}

              {evalBagian.map((b, bIdx) => {
                const bPoin = poin.filter((p) => p.bagianId === b.id)
                const isOpen = expandedBagian.has(b.id)

                return (
                  <div
                    key={b.id}
                    className="overflow-hidden rounded-xl border bg-card shadow-sm"
                  >
                    {/* Bagian header */}
                    <div
                      className="flex cursor-pointer items-center justify-between gap-3 bg-[linear-gradient(135deg,#1e3a8a11,#2563eb08)] px-5 py-4 select-none"
                      onClick={() => toggleBagian(b.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1e3a8a,#2563eb)] text-xs font-bold text-white">
                          {bIdx + 1}
                        </div>
                        <div>
                          <p className="font-semibold">
                            <span className="mr-2 font-mono text-xs text-muted-foreground">
                              [{b.kode}]
                            </span>
                            {b.nama}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bPoin.length} poin evaluasi
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditBagian(b)
                          }}
                          className="cursor-pointer text-muted-foreground transition hover:text-primary"
                          title="Edit bagian"
                        >
                          <PencilLine className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBagian(b.id)
                          }}
                          className="cursor-pointer text-muted-foreground transition hover:text-red-500"
                          title="Hapus bagian"
                        >
                          <Trash2 className="size-4" />
                        </button>
                        {isOpen ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Poin list (expanded) */}
                    {isOpen && (
                      <div className="border-t px-5 py-4">
                        {bPoin.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b text-left text-xs font-semibold text-muted-foreground">
                                  <th className="pr-4 pb-2">#</th>
                                  <th className="pr-4 pb-2">
                                    Nama Poin Evaluasi
                                  </th>
                                  <th className="pr-4 pb-2">Deskripsi</th>
                                  <th className="pr-4 pb-2 text-center">
                                    Nilai Maks
                                  </th>
                                  <th className="pb-2 text-center">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {bPoin.map((p, pIdx) => (
                                  <tr
                                    key={p.id}
                                    className="transition hover:bg-muted/30"
                                  >
                                    <td className="py-3 pr-4 text-muted-foreground">
                                      {pIdx + 1}
                                    </td>
                                    <td className="py-3 pr-4 font-medium">
                                      {p.namaPoin}
                                    </td>
                                    <td className="max-w-xs truncate py-3 pr-4 text-muted-foreground">
                                      {p.deskripsi || (
                                        <span className="italic">—</span>
                                      )}
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                        {p.nilaiMaks}
                                      </span>
                                    </td>
                                    <td className="py-3 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => openEditPoin(p)}
                                          className="cursor-pointer text-muted-foreground transition hover:text-primary"
                                          title="Edit poin"
                                        >
                                          <PencilLine className="size-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deletePoin(p.id)}
                                          className="cursor-pointer text-muted-foreground transition hover:text-red-500"
                                          title="Hapus poin"
                                        >
                                          <Trash2 className="size-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="py-2 text-sm text-muted-foreground italic">
                            Belum ada poin evaluasi di bagian ini.
                          </p>
                        )}

                        <div className="mt-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openAddPoin(b.id)}
                          >
                            <Plus className="size-3.5" />
                            Tambah Poin Evaluasi
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Tambah Bagian button */}
            <div>
              <Button
                type="button"
                onClick={() => openAddBagian(activeId)}
                disabled={availableBagian.length === 0}
              >
                <Plus className="size-4" />
                Tambah Bagian
              </Button>
              {availableBagian.length === 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Semua bagian dari Bagian Evaluasi sudah ditambahkan.
                </p>
              )}
            </div>
          </>
        ) : (
          /* ── LIST VIEW ────────────────────────────────────────────────────── */
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                show
                <select
                  value={showEntries}
                  onChange={(e) => setShowEntries(Number(e.target.value))}
                  className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none"
                >
                  {[10, 20, 50].map((n) => (
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
                <Button type="button" className="h-9 rounded-md" onClick={openAddEval}>
                  <Plus className="size-4" />
                  Tambah Evaluasi
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
                        Kelas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Track
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Periode
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                        Bagian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                        <Settings2 className="mx-auto size-4" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayedEval.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Tidak ada evaluasi ditemukan.
                        </td>
                      </tr>
                    ) : (
                      displayedEval.map((ev, idx) => {
                        const evBagianCount = bagian.filter(
                          (b) => b.evaluasiId === ev.id
                        ).length
                        return (
                          <tr
                            key={ev.id}
                            className={cn(
                              "transition hover:bg-muted/40",
                              idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                            )}
                          >
                            <td className="px-4 py-4 text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-4 font-semibold">
                              {ev.kelas}
                            </td>
                            <td className="px-4 py-4 text-muted-foreground">
                              {ev.track}
                            </td>
                            <td className="px-4 py-4 text-muted-foreground">
                              {ev.periode}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                {evBagianCount} bagian
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                  ev.status === "Aktif"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : ev.status === "Selesai"
                                      ? "bg-sky-100 text-sky-700"
                                      : "bg-slate-100 text-slate-600"
                                )}
                              >
                                {ev.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditEval(ev)}
                                  className="cursor-pointer text-muted-foreground transition hover:text-primary"
                                  title="Edit"
                                >
                                  <PencilLine className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteEval(ev.id)}
                                  className="cursor-pointer text-muted-foreground transition hover:text-red-500"
                                  title="Hapus"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  title="Kelola Bagian & Poin"
                                  onClick={() =>
                                    navigate(
                                      `/evaluasi-feedback?section=detail&id=${ev.id}`
                                    )
                                  }
                                >
                                  <Settings2 className="size-4" />
                                </Button>
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
              Menampilkan {displayedEval.length} dari {filteredEval.length}{" "}
              evaluasi
            </p>
          </>
        )}

        {/* ── MODAL: Tambah/Edit Evaluasi ───────────────────────────────────── */}
        {showEvalForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-lg rounded-2xl border bg-background shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
                <h2 className="text-lg font-semibold">
                  {editingEvalId ? "Edit Evaluasi" : "Tambah Evaluasi"}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowEvalForm(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <label className="text-sm font-medium">
                    Nama Kelas <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="mt-2"
                    placeholder="Contoh: Onboarding PKWT Batch 1"
                    value={evalFormKelas}
                    onChange={(e) => setEvalFormKelas(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">
                      Track <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none"
                      value={evalFormTrack}
                      onChange={(e) => setEvalFormTrack(e.target.value)}
                    >
                      <option value="">Pilih track</option>
                      <option value="PKWT">PKWT</option>
                      <option value="MT/Organik">MT/Organik</option>
                      <option value="Pro Hire">Pro Hire</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none"
                      value={evalFormStatus}
                      onChange={(e) =>
                        setEvalFormStatus(e.target.value as EvaluasiStatus)
                      }
                    >
                      <option value="Draft">Draft</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Periode <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="mt-2"
                    placeholder="Contoh: Jan – Mar 2026"
                    value={evalFormPeriode}
                    onChange={(e) => setEvalFormPeriode(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEvalForm(false)}
                  >
                    Batal
                  </Button>
                  <Button type="button" onClick={saveEval}>
                    Simpan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Tambah/Edit Bagian ─────────────────────────────────────── */}
        {showBagianForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl border bg-background shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
                <h2 className="text-lg font-semibold">
                  {editingBagianId ? "Edit Bagian" : "Tambah Bagian"}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowBagianForm(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <label className="text-sm font-medium">
                    Bagian Evaluasi <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    className="mt-2"
                    value={bagianFormKode}
                    onChange={(v) => setBagianFormKode(v)}
                    options={(editingBagianId
                      ? MASTER_BAGIAN
                      : availableBagian
                    ).map((m) => ({
                      value: m.kode,
                      label: `${m.kode} — ${m.nama}`,
                    }))}
                    dynamic
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBagianForm(false)}
                  >
                    Batal
                  </Button>
                  <Button type="button" onClick={saveBagian}>
                    Simpan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Tambah/Edit Poin Evaluasi ─────────────────────────────── */}
        {showPoinForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-lg rounded-2xl border bg-background shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
                <h2 className="text-lg font-semibold">
                  {editingPoinId
                    ? "Edit Poin Evaluasi"
                    : "Tambah Poin Evaluasi"}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPoinForm(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <label className="text-sm font-medium">
                    Nama Poin Evaluasi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="mt-2"
                    placeholder="Contoh: Pemahaman Nilai Perusahaan"
                    value={poinFormNama}
                    onChange={(e) => setPoinFormNama(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deskripsi</label>
                  <textarea
                    rows={3}
                    className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="Deskripsi singkat kriteria penilaian..."
                    value={poinFormDeskripsi}
                    onChange={(e) => setPoinFormDeskripsi(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nilai Maksimal</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    className="mt-2"
                    value={poinFormNilaiMaks}
                    onChange={(e) =>
                      setPoinFormNilaiMaks(Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPoinForm(false)}
                  >
                    Batal
                  </Button>
                  <Button type="button" onClick={savePoin}>
                    Simpan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Participant view ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Evaluasi
        </p>
        <h1 className="mt-1 text-2xl font-bold">Evaluasi Saya</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Formulir evaluasi onboarding track <strong>{participantLabel}</strong>
          .
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Daftar evaluasi</h2>
        <div className="mt-4 space-y-3">
          {evaluasi
            .filter((e) => e.status === "Aktif")
            .map((ev) => {
              const evBagian = bagian.filter((b) => b.evaluasiId === ev.id)
              return (
                <div
                  key={ev.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <p className="font-semibold">{ev.kelas}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {ev.periode}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {evBagian.map((b) => (
                      <span
                        key={b.id}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        {b.nama}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button asChild size="sm">
                      <a href={`/evaluasi?id=${ev.id}`}>Isi Evaluasi</a>
                    </Button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

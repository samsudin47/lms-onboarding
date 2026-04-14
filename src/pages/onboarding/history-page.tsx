import { useMemo, useState } from "react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Input } from "@/components/ui/input"
import { getFeatureByPath } from "@/lib/app-features"

const feature = getFeatureByPath("/riwayat-onboarding")!

const activityRows = [
  {
    date: "2026-04-08",
    activity: "Upload dokumen identitas selesai",
    status: "Sukses",
    participant: "Ayu Pratama",
    stage: "Dokumen",
  },
  {
    date: "2026-04-07",
    activity: "Hadir sesi orientasi HR",
    status: "Tercatat",
    participant: "Ayu Pratama",
    stage: "Orientasi",
  },
  {
    date: "2026-04-06",
    activity: "Mulai modul budaya kerja",
    status: "Berjalan",
    participant: "Ayu Pratama",
    stage: "Modul",
  },
  {
    date: "2026-04-05",
    activity: "Sinkron data dari rekrutment",
    status: "Sukses",
    participant: "Nadia Putri",
    stage: "Integrasi",
  },
] as const

export default function HistoryPage() {
  const [query, setQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [stage, setStage] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return activityRows.filter((row) => {
      const matchQuery =
        !q ||
        row.activity.toLowerCase().includes(q) ||
        row.participant.toLowerCase().includes(q)
      const matchFrom = !dateFrom || row.date >= dateFrom
      const matchStage = !stage || row.stage === stage
      return matchQuery && matchFrom && matchStage
    })
  }, [dateFrom, query, stage])

  return (
    <FeaturePageLayout feature={feature}>
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <h2 className="text-sm font-semibold">Filter riwayat aktivitas</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Cari teks
                </label>
                <Input
                  className="mt-1"
                  placeholder="Nama peserta atau aktivitas"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Dari tanggal
                </label>
                <Input
                  className="mt-1"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Tahapan
                </label>
                <select
                  className="mt-1 flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="">Semua</option>
                  <option value="Dokumen">Dokumen</option>
                  <option value="Orientasi">Orientasi</option>
                  <option value="Modul">Modul</option>
                  <option value="Integrasi">Integrasi</option>
                </select>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Menampilkan {filtered.length} dari {activityRows.length} entri demo.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Tanggal</th>
                <th className="px-3 py-2 font-medium">Peserta</th>
                <th className="px-3 py-2 font-medium">Aktivitas</th>
                <th className="px-3 py-2 font-medium">Tahap</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={`${row.date}-${row.activity}`} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{row.date}</td>
                  <td className="px-3 py-2">{row.participant}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.activity}
                  </td>
                  <td className="px-3 py-2">{row.stage}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tidak ada data untuk filter saat ini.
            </p>
          ) : null}
        </div>
      </section>
    </FeaturePageLayout>
  )
}

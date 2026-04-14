import { useState } from "react"
import { Link } from "react-router-dom"
import { Database } from "lucide-react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFeatureByPath } from "@/lib/app-features"

const feature = getFeatureByPath("/integrasi-data-rekrutment")!

const recruits = [
  { name: "Nadia Putri", source: "Recruitment Portal", status: "Sinkron" },
  { name: "Rizky Pratama", source: "ATS HR", status: "Sinkron" },
  {
    name: "Salsa Ramadhani",
    source: "Recruitment Portal",
    status: "Menunggu",
  },
] as const

export default function RecruitmentIntegrationPage() {
  const [baseUrl, setBaseUrl] = useState("https://ats.perusahaan.co.id/api/v1")
  const [apiKey, setApiKey] = useState("")
  const [connection, setConnection] = useState<"idle" | "ok" | "fail">("idle")
  const [syncLog, setSyncLog] = useState<string[]>([])

  function testConnection() {
    if (!baseUrl.trim()) {
      setConnection("fail")
      return
    }
    setConnection("ok")
  }

  function runSync() {
    const stamp = new Date().toLocaleString()
    setSyncLog((prev) => [
      `[${stamp}] Memanggil GET ${baseUrl}/candidates?status=hired`,
      `[${stamp}] Mapping 3 karyawan baru ke onboarding LMS`,
      ...prev,
    ].slice(0, 6))
  }

  return (
    <FeaturePageLayout feature={feature}>
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Konfigurasi API rekrutment</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Bidang berikut mensimulasikan pipeline integrasi: endpoint REST,
            kunci akses, uji koneksi, dan sinkronisasi batch.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="api-base" className="text-sm font-medium">
                Base URL API / webhook
              </label>
              <Input
                id="api-base"
                className="mt-2"
                placeholder="https://..."
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="api-key" className="text-sm font-medium">
                API key / token (contoh)
              </label>
              <Input
                id="api-key"
                type="password"
                className="mt-2"
                placeholder="••••••••"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={testConnection}>
                Tes koneksi
              </Button>
              <Button type="button" onClick={runSync}>
                Sinkronkan data sekarang
              </Button>
              <Button asChild variant="secondary">
                <Link to="/class">Lanjut ke penempatan batch</Link>
              </Button>
            </div>
            {connection === "ok" ? (
              <p className="text-sm text-primary">
                Koneksi berhasil (mock): host mencapai endpoint.
              </p>
            ) : null}
            {connection === "fail" ? (
              <p className="text-sm text-destructive">
                URL belum valid (demo): lengkapi base URL terlebih dahulu.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Antrean sinkronisasi</h3>
            <div className="mt-4 space-y-3">
              {recruits.map((recruit) => (
                <div
                  key={recruit.name}
                  className="rounded-lg border bg-background p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{recruit.name}</p>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {recruit.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sumber: {recruit.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Log pipeline (demo)</h3>
            {syncLog.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Tekan &quot;Sinkronkan data sekarang&quot; untuk melihat jejak
                aktivitas.
              </p>
            ) : (
              <ul className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
                {syncLog.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </FeaturePageLayout>
  )
}

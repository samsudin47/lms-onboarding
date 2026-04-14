import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { FileText, Link2 } from "lucide-react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { getFeatureByPath } from "@/lib/app-features"

const feature = getFeatureByPath("/kategori-onboarding")!

const categoryOptions = [
  {
    value: "PKWT",
    label: "PKWT",
    summary:
      "Perjanjian Kerja Waktu Tertentu — modul kebijakan kontrak, benefit terbatas, dan compliance ketenagakerjaan.",
  },
  {
    value: "MAGANG_TRAINEE",
    label: "Magang-Trainee",
    summary:
      "Program magang atau trainee — fokus pembimbingan, logbook aktivitas, dan evaluasi mentor mingguan.",
  },
  {
    value: "PROHIRE",
    label: "Prohire",
    summary:
      "Professional hire — materi leadership ringkas, visi bisnis unit, dan ekspektasi kinerja rol profesional.",
  },
  {
    value: "ALIH_DAYA",
    label: "Alih Daya",
    summary:
      "Tenaga alih daya — kebijakan site access, SLA layanan, dan batasan data sensitif per klien.",
  },
  {
    value: "MAGANG_PKWT",
    label: "Magang untuk PKWT",
    summary:
      "Magang dengan pola kontrak PKWT — gabungan modul kontrak & magang serta penetapan masa percobaan.",
  },
] as const

export default function CategoryPage() {
  const [selected, setSelected] = useState<string>(categoryOptions[0].value)

  const active = useMemo(
    () => categoryOptions.find((c) => c.value === selected)!,
    [selected]
  )

  return (
    <FeaturePageLayout feature={feature}>
      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Kategori onboarding peserta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Klasifikasi sesuai dokumen kebutuhan: PKWT, Magang-Trainee, Prohire,
            Alih Daya, dan Magang untuk PKWT.
          </p>

          <div className="mt-6">
            <label
              htmlFor="category-select"
              className="text-sm font-medium text-foreground"
            >
              Pilih kategori
            </label>
            <select
              id="category-select"
              className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 rounded-lg border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Penyesuaian proses
            </p>
            <p className="mt-2 text-sm leading-6">{active.summary}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/journey-onboarding">
                <Link2 className="size-4" />
                Terapkan ke journey
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/modul-pembelajaran-interaktif">Buka modul relevan</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Ringkasan tiap kategori</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {categoryOptions.map((c) => (
              <div
                key={c.value}
                className={`rounded-lg border p-4 transition-colors ${
                  c.value === selected
                    ? "border-primary bg-primary/5"
                    : "bg-background"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <p className="font-medium">{c.label}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {c.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FeaturePageLayout>
  )
}

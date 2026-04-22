import { useMemo } from "react"
import { Download, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getStoredDemoUser } from "@/lib/demo-access"
import { cn } from "@/lib/utils"

type Props = {
  batchName: string
  /** Contoh: "Batch 1" */
  batch: string
  period: string
  track: string
  className?: string
}

function buildCertificateHtml(
  p: {
    userName: string
    batchName: string
    batch: string
    period: string
    track: string
    issueDate: string
  }
) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sertifikat — ${p.batchName.replace(/</g, "")}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f4f4f5; color: #18181b; margin: 0; padding: 2rem; }
    .frame { max-width: 44rem; margin: 0 auto; background: #fff; border: 3px double #d4a574; border-radius: 4px; padding: 2.5rem; box-shadow: 0 8px 30px rgba(0,0,0,.08); }
    h1 { font-size: 1.5rem; letter-spacing: .12em; text-transform: uppercase; text-align: center; margin: 0 0 0.25rem; color: #1e3a5f; }
    .sub { text-align: center; font-size: 0.8rem; color: #52525b; margin-bottom: 1.5rem; }
    .line { text-align: center; font-size: 0.95rem; color: #3f3f46; }
    .name { text-align: center; font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0.5rem 0 1.25rem; }
    .meta { text-align: center; font-size: 0.9rem; line-height: 1.5; color: #52525b; margin: 0.75rem 0; }
    .seal { text-align: center; margin-top: 2rem; font-size: 0.7rem; color: #a1a1aa; }
    @media print { body { background: #fff; } .frame { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="frame">
    <h1>Sertifikat penyelesaian</h1>
    <p class="sub">Program onboarding — ${esc(p.track)}</p>
    <p class="line">Diberikan kepada</p>
    <p class="name">${esc(p.userName)}</p>
    <p class="meta">Atas partisipasi dan penyelesaian <strong>${esc(p.batchName)}</strong> (${esc(p.batch)})</p>
    <p class="meta">Periode: ${esc(p.period)}</p>
    <p class="meta">Diterbitkan: ${esc(p.issueDate)}</p>
    <p class="seal">Dokumen ini dihasilkan dari sistem onboarding (demo) — tanda tangan digital akan tersedia pada produksi.</p>
  </div>
</body>
</html>`
}

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function JourneyCertificateSection({
  batchName,
  batch,
  period,
  track,
  className,
}: Props) {
  const user = getStoredDemoUser()
  const userName = (user.name ?? "Peserta").trim() || "Peserta"
  const issueDate = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date()),
    []
  )

  function download() {
    const html = buildCertificateHtml({
      userName,
      batchName,
      batch,
      period,
      track,
      issueDate,
    })
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const safe = batchName
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-zA-Z0-9-]/g, "")
    a.href = url
    a.download = `Sertifikat-${safe || "onboarding"}.html`
    a.rel = "noopener"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      id="sertifikat-onboarding"
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        className
      )}
    >
      <div className="border-b bg-muted/30 px-5 py-4">
        <h3 className="text-base font-semibold">Sertifikat penyelesaian</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Pratinjau sertifikat program <strong>{batchName}</strong>. Unduh
          salinan HTML untuk arsip; PDF resmi tersedia pada produksi.
        </p>
      </div>
      <div className="space-y-4 p-5">
        <div
          className="relative overflow-hidden rounded-lg border-2 border-dashed border-amber-200/80 bg-linear-to-b from-amber-50/40 to-card px-5 py-8 shadow-inner md:px-8 md:py-10"
          aria-label="Pratinjau sertifikat"
        >
          <div
            className="pointer-events-none absolute -right-6 -top-6 opacity-10"
            aria-hidden
          >
            <Sparkles className="size-32 text-amber-600" />
          </div>
          <p className="text-center text-[0.7rem] font-bold tracking-[0.2em] text-primary uppercase">
            Sertifikat
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Program onboarding — {track}
          </p>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Diberikan kepada
          </p>
          <p className="text-center text-xl font-bold text-foreground md:text-2xl">
            {userName}
          </p>
          <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
            Atas partisipasi dan penyelesaian <strong>{batchName}</strong> (
            {batch})
          </p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Periode: {period}
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Diterbitkan: {issueDate}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" className="gap-2" onClick={download}>
            <Download className="size-4" />
            Unduh sertifikat
          </Button>
        </div>
      </div>
    </div>
  )
}

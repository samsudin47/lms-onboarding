import { useMemo } from "react"
import { Download, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCertificateConfig } from "@/lib/certificate-settings-storage"
import { getStoredDemoUser } from "@/lib/demo-access"
import { cn } from "@/lib/utils"

type Props = {
  batchName: string
  /** Contoh: "Batch 1" */
  batch: string
  period: string
  track: string
  /** Sinkron dengan pengaturan admin (mock localStorage) */
  batchId?: string
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
    certTitle: string
    officialName: string
    officialTitle: string
  }
) {
  const signBlock =
    p.officialName || p.officialTitle
      ? `<p class="official">${esc(p.officialName)}</p><p class="role">${esc(p.officialTitle)}</p>`
      : `<p class="seal-note">Tanda tangan pejabat akan tersedia sesuai dokumen resmi (produksi).</p>`

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(p.certTitle)} — ${p.batchName.replace(/</g, "")}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f4f4f5; color: #18181b; margin: 0; padding: 2rem; }
    .frame { max-width: 44rem; margin: 0 auto; background: #fff; border: 3px double #d4a574; border-radius: 4px; padding: 2.5rem; box-shadow: 0 8px 30px rgba(0,0,0,.08); }
    h1 { font-size: 1.35rem; letter-spacing: .08em; text-align: center; margin: 0 0 0.25rem; color: #1e3a5f; }
    .sub { text-align: center; font-size: 0.8rem; color: #52525b; margin-bottom: 1.5rem; }
    .line { text-align: center; font-size: 0.95rem; color: #3f3f46; }
    .name { text-align: center; font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0.5rem 0 1.25rem; }
    .meta { text-align: center; font-size: 0.9rem; line-height: 1.5; color: #52525b; margin: 0.75rem 0; }
    .sign { margin-top: 2rem; text-align: center; font-size: 0.85rem; color: #3f3f46; }
    .official { font-weight: 700; margin: 0; }
    .role { margin: 0.25rem 0 0; font-size: 0.8rem; color: #52525b; }
    .seal-note { font-size: 0.72rem; color: #a1a1aa; margin-top: 1rem; }
    @media print { body { background: #fff; } .frame { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="frame">
    <h1>${esc(p.certTitle)}</h1>
    <p class="sub">Program onboarding — ${esc(p.track)}</p>
    <p class="line">Diberikan kepada</p>
    <p class="name">${esc(p.userName)}</p>
    <p class="meta">Atas partisipasi dan penyelesaian <strong>${esc(p.batchName)}</strong> (${esc(p.batch)})</p>
    <p class="meta">Periode: ${esc(p.period)}</p>
    <p class="meta">Diterbitkan: ${esc(p.issueDate)}</p>
    <div class="sign">${signBlock}</div>
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
  batchId,
  className,
}: Props) {
  const user = getStoredDemoUser()
  const userName = (user.name ?? "Peserta").trim() || "Peserta"
  const issueDate = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date()),
    []
  )

  const cfg = batchId ? getCertificateConfig(batchId) : null
  const certTitle =
    cfg?.certificateTitle.trim() || "Sertifikat penyelesaian"
  const officialName = cfg?.officialName?.trim() ?? ""
  const officialTitle = cfg?.officialTitle?.trim() ?? ""
  const hasTemplateBg =
    cfg?.templateDataUrl?.startsWith("data:image") ?? false

  function download() {
    const html = buildCertificateHtml({
      userName,
      batchName,
      batch,
      period,
      track,
      issueDate,
      certTitle,
      officialName,
      officialTitle,
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
          salinan HTML untuk arsip; PDF resmi mengikuti template yang diatur
          admin.
        </p>
      </div>
      <div className="space-y-4 p-5">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border-2 px-5 py-8 shadow-inner md:px-8 md:py-10",
            hasTemplateBg ? "border-amber-200/60" : "border-dashed border-amber-200/80 bg-linear-to-b from-amber-50/40 to-card"
          )}
          style={
            hasTemplateBg && cfg?.templateDataUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.9)), url(${cfg.templateDataUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
          aria-label="Pratinjau sertifikat"
        >
          {!hasTemplateBg ? (
            <div
              className="pointer-events-none absolute -right-6 -top-6 opacity-10"
              aria-hidden
            >
              <Sparkles className="size-32 text-amber-600" />
            </div>
          ) : null}
          <p className="text-center text-[0.7rem] font-bold tracking-[0.18em] text-primary uppercase">
            {certTitle}
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
          {(officialName || officialTitle || cfg?.signatureDataUrl) && (
            <div className="mt-8 flex flex-col items-center gap-2 border-t border-dashed border-border/80 pt-6">
              {cfg?.signatureDataUrl?.startsWith("data:image") ? (
                <img
                  src={cfg.signatureDataUrl}
                  alt=""
                  className="max-h-16 object-contain"
                />
              ) : null}
              {officialName ? (
                <p className="text-center text-sm font-bold text-foreground">
                  {officialName}
                </p>
              ) : null}
              {officialTitle ? (
                <p className="text-center text-xs text-muted-foreground">
                  {officialTitle}
                </p>
              ) : null}
            </div>
          )}
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

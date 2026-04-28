import { useEffect, useState } from "react"
import { FileImage, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  defaultBatchCertificateConfig,
  getCertificateConfig,
  saveCertificateConfig,
  type BatchCertificateConfig,
} from "@/lib/certificate-settings-storage"
import { cn } from "@/lib/utils"

const MAX_TEMPLATE_BYTES = 3 * 1024 * 1024
const MAX_SIG_BYTES = 750 * 1024

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result ?? ""))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}


type Props = {
  open: boolean
  onClose: () => void
  batchId: string
  batchDisplayName: string
}

export function CertificateSettingsModal({
  open,
  onClose,
  batchId,
  batchDisplayName,
}: Props) {
  const [draft, setDraft] = useState<BatchCertificateConfig>(() =>
    defaultBatchCertificateConfig()
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErr(null)
    const existing = getCertificateConfig(batchId)
    if (existing) {
      setDraft({ ...existing })
    } else {
      setDraft(defaultBatchCertificateConfig())
    }
  }, [open, batchId])

  if (!open) return null

  async function onPickTemplateFile(f: File) {
    setErr(null)
    if (f.size > MAX_TEMPLATE_BYTES) {
      setErr("Ukuran template maksimal 3 MB.")
      return
    }
    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    if (isPdf) {
      const url = await readAsDataUrl(f)
      setDraft((s) => ({
        ...s,
        templateFileName: f.name,
        templateMime: f.type || "application/pdf",
        templateDataUrl: null,
        templatePdfDataUrl: url,
      }))
      return
    }
    if (!f.type.startsWith("image/")) {
      setErr("Template harus gambar (PNG/JPEG/WebP) atau PDF.")
      return
    }
    const url = await readAsDataUrl(f)
    setDraft((s) => ({
      ...s,
      templateFileName: f.name,
      templateMime: f.type,
      templateDataUrl: url,
      templatePdfDataUrl: null,
    }))
  }

  async function onPickSignatureFile(f: File) {
    setErr(null)
    if (f.size > MAX_SIG_BYTES) {
      setErr("File tanda tangan maksimal 750 KB.")
      return
    }
    if (!f.type.startsWith("image/")) {
      setErr("Tanda tangan harus berupa gambar.")
      return
    }
    const url = await readAsDataUrl(f)
    setDraft((s) => ({
      ...s,
      signatureFileName: f.name,
      signatureDataUrl: url,
    }))
  }

  function persist() {
    setSaving(true)
    setErr(null)
    try {
      const out: BatchCertificateConfig = {
        ...draft,
        officialName: draft.officialName.trim(),
        officialTitle: draft.officialTitle.trim(),
        certificateTitle:
          draft.certificateTitle.trim() ||
          defaultBatchCertificateConfig().certificateTitle,
        placeholderNote: draft.placeholderNote.trim(),
        updatedAt: new Date().toISOString(),
      }
      saveCertificateConfig(batchId, out)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-3 py-6">
      <div
        className={cn(
          "my-auto flex w-full max-w-lg flex-col rounded-2xl border bg-card shadow-xl",
          "max-h-[min(90vh,800px)]"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">Pengaturan sertifikat</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {batchDisplayName}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Unggah template sertifikat, berkas tanda tangan pejabat, serta isian
            teks. Dengan mengunggah contoh template, tim dapat menyesuaikan field
            yang di-generate (nama peserta, judul, pejabat) pada cetakan akhir.
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Template sertifikat
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                Gambar (PNG/JPEG/WebP) untuk pratinjau; PDF dapat diunggah untuk
                referensi alur generate profesional.
              </p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center hover:bg-muted/35">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    void onPickTemplateFile(f).catch(() =>
                      setErr("Gagal membaca berkas.")
                    )
                    e.target.value = ""
                  }}
                />
                <FileImage className="size-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Klik untuk unggah template
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Maks. 3 MB
                </span>
              </label>
              {draft.templateFileName ? (
                <p className="mt-2 text-xs font-mono text-primary">
                  {draft.templateFileName}
                </p>
              ) : null}
              {draft.templateDataUrl?.startsWith("data:image") ? (
                <div className="mt-3 overflow-hidden rounded-lg border">
                  <img
                    alt="Pratinjau template"
                    src={draft.templateDataUrl}
                    className="max-h-44 w-full bg-muted/30 object-contain"
                  />
                </div>
              ) : draft.templatePdfDataUrl ? (
                <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                  Berkas PDF tersimpan untuk referensi generate. Untuk pratinjau
                  visual di mock, unggah juga versi gambar template.
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Unggah tanda tangan (gambar PNG/JPEG/WebP)
              </label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  void onPickSignatureFile(f).catch(() =>
                    setErr("Gagal membaca berkas.")
                  )
                  e.target.value = ""
                }}
                className="cursor-pointer border-dashed text-sm file:mr-2 file:text-sm"
              />
              {draft.signatureDataUrl?.startsWith("data:image") ? (
                <div className="mt-3 flex justify-center border-t pt-3">
                  <img
                    alt="Tanda tangan"
                    src={draft.signatureDataUrl}
                    className="max-h-24 max-w-[min(280px,100%)] object-contain"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Judul sertifikat
              </label>
              <Input
                value={draft.certificateTitle}
                onChange={(e) =>
                  setDraft((s) => ({
                    ...s,
                    certificateTitle: e.target.value,
                  }))
                }
                placeholder="Mis. Sertifikat Penyelesaian Onboarding PKWT"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Teks judul yang akan di-generate pada area judul di template.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama pejabat penandatangan
                </label>
                <Input
                  value={draft.officialName}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, officialName: e.target.value }))
                  }
                  placeholder="Tulis manual"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Jabatan pejabat
                </label>
                <Input
                  value={draft.officialTitle}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, officialTitle: e.target.value }))
                  }
                  placeholder="Tulis manual"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Catatan pemetaan ke template{" "}
                <span className="font-normal text-muted-foreground">(opsional)</span>
              </label>
              <textarea
                value={draft.placeholderNote}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, placeholderNote: e.target.value }))
                }
                placeholder="Contoh: nama peserta mengikuti kotak tengah; baris bawah untuk pejabat dan jabatan sesuai legenda template PDF."
                rows={4}
                className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {err ? (
            <p className="mt-4 text-sm text-red-600">{err}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" disabled={saving} onClick={persist}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Menyimpan
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Konfigurasi sertifikat per batch (mock: localStorage).
 * Produksi: API + penyimpanan file di server.
 */

const STORAGE_KEY = "lms-batch-certificate-settings-local"

export type BatchCertificateConfig = {
  /** Nama file asli template (PDF/gambar) */
  templateFileName: string | null
  /** Data URL gambar template (PNG/JPEG/WebP) untuk pratinjau */
  templateDataUrl: string | null
  /** MIME template saat di-upload */
  templateMime: string | null
  /** Data URL PDF (mock)—file besar; hapus di produksi ganti bucket URL */
  templatePdfDataUrl: string | null
  signatureFileName: string | null
  signatureDataUrl: string | null
  /** Nama pejabat penandatangan */
  officialName: string
  /** Jabatan pejabat */
  officialTitle: string
  /** Judul utama di sertifikat (sesuai area di template) */
  certificateTitle: string
  /** Catatan pemetaan field template ↔ data generate */
  placeholderNote: string
  updatedAt: string
}

export function defaultBatchCertificateConfig(): BatchCertificateConfig {
  return {
    templateFileName: null,
    templateDataUrl: null,
    templateMime: null,
    templatePdfDataUrl: null,
    signatureFileName: null,
    signatureDataUrl: null,
    officialName: "",
    officialTitle: "",
    certificateTitle: "Sertifikat Penyelesaian",
    placeholderNote: "",
    updatedAt: new Date().toISOString(),
  }
}

function readRaw(): Record<string, BatchCertificateConfig> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw) as unknown
    return p && typeof p === "object" ? (p as Record<string, BatchCertificateConfig>) : {}
  } catch {
    return {}
  }
}

export function loadAllCertificateSettings(): Record<
  string,
  BatchCertificateConfig
> {
  return readRaw()
}

export function getCertificateConfig(
  batchId: string | null | undefined
): BatchCertificateConfig | null {
  if (!batchId) return null
  const raw = readRaw()[batchId]
  if (!raw) return null
  return {
    ...defaultBatchCertificateConfig(),
    ...raw,
    templatePdfDataUrl: raw.templatePdfDataUrl ?? null,
  }
}

export function saveCertificateConfig(
  batchId: string,
  config: BatchCertificateConfig
) {
  if (typeof window === "undefined") return
  const all = readRaw()
  all[batchId] = config
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function isCertificateConfigured(batchId: string): boolean {
  const c = getCertificateConfig(batchId)
  return Boolean(
    c &&
      (c.templateDataUrl ||
        c.templatePdfDataUrl ||
        c.templateFileName ||
        c.signatureDataUrl ||
        c.officialName.trim())
  )
}

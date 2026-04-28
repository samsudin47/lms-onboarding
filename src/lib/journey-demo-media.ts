/** URL ke berkas di folder `public/` (sesuai BASE_URL Vite). */
export function journeyPublicAsset(filename: string): string {
  const base = import.meta.env.BASE_URL ?? "/"
  const path = filename.startsWith("/") ? filename.slice(1) : filename
  return base.endsWith("/") ? `${base}${path}` : `${base}/${path}`
}

const DEMO_VIDEO_SRC = journeyPublicAsset("demo-materi.mp4")
const DEMO_PDF_SRC = journeyPublicAsset("demo-materi.pdf")

export type JourneyDemoMateriInput = {
  contentLabel: string
  variant?: "standard" | "evaluasi-feedback"
  /** Menimpa heuristik dari contentLabel (untuk materi multi-langkah). */
  demoKind?: "pdf" | "video"
}

export type JourneyDemoMedia =
  | { kind: "pdf" | "video"; src: string }
  | null

/**
 * Embed video vs PDF dari pola `contentLabel` materi journey.
 * Sisanya memakai PDF (mis. slide/dokumen/presentasi/review).
 */
export function resolveJourneyDemoMedia(
  m: JourneyDemoMateriInput
): JourneyDemoMedia {
  if (m.variant === "evaluasi-feedback") return null

  if (m.demoKind === "pdf") {
    return { kind: "pdf", src: DEMO_PDF_SRC }
  }
  if (m.demoKind === "video") {
    return { kind: "video", src: DEMO_VIDEO_SRC }
  }

  const label = m.contentLabel.toLowerCase()

  const isVideo =
    /\bvideo\b/.test(label) ||
    label.includes("ceramah") ||
    label.includes("diskusi") ||
    label.includes("briefing") ||
    label.includes("workshop") ||
    label.includes("praktik") ||
    label.includes("sesi perkenalan")

  return isVideo
    ? { kind: "video", src: DEMO_VIDEO_SRC }
    : { kind: "pdf", src: DEMO_PDF_SRC }
}

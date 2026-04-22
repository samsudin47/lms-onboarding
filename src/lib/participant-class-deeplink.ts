import type { DemoTrackKey } from "./demo-access"

/**
 * ID batch default untuk deep-link "My Classes" (prioritas: kelas Sedang Berjalan
 * per track, diselaraskan dengan `initialBatches` di `class-batch-page`).
 */
const DEFAULT_JOURNEY_BY_TRACK: Record<DemoTrackKey, string> = {
  pkwt: "batch-pkwt-apr",
  "pro-hire": "batch-prohire-apr",
  "mt-organik": "batch-mt-may",
}

export function getDefaultJourneyIdForTrack(track: DemoTrackKey): string {
  return DEFAULT_JOURNEY_BY_TRACK[track]
}

/** URL tujuan sidebar / CTA: langsung ke halaman detail journey, buka overview kartu. */
export function getParticipantMyClassesHref(track: DemoTrackKey): string {
  const p = new URLSearchParams()
  p.set("track", track)
  p.set("section", "journey-detail")
  p.set("journey", getDefaultJourneyIdForTrack(track))
  p.set("step", "1")
  return `/class?${p.toString()}`
}

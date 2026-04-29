/** Sinkron mock class_users ↔ Daftar Pengguna (localStorage). */

export type ClassUserEnrollmentStatus = "enrolled" | "completed"

export type ClassUserRowPayload = {
  id: string
  batchId: string
  batchName: string
  nomorPokok: string
  nama: string
  status: ClassUserEnrollmentStatus
  enrolledAt: string | null
}

const LS_KEY = "lms:class-users-sync:v1"

export function persistClassUserRows(rows: ClassUserRowPayload[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ rows, savedAt: Date.now() }))
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(new CustomEvent("lms-class-users-updated"))
}

export function loadClassUserRows(): ClassUserRowPayload[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const p = JSON.parse(raw) as { rows?: ClassUserRowPayload[] }
    return Array.isArray(p.rows) ? p.rows : []
  } catch {
    return []
  }
}

function formatEnrolledAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Ringkas untuk kolom Daftar Pengguna (satu baris per user). */
export function getClassUserColumnsForNomorPokok(
  np: string,
  rows: ClassUserRowPayload[]
): { statusKelas: string; enrolledAt: string } {
  const hits = rows.filter(
    (r) => r.nomorPokok.trim().toLowerCase() === np.trim().toLowerCase()
  )
  if (!hits.length) return { statusKelas: "—", enrolledAt: "—" }

  const completed = hits.some((h) => h.status === "completed")
  const statusKelas = completed
    ? "Selesai"
    : hits.some((h) => h.status === "enrolled")
      ? "Berlangsung"
      : "—"

  const dates = hits
    .map((h) => h.enrolledAt)
    .filter((x): x is string => Boolean(x && x.trim()))
    .sort()
  const enrolledAt =
    dates.length > 0 ? formatEnrolledAt(dates[0]!) : "—"

  return { statusKelas, enrolledAt }
}

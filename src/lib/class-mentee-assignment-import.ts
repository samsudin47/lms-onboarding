import {
  resolveDirectoryUser,
  USER_DIRECTORY_SEED,
  type UserDirectorySeedRow,
} from "@/lib/user-directory-seed"
import { cellByAliases, sheetToDataRows } from "@/lib/excel-import"

function resolveAssigneeLabel(raw: string): string {
  const t = raw.trim()
  if (!t) return ""
  const u = resolveDirectoryUser(t)
  return u ? u.nama : t
}

function resolveMenteeUser(raw: string): UserDirectorySeedRow | undefined {
  return resolveDirectoryUser(raw)
}

export type ParsedClassMenteeRow = {
  nomorPokok: string
  nama: string
  jabatan: string
  mentor: string
  coMentor: string
}

export function parseClassMenteeAssignmentsFromExcel(buf: ArrayBuffer): {
  rows: ParsedClassMenteeRow[]
  errors: string[]
} {
  let data: Record<string, unknown>[]
  try {
    data = sheetToDataRows(buf)
  } catch {
    return { rows: [], errors: ["File tidak dapat dibaca."] }
  }

  const errors: string[] = []
  const rows: ParsedClassMenteeRow[] = []
  const seenNp = new Set<string>()

  data.forEach((raw, idx) => {
    const line = idx + 2

    const menteeCell = cellByAliases(raw, [
      "mentee",
      "nama_mentee",
      "peserta",
      "nama",
      "nomor_pokok",
      "nomorpokok",
      "np",
    ])
    const mentorCell = cellByAliases(raw, ["mentor"])
    const coCell = cellByAliases(raw, [
      "co_mentor",
      "comentor",
      "co-mentor",
      "komentor",
      "co mentor",
    ])

    if (!menteeCell.trim()) {
      if (!mentorCell.trim() && !coCell.trim()) return
      errors.push(`Baris ${line}: kolom mentee kosong.`)
      return
    }

    const menteeUser = resolveMenteeUser(menteeCell)
    if (!menteeUser) {
      errors.push(
        `Baris ${line}: mentee "${menteeCell.trim()}" tidak ada di tabel pengguna.`
      )
      return
    }

    const npKey = menteeUser.nomorPokok.toLowerCase()
    if (seenNp.has(npKey)) {
      errors.push(`Baris ${line}: mentee duplikat (${menteeUser.nomorPokok}).`)
      return
    }
    seenNp.add(npKey)

    rows.push({
      nomorPokok: menteeUser.nomorPokok,
      nama: menteeUser.nama,
      jabatan: menteeUser.jabatan,
      mentor: resolveAssigneeLabel(mentorCell),
      coMentor: resolveAssigneeLabel(coCell),
    })
  })

  return { rows, errors }
}

/** Label dropdown: nama — NP · jabatan */
export function directoryUserSelectLabel(u: UserDirectorySeedRow) {
  return `${u.nama} — ${u.nomorPokok} · ${u.jabatan}`
}

export function namaFromDirectoryNp(np: string): string {
  const t = np.trim()
  if (!t) return ""
  const u = USER_DIRECTORY_SEED.find((x) => x.nomorPokok === t)
  return u?.nama ?? ""
}

/** Cocokkan nama tersimpan ke nomor pokok (untuk edit). */
export function directoryNpFromStoredNamaOrNp(raw: string): string {
  const t = raw.trim()
  if (!t) return ""
  const byNp = USER_DIRECTORY_SEED.find((x) => x.nomorPokok === t)
  if (byNp) return byNp.nomorPokok
  const byNama = USER_DIRECTORY_SEED.find(
    (x) => x.nama.trim().toLowerCase() === t.toLowerCase()
  )
  return byNama?.nomorPokok ?? ""
}

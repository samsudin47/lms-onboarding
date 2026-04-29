import * as XLSX from "xlsx"

export function normalizeHeaderKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "")
}

/** Ambil nilai baris jika header cocok dengan salah satu alias. */
export function cellByAliases(
  row: Record<string, unknown>,
  aliases: readonly string[]
): string {
  const normalizedAliases = aliases.map(normalizeHeaderKey)
  for (const [header, value] of Object.entries(row)) {
    const nk = normalizeHeaderKey(header)
    if (normalizedAliases.includes(nk)) {
      if (value == null || value === "") return ""
      return String(value).trim()
    }
  }
  return ""
}

export function sheetToDataRows(buf: ArrayBuffer): Record<string, unknown>[] {
  const wb = XLSX.read(buf, { type: "array" })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) return []
  const sheet = wb.Sheets[sheetName]
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  })
}

/** Ya/tidak, 1/0, benar/salah — default false */
export function parseBooleanLike(raw: unknown): boolean {
  if (raw == null || raw === "") return false
  const s = String(raw).trim().toLowerCase()
  if (
    s === "ya" ||
    s === "yes" ||
    s === "y" ||
    s === "1" ||
    s === "true" ||
    s === "benar"
  )
    return true
  if (
    s === "tidak" ||
    s === "no" ||
    s === "n" ||
    s === "0" ||
    s === "false" ||
    s === "salah"
  )
    return false
  return parseAktifCell(s)
}

/** Ya/Aktif/1/true vs Nonaktif/0/false — default aktif */
export function parseAktifCell(raw: string): boolean {
  const s = normalizeHeaderKey(raw)
  if (
    s === "nonaktif" ||
    s === "tidakaktif" ||
    s === "false" ||
    s === "0" ||
    s === "no"
  )
    return false
  return true
}

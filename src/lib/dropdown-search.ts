const DEFAULT_THRESHOLD = 5

/** Total baris dropdown (opsi + baris placeholder jika ada) melebihi ambang → pakai mode cari. */
export function dropdownNeedsSearch(
  optionCount: number,
  opts?: {
    dynamic?: boolean
    /** Tambahkan 1 jika ada opsi kosong semacam «Pilih…». */
    placeholderRow?: boolean
    searchThreshold?: number
  }
): boolean {
  const threshold = opts?.searchThreshold ?? DEFAULT_THRESHOLD
  const rows = optionCount + (opts?.placeholderRow ? 1 : 0)
  return Boolean(opts?.dynamic) || rows > threshold
}

export const DROPDOWN_SEARCH_THRESHOLD = DEFAULT_THRESHOLD

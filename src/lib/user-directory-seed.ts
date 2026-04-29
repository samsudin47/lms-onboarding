/** Seed direktori pengguna — dipakai Daftar Pengguna & dropdown mentee/mentor di Class. */

export type UserStatus = "AKTIF" | "TIDAK AKTIF"

export type UserDirectorySeedRow = {
  id: string
  nomorPokok: string
  nama: string
  kodeSTO: string
  namaUnit: string
  jabatan: string
  isLms: boolean
  isOnboarding: boolean
  status: UserStatus
}

export const USER_DIRECTORY_SEED: UserDirectorySeedRow[] = [
  {
    id: "ONB01",
    nomorPokok: "ONB01",
    nama: "Andi Pratama",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Magang Trainee",
    isLms: false,
    isOnboarding: true,
    status: "AKTIF",
  },
  {
    id: "USR01",
    nomorPokok: "USR01",
    nama: "Hendra Putra",
    kodeSTO: "10A01",
    namaUnit: "Unit Keuangan",
    jabatan: "Staff",
    isLms: true,
    isOnboarding: false,
    status: "AKTIF",
  },
  {
    id: "ADM01",
    nomorPokok: "ADM01",
    nama: "Admin Peruri",
    kodeSTO: "00P00",
    namaUnit: "Unit PSP",
    jabatan: "Admin PSP",
    isLms: true,
    isOnboarding: true,
    status: "AKTIF",
  },
  {
    id: "MNT01",
    nomorPokok: "MNT01",
    nama: "Rina Oktavia",
    kodeSTO: "42D10",
    namaUnit: "Unit IT",
    jabatan: "Mentor",
    isLms: false,
    isOnboarding: true,
    status: "AKTIF",
  },
  {
    id: "PNJ01",
    nomorPokok: "PNJ01",
    nama: "Tester Internal",
    kodeSTO: "33X10",
    namaUnit: "Unit SDM",
    jabatan: "Penguji Internal",
    isLms: true,
    isOnboarding: true,
    status: "AKTIF",
  },
]

export function findDirectoryUserByNomorPokok(np: string): UserDirectorySeedRow | undefined {
  const t = np.trim().toLowerCase()
  if (!t) return undefined
  return USER_DIRECTORY_SEED.find((u) => u.nomorPokok.toLowerCase() === t)
}

export function findDirectoryUserByNamaLoose(nama: string): UserDirectorySeedRow | undefined {
  const t = nama.trim().toLowerCase()
  if (!t) return undefined
  return USER_DIRECTORY_SEED.find((u) => u.nama.trim().toLowerCase() === t)
}

/** Cocokkan NP atau nama lengkap (trim, case-insensitive). */
export function resolveDirectoryUser(raw: string): UserDirectorySeedRow | undefined {
  const t = raw.trim()
  if (!t) return undefined
  return (
    findDirectoryUserByNomorPokok(t) ??
    findDirectoryUserByNamaLoose(t)
  )
}

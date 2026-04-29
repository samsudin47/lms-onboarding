import {
  BellRing,
  BookOpen,
  Database,
  History,
  Layers3,
  LayoutDashboard,
  Map,
  MessageSquareText,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

type FeatureStat = {
  label: string
  value: string
}

type FeaturePanel = {
  title: string
  description: string
  items: string[]
}

type FeatureLink = {
  label: string
  to: string
}

export type AppFeature = {
  id: number
  path: string
  title: string
  summary: string
  description: string
  benefit: string
  badge: string
  icon: LucideIcon
  checklist: string[]
  stats: FeatureStat[]
  panels: FeaturePanel[]
  actionLabel: string
  links: FeatureLink[]
}

/** Sidebar dan header: urutan menu utama peserta / admin onboarding */
export const mainNavPaths = [
  "/dashboard",
  "/class",
  "/journey-onboarding",
  "/modul-pembelajaran-interaktif",
  "/evaluasi-feedback",
  "/profile",
] as const

export function getFeatureByPath(path: string): AppFeature | undefined {
  return appFeatures.find((f) => f.path === path)
}

export const appFeatures: AppFeature[] = [
  {
    id: 1,
    path: "/journey-onboarding",
    title: "Management Mentor",
    summary: "Monitoring mentee, coaching, dan progres onboarding.",
    description:
      "Halaman untuk mentor dan co-mentor memantau progres mentee, coaching session, serta tindak lanjut onboarding.",
    benefit:
      "Memudahkan mentor dalam mendampingi peserta dan mempercepat penyelesaian setiap tahapan.",
    badge: "Mentor",
    icon: Map,
    checklist: [
      "Timeline tahapan onboarding dari awal sampai selesai",
      "Status progres setiap tahap secara real-time",
      "Panduan langkah berikutnya untuk peserta baru",
    ],
    stats: [
      { label: "Tahap aktif", value: "3/6" },
      { label: "Progress", value: "68%" },
      { label: "Mentor", value: "2 orang" },
    ],
    panels: [
      {
        title: "Timeline onboarding",
        description: "Urutan proses onboarding dari awal hingga selesai.",
        items: [
          "Verifikasi dokumen dan aktivasi akun",
          "Pengenalan perusahaan dan budaya kerja",
          "Setup tools kerja dan orientasi unit",
        ],
      },
      {
        title: "Langkah berikutnya",
        description: "Aksi prioritas yang perlu segera diselesaikan.",
        items: [
          "Lengkapi dokumen onboarding yang masih pending",
          "Konfirmasi jadwal orientasi bersama HR",
          "Tandai tahap selesai setelah divalidasi mentor",
        ],
      },
    ],
    actionLabel: "Lihat perjalanan",
    links: [
      { label: "Ke dashboard peserta", to: "/dashboard" },
      {
        label: "Buka modul pembelajaran",
        to: "/modul-pembelajaran-interaktif",
      },
    ],
  },
  {
    id: 2,
    path: "/dashboard",
    title: "Dashboard",
    summary: "Ringkasan status onboarding, modul, dan notifikasi.",
    description:
      "Halaman utama berisi ringkasan status onboarding, modul yang harus diikuti, dan notifikasi kegiatan.",
    benefit: "Mempermudah pemantauan progres onboarding oleh peserta.",
    badge: "Overview",
    icon: LayoutDashboard,
    checklist: [
      "Ringkasan progres onboarding",
      "Daftar modul yang perlu diselesaikan",
      "Pusat notifikasi aktivitas terbaru",
    ],
    stats: [
      { label: "Progress rata-rata", value: "72%" },
      { label: "Modul wajib", value: "4 modul" },
      { label: "Notifikasi baru", value: "3" },
    ],
    panels: [
      {
        title: "Status onboarding",
        description: "Ringkasan kondisi peserta baru saat ini.",
        items: [
          "12 peserta sedang dalam tahap orientasi",
          "8 peserta menunggu validasi dokumen",
          "5 peserta telah menyelesaikan onboarding",
        ],
      },
      {
        title: "Notifikasi kegiatan",
        description: "Agenda dan reminder penting hari ini.",
        items: [
          "09:00 - Sesi welcome bersama HR",
          "13:00 - Training tools internal",
          "16:00 - Deadline pengisian profil karyawan",
        ],
      },
    ],
    actionLabel: "Buka dashboard",
    links: [
      { label: "Lihat journey onboarding", to: "/journey-onboarding" },
      { label: "Cek reminder otomatis", to: "/notifikasi-reminder-otomatis" },
    ],
  },
  {
    id: 3,
    path: "/modul-pembelajaran-interaktif",
    title: "Management Class",
    summary: "Kelola materi, assignment, dan setting onboarding.",
    description:
      "Dipakai Admin PSP untuk mengatur materi, deadline, assignment mentor, dan kebutuhan administrasi onboarding.",
    benefit:
      "Membantu koordinasi operasional onboarding tetap rapi dan terkontrol.",
    badge: "Admin",
    icon: BookOpen,
    checklist: [
      "Materi onboarding berbasis video dan kuis",
      "Topik budaya kerja dan pengenalan perusahaan",
      "Pelacakan progres belajar peserta",
    ],
    stats: [
      { label: "Modul aktif", value: "12" },
      { label: "Progress belajar", value: "74%" },
      { label: "Quiz tersedia", value: "5" },
    ],
    panels: [
      {
        title: "Materi utama",
        description: "Konten pembelajaran yang wajib diikuti user baru.",
        items: [
          "Profil dan sejarah perusahaan",
          "Nilai dan budaya kerja",
          "Pelatihan dasar tools internal",
        ],
      },
      {
        title: "Format interaktif",
        description: "Contoh bentuk penyajian materi dalam aplikasi.",
        items: [
          "Video singkat per topik",
          "Quiz evaluasi tiap modul",
          "Checklist progres pembelajaran",
        ],
      },
    ],
    actionLabel: "Mulai modul",
    links: [
      { label: "Buka evaluasi", to: "/evaluasi-feedback" },
      { label: "Kembali ke dashboard", to: "/dashboard" },
    ],
  },
  {
    id: 4,
    path: "/evaluasi-feedback",
    title: "Evaluasi",
    summary: "Input nilai, evaluasi peserta, dan harmonisasi hasil.",
    description:
      "Digunakan Admin PSP dan Penguji Internal untuk mengelola soal, menilai hasil, serta memantau kelulusan onboarding.",
    benefit:
      "Mempercepat proses evaluasi dan menjaga konsistensi penilaian peserta.",
    badge: "Penguji",
    icon: MessageSquareText,
    checklist: [
      "Form evaluasi kegiatan onboarding",
      "Pengumpulan feedback dari peserta",
      "Rekap penilaian untuk admin atau HR",
    ],
    stats: [
      { label: "Survey aktif", value: "2" },
      { label: "Response rate", value: "87%" },
      { label: "Skor rata-rata", value: "4.6/5" },
    ],
    panels: [
      {
        title: "Form penilaian",
        description: "Elemen evaluasi yang ditampilkan ke user.",
        items: [
          "Rating sesi orientasi dan mentor",
          "Pertanyaan terbuka untuk feedback",
          "Checklist kenyamanan proses onboarding",
        ],
      },
      {
        title: "Tindak lanjut",
        description: "Aksi yang bisa diambil setelah feedback dikirim.",
        items: [
          "Identifikasi kendala yang sering muncul",
          "Susun perbaikan proses onboarding berikutnya",
          "Kirim ringkasan hasil evaluasi ke stakeholder",
        ],
      },
    ],
    actionLabel: "Isi evaluasi",
    links: [
      { label: "Lihat histori onboarding", to: "/riwayat-onboarding" },
      { label: "Kembali ke dashboard", to: "/dashboard" },
    ],
  },
  {
    id: 8,
    path: "/evaluasi",
    title: "Evaluasi Detail",
    summary: "Form penilaian materi, instruktur, dan penyelenggara.",
    description:
      "Halaman form evaluasi detail berbasis skala likert untuk menilai kualitas pelatihan onboarding.",
    benefit:
      "Menyediakan feedback terstruktur agar kualitas materi dan pelaksanaan pelatihan dapat ditingkatkan.",
    badge: "Evaluasi",
    icon: MessageSquareText,
    checklist: [
      "Skala likert 1-4 untuk setiap pertanyaan",
      "Penilaian materi, instruktur, dan penyelenggara",
      "Submit evaluasi untuk tindak lanjut kualitas pelatihan",
    ],
    stats: [
      { label: "Level aktif", value: "3" },
      { label: "Pertanyaan", value: "9" },
      { label: "Status", value: "Belum submit" },
    ],
    panels: [
      {
        title: "Panduan pengisian",
        description: "Hal-hal penting sebelum submit evaluasi.",
        items: [
          "Isi data pelatihan secara lengkap",
          "Beri penilaian objektif pada setiap pertanyaan",
          "Pastikan seluruh bagian evaluasi sudah terisi",
        ],
      },
      {
        title: "Tindak lanjut",
        description: "Aksi setelah evaluasi dikirim.",
        items: [
          "Rekap nilai untuk admin pelatihan",
          "Analisis area perbaikan materi",
          "Susun peningkatan kualitas sesi berikutnya",
        ],
      },
    ],
    actionLabel: "Kembali ke evaluasi",
    links: [
      { label: "Ke tabel evaluasi", to: "/evaluasi-feedback" },
      { label: "Kembali ke dashboard", to: "/dashboard" },
    ],
  },
  {
    id: 11,
    path: "/evaluasi-feedback-detail",
    title: "Detail Feedback Evaluasi",
    summary: "Detail jawaban feedback peserta onboarding.",
    description:
      "Halaman admin untuk melihat jawaban feedback user onboarding secara rinci per bagian evaluasi.",
    benefit:
      "Membantu admin meninjau kualitas pelatihan berdasarkan jawaban aktual peserta.",
    badge: "Feedback",
    icon: MessageSquareText,
    checklist: [
      "Informasi peserta, track, dan level evaluasi",
      "Daftar jawaban per bagian evaluasi",
      "Catatan peserta sebagai insight perbaikan",
    ],
    stats: [
      { label: "Feedback dipilih", value: "1" },
      { label: "Section jawaban", value: "2" },
      { label: "Status review", value: "Butuh review" },
    ],
    panels: [
      {
        title: "Fokus review",
        description: "Hal penting saat meninjau feedback.",
        items: [
          "Cek skor pada tiap pertanyaan kunci",
          "Identifikasi pola keluhan atau kebutuhan",
          "Catat tindak lanjut untuk batch berikutnya",
        ],
      },
      {
        title: "Aksi lanjutan",
        description: "Tindak lanjut setelah review.",
        items: [
          "Sinkronkan hasil dengan tim pelatihan",
          "Perbarui materi atau metode pengajaran",
          "Komunikasikan perbaikan ke stakeholder",
        ],
      },
    ],
    actionLabel: "Kembali ke daftar feedback",
    links: [
      { label: "Buka evaluasi feedback", to: "/evaluasi-feedback" },
      { label: "Kembali ke dashboard", to: "/dashboard" },
    ],
  },
  {
    id: 12,
    path: "/evaluasi-input-penilaian",
    title: "Input Penilaian",
    summary: "Form input nilai peserta yang menyelesaikan tugas.",
    description:
      "Halaman penguji untuk menginput nilai pre-test, post-test, dan tugas peserta onboarding yang telah menyelesaikan alur tugas.",
    benefit:
      "Memastikan proses scoring peserta dilakukan terstruktur dan terdokumentasi.",
    badge: "Penilaian",
    icon: MessageSquareText,
    checklist: [
      "Input nilai pre-test, post-test, dan tugas",
      "Hitung nilai akhir berbobot",
      "Simpan catatan penilaian peserta",
    ],
    stats: [
      { label: "Peserta eligible", value: "1" },
      { label: "Komponen nilai", value: "3" },
      { label: "Status", value: "Siap input" },
    ],
    panels: [
      {
        title: "Validasi sebelum simpan",
        description: "Checklist singkat untuk penguji.",
        items: [
          "Pastikan peserta sudah menyelesaikan tugas",
          "Isi nilai di rentang 0-100",
          "Tambahkan catatan penilaian bila diperlukan",
        ],
      },
      {
        title: "Aksi lanjutan",
        description: "Setelah nilai tersimpan.",
        items: [
          "Review nilai akhir peserta",
          "Sinkronkan ke laporan evaluasi",
          "Lanjutkan finalisasi kelulusan",
        ],
      },
    ],
    actionLabel: "Kembali ke peserta",
    links: [
      {
        label: "Ke nama peserta",
        to: "/evaluasi-feedback?section=participants",
      },
      { label: "Kembali ke dashboard", to: "/dashboard" },
    ],
  },
  {
    id: 5,
    path: "/notifikasi-reminder-otomatis",
    title: "Notifikasi & Reminder Otomatis",
    summary: "Pengingat jadwal dan tugas onboarding.",
    description:
      "Mengirimkan pengingat otomatis terkait jadwal atau kegiatan onboarding yang belum diselesaikan.",
    benefit: "Membantu peserta menyelesaikan onboarding tepat waktu.",
    badge: "Reminder",
    icon: BellRing,
    checklist: [
      "Reminder tugas yang belum selesai",
      "Notifikasi agenda penting onboarding",
      "Alert otomatis untuk tenggat waktu kegiatan",
    ],
    stats: [
      { label: "Reminder hari ini", value: "16" },
      { label: "Agenda kritis", value: "4" },
      { label: "Delivery rate", value: "98%" },
    ],
    panels: [
      {
        title: "Trigger reminder",
        description: "Kondisi yang memicu reminder otomatis.",
        items: [
          "Tugas onboarding melewati tenggat",
          "Jadwal orientasi dimulai dalam 1 jam",
          "Dokumen wajib belum diunggah lengkap",
        ],
      },
      {
        title: "Channel notifikasi",
        description: "Contoh saluran pengiriman notifikasi.",
        items: [
          "Notifikasi in-app di dashboard",
          "Email reminder ke user baru",
          "Rekap reminder ke admin atau HR",
        ],
      },
    ],
    actionLabel: "Lihat reminder",
    links: [
      { label: "Buka dashboard", to: "/dashboard" },
      { label: "Lihat jadwal class", to: "/class" },
    ],
  },
  {
    id: 6,
    path: "/riwayat-onboarding",
    title: "Riwayat Onboarding",
    summary: "Penyimpanan seluruh aktivitas onboarding peserta.",
    description: "Menyimpan seluruh aktivitas onboarding peserta dalam sistem.",
    benefit: "Mempermudah pelacakan dan dokumentasi kegiatan onboarding.",
    badge: "History",
    icon: History,
    checklist: [
      "Riwayat aktivitas pengguna",
      "Audit trail progres onboarding",
      "Pencarian histori berdasarkan peserta atau tanggal",
    ],
    stats: [
      { label: "Aktivitas tersimpan", value: "348" },
      { label: "Audit trail", value: "100%" },
      { label: "Last sync", value: "Realtime" },
    ],
    panels: [
      {
        title: "Riwayat terbaru",
        description: "Contoh aktivitas yang tersimpan di sistem.",
        items: [
          "Upload dokumen identitas selesai",
          "Sesi orientasi HR telah dihadiri",
          "Modul budaya kerja selesai 80%",
        ],
      },
      {
        title: "Filter histori",
        description: "Fitur pencarian yang bisa ditambahkan.",
        items: [
          "Cari berdasarkan nama peserta",
          "Filter tanggal dan unit kerja",
          "Lihat detail aktivitas per tahapan onboarding",
        ],
      },
    ],
    actionLabel: "Lihat histori",
    links: [
      { label: "Kembali ke dashboard", to: "/dashboard" },
      { label: "Lihat kategori onboarding", to: "/kategori-onboarding" },
    ],
  },
  {
    id: 7,
    path: "/integrasi-data-rekrutment",
    title: "Integrasi Data Rekrutment",
    summary: "Sinkronisasi data karyawan hasil rekrutment.",
    description: "Integrasi dengan data karyawan hasil rekrutment.",
    benefit: "Membantu sinkronisasi data karyawan yang masuk secara otomatis.",
    badge: "Integration",
    icon: Database,
    checklist: [
      "Tarik data kandidat dari sistem rekrutment",
      "Sinkronisasi profil user baru ke onboarding",
      "Kurangi input manual oleh admin atau HR",
    ],
    stats: [
      { label: "Data sinkron", value: "126" },
      { label: "Menunggu review", value: "7" },
      { label: "Sumber data", value: "2 sistem" },
    ],
    panels: [
      {
        title: "Alur integrasi",
        description: "Proses sinkronisasi data ke sistem onboarding.",
        items: [
          "Ambil data kandidat lolos seleksi",
          "Buat profil onboarding secara otomatis",
          "Pasangkan peserta ke batch class yang sesuai",
        ],
      },
      {
        title: "Manfaat operasional",
        description: "Efek langsung dari integrasi data rekrutment.",
        items: [
          "Mempercepat pembuatan akun peserta baru",
          "Mengurangi kesalahan input manual",
          "Memastikan data awal peserta lebih konsisten",
        ],
      },
    ],
    actionLabel: "Sinkronkan data",
    links: [
      { label: "Atur course onboarding", to: "/class" },
      { label: "Buka dashboard", to: "/dashboard" },
    ],
  },
  {
    id: 8,
    path: "/class",
    title: "My Courses",
    summary: "Journey course onboarding PKWT, Pro Hire, dan MT/Organik.",
    description:
      "Menampilkan course onboarding per track agar peserta, mentor, dan admin bisa mengikuti alur batch yang sesuai.",
    benefit:
      "Memudahkan penjadwalan, pemantauan peserta, dan pengelolaan aktivitas onboarding per track.",
    badge: "Course",
    icon: Users,
    checklist: [
      "Kelompokkan peserta berdasarkan periode atau batch",
      "Atur jadwal onboarding per course",
      "Pantau jumlah peserta dan progres tiap batch",
    ],
    stats: [
      { label: "Course onboarding", value: "4 track" },
      { label: "Peserta per batch", value: "18-25" },
      { label: "Jadwal minggu ini", value: "6 sesi" },
    ],
    panels: [
      {
        title: "Pengelolaan batch",
        description: "Contoh penyusunan course onboarding.",
        items: [
          "Batch April A - orientasi karyawan baru",
          "Batch April B - onboarding teknis unit kerja",
          "Batch khusus trainee untuk program magang",
        ],
      },
      {
        title: "Pemantauan proses",
        description: "Hal yang bisa dilihat per class.",
        items: [
          "Jumlah peserta hadir",
          "Status modul yang sudah dibuka",
          "Progress penyelesaian onboarding per batch",
        ],
      },
    ],
    actionLabel: "Atur class",
    links: [
      { label: "Lihat kategori onboarding", to: "/kategori-onboarding" },
      { label: "Buka dashboard", to: "/dashboard" },
    ],
  },
  {
    id: 9,
    path: "/kategori-onboarding",
    title: "Kategori Onboarding",
    summary: "Pengelompokan peserta berdasarkan status kepegawaian.",
    description:
      "Merupakan pengelompokan peserta onboarding berdasarkan status atau skema kepegawaiannya, seperti PKWT, Magang-Trainee, Prohire, Alih Daya, dan lainnya.",
    benefit:
      "Materi, proses, serta evaluasi dapat disesuaikan dengan kebutuhan masing-masing kategori peserta.",
    badge: "Category",
    icon: Layers3,
    checklist: [
      "Kelompokkan peserta sesuai status kepegawaian",
      "Sesuaikan materi onboarding tiap kategori",
      "Buat evaluasi yang relevan untuk masing-masing kelompok",
    ],
    stats: [
      { label: "Kategori aktif", value: "5" },
      { label: "Template materi", value: "9" },
      { label: "Skema evaluasi", value: "4" },
    ],
    panels: [
      {
        title: "Contoh kategori",
        description: "Kelompok peserta yang dapat ditangani oleh sistem.",
        items: [
          "PKWT",
          "Magang-Trainee",
          "Prohire",
          "Alih Daya",
          "Magang untuk PKWT",
        ],
      },
      {
        title: "Penyesuaian proses",
        description: "Manfaat penggunaan kategori onboarding.",
        items: [
          "Materi onboarding disesuaikan dengan kebutuhan per kategori",
          "Jadwal dan class dapat diatur lebih tepat",
          "Evaluasi mengikuti skema onboarding masing-masing kelompok",
        ],
      },
    ],
    actionLabel: "Kelola kategori",
    links: [
      { label: "Buka journey onboarding", to: "/journey-onboarding" },
      { label: "Atur course onboarding", to: "/class" },
    ],
  },
  {
    id: 10,
    path: "/profile",
    title: "Profile",
    summary: "Informasi akun dan data pengguna onboarding.",
    description:
      "Halaman profil menampilkan identitas user, role aktif, track onboarding, serta ringkasan akses yang dimiliki.",
    benefit:
      "Memudahkan pengguna mengecek data akun dan memahami hak aksesnya di sistem.",
    badge: "Akun",
    icon: UserRound,
    checklist: [
      "Lihat nama, role, dan email akun",
      "Cek track onboarding yang sedang aktif",
      "Pahami hak akses sesuai peran login",
    ],
    stats: [
      { label: "Status akun", value: "Aktif" },
      { label: "Sinkronisasi", value: "Realtime" },
      { label: "Keamanan", value: "Terverifikasi" },
    ],
    panels: [
      {
        title: "Informasi akun",
        description: "Data identitas yang ditampilkan di profil user.",
        items: [
          "Nama dan role aktif",
          "Email onboarding",
          "Track atau kategori onboarding",
        ],
      },
      {
        title: "Manfaat profil",
        description: "Alasan halaman profil penting untuk user.",
        items: [
          "Memastikan data akun sesuai",
          "Memudahkan pengecekan hak akses",
          "Menjadi pusat ringkasan identitas pengguna",
        ],
      },
    ],
    actionLabel: "Kembali ke dashboard",
    links: [
      { label: "Buka dashboard", to: "/dashboard" },
      { label: "Lihat class", to: "/class" },
    ],
  },
  {
    id: 14,
    path: "/daftar-pengguna",
    title: "Daftar Pengguna",
    summary:
      "Kelola pengguna dengan akses LMS dan onboarding (boleh keduanya). Impor Excel.",
    description:
      "Admin PSP dapat menambah, mengubah, menghapus, dan mengimpor pengguna. Akses ditentukan flag is_lms dan is_onboarding; tidak lagi memakai kolom tipe role.",
    benefit: "Memudahkan pengelolaan pengguna dalam satu halaman terintegrasi.",
    badge: "Pengguna",
    icon: Users,
    checklist: [
      "Kelola peserta onboarding",
      "Kelola mentor dan co-mentor",
      "Kelola penguji dan admin",
    ],
    stats: [{ label: "Total pengguna", value: "20+" }],
    panels: [],
    actionLabel: "Kelola pengguna",
    links: [{ label: "Buka dashboard", to: "/dashboard" }],
  },
  {
    id: 13,
    path: "/penguji",
    title: "Data Penguji",
    summary: "Kelola daftar penguji eksternal dan internal onboarding.",
    description:
      "Admin PSP dapat menambah, mengubah, dan menghapus data penguji eksternal maupun internal dari halaman ini.",
    benefit:
      "Memastikan data penguji selalu akurat dan siap digunakan dalam proses evaluasi onboarding.",
    badge: "Penguji",
    icon: Users,
    checklist: [
      "Kelola penguji eksternal (vendor)",
      "Kelola penguji internal (Peruri)",
      "Tambah, edit, dan hapus data penguji",
    ],
    stats: [
      { label: "Penguji eksternal", value: "2" },
      { label: "Penguji internal", value: "2" },
    ],
    panels: [],
    actionLabel: "Kelola penguji",
    links: [{ label: "Buka dashboard", to: "/dashboard" }],
  },
  {
    id: 15,
    path: "/classes",
    title: "Courses",
    summary: "Kelola daftar course onboarding berdasarkan kategori dan batch.",
    description:
      "Admin PSP dapat menambah, mengubah, dan menghapus course dari berbagai kategori: PKWT, Prohire, dan Magang Trainee.",
    benefit: "Memudahkan pengelolaan course dalam satu halaman terintegrasi.",
    badge: "Course",
    icon: Users,
    checklist: [
      "Kelola course PKWT",
      "Kelola course Prohire",
      "Kelola course Magang Trainee",
    ],
    stats: [{ label: "Total course", value: "8+" }],
    panels: [],
    actionLabel: "Kelola course",
    links: [{ label: "Buka dashboard", to: "/dashboard" }],
  },
  {
    id: 16,
    path: "/leaderboard",
    title: "Leaderboard",
    summary: "Peringkat peserta onboarding berdasarkan progres dan pencapaian.",
    description:
      "Admin PSP dapat melihat peringkat peserta onboarding dan pengguna secara keseluruhan.",
    benefit: "Memotivasi peserta dengan transparansi peringkat pencapaian.",
    badge: "Peringkat",
    icon: Users,
    checklist: ["Lihat peringkat onboarding", "Lihat peringkat user"],
    stats: [{ label: "Total peserta", value: "10+" }],
    panels: [],
    actionLabel: "Lihat leaderboard",
    links: [{ label: "Buka dashboard", to: "/dashboard" }],
  },
]

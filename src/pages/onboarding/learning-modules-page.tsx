import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  BookCopy,
  FileText,
  Link as LinkIcon,
  PencilLine,
  PlayCircle,
  Trash2,
  Upload,
} from "lucide-react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFeatureByPath } from "@/lib/app-features"
import { getRolePermissions, getStoredDemoUser } from "@/lib/demo-access"

const feature = getFeatureByPath("/modul-pembelajaran-interaktif")!

type ContentType =
  | "Deskripsi"
  | "Pilihan Ganda"
  | "Essay"
  | "PDF"
  | "Video"
  | "Tugas"

type ModuleItem = {
  id: string
  title: string
  type: ContentType
  description: string
  link: string
  deadline: string
}

const contentTypes: ContentType[] = [
  "Deskripsi",
  "Pilihan Ganda",
  "Essay",
  "PDF",
  "Video",
  "Tugas",
]

const sectionLabels: Record<string, string> = {
  "class-setting": "Setting class / batch",
  "review-task": "Review tugas mentee",
  harmonisasi: "Harmonisasi hasil belajar",
  "setting-penilaian": "Setting penilaian mentee",
}

const mentorReviewQueue = [
  {
    id: "review-ayu",
    user: "Ayu Pratama",
    task: "Ringkasan budaya kerja",
    status: "Siap direview",
    note: "Coaching sesi 2 selesai dan tinggal validasi mentor.",
  },
  {
    id: "review-raka",
    user: "Raka Saputra",
    task: "Resume orientation class",
    status: "Perlu revisi",
    note: "Tambahkan contoh implementasi budaya kerja pada unit.",
  },
  {
    id: "review-dina",
    user: "Dina Maharani",
    task: "Project awal onboarding",
    status: "Monitoring",
    note: "Menunggu konfirmasi akhir sebelum masuk evaluasi.",
  },
]

const initialItems: ModuleItem[] = [
  {
    id: "mod-1",
    title: "Deskripsi class & objective onboarding",
    type: "Deskripsi",
    description:
      "Ringkasan tujuan class, kompetensi yang dicapai, dan alur penyelesaian.",
    link: "",
    deadline: "12 Apr 2026",
  },
  {
    id: "mod-2",
    title: "Video budaya kerja Peruri",
    type: "Video",
    description: "Video pengenalan budaya kerja dan nilai AKHLAK.",
    link: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    deadline: "14 Apr 2026",
  },
  {
    id: "mod-3",
    title: "Panduan onboarding PDF",
    type: "PDF",
    description: "Dokumen panduan onboarding perusahaan dan tata tertib kelas.",
    link: "https://developer.mozilla.org/en-US/docs/Learn",
    deadline: "14 Apr 2026",
  },
  {
    id: "mod-4",
    title: "Pre-Test pemahaman awal",
    type: "Pilihan Ganda",
    description: "Kuis pilihan ganda sebelum memulai materi inti.",
    link: "",
    deadline: "15 Apr 2026",
  },
  {
    id: "mod-5",
    title: "Refleksi onboarding",
    type: "Essay",
    description:
      "Tulis refleksi singkat tentang pemahaman Anda terhadap proses onboarding.",
    link: "",
    deadline: "16 Apr 2026",
  },
  {
    id: "mod-6",
    title: "Tugas ringkasan materi",
    type: "Tugas",
    description: "Unggah ringkasan materi atau jawaban tugas ke sistem LMS.",
    link: "",
    deadline: "18 Apr 2026",
  },
]

export default function LearningModulesPage() {
  const [searchParams] = useSearchParams()
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const [items, setItems] = useState<ModuleItem[]>(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<ContentType>("Deskripsi")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [deadline, setDeadline] = useState("")
  const [taskSubmission, setTaskSubmission] = useState("")
  const [taskSubmitted, setTaskSubmitted] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const selectedSection = searchParams.get("section") ?? ""
  const focusLabel = sectionLabels[selectedSection]

  function resetForm() {
    setEditingId(null)
    setTitle("")
    setType("Deskripsi")
    setDescription("")
    setLink("")
    setDeadline("")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !description.trim()) return

    const nextItem: ModuleItem = {
      id: editingId ?? `item-${crypto.randomUUID().slice(0, 8)}`,
      title: title.trim(),
      type,
      description: description.trim(),
      link: link.trim(),
      deadline: deadline || "Belum ditentukan",
    }

    setItems((prev) => {
      if (editingId) {
        return prev.map((item) => (item.id === editingId ? nextItem : item))
      }
      return [...prev, nextItem]
    })

    resetForm()
  }

  function startEdit(item: ModuleItem) {
    setEditingId(item.id)
    setTitle(item.title)
    setType(item.type)
    setDescription(item.description)
    setLink(item.link)
    setDeadline(item.deadline)
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (editingId === id) resetForm()
  }

  function toggleComplete(id: string) {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  const totalMaterials = items.filter(
    (item) => item.type === "PDF" || item.type === "Video"
  ).length
  const totalAssessments = items.filter(
    (item) => item.type === "Pilihan Ganda" || item.type === "Essay"
  ).length

  return (
    <FeaturePageLayout feature={feature}>
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">
              Materi & konten pembelajaran
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tampilan halaman ini otomatis menyesuaikan hak akses login untuk
              Admin PSP, Mentor / Co-mentor, Penguji Internal, atau peserta
              onboarding.
            </p>
            {focusLabel ? (
              <p className="mt-2 text-xs font-medium text-primary">
                Fokus menu: {focusLabel}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 text-left sm:text-right">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Akses aktif: {permissions.label}
            </span>
            <p className="max-w-xs text-xs text-muted-foreground">
              {permissions.description}
            </p>
          </div>
        </div>
      </section>

      {permissions.canManageModules ? (
        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <BookCopy className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">
                {editingId ? "Edit konten kelas" : "Tambah konten kelas"}
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Admin PSP dapat mengelola deskripsi, soal, PDF, video, tugas,
              serta menyiapkan materi untuk review mentor dan penilaian akhir.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium" htmlFor="content-title">
                  Judul konten
                </label>
                <Input
                  id="content-title"
                  className="mt-2"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Video budaya kerja"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="content-type">
                  Tipe konten
                </label>
                <select
                  id="content-type"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as ContentType)
                  }
                  className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
                >
                  {contentTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  htmlFor="content-description"
                >
                  Deskripsi / instruksi
                </label>
                <textarea
                  id="content-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Contoh: tulis instruksi pengerjaan atau gambaran materi"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" htmlFor="content-link">
                    Link PDF / video / materi
                  </label>
                  <Input
                    id="content-link"
                    className="mt-2"
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-medium"
                    htmlFor="content-deadline"
                  >
                    Deadline
                  </label>
                  <Input
                    id="content-deadline"
                    className="mt-2"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    placeholder="Contoh: 18 Apr 2026"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="submit">
                {editingId ? "Update konten" : "Simpan konten"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal edit
                </Button>
              ) : null}
            </div>
          </form>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm text-muted-foreground">Materi aktif</p>
                <p className="mt-2 text-2xl font-semibold">{totalMaterials}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  Soal & assessment
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {totalAssessments}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.type}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2.5 py-1">
                      Deadline: {item.deadline}
                    </span>
                    {item.link ? (
                      <span className="rounded-full bg-muted px-2.5 py-1">
                        Ada link materi
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(item)}
                    >
                      <PencilLine className="size-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : permissions.canReviewTasks ? (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Review tugas mentee</h2>
            </div>
            <div className="mt-4 space-y-3">
              {mentorReviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.task}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.note}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/journey-onboarding?section=coaching">
                        Lihat coaching
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/evaluasi-feedback">Buka hasil evaluasi</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Ringkasan materi aktif</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Materi referensi: {totalMaterials} item</li>
                <li>• Soal / assessment: {totalAssessments} item</li>
                <li>• Fokus mentor: coaching, review project, dan progres</li>
              </ul>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Aksi cepat mentor</h2>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/journey-onboarding?section=progress">
                    Pantau progress mentee
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/evaluasi-feedback?section=score-input">
                    Cek kesiapan penilaian
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : permissions.canManageExaminer ? (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Materi acuan penguji</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Fokus penguji</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Melihat nama peserta yang siap diuji</li>
                <li>• Membandingkan hasil tugas dengan materi acuan</li>
                <li>• Lanjut ke input nilai pada management penguji</li>
              </ul>
            </div>

            <Button asChild className="w-full">
              <Link to="/evaluasi-feedback?section=score-input">
                Lanjut input nilai
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Akses konten pembelajaran</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.type}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.link ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={item.link} target="_blank" rel="noreferrer">
                          {item.type === "Video" ? (
                            <PlayCircle className="size-4" />
                          ) : (
                            <LinkIcon className="size-4" />
                          )}
                          Buka materi
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => toggleComplete(item.id)}
                    >
                      {completedIds.includes(item.id)
                        ? "Sudah selesai"
                        : "Tandai selesai"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Pengumpulan tugas</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload materi tugas, jawaban, atau catatan pembelajaran dari
                user onboarding.
              </p>
              <textarea
                value={taskSubmission}
                onChange={(event) => setTaskSubmission(event.target.value)}
                className="mt-4 min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Contoh: tautan file tugas, ringkasan materi, atau jawaban essay..."
              />
              <Button
                type="button"
                className="mt-4 w-full"
                disabled={!taskSubmission.trim()}
                onClick={() => setTaskSubmitted(true)}
              >
                Kumpulkan tugas
              </Button>
              {taskSubmitted ? (
                <p className="mt-2 text-sm text-primary">
                  Tugas berhasil dikirim (demo).
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Progress belajar</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  • Materi selesai: {completedIds.length}/{items.length}
                </li>
                <li>• Tugas terkirim: {taskSubmitted ? "Ya" : "Belum"}</li>
                <li>• Langkah berikutnya: lanjut ke evaluasi dan test</li>
              </ul>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/evaluasi-feedback">
                  Lanjut ke Pre-Test / Post-Test
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </FeaturePageLayout>
  )
}

import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { PencilLine, Trash2, Users, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getStoredDemoUser } from "@/lib/demo-access"
import { cn } from "@/lib/utils"

type PengujiType = "Eksternal" | "Internal"

type PengujiRecord = {
  id: string
  name: string
  email: string
  type: PengujiType
  institution: string
}

const initialPengujiRecords: PengujiRecord[] = [
  {
    id: "pnj-1",
    name: "Andri Kusuma",
    email: "andri.kusuma@vendor.co.id",
    type: "Eksternal",
    institution: "PT Vendor Asesmen",
  },
  {
    id: "pnj-2",
    name: "Dewi Lestari",
    email: "dewi.lestari@vendor.co.id",
    type: "Eksternal",
    institution: "PT Vendor Asesmen",
  },
  {
    id: "pnj-3",
    name: "Hari Santoso",
    email: "hari.santoso@peruri.co.id",
    type: "Internal",
    institution: "Peruri",
  },
  {
    id: "pnj-4",
    name: "Nita Rahma",
    email: "nita.rahma@peruri.co.id",
    type: "Internal",
    institution: "Peruri",
  },
]

export default function PengujiPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = getStoredDemoUser()

  const activeSectionParam = searchParams.get("section") ?? "eksternal"
  const activePengujiType: PengujiType =
    activeSectionParam === "internal" ? "Internal" : "Eksternal"

  const [records, setRecords] = useState<PengujiRecord[]>(initialPengujiRecords)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formInstitution, setFormInstitution] = useState("")

  const ekternalCount = records.filter((r) => r.type === "Eksternal").length
  const internalCount = records.filter((r) => r.type === "Internal").length

  const filteredRecords = records.filter((r) => r.type === activePengujiType)

  function openForm() {
    setEditingId(null)
    setShowForm(true)
    setFormName("")
    setFormEmail("")
    setFormInstitution("")
  }

  function resetForm() {
    setEditingId(null)
    setShowForm(false)
    setFormName("")
    setFormEmail("")
    setFormInstitution("")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!formName.trim() || !formEmail.trim()) return

    const nextRecord: PengujiRecord = {
      id: editingId ?? `pnj-${crypto.randomUUID().slice(0, 8)}`,
      name: formName.trim(),
      email: formEmail.trim(),
      type: activePengujiType,
      institution:
        formInstitution.trim() ||
        (activePengujiType === "Internal" ? "Peruri" : "-"),
    }

    setRecords((prev) => {
      if (editingId) {
        return prev.map((r) => (r.id === editingId ? nextRecord : r))
      }
      return [...prev, nextRecord]
    })

    resetForm()
  }

  function startEdit(record: PengujiRecord) {
    setEditingId(record.id)
    setShowForm(true)
    setFormName(record.name)
    setFormEmail(record.email)
    setFormInstitution(record.institution)
  }

  function deleteRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id))
    if (editingId === id) resetForm()
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
              Management Penguji
            </p>
            <h2 className="mt-1 text-base font-semibold">
              Kelola Nama Penguji
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentUser.role} dapat menambah, mengubah, dan menghapus data
              penguji eksternal maupun internal dari halaman ini.
            </p>
          </div>
        </div>

        <div className="mt-4 flex w-fit gap-1 rounded-xl border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() =>
              setSearchParams({ section: "eksternal" }, { replace: true })
            }
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
              activePengujiType === "Eksternal"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Penguji Eksternal
          </button>
          <button
            type="button"
            onClick={() =>
              setSearchParams({ section: "internal" }, { replace: true })
            }
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
              activePengujiType === "Internal"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Penguji Internal
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">
                List Penguji {activePengujiType}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Kelola data penguji {activePengujiType.toLowerCase()} di halaman
                ini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {filteredRecords.length} data
              </span>
              <Button type="button" size="sm" onClick={openForm}>
                Tambah Penguji {activePengujiType}
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Instansi</th>
                  <th className="px-4 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t align-top">
                      <td className="px-4 py-3 font-medium">{record.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {record.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {record.institution}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(record)}
                          >
                            <PencilLine className="size-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRecord(record.id)}
                          >
                            <Trash2 className="size-4" />
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Belum ada data penguji {activePengujiType.toLowerCase()}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-xl rounded-2xl border bg-background shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    <h2 className="text-lg font-semibold">
                      {editingId
                        ? `Edit Penguji ${activePengujiType}`
                        : `Tambah Penguji ${activePengujiType}`}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Lengkapi data penguji {activePengujiType.toLowerCase()} yang
                    akan dikelola.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={resetForm}
                  className="shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="penguji-name"
                    >
                      Nama Penguji
                    </label>
                    <Input
                      id="penguji-name"
                      className="mt-2"
                      placeholder="Nama penguji"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="penguji-email"
                    >
                      Email
                    </label>
                    <Input
                      id="penguji-email"
                      type="email"
                      className="mt-2"
                      placeholder="email@domain.co.id"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="text-sm font-medium"
                    htmlFor="penguji-institution"
                  >
                    Instansi / Perusahaan
                  </label>
                  <Input
                    id="penguji-institution"
                    className="mt-2"
                    placeholder={
                      activePengujiType === "Internal"
                        ? "Peruri"
                        : "PT Vendor Asesmen"
                    }
                    value={formInstitution}
                    onChange={(e) => setFormInstitution(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingId ? "Update data" : "Simpan data"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

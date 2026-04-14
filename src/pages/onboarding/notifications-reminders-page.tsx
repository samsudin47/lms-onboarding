import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Clock3, Mail } from "lucide-react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFeatureByPath } from "@/lib/app-features"

const feature = getFeatureByPath("/notifikasi-reminder-otomatis")!

const baseReminders = [
  {
    time: "08:30",
    label: "Reminder upload dokumen wajib (NPWP & rekening)",
    offset: 0,
  },
  { time: "10:00", label: "Kelas orientasi batch April dimulai", offset: 0 },
  {
    time: "15:00",
    label: "Batas akhir pengisian evaluasi onboarding",
    offset: 0,
  },
] as const

export default function NotificationsRemindersPage() {
  const [daysBefore, setDaysBefore] = useState("1")
  const [inApp, setInApp] = useState(true)
  const [emailOn, setEmailOn] = useState(true)
  const [adminDigest, setAdminDigest] = useState(false)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const offset = Number.parseInt(daysBefore, 10)
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0

  const reminders = useMemo(
    () =>
      baseReminders.map((r, i) => ({
        ...r,
        offset: safeOffset,
        boosted: criticalOnly && i === 2,
      })),
    [criticalOnly, safeOffset]
  )

  function saveRules() {
    const channels = [
      inApp && "in-app",
      emailOn && "email",
      adminDigest && "admin-digest",
    ].filter(Boolean)
    setLastSaved(
      `Disimpan: H-${safeOffset} hari, saluran ${channels.join(", ")}`
    )
  }

  return (
    <FeaturePageLayout feature={feature}>
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Aturan reminder otomatis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Parameter di bawah mensimulasikan logika pengingat untuk jadwal dan
            tugas yang belum selesai.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="days-before" className="text-sm font-medium">
                Kirim pengingat H- (hari sebelum jadwal)
              </label>
              <Input
                id="days-before"
                type="number"
                min={0}
                max={14}
                className="mt-2"
                value={daysBefore}
                onChange={(e) => setDaysBefore(e.target.value)}
              />
            </div>
            <div className="rounded-lg border bg-background p-4 text-sm">
              <p className="font-medium">Trigger contoh</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Tugas lewat tenggat</li>
                <li>• Orientasi dalam 1 jam</li>
                <li>• Dokumen wajib belum lengkap</li>
              </ul>
            </div>
          </div>

          <fieldset className="mt-6 space-y-3">
            <legend className="text-sm font-medium">Saluran notifikasi</legend>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inApp}
                onChange={(e) => setInApp(e.target.checked)}
              />
              In-app (bell pusat notifikasi)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={emailOn}
                onChange={(e) => setEmailOn(e.target.checked)}
              />
              Email reminder
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={adminDigest}
                onChange={(e) => setAdminDigest(e.target.checked)}
              />
              Rekap harian ke admin / HR
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={criticalOnly}
                onChange={(e) => setCriticalOnly(e.target.checked)}
              />
              Prioritaskan agenda kritis (demo: tegas pada deadline evaluasi)
            </label>
          </fieldset>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={saveRules}>
              Simpan preferensi
            </Button>
            {lastSaved ? (
              <span className="text-xs text-muted-foreground">{lastSaved}</span>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Pratinjau jadwal terkirim</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar di bawah memperhitungkan offset H-{safeOffset} untuk demo UI.
          </p>
          <div className="mt-4 space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.label}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  reminder.boosted ? "border-destructive/50 bg-destructive/5" : "bg-background"
                }`}
              >
                {reminder.time.startsWith("08") ? (
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {reminder.time} · H-{safeOffset} otomatis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reminder.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                    {inApp ? (
                      <span className="rounded bg-muted px-1.5 py-0.5">In-app</span>
                    ) : null}
                    {emailOn ? (
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        <Mail className="mr-0.5 inline size-3" />
                        Email
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link to="/dashboard">Buka pusat notifikasi di dashboard</Link>
          </Button>
        </div>
      </section>
    </FeaturePageLayout>
  )
}

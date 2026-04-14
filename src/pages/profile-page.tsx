import { ShieldCheck, UserRound } from "lucide-react"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { getFeatureByPath } from "@/lib/app-features"
import {
  getDemoUserTrack,
  getRolePermissions,
  getStoredDemoUser,
} from "@/lib/demo-access"

const feature = getFeatureByPath("/profile")!

export default function ProfilePage() {
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const activeTrack = getDemoUserTrack(currentUser)
  const accessItems = [
    permissions.canManageClass && "Kelola class",
    permissions.canManageMentor && "Management mentor",
    permissions.canManageModules && "Materi pembelajaran",
    permissions.canManageExaminer && "Evaluasi & penilaian",
    permissions.canReviewTasks && "Review tugas",
    permissions.canFinalizeOutcome && "Finalisasi hasil",
  ].filter((item): item is string => Boolean(item))

  return (
    <FeaturePageLayout
      feature={feature}
      showHero={false}
      showStats={false}
      showSupportPanels={false}
    >
      <section className="mx-auto grid max-w-4xl gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <UserRound className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Informasi pengguna</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ringkasan akun yang sedang dipakai untuk mengakses LMS
                onboarding.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border bg-muted/20">
            <div className="grid gap-0 divide-y text-sm">
              <div className="grid grid-cols-[160px_1fr] gap-3 px-4 py-3">
                <p className="text-muted-foreground">Nama</p>
                <p className="font-semibold">{currentUser.name}</p>
              </div>
              <div className="grid grid-cols-[160px_1fr] gap-3 px-4 py-3">
                <p className="text-muted-foreground">Role</p>
                <p className="font-semibold">{currentUser.role}</p>
              </div>
              <div className="grid grid-cols-[160px_1fr] gap-3 px-4 py-3">
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold">
                  {currentUser.email ?? "email belum tersedia"}
                </p>
              </div>
              <div className="grid grid-cols-[160px_1fr] gap-3 px-4 py-3">
                <p className="text-muted-foreground">Track onboarding</p>
                <p className="font-semibold">
                  {activeTrack ? activeTrack.toUpperCase() : "Belum ditentukan"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Hak akses aktif</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ringkasan kemampuan berdasarkan role saat ini.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {accessItems.map((item) => (
              <span
                key={item}
                className="rounded-full border bg-background px-3 py-1.5 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </FeaturePageLayout>
  )
}

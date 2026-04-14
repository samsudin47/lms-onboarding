import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { getFeatureByPath } from "@/lib/app-features"
import {
  getDemoUserTrack,
  getRolePermissions,
  getStoredDemoUser,
} from "@/lib/demo-access"
import {
  evaluationLevelRows,
  feedbackSubmissions,
  participantFlowRows,
} from "@/lib/evaluation-feedback"

const feature = getFeatureByPath("/evaluasi-feedback")!

export default function EvaluationFeedbackPage() {
  const [searchParams] = useSearchParams()
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const currentTrack = getDemoUserTrack(currentUser)
  const selectedSection = searchParams.get("section") ?? ""

  const participantLabel = useMemo(() => {
    if (currentTrack === "pkwt") return "PKWT"
    if (currentTrack === "mt-organik") return "MT"
    if (currentTrack === "pro-hire") return "Prohire"
    return "PKWT"
  }, [currentTrack])

  const reviewStats = useMemo(() => {
    const total = feedbackSubmissions.length
    const pending = feedbackSubmissions.filter(
      (submission) => submission.status === "Butuh Review"
    ).length
    const average =
      feedbackSubmissions.reduce(
        (sum, submission) => sum + submission.averageScore,
        0
      ) / total

    return {
      total,
      pending,
      average: average.toFixed(1),
    }
  }, [])

  if (permissions.canManageAdmin || permissions.canManageExaminer) {
    return (
      <FeaturePageLayout
        feature={feature}
        showHero={false}
        showStats={false}
        showSupportPanels={false}
      >
        {selectedSection === "participants" ? (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Tabel peserta onboarding</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Flow Penguji (Vendor) - Memilih Nama Peserta - Penilaian -
              Selesai.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-210 border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-3 py-2 font-semibold">No</th>
                    <th className="px-3 py-2 font-semibold">Nama peserta</th>
                    <th className="px-3 py-2 font-semibold">Track</th>
                    <th className="px-3 py-2 font-semibold">
                      Penguji (Vendor)
                    </th>
                    <th className="px-3 py-2 font-semibold">
                      Memilih nama peserta
                    </th>
                    <th className="px-3 py-2 font-semibold">Penilaian</th>
                    <th className="px-3 py-2 font-semibold">Selesai</th>
                    <th className="px-3 py-2 font-semibold">Input penilaian</th>
                  </tr>
                </thead>
                <tbody>
                  {participantFlowRows.map((row, index) => (
                    <tr key={row.id} className="border-b last:border-none">
                      <td className="px-3 py-3">{index + 1}</td>
                      <td className="px-3 py-3 font-medium">{row.name}</td>
                      <td className="px-3 py-3">{row.track}</td>
                      <td className="px-3 py-3">{row.vendor}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            row.selected
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {row.selected ? "Dipilih" : "Belum"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            row.scored
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {row.scored ? "Sudah dinilai" : "Belum dinilai"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            row.completed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {row.completed ? "Selesai" : "Belum"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {row.completed ? (
                          <Button
                            asChild
                            type="button"
                            size="sm"
                            variant="outline"
                          >
                            <Link to={`/evaluasi-input-penilaian?id=${row.id}`}>
                              Input penilaian
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            Tugas belum selesai
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Feedback masuk</p>
                <p className="mt-1 text-2xl font-semibold">
                  {reviewStats.total}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Butuh review</p>
                <p className="mt-1 text-2xl font-semibold">
                  {reviewStats.pending}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Rata-rata nilai</p>
                <p className="mt-1 text-2xl font-semibold">
                  {reviewStats.average}/4
                </p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">
                Feedback user onboarding
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Tampilan admin untuk review jawaban yang dikirim peserta.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-190 border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-3 py-2 font-semibold">Peserta</th>
                      <th className="px-3 py-2 font-semibold">Track</th>
                      <th className="px-3 py-2 font-semibold">Level</th>
                      <th className="px-3 py-2 font-semibold">Submit</th>
                      <th className="px-3 py-2 font-semibold">Skor</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b last:border-none"
                      >
                        <td className="px-3 py-3 font-medium">
                          {submission.participantName}
                        </td>
                        <td className="px-3 py-3">
                          {submission.participantTrack}
                        </td>
                        <td className="px-3 py-3">Level {submission.level}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {submission.submittedAt}
                        </td>
                        <td className="px-3 py-3">
                          {submission.averageScore}/4
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              submission.status === "Sudah Ditinjau"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Button
                            asChild
                            type="button"
                            size="sm"
                            variant="outline"
                          >
                            <Link
                              to={`/evaluasi-feedback-detail?id=${submission.id}`}
                            >
                              Lihat jawaban
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </FeaturePageLayout>
    )
  }

  return (
    <FeaturePageLayout
      feature={feature}
      showHero={false}
      showStats={false}
      showSupportPanels={false}
    >
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Tabel evaluasi peserta</h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            Track login: {participantLabel}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-170 border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-3 py-2 font-semibold">No</th>
                <th className="px-3 py-2 font-semibold">Peserta</th>
                <th className="px-3 py-2 font-semibold">Level evaluasi</th>
                <th className="px-3 py-2 font-semibold">Action detail</th>
              </tr>
            </thead>
            <tbody>
              {evaluationLevelRows.map((row) => (
                <tr key={row.id} className="border-b last:border-none">
                  <td className="px-3 py-3">{row.id}</td>
                  <td className="px-3 py-3">{participantLabel}</td>
                  <td className="px-3 py-3">{row.level}</td>
                  <td className="px-3 py-3">
                    <Button asChild type="button" size="sm" variant="outline">
                      <Link to={`/evaluasi?level=${row.id}`}>
                        Action Detail
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </FeaturePageLayout>
  )
}

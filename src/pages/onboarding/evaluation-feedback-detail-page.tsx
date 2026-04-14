import { Link, Navigate, useSearchParams } from "react-router-dom"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { getFeatureByPath } from "@/lib/app-features"
import { getRolePermissions, getStoredDemoUser } from "@/lib/demo-access"
import { feedbackSubmissions } from "@/lib/evaluation-feedback"

const feature = getFeatureByPath("/evaluasi-feedback-detail")!

export default function EvaluationFeedbackDetailPage() {
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const [searchParams] = useSearchParams()
  const submissionId = searchParams.get("id") ?? ""

  if (!permissions.canManageAdmin && !permissions.canManageExaminer) {
    return <Navigate to="/evaluasi-feedback" replace />
  }

  const selectedFeedback =
    feedbackSubmissions.find((submission) => submission.id === submissionId) ??
    feedbackSubmissions[0]

  return (
    <FeaturePageLayout
      feature={feature}
      showHero={false}
      showStats={false}
      showSupportPanels={false}
    >
      <section className="mx-auto grid w-full max-w-4xl gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Detail jawaban peserta</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Laporan feedback yang dikirim user onboarding.
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                selectedFeedback.status === "Sudah Ditinjau"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {selectedFeedback.status}
            </span>
          </div>

          <div className="mt-4 grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Peserta:</span>{" "}
              <span className="font-medium">
                {selectedFeedback.participantName}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Track:</span>{" "}
              <span className="font-medium">
                {selectedFeedback.participantTrack}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Level:</span> Level{" "}
              {selectedFeedback.level}
            </p>
            <p>
              <span className="text-muted-foreground">Tanggal pelatihan:</span>{" "}
              {selectedFeedback.trainingDate}
            </p>
            <p>
              <span className="text-muted-foreground">Penyelenggara:</span>{" "}
              {selectedFeedback.organizer}
            </p>
            <p>
              <span className="text-muted-foreground">Instruktur:</span>{" "}
              {selectedFeedback.instructor}
            </p>
            <p>
              <span className="text-muted-foreground">Waktu submit:</span>{" "}
              {selectedFeedback.submittedAt}
            </p>
            <p>
              <span className="text-muted-foreground">Skor rata-rata:</span>{" "}
              <span className="font-semibold">
                {selectedFeedback.averageScore}/4
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {selectedFeedback.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-primary">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {section.answers.map((answer) => (
                  <li
                    key={answer.question}
                    className="flex items-start justify-between gap-3 rounded-lg border bg-background px-3 py-2"
                  >
                    <span className="text-muted-foreground">
                      {answer.question}
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {answer.score}/4
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            Catatan peserta
          </p>
          <p className="mt-2 text-sm">{selectedFeedback.notes}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/evaluasi-feedback">Kembali ke daftar feedback</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to={`/evaluasi?level=${selectedFeedback.level}`}>
              Lihat format evaluasi level {selectedFeedback.level}
            </Link>
          </Button>
        </div>
      </section>
    </FeaturePageLayout>
  )
}

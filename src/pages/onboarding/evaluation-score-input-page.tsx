import { useMemo, useState } from "react"
import { Link, Navigate, useSearchParams } from "react-router-dom"

import { FeaturePageLayout } from "@/components/feature-page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFeatureByPath } from "@/lib/app-features"
import { getRolePermissions, getStoredDemoUser } from "@/lib/demo-access"
import { participantFlowRows } from "@/lib/evaluation-feedback"

const feature = getFeatureByPath("/evaluasi-input-penilaian")!

export default function EvaluationScoreInputPage() {
  const currentUser = getStoredDemoUser()
  const permissions = getRolePermissions(currentUser.role)
  const [searchParams] = useSearchParams()
  const targetId = searchParams.get("id") ?? ""

  if (!permissions.canManageAdmin && !permissions.canManageExaminer) {
    return <Navigate to="/evaluasi-feedback" replace />
  }

  const completedParticipants = participantFlowRows.filter(
    (row) => row.completed
  )
  const selectedParticipant =
    completedParticipants.find((row) => row.id === targetId) ??
    completedParticipants[0]

  const [preTestScore, setPreTestScore] = useState("")
  const [postTestScore, setPostTestScore] = useState("")
  const [taskScore, setTaskScore] = useState("")
  const [remarks, setRemarks] = useState("")

  const finalScore = useMemo(() => {
    const pre = Number(preTestScore) || 0
    const post = Number(postTestScore) || 0
    const task = Number(taskScore) || 0

    if (!preTestScore && !postTestScore && !taskScore) return "-"

    const weighted = pre * 0.3 + post * 0.4 + task * 0.3
    return weighted.toFixed(1)
  }, [postTestScore, preTestScore, taskScore])

  if (!selectedParticipant) {
    return (
      <FeaturePageLayout
        feature={feature}
        showHero={false}
        showStats={false}
        showSupportPanels={false}
      >
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Belum ada peserta yang menyelesaikan tugas untuk proses input
            penilaian.
          </p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link to="/evaluasi-feedback?section=participants">
              Kembali ke tabel peserta
            </Link>
          </Button>
        </section>
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
      <section className="mx-auto grid w-full max-w-4xl gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Input penilaian peserta</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Form ini hanya untuk peserta yang sudah menyelesaikan tugas
            onboarding.
          </p>

          <div className="mt-4 grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Nama peserta:</span>{" "}
              <span className="font-medium">{selectedParticipant.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Track:</span>{" "}
              <span className="font-medium">{selectedParticipant.track}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Level:</span> Level{" "}
              {selectedParticipant.level}
            </p>
            <p>
              <span className="text-muted-foreground">Penguji:</span>{" "}
              {selectedParticipant.vendor}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium" htmlFor="pretest-score">
                Nilai Pre-Test
              </label>
              <Input
                id="pretest-score"
                type="number"
                min={0}
                max={100}
                className="mt-2"
                value={preTestScore}
                onChange={(event) => setPreTestScore(event.target.value)}
                placeholder="0 - 100"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="posttest-score">
                Nilai Post-Test
              </label>
              <Input
                id="posttest-score"
                type="number"
                min={0}
                max={100}
                className="mt-2"
                value={postTestScore}
                onChange={(event) => setPostTestScore(event.target.value)}
                placeholder="0 - 100"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="task-score">
                Nilai Tugas
              </label>
              <Input
                id="task-score"
                type="number"
                min={0}
                max={100}
                className="mt-2"
                value={taskScore}
                onChange={(event) => setTaskScore(event.target.value)}
                placeholder="0 - 100"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium" htmlFor="remarks">
              Catatan penilai
            </label>
            <textarea
              id="remarks"
              className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Tambahkan catatan hasil evaluasi peserta"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          </div>

          <div className="mt-4 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              Nilai akhir (30% pre-test, 40% post-test, 30% tugas):{" "}
            </span>
            <span className="font-semibold">{finalScore}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm">
              Simpan penilaian
            </Button>
            <Button asChild type="button" size="sm" variant="outline">
              <Link to="/evaluasi-feedback?section=participants">
                Kembali ke tabel peserta
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </FeaturePageLayout>
  )
}

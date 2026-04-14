import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-1 text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Route yang diminta belum tersedia pada modul LMS Onboarding ini.
      </p>
      <Button asChild className="mt-4">
        <Link to="/dashboard">Kembali ke dashboard</Link>
      </Button>
    </div>
  )
}

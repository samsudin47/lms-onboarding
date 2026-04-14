import { ArrowRight, BriefcaseBusiness, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"

const accessOptions = [
  {
    title: "Onboarding",
    description: "Untuk peserta baru, trainee, atau user onboarding.",
    to: "/login?access=onboarding",
    access: "onboarding",
    icon: GraduationCap,
  },
  {
    title: "Karyawan",
    description:
      "Hanya untuk Mentor, Co-mentor, Admin PSP, dan Penguji Internal.",
    to: "/login?access=karyawan",
    access: "karyawan",
    icon: BriefcaseBusiness,
  },
]

export default function AccessSelectionPage() {
  return (
    <div
      className="relative flex min-h-svh items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.58), rgba(15, 23, 42, 0.42)), url('/logo-peruri.jpg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-blue-950/20" aria-hidden />

      <section className="relative z-10 w-full max-w-2xl rounded-3xl border border-blue-200/30 bg-blue-500/10 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 rounded-2xl border border-blue-200/20 bg-white/35 px-4 py-5 text-center shadow-sm backdrop-blur-sm">
          <p className="text-sm font-medium text-blue-900">
            LMS Onboarding Peruri
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Pilih jenis akses
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Sebelum login, pilih terlebih dahulu apakah Anda masuk sebagai
            peserta onboarding atau karyawan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {accessOptions.map((option) => (
            <Link
              key={option.title}
              to={option.to}
              onClick={() =>
                window.sessionStorage.setItem("lms-access-type", option.access)
              }
              className="group rounded-2xl border border-white/30 bg-white/55 p-4 text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/75"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <option.icon className="size-5" />
              </div>

              <h2 className="text-lg font-semibold">{option.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {option.description}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                Lanjut ke login
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

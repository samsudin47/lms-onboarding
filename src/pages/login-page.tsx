import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  RefreshCw,
  UserRoundCheck,
} from "lucide-react"
import { type FormEvent, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"

function generateCaptchaCode() {
  return Array.from(
    { length: 6 },
    () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  ).join("")
}

const CHAR_STYLES: Array<{
  rotation: string
  color: string
  fontSize: string
}> = [
  { rotation: "-3deg", color: "#1e3a5f", fontSize: "1.15rem" },
  { rotation: "4deg", color: "#2d6a4f", fontSize: "1.05rem" },
  { rotation: "-5deg", color: "#7b2d2d", fontSize: "1.2rem" },
  { rotation: "2deg", color: "#4a3060", fontSize: "1.1rem" },
  { rotation: "-2deg", color: "#1e3a5f", fontSize: "1.15rem" },
  { rotation: "5deg", color: "#2d6a4f", fontSize: "1.05rem" },
]

const sampleUsers = [
  {
    name: "Onboard PKWT",
    role: "Peserta Onboarding",
    access: "onboarding",
    email: "pkwt@peruri.co.id",
    password: "onboard2026",
    track: "pkwt",
  },
  {
    name: "Onboard Prohire",
    role: "Peserta Onboarding",
    access: "onboarding",
    email: "prohire@peruri.co.id",
    password: "onboard2026",
    track: "pro-hire",
  },
  {
    name: "Onboard MT/Organik",
    role: "Peserta Onboarding",
    access: "onboarding",
    email: "mtorgani@peuri.co.id",
    password: "onboard2026",
    track: "mt-organik",
  },
  {
    name: "Mentor",
    role: "Mentor",
    access: "karyawan",
    email: "mentor@peruri.co.id",
    password: "onboard2026",
  },
  {
    name: "Co-mentor",
    role: "Co-mentor",
    access: "karyawan",
    email: "co-mentor@peruri.co.id",
    password: "onboard2026",
  },
  {
    name: "Admin PSP",
    role: "Admin PSP",
    access: "karyawan",
    email: "adminpsp@peruri.co.id",
    password: "onboard2026",
  },
  {
    name: "Penguji Internal",
    role: "Penguji Internal",
    access: "karyawan",
    email: "pengujipinternal@peruri.co.id",
    password: "onboard2026",
  },
] as const

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode())
  const [captchaValue, setCaptchaValue] = useState("")
  const [captchaError, setCaptchaError] = useState(false)

  function refreshCaptcha() {
    setCaptchaCode(generateCaptchaCode())
    setCaptchaValue("")
    setCaptchaError(false)
  }

  const selectedAccess =
    searchParams.get("access") ??
    window.sessionStorage.getItem("lms-access-type") ??
    "onboarding"

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setErrorMessage("Email wajib diisi.")
      return
    }

    if (!password) {
      setErrorMessage("Password wajib diisi.")
      return
    }

    if (captchaValue.trim() !== captchaCode) {
      setCaptchaError(true)
      refreshCaptcha()
      return
    }

    const allowedUsers = sampleUsers.filter(
      (user) => user.access === selectedAccess
    )
    const matchedUser = allowedUsers.find(
      (user) => user.email === normalizedEmail && user.password === password
    )

    if (!matchedUser) {
      setErrorMessage(
        selectedAccess === "karyawan"
          ? "Akses karyawan hanya untuk Mentor, Co-mentor, Admin PSP, atau Penguji Internal dengan password yang sesuai."
          : "Akses onboarding tersedia untuk akun pkwt@peruri.co.id, prohire@peruri.co.id, dan mtorgani@peuri.co.id dengan password onboard2026."
      )
      return
    }

    window.sessionStorage.setItem("lms-access-type", selectedAccess)
    window.sessionStorage.setItem("lms-demo-user", JSON.stringify(matchedUser))
    setErrorMessage("")
    navigate("/dashboard")
  }

  return (
    <div
      className="relative flex min-h-svh items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.56), rgba(15, 23, 42, 0.42)), url('/logo-peruri.jpg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-blue-950/15" aria-hidden />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-blue-200/30 bg-blue-500/10 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 rounded-2xl border border-blue-200/20 bg-white/35 px-4 py-5 text-center shadow-sm backdrop-blur-sm">
          <div className="mb-3 flex justify-start">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-700 hover:bg-white/50"
            >
              <Link to="/pilih-akses">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
          </div>
          <p className="text-sm font-medium text-blue-900">
            LMS Onboarding Peruri
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Masuk ke akun Anda
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Gunakan email kantor atau lanjutkan dengan SSO Peruri.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="nama@peruri.co.id"
              onChange={(event) => {
                setEmail(event.target.value)
                setErrorMessage("")
              }}
              aria-invalid={Boolean(errorMessage)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Masukkan password"
                className="pr-10"
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrorMessage("")
                }}
                aria-invalid={Boolean(errorMessage)}
              />
              <button
                type="button"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Lihat password"
                }
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 font-medium text-slate-800">
              <input
                type="checkbox"
                className="size-4 rounded border border-slate-400 bg-white/90 shadow-sm"
              />
              <span>Ingat saya</span>
            </label>
            <span className="font-medium text-slate-800">Lupa password?</span>
          </div>

          {/* CAPTCHA */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Verifikasi CAPTCHA</label>
            <div className="flex items-center gap-2">
              <div
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-blue-200/50 bg-white/60 px-3 py-2.5 backdrop-blur-sm select-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 5px)",
                }}
                aria-label="Kode CAPTCHA"
              >
                {captchaCode.split("").map((char, i) => (
                  <span
                    key={i}
                    className="inline-block font-mono font-bold tracking-widest"
                    style={{
                      transform: `rotate(${CHAR_STYLES[i % CHAR_STYLES.length].rotation})`,
                      color: CHAR_STYLES[i % CHAR_STYLES.length].color,
                      fontSize: CHAR_STYLES[i % CHAR_STYLES.length].fontSize,
                      textShadow: "1px 1px 2px rgba(0,0,0,0.12)",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                aria-label="Refresh CAPTCHA"
                className="rounded-lg border border-blue-200/50 bg-white/60 p-2 text-slate-600 transition hover:bg-white/80 hover:text-slate-900"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
            <Input
              type="text"
              value={captchaValue}
              placeholder="Ketik kode di atas"
              autoComplete="off"
              onChange={(e) => {
                setCaptchaValue(e.target.value)
                setCaptchaError(false)
              }}
              aria-invalid={captchaError}
            />
            {captchaError && (
              <p className="text-xs text-red-600">
                Kode CAPTCHA salah. Silakan coba kode yang baru.
              </p>
            )}
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            <Button type="submit" className="w-full">
              <UserRoundCheck className="size-4" />
              Login
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-blue-200/40" />
              </div>
              <div className="relative flex justify-center text-xs tracking-[0.2em] text-slate-600 uppercase">
                <span className="rounded-full bg-white/70 px-3 py-0.5 backdrop-blur-sm">
                  atau
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-blue-300/50 bg-white/55 text-slate-900 hover:bg-blue-50"
              onClick={() =>
                setErrorMessage(
                  "Mode demo SSO belum diaktifkan. Silakan login memakai email dan password sesuai jenis akses yang dipilih."
                )
              }
            >
              <Building2 className="size-4" />
              Login SSO Peruri
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

import { Bell, ChevronDown, LogOut, Moon, Sun, UserRound } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"

import {
  getDashboardNotificationAlerts,
  getDashboardNotificationItemCount,
} from "@/lib/dashboard-notifications"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import { getFeatureByPath } from "@/lib/app-features"
import { cn } from "@/lib/utils"
import {
  getDemoUserTrack,
  getRoleKey,
  guestUser,
  type DemoRoleKey,
  type DemoUser,
} from "@/lib/demo-access"

function getClassHeaderCopy(
  section: string | null,
  track: string | null,
  roleKey: DemoRoleKey
) {
  const trackLabel =
    track === "pkwt"
      ? "PKWT"
      : track === "pro-hire"
        ? "Pro Hire"
        : track === "mt-organik"
          ? "MT/Organik"
          : "onboarding"

  switch (section) {
    case "catalog":
    case "catalog-detail":
    case "other-training":
    case "journey-detail":
      if (roleKey === "participant") {
        return {
          title: "Course",
          summary:
            "Katalog course onboarding berdasarkan kategori dan batch.",
        }
      }
      return {
        title: "Class",
        summary: "Katalog class onboarding berdasarkan kategori dan batch.",
      }
    case "batch-list":
    case "batch-mentees":
    case "batch-setting":
    case "question-builder":
    case "mentee-review":
      return {
        title: "Classes",
        summary: `Kelola batch, peserta, dan progres ${trackLabel}.`,
      }
    case "mentor":
    case "co-mentor":
      return {
        title: "Data Mentor",
        summary: "Kelola daftar mentor dan co-mentor onboarding.",
      }
    default:
      if (roleKey === "participant") {
        return {
          title: "My Courses",
          summary: "Journey course PKWT, Pro Hire, dan MT/Organik.",
        }
      }
      return {
        title: "My Classes",
        summary: "Journey class PKWT, Pro Hire, dan MT/Organik.",
      }
  }
}

function HeaderNotificationButton({
  roleKey,
  showReminderLink,
}: {
  roleKey: DemoRoleKey
  showReminderLink: boolean
}) {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alerts = getDashboardNotificationAlerts(roleKey)
  const count = getDashboardNotificationItemCount(alerts)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  function cancelClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function handlePointerEnter() {
    cancelClose()
    setOpen(true)
  }

  function handlePointerLeave() {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setOpen(false), 180)
  }

  return (
    <div
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="relative cursor-pointer rounded-full border-0 shadow-none"
        aria-label={`Pemberitahuan, ${count} butir`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="size-4" />
        {count > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {count}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          className="absolute top-full right-0 z-50 mt-1.5 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-popover p-0 text-popover-foreground shadow-lg"
          role="region"
          aria-label="Pemberitahuan dashboard"
        >
          <div className="border-b border-border/80 px-3 py-2.5">
            <p className="text-sm font-semibold">Pemberitahuan</p>
            <p className="text-xs text-muted-foreground">
              Ringkasan yang sama di dashboard
            </p>
          </div>
          <div className="max-h-[min(20rem,50vh)] space-y-2 overflow-y-auto p-2">
            {alerts.map((alert) => (
              <div
                key={alert.key}
                className={cn(
                  "rounded-xl border px-3 py-2.5 shadow-sm",
                  alert.boxClass
                )}
              >
                <p className="text-sm font-semibold text-foreground">
                  {alert.title}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {alert.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                          alert.bulletClass
                        )}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1 border-t border-border/80 p-2">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link to="/dashboard">Buka dashboard</Link>
            </Button>
            {showReminderLink ? (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                <Link to="/notifikasi-reminder-otomatis">
                  Pengaturan reminder
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer rounded-full border-0 shadow-none"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDark ? "Mode terang" : "Mode gelap"}
      </TooltipContent>
    </Tooltip>
  )
}

export default function AppLayout() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const featureFromPath =
    getFeatureByPath(pathname) ?? getFeatureByPath("/dashboard")!
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<DemoUser>(() => {
    if (typeof window === "undefined") return guestUser
    const storedUser = window.sessionStorage.getItem("lms-demo-user")
    return storedUser ? (JSON.parse(storedUser) as DemoUser) : guestUser
  })
  const roleKey = getRoleKey(currentUser.role)

  const currentFeature = useMemo(() => {
    if (pathname !== "/class") return featureFromPath
    return getClassHeaderCopy(
      new URLSearchParams(search).get("section"),
      new URLSearchParams(search).get("track"),
      roleKey
    )
  }, [pathname, search, roleKey, featureFromPath])
  const isRestrictedOnboardingUser =
    roleKey === "participant" && Boolean(getDemoUserTrack(currentUser))
  const restrictedAllowedPaths = isRestrictedOnboardingUser
    ? ["/dashboard", "/class", "/profile", "/evaluasi-feedback", "/evaluasi"]
    : roleKey === "mentor" || roleKey === "coMentor"
      ? ["/dashboard", "/journey-onboarding", "/profile"]
      : roleKey === "examiner"
        ? [
            "/dashboard",
            "/evaluasi-feedback",
            "/evaluasi-input-penilaian",
            "/profile",
          ]
        : null
  const isRestrictedNavigationUser = Boolean(restrictedAllowedPaths)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!restrictedAllowedPaths) return

    if (!restrictedAllowedPaths.includes(pathname)) {
      setMenuOpen(false)
      navigate("/dashboard", { replace: true })
    }
  }, [navigate, pathname, restrictedAllowedPaths])

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("lms-demo-user")
      window.sessionStorage.removeItem("lms-access-type")
    }
    setCurrentUser(guestUser)
    setMenuOpen(false)
    navigate("/pilih-akses")
  }

  return (
    <SidebarProvider>
      <AppLayoutFrame
        currentFeature={currentFeature}
        currentUser={currentUser}
        roleKey={roleKey}
        isRestrictedNavigationUser={isRestrictedNavigationUser}
        menuOpen={menuOpen}
        menuRef={menuRef}
        setMenuOpen={setMenuOpen}
        handleLogout={handleLogout}
      />
    </SidebarProvider>
  )
}

function AppLayoutFrame({
  currentFeature,
  currentUser,
  roleKey,
  isRestrictedNavigationUser,
  menuOpen,
  menuRef,
  setMenuOpen,
  handleLogout,
}: {
  currentFeature: { title: string; summary: string }
  currentUser: DemoUser
  roleKey: DemoRoleKey
  isRestrictedNavigationUser: boolean
  menuOpen: boolean
  menuRef: React.RefObject<HTMLDivElement | null>
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleLogout: () => void
}) {
  return (
    <>
      <AppSidebar />

      <SidebarInset className="relative flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
        <header
          className="relative z-40 flex h-16 shrink-0 items-center gap-3 border-0 bg-background px-2 py-0 shadow-none sm:px-3"
        >
          <SidebarTrigger className="shrink-0" />

          <div className="flex min-h-0 min-w-0 flex-col justify-center leading-tight">
            <p className="truncate text-sm font-semibold">
              {currentFeature.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentFeature.summary}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggleButton />
            <HeaderNotificationButton
              roleKey={roleKey}
              showReminderLink={!isRestrictedNavigationUser}
            />

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-left transition hover:bg-muted/40"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-4" />
                </div>

                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.role}
                  </p>
                </div>

                <ChevronDown
                  className={`size-4 text-muted-foreground transition ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-background">
                  <div className="border-b px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-5" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-base font-semibold">
                          {currentUser.name}
                        </p>
                        <p className="text-sm text-foreground">
                          {currentUser.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentUser.email ?? "email belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                    >
                      <LogOut className="size-4" />
                      Log out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  )
}

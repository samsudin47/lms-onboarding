import { Bell, ChevronDown, LogOut, Moon, Sun, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
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
  type DemoUser,
} from "@/lib/demo-access"

function getClassHeaderCopy(section: string | null, track: string | null) {
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
      return {
        title: "My Classes",
        summary: "Journey class PKWT, Pro Hire, dan MT/Organik.",
      }
  }
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
  const currentFeature =
    pathname === "/class"
      ? getClassHeaderCopy(
          new URLSearchParams(search).get("section"),
          new URLSearchParams(search).get("track")
        )
      : featureFromPath
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<DemoUser>(() => {
    if (typeof window === "undefined") return guestUser
    const storedUser = window.sessionStorage.getItem("lms-demo-user")
    return storedUser ? (JSON.parse(storedUser) as DemoUser) : guestUser
  })
  const roleKey = getRoleKey(currentUser.role)
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
  roleKey: string
  isRestrictedNavigationUser: boolean
  menuOpen: boolean
  menuRef: React.RefObject<HTMLDivElement | null>
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleLogout: () => void
}) {
  const { state: sidebarState } = useSidebar()

  return (
    <>
      <AppSidebar />

      <SidebarInset className="relative">
        <header
          className={cn(
            "fixed top-2 right-4 left-4 z-40 flex h-16 items-center gap-3 rounded-[24px] bg-background/95 px-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 md:right-6",
            roleKey === "adminPSP" ? "border-0" : "border",
            sidebarState === "collapsed"
              ? "md:left-[calc(var(--sidebar-width-icon)+1.5rem)]"
              : "md:left-[calc(var(--sidebar-width)+1.5rem)]"
          )}
        >
          <SidebarTrigger />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {currentFeature.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentFeature.summary}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggleButton />
            {!isRestrictedNavigationUser ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full border-0 shadow-none"
                  >
                    <Link
                      to="/notifikasi-reminder-otomatis"
                      aria-label="3 notifikasi"
                    >
                      <Bell className="size-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">3 notifikasi</TooltipContent>
              </Tooltip>
            ) : null}

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

        <div className="flex flex-1 flex-col p-4 pt-22 sm:p-6 sm:pt-24">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  )
}

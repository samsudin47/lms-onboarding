import { useState } from "react"
import {
  BarChart2,
  Briefcase,
  ChevronDown,
  ClipboardCheck,
  Database,
  DatabaseZap,
  LayoutDashboard,
  Layers3,
  ListChecks,
  School,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import iconChild from "@/assets/icon-child.png"
import iconPeruri from "@/assets/icon-peruri.png"
import {
  getDemoUserTrack,
  getRoleKey,
  getStoredDemoUser,
  type DemoRoleKey,
  type DemoUser,
} from "@/lib/demo-access"
import { getParticipantMyClassesHref } from "@/lib/participant-class-deeplink"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

type NavigationNode = {
  id: string
  title: string
  icon?: LucideIcon
  path?: string
  /** Href penuh (mis. deep-link ke detail journey untuk peserta). */
  href?: string
  track?: string
  section?: string
  children?: NavigationNode[]
}

const mentorChildren: NavigationNode[] = [
  {
    id: "mentor-mentee-list",
    title: "Daftar Mentee",
    path: "/journey-onboarding",
    section: "mentee-list",
  },
  {
    id: "mentor-progress",
    title: "Progress Mentee",
    path: "/journey-onboarding",
    section: "progress",
  },
  {
    id: "mentor-coaching-1",
    title: "Hasil Coaching Sesi 1",
    path: "/journey-onboarding",
    section: "coaching-1",
  },
  {
    id: "mentor-coaching-2",
    title: "Hasil Coaching Sesi 2",
    path: "/journey-onboarding",
    section: "coaching-2",
  },
  {
    id: "mentor-coaching-3",
    title: "Hasil Coaching Sesi 3",
    path: "/journey-onboarding",
    section: "coaching-3",
  },
  {
    id: "mentor-project",
    title: "Penilaian Project",
    path: "/journey-onboarding",
    section: "project",
  },
  {
    id: "mentor-graduation",
    title: "Konfirmasi Kelulusan",
    path: "/journey-onboarding",
    section: "graduation",
  },
]

const myClassChildren: NavigationNode[] = [
  {
    id: "my-class-pkwt",
    title: "PKWT",
    path: "/class",
    href: getParticipantMyClassesHref("pkwt"),
    track: "pkwt",
    section: "journey-detail",
  },
  {
    id: "my-class-pro-hire",
    title: "Prohire",
    path: "/class",
    href: getParticipantMyClassesHref("pro-hire"),
    track: "pro-hire",
    section: "journey-detail",
  },
  {
    id: "my-class-mt-organik",
    title: "MT/Organik",
    path: "/class",
    href: getParticipantMyClassesHref("mt-organik"),
    track: "mt-organik",
    section: "journey-detail",
  },
]

const masterChildren: NavigationNode[] = [
  {
    id: "master-fase-link",
    title: "Master Fase",
    icon: DatabaseZap,
    path: "/master-fase",
  },
  {
    id: "master-bagian-evaluasi-link",
    title: "Bagian Evaluasi",
    icon: ListChecks,
    path: "/master-bagian-evaluasi",
  },
  {
    id: "master-jabatan-link",
    title: "Jabatan Terkait",
    icon: Briefcase,
    path: "/master-jabatan",
  },
  {
    id: "master-kategori-pelatihan-link",
    title: "Kategori Pelatihan",
    icon: Tags,
    path: "/master-kategori-pelatihan",
  },
]

const examinerChildren: NavigationNode[] = [
  {
    id: "examiner-participants",
    title: "Nama Peserta",
    path: "/evaluasi-feedback",
    section: "participants",
  },
]

function buildHref(item: NavigationNode) {
  if (!item.path) return "#"
  if (item.href) return item.href

  const params = new URLSearchParams()

  if (item.track) params.set("track", item.track)
  if (item.section) params.set("section", item.section)

  const query = params.toString()
  return query ? `${item.path}?${query}` : item.path
}

function matchesNode(
  item: NavigationNode,
  pathname: string,
  activeTrack: string,
  activeSection: string
): boolean {
  if (item.children?.length) {
    return item.children.some((child) =>
      matchesNode(child, pathname, activeTrack, activeSection)
    )
  }

  if (!item.path || pathname !== item.path) return false
  if (item.track && activeTrack !== item.track) return false

  if (item.id === "my-class" || item.id?.startsWith("my-class-")) {
    return (
      activeSection === "journey-detail" ||
      activeSection === "quiz-summary" ||
      activeSection === "overview"
    )
  }

  if (item.section && activeSection !== item.section) return false

  return true
}

function getNavigation(
  roleKey: DemoRoleKey,
  currentUser: DemoUser
): NavigationNode[] {
  if (roleKey === "examiner") {
    return [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
      {
        id: "management-penguji",
        title: "Management Penguji",
        icon: ClipboardCheck,
        children: examinerChildren,
      },
      {
        id: "profile-link",
        title: "Profile",
        icon: UserRound,
        path: "/profile",
      },
    ]
  }

  if (roleKey === "mentor" || roleKey === "coMentor") {
    return [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
      {
        id: "management-mentor",
        title: "Management Mentor",
        icon: Users,
        children: mentorChildren,
      },
      {
        id: "profile-link",
        title: "Profile",
        icon: UserRound,
        path: "/profile",
      },
    ]
  }

  const assignedTrack = getDemoUserTrack(currentUser)
  const participantChildren = assignedTrack
    ? myClassChildren.filter((item) => item.track === assignedTrack)
    : myClassChildren

  const participantMyClassItem: NavigationNode = assignedTrack
    ? {
        id: "my-class",
        title: "My Courses",
        icon: Layers3,
        path: "/class",
        href: getParticipantMyClassesHref(assignedTrack),
        track: assignedTrack,
        section: "journey-detail",
      }
    : {
        id: "my-class",
        title: "My Courses",
        icon: Layers3,
        children: participantChildren,
      }

  const items: NavigationNode[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    ...(roleKey === "participant" ? [participantMyClassItem] : []),
  ]

  if (roleKey === "participant") {
    items.push({
      id: "profile-link",
      title: "Profile",
      icon: UserRound,
      path: "/profile",
    })

    return items
  }

  if (["mentor", "coMentor"].includes(roleKey)) {
    items.push({
      id: "management-mentor",
      title: "Management Mentee",
      icon: Users,
      children: mentorChildren,
    })
  }

  if (roleKey === "adminPSP") {
    items.push(
      {
        id: "daftar-pengguna",
        title: "Pengguna",
        icon: Users,
        path: "/daftar-pengguna",
      },
      {
        id: "management-admin",
        title: "Classes",
        icon: School,
        path: "/class",
        section: "batch-list",
      },
      {
        id: "classes-link",
        title: "Courses",
        icon: Layers3,
        path: "/classes",
      },
      {
        id: "leaderboard-link",
        title: "Leaderboard",
        icon: BarChart2,
        path: "/leaderboard",
      }
    )
  }

  if (
    ["adminPSP", "mentor", "coMentor", "examiner"].includes(roleKey as string)
  ) {
    items.push({
      id: "evaluasi-link",
      title: "Evaluasi",
      icon: ClipboardCheck,
      path: "/evaluasi-feedback",
    })
  }

  if (roleKey === "adminPSP") {
    items.push({
      id: "data-master",
      title: "Data Master",
      icon: Database,
      children: masterChildren,
    })
  }

  items.push({
    id: "profile-link",
    title: "Profile",
    icon: UserRound,
    path: "/profile",
  })

  return items
}

export function AppSidebar() {
  const { pathname, search } = useLocation()
  const { state, isMobile } = useSidebar()
  const showFullPeruriLogo = isMobile || state === "expanded"
  const currentUser = getStoredDemoUser()
  const roleKey = getRoleKey(currentUser.role)
  const navigationItems = getNavigation(roleKey, currentUser)
  const params = new URLSearchParams(search)
  const activeTrack = params.get("track") ?? "pkwt"
  const activeSection = params.get("section") ?? ""
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "my-class": true,
    "data-master": true,
  })

  function toggleMenu(id: string) {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function renderNode(item: NavigationNode, level = 0) {
    const hasChildren = Boolean(item.children?.length)
    const isActive = matchesNode(item, pathname, activeTrack, activeSection)
    const isOpen = openMenus[item.id] ?? isActive
    const Icon = item.icon

    if (hasChildren) {
      const isDataMaster = item.id === "data-master"
      return (
        <SidebarMenuItem key={item.id}>
          <div
            className={cn("space-y-1", isDataMaster && "space-y-0.5")}
          >
          <button
            type="button"
            onClick={() => toggleMenu(item.id)}
            className={cn(
              "flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-left text-sm transition group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
              level === 0
                ? "text-slate-50 hover:bg-white/15 hover:text-white"
                : "text-slate-200 group-data-[collapsible=icon]:hidden hover:bg-white/12 hover:text-white",
              isDataMaster ? "py-2.5 font-semibold" : "font-medium",
              isActive && "bg-white/22 text-white"
            )}
            title={item.title}
          >
            {Icon ? (
              <Icon
                className="size-4 shrink-0"
                strokeWidth={isDataMaster ? 2 : 1.75}
              />
            ) : null}
            <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              {item.title}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden",
                isOpen && "rotate-180"
              )}
            />
          </button>

          {isOpen ? (
            <ul
              className={cn(
                "ml-4 list-none space-y-1 border-l pl-3 group-data-[collapsible=icon]:hidden",
                isDataMaster ? "border-white/25 py-1" : "border-white/10",
                level > 0 && !isDataMaster && "ml-3"
              )}
            >
              {item.children?.map((child) => renderNode(child, level + 1))}
            </ul>
          ) : null}
        </div>
        </SidebarMenuItem>
      )
    }

    const isNestedUnderDataMaster =
      level > 0 && Boolean(item.path?.startsWith("/master-"))

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={level === 0 ? item.title : undefined}
          className={cn(
          "rounded-xl font-medium hover:text-white",
          level === 0
            ? cn(
                "text-slate-50 outline-none transition-[background-color,color,opacity] duration-150 ease-out",
                "hover:bg-white/15 active:bg-white/20 active:text-white",
                "data-[active=true]:bg-white/28 data-[active=true]:text-white",
                "focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-0"
              )
            : cn(
                "px-3 text-slate-200 outline-none transition-[background-color,color,opacity] duration-150 ease-out group-data-[collapsible=icon]:hidden",
                "hover:bg-white/12 active:bg-white/18 active:text-white",
                "data-[active=true]:bg-white/22 data-[active=true]:text-white",
                "focus-visible:bg-white/12 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0",
                isNestedUnderDataMaster ? "min-h-10 py-2.5" : "h-8"
              )
        )}
      >
        <NavLink
          to={buildHref(item)}
          end={!item.track && !item.section}
          replace={
            item.path === "/class" &&
            (item.id === "my-class" ||
              Boolean(item.id?.startsWith("my-class-")))
          }
          className="flex min-h-0 min-w-0 flex-1 items-center gap-2"
        >
          {Icon ? (
            <Icon className="size-4 shrink-0 stroke-[1.75]" aria-hidden />
          ) : null}
          <span className="min-w-0 truncate leading-snug">{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="pb-0 pl-0 [&_[data-sidebar=sidebar]]:overflow-hidden [&_[data-sidebar=sidebar]]:rounded-t-xl [&_[data-sidebar=sidebar]]:rounded-b-none [&_[data-sidebar=sidebar]]:bg-white"
    >
      {/* Strip putih: tinggi sama dengan navbar utama (h-16) agar selaras secara vertikal */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center bg-white transition-[padding] duration-300 ease-out",
          showFullPeruriLogo ? "justify-center px-3" : "justify-center px-2"
        )}
      >
        <div
          className={cn("flex min-h-0 w-full items-center justify-center px-1")}
        >
          <div
            className={cn(
              "relative shrink-0 overflow-hidden border-0 bg-transparent shadow-none ring-0 transition-[width,height,border-radius] duration-300 ease-out",
              showFullPeruriLogo
                ? "flex h-[52px] w-full max-w-[188px] items-center justify-center sm:h-14 sm:max-w-[200px]"
                : "flex size-10 items-center justify-center"
            )}
            title="Peruri"
          >
            <img
              src={iconPeruri}
              alt=""
              aria-hidden
              className={cn(
                "transition-opacity duration-300 ease-out",
                showFullPeruriLogo
                  ? "h-full max-h-full w-full max-w-full object-contain object-center opacity-100"
                  : "pointer-events-none absolute inset-0 size-full object-cover opacity-0"
              )}
            />
            <img
              src={iconChild}
              alt="Logo Peruri"
              className={cn(
                "absolute inset-0 box-border size-full object-contain transition-opacity duration-300 ease-out",
                showFullPeruriLogo
                  ? "pointer-events-none p-1 opacity-0"
                  : "p-1 opacity-100"
              )}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden border border-t-0 border-white/12 shadow-[0_20px_50px_rgba(32,40,135,0.35)]",
          "rounded-tr-[5.25rem]",
          "bg-[#202887] text-slate-50"
        )}
      >
        <SidebarContent className="min-h-0">
          <SidebarGroup
            className={cn(roleKey === "participant" && "px-2 pb-2 pt-4")}
          >
            <SidebarGroupLabel
              className={cn(
                "text-[11px] tracking-[0.22em] text-slate-200/80 uppercase",
                roleKey === "participant"
                  ? "mb-3 mt-0 h-auto min-h-0 items-start justify-start px-2 py-1 leading-relaxed whitespace-normal"
                  : "mb-1.5"
              )}
            >
              Akses {currentUser.role}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu
                className={cn(
                  "list-none",
                  roleKey === "participant" ? "gap-2" : "gap-1"
                )}
              >
                {navigationItems.map((item) => renderNode(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>

      <SidebarRail />
    </Sidebar>
  )
}

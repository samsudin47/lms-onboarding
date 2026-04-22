import { useState } from "react"
import {
  BarChart2,
  ChevronDown,
  ClipboardCheck,
  DatabaseZap,
  LayoutDashboard,
  Layers3,
  ListChecks,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import iconChild from "@/assets/icon-child.jpeg"
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
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
        title: "My Classes",
        icon: Layers3,
        path: "/class",
        href: getParticipantMyClassesHref(assignedTrack),
        track: assignedTrack,
        section: "journey-detail",
      }
    : {
        id: "my-class",
        title: "My Classes",
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
        icon: ShieldCheck,
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
    items.push(
      {
        id: "master-fase-link",
        title: "Master Fase",
        icon: DatabaseZap,
        path: "/master-fase",
      },
      {
        id: "master-bagian-evaluasi-link",
        title: "Master Bagian Evaluasi",
        icon: ListChecks,
        path: "/master-bagian-evaluasi",
      }
    )
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
      return (
        <div key={item.id} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleMenu(item.id)}
            className={cn(
              "flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-left text-sm font-medium transition group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
              level === 0
                ? "text-slate-50 hover:bg-sky-400/20 hover:text-white"
                : "text-slate-200 group-data-[collapsible=icon]:hidden hover:bg-sky-400/15 hover:text-white",
              isActive && "bg-sky-400/30 text-white"
            )}
            title={item.title}
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
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
            <div
              className={cn(
                "ml-4 space-y-1 border-l border-white/10 pl-3 group-data-[collapsible=icon]:hidden",
                level > 0 && "ml-3"
              )}
            >
              {item.children?.map((child) => renderNode(child, level + 1))}
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <SidebarMenuButton
        key={item.id}
        asChild
        isActive={isActive}
        tooltip={level === 0 ? item.title : undefined}
        className={cn(
          "rounded-xl font-medium hover:text-white",
          level === 0
            ? "text-slate-50 hover:bg-sky-400/20 data-[active=true]:bg-sky-400/35 data-[active=true]:text-white"
            : "h-8 px-3 text-slate-200 group-data-[collapsible=icon]:hidden hover:bg-sky-400/15 data-[active=true]:bg-sky-400/25 data-[active=true]:text-white"
        )}
      >
        <NavLink
          to={buildHref(item)}
          end={!item.track && !item.section}
          replace={
            item.path === "/class" &&
            (item.id === "my-class" || Boolean(item.id?.startsWith("my-class-")))
          }
        >
          {Icon ? <Icon className="size-4 shrink-0" /> : null}
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    )
  }

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="[&_[data-sidebar=sidebar]]:border-sky-200/20 [&_[data-sidebar=sidebar]]:bg-linear-to-b [&_[data-sidebar=sidebar]]:from-blue-900 [&_[data-sidebar=sidebar]]:via-blue-800 [&_[data-sidebar=sidebar]]:to-indigo-900 [&_[data-sidebar=sidebar]]:text-slate-50 [&_[data-sidebar=sidebar]]:shadow-[0_20px_60px_rgba(37,99,235,0.28)]"
    >
      <SidebarHeader
        className={cn(
          "transition-[padding] duration-300 ease-out",
          showFullPeruriLogo ? "p-3" : "flex justify-center px-1.5 pt-2 pb-2"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden border border-white/10 bg-white shadow-sm ring-1 ring-black/5",
            "transition-[width,height,border-radius,box-shadow] duration-300 ease-out",
            showFullPeruriLogo
              ? "h-24 w-full max-w-full rounded-2xl"
              : "h-8 w-8 max-w-8 shrink-0 rounded-xl"
          )}
          title="Peruri"
        >
          <img
            src={iconPeruri}
            alt=""
            aria-hidden
            className={cn(
              "absolute inset-0 size-full object-cover object-center transition-opacity duration-300 ease-out",
              showFullPeruriLogo
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            )}
          />
          <img
            src={iconChild}
            alt="Peruri"
            className={cn(
              "absolute inset-0 box-border size-full object-contain p-1 transition-opacity duration-300 ease-out",
              showFullPeruriLogo
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            )}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] tracking-[0.22em] text-slate-200/80 uppercase">
            Akses {currentUser.role}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => renderNode(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

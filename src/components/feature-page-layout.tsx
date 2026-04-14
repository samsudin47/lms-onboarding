import { Link } from "react-router-dom"

import type { AppFeature } from "@/lib/app-features"
import { Button } from "@/components/ui/button"

type FeaturePageLayoutProps = {
  feature: AppFeature
  primaryAction?: { label: string; to?: string; onClick?: () => void }
  children: React.ReactNode
  showHero?: boolean
  showStats?: boolean
  showSupportPanels?: boolean
}

export function FeaturePageLayout({
  feature,
  primaryAction,
  children,
  showHero = true,
  showStats = true,
  showSupportPanels = true,
}: FeaturePageLayoutProps) {
  return (
    <div className="space-y-6">
      {showHero ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <feature.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {feature.badge}
                </p>
                <h1 className="mt-1 text-xl font-semibold">{feature.title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>Manfaat:</strong> {feature.benefit}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-background px-3 py-2 text-sm">
              Prioritas #{feature.id}
            </div>
          </div>
        </section>
      ) : null}

      {showStats ? (
        <section className="grid gap-4 md:grid-cols-3">
          {feature.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {children}

      {showSupportPanels ? (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Kebutuhan utama</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              {feature.checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Navigasi terkait</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {primaryAction?.to ? (
                <Button asChild>
                  <Link to={primaryAction.to}>{primaryAction.label}</Link>
                </Button>
              ) : primaryAction?.onClick ? (
                <Button type="button" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              ) : (
                <Button asChild>
                  <Link to={feature.links[0]?.to ?? "/dashboard"}>
                    {feature.actionLabel}
                  </Link>
                </Button>
              )}
              {feature.links.map((item) => (
                <Button asChild key={item.to} variant="outline">
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

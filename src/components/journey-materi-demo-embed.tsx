import { ExternalLink } from "lucide-react"

import {
  resolveJourneyDemoMedia,
  type JourneyDemoMateriInput,
} from "@/lib/journey-demo-media"
import { cn } from "@/lib/utils"

type Props = {
  materi: JourneyDemoMateriInput & { title: string; deskripsi: string }
  className?: string
}

export function JourneyMateriDemoEmbed({ materi, className }: Props) {
  const demo = resolveJourneyDemoMedia(materi)

  if (!demo) {
    return (
      <div
        className={cn(
          "rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground",
          className
        )}
      >
        <p className="text-base font-medium text-foreground">
          {materi.contentLabel}
        </p>
        <p className="mt-1">{materi.deskripsi}</p>
      </div>
    )
  }

  if (demo.kind === "video") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-muted/15 shadow-sm",
          className
        )}
      >
        <div className="border-b bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
          Demo video (mockup) — pemutaran dari server lokal aplikasi
        </div>
        <video
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full max-h-[min(70vh,560px)] bg-black object-contain"
          src={demo.src}
        >
          Browser Anda tidak mendukung pemutaran video inline.
        </video>
        <p className="border-t bg-muted/40 px-3 py-2 text-center text-[11px] text-muted-foreground">
          Untuk produksi, ganti dengan unggahan video LMS.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-muted/15 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
        <span className="text-[11px] text-muted-foreground">
          Demo PDF (mockup) — pratinjau dari server lokal aplikasi
        </span>
        <a
          href={demo.src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          <ExternalLink className="size-3.5 shrink-0" />
          Buka PDF di tab baru
        </a>
      </div>
      <iframe
        title={`${materi.title} — demo PDF`}
        src={demo.src}
        className="min-h-[min(70vh,560px)] w-full bg-white"
      />
      <p className="border-t bg-muted/40 px-3 py-2 text-center text-[11px] text-muted-foreground">
        Jika area di atas kosong, gunakan tautan &quot;Buka PDF di tab
        baru&quot;. Untuk produksi, ganti dengan unggahan dokumen LMS.
      </p>
    </div>
  )
}

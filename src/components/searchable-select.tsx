import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  DROPDOWN_SEARCH_THRESHOLD,
  dropdownNeedsSearch,
} from "@/lib/dropdown-search"
import { cn } from "@/lib/utils"

export type SearchableSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SearchableSelectProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  /** Baris pertama opsional (mis. value "" untuk «Pilih…»). */
  placeholderOption?: SearchableSelectOption
  /** Teks tombol bila nilai kosong / tidak cocok opsi. */
  placeholder?: string
  className?: string
  /** Kelas untuk `<select>` native atau tombol mode cari. */
  selectClassName?: string
  disabled?: boolean
  /** Daftar dari API / berubah → selalu sediakan kotak cari. */
  dynamic?: boolean
  searchThreshold?: number
  variant?: "default" | "rounded"
  /**
   * Ukuran lebih besar untuk modal / form penting (trigger, panel cari, baris opsi).
   */
  size?: "default" | "comfortable"
  /**
   * Lebar minimum trigger + panel (mode cari). Cegah dropdown menyempit di flex.
   * Default `min(100%, 18rem)` (~288px).
   */
  minWidthClassName?: string
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholderOption,
  placeholder = "Pilih…",
  className,
  selectClassName,
  disabled,
  dynamic,
  searchThreshold = DROPDOWN_SEARCH_THRESHOLD,
  variant = "default",
  size = "default",
  minWidthClassName = "min-w-[min(100%,18rem)]",
}: SearchableSelectProps) {
  const searchable = dropdownNeedsSearch(options.length, {
    dynamic,
    placeholderRow: Boolean(placeholderOption),
    searchThreshold,
  })

  const comfort = size === "comfortable"

  const baseSelectClasses =
    variant === "rounded"
      ? cn(
          "flex min-h-11 w-full items-center rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm transition",
          comfort && "min-h-[3.25rem] py-3.5 text-base",
          "focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50"
        )
      : cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
          comfort && "min-h-12 py-2.5 text-base",
          "focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50"
        )

  const triggerButtonClasses =
    variant === "rounded"
      ? cn(
          "flex min-h-11 w-full items-center justify-between rounded-2xl border border-input bg-background px-4 py-3 text-left text-sm shadow-sm transition",
          comfort && "min-h-[3.25rem] py-3.5 text-base",
          "disabled:pointer-events-none disabled:opacity-50"
        )
      : cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm",
          comfort && "min-h-12 py-2.5 text-base",
          "disabled:pointer-events-none disabled:opacity-50"
        )

  if (!searchable) {
    return (
      <div className={cn("relative", className)}>
        <select
          id={id}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseSelectClasses, selectClassName)}
          aria-label={placeholder}
        >
          {placeholderOption ? (
            <option
              value={placeholderOption.value}
              disabled={placeholderOption.disabled}
            >
              {placeholderOption.label}
            </option>
          ) : null}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <SearchableSelectCombo
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholderOption={placeholderOption}
      placeholder={placeholder}
      className={className}
      selectClassName={selectClassName}
      disabled={disabled}
      triggerButtonClasses={triggerButtonClasses}
      variant={variant}
      size={size}
      minWidthClassName={minWidthClassName}
    />
  )
}

function SearchableSelectCombo({
  id,
  value,
  onChange,
  options,
  placeholderOption,
  placeholder,
  className,
  selectClassName,
  disabled,
  triggerButtonClasses,
  variant,
  size = "default",
  minWidthClassName,
}: Omit<SearchableSelectProps, "dynamic" | "searchThreshold"> & {
  triggerButtonClasses: string
  minWidthClassName: string
}) {
  const comfort = size === "comfortable"
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const selectedLabel = useMemo(() => {
    if (placeholderOption && value === placeholderOption.value) {
      return placeholderOption.label
    }
    const hit = options.find((o) => o.value === value)
    return hit?.label
  }, [value, options, placeholderOption])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (label: string, val: string) => {
      if (!q) return true
      return (
        label.toLowerCase().includes(q) || val.toLowerCase().includes(q)
      )
    }
    const opts = options.filter((o) => match(o.label, o.value))
    const placeholderVisible =
      placeholderOption &&
      match(placeholderOption.label, placeholderOption.value)
    return { options: opts, placeholderVisible }
  }, [options, placeholderOption, query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  const showTriggerText =
    selectedLabel ??
    (value ? value : placeholder)

  const ringOpen = open
    ? variant === "rounded"
      ? "border-primary ring-2 ring-primary/10"
      : "border-primary ring-2 ring-ring/40"
    : ""

  return (
    <div
      ref={containerRef}
      className={cn("relative max-w-full shrink-0", minWidthClassName, className)}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen((prev) => {
            const next = !prev
            if (next) setQuery("")
            return next
          })
        }
        className={cn(
          triggerButtonClasses,
          selectClassName,
          ringOpen,
          !selectedLabel && value === "" && "text-muted-foreground"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate pr-3">{showTriggerText}</span>
        <ChevronDown
          className={cn(
            comfort ? "size-5" : "size-4",
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border bg-background shadow-xl">
          <div className={cn("border-b", comfort ? "p-3" : "p-2")}>
            <div className="relative">
              <Search
                className={cn(
                  "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
                  comfort ? "left-3 size-5" : "left-2.5 size-4"
                )}
              />
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari…"
                className={cn(
                  comfort ? "h-11 pl-11 text-base" : "h-9 pl-8",
                  variant === "rounded" && "rounded-xl"
                )}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false)
                    setQuery("")
                  }
                }}
              />
            </div>
          </div>
          <div
            className={cn(
              "overflow-y-auto py-1",
              comfort ? "max-h-80" : "max-h-64"
            )}
          >
            {filtered.placeholderVisible && placeholderOption ? (
              <button
                type="button"
                disabled={placeholderOption.disabled}
                onClick={() => {
                  if (placeholderOption.disabled) return
                  onChange(placeholderOption.value)
                  setOpen(false)
                  setQuery("")
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 text-left hover:bg-muted/50",
                  comfort ? "py-3.5 text-base" : "py-3 text-sm",
                  placeholderOption.disabled && "pointer-events-none opacity-50"
                )}
              >
                <span className="min-w-0 flex-1 text-left break-words pr-2">
                  {placeholderOption.label}
                </span>
                <Check
                  className={cn(
                    comfort ? "size-5" : "size-4",
                    "shrink-0 text-primary transition-opacity",
                    value === placeholderOption.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            ) : null}
            {filtered.options.length ? (
              filtered.options.map((option) => {
                const checked = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) return
                      onChange(option.value)
                      setOpen(false)
                      setQuery("")
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 text-left hover:bg-muted/50",
                      comfort ? "py-3.5 text-base" : "py-3 text-sm",
                      option.disabled && "pointer-events-none opacity-50"
                    )}
                  >
                    <span className="min-w-0 flex-1 text-left break-words pr-2">
                      {option.label}
                    </span>
                    <Check
                      className={cn(
                        comfort ? "size-5" : "size-4",
                        "shrink-0 text-primary transition-opacity",
                        checked ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                )
              })
            ) : (
              <div
                className={cn(
                  "px-4 py-3 text-muted-foreground",
                  comfort ? "text-base" : "text-sm"
                )}
              >
                Tidak ada hasil.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

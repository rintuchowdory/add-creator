"use client"

import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Brand } from "@/lib/brand"

type Props = {
  brand: Brand
  onChange: (brand: Brand) => void
}

export function BrandKitPanel({ brand, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const filled = Object.values(brand).filter((v) => v?.trim()).length

  const set = (key: keyof Brand, value: string) => onChange({ ...brand, [key]: value })

  return (
    <div className="rounded-3xl border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-zinc-800/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-200">
          <Sparkles className="h-4 w-4 text-[#0071e3]" />
          Brand-Kit
          {filled > 0 && (
            <span className="rounded-full bg-[#0071e3]/20 px-2 py-0.5 text-[11px] font-medium text-[#5aa9f5]">
              {filled} Feld{filled === 1 ? "" : "er"}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-zinc-800/80 pt-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Wird in Storyboard und Bilder übernommen. Bleibt lokal im Browser gespeichert.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Markenname"
              value={brand.name}
              onChange={(e) => set("name", e.target.value)}
              className="bg-zinc-950/60 border-zinc-700/60 text-white placeholder:text-zinc-500 rounded-2xl"
            />
            <Input
              placeholder="Zielgruppe (z. B. Handwerksbetriebe)"
              value={brand.audience}
              onChange={(e) => set("audience", e.target.value)}
              className="bg-zinc-950/60 border-zinc-700/60 text-white placeholder:text-zinc-500 rounded-2xl"
            />
            <Input
              placeholder="Tonalität (z. B. ruhig, sachlich)"
              value={brand.tone}
              onChange={(e) => set("tone", e.target.value)}
              className="bg-zinc-950/60 border-zinc-700/60 text-white placeholder:text-zinc-500 rounded-2xl"
            />
            <Input
              placeholder="Markenfarben (z. B. Petrol, Sand)"
              value={brand.colors}
              onChange={(e) => set("colors", e.target.value)}
              className="bg-zinc-950/60 border-zinc-700/60 text-white placeholder:text-zinc-500 rounded-2xl"
            />
          </div>
          <Input
            placeholder="Was macht dich besser als die Konkurrenz?"
            value={brand.usp}
            onChange={(e) => set("usp", e.target.value)}
            className="bg-zinc-950/60 border-zinc-700/60 text-white placeholder:text-zinc-500 rounded-2xl"
          />
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => onChange({ name: "", audience: "", tone: "", colors: "", usp: "" })}
              className="text-xs text-zinc-400 hover:text-white rounded-full"
            >
              Felder leeren
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

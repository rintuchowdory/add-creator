"use client"

import { useState } from "react"
import { Copy, Loader2, PenLine, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Brand } from "@/lib/brand"

type CopyResult = {
  headline: string
  subline: string
  cta: string
  hashtags: string[]
  keywords: string[]
  variants: { title: string; body: string; cta: string }[]
}

type Props = {
  product: string
  brand: Brand
  onUseInPrompt: (text: string) => void
}

export function CopyStudio({ product, brand, onUseInPrompt }: Props) {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState("Instagram")
  const [language, setLanguage] = useState("de")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CopyResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          audience: brand.audience,
          tone: brand.tone,
          platform,
          language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.details || data?.error || "Texterstellung fehlgeschlagen")
      setResult(data as CopyResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Texterstellung fehlgeschlagen")
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  const fullText = (c: CopyResult) =>
    [c.headline, c.subline, c.cta, c.hashtags?.join(" ")].filter(Boolean).join("\n")

  return (
    <div className="rounded-3xl border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-zinc-800/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-200">
          <PenLine className="h-4 w-4 text-[#0071e3]" />
          Copy-Studio
        </span>
        <span className="text-xs text-zinc-400">{open ? "schließen" : "Anzeigentext schreiben"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-zinc-800/80 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-zinc-950/60 border border-zinc-700/60 text-zinc-200 text-xs rounded-full px-3 py-2"
            >
              {["Instagram", "LinkedIn", "Facebook", "TikTok", "E-Mail", "Kleinanzeigen"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-950/60 border border-zinc-700/60 text-zinc-200 text-xs rounded-full px-3 py-2"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
            <Button
              onClick={generate}
              disabled={loading || !product.trim()}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full h-9 px-4 text-xs font-semibold"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Texte generieren"}
            </Button>
            {!product.trim() && <span className="text-xs text-zinc-500">erst Produkt beschreiben</span>}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {result && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-4 space-y-1.5">
                <p className="text-lg font-semibold text-white leading-tight">{result.headline}</p>
                <p className="text-sm text-zinc-300">{result.subline}</p>
                <p className="text-xs font-semibold text-[#5aa9f5] uppercase tracking-wide">{result.cta}</p>
                {result.hashtags?.length > 0 && (
                  <p className="text-xs text-zinc-500 pt-1">{result.hashtags.join(" ")}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => copyText(fullText(result), "main")}
                    className="h-8 px-3 text-xs text-zinc-300 hover:text-white rounded-full"
                  >
                    {copied === "main" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="ml-1.5">kopieren</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onUseInPrompt(`${result.headline}. ${result.subline}`)}
                    className="h-8 px-3 text-xs text-zinc-300 hover:text-white rounded-full"
                  >
                    in Prompt übernehmen
                  </Button>
                </div>
              </div>

              {result.variants?.map((v, i) => (
                <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3.5 space-y-1">
                  <p className="text-sm font-semibold text-zinc-100">{v.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{v.body}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#5aa9f5]">{v.cta}</span>
                    <button
                      onClick={() => copyText(`${v.title}\n${v.body}\n${v.cta}`, `v${i}`)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      {copied === `v${i}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { NextResponse } from "next/server"
import { aiText, extractJson } from "@/lib/ai-text"

export const maxDuration = 60

type CopyResult = {
  headline: string
  subline: string
  cta: string
  hashtags: string[]
  keywords: string[]
  variants: { title: string; body: string; cta: string }[]
}

export async function POST(req: Request) {
  try {
    const { product, audience, tone, platform, language } = await req.json()

    if (!product || typeof product !== "string") {
      return NextResponse.json({ error: "product is required" }, { status: 400 })
    }

    const lang = language === "en" ? "English" : "German"
    const prompt = `You are a senior ad copywriter. Write ad copy in ${lang}.

Product / offer: ${product}
Target audience: ${audience || "general consumers"}
Tone: ${tone || "confident, clear"}
Platform: ${platform || "Instagram"}

Return STRICT JSON with this exact shape:
{
  "headline": "max 6 words, punchy",
  "subline": "one sentence, benefit-driven",
  "cta": "2-4 words call to action",
  "hashtags": ["6 to 8 relevant hashtags without spaces, each starting with #"],
  "keywords": ["5 SEO keywords"],
  "variants": [
    { "title": "max 5 words", "body": "max 2 sentences", "cta": "2-4 words" },
    { "title": "...", "body": "...", "cta": "..." },
    { "title": "...", "body": "...", "cta": "..." }
  ]
}

Rules: no emoji, no lorem ipsum, no invented prices or certifications, no unprovable superlatives. Return JSON only.`

    const raw = await aiText(prompt, { json: true, maxTokens: 1200, temperature: 0.9 })
    return NextResponse.json(extractJson<CopyResult>(raw))
  } catch (error) {
    console.error("[copy] failed:", error)
    return NextResponse.json(
      { error: "Failed to generate copy", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

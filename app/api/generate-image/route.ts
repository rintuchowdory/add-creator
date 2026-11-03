import { NextResponse } from "next/server"
import { generateImage } from "@/lib/ai-image"
import { publishImage } from "@/lib/publish-image"

export const maxDuration = 120

const SIZES: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "9:16": { width: 768, height: 1344 },
  "16:9": { width: 1344, height: 768 },
  "4:5": { width: 896, height: 1120 },
  "1.91:1": { width: 1200, height: 628 },
}

export async function POST(req: Request) {
  try {
    const { prompt, style, productIdentity, aspectRatio, seed } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const size = SIZES[aspectRatio as string] ?? SIZES["1:1"]

    const parts = [prompt]
    if (productIdentity) parts.push(`Product identity that must stay identical: ${productIdentity}`)
    if (style) parts.push(`Visual style: ${style}`)
    parts.push(
      "Professional advertising keyframe, clean composition, high detail, commercial photography lighting. No text overlays, no watermark.",
    )
    const finalPrompt = parts.join("\n\n")

    const image = await generateImage({
      prompt: finalPrompt,
      width: size.width,
      height: size.height,
      seed: typeof seed === "number" ? seed : undefined,
    })

    const imageUrl = await publishImage(image.bytes, image.mediaType)

    return NextResponse.json({ imageUrl, description: "", provider: image.provider })
  } catch (error) {
    console.error("[generate-image] failed:", error)
    return NextResponse.json(
      { error: "Failed to generate image", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

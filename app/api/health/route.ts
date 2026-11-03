import { NextResponse } from "next/server"
import { imageProviders } from "@/lib/ai-image"

export const dynamic = "force-dynamic"

export async function GET() {
  const providers = imageProviders()
  return NextResponse.json({
    ok: true,
    image: { active: providers[0], chain: providers },
    text: {
      provider: process.env.GROQ_API_KEY ? "groq" : process.env.DISABLE_WORKER ? "vercel-ai-gateway" : "cloudflare-worker (groq)",
    },
    storage: process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "inline-data-url",
    timestamp: new Date().toISOString(),
  })
}

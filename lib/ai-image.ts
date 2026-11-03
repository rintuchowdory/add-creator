export type GeneratedImage = {
  bytes: Uint8Array
  mediaType: string
  provider: string
}

export function imageProviders(): string[] {
  const list: string[] = []
  if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) list.push("cloudflare")
  if (process.env.FAL_KEY) list.push("fal")
  list.push("pollinations")
  return list
}

function b64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"))
}

type GenOpts = { prompt: string; width?: number; height?: number; seed?: number }

async function viaCloudflare(o: GenOpts): Promise<GeneratedImage> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: o.prompt, steps: 4 }),
    },
  )
  const json = await res.json()
  const b64 = json?.result?.image
  if (!res.ok || !b64) throw new Error(`cloudflare ${res.status}: ${JSON.stringify(json).slice(0, 180)}`)
  return { bytes: b64ToBytes(b64), mediaType: "image/jpeg", provider: "cloudflare" }
}

async function viaFal(o: GenOpts): Promise<GeneratedImage> {
  const { fal } = await import("@fal-ai/client")
  fal.config({ credentials: process.env.FAL_KEY })
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: o.prompt,
      image_size: { width: o.width ?? 1024, height: o.height ?? 1024 },
      num_images: 1,
    },
  })
  const url = (result.data as { images?: { url: string }[] })?.images?.[0]?.url
  if (!url) throw new Error("fal returned no image")
  const res = await fetch(url)
  return { bytes: new Uint8Array(await res.arrayBuffer()), mediaType: "image/jpeg", provider: "fal" }
}

async function viaPollinations(o: GenOpts): Promise<GeneratedImage> {
  const seed = o.seed ?? Math.floor(Math.random() * 1_000_000)
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(o.prompt)}` +
    `?width=${o.width ?? 1024}&height=${o.height ?? 1024}&model=flux&nologo=true&seed=${seed}`
  const res = await fetch(url, { headers: { accept: "image/jpeg" } })
  if (!res.ok) throw new Error(`pollinations ${res.status}`)
  return {
    bytes: new Uint8Array(await res.arrayBuffer()),
    mediaType: res.headers.get("content-type") ?? "image/jpeg",
    provider: "pollinations",
  }
}

/** Tries every configured provider in order and returns the first usable image. */
export async function generateImage(o: GenOpts): Promise<GeneratedImage> {
  const errors: string[] = []
  for (const provider of imageProviders()) {
    try {
      if (provider === "cloudflare") return await viaCloudflare(o)
      if (provider === "fal") return await viaFal(o)
      if (provider === "pollinations") return await viaPollinations(o)
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  throw new Error(`Alle Bild-Provider fehlgeschlagen -> ${errors.join(" | ")}`)
}

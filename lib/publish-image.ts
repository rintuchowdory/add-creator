import { put } from "@vercel/blob"

/**
 * Stores a generated image. Uses Vercel Blob when a token exists, otherwise
 * returns a data URL so the app works without any storage configuration.
 */
export async function publishImage(bytes: Uint8Array, mediaType: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const ext = mediaType.includes("png") ? "png" : "jpg"
      const name = `ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { url } = await put(name, Buffer.from(bytes), { access: "public", contentType: mediaType })
      return url
    } catch (error) {
      console.error("[publishImage] blob upload failed, falling back to data URL:", error)
    }
  }
  return `data:${mediaType};base64,${Buffer.from(bytes).toString("base64")}`
}

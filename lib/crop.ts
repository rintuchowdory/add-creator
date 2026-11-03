/** Centre-crops an image data URL to the requested aspect ratio. */
export function cropToRatio(dataUrl: string, ratio: number): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(dataUrl)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const current = img.width / img.height
      if (Math.abs(current - ratio) < 0.02) return resolve(dataUrl)

      let sx = 0
      let sy = 0
      let sw = img.width
      let sh = img.height

      if (current > ratio) {
        sw = Math.round(img.height * ratio)
        sx = Math.round((img.width - sw) / 2)
      } else {
        sh = Math.round(img.width / ratio)
        sy = Math.round((img.height - sh) / 2)
      }

      const canvas = document.createElement("canvas")
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
      try {
        resolve(canvas.toDataURL("image/jpeg", 0.92))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export const RATIOS: { value: string; label: string; ratio: number }[] = [
  { value: "1:1", label: "1:1 Feed", ratio: 1 },
  { value: "4:5", label: "4:5 Portrait", ratio: 4 / 5 },
  { value: "9:16", label: "9:16 Story", ratio: 9 / 16 },
  { value: "16:9", label: "16:9 YouTube", ratio: 16 / 9 },
  { value: "1.91:1", label: "1.91:1 LinkedIn", ratio: 1.91 },
]

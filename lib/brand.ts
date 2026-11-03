export type Brand = {
  name: string
  audience: string
  tone: string
  colors: string
  usp: string
}

export const EMPTY_BRAND: Brand = { name: "", audience: "", tone: "", colors: "", usp: "" }

const KEY = "adcreator_brand_v1"

export function loadBrand(): Brand {
  if (typeof window === "undefined") return EMPTY_BRAND
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY_BRAND
    return { ...EMPTY_BRAND, ...(JSON.parse(raw) as Partial<Brand>) }
  } catch {
    return EMPTY_BRAND
  }
}

export function saveBrand(brand: Brand) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(brand))
  } catch {
    /* storage full or blocked: the kit just stays session-only */
  }
}

/** Short brand briefing that is appended to every prompt. */
export function brandBriefing(brand: Brand): string {
  const bits: string[] = []
  if (brand.name) bits.push(`Marke: ${brand.name}`)
  if (brand.audience) bits.push(`Zielgruppe: ${brand.audience}`)
  if (brand.tone) bits.push(`Tonalität: ${brand.tone}`)
  if (brand.colors) bits.push(`Markenfarben: ${brand.colors}`)
  if (brand.usp) bits.push(`Alleinstellungsmerkmal: ${brand.usp}`)
  return bits.length ? `Marken-Vorgaben (bitte einhalten):\n${bits.join("\n")}` : ""
}

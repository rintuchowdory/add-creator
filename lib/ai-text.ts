/** Text generation: Groq when GROQ_API_KEY is present, Vercel AI Gateway otherwise. */
export async function aiText(
  prompt: string,
  opts: { json?: boolean; maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (key) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        temperature: opts.temperature ?? 0.8,
        max_tokens: opts.maxTokens ?? 2600,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    })
    const json = await res.json()
    const text = json?.choices?.[0]?.message?.content
    if (!res.ok || !text) throw new Error(`groq ${res.status}: ${JSON.stringify(json).slice(0, 200)}`)
    return text
  }

  // No local Groq key: use the Cloudflare worker that holds the secret.
  if (!process.env.DISABLE_WORKER) {
    try {
      const { WORKER_BASE } = await import("./ai-image")
      const res = await fetch(`${WORKER_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          json: opts.json,
          max_tokens: opts.maxTokens ?? 2600,
          temperature: opts.temperature ?? 0.8,
        }),
      })
      const json = await res.json()
      if (res.ok && json?.text) return json.text as string
      throw new Error(`worker ${res.status}: ${JSON.stringify(json).slice(0, 160)}`)
    } catch (error) {
      console.warn("[aiText] worker failed, trying AI gateway:", error)
    }
  }

  const { generateText } = await import("ai")
  const result = await generateText({ model: process.env.TEXT_MODEL || "openai/gpt-4o-mini", prompt })
  return result.text
}

export function extractJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("No JSON found in AI response")
    return JSON.parse(match[0]) as T
  }
}

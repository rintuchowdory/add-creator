const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...CORS } })

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS })

    if (url.pathname === "/health") {
      return json({ ok: true, ai: Boolean(env.AI), groq: Boolean(env.GROQ_API_KEY), service: "add-creator-api" })
    }

    if (url.pathname === "/image" && request.method === "POST") {
      try {
        const body = await request.json()
        if (!body?.prompt) return json({ error: "prompt required" }, 400)

        // flux-1-schnell only accepts prompt + steps; aspect ratios are handled client-side
        const input = { prompt: body.prompt, steps: body.steps ?? 4 }

        const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", input)
        const image = result?.image
        if (!image) return json({ error: "no image returned", raw: Object.keys(result || {}) }, 502)

        return json({ image, mediaType: "image/jpeg", provider: "cloudflare-worker" })
      } catch (error) {
        return json({ error: String(error?.message || error) }, 500)
      }
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const body = await request.json()
        if (!Array.isArray(body?.messages) || body.messages.length === 0) {
          return json({ error: "messages required" }, 400)
        }
        if (!env.GROQ_API_KEY) return json({ error: "GROQ_API_KEY not configured" }, 500)

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: body.model || "openai/gpt-oss-120b",
            temperature: body.temperature ?? 0.8,
            max_tokens: body.max_tokens ?? 2600,
            ...(body.json ? { response_format: { type: "json_object" } } : {}),
            messages: body.messages,
          }),
        })
        const data = await res.json()
        const text = data?.choices?.[0]?.message?.content
        if (!res.ok || !text) return json({ error: "groq failed", details: data }, 502)
        return json({ text, model: data.model })
      } catch (error) {
        return json({ error: String(error?.message || error) }, 500)
      }
    }

    return json({ error: "not found", routes: ["/health", "/image", "/chat"] }, 404)
  },
}

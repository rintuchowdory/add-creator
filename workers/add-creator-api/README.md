# add-creator-api (Cloudflare Worker)

Proxy that keeps the provider secrets out of Vercel:
flux-1-schnell via the `AI` binding, Groq via the `GROQ_API_KEY` secret.

    npx wrangler deploy
    npx wrangler secret put GROQ_API_KEY

Routes: `GET /health`, `POST /image` `{prompt}`, `POST /chat` `{messages, json?, max_tokens?}`.
The Next app talks to it through `WORKER_BASE` in `lib/ai-image.ts`
(override with the `ADD_CREATOR_API` env var, disable with `DISABLE_WORKER=1`).

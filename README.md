# AI Ad Creator

Next.js 15 ad studio. Product description -> storyboard -> keyframes -> 8s video.

## Image providers (tried in this order)

1. **Cloudflare Workers AI** – `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` (free tier, flux-1-schnell)
2. **fal.ai** – `FAL_KEY` (optional, needed for video)
3. **Pollinations** – no key, always available fallback

## Text

`GROQ_API_KEY` (Groq) with the Vercel AI Gateway as fallback.

## Endpoints

- `GET /api/health` – which provider is active
- `POST /api/copy` – ad copy, hashtags, 3 variants (German by default)
- `POST /api/generate-image` – keyframe, `aspectRatio` = 1:1 | 9:16 | 16:9 | 4:5 | 1.91:1
- `POST /api/generate-storyboard` – 3-scene storyboard
- `POST /api/generate-moment-image` – single scene image
- `POST /api/generate-video` – 8s video (requires `FAL_KEY`)

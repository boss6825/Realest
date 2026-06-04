# Realest — Frontend

Next.js (App Router) + Tailwind, styled with the **VoiceBox** editorial design
system. Maps via Leaflet + OpenStreetMap (no API key). Deploys to Vercel.

## Local setup

```bash
cd frontend
cp .env.example .env.local      # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev                     # http://localhost:3000
```

The backend must be running (default `http://localhost:4000`) for auth,
listings, and the map data to work.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — what Realest is |
| `/signup` · `/login` | Dealer auth |
| `/verify-email` | Landing after clicking the email verification link |
| `/dashboard` | Your listings (edit / delete) |
| `/listings/new` | Add a listing (tap-on-map) · `?id=` to edit |
| `/explore` | Map + filters (price, type, road-facing) — the core feature |
| `/listings/[id]` | Detail, reveal-contact, and the lightweight deal room |

## Notes

- All API calls go to `NEXT_PUBLIC_API_URL` with `credentials: 'include'` so the
  cross-domain auth cookie rides along.
- Map components are client-only and loaded via `next/dynamic` with
  `ssr: false` (Leaflet needs `window`).
- Photos are pasted URLs (v1 has no upload pipeline) and rendered with plain
  `<img>` tags, so no image-domain config is required.

## Deploy to Vercel

1. Import the repo, set the project root to `frontend`.
2. Add env var `NEXT_PUBLIC_API_URL` = your Railway backend URL.
3. Deploy. Then set the backend's `FRONTEND_URL` to this Vercel URL so CORS +
   cookies line up.

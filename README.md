# Realest

**A dealer-to-dealer property network for India.** Not a consumer portal — a B2B
tool that lets property dealers share inventory and co-broker deals across
districts. Dealer A lists a plot; Dealer B, working a different area, discovers
it on a map, filters by what their buyer wants, and connects to split the
commission.

> The single most important feature is **discovery** — finding inventory in an
> area you don't operate in. Everything else supports it.

## Monorepo layout

```
.
├── backend/    Express API · Drizzle ORM · Neon Postgres   → Railway
├── frontend/   Next.js (App Router) · Tailwind · Leaflet    → Vercel
├── .env.example   All env vars in one place
└── voicebox-DESIGN.md   The design system the frontend follows
```

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js on Vercel |
| Backend | Express (standard Node) on Railway |
| Database | Neon Postgres via `pg` + Drizzle ORM |
| Auth | email/password, bcrypt, JWT in an httpOnly cookie |
| Email | Resend (email verification) |
| Maps | Leaflet + OpenStreetMap (no API key) |
| Design | VoiceBox — bold editorial, black/white + one red accent |

## Quick start (local)

You need a free [Neon](https://neon.tech) database. Resend is optional locally
(verification links print to the backend console).

```bash
# 1. Backend
cd backend
cp ../.env.example .env        # fill in DATABASE_URL + JWT_SECRET
npm install
npm run db:push                # create tables in Neon
npm run dev                    # → http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                    # → http://localhost:3000
```

Open http://localhost:3000, sign up, grab the verification link from the backend
console, verify, log in, add a listing, and explore the map.

## How it fits together

1. **Auth** — signup hashes the password (bcrypt), stores the user unverified,
   and emails a Resend verification link. `/auth/verify` flips the flag and
   redirects back to the frontend. Login issues a JWT in an httpOnly cookie.
2. **Listings** — authed dealers create/edit/delete listings with a
   tap-on-map location. `GET /listings` (public) powers the map and supports
   `?minPrice&maxPrice&type&roadFacing` filters.
3. **Discovery** — `/explore` renders every listing as a pin with filters and a
   synced results list.
4. **Deal coordination** — the detail page reveals the dealer's contact and
   offers a lightweight per-listing message thread.

## The cross-domain cookie gotcha (read this)

Frontend (Vercel) and backend (Railway) are **different domains**, so the auth
cookie only survives if, in production:

- the cookie is set `httpOnly; SameSite=None; Secure`,
- CORS echoes the **exact** `FRONTEND_URL` with `credentials: true`,
- Express has `trust proxy` enabled (Railway terminates TLS at a proxy),
- the frontend fetches with `credentials: 'include'`.

All four are wired up. Locally it falls back to `SameSite=Lax`. Set
`FRONTEND_URL` (backend) and `NEXT_PUBLIC_API_URL` (frontend) to the deployed
URLs after first deploy.

## Deploy

- **Backend → Railway:** root dir `backend`, add the env vars, run
  `npm run db:push` once against the prod DB. See `backend/README.md`.
- **Frontend → Vercel:** root dir `frontend`, set `NEXT_PUBLIC_API_URL`. See
  `frontend/README.md`.

## API reference

See [`backend/README.md`](backend/README.md) for the full route table.

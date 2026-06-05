# Realest — Backend API

Express + Drizzle ORM + Neon Postgres. Deploys to Railway.

## Stack

- **Express** (standard Node, full TCP — works on Railway, unlike serverless edges)
- **Neon Postgres** via the `pg` driver + a single shared connection `Pool`
- **Drizzle ORM** for schema + queries
- **bcryptjs** password hashing, **JWT** in an httpOnly cookie
- **Resend** for email verification

## Local setup

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL + JWT_SECRET (others optional)
npm install
npm run db:push             # sync the schema to your Neon database
npm run dev                 # http://localhost:4000
```

Leave `RESEND_API_KEY` empty locally — verification links are printed to the
server console so you can verify accounts without sending real email.

## Database

- `npm run db:push` — push the schema straight to Neon (fastest for MVP/dev).
- `npm run db:generate` — generate SQL migrations into `./drizzle`.
- `npm run db:migrate` — apply generated migrations (use in production).
- `npm run db:studio` — open Drizzle Studio.

## API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/signup` | — | Create unverified user, send verify email |
| GET | `/auth/verify?token=` | — | Mark verified, redirect to frontend |
| POST | `/auth/login` | — | Check verified, set JWT cookie |
| POST | `/auth/logout` | — | Clear cookie |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/listings` | — | All listings; `?minPrice&maxPrice&type&roadFacing` |
| GET | `/listings/mine` | ✓ | The current dealer's listings |
| GET | `/listings/:id` | — | Detail + dealer contact |
| POST | `/listings` | ✓ | Create listing |
| PATCH | `/listings/:id` | ✓ (owner) | Update listing |
| DELETE | `/listings/:id` | ✓ (owner) | Delete listing |
| GET | `/messages/:listingId` | ✓ | Your thread on a listing |
| POST | `/messages` | ✓ | Send a message |

## Deploy to Railway

1. New project → Deploy from the `backend` folder (set the root directory).
2. Add the environment variables from `.env.example` (set `NODE_ENV=production`,
   `FRONTEND_URL` to your Vercel URL, `BACKEND_URL` to the Railway URL).
3. Railway runs `npm install` then `npm start`.
4. Run `npm run db:push` once (locally pointed at the prod `DATABASE_URL`, or via
   a Railway one-off command) to create the tables.

### The cross-domain cookie gotcha

Frontend (Vercel) and backend (Railway) are different domains, so in production
the JWT cookie is set `SameSite=None; Secure` and CORS echoes the exact
`FRONTEND_URL` with `credentials: true`. `trust proxy` is enabled so Express
honours the proxy's HTTPS. Locally it falls back to `SameSite=Lax`.

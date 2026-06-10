# MavunoPay Backend (Next.js)

Simple prototype backend for MavunoPay implementing core REST API endpoints.

Run locally:

```bash
cd backend
npm install
npm run dev
```

APIs:
- `POST /api/register` — create a farmer (phone number required)
- `GET /api/goals?farmerId=` — list goals
- `POST /api/goals` — create a goal (farmerId, name, targetAmount)
- `POST /api/webhook` — webhook to simulate incoming payment and allocation
- `GET /api/health` — health check

This is a minimal prototype using file-based JSON storage (`data/db.json`). Replace with a real DB in production.

Environment:
- Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` from the Supabase dashboard.
- Use the **Session pooler** connection string (recommended for Vercel). Encode `@` in passwords as `%40`.
- Test connectivity: `npm run test:supabase` (from repo root).


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
- Create `.env.local` with `STELLAR_OPS_ACCOUNT_SECRET`, `DATABASE_URL`, and other secrets as needed.
- If your password contains special characters such as `@`, encode it as `%40` in `DATABASE_URL`.
- Example:
  `postgresql://postgres:Winnerbonnie%402004@db.llebclfooyrcjrqewzdl.supabase.co:5432/postgres`


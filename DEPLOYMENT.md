# Deploying MavunoPay to Vercel (frontend + backend + Soroban contract)

This repository contains three parts:
- Frontend (Vite + TanStack) at the repo root
- Backend (Next.js API routes) in the `backend/` folder
- Soroban smart contract in `backend/soroban`

Recommended approach: create two Vercel projects (one for the `backend` Next.js app, one for the frontend), then wire the frontend's `/api` requests to the backend (either via VITE_BACKEND_URL env var or Vercel Rewrites).

Quick steps

1. Build the Soroban contract (locally)

```bash
cd backend/soroban
./deploy.sh   # builds the WASM and runs contract tests
```

Copy the resulting contract ID into your backend environment as `SOROBAN_CONTRACT_ID` after you deploy the contract to testnet.

2. Deploy the backend (Next.js) to Vercel

- Create a new Vercel project, set the project root to `backend/`.
- In Vercel project settings, add the environment variables from `.env.example` (at minimum: `NODE_ENV`, `STELLAR_NETWORK`, `KEY_VAULT_PROVIDER`, `SOROBAN_CONTRACT_ID`, and any Supabase or DB credentials).
- Vercel will detect Next.js and deploy the API routes under `/api/*` on your backend deployment URL (e.g. https://mavunopay-backend.vercel.app).

3. Deploy the frontend to Vercel

Option A (recommended): Deploy frontend as its own project and point `VITE_BACKEND_URL` to the backend URL

- Create a new Vercel project, set project root to repo root (or a dedicated `frontend/` folder if you restructure).
- Set the Build Command to `npm run build` and the Output Directory to `dist/client`.
- Add environment variable `VITE_BACKEND_URL` set to your backend URL (for example, `https://mavunopay-backend.vercel.app`). This makes frontend API calls go to the backend.

Option B: Keep same-origin `/api` paths using Vercel Rewrites

- If you want the frontend to call `/api/*` and have Vercel proxy those to your backend deployment, add a `vercel.json` to the frontend project with a rewrite like:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<your-backend>.vercel.app/api/:path*" }
  ]
}
```

Replace `<your-backend>` with the actual backend deployment hostname.

4. Post-deploy

- Set `SOROBAN_CONTRACT_ID` in the backend Vercel project's env variables.
- Verify endpoints:
  - `GET https://<backend>/api/health` should return status `ok`
  - `POST https://<backend>/api/register` etc.
- Deploy the frontend project and verify flows at `/signup`, `/login`, `/dashboard`.

Notes and troubleshooting

- We updated the frontend to use relative `/api` paths when `VITE_BACKEND_URL` is empty — either set `VITE_BACKEND_URL` to your backend URL or configure rewrites on Vercel.
- If you see 404s for API routes, ensure the backend project was deployed and that rewrites or `VITE_BACKEND_URL` are configured correctly.
- For Soroban contract invocation, the backend expects `SOROBAN_CONTRACT_ID` and `SOROBAN_RPC_URL` to be set.

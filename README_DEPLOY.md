Quick deploy guide

This repo contains a Next.js frontend and an Express/MongoDB backend.

Recommended minimal deployment (fast, free/low-cost):
- Frontend: Vercel (recommended for Next.js)
- Backend: Railway / Render (simple Node deployments)
- Database: MongoDB Atlas (free tier)

1) Provision MongoDB Atlas
   - Create a free cluster and a database user.
   - Whitelist your app (0.0.0.0/0 for testing) and copy the connection string.
   - Update `backend/.env` (create from `.env.example`) with `MONGODB_URI` and `JWT_SECRET`.

2) Deploy backend to Railway or Render
   - Create a new project and link your repo.
   - Set environment variables in the provider using values from `backend/.env.example`.
   - Start the service (it will install deps and start the server with `npm start` or `npm run start`).
   - Verify the API is reachable (GET /api/projects).

3) Deploy frontend to Vercel
   - Import the `frontend` folder as a new project.
   - Set the environment variable `NEXT_PUBLIC_API_URL` to your backend URL (e.g., https://api.example.com).
   - Deploy and verify the site.

4) DNS & SSL
   - Add a domain in Vercel for the frontend and configure DNS as instructed.
   - For custom domains on backend, configure provider-managed TLS or use a reverse proxy with Let's Encrypt.

Notes and troubleshooting
- If your backend is behind a prefix (e.g., /api), set `NEXT_PUBLIC_API_URL` accordingly (e.g., https://api.example.com/api).
- For production, don't use 0.0.0.0/0 for MongoDB; restrict to necessary IPs and use strong credentials.
- Replace the demo client-side auth with server-side endpoints that hash passwords and issue tokens before going public.

If you'd like, I can also generate Dockerfiles, a `docker-compose.yml`, or GitHub Actions for CI/CD. Tell me which next.

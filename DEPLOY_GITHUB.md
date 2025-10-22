Deploying with GitHub + Vercel (frontend) + Railway (backend)

This guide walks through connecting your repo to GitHub, enabling CI, and deploying the frontend and backend using Vercel and Railway.

1) Push repository to GitHub
   - Create a new repository on GitHub and push the current code (root) to it.

2) GitHub Actions
   - I included two simple workflows:
     - `.github/workflows/backend-ci.yml` (runs on backend changes)
     - `.github/workflows/frontend-ci.yml` (runs on frontend changes)
   - These run type-check, build, and tests (if present). They also build a Docker image for the backend (not pushed by default).

3) Deploy backend to Railway
   - Sign in to Railway and create a new project -> Deploy from GitHub.
   - Select your repo and the `backend/` folder as the service root.
   - Add environment variables in Railway (from `backend/.env.example`): `MONGODB_URI`, `PORT`, `JWT_SECRET`.
   - Deploy and note the service domain (e.g., `https://your-backend.up.railway.app`).

4) Deploy frontend to Vercel
   - Log in to Vercel and create a new project -> Import from GitHub.
   - Select the `frontend/` directory as the project root.
   - Add the environment variable `NEXT_PUBLIC_API_URL` with the Railway backend URL.
   - Deploy; Vercel will build and provide a domain like `https://your-frontend.vercel.app`.

5) Configure DNS (optional)
   - Add custom domains in Vercel and Railway if needed; follow provider instructions for DNS records.

6) Secrets & security
   - Store secrets only in the provider environment variables or GitHub Secrets for Actions.
   - Recommended GitHub secrets (if you push Docker images or perform deploys from Actions): `GHCR_TOKEN`, `DOCKERHUB_USER`, `DOCKERHUB_TOKEN`.

If you'd like, I can:
- Add a `docker-compose.yml` for local testing.
- Add a GitHub Action that builds and publishes backend Docker images to GHCR.
- Create Vercel / Railway specific configuration files (vercel.json, railway.json) if you want more control.

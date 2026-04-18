@AGENTS.md

## Deployment Notes

Use remote build and deploy for this project.

- Preferred command: `./deploy.sh`
- Do not use `npm run build` locally unless absolutely necessary. This machine is resource-constrained, and local Next.js production builds can saturate RAM and disk.

## What Broke Before

The previous deployment attempt failed for several separate reasons:

1. Local build artifacts filled the machine.
- A large `.next` directory had accumulated in the repo and contributed to disk pressure.
- Local production build on this machine is not the recommended path.

2. Cloud Build failed on `npm ci`.
- `package.json` and `package-lock.json` were out of sync.
- Symptom: missing packages from the lockfile during Docker build.

3. Prisma generate failed because the schema datasource was incomplete.
- `prisma/schema.prisma` needs:
  `url = env("DATABASE_URL")`

4. Prisma packages were on mismatched major/minor versions.
- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- These must stay aligned. They were fixed to `7.7.0`.

5. Cloud Build was using the default `global` region.
- `deploy.sh` was updated to pass `--region europe-west1` to `gcloud builds submit`.
- Cloud Run already targeted `europe-west1`.
- This was not the root cause of the earlier failures, but it should stay consistent.

## Rules For Future Deploys

- Deploy with `./deploy.sh`
- Keep Prisma package versions aligned
- Keep `package-lock.json` in sync with `package.json`
- Do not remove `url = env("DATABASE_URL")` from `prisma/schema.prisma`
- Avoid local production builds when remote Cloud Build is available

## If Deploy Fails Again

Check in this order:

1. `package.json` and `package-lock.json` are synchronized
2. `prisma`, `@prisma/client`, and `@prisma/adapter-pg` are on matching versions
3. `prisma/schema.prisma` still contains `url = env("DATABASE_URL")`
4. `deploy.sh` still uses `europe-west1` for both Cloud Build and Cloud Run
5. Required secrets and env vars exist in Cloud Run

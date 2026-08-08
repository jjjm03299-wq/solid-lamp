# PINFORGE — 4-Digit PIN Generator & Verifier

A React app that generates cryptographically random 4-digit PINs, seals them as
one-time credentials, and verifies user attempts against them. Includes an
Express API implementation and a full OpenAPI 3.1 specification.

## Repository structure

```
client/            React 19 + Vite + Tailwind 4 app (GitHub Pages target)
server/index.ts    Express API implementing openapi.yaml
openapi.yaml       OpenAPI 3.1 specification (served at GET /api/openapi)
```

## API endpoints (Express)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/pins` | Mint a new 4-digit PIN (1000–9999) |
| GET | `/api/pins/{id}` | Check credential status (live / consumed) |
| POST | `/api/pins/{id}/verify` | Verify a 4-digit attempt (one-time redemption) |
| GET | `/health` | Liveness probe |

Run locally with `pnpm install` then `pnpm start` (builds the React app and
boots the Express server on port 3000).

## Deploy to GitHub Pages

Create `.github/workflows/deploy.yml` on your machine (see the workflow file
included in the project delivery) and push it:

```bash
mkdir -p .github/workflows
# add the deploy.yml content (provided separately)
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

Note: automated tooling tokens cannot push workflow files because GitHub
requires the `workflow` scope, which GitHub blocks for personal access
tokens used by external apps. So this single push must come from your own
machine or a token with the `workflow` scope.

Once the workflow is pushed, every push to `main` deploys automatically to
`https://jjjm03299-wq.github.io/solid-lamp/`.

Before the first run, enable GitHub Pages once in the repository settings:
Settings → Pages → "Deploy from a branch" is NOT needed; instead ensure
Actions permissions allow this repository's workflows (Settings → Actions →
General → "Allow all actions and reusable workflows"), then the first push
will run and deploy.

## License

MIT

# BUILD_WITH_OPENCODE.md — Execute This Entire Build

You are OpenCode. You must create the full repository implementation for goodgood.today.
Do NOT ask the user to manually write code or create files. Do everything yourself.

## Absolute Rules
1) Follow AGENTS.md as the single source of truth.
2) Do not use nginx container. Assume NPM reverse proxy exists.
3) No database; only JSON files.
4) Each milestone ends with:
   - tests run
   - devlog file created (per-commit file)
   - git commit
   - git push to origin (private repo)
5) Never delete devlogs; append-only, and keep history forever.

---

## Milestones (MUST commit+push after each)
### Milestone 1 — Repo skeleton + configs
Create repo structure and base files:
- .gitignore (exclude .env, node_modules, generated data/*.json, logs)
- .env.example (OpenAI + Anthropic variables, LANGUAGES_20, DATA_DIR)
- opencode.json (allow most permissions + git; deny rm and force push)
- docker-compose.yml (web + generator, shared ./data volume, expose web port 3000)
- scripts/: local-up.sh, local-down.sh, generate-now.sh, healthcheck.sh, devlog-new.sh
- .github/workflows/ci.yml (node tests + basic build)
- README.md placeholder (full README later)

After creating these:
- run any minimal checks (e.g. `ls`, `cat` key files)
- create devlog for this commit
- commit message suggestion (Conventional Commits)
- git commit + git push

### Milestone 2 — Generator MVP (writes JSON properly)
Implement `generator/` Node app that:
- Uses UTC date.
- Calls LLM provider based on env:
  - LLM_PROVIDER=openai or anthropic
- Prompts LLM to output EXACT JSON with:
  - message
  - translations for 20 languages (fixed list in AGENTS.md)
  - theme colors
- Robustly extracts JSON (strip markdown fences)
- Validates schema before writing
- Writes:
  - data/daily/YYYY-MM-DD.json (immutable)
  - updates data/index.json (sorted unique dates)
  - updates data/latest.json
- Is idempotent:
  - if today's file exists and FORCE=0 -> exit success
  - if FORCE=1 -> regenerate and overwrite today's file (optional but recommended)

Add a scheduler inside the generator container:
- must run daily at 00:00 UTC
- use a docker-friendly scheduler (supercronic or crond)
- also support manual run via `scripts/run-once.sh` inside generator

Add generator tests (Node built-in test runner ok):
- schema validation test
- json extraction test
- index update logic test
No external deps required unless you want.

After implementation:
- run generator tests
- create devlog
- commit+push

### Milestone 3 — Web static UI MVP
Implement `web/` static site:
- index.html, app.js, styles.css
- app loads:
  - /data/latest.json
  - /data/daily/<date>.json
- language auto selection:
  - navigator.languages exact -> base -> fallback en
- show message + allow manual language dropdown (localStorage)

Implement `web-server/` Node server:
- serves web static assets
- serves /data/* from mounted /data folder
- sets no-cache headers for /data
- exposes port 3000

Update docker-compose.yml to run web server container (build from web-server Dockerfile).
After implementation:
- run docker compose build
- run `scripts/local-up.sh` and verify / returns HTML
- create devlog
- commit+push

### Milestone 4 — History navigation (prev/next/today)
Extend UI:
- reads /data/index.json (list of dates)
- prev/next buttons navigate by query param ?date=
- today button uses latest.json to jump to latest
- show selected date label
- handle empty data gracefully (“No data yet…”)

After implementation:
- run a manual generation (scripts/generate-now.sh) to create sample data
- verify navigation works
- create devlog
- commit+push

### Milestone 5 — Operational polish + final README
Create/finish:
- README.md with:
  - what it is
  - local setup & run
  - how to set env vars
  - how to deploy on Coolify (docker compose)
  - how to connect NPM to port 3000 and domain goodgood.today
  - how daily schedule works (00:00 UTC)
  - troubleshooting section
- scripts/healthcheck.sh should:
  - curl /data/latest.json
  - curl /data/daily/<latest>.json
  - curl / and check 200
- Ensure generator logs are meaningful and not noisy.

Final verification:
- `docker compose up --build`
- `scripts/generate-now.sh`
- open web and confirm message/theme/language selection
- run CI commands locally (at least generator tests)

Then:
- devlog
- commit+push

---

## Implementation Notes (Decisions You Must Make)
- Choose one of:
  A) Use Node built-in http server only (no deps)
  B) Use express (small dep)
Prefer A if simple.
- Keep dependencies minimal.
- Use atomic writes when writing JSON (write tmp then rename).

---

## Required Files to Generate (Full List)
Top level:
- docker-compose.yml
- .gitignore
- .env.example
- opencode.json
- README.md
- AGENTS.md (may update but keep requirements)
- BUILD_WITH_OPENCODE.md (this file)

Dirs/files:
- scripts/
  - local-up.sh
  - local-down.sh
  - generate-now.sh
  - healthcheck.sh
  - devlog-new.sh
- docs/devlog/ (keep .gitkeep if needed)
- generator/
  - Dockerfile
  - package.json
  - src/...
  - cron/ or scheduler config
  - scripts/run-once.sh
  - test/...
- web/
  - index.html
  - app.js
  - styles.css
- web-server/
  - Dockerfile
  - package.json
  - src/server.js
- data/
  - .gitkeep
- .github/workflows/
  - ci.yml

---

## Git Automation Inside OpenCode
Use shell to commit and push. Ensure opencode.json allows:
- git status/diff/add/commit/push
But deny:
- rm *
- git push --force*

Each milestone must end with a pushed commit.

---

## What to Output at the End (in the final message)
When all milestones are done, print:
1) `tree -L 3` (or equivalent) to show repo structure
2) exact commands to test locally
3) confirmation that schedule is set to 00:00 UTC
4) brief list of known issues (if any)
# goodgood.today

A DB-less daily uplifting message site. Generates content daily via LLM, stores it as JSON, and serves it via a static site.

## Architecture

- **Generator**: Node.js app that runs daily at 00:00 UTC (via cron/supercronic).
  - Uses OpenAI, Anthropic, or Gemini to generate a message, translations, and theme.
  - Writes to `./data/daily/YYYY-MM-DD.json`.
  - Updates `./data/index.json` and `./data/latest.json`.
  - Idempotent: Does not overwrite existing files unless forced.
- **Web Server**: Node.js static server.
  - Serves static assets from `./web`.
  - Serves data from `./data` mounted as a volume.
  - Implements `Cache-Control` headers for correct caching.
- **Data**: JSON files stored in a Docker volume (persisted on host).

## Local Development

1.  **Clone the repo**.
2.  **Configure Environment**:
    ```bash
    cp .env.example .env
    # Add your OpenAI or Anthropic API Key
    ```
3.  **Run with Docker Compose**:
    ```bash
    ./scripts/local-up.sh
    ```
    This runs `docker compose up -d --build`.
4.  **Access**:
    Open http://localhost:3000

5.  **Manual Generation**:
    To trigger generation immediately:
    ```bash
    ./scripts/generate-now.sh
    ```
    Note: Requires valid API keys in `.env`.

6.  **Stop**:
    ```bash
    ./scripts/local-down.sh
    ```

## Deployment (Coolify)

1.  Create a **Docker Compose** application in Coolify.
2.  Paste the contents of `docker-compose.yml`.
3.  Add Environment Variables:
    - `LLM_PROVIDER` (openai, anthropic, or gemini)
    - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`
4.  **Important**: Ensure the `./data` volume is persistent. In Coolify, you might need to configure the volume storage specifically if not using local binds.
5.  **Reverse Proxy**: Connect Nginx Proxy Manager (NPM) or Coolify's proxy to the `web` container on port 3000.
    - Domain: `goodgood.today`
    - Scheme: `http`
    - IP: `<container_name>` (e.g., `goodgood-web`)
    - Port: `3000`

## Operations

### Schedule
The generator runs automatically at **00:00 UTC** every day.
To change the schedule, edit `generator/cron/crontab`.

### Troubleshooting
- **No data appearing?**
  Check generator logs: `docker logs goodgood-generator`
- **Permissions issues?**
  Ensure the `./data` directory is writable by the container user (usually root in this setup).
- **Rate limits?**
  Check your LLM provider quota.

## Testing

Run generator tests locally:
```bash
cd generator
npm test
```

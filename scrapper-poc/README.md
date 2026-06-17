# Scrapper PoC

NestJS training project — proof of concept for a price/availability scraper that uses a local LLM to review API/endpoint responses for incidents (e.g. empty responses, blocks), escalating new ones to Slack. Embeddings are used to vectorize each detected situation and compare it against known cases in pgvector, so repeat incidents are matched/deduped instead of re-escalated. See [constitution.md](./constitution.md) for the full goals/roadmap.

Status: infra (Docker, models, DB) wired; application logic not yet implemented (scaffold only).

## Stack

- **Node**: 24
- **Framework**: NestJS 11 (Express platform)
- **Database**: PostgreSQL 16 + pgvector
- **Package manager**: pnpm
- **Inference model**: Phi-4-mini-instruct (3.8B, GGUF, via llama.cpp server) — reviews scraped endpoint responses, decides if something's wrong (incident review)
- **Embedding model**: bge-small-en-v1.5 (GGUF, via llama.cpp server) — vectorizes incident descriptions for similarity match against known cases in pgvector (dedupe before escalating to Slack)

## Requirements

- Node 24
- pnpm
- Docker

## Setup

```bash
pnpm install
```

## Docker services

Everything — app, db, both models — runs containerized. Only the app's port is published to the host; Postgres and the two model servers are reachable only on the internal `scrapper-net` Docker network (still have internet egress for the initial HuggingFace model pull).

```bash
docker compose up -d
docker compose ps
```

| Service      | Image                                            | Host port | Purpose                                  |
|--------------|---------------------------------------------------|-----------|--------------------------------------------|
| `app`        | built from local `Dockerfile`                      | 3000      | NestJS API (only service exposed to host)   |
| `postgres`   | `pgvector/pgvector:pg16`                            | —         | Storage + vector search, internal only      |
| `phi4-mini`  | `ghcr.io/ggml-org/llama.cpp:server` (`bartowski/microsoft_Phi-4-mini-instruct-GGUF:Q4_K_M`) | — | Reviews scraped responses for incidents, internal only |
| `embeddings` | `ghcr.io/ggml-org/llama.cpp:server` (`CompendiumLabs/bge-small-en-v1.5-gguf:Q8_0`) | — | Embeds incidents for vector match against known cases, internal only |

App reaches the model servers and DB via service-name DNS (`postgres:5432`, `phi4-mini:8080`, `embeddings:8081`) — see `environment` in `docker-compose.yml`.

## Running the app

Containerized by default (`docker compose up -d app`). For local iteration outside Docker:

```bash
pnpm run start:dev
pnpm run build && pnpm run start:prod
```

Note: running outside Docker means pointing `INFERENCE_URL`/`EMBEDDINGS_URL`/`DATABASE_URL` at published ports instead of service names — those aren't exposed by default (see Docker services above), so either run the app in the same compose network or temporarily publish the ports you need.

## How incident review + escalation works (planned)

1. Scraper hits a target endpoint, gets a response (or failure/empty body/block).
2. Response goes to `phi4-mini` for review — is this a real incident (blocked, empty, malformed) or normal?
3. If flagged, the incident description gets embedded via `embeddings`.
4. That vector is compared (pgvector similarity) against stored incident cases — match found = known/already-escalated case, no match = new case.
5. New cases get inserted into pgvector and pushed to Slack; known cases are deduped/skipped (or logged without re-alerting).

```bash
# incident review (only reachable from inside the docker network, or via the app)
curl http://phi4-mini:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"phi-4-mini","messages":[{"role":"user","content":"Review this API response and say if it indicates a block, empty result, or error: <response body>"}]}'

# embed an incident description for similarity lookup
curl http://embeddings:8081/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":"empty response from product listing endpoint, status 200"}'
```

## Endpoints

Scaffold only — `GET /` returns a hello-world placeholder. Scraper, incident-review, and Slack-escalation endpoints from the constitution are not implemented yet.

## Testing

```bash
pnpm run test         # unit (*.spec.ts, src/)
pnpm run test:e2e      # e2e (*.e2e-spec.ts, test/)
```

## Lint / format

```bash
pnpm run lint
pnpm run format
```

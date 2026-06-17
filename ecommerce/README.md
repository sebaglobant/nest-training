# Dummy Ecommerce

NestJS training project — products + users API backed by MongoDB, with a local LLM (Gemma) used to generate seed data.

## Stack

- **Node**: 24
- **Framework**: NestJS 11 (Express platform)
- **Database**: MongoDB 7 + Mongoose
- **Validation**: class-validator / class-transformer
- **Rate limiting**: @nestjs/throttler
- **Package manager**: pnpm
- **Seed model**: Gemma-2-2b-it (GGUF, via llama.cpp server)

## Requirements

- Node 24
- pnpm
- Docker (for MongoDB + Gemma)

## Setup

```bash
pnpm install
cp .env.example .env   # fill in MONGODB_URI if different from defaults
```

## Docker services

```bash
docker compose up -d        # mongo + gemma-2b
docker compose ps
```

| Service    | Image                          | Port  | Purpose                          |
|------------|---------------------------------|-------|-----------------------------------|
| `mongo`    | `mongo:7`                       | 27017 | Primary datastore                 |
| `gemma-2b` | `ghcr.io/ggml-org/llama.cpp:server` running `bartowski/gemma-2-2b-it-GGUF:Q4_K_M` | 8082  | OpenAI-compatible inference, used only for seeding |

Both run via `pnpm run start:dev` against the app — the app itself is **not** containerized here.

## Running the app

```bash
pnpm run start:dev      # watch mode
pnpm run start:debug     # watch + debugger
pnpm run build && pnpm run start:prod
```

App listens on `http://localhost:3000`.

## Seeding data

Generates realistic `Product` documents by prompting the local Gemma model and inserting the result into MongoDB.

```bash
pnpm run seed
```

Env overrides:

| Var               | Default                  | Description                          |
|--------------------|---------------------------|----------------------------------------|
| `GEMMA_URL`         | `http://localhost:8082`  | Gemma inference endpoint                |
| `SEED_COUNT`        | `20`                     | Total products to generate              |
| `SEED_BATCH_SIZE`   | `5`                      | Products requested per LLM call         |

Requires `mongo` and `gemma-2b` containers up. Gemma runs CPU-only inside Docker — expect a few minutes for larger seed counts.

## Endpoints

### Products (`/products`) — Mongoose-backed

| Method | Path            | Body / Params         |
|--------|------------------|-------------------------|
| POST   | `/products`      | `CreateProductDto`      |
| GET    | `/products`      | —                        |
| GET    | `/products/:id`  | —                        |
| PATCH  | `/products/:id`  | `UpdateProductDto`       |
| DELETE | `/products/:id`  | —                        |

`Product` schema: `name`, `category`, `price`, `location`, `stock` (+ timestamps).

### Users (`/users`) — scaffolded, not yet persisted

| Method | Path          | Body / Params       |
|--------|----------------|------------------------|
| POST   | `/users`       | `CreateUserDto`         |
| GET    | `/users`       | —                        |
| GET    | `/users/:id`   | —                        |
| PATCH  | `/users/:id`   | `UpdateUserDto`          |
| DELETE | `/users/:id`   | —                        |

## Testing

Three separate Jest configs — see `CLAUDE.md` for full details.

```bash
pnpm run test          # unit (*.spec.ts, src/)
pnpm run test:int       # integration (*.int-spec.ts, src/)
pnpm run test:e2e       # e2e (*.e2e-spec.ts, test/)
```

## Lint / format

```bash
pnpm run lint
pnpm run format
```

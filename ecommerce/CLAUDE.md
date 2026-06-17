# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Stock NestJS (v11) TypeScript starter — `intermediate` module in an nestjs-training dojo repo. Currently unmodified scaffold (`AppModule` → `AppController` + `AppService`); no custom domain code yet.

Package manager: **pnpm** (pnpm-lock.yaml present, no package-lock.json/yarn.lock — always use pnpm, not npm/yarn).

## Commands

```bash
pnpm install              # install deps

pnpm run start            # run
pnpm run start:dev        # watch mode
pnpm run start:debug      # watch + debugger
pnpm run build            # nest build -> dist/

pnpm run lint              # eslint --fix on src,apps,libs,test
pnpm run format             # prettier --write on src/test

pnpm run test               # unit tests (*.spec.ts under src)
pnpm run test:watch
pnpm run test:cov
pnpm run test:int           # integration tests (*.int-spec.ts under src), config: test/jest-int.json
pnpm run test:e2e           # e2e tests (*.e2e-spec.ts under test/), config: test/jest-e2e.json

# single test file
pnpm jest path/to/file.spec.ts
pnpm jest --config ./test/jest-int.json path/to/file.int-spec.ts
pnpm jest --config ./test/jest-e2e.json path/to/file.e2e-spec.ts
```

## Test layout (three separate Jest configs)

- **Unit** (`*.spec.ts`): live alongside source in `src/`, run via root `jest` config in package.json (rootDir `src`). `*.int-spec.ts` files are explicitly excluded here.
- **Integration** (`*.int-spec.ts`): also live in `src/`, run via `test/jest-int.json` (rootDir `../src`, testRegex `.int-spec.ts$`).
- **E2E** (`*.e2e-spec.ts`): live in `test/`, run via `test/jest-e2e.json` (rootDir `.`).

When adding a new spec, name it correctly (`.spec.ts` vs `.int-spec.ts` vs `.e2e-spec.ts`) and place it in the matching directory or it won't be picked up by the intended script.

## Code style

- Prettier: single quotes, trailing commas everywhere (`.prettierrc`).
- ESLint flat config (`eslint.config.mjs`): `typescript-eslint` recommendedTypeChecked + prettier integration. `no-explicit-any` is off; `no-floating-promises` and `no-unsafe-argument` are warnings, not errors.
- TS config targets ES2023, `nodenext` module/resolution, decorators enabled (Nest DI), `noImplicitAny: false`, `strictNullChecks: true` (not full `strict`).

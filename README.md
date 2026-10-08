# The Way Within with Nadia

Website for The Way Within with Nadia. See `The_Way_Within_Master_Doc_for_Claude.md`
for the product/design spec and `ENGINEERING.md` for architecture and engineering
standards — both govern how this repo is built.

Build progress: `CHECKLIST.md`. Open decisions/credentials needed: `PENDING.md`.
Mistakes made and lessons learned: `BUGS.md`.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Start the dev server (Turbopack)          |
| `pnpm build`        | Production build                          |
| `pnpm typecheck`    | Generate route types, then `tsc --noEmit` |
| `pnpm lint`         | ESLint                                    |
| `pnpm test`         | Vitest (unit)                             |
| `pnpm format`       | Prettier — writes                         |
| `pnpm format:check` | Prettier — check only                     |

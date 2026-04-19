<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Development & scripts
- Run `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`) to start the Next.js dev server at http://localhost:3000.
- Production build: `npm run build` then `npm start`.
- Lint: `npm run lint` (ESLint includes type checking via `eslint-config-next`).

## Environment variables
- Firebase config loads from `NEXT_PUBLIC_FIREBASE_*` vars (see `.env.local`). Without them Firebase auth is stubbed.
- API calls use `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`). A backend must be running on port 5000.

## API stubs
- `lib/api.ts` currently returns empty data (`getQuizzes` returns `[]`). Real data comes from the backend once implemented.

## App router layout
- All pages live under `app/(platform)/…`. The `(platform)` segment is a route group and does **not** appear in URLs.
- Route groups may contain additional nested groups; treat them as structural only.

## Path aliases
- `tsconfig.json` maps `@/*` to the repo root.
- Common aliases: `@/components/*`, `@/components/ui/*`, `@/lib/*`.

## UI library
- Uses shadcn/ui components via the `ui` alias (`@/components/ui`). Component imports follow that pattern.

## Duplicate `temp-app`
- The `temp-app` folder is a copy of the main app; ignore it for development and tooling.

## Build artifacts
- `.next/`, `out/`, `build/` are generated; never edit or commit them (already ignored).
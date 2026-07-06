# Quest Map

Build a shareable, node-based quest tree for anything — a game, a project, a bucket list. Each map gets a unique 4-letter code; anyone with the code can view it and react, and only the owner can manage it.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Supabase** — Postgres, Auth, Realtime
- **Tailwind CSS v4** + **shadcn/ui**
- **@xyflow/react** (React Flow) with `@dagrejs/dagre` auto-layout
- **Motion** for animation

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project's values (Project Settings → API):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Database schema

The schema (tables, indexes, the `node_fire_counts` view, and RLS policies) lives in Supabase migrations. If you're pointing this app at a fresh Supabase project, apply the SQL in order:

1. Create `maps`, `nodes`, `reactions`, `suggestions` tables (see `lib/supabase/types.ts` for the shape).
2. Enable RLS on all four tables.
3. Add the policies described below.
4. Create the `node_fire_counts` view (`security_invoker = true`) that aggregates fire reactions per node.

If you have the Supabase CLI linked to a project, run `supabase db pull` against an existing configured project to generate migration files, or ask your AI coding assistant with Supabase MCP access to re-apply the migrations from this project's history.

#### Row Level Security summary

| Table | Select | Insert | Update | Delete |
|---|---|---|---|---|
| `maps` | public | owner only | owner only | owner only |
| `nodes` | public | owner only (via map) | owner only (via map) | owner only (via map) |
| `reactions` | public | public | — | public |
| `suggestions` | owner only | public | owner only | — |

## Project structure

- `app/m/[code]` — public map view (React Flow tree, fire reactions, suggestions)
- `app/(auth)/login`, `app/(auth)/signup` — Supabase Auth
- `app/dashboard` — owner's maps
- `app/dashboard/[mapId]` — suggestion inbox for a single map
- `lib/supabase/` — browser/server/proxy Supabase clients
- `lib/actions.ts` — server actions (create map, accept/reject suggestions, sign out)
- `components/map-view.tsx` — the React Flow orchestrator (layout, realtime, state)
- `components/quest-node.tsx`, `components/glow-edge.tsx` — custom node/edge renderers

## Deploying

1. Push this repo to GitHub (already connected if you're reading this from the repo).
2. In [Vercel](https://vercel.com/new), import the GitHub repository.
3. Add the environment variables from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project's Settings → Environment Variables.
4. Deploy. Every push to `main` will auto-deploy.
5. In your Supabase project's Auth settings, add your Vercel deployment URL (and `http://localhost:3000` for local dev) to **Redirect URLs** so email confirmation links work.

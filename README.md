# Kanban Board

Drag-and-drop project board. Create boards, organize tasks into columns, set due dates, tag stuff. Works without an account if you just want to try it.

## Why I Built This

Needed a proper excuse to dig into GraphQL on the frontend. Also wanted to get drag-and-drop right — not the janky kind where items teleport, but smooth reordering that actually feels good to use.

## Tech Decisions

### GraphQL + Apollo Client

REST would've been fine, but I wanted the client to fetch exactly what it needs. A board page grabs the board, its columns, and all cards in one request. No overfetching, no waterfall of API calls.

Apollo's normalized cache is the real win here. When you move a card, I update the cache directly — the UI reacts instantly, then the mutation fires in the background. If the server fails, it rolls back. This optimistic update pattern makes everything feel snappy.

### @hello-pangea/dnd for Drag & Drop

This is a fork of react-beautiful-dnd (which Atlassian abandoned). It handles the hard parts: keyboard accessibility, screen reader announcements, collision detection, drop animations.

The tricky bit was syncing drag state with GraphQL mutations. When you drop a card, I need to update the `order` field on every affected card and potentially change the `columnId`. That's a single `MOVE_CARD` mutation that the backend resolves, then Apollo cache gets patched to match.

### Demo Mode with Zustand

Wanted people to try the app without signing up. Instead of mocking the GraphQL layer, I created a parallel state system using Zustand that persists to localStorage.

Same components, same UI — but the data hooks check if you're in demo mode and switch between Apollo queries and Zustand selectors. Bit of extra wiring, but it means the demo is actually the real app, just with local storage as the "backend."

### Clerk for Auth

Only needed Google OAuth, nothing fancy. Clerk handles the token flow, gives me a user ID to associate with boards.

The frontend passes the Clerk session token to the GraphQL backend in the Authorization header. Backend validates it and extracts the user ID for ownership checks.

## How It Fits Together

The GraphQL schema is straightforward: Boards have Columns, Columns have Cards. Everything has an `order` field for positioning. When you drag a column or card, the mutation recalculates order values for affected items.

Cards can have tags (array of strings) and due dates. The dashboard aggregates this — shows you what's due soon, what tags you use most, recent boards. All one GraphQL query that the backend resolves efficiently.

## Stuff I Learned

**Optimistic UI is tricky with lists** — When you drag a card, you need to update the cache before the server responds. But if the mutation fails, you need to revert. Apollo's `optimisticResponse` works, but you have to be careful about cache key references.

**Drag-and-drop state vs React state** — The dnd library manages its own state during a drag. If you try to update React state mid-drag, things get weird. Had to debounce some updates and only commit changes on drop.

**localStorage has limits** — Demo mode works fine for a few boards, but localStorage caps out around 5MB. Added a warning if you're getting close.

## Stack

| What | Why |
|------|-----|
| Next.js 15 + React 19 | App Router, server components for initial load |
| Apollo Client | GraphQL client with normalized caching |
| Zustand | Demo mode state (simpler than Redux) |
| @hello-pangea/dnd | Drag-and-drop that actually works |
| Clerk | OAuth without the overhead |
| Tailwind + shadcn/ui | Fast UI, accessible components out of the box |

## Deployment

The app runs on a Cloudflare Worker at `https://kanban.minii.dev`.
`@opennextjs/cloudflare` turns the Next.js build into `.open-next/worker.js` plus a static asset directory, and `wrangler.jsonc` binds those together and attaches the Custom Domain.

Workers Builds deploys on every push to `main`.
The build command is `bun install --frozen-lockfile && bun run cf:build` and the deploy command is `bunx opennextjs-cloudflare deploy`.
The OpenNext build step does not run on Windows, so building locally means running `bun run cf:build` inside a Linux container; `bunx wrangler dev` then previews the built output natively.

`NEXT_PUBLIC_*` values are inlined at build time and are stored as Workers Builds build variables, so changing one needs a rebuild rather than a redeploy.
`CLERK_SECRET_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, and `MAIL_TO` are Worker secrets, set with `bunx wrangler secret put <NAME>`.
`NEXT_PUBLIC_GRAPHQL_URL` points at `https://api.kanban.minii.dev/graphql/` rather than the backend's `workers.dev` URL, because a Worker cannot fetch a `*.workers.dev` hostname.

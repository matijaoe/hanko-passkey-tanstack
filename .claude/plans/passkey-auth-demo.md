# Passkey-Only Auth Demo — Build Plan

## Stack
- TanStack Start (React, file-based routing)
- Hanko Passkeys SDK (`@teamhanko/passkeys-sdk`)
- Drizzle ORM + Turso (libSQL)
- shadcn/ui on Base UI, Tailwind v4
- jose (JWT sessions), native WebAuthn APIs
- Netlify deployment

## Source layout
All app code lives under `src/` (not `app/`).

---

## Completed ✅
- [x] Scaffold: `pnpm dlx shadcn@latest create` → TanStack Start + Base UI, Lyra style, Emerald theme
- [x] Install deps: `@teamhanko/passkeys-sdk drizzle-orm @libsql/client jose @tanstack/react-query`
- [x] Install devDeps: `drizzle-kit @netlify/vite-plugin-tanstack-start`
- [x] `db/schema.ts` — users table (id UUID PK, username unique, createdAt)
- [x] `db/index.ts` — Drizzle client via @libsql/client
- [x] `drizzle.config.ts` — turso dialect, schema path, env credentials
- [x] `src/lib/hanko.server.ts` — Hanko tenant() init
- [x] `src/lib/session.server.ts` — jose HS256 JWT cookie (httpOnly, 7d)
- [x] `src/lib/auth.ts` — all server functions (getMe, registerStart/Finish, loginStart/Finish, logout)

## Completed (continued) ✅
- [x] `vite.config.ts` — replaced nitro() with netlify() plugin
- [x] `src/routes/__root.tsx` — auth-aware navbar, QueryClientProvider, fixed-top nav with pt-14 main
- [x] `src/routes/index.tsx` — landing page using buttonVariants + Link (no asChild)
- [x] `src/routes/register.tsx` — passkey registration with native WebAuthn APIs
- [x] `src/routes/login.tsx` — passkey login with native WebAuthn APIs + null check on publicKey
- [x] `src/routes/profile.tsx` — protected via beforeLoad, logout button
- [x] `.env.example` — all 5 env vars documented
- [x] `netlify.toml` — build config pointing to .output/public
- [x] `package.json` scripts — db:push, db:generate, db:migrate, db:studio added
- [x] `README.md` — setup and deployment docs
- [x] `uuid` + inputValidator fixes for createServerFn type safety
- [x] `pnpm build` — passes cleanly, Netlify SSR entry emitted

---

## Key Decisions

| Concern | Decision |
|---|---|
| Cookie utilities | `@tanstack/react-start/server` (getCookie/setCookie/deleteCookie) |
| Session JWT | jose HS256 signed with SESSION_SECRET |
| WebAuthn | Native browser `PublicKeyCredential` APIs (no @github/webauthn-json) |
| Auth state | TanStack Query `queryOptions` + `useQuery` for `getMe` |
| Route protection | `beforeLoad` → redirect to /login if no session |
| DB client | Drizzle + @libsql/client → Turso |
| uuid | uuid@latest (for user ID generation in registerStart) |

---

## Env vars required
```
HANKO_TENANT_ID=
HANKO_API_KEY=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
SESSION_SECRET=
```

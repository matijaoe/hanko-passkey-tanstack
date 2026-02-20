# Passkey demo

Passkey-only authentication demo built with TanStack Start, Hanko Passkeys API, Drizzle ORM + Turso, and shadcn/ui.

## Features

- No passwords — authentication is entirely passkey-based
- Passkey registration and login via the Hanko Passkeys API
- Cookie-based sessions with signed JWTs
- Protected routes with server-side session validation
- Deployable on Netlify with zero-config adapter

## Prerequisites

- Node.js 20+
- pnpm
- [Hanko Passkeys account](https://www.passkeys.io/) — to obtain a Tenant ID and API key
- [Turso account](https://turso.tech/) — to create a libSQL database

## Setup

1. Clone the repository and install dependencies:

   ```sh
   git clone <repo-url>
   cd hanko-passkey-demo
   pnpm install
   ```

2. Copy the example environment file and fill in your values:

   ```sh
   cp .env.example .env
   ```

   | Variable             | Description                                              |
   | -------------------- | -------------------------------------------------------- |
   | `HANKO_TENANT_ID`    | Tenant ID from the Hanko Passkeys dashboard              |
   | `HANKO_API_KEY`      | API key from the Hanko Passkeys dashboard                |
   | `TURSO_DATABASE_URL` | libSQL URL for your Turso database (`libsql://…`)        |
   | `TURSO_AUTH_TOKEN`   | Auth token for your Turso database                       |
   | `SESSION_SECRET`     | Random secret (min 32 chars) — `openssl rand -base64 32` |

3. Push the database schema:

   ```sh
   pnpm db:push
   ```

4. Start the development server:

   ```sh
   pnpm dev
   ```

   The app runs at [http://localhost:3000](http://localhost:3000).

## How it works

### Registration

Registration is a two-step flow handled by `usePasskeyRegister`:

1. **Username step** — the user enters a username. On blur (and again on submit), `checkUsername` is called as a server function to verify availability against the DB.
2. **Passkey step** — once the username is confirmed available:
   - `registerStart` is called server-side. It generates a UUID for the new user, calls `hanko.registration.initialize()` to get WebAuthn creation options, and returns them without writing to the DB yet.
   - The browser uses those options to prompt the user to create a passkey (Face ID, Touch ID, hardware key, etc.) via `navigator.credentials.create()`.
   - The resulting credential is sent to `registerFinish`, which calls `hanko.registration.finalize()` to verify it with Hanko, then writes the user to the DB and creates a session cookie.

The DB write only happens after Hanko confirms the credential is valid — so no orphaned users if the passkey step fails.

### Login

Login is a single-step flow handled by `usePasskeyLogin`:

1. `loginStart` is called server-side to get WebAuthn assertion options from `hanko.login.initialize()`.
2. The browser prompts the user to sign with an existing passkey via `navigator.credentials.get()`.
3. The signed credential is sent to `loginFinish`, which calls `hanko.login.finalize()`. Hanko verifies the signature and returns a JWT.
4. The JWT is decoded to extract the user ID (`sub` claim), the user is looked up in the DB, and a session cookie is created.

### Sessions

Sessions are managed with a signed JWT stored in an httpOnly cookie (7-day expiry, HS256). The JWT contains only the user ID as the `sub` claim.

On every server request that needs auth, `getSessionUserId()` reads the cookie, verifies the JWT signature using `SESSION_SECRET`, and returns the user ID or null if the session is missing or invalid.

### Route guards

Protected routes (e.g. `/profile`) use TanStack Router's `beforeLoad` hook to check auth before the component mounts:

```ts
beforeLoad: async () => {
  const user = await queryClient.ensureQueryData(getMeQueryOptions)
  if (!user) throw redirect({ to: '/login' })
  return { user }
}
```

`ensureQueryData` reads from the React Query cache if the data is fresh, avoiding a redundant DB call since the root loader already fetched the user. The returned `{ user }` is merged into the route context and accessed in the component via `Route.useRouteContext()` — no loading state needed since the data is resolved before render.

Auth routes (`/login`, `/register`) do the inverse — they redirect to `/profile` if a session already exists.

### Auth state in the navbar

`queryClient` and `getMeQueryOptions` are defined in `src/lib/query.ts` and shared across the whole app. The root route's `loader` fetches the current user on every page load:

```ts
loader: () => queryClient.ensureQueryData(getMeQueryOptions)
```

The result is passed as `initialData` to `useQuery` in the navbar, seeding the client-side cache before hydration — so the correct buttons render on the very first paint with no flash.

`getMeQueryOptions` has `staleTime: Infinity`, meaning React Query never refetches automatically. The cache is only updated by explicit invalidation — which happens after login, registration, and logout. This ensures `getMe` is called at most once per page load.

### Input validation

All server functions that accept user input are validated with Zod. The username validation rules are defined once in `db/schema.ts` as `usernameSchema` and reused across all server functions that accept a username — so there's a single place to change the rules.

## Deployment (Netlify)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Connect the repository to a new Netlify site.
3. Netlify auto-detects the build settings from `netlify.toml` (`pnpm build`, publish dir `.output/public`).
4. Set the environment variables listed above in the Netlify dashboard under **Site configuration > Environment variables**.
5. Trigger a deploy — the site will be live at your Netlify URL.

## Tech stack

| Layer         | Technology                                     |
| ------------- | ---------------------------------------------- |
| Framework     | [TanStack Start](https://tanstack.com/start)   |
| Auth          | [Hanko Passkeys API](https://www.passkeys.io/) |
| Database ORM  | [Drizzle ORM](https://orm.drizzle.team/)       |
| Database      | [Turso](https://turso.tech/) (libSQL)          |
| UI components | [shadcn/ui](https://ui.shadcn.com/)            |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com/)    |
| Deployment    | [Netlify](https://www.netlify.com/)            |

# Passkey Demo

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

   | Variable             | Description                                               |
   | -------------------- | --------------------------------------------------------- |
   | `HANKO_TENANT_ID`    | Tenant ID from the Hanko Passkeys dashboard               |
   | `HANKO_API_KEY`      | API key from the Hanko Passkeys dashboard                 |
   | `TURSO_DATABASE_URL` | libSQL URL for your Turso database (`libsql://…`)         |
   | `TURSO_AUTH_TOKEN`   | Auth token for your Turso database                        |
   | `SESSION_SECRET`     | Random secret (min 32 chars) — `openssl rand -base64 32`  |

3. Push the database schema:

   ```sh
   pnpm db:push
   ```

4. Start the development server:

   ```sh
   pnpm dev
   ```

   The app runs at [http://localhost:3000](http://localhost:3000).

## Deployment (Netlify)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Connect the repository to a new Netlify site.
3. Netlify auto-detects the build settings from `netlify.toml` (`pnpm build`, publish dir `.output/public`).
4. Set the environment variables listed above in the Netlify dashboard under **Site configuration > Environment variables**.
5. Trigger a deploy — the site will be live at your Netlify URL.

## Tech Stack

| Layer         | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Framework     | [TanStack Start](https://tanstack.com/start)                  |
| Auth          | [Hanko Passkeys API](https://www.passkeys.io/)                |
| Database ORM  | [Drizzle ORM](https://orm.drizzle.team/)                      |
| Database      | [Turso](https://turso.tech/) (libSQL)                         |
| UI Components | [shadcn/ui](https://ui.shadcn.com/)                           |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com/)                   |
| Deployment    | [Netlify](https://www.netlify.com/)                           |

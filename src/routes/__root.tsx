import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { IconFingerprint } from '@tabler/icons-react'
import appCss from '../styles.css?url'
import { queryClient, getMeQueryOptions } from '@/lib/query'
import { useLogout } from '@/hooks/use-logout'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Passkey demo' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),

  loader: () => queryClient.ensureQueryData(getMeQueryOptions),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
    </>
  )
}

function Navbar() {
  const loaderData = Route.useLoaderData()
  const { data: user } = useQuery({
    ...getMeQueryOptions,
    // Prevents a flash of unauthenticated state on first render — the loader
    // fetches this on the server, and initialData seeds the client cache before hydration.
    initialData: loaderData ?? undefined,
  })
  const handleLogout = useLogout()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex size-7 items-center justify-center border border-primary/40 bg-primary/10 transition-colors group-hover:border-primary/70 group-hover:bg-primary/15">
            <IconFingerprint size={15} className="text-primary" />
          </div>
          <span className="font-display text-sm font-bold tracking-[0.2em] uppercase text-foreground">
            Passkey
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <span className="mr-2 font-mono text-xs text-muted-foreground">
                {user.username}
              </span>
              <Link
                to="/profile"
                className="rounded-sm px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-sm px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-sm px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-sm border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

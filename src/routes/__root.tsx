import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getMe, logout } from '@/lib/auth'

import appCss from '../styles.css?url'

const queryClient = new QueryClient()

const getMeQueryOptions = queryOptions({
  queryKey: ['me'],
  queryFn: () => getMe(),
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Passkey demo' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  const { data: user } = useQuery(getMeQueryOptions)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    await qc.invalidateQueries({ queryKey: ['me'] })
    navigate({ to: '/' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b bg-background px-6 py-3">
      <Link to="/" className="text-base font-bold tracking-tight">
        Passkey demo
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground">{user.username}</span>
            <Link
              to="/profile"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

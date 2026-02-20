import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { usePasskeyLogin } from '@/hooks/use-passkey-login'
import { Button } from '@/components/ui/button'
import { getMe } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const user = await getMe()
    if (user) throw redirect({ to: '/profile' })
  },
  component: LoginPage,
})

function LoginPage() {
  const { isPending, error, login } = usePasskeyLogin()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center px-4">
        <span className="text-5xl" role="img" aria-label="key">
          🔑
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Passkey demo</h1>

        <div className="w-full space-y-3">
          <Button
            onClick={login}
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isPending ? 'Waiting for passkey…' : 'Sign in with a passkey'}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

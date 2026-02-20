import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { usePasskeyLogin } from '@/hooks/use-passkey-login'
import { Button } from '@/components/ui/button'
import { getMe } from '@/lib/auth'
import { AuthCard } from '@/components/auth-card'

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
    <AuthCard
      title="Welcome back"
      description="Use your passkey to sign in — no password needed."
    >
      <Button onClick={login} disabled={isPending} className="w-full glow-jade">
        {isPending ? 'Waiting for passkey…' : 'Sign in with passkey'}
      </Button>

      {error && <p className="text-center text-xs text-destructive">{error}</p>}

      <p className="text-center text-xs text-muted-foreground">
        No account?{' '}
        <Link
          to="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  )
}

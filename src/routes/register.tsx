import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { usePasskeyRegister } from '@/hooks/use-passkey-register'
import { getMe } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthCard } from '@/components/auth-card'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const user = await getMe()
    if (user) throw redirect({ to: '/profile' })
  },
  component: RegisterPage,
})

function RegisterPage() {
  const {
    step,
    username,
    setUsername,
    usernameStatus,
    checkAvailability,
    continueToPasskey,
    createPasskey,
    backToUsername,
    isPending,
    error,
    canContinue,
  } = usePasskeyRegister()

  if (step === 'passkey') {
    return (
      <AuthCard
        title="Create a passkey"
        description="Sign in to your account easily and securely with a passkey. Your biometric data is only stored on your device and never shared."
        footer={
          <button onClick={backToUsername} className="underline underline-offset-4 hover:text-primary">
            ← Back
          </button>
        }
      >
        <Button
          onClick={createPasskey}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? 'Waiting for passkey…' : 'Create a passkey'}
        </Button>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={checkAvailability}
          onKeyDown={(e) => e.key === 'Enter' && canContinue && continueToPasskey()}
          placeholder="Pick a username"
          disabled={isPending}
          autoFocus
        />
        {usernameStatus === 'checking' && (
          <p className="text-xs text-muted-foreground">Checking availability…</p>
        )}
        {usernameStatus === 'available' && (
          <p className="text-xs text-green-600">Username is available</p>
        )}
        {usernameStatus === 'taken' && (
          <p className="text-xs text-destructive">Username is taken</p>
        )}
      </div>

      <Button onClick={continueToPasskey} disabled={!canContinue} className="w-full">
        {isPending ? 'Checking…' : 'Continue'}
      </Button>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </AuthCard>
  )
}

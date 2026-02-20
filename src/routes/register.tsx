import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { IconArrowLeft } from '@tabler/icons-react'
import { usePasskeyRegister } from '@/hooks/use-passkey-register'
import { queryClient, getMeQueryOptions } from '@/lib/query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthCard } from '@/components/auth-card'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const user = await queryClient.ensureQueryData(getMeQueryOptions)
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
          <button
            onClick={backToUsername}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconArrowLeft size={13} />
            Back
          </button>
        }
      >
        <Button
          onClick={createPasskey}
          disabled={isPending}
          className="w-full glow-jade"
        >
          {isPending ? 'Waiting for passkey…' : 'Create a passkey'}
        </Button>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create account"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
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
          onKeyDown={(e) =>
            e.key === 'Enter' && canContinue && continueToPasskey()
          }
          placeholder="Pick a username"
          disabled={isPending}
          autoFocus
        />
        {usernameStatus === 'checking' && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse" />
            Checking availability…
          </p>
        )}
        {usernameStatus === 'available' && (
          <p className="flex items-center gap-1.5 text-xs text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Username is available
          </p>
        )}
        {usernameStatus === 'taken' && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <span className="size-1.5 rounded-full bg-destructive" />
            Username is taken
          </p>
        )}
      </div>

      <Button
        onClick={continueToPasskey}
        disabled={!canContinue}
        className="w-full"
      >
        {isPending ? 'Checking…' : 'Continue'}
      </Button>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </AuthCard>
  )
}

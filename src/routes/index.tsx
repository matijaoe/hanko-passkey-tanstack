import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg px-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-6xl" role="img" aria-label="key">🔑</span>
          <h1 className="text-4xl font-bold tracking-tight">Passkey Demo</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Passwordless auth powered by passkeys. No passwords, no email codes, no OAuth.
        </p>
        <div className="flex gap-3">
          <Link to="/register" className={buttonVariants()}>Create account</Link>
          <Link to="/login" className={buttonVariants({ variant: 'outline' })}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}

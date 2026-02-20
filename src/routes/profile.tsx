import { createFileRoute, redirect } from '@tanstack/react-router'
import { IconFingerprint } from '@tabler/icons-react'
import { queryClient, getMeQueryOptions } from '@/lib/query'
import { useLogout } from '@/hooks/use-logout'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const user = await queryClient.ensureQueryData(getMeQueryOptions)
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()
  const handleLogout = useLogout()

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden auth-bg">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[500px] rounded-full blur-[120px]"
        style={{ background: 'oklch(0.78 0.24 152 / 0.07)' }}
      />

      <div className="relative w-full max-w-sm px-5 py-10 animate-fade-up">
        {/* Identity card */}
        <div className="relative border border-border bg-card gradient-top-border">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex size-8 items-center justify-center border border-primary/35 bg-primary/10">
              <IconFingerprint size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Identity
              </p>
              <p className="font-display text-sm font-bold leading-tight">
                Verified
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <span
                className="size-1.5 rounded-full bg-primary"
                style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
              />
              Active
            </div>
          </div>

          {/* Card body */}
          <div className="space-y-5 px-5 py-5">
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Username
              </p>
              <p className="font-display text-3xl font-bold tracking-tight">
                {user.username}
              </p>
            </div>

            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Member since
              </p>
              <p className="text-sm">{memberSince}</p>
            </div>

            <div className="pt-1">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Secured by passkey badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <IconFingerprint size={11} className="text-primary/60" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Secured by passkey
          </span>
        </div>
      </div>
    </div>
  )
}

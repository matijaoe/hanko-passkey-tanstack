import { IconFingerprint } from '@tabler/icons-react'

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden auth-bg">

      {/* Ambient glow behind card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[550px] rounded-full blur-[130px]"
        style={{ background: 'oklch(0.78 0.24 152 / 0.07)' }}
      />
      {/* Second subtler glow, offset */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[350px] rounded-full blur-[90px]"
        style={{ background: 'oklch(0.65 0.22 200 / 0.05)' }}
      />

      <div className="relative w-full max-w-[360px] px-5 py-10 animate-fade-up">

        {/* Icon + title */}
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <div className="relative flex size-14 items-center justify-center border border-primary/35 bg-primary/10">
            <IconFingerprint size={26} className="text-primary" />
            {/* Scan line animation */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-px animate-scan"
                style={{
                  background: 'linear-gradient(90deg, transparent, oklch(0.78 0.24 152 / 0.8), transparent)',
                }}
              />
            </div>
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Card surface */}
        <div className="relative border border-border bg-card px-5 py-5 space-y-4 gradient-top-border">
          {children}
        </div>

        {footer && (
          <p className="mt-5 text-center text-xs text-muted-foreground">{footer}</p>
        )}

      </div>
    </div>
  )
}

import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { loginStart, loginFinish } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)

    try {
      const options = await loginStart()

      if (!options.publicKey) throw new Error('No assertion options returned')
      const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(
        options.publicKey as PublicKeyCredentialRequestOptionsJSON,
      )
      const credential = await navigator.credentials.get({ publicKey })
      const credentialJSON = (credential as PublicKeyCredential).toJSON()

      await loginFinish({ data: { credential: credentialJSON } })

      navigate({ to: '/profile' })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sign in failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Use your passkey to sign in instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              Sign in with Passkey
            </Button>

            {loading && (
              <p className="text-center text-sm text-muted-foreground">
                Authenticating...
              </p>
            )}

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

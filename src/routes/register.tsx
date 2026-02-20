import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { registerStart, registerFinish } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister() {
    setLoading(true)
    setError(null)

    try {
      const { userId, options } = await registerStart({ data: { username } })

      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(options.publicKey)
      const credential = await navigator.credentials.create({ publicKey })
      const credentialJSON = (credential as PublicKeyCredential).toJSON()

      await registerFinish({ data: { userId, credential: credentialJSON } })

      navigate({ to: '/profile' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>No password needed. Your device is your key.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading || username.trim() === ''}
              className="w-full"
            >
              Create account with passkey
            </Button>

            {loading && (
              <p className="text-center text-sm text-muted-foreground">
                Setting up your passkey...
              </p>
            )}

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

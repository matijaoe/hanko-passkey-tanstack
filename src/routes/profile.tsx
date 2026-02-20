import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { getMe, logout } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const user = await getMe()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Username
              </p>
              <p className="text-2xl font-semibold">{user.username}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Member since
              </p>
              <p className="text-base">{memberSince}</p>
            </div>
          </div>
          <Separator />
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

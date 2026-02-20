import { createFileRoute, redirect } from '@tanstack/react-router'
import { getMe } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await getMe()
    throw redirect({ to: user ? '/profile' : '/login' })
  },
})

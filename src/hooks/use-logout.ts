import { useNavigate } from '@tanstack/react-router'
import { logout } from '@/lib/auth'
import { queryClient } from '@/lib/query'

/**
 * Clears the session, invalidates the auth cache, and redirects to home.
 */
export function useLogout() {
  const navigate = useNavigate()

  const _logout = async () => {
    await logout()
    await queryClient.invalidateQueries({ queryKey: ['me'] })
    navigate({ to: '/' })
  }

  return _logout
}

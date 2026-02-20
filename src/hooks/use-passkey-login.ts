import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loginStart, loginFinish } from '@/lib/auth'

export function usePasskeyLogin() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const {
    isPending,
    error,
    mutate,
  } = useMutation({
    mutationFn: async () => {
      const options = await loginStart()
      if (!options.publicKey) {
        throw new Error('No assertion options returned')
      }
      const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(
        options.publicKey as PublicKeyCredentialRequestOptionsJSON,
      )
      const credential = await navigator.credentials.get({ publicKey })
      const credentialJSON = (credential as PublicKeyCredential).toJSON()
      await loginFinish({ data: { credential: credentialJSON } })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] })
      navigate({ to: '/profile' })
    },
    onError: (err) => err,
  })

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : 'Sign in failed. Please try again.'
    : null

  return {
    isPending,
    error: errorMessage,
    login: () => mutate(),
  }
}

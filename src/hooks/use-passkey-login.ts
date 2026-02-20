import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { loginStart, loginFinish } from '@/lib/auth'
import type { AsyncState } from './types'

export function usePasskeyLogin() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [state, setState] = useState<AsyncState>({ status: 'idle' })

  const isPending = state.status === 'pending'
  const error = state.status === 'error' ? state.message : null

  async function login() {
    setState({ status: 'pending' })
    try {
      const options = await loginStart()
      if (!options.publicKey) throw new Error('No assertion options returned')
      const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(
        options.publicKey as PublicKeyCredentialRequestOptionsJSON,
      )
      const credential = await navigator.credentials.get({ publicKey })
      const credentialJSON = (credential as PublicKeyCredential).toJSON()
      await loginFinish({ data: { credential: credentialJSON } })
      await qc.invalidateQueries({ queryKey: ['me'] })
      navigate({ to: '/profile' })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Sign in failed. Please try again.',
      })
    }
  }

  return { isPending, error, login }
}

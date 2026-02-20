import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerStart, registerFinish, checkUsername } from '@/lib/auth'

type Step = 'username' | 'passkey'
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken'

export function usePasskeyRegister() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState<Step>('username')
  const [username, setUsernameRaw] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')

  function setUsername(value: string) {
    setUsernameRaw(value)
    setUsernameStatus('idle')
  }

  async function checkAvailability() {
    const trimmed = username.trim()
    if (!trimmed) return
    setUsernameStatus('checking')
    try {
      const { available } = await checkUsername({ data: { username: trimmed } })
      setUsernameStatus(available ? 'available' : 'taken')
    } catch {
      setUsernameStatus('idle')
    }
  }

  async function continueToPasskey() {
    const trimmed = username.trim()
    if (!trimmed) return

    if (usernameStatus !== 'available') {
      setUsernameStatus('checking')
      try {
        const { available } = await checkUsername({
          data: { username: trimmed },
        })
        setUsernameStatus(available ? 'available' : 'taken')
        if (!available) return
      } catch {
        setUsernameStatus('idle')
        return
      }
    }

    setStep('passkey')
  }

  const {
    isPending,
    error,
    mutate,
  } = useMutation({
    mutationFn: async () => {
      const trimmed = username.trim()
      const { userId, options } = await registerStart({
        data: { username: trimmed },
      })
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(
        options.publicKey,
      )
      const credential = await navigator.credentials.create({ publicKey })
      const credentialJSON = (credential as PublicKeyCredential).toJSON()
      await registerFinish({
        data: { userId, username: trimmed, credential: credentialJSON },
      })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] })
      navigate({ to: '/profile' })
    },
    onError: (err) => err,
  })

  function backToUsername() {
    setStep('username')
  }

  const canContinue =
    !!username.trim() &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking' &&
    !isPending

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : 'Registration failed. Please try again.'
    : null

  return {
    step,
    username,
    setUsername,
    usernameStatus,
    checkAvailability,
    continueToPasskey,
    createPasskey: () => mutate(),
    backToUsername,
    isPending,
    error: errorMessage,
    canContinue,
  }
}

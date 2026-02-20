import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { registerStart, registerFinish, checkUsername } from '@/lib/auth'
import type { AsyncState } from './types'

type Step = 'username' | 'passkey'
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken'

export function usePasskeyRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('username')
  const [username, setUsernameRaw] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [state, setState] = useState<AsyncState>({ status: 'idle' })

  const isPending = state.status === 'pending'
  const error = state.status === 'error' ? state.message : null
  const canContinue =
    !!username.trim() &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking' &&
    !isPending

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

    // Check availability inline if the user didn't blur the field first
    if (usernameStatus !== 'available') {
      setUsernameStatus('checking')
      try {
        const { available } = await checkUsername({ data: { username: trimmed } })
        setUsernameStatus(available ? 'available' : 'taken')
        if (!available) return
      } catch {
        setUsernameStatus('idle')
        return
      }
    }

    setStep('passkey')
  }

  async function createPasskey() {
    const trimmed = username.trim()
    setState({ status: 'pending' })
    try {
      const { userId, options } = await registerStart({ data: { username: trimmed } })
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(options.publicKey)
      const credential = await navigator.credentials.create({ publicKey })
      const credentialJSON = (credential as PublicKeyCredential).toJSON()
      await registerFinish({ data: { userId, username: trimmed, credential: credentialJSON } })
      navigate({ to: '/profile' })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Registration failed. Please try again.',
      })
    }
  }

  function backToUsername() {
    setStep('username')
    setState({ status: 'idle' })
  }

  return {
    step,
    username,
    setUsername,
    usernameStatus,
    checkAvailability,
    continueToPasskey,
    createPasskey,
    backToUsername,
    isPending,
    error,
    canContinue,
  }
}

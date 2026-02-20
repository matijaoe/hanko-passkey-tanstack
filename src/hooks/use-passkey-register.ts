import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { registerStart, registerFinish, checkUsername } from '@/lib/auth'

type Step = 'username' | 'passkey'

type State =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; message: string }

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken'

export function usePasskeyRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('username')
  const [username, setUsernameRaw] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [state, setState] = useState<State>({ status: 'idle' })

  // Pending WebAuthn options from registerStart, held until registerFinish
  const [pendingRegistration, setPendingRegistration] = useState<{
    userId: string
    options: Awaited<ReturnType<typeof registerStart>>['options']
  } | null>(null)

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

    // Check availability inline if not already done
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

    // Pre-initialize registration so step 2 is instant
    setState({ status: 'pending' })
    try {
      const { userId, options } = await registerStart({
        data: { username: trimmed },
      })
      setPendingRegistration({ userId, options })
      setState({ status: 'idle' })
      setStep('passkey')
    } catch (err) {
      setState({
        status: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Failed to initialize. Please try again.',
      })
    }
  }

  async function createPasskey() {
    if (!pendingRegistration) return
    setState({ status: 'pending' })
    try {
      const { userId, options } = pendingRegistration
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(
        options.publicKey,
      )
      const credential = await navigator.credentials.create({ publicKey })
      const credentialJSON = (credential as PublicKeyCredential).toJSON()
      await registerFinish({
        data: { userId, username: username.trim(), credential: credentialJSON },
      })
      navigate({ to: '/profile' })
    } catch (err) {
      setState({
        status: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Registration failed. Please try again.',
      })
    }
  }

  function backToUsername() {
    setStep('username')
    setState({ status: 'idle' })
    setPendingRegistration(null)
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

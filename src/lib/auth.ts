import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { decodeJwt } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { db } from '../../db'
import { usernameSchema, users } from '../../db/schema'
import { hanko } from './hanko.server'
import {
  clearSessionCookie,
  createSessionCookie,
  getSessionUserId,
} from './session.server'

/**
 * Returns the currently authenticated user, or null if not logged in.
 * Used to hydrate auth state on the server (e.g. route guards, navbar).
 */
export const getMe = createServerFn({ method: 'GET' }).handler(async () => {
  const userId = await getSessionUserId()
  if (!userId) {
    return null
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) {
    return null
  }

  return { id: user.id, username: user.username, createdAt: user.createdAt }
})

/**
 * Checks whether a username is available for registration.
 * Called on blur and before proceeding to the passkey step.
 */
export const checkUsername = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ username: usernameSchema }))
  .handler(async ({ data }) => {
    const existing = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    })
    return { available: !existing }
  })

/**
 * Step 1 of registration. Initializes a WebAuthn ceremony with Hanko
 * and returns the options needed by the browser to create a passkey.
 * Does NOT write to the DB — that only happens in registerFinish.
 */
export const registerStart = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ username: usernameSchema }))
  .handler(async ({ data }) => {
    const existing = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    })
    if (existing) {
      throw new Error('Username already taken')
    }

    const userId = uuidv4()
    const options = await hanko.registration.initialize({
      userId,
      username: data.username,
    })
    return { userId, options }
  })

/**
 * Step 2 of registration. Finalizes the WebAuthn ceremony with Hanko,
 * writes the new user to the DB, and creates a session cookie.
 */
export const registerFinish = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.string(),
      username: usernameSchema,
      credential: z.unknown(),
    }),
  )
  .handler(async ({ data }) => {
    const { userId, username, credential } = data

    await hanko.registration.finalize(credential as any)
    await db.insert(users).values({ id: userId, username })
    await createSessionCookie(userId)

    return { success: true }
  })

/**
 * Step 1 of login. Initializes a WebAuthn assertion ceremony with Hanko
 * and returns the options needed by the browser to sign with a passkey.
 */
export const loginStart = createServerFn({ method: 'POST' }).handler(
  async () => {
    return hanko.login.initialize()
  },
)

/**
 * Step 2 of login. Finalizes the WebAuthn assertion with Hanko,
 * verifies the returned JWT, and creates a session cookie.
 */
export const loginFinish = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ credential: z.unknown() }))
  .handler(async ({ data }) => {
    const result = await hanko.login.finalize(data.credential as any)
    if (!result.token) {
      throw new Error('Login failed: no token returned')
    }

    const payload = decodeJwt(result.token)
    const userId = payload.sub
    if (!userId) {
      throw new Error('Login failed: no user ID in token')
    }

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!user) {
      throw new Error('User not found')
    }

    await createSessionCookie(userId)
    return { success: true }
  })

/**
 * Clears the session cookie, logging the user out.
 */
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  clearSessionCookie()
  return { success: true }
})

import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { decodeJwt } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../db'
import { users } from '../../db/schema'
import { hanko } from './hanko.server'
import { createSessionCookie, clearSessionCookie, getSessionUserId } from './session.server'

export const getMe = createServerFn({ method: 'GET' }).handler(async () => {
  const userId = await getSessionUserId()
  if (!userId) return null

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) return null

  return { id: user.id, username: user.username, createdAt: user.createdAt }
})

export const registerStart = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => input as { username: string })
  .handler(async (ctx) => {
    const { username } = ctx.data

    const existing = await db.query.users.findFirst({ where: eq(users.username, username) })
    if (existing) throw new Error('Username already taken')

    const userId = uuidv4()
    await db.insert(users).values({ id: userId, username })

    const options = await hanko.registration.initialize({ userId, username })
    return { userId, options }
  })

export const registerFinish = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => input as { userId: string; credential: unknown })
  .handler(async (ctx) => {
    const { userId, credential } = ctx.data

    await hanko.registration.finalize(credential as any)
    await createSessionCookie(userId)

    return { success: true }
  })

export const loginStart = createServerFn({ method: 'POST' }).handler(async () => {
  return hanko.login.initialize()
})

export const loginFinish = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => input as { credential: unknown })
  .handler(async (ctx) => {
    const { credential } = ctx.data

    const result = await hanko.login.finalize(credential as any)
    if (!result.token) throw new Error('Login failed: no token returned')

    const payload = decodeJwt(result.token)
    const userId = payload.sub
    if (!userId) throw new Error('Login failed: no user ID in token')

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!user) throw new Error('User not found')

    await createSessionCookie(userId)
    return { success: true }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  clearSessionCookie()
  return { success: true }
})

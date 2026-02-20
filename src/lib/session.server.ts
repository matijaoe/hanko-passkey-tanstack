import { SignJWT, jwtVerify } from 'jose'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'

const COOKIE_NAME = 'session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createSessionCookie(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())

  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export async function getSessionUserId(): Promise<string | null> {
  const token = getCookie(COOKIE_NAME)
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.sub ?? null
  } catch {
    return null
  }
}

export function clearSessionCookie() {
  deleteCookie(COOKIE_NAME, { path: '/' })
}

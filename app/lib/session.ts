import { cookies } from "next/headers"
import { getIronSession } from "iron-session"

export type SessionData = {
    userId?: string
    email?: string
    role?: string
    isLoggedIn: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "auth-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }

  return session
}

export async function signOut() {
  const session = await getSession()
  session.destroy()
}
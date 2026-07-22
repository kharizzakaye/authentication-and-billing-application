import { randomBytes, scrypt } from "crypto"
import { db } from "./db";
import { promisify } from "util";
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"

export async function signUp( email:string, password: string) {
    try {
        const exisitngUser = await db.user.findUnique({where: { email }})
        if (exisitngUser) return { success: false, error: "User already exists"}

        const { salt, hash } = await hashPassword(password);
        const userCount = await db.user.count();
        const role = userCount === 0 ? "admin" : "user";

        const user = await db.user.create({
            data: {
                email,
                password: hash,
                salt,
                role
            },
        })

        return { success: true, user }
    }
    catch (error) { 
        console.error("Sign up error: ", error);
        return { success: false, error: "Failed to create user"}
    }
}

const scrypAsync = promisify(scrypt);

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scrypAsync(password, salt, 64) as Buffer)

    return { salt, hash: derivedKey.toString("hex") }
}

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
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
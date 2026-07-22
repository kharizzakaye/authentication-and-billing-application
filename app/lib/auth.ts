import { db } from "./db";
import { hashPassword, verifyPassword } from "./password";

export async function signUp(email: string, password: string) {
    try {
        const existingUser = await db.user.findUnique({ where: { email } })
        if (existingUser) return { success: false, error: "User already exists" }

        const { salt, hash } = await hashPassword(password);
        const userCount = await db.user.count();
        const role = userCount === 0 ? "admin" : "user";

        const user = await db.user.create({
            data: {
                email,
                password: hash,
                salt,
                role,
            },
        })

        return { success: true, user }
    }
    catch (error) {
        console.error("Sign up error: ", error);
        return { success: false, error: "Failed to create user" }
    }
}

export async function signIn(email: string, password: string) {
    try {
        const user = await db.user.findUnique({ where: { email } })

        if (!user) {
            return { success: false, error: "Invalid credentials" }
        }

        const isValid = await verifyPassword(password, user.password, user.salt)

        if (!isValid) return { success: false, error: "Invalid credentials" }
        return { success: true, user }
    }
    catch (error) {
        console.error("Sign in error: ", error);
        return { success: false, error: "Failed to sign in" }
    }
}
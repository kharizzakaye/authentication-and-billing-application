import { randomBytes, scrypt } from "crypto"
import { db } from "./db";
import { promisify } from "util";

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
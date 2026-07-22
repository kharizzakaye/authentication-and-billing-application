import { randomBytes, scrypt, timingSafeEqual } from "crypto"
import { promisify } from "util"

const scryptAsync = promisify(scrypt)

// generates a 16-byte random salt, derives a 64-byte key via scrypt, returns both
export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer

    return { salt, hash: derivedKey.toString("hex") }
}

// re-derives the key from password+salt using scrypt, then compares with stored hash using timingSafeEqual (constant-time comparison)
export async function verifyPassword(password: string, hash: string, salt: string) {
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer
    return timingSafeEqual(Buffer.from(hash, "hex"), derivedKey)
}
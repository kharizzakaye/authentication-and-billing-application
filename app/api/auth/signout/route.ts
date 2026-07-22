import { signOut } from "@/app/lib/session"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("signup error: ", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
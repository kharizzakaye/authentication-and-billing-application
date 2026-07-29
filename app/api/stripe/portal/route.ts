import { getSession } from "@/app/lib/session"
import { db } from "@/app/lib/db"
import { stripe } from "@/app/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: session.userId } })
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 401 }
      )
    }

    // built-in stripe portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId, // pull customer id
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })
    console.log(portalSession.url)
    return NextResponse.json({ url: portalSession.url })
  } 
  catch (error) 
  {
    console.error("Error creating portal session:", error)
    return NextResponse.json(
      { error: "Error creating portal session" },
      { status: 500 }
    )
  }
}
import { getSession } from "@/app/lib/session"
import { db } from "@/app/lib/db"
import { stripe, STRIPE_PRICE_IDS } from "@/app/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // get session - check user is logged in
    const session = await getSession()
    if (!session || !session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "User is not logged in" },
        { status: 401 }
      )
    }

    // get the price id
    const { priceId } = await request.json()
    if (!priceId || !(priceId in STRIPE_PRICE_IDS)) { // check  price id
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
    }

    // confirm user
    const user = await db.user.findUnique({ where: { id: session.userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }


    let customerId = user.stripeCustomerId

    // create customer id if has not customer id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // update customer id in the db
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId, // customer id created earlier
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_IDS[priceId as keyof typeof STRIPE_PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, // redirect to if success
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`, // redirect if cancel
      metadata: { // metadata for references
        userId: user.id,
        priceId,
      },
    })
    console.log(checkoutSession.url)

    return NextResponse.json({ url: checkoutSession.url })
  } 
  catch (error) 
  {
    console.error("Error creating checkout session: ", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
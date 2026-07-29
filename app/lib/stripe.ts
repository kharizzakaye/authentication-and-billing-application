import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!

export const STRIPE_PRICE_IDS = {
    premium: "price_1TyS1OJk2DOMh7RS0EHVuXPH",
    pro: "price_1TyS1qJk2DOMh7RS7BK1nNaR"
} as const;

export type StripePriceId = keyof typeof STRIPE_PRICE_IDS;
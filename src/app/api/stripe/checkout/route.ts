import { NextResponse } from "next/server";

/**
 * Stripe Checkout — production-ready shape, mock until keys are configured.
 *
 * TODO(stripe): with STRIPE_SECRET_KEY + STRIPE_PRICE_* set:
 *   1. `npm install stripe`
 *   2. const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
 *   3. const session = await stripe.checkout.sessions.create({
 *        mode: "subscription",
 *        line_items: [{ price: priceId, quantity: 1 }],
 *        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
 *        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
 *        client_reference_id: clerkUserId, // from auth() — links Stripe to Clerk
 *      })
 *   4. return NextResponse.json({ url: session.url })
 * The webhook (../webhook) then records the plan in the subscriptions table.
 */

const PRICE_ENV: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
};

export async function POST(req: Request) {
  const { plan } = (await req.json().catch(() => ({}))) as { plan?: string };

  if (!plan || !(plan in PRICE_ENV)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const configured = Boolean(process.env.STRIPE_SECRET_KEY && PRICE_ENV[plan]);
  if (!configured) {
    // Mock mode: tell the client to apply the plan locally.
    return NextResponse.json({ mock: true });
  }

  // TODO(stripe): replace with the real checkout session creation above.
  return NextResponse.json(
    { error: "Stripe keys detected but checkout not yet implemented — see TODO in this file." },
    { status: 501 }
  );
}

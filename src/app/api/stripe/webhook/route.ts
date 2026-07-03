import { NextResponse } from "next/server";

/**
 * Stripe webhook — placeholder.
 *
 * TODO(stripe): with STRIPE_WEBHOOK_SECRET set:
 *   1. Verify the signature:
 *        const sig = req.headers.get("stripe-signature")!
 *        const event = stripe.webhooks.constructEvent(
 *          await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!)
 *   2. On checkout.session.completed / customer.subscription.updated:
 *        upsert into the Supabase `subscriptions` table using the
 *        SERVICE ROLE key (bypasses RLS) keyed by client_reference_id
 *        (the Clerk user id).
 *   3. On customer.subscription.deleted: set plan back to "free".
 */
export async function POST() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { received: true, mock: true, note: "Stripe webhook not configured yet." },
      { status: 200 }
    );
  }
  // TODO(stripe): implement signature verification + subscription sync.
  return NextResponse.json({ received: true });
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BadgeCheck, CreditCard } from "lucide-react";
import { setSubscription, useStore } from "@/lib/store";
import { getPlan, PLANS } from "@/lib/plans";
import type { PlanId } from "@/lib/types";
import { PageHeader, UsageMeter } from "@/components/ui";
import { PRICING_DISCLAIMER } from "@/lib/constants";

function BillingInner() {
  const search = useSearchParams();
  const { cases, evidence, subscription } = useStore();
  const plan = getPlan(subscription.plan);
  const [pending, setPending] = useState<PlanId | null>(
    (search.get("upgrade") as PlanId | null) ?? null
  );
  const [message, setMessage] = useState("");

  const activeCases = cases.filter((c) => !c.is_archived).length;

  const upgrade = async (target: PlanId) => {
    setMessage("");
    // Real Stripe checkout when configured; graceful mock otherwise.
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: target }),
    });
    const data = (await res.json()) as { url?: string; mock?: boolean };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    // TODO(stripe): remove the mock path once STRIPE_SECRET_KEY and price IDs
    // are configured — /api/stripe/checkout will then return a real session URL
    // and the webhook will update the subscription.
    setSubscription({ plan: target });
    setPending(null);
    setMessage(
      `Mock upgrade applied — you're on the ${getPlan(target).name} plan. Configure Stripe keys for real checkout.`
    );
  };

  return (
    <div>
      <PageHeader title="Billing" subtitle={PRICING_DISCLAIMER} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Current plan</h2>
            <span className="pill border-gold/30 bg-gold/10 text-gold">
              <BadgeCheck size={12} /> {plan.name}
            </span>
          </div>
          <p className="font-display text-3xl font-bold">
            ${plan.price}
            <span className="text-sm font-normal text-muted">/month</span>
          </p>
          <div className="mt-5 space-y-4">
            <UsageMeter label="Active cases" used={activeCases} limit={plan.caseLimit} />
            <UsageMeter label="Evidence items" used={evidence.length} limit={plan.evidenceLimit} />
            <UsageMeter label="Storage" used={0} limit={null} />
          </div>
          <button
            className="btn-ghost mt-5 w-full"
            onClick={() => setMessage("Billing portal opens here once Stripe is configured.")}
          >
            <CreditCard size={15} /> Manage billing
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.filter((p) => p.id !== "free").map((p) => (
              <div
                key={p.id}
                className={`card flex flex-col p-5 ${
                  subscription.plan === p.id ? "border-gold/50" : ""
                }`}
              >
                <h3 className="font-display font-semibold">{p.name}</h3>
                <p className="mt-1 font-display text-2xl font-bold">
                  ${p.price}
                  <span className="text-xs font-normal text-muted">/mo</span>
                </p>
                <p className="mt-2 flex-1 text-xs text-muted">{p.blurb}</p>
                {subscription.plan === p.id ? (
                  <span className="btn-ghost mt-4 w-full cursor-default">Current plan</span>
                ) : (
                  <button className="btn-outline mt-4 w-full" onClick={() => setPending(p.id)}>
                    Upgrade
                  </button>
                )}
              </div>
            ))}
          </div>

          {pending ? (
            <div className="card mt-4 border-gold/40 p-5">
              <p className="text-sm">
                Upgrade to <span className="font-semibold text-gold">{getPlan(pending).name}</span>{" "}
                for ${getPlan(pending).price}/month?
              </p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" onClick={() => void upgrade(pending)}>
                  Continue to checkout
                </button>
                <button className="btn-ghost" onClick={() => setPending(null)}>Cancel</button>
              </div>
            </div>
          ) : null}

          {subscription.plan !== "free" ? (
            <button
              className="btn-ghost mt-4"
              onClick={() => {
                setSubscription({ plan: "free" });
                setMessage("Downgraded to Free (mock).");
              }}
            >
              Downgrade to Free
            </button>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-lg border border-emeraldx/30 bg-emeraldx/10 px-4 py-3 text-sm text-emeraldx">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <BillingInner />
    </Suspense>
  );
}

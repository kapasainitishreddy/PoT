import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { PRICING_DISCLAIMER } from "@/lib/constants";
import { Disclaimer } from "@/components/ui";

export const metadata = { title: "Pricing — ProofTimeline" };

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <ShieldCheck size={22} className="text-gold" />
          <span className="font-display text-lg font-bold">ProofTimeline</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/sign-in" className="btn-ghost">Sign in</Link>
          <Link href="/sign-up" className="btn-primary">Start Free</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Simple pricing for serious documentation
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Start free on your own device. Upgrade when a dispute gets serious.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card relative flex flex-col p-6 ${
                plan.highlighted ? "border-gold/50 shadow-glow" : ""
              }`}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy-950">
                  Most popular
                </span>
              ) : null}
              <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
              <p className="text-xs text-muted">{plan.blurb}</p>
              <p className="mt-4">
                <span className="font-display text-4xl font-bold">${plan.price}</span>
                <span className="text-sm text-muted">/month</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ivory/90">
                    <Check size={15} className="mt-0.5 shrink-0 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.id === "free" ? "/sign-up" : `/billing?upgrade=${plan.id}`}
                className={`mt-6 w-full ${plan.highlighted ? "btn-primary" : "btn-outline"}`}
              >
                {plan.id === "free" ? "Start Free" : `Choose ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted">{PRICING_DISCLAIMER}</p>
        <div className="mx-auto mt-6 max-w-3xl">
          <Disclaimer />
        </div>
      </main>
    </div>
  );
}

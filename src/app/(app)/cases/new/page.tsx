"use client";

import Link from "next/link";
import CaseForm from "@/components/CaseForm";
import { PageHeader, WarningBanner } from "@/components/ui";
import { TRUTH_WARNING } from "@/lib/constants";
import { getPlan } from "@/lib/plans";
import { useStore } from "@/lib/store";

export default function NewCasePage() {
  const { cases, subscription } = useStore();
  const plan = getPlan(subscription.plan);
  const active = cases.filter((c) => !c.is_archived).length;
  const atLimit = plan.caseLimit != null && active >= plan.caseLimit;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Create case" subtitle="Only record facts you know to be true." />
      <div className="mb-5">
        <WarningBanner>{TRUTH_WARNING}</WarningBanner>
      </div>
      {atLimit ? (
        <div className="card p-6 text-center">
          <p className="font-semibold">
            {plan.name} plan limit reached ({plan.caseLimit} active cases).
          </p>
          <p className="mt-1 text-sm text-muted">
            Archive a resolved case or upgrade to keep going.
          </p>
          <Link href="/billing" className="btn-primary mt-4">Upgrade plan</Link>
        </div>
      ) : (
        <CaseForm />
      )}
    </div>
  );
}

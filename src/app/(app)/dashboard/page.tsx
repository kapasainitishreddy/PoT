"use client";

import Link from "next/link";
import {
  CalendarClock,
  FolderOpen,
  Package,
  Plus,
  Shield,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getPlan } from "@/lib/plans";
import {
  Disclaimer,
  DemoBadge,
  PageHeader,
  StatusBadge,
  UsageMeter,
} from "@/components/ui";
import { labelFor, CATEGORIES } from "@/lib/constants";

export default function DashboardPage() {
  const { cases, evidence, subscription } = useStore();
  const plan = getPlan(subscription.plan);

  const activeCases = cases.filter((c) => !c.is_archived);
  const realActiveCases = activeCases.filter((c) => !c.is_demo);
  const realEvidence = evidence.filter((e) => !e.is_demo);
  const today = new Date().toISOString().slice(0, 10);
  const followUpsDue = activeCases.filter(
    (c) => c.follow_up_date && c.follow_up_date <= today
  );
  const packetsReady = activeCases.filter((c) => c.status === "ready");

  const recent = [...cases]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  const stats = [
    { icon: FolderOpen, label: "Active cases", value: activeCases.length },
    { icon: Shield, label: "Evidence items", value: evidence.length },
    { icon: CalendarClock, label: "Follow-ups due", value: followUpsDue.length },
    { icon: Package, label: "Packets ready", value: packetsReady.length },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your evidence is private and organized."
        actions={
          <Link href="/cases/new" className="btn-primary">
            <Plus size={16} /> Create New Case
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <s.icon size={18} className="mb-3 text-gold" />
            <p className="font-display text-3xl font-bold">{s.value}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Plan &amp; usage</h2>
            <span className="pill border-gold/30 bg-gold/10 text-gold">{plan.name}</span>
          </div>
          <div className="space-y-4">
            <UsageMeter label="Active cases" used={realActiveCases.length} limit={plan.caseLimit} />
            <UsageMeter label="Evidence items" used={realEvidence.length} limit={plan.evidenceLimit} />
            <UsageMeter label="Storage" used={0} limit={null} />
          </div>
          <Link href="/billing" className="btn-outline mt-5 w-full">
            Manage plan
          </Link>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Recent activity</h2>
            <Link href="/cases" className="text-xs text-gold hover:underline">
              View all cases
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No cases yet. Create your first case to start collecting proof.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cases/${c.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-navy-800/50"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-semibold">
                        {c.title} <DemoBadge show={c.is_demo} />
                      </p>
                      <p className="text-xs text-muted">
                        {labelFor(CATEGORIES, c.category)} · updated{" "}
                        {new Date(c.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {followUpsDue.length > 0 ? (
        <div className="card mt-5 border-amber-400/30 p-5">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <CalendarClock size={17} className="text-amber-300" /> Follow-ups due
          </h2>
          <ul className="space-y-2">
            {followUpsDue.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <Link href={`/cases/${c.id}`} className="truncate hover:text-gold">
                  {c.title}
                </Link>
                <span className="text-xs text-amber-300">{c.follow_up_date}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive, Plus, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { getPlan } from "@/lib/plans";
import {
  CATEGORIES,
  STATUSES,
  URGENCIES,
  labelFor,
} from "@/lib/constants";
import {
  DemoBadge,
  EmptyState,
  ImportanceBadge,
  PageHeader,
  StatusBadge,
  WarningBanner,
} from "@/components/ui";

export default function CasesPage() {
  const { cases, evidence, subscription } = useStore();
  const plan = getPlan(subscription.plan);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const active = cases.filter((c) => !c.is_archived);
  const archivedCount = cases.length - active.length;
  const atLimit = plan.caseLimit != null && active.length >= plan.caseLimit;

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return cases
      .filter((c) => (showArchived ? c.is_archived : !c.is_archived))
      .filter((c) => category === "all" || c.category === category)
      .filter((c) => status === "all" || c.status === status)
      .filter((c) => urgency === "all" || c.urgency === urgency)
      .filter(
        (c) =>
          !text ||
          [c.title, c.people_involved, c.organization, c.what_happened, c.private_notes]
            .join(" ")
            .toLowerCase()
            .includes(text)
      )
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [cases, q, category, status, urgency, showArchived]);

  const evidenceCount = (caseId: string) =>
    evidence.filter((e) => e.case_id === caseId).length;

  return (
    <div>
      <PageHeader
        title="Cases"
        subtitle="Each case is a private folder of proof."
        actions={
          <>
            {archivedCount > 0 ? (
              <button
                className={showArchived ? "btn-outline" : "btn-ghost"}
                onClick={() => setShowArchived((v) => !v)}
              >
                <Archive size={15} /> Archive ({archivedCount})
              </button>
            ) : null}
            <Link
              href="/cases/new"
              className="btn-primary"
              aria-disabled={atLimit}
              onClick={(e) => {
                if (atLimit) e.preventDefault();
              }}
            >
              <Plus size={16} /> New Case
            </Link>
          </>
        }
      />

      {atLimit ? (
        <div className="mb-4">
          <WarningBanner>
            You&apos;ve reached the {plan.name} plan limit of {plan.caseLimit} active
            cases.{" "}
            <Link href="/billing" className="font-semibold text-gold hover:underline">
              Upgrade
            </Link>{" "}
            or archive a resolved case to create a new one.
          </WarningBanner>
        </div>
      ) : null}

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search cases…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select className="input" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
          <option value="all">All urgencies</option>
          {URGENCIES.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={showArchived ? "No archived cases" : "No cases match"}
          subtitle="Create a case to start collecting evidence, or adjust the filters."
          action={
            <Link href="/cases/new" className="btn-primary">
              <Plus size={16} /> New Case
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="card group flex flex-col p-5 transition-colors hover:border-gold/40"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <StatusBadge status={c.status} />
                <ImportanceBadge importance={c.urgency} />
              </div>
              <h3 className="font-display font-semibold leading-snug group-hover:text-gold">
                {c.title}
              </h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{c.what_happened}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
                <span>{labelFor(CATEGORIES, c.category)}</span>
                <span className="flex items-center gap-2">
                  <DemoBadge show={c.is_demo} />
                  {evidenceCount(c.id)} items
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

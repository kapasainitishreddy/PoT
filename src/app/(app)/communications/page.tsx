"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Phone, Plus, Trash2 } from "lucide-react";
import { createCommunication, deleteCommunication, useStore } from "@/lib/store";
import { useAppUser } from "@/lib/auth";
import { COMM_TYPES, labelFor } from "@/lib/constants";
import type { CommunicationType } from "@/lib/types";
import { DemoBadge, EmptyState, Field, PageHeader } from "@/components/ui";

function CommunicationsInner() {
  const search = useSearchParams();
  const { user } = useAppUser();
  const { cases, communications } = useStore();
  const [caseFilter, setCaseFilter] = useState(search.get("case") ?? "all");
  const [adding, setAdding] = useState(false);

  const [caseId, setCaseId] = useState(search.get("case") ?? "");
  const [type, setType] = useState<CommunicationType>("email");
  const [person, setPerson] = useState("");
  const [happenedAt, setHappenedAt] = useState("");
  const [summary, setSummary] = useState("");
  const [outcome, setOutcome] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  const filtered = communications
    .filter((c) => caseFilter === "all" || c.case_id === caseFilter)
    .sort((a, b) => b.happened_at.localeCompare(a.happened_at));

  const caseTitle = (id: string) => cases.find((c) => c.id === id)?.title ?? "—";

  const submit = () => {
    if (!caseId || !happenedAt) return;
    createCommunication({
      clerk_user_id: user?.id ?? "local-user",
      case_id: caseId,
      type,
      person_contacted: person,
      happened_at: new Date(happenedAt).toISOString(),
      summary,
      outcome,
      next_follow_up: nextFollowUp,
      is_demo: false,
    });
    setAdding(false);
    setPerson("");
    setSummary("");
    setOutcome("");
    setHappenedAt("");
    setNextFollowUp("");
  };

  return (
    <div>
      <PageHeader
        title="Communications Log"
        subtitle="Record every email, call, and message so nothing gets lost."
        actions={
          <button className="btn-primary" onClick={() => setAdding((v) => !v)}>
            <Plus size={16} /> Log communication
          </button>
        }
      />

      <div className="mb-5 max-w-sm">
        <select className="input" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)}>
          <option value="all">All cases</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {adding ? (
        <div className="card mb-6 space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Case">
              <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                <option value="">Select…</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select className="input" value={type} onChange={(e) => setType(e.target.value as CommunicationType)}>
                {COMM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Date & time">
              <input
                type="datetime-local"
                className="input"
                value={happenedAt}
                onChange={(e) => setHappenedAt(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Person contacted">
              <input className="input" value={person} onChange={(e) => setPerson(e.target.value)} />
            </Field>
            <Field label="Next follow-up date">
              <input
                type="date"
                className="input"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Summary">
            <textarea className="input min-h-20" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>
          <Field label="Outcome">
            <input className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)} />
          </Field>
          <p className="text-xs text-muted">
            Tip: save a confirmation screenshot as an evidence item and link it
            to this case.
          </p>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={!caseId || !happenedAt}>
              Save
            </button>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No communications logged"
          subtitle="Every call and email you log strengthens your follow-up history."
        />
      ) : (
        <div className="card divide-y divide-line">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-start gap-3 px-4 py-3.5">
              <Phone size={15} className="mt-1 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {labelFor(COMM_TYPES, c.type)}
                  {c.person_contacted ? ` — ${c.person_contacted}` : ""}
                  <DemoBadge show={c.is_demo} />
                </p>
                <p className="text-xs text-muted">
                  {new Date(c.happened_at).toLocaleString()} · {caseTitle(c.case_id)}
                </p>
                {c.summary ? <p className="mt-1 text-sm text-ivory/85">{c.summary}</p> : null}
                {c.outcome ? (
                  <p className="mt-0.5 text-xs text-muted">Outcome: {c.outcome}</p>
                ) : null}
                {c.next_follow_up ? (
                  <p className="mt-0.5 text-xs text-amber-300">
                    Next follow-up: {c.next_follow_up}
                  </p>
                ) : null}
              </div>
              <button
                className="btn-ghost px-2 py-1"
                onClick={() => deleteCommunication(c.id)}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommunicationsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <CommunicationsInner />
    </Suspense>
  );
}

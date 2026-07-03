"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  FileText,
  ListTree,
  MessageSquareText,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { deleteCase, updateCase, useStore } from "@/lib/store";
import {
  CATEGORIES,
  EVIDENCE_TYPES,
  STATUSES,
  labelFor,
} from "@/lib/constants";
import type { CaseStatus } from "@/lib/types";
import {
  DemoBadge,
  Disclaimer,
  EmptyState,
  ImportanceBadge,
  PageHeader,
  StatusBadge,
} from "@/components/ui";
import { shortHash } from "@/lib/hash";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { cases, evidence, events, communications } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const kase = cases.find((c) => c.id === params.id);
  if (!kase) {
    return (
      <EmptyState
        title="Case not found"
        subtitle="It may have been deleted."
        action={<Link href="/cases" className="btn-primary">Back to cases</Link>}
      />
    );
  }

  const caseEvidence = evidence
    .filter((e) => e.case_id === kase.id)
    .sort((a, b) => b.created_or_captured_at.localeCompare(a.created_or_captured_at));
  const caseEvents = events.filter((e) => e.case_id === kase.id);
  const caseComms = communications.filter((c) => c.case_id === kase.id);

  const fields: [string, string][] = [
    ["Category", labelFor(CATEGORIES, kase.category)],
    ["Incident", kase.incident_at ? new Date(kase.incident_at).toLocaleString() : "Not provided."],
    ["Location", kase.location || "Not provided."],
    ["People involved", kase.people_involved || "Not provided."],
    ["Organization", kase.organization || "Not provided."],
    ["Follow-up date", kase.follow_up_date || "None set"],
  ];

  return (
    <div>
      <PageHeader
        title={kase.title}
        subtitle="Case detail"
        actions={
          <>
            <Link href={`/cases/${kase.id}/edit`} className="btn-ghost">
              <Pencil size={15} /> Edit
            </Link>
            <button
              className="btn-ghost"
              onClick={() => updateCase(kase.id, { is_archived: !kase.is_archived })}
            >
              {kase.is_archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              {kase.is_archived ? "Unarchive" : "Archive"}
            </button>
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} /> Delete
            </button>
          </>
        }
      />

      {confirmDelete ? (
        <div className="card mb-5 border-danger/40 p-5">
          <p className="text-sm">
            Delete this case and all of its evidence, timeline events, and
            communications? This cannot be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="btn-danger"
              onClick={() => {
                deleteCase(kase.id);
                router.replace("/cases");
              }}
            >
              Delete permanently
            </button>
            <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {kase.is_archived ? (
        <div className="card mb-5 border-amber-400/30 p-4 text-sm text-amber-200">
          This case is archived and hidden from your main lists.
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <DemoBadge show={kase.is_demo} />
        <ImportanceBadge importance={kase.urgency} />
        <label className="sr-only" htmlFor="case-status">Status</label>
        <select
          id="case-status"
          className="input w-auto py-1 text-xs"
          value={kase.status}
          onChange={(e) => updateCase(kase.id, { status: e.target.value as CaseStatus })}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <StatusBadge status={kase.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="section-title mb-3">What happened</h2>
            <p className="whitespace-pre-wrap text-sm text-ivory/90">
              {kase.what_happened || "Not provided."}
            </p>
            <h3 className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
              Desired outcome
            </h3>
            <p className="text-sm text-ivory/90">{kase.desired_outcome || "Not provided."}</p>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Evidence ({caseEvidence.length})</h2>
              <Link href={`/evidence/new?case=${kase.id}`} className="btn-outline">
                <Plus size={15} /> Add evidence
              </Link>
            </div>
            {caseEvidence.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No evidence yet. Add photos, screenshots, receipts, or notes.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {caseEvidence.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/evidence/${e.id}`}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-navy-800/40"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate text-sm font-semibold">
                          {e.title} <DemoBadge show={e.is_demo} />
                        </p>
                        <p className="text-xs text-muted">
                          {labelFor(EVIDENCE_TYPES, e.type)}
                          {e.file_hash ? ` · ${shortHash(e.file_hash)}` : ""}
                        </p>
                      </div>
                      <ImportanceBadge importance={e.importance} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {kase.private_notes ? (
            <div className="card p-5">
              <h2 className="section-title mb-2">Private notes</h2>
              <p className="whitespace-pre-wrap text-sm text-muted">{kase.private_notes}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="section-title mb-3">Details</h2>
            <dl className="space-y-3">
              {fields.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card space-y-2 p-5">
            <h2 className="section-title mb-2">Next steps</h2>
            <Link href={`/timeline?case=${kase.id}`} className="btn-ghost w-full justify-start">
              <ListTree size={15} /> Timeline ({caseEvents.length} events)
            </Link>
            <Link href={`/packets?case=${kase.id}`} className="btn-ghost w-full justify-start">
              <Package size={15} /> Build evidence packet
            </Link>
            <Link href={`/scripts?case=${kase.id}`} className="btn-ghost w-full justify-start">
              <MessageSquareText size={15} /> Follow-up script
            </Link>
            <Link href={`/communications?case=${kase.id}`} className="btn-ghost w-full justify-start">
              <FileText size={15} /> Communications ({caseComms.length})
            </Link>
          </div>

          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}

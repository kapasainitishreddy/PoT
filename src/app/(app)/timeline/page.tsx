"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import { createEvent, deleteEvent, updateEvent, useStore } from "@/lib/store";
import { useAppUser } from "@/lib/auth";
import { IMPORTANCES } from "@/lib/constants";
import type { Importance } from "@/lib/types";
import {
  DemoBadge,
  EmptyState,
  Field,
  ImportanceBadge,
  PageHeader,
} from "@/components/ui";

type Entry = {
  id: string;
  at: string;
  kind: "event" | "evidence" | "communication" | "incident" | "follow_up";
  title: string;
  description: string;
  importance: Importance;
  isKey: boolean;
  showInPacket: boolean;
  isDemo: boolean;
  editable: boolean;
  link?: string;
};

function TimelineInner() {
  const search = useSearchParams();
  const { user } = useAppUser();
  const { cases, evidence, events, communications } = useStore();
  const [caseId, setCaseId] = useState(search.get("case") ?? "all");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [happenedAt, setHappenedAt] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState<Importance>("medium");
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);

  const scopedCases = caseId === "all" ? cases : cases.filter((c) => c.id === caseId);

  const entries: Entry[] = useMemo(() => {
    const inScope = (id: string) => caseId === "all" || id === caseId;
    const list: Entry[] = [];

    for (const c of scopedCases) {
      if (c.incident_at) {
        list.push({
          id: `incident-${c.id}`,
          at: c.incident_at,
          kind: "incident",
          title: `Incident — ${c.title}`,
          description: c.what_happened,
          importance: c.urgency,
          isKey: true,
          showInPacket: true,
          isDemo: c.is_demo,
          editable: false,
          link: `/cases/${c.id}`,
        });
      }
      if (c.follow_up_date) {
        list.push({
          id: `follow-${c.id}`,
          at: `${c.follow_up_date}T09:00:00.000Z`,
          kind: "follow_up",
          title: `Follow-up due — ${c.title}`,
          description: "",
          importance: "medium",
          isKey: false,
          showInPacket: false,
          isDemo: c.is_demo,
          editable: false,
          link: `/cases/${c.id}`,
        });
      }
    }
    for (const e of events.filter((e) => inScope(e.case_id))) {
      list.push({
        id: e.id,
        at: e.happened_at,
        kind: "event",
        title: e.title,
        description: e.description,
        importance: e.importance,
        isKey: e.is_key_event,
        showInPacket: e.show_in_packet,
        isDemo: e.is_demo,
        editable: true,
      });
    }
    for (const e of evidence.filter((e) => inScope(e.case_id))) {
      list.push({
        id: `ev-${e.id}`,
        at: e.created_or_captured_at || e.uploaded_at,
        kind: "evidence",
        title: `Evidence — ${e.title}`,
        description: e.description,
        importance: e.importance,
        isKey: false,
        showInPacket: e.include_in_export,
        isDemo: e.is_demo,
        editable: false,
        link: `/evidence/${e.id}`,
      });
    }
    for (const c of communications.filter((c) => inScope(c.case_id))) {
      list.push({
        id: `comm-${c.id}`,
        at: c.happened_at,
        kind: "communication",
        title: `Communication — ${c.person_contacted || c.type}`,
        description: c.summary,
        importance: "medium",
        isKey: false,
        showInPacket: true,
        isDemo: c.is_demo,
        editable: false,
        link: `/communications`,
      });
    }
    return list
      .filter((e) => e.at)
      .sort((a, b) => a.at.localeCompare(b.at));
  }, [scopedCases, events, evidence, communications, caseId]);

  const KIND_STYLE: Record<Entry["kind"], string> = {
    incident: "border-danger/60 bg-danger/20",
    event: "border-gold/60 bg-gold/20",
    evidence: "border-emeraldx/60 bg-emeraldx/20",
    communication: "border-sky-400/60 bg-sky-400/20",
    follow_up: "border-amber-400/60 bg-amber-400/20",
  };

  const addEvent = () => {
    if (!title.trim() || !happenedAt || caseId === "all") return;
    createEvent({
      clerk_user_id: user?.id ?? "local-user",
      case_id: caseId,
      happened_at: new Date(happenedAt).toISOString(),
      title: title.trim(),
      description,
      evidence_ids: evidenceIds,
      importance,
      tags: [],
      source: "",
      is_key_event: false,
      show_in_packet: true,
      is_demo: false,
    });
    setAdding(false);
    setTitle("");
    setHappenedAt("");
    setDescription("");
    setEvidenceIds([]);
  };

  return (
    <div>
      <PageHeader
        title="Timeline"
        subtitle="Incidents, evidence, communications, and follow-ups in order."
        actions={
          <button
            className="btn-primary"
            onClick={() => setAdding((v) => !v)}
            disabled={caseId === "all"}
            title={caseId === "all" ? "Choose a case to add manual events" : ""}
          >
            <Plus size={16} /> Add manual event
          </button>
        }
      />

      <div className="mb-5 max-w-sm">
        <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
          <option value="all">All cases</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {adding ? (
        <div className="card mb-6 space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Event title">
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
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
          <Field label="Description">
            <textarea
              className="input min-h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Importance">
              <select
                className="input"
                value={importance}
                onChange={(e) => setImportance(e.target.value as Importance)}
              >
                {IMPORTANCES.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Link evidence">
              <select
                className="input"
                multiple
                value={evidenceIds}
                onChange={(e) =>
                  setEvidenceIds(Array.from(e.target.selectedOptions).map((o) => o.value))
                }
              >
                {evidence
                  .filter((e) => e.case_id === caseId)
                  .map((e) => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={addEvent}>Add event</button>
          </div>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing on the timeline yet"
          subtitle="Add cases, evidence, and events — they merge into one chronology automatically."
        />
      ) : (
        <ol className="relative ml-3 space-y-5 border-l border-line pl-6">
          {entries.map((e) => {
            const realEvent = events.find((ev) => ev.id === e.id);
            return (
              <li key={e.id} className="relative">
                <span
                  className={`absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border ${KIND_STYLE[e.kind]}`}
                />
                <div className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted">
                      {new Date(e.at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      {e.isKey ? <Star size={13} className="text-gold" /> : null}
                      <DemoBadge show={e.isDemo} />
                      <ImportanceBadge importance={e.importance} />
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-semibold">
                    {e.link ? (
                      <Link href={e.link} className="hover:text-gold">{e.title}</Link>
                    ) : (
                      e.title
                    )}
                  </p>
                  {e.description ? (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{e.description}</p>
                  ) : null}
                  {e.editable && realEvent ? (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                      <button
                        className="btn-ghost px-2 py-1 text-xs"
                        onClick={() =>
                          updateEvent(realEvent.id, { is_key_event: !realEvent.is_key_event })
                        }
                      >
                        <Star size={12} /> {realEvent.is_key_event ? "Unmark key" : "Mark key event"}
                      </button>
                      <button
                        className="btn-ghost px-2 py-1 text-xs"
                        onClick={() =>
                          updateEvent(realEvent.id, { show_in_packet: !realEvent.show_in_packet })
                        }
                      >
                        {realEvent.show_in_packet ? <EyeOff size={12} /> : <Eye size={12} />}
                        {realEvent.show_in_packet ? "Hide in packet" : "Show in packet"}
                      </button>
                      <button
                        className="btn-danger px-2 py-1 text-xs"
                        onClick={() => deleteEvent(realEvent.id)}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <TimelineInner />
    </Suspense>
  );
}

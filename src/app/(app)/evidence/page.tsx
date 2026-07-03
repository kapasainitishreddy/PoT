"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderInput, Plus, Search, Trash2, X } from "lucide-react";
import { deleteEvidence, moveEvidence, useStore } from "@/lib/store";
import { EVIDENCE_TYPES, IMPORTANCES, labelFor } from "@/lib/constants";
import {
  DemoBadge,
  EmptyState,
  ImportanceBadge,
  PageHeader,
} from "@/components/ui";
import { formatBytes, shortHash } from "@/lib/hash";

export default function EvidencePage() {
  const { evidence, cases } = useStore();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [importance, setImportance] = useState("all");
  const [tag, setTag] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveTarget, setMoveTarget] = useState("");

  const allTags = useMemo(
    () => Array.from(new Set(evidence.flatMap((e) => e.tags))).sort(),
    [evidence]
  );

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return evidence
      .filter((e) => type === "all" || e.type === type)
      .filter((e) => importance === "all" || e.importance === importance)
      .filter((e) => tag === "all" || e.tags.includes(tag))
      .filter(
        (e) =>
          !text ||
          [e.title, e.description, e.source, e.tags.join(" "), e.private_note]
            .join(" ")
            .toLowerCase()
            .includes(text)
      )
      .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
  }, [evidence, q, type, importance, tag]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const caseTitle = (id: string) =>
    cases.find((c) => c.id === id)?.title ?? "Unassigned";

  return (
    <div>
      <PageHeader
        title="Evidence"
        subtitle="Originals stay unchanged. Every file gets a SHA-256 fingerprint."
        actions={
          <Link href="/evidence/new" className="btn-primary">
            <Plus size={16} /> Add evidence
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search evidence…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          {EVIDENCE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select className="input" value={importance} onChange={(e) => setImportance(e.target.value)}>
          <option value="all">All importance</option>
          {IMPORTANCES.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
        <select className="input" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="all">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No evidence matches"
          subtitle="Upload photos, screenshots, receipts, or notes — or adjust the filters."
          action={
            <Link href="/evidence/new" className="btn-primary">
              <Plus size={16} /> Add evidence
            </Link>
          }
        />
      ) : (
        <div className="card divide-y divide-line">
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={selected.has(e.id)}
                onChange={() => toggle(e.id)}
                className="h-4 w-4 shrink-0 accent-[#e9c176]"
                aria-label={`Select ${e.title}`}
              />
              <Link href={`/evidence/${e.id}`} className="min-w-0 flex-1 hover:text-gold">
                <p className="flex flex-wrap items-center gap-2 truncate text-sm font-semibold">
                  {e.title} <DemoBadge show={e.is_demo} />
                </p>
                <p className="truncate text-xs text-muted">
                  {labelFor(EVIDENCE_TYPES, e.type)} · {caseTitle(e.case_id)}
                  {e.file_size ? ` · ${formatBytes(e.file_size)}` : ""}
                  {e.file_hash ? ` · ${shortHash(e.file_hash)}` : ""}
                </p>
                {e.tags.length ? (
                  <p className="mt-1 flex flex-wrap gap-1">
                    {e.tags.map((t) => (
                      <span key={t} className="rounded bg-navy-700 px-1.5 py-0.5 text-[10px] text-muted">
                        {t}
                      </span>
                    ))}
                  </p>
                ) : null}
              </Link>
              <ImportanceBadge importance={e.importance} />
            </div>
          ))}
        </div>
      )}

      {selected.size > 0 ? (
        <div className="no-print fixed inset-x-0 bottom-16 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-2xl flex-wrap items-center gap-3 rounded-xl border border-gold/30 bg-navy-950/95 px-4 py-3 shadow-glow backdrop-blur lg:bottom-6">
          <span className="text-sm font-semibold text-gold">{selected.size} selected</span>
          <select
            className="input w-auto flex-1 py-1.5 text-xs"
            value={moveTarget}
            onChange={(e) => setMoveTarget(e.target.value)}
          >
            <option value="">Move to case…</option>
            {cases
              .filter((c) => !c.is_archived)
              .map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
          </select>
          <button
            className="btn-outline py-1.5"
            disabled={!moveTarget}
            onClick={() => {
              moveEvidence(Array.from(selected), moveTarget);
              setSelected(new Set());
              setMoveTarget("");
            }}
          >
            <FolderInput size={14} /> Move
          </button>
          <button
            className="btn-danger py-1.5"
            onClick={() => {
              if (window.confirm(`Delete ${selected.size} evidence item(s)? This cannot be undone.`)) {
                deleteEvidence(Array.from(selected));
                setSelected(new Set());
              }
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
          <button className="btn-ghost py-1.5" onClick={() => setSelected(new Set())}>
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

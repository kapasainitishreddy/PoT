"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Braces, FileSpreadsheet, Package, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { PACKET_TYPES } from "@/lib/constants";
import type { PacketOptions, PacketType } from "@/lib/types";
import {
  buildPacket,
  download,
  evidenceIndexCsv,
  packetToJson,
  type PacketDocument,
} from "@/lib/packet";
import { EmptyState, Field, PageHeader, WarningBanner } from "@/components/ui";

const DEFAULT_OPTS: PacketOptions = {
  includeAllEvidence: true,
  selectedEvidenceIds: [],
  hidePrivateNotes: true,
  includeFileHashes: true,
  includeScripts: false,
  includeContactDetails: false,
  includeUploadTimestamps: true,
  includeOriginalFilenames: true,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

function PacketsInner() {
  const search = useSearchParams();
  const { cases, evidence, events, communications, subscription } = useStore();
  const [caseId, setCaseId] = useState(search.get("case") ?? "");
  useEffect(() => {
    if (!caseId && cases.length > 0) setCaseId(cases[0].id);
  }, [cases.length, caseId]);
  const [packetType, setPacketType] = useState<PacketType>("police_prep");
  const [opts, setOpts] = useState<PacketOptions>(DEFAULT_OPTS);
  const [doc, setDoc] = useState<PacketDocument | null>(null);

  const kase = cases.find((c) => c.id === caseId);
  const caseEvidence = evidence.filter((e) => e.case_id === caseId);

  const set = (patch: Partial<PacketOptions>) => setOpts((o) => ({ ...o, ...patch }));

  const generate = () => {
    if (!kase) return;
    setDoc(
      buildPacket(
        packetType,
        kase,
        caseEvidence,
        events.filter((e) => e.case_id === caseId),
        communications.filter((c) => c.case_id === caseId),
        opts,
        subscription.plan
      )
    );
  };

  const toggles: [keyof PacketOptions, string][] = [
    ["hidePrivateNotes", "Hide private notes"],
    ["includeFileHashes", "Include file hashes (fingerprints)"],
    ["includeContactDetails", "Include my contact details"],
    ["includeUploadTimestamps", "Include upload timestamps"],
    ["includeOriginalFilenames", "Include original filenames"],
  ];

  return (
    <div>
      <PageHeader
        title="Evidence Packet Builder"
        subtitle="Assemble your real documentation into a professional, export-ready packet."
      />
      <div className="mb-5">
        <WarningBanner>
          Packets are built only from what you entered — nothing is invented.
          Missing details appear as &quot;Not provided.&quot;
        </WarningBanner>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="no-print space-y-5">
          <div className="card space-y-4 p-5">
            <Field label="Case">
              <select className="input" value={caseId} onChange={(e) => { setCaseId(e.target.value); setDoc(null); }}>
                <option value="">Select a case…</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Packet type">
              <select
                className="input"
                value={packetType}
                onChange={(e) => setPacketType(e.target.value as PacketType)}
              >
                {PACKET_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>

            <div className="space-y-2 border-t border-line pt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={opts.includeAllEvidence}
                  onChange={() => set({ includeAllEvidence: true })}
                  className="accent-[#e9c176]"
                />
                Include all export-enabled evidence
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!opts.includeAllEvidence}
                  onChange={() => set({ includeAllEvidence: false })}
                  className="accent-[#e9c176]"
                />
                Include selected evidence only
              </label>
              {!opts.includeAllEvidence ? (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
                  {caseEvidence.map((e) => (
                    <label key={e.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        className="accent-[#e9c176]"
                        checked={opts.selectedEvidenceIds.includes(e.id)}
                        onChange={(ev) =>
                          set({
                            selectedEvidenceIds: ev.target.checked
                              ? [...opts.selectedEvidenceIds, e.id]
                              : opts.selectedEvidenceIds.filter((id) => id !== e.id),
                          })
                        }
                      />
                      {e.title}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2 border-t border-line pt-4">
              {toggles.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-[#e9c176]"
                    checked={Boolean(opts[key])}
                    onChange={(e) => set({ [key]: e.target.checked } as Partial<PacketOptions>)}
                  />
                  {label}
                </label>
              ))}
            </div>

            {opts.includeContactDetails ? (
              <div className="space-y-3 border-t border-line pt-4">
                <Field label="Name">
                  <input className="input" value={opts.contactName} onChange={(e) => set({ contactName: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input className="input" value={opts.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className="input" value={opts.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
                </Field>
              </div>
            ) : null}

            <button className="btn-primary w-full" disabled={!kase} onClick={generate}>
              <Package size={16} /> Generate packet
            </button>
          </div>

          {doc ? (
            <div className="card space-y-2 p-5">
              <h2 className="section-title mb-1">Export</h2>
              <button className="btn-outline w-full" onClick={() => window.print()}>
                <Printer size={15} /> Print / Save as PDF
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() => download(`packet-${caseId}.json`, packetToJson(doc), "application/json")}
              >
                <Braces size={15} /> Export JSON
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() =>
                  download(`evidence-index-${caseId}.csv`, evidenceIndexCsv(caseEvidence), "text/csv")
                }
              >
                <FileSpreadsheet size={15} /> Evidence index CSV
              </button>
              <p className="pt-1 text-[11px] text-muted">
                ZIP export with original files: coming soon.
              </p>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          {!doc ? (
            <EmptyState
              title="Packet preview"
              subtitle="Choose a case and packet type, then generate to preview here. Print or save as PDF when ready."
            />
          ) : (
            <PacketPreview doc={doc} />
          )}
        </div>
      </div>
    </div>
  );
}

function PacketPreview({ doc }: { doc: PacketDocument }) {
  return (
    <div className="print-sheet card relative overflow-hidden bg-white p-8 text-neutral-900 md:p-10">
      {doc.isDemo ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-24deg] text-6xl font-black tracking-widest text-red-500/15">
            DEMO ONLY
          </span>
        </div>
      ) : doc.watermark ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-24deg] text-5xl font-black tracking-widest text-neutral-900/5">
            ProofTimeline Free
          </span>
        </div>
      ) : null}

      {/* Cover */}
      <div className="border-b-2 border-neutral-900 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {doc.packetTypeLabel}
          {doc.isDemo ? " — DEMO ONLY" : ""}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-neutral-900">{doc.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Generated {new Date(doc.generatedAt).toLocaleString()}
        </p>
        <p className="mt-4 rounded border border-neutral-300 bg-neutral-50 p-3 text-xs italic text-neutral-600">
          {doc.statement}
        </p>
      </div>

      {doc.sections.map((s) => (
        <section key={s.heading} className="mt-6">
          <h2 className="border-b border-neutral-300 pb-1 font-display text-base font-bold uppercase tracking-wide text-neutral-800">
            {s.heading}
          </h2>
          <div className="mt-2 space-y-1.5">
            {s.lines.map((line, i) => (
              <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-8 border-t-2 border-neutral-900 pt-4">
        <p className="text-[11px] leading-relaxed text-neutral-500">{doc.disclaimer}</p>
      </footer>
    </div>
  );
}

export default function PacketsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <PacketsInner />
    </Suspense>
  );
}

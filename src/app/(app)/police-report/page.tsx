"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertOctagon, ClipboardCheck, FileText, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { DISCLAIMER, PACKET_STATEMENT } from "@/lib/constants";
import { Field, PageHeader, WarningBanner } from "@/components/ui";

const NP = "Not provided.";
const orNP = (v: string) => (v.trim() ? v.trim() : NP);

interface PrepForm {
  incidentType: string;
  incidentAt: string;
  location: string;
  whatHappened: string;
  peopleInvolved: string;
  witnesses: string;
  itemsLost: string;
  priorReports: string;
  desiredNextStep: string;
}

const EMPTY: PrepForm = {
  incidentType: "",
  incidentAt: "",
  location: "",
  whatHappened: "",
  peopleInvolved: "",
  witnesses: "",
  itemsLost: "",
  priorReports: "",
  desiredNextStep: "",
};

export default function PoliceReportPrepPage() {
  const { cases, evidence } = useStore();
  const [caseId, setCaseId] = useState("");
  const [form, setForm] = useState<PrepForm>(EMPTY);
  const [summary, setSummary] = useState<PrepForm | null>(null);

  const set = (patch: Partial<PrepForm>) => setForm((f) => ({ ...f, ...patch }));

  const loadFromCase = (id: string) => {
    setCaseId(id);
    const kase = cases.find((c) => c.id === id);
    if (!kase) return;
    setForm({
      ...EMPTY,
      incidentAt: kase.incident_at ? kase.incident_at.slice(0, 16) : "",
      location: kase.location,
      whatHappened: kase.what_happened,
      peopleInvolved: kase.people_involved,
      desiredNextStep: kase.desired_outcome,
    });
  };

  const attachedEvidence = evidence.filter(
    (e) => e.case_id === caseId && e.include_in_export
  );
  const selectedCase = cases.find((c) => c.id === caseId);

  return (
    <div>
      <PageHeader
        title="Police Report Preparation"
        subtitle="A guided flow that organizes the facts before you contact police."
      />

      <div className="mb-5 space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
          <AlertOctagon size={18} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm font-semibold">
            If you are in immediate danger, call emergency services now.
          </p>
        </div>
        <WarningBanner>
          Only submit truthful information. False reports may have serious
          consequences.
        </WarningBanner>
        <WarningBanner>
          This app prepares documentation. It does not submit reports directly
          to police.
        </WarningBanner>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="no-print card space-y-4 p-5">
          <Field label="Start from an existing case (optional)">
            <select className="input" value={caseId} onChange={(e) => loadFromCase(e.target.value)}>
              <option value="">Blank form</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Incident type">
            <input
              className="input"
              value={form.incidentType}
              onChange={(e) => set({ incidentType: e.target.value })}
              placeholder="e.g. Theft of personal property"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Incident date & time">
              <input
                type="datetime-local"
                className="input"
                value={form.incidentAt}
                onChange={(e) => set({ incidentAt: e.target.value })}
              />
            </Field>
            <Field label="Incident location">
              <input
                className="input"
                value={form.location}
                onChange={(e) => set({ location: e.target.value })}
              />
            </Field>
          </div>
          <Field label="What happened?">
            <textarea
              className="input min-h-28"
              value={form.whatHappened}
              onChange={(e) => set({ whatHappened: e.target.value })}
              placeholder="Only facts you know to be true, in order."
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="People involved">
              <input
                className="input"
                value={form.peopleInvolved}
                onChange={(e) => set({ peopleInvolved: e.target.value })}
              />
            </Field>
            <Field label="Witnesses">
              <input
                className="input"
                value={form.witnesses}
                onChange={(e) => set({ witnesses: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Items lost / damaged">
            <textarea
              className="input min-h-16"
              value={form.itemsLost}
              onChange={(e) => set({ itemsLost: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prior reports (if any)">
              <input
                className="input"
                value={form.priorReports}
                onChange={(e) => set({ priorReports: e.target.value })}
                placeholder="Leave blank if none"
              />
            </Field>
            <Field label="Desired next step">
              <input
                className="input"
                value={form.desiredNextStep}
                onChange={(e) => set({ desiredNextStep: e.target.value })}
              />
            </Field>
          </div>
          <button className="btn-primary w-full" onClick={() => setSummary({ ...form })}>
            <FileText size={16} /> Build preparation summary
          </button>
        </div>

        <div>
          {!summary ? (
            <div className="card flex h-full min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
              <ClipboardCheck size={22} className="text-gold" />
              <p className="font-display font-semibold">Preparation summary</p>
              <p className="max-w-sm text-sm text-muted">
                Fill in the guided form and build a clean summary you can bring
                to the station or use for an online report form.
              </p>
            </div>
          ) : (
            <div className="print-sheet card relative bg-white p-8 text-neutral-900">
              {selectedCase?.is_demo ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="rotate-[-24deg] text-6xl font-black tracking-widest text-red-500/15">
                    DEMO ONLY
                  </span>
                </div>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Police report preparation summary
                {selectedCase?.is_demo ? " — DEMO ONLY" : ""}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold">
                {orNP(summary.incidentType)}
              </h2>
              <p className="mt-3 rounded border border-neutral-300 bg-neutral-50 p-3 text-xs italic text-neutral-600">
                {PACKET_STATEMENT}
              </p>
              <dl className="mt-5 space-y-3 text-sm">
                {(
                  [
                    ["Incident date/time", summary.incidentAt ? new Date(summary.incidentAt).toLocaleString() : NP],
                    ["Location", orNP(summary.location)],
                    ["What happened", orNP(summary.whatHappened)],
                    ["People involved", orNP(summary.peopleInvolved)],
                    ["Witnesses", orNP(summary.witnesses)],
                    ["Items lost/damaged", orNP(summary.itemsLost)],
                    ["Prior reports", orNP(summary.priorReports)],
                    ["Desired next step", orNP(summary.desiredNextStep)],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{k}</dt>
                    <dd className="whitespace-pre-wrap">{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Evidence checklist
                  </dt>
                  <dd>
                    {attachedEvidence.length ? (
                      <ul className="mt-1 list-disc pl-5">
                        {attachedEvidence.map((e) => (
                          <li key={e.id}>{e.title}</li>
                        ))}
                      </ul>
                    ) : (
                      "No evidence attached from a case. Select a case above to include its evidence list."
                    )}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 border-t border-neutral-300 pt-3 text-[11px] text-neutral-500">
                {DISCLAIMER}
              </p>
              <div className="no-print mt-5 flex gap-2">
                <button className="btn-primary" onClick={() => window.print()}>
                  <Printer size={15} /> Print / Save as PDF
                </button>
                {caseId ? (
                  <Link href={`/packets?case=${caseId}`} className="btn-outline">
                    Full evidence packet
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

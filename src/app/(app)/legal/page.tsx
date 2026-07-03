"use client";

import Link from "next/link";
import { useState } from "react";
import { Gavel, Package } from "lucide-react";
import { useStore } from "@/lib/store";
import { Field, PageHeader, WarningBanner } from "@/components/ui";
import type { PacketType } from "@/lib/types";

const FLOWS: {
  id: string;
  label: string;
  packet: PacketType;
  checklist: string[];
}[] = [
  {
    id: "attorney",
    label: "Attorney review",
    packet: "attorney_review",
    checklist: [
      "Write a one-paragraph summary of the dispute in plain language.",
      "List the key dates in order (the timeline page builds this for you).",
      "Gather contracts, receipts, and written communications as evidence items.",
      "Note what outcome you want, and any deadlines you know about.",
      "Export the Attorney Review Packet and bring it to your consultation.",
    ],
  },
  {
    id: "landlord",
    label: "Landlord dispute",
    packet: "landlord_tenant",
    checklist: [
      "Photograph the issue with dates (before/after photos if repairs happen).",
      "Save every written request you sent and any replies received.",
      "Log calls and conversations in the Communications page.",
      "Check your lease for repair and notice clauses; add relevant pages as evidence.",
      "Export the Landlord/Tenant Packet before escalating.",
    ],
  },
  {
    id: "workplace",
    label: "Workplace issue",
    packet: "workplace",
    checklist: [
      "Record each incident promptly with date, time, place, and people present.",
      "Keep copies of relevant emails and messages as evidence items.",
      "Note any reports you made internally and the response.",
      "Keep records factual — avoid speculation in descriptions.",
      "Export the Workplace Documentation Packet before meetings with HR or an advisor.",
    ],
  },
  {
    id: "billing",
    label: "Billing dispute",
    packet: "support_escalation",
    checklist: [
      "Add the disputed bill and the original agreement/plan as evidence.",
      "Note the exact amounts and dates involved.",
      "Log each support contact in Communications.",
      "Use the Script Generator for a calm escalation message.",
      "Export the Support Escalation Packet if the dispute continues.",
    ],
  },
  {
    id: "small_claims",
    label: "Small claims preparation",
    packet: "attorney_review",
    checklist: [
      "Confirm the amount in dispute and collect proof of it (receipts, invoices).",
      "Build the timeline of events, marking key events.",
      "Collect written demands you sent and any responses.",
      "Check your local court's own filing instructions — requirements vary.",
      "Export a packet to organize the facts before filing.",
    ],
  },
  {
    id: "insurance",
    label: "Insurance claim",
    packet: "insurance_claim",
    checklist: [
      "Photograph damage or loss as soon as possible.",
      "Add your policy number and relevant policy pages as evidence.",
      "Log every call with the insurer, including claim numbers they give you.",
      "Keep receipts for any related costs.",
      "Export the Insurance Claim Packet to accompany your claim.",
    ],
  },
];

export default function LegalModePage() {
  const { cases } = useStore();
  const [flowId, setFlowId] = useState(FLOWS[0].id);
  const [caseId, setCaseId] = useState("");
  const flow = FLOWS.find((f) => f.id === flowId) ?? FLOWS[0];

  return (
    <div>
      <PageHeader
        title="Legal Documentation Mode"
        subtitle="Guided flows for organizing facts before speaking with a professional."
      />
      <div className="mb-5">
        <WarningBanner>
          This is not legal advice. This format only helps you organize facts
          before speaking with a qualified professional or submitting a
          complaint.
        </WarningBanner>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card space-y-4 p-5">
          <Field label="What are you preparing for?">
            <select className="input" value={flowId} onChange={(e) => setFlowId(e.target.value)}>
              {FLOWS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Case to work from">
            <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
              <option value="">Choose a case…</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </Field>
          <Link
            href={caseId ? `/packets?case=${caseId}` : "/packets"}
            className="btn-primary w-full"
          >
            <Package size={16} /> Build the packet
          </Link>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Gavel size={17} className="text-gold" /> {flow.label} — preparation checklist
          </h2>
          <ol className="space-y-3">
            {flow.checklist.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-xs font-bold text-gold">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-ivory/90">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
            Recommended export: <span className="text-gold">{flow.packet.replace(/_/g, " ")}</span> packet.
            Everything in the packet comes from your own entries — nothing is
            generated that you didn&apos;t provide.
          </p>
        </div>
      </div>
    </div>
  );
}

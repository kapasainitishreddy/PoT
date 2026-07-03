import {
  CATEGORIES,
  DISCLAIMER,
  EVIDENCE_TYPES,
  IMPORTANCES,
  PACKET_STATEMENT,
  PACKET_TYPES,
  labelFor,
} from "./constants";
import { formatBytes, shortHash } from "./hash";
import type {
  Case,
  Communication,
  EvidenceItem,
  PacketOptions,
  PacketType,
  PlanId,
  TimelineEvent,
} from "./types";

/**
 * Evidence packet document builder.
 *
 * Ethical contract — this generator NEVER invents facts. Every section is
 * assembled verbatim from user-provided data; any missing field renders as
 * "Not provided." It never fabricates dates, names, report numbers, or
 * official references, and never applies official-looking seals or agency
 * formatting. Plain professional formatting only.
 *
 * TODO(ai): Pro-plan "AI polish" can send these same sections to an LLM
 * with a system prompt enforcing the identical rules (never invent facts;
 * say "Not provided." for gaps). The deterministic builder below is the
 * ground truth either way.
 */

const NP = "Not provided.";

function orNP(value: string | undefined | null): string {
  const v = (value ?? "").trim();
  return v.length ? v : NP;
}

function fmtDate(iso: string): string {
  if (!iso) return NP;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return NP;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(iso: string): string {
  if (!iso) return NP;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return NP;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface PacketSection {
  heading: string;
  lines: string[];
}

export interface PacketDocument {
  title: string;
  packetTypeLabel: string;
  generatedAt: string;
  isDemo: boolean;
  watermark: boolean;
  statement: string;
  disclaimer: string;
  sections: PacketSection[];
}

export function buildPacket(
  packetType: PacketType,
  kase: Case,
  evidence: EvidenceItem[],
  events: TimelineEvent[],
  communications: Communication[],
  opts: PacketOptions,
  plan: PlanId
): PacketDocument {
  const included = opts.includeAllEvidence
    ? evidence.filter((e) => e.include_in_export)
    : evidence.filter((e) => opts.selectedEvidenceIds.includes(e.id));

  const sections: PacketSection[] = [];

  if (opts.includeContactDetails) {
    sections.push({
      heading: "Prepared by",
      lines: [
        `Name: ${orNP(opts.contactName)}`,
        `Email: ${orNP(opts.contactEmail)}`,
        `Phone: ${orNP(opts.contactPhone)}`,
      ],
    });
  }

  sections.push({
    heading: "Case overview",
    lines: [
      `Case title: ${orNP(kase.title)}`,
      `Category: ${labelFor(CATEGORIES, kase.category)}`,
      `Incident date/time: ${fmtDate(kase.incident_at)}`,
      `Incident location: ${orNP(kase.location)}`,
      `People involved: ${orNP(kase.people_involved)}`,
      `Organization/company involved: ${orNP(kase.organization)}`,
    ],
  });

  sections.push({
    heading: "Incident overview",
    lines: [orNP(kase.what_happened)],
  });

  sections.push({
    heading: "Desired outcome",
    lines: [orNP(kase.desired_outcome)],
  });

  const timelineEntries = [
    ...events
      .filter((e) => e.show_in_packet)
      .map((e) => ({
        at: e.happened_at,
        text: `${e.title}${e.is_key_event ? " (key event)" : ""} — ${orNP(e.description)}`,
      })),
    ...included.map((e) => ({
      at: e.created_or_captured_at,
      text: `Evidence created/captured: ${e.title}`,
    })),
  ]
    .filter((e) => e.at)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  sections.push({
    heading: "Chronological timeline",
    lines: timelineEntries.length
      ? timelineEntries.map((e) => `${fmtDate(e.at)} — ${e.text}`)
      : [NP],
  });

  sections.push({
    heading: "Evidence index",
    lines: included.length
      ? included.map(
          (e, i) =>
            `${i + 1}. ${e.title} — ${labelFor(EVIDENCE_TYPES, e.type)} — Importance: ${labelFor(IMPORTANCES, e.importance)} — Created: ${fmtDay(e.created_or_captured_at)}`
        )
      : [NP],
  });

  for (const [i, e] of included.entries()) {
    const lines = [
      `Type: ${labelFor(EVIDENCE_TYPES, e.type)}`,
      `Created/captured: ${fmtDate(e.created_or_captured_at)}`,
      `Description: ${orNP(e.description)}`,
      `Source/person/company: ${orNP(e.source)}`,
      `Importance: ${labelFor(IMPORTANCES, e.importance)}`,
      `Tags: ${e.tags.length ? e.tags.join(", ") : NP}`,
    ];
    if (opts.includeUploadTimestamps) lines.push(`Uploaded: ${fmtDate(e.uploaded_at)}`);
    if (opts.includeOriginalFilenames)
      lines.push(`Original filename: ${orNP(e.file_name)}${e.file_size ? ` (${formatBytes(e.file_size)}, ${e.file_type || "unknown type"})` : ""}`);
    if (opts.includeFileHashes)
      lines.push(`File fingerprint (SHA-256): ${e.file_hash || NP}`);
    if (!opts.hidePrivateNotes && e.private_note.trim())
      lines.push(`Private note: ${e.private_note}`);
    sections.push({ heading: `Evidence ${i + 1}: ${e.title}`, lines });
  }

  const comms = communications.sort(
    (a, b) => new Date(a.happened_at).getTime() - new Date(b.happened_at).getTime()
  );
  sections.push({
    heading: "Communications & follow-up history",
    lines: comms.length
      ? comms.map(
          (c) =>
            `${fmtDate(c.happened_at)} — ${c.type} — Contacted: ${orNP(c.person_contacted)} — ${orNP(c.summary)} — Outcome: ${orNP(c.outcome)}`
        )
      : [NP],
  });

  if (opts.includeFileHashes) {
    const withFiles = included.filter((e) => e.file_hash);
    sections.push({
      heading: "File fingerprints (SHA-256)",
      lines: withFiles.length
        ? withFiles.map((e) => `${e.title}: ${shortHash(e.file_hash)} (full hash in evidence details)`)
        : ["No hashed files in this packet."],
    });
  }

  return {
    title: kase.title,
    packetTypeLabel: labelFor(PACKET_TYPES, packetType),
    generatedAt: new Date().toISOString(),
    isDemo: kase.is_demo,
    watermark: plan === "free",
    statement: PACKET_STATEMENT,
    disclaimer: DISCLAIMER,
    sections,
  };
}

export function packetToJson(doc: PacketDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function evidenceIndexCsv(evidence: EvidenceItem[]): string {
  const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
  const header = [
    "title",
    "type",
    "importance",
    "created_or_captured_at",
    "uploaded_at",
    "source",
    "tags",
    "file_name",
    "file_size",
    "file_hash",
    "include_in_export",
  ].join(",");
  const rows = evidence.map((e) =>
    [
      esc(e.title),
      esc(e.type),
      esc(e.importance),
      esc(e.created_or_captured_at),
      esc(e.uploaded_at),
      esc(e.source),
      esc(e.tags.join("; ")),
      esc(e.file_name),
      String(e.file_size),
      esc(e.file_hash),
      String(e.include_in_export),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

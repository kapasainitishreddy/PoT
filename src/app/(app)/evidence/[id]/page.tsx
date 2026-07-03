"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Fingerprint, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { deleteEvidence, updateEvidence, useStore } from "@/lib/store";
import { EVIDENCE_TYPES, IMPORTANCES, labelFor } from "@/lib/constants";
import {
  DemoBadge,
  Disclaimer,
  EmptyState,
  ImportanceBadge,
  PageHeader,
} from "@/components/ui";
import { formatBytes, hashFile } from "@/lib/hash";

export default function EvidenceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { evidence, cases } = useStore();
  const [verify, setVerify] = useState<"idle" | "checking" | "match" | "mismatch">("idle");

  const item = evidence.find((e) => e.id === params.id);
  if (!item) {
    return (
      <EmptyState
        title="Evidence not found"
        action={<Link href="/evidence" className="btn-primary">Back to evidence</Link>}
      />
    );
  }

  const kase = cases.find((c) => c.id === item.case_id);

  const verifyFile = async (f: File | null) => {
    if (!f || !item.file_hash) return;
    setVerify("checking");
    const hash = await hashFile(f);
    setVerify(hash === item.file_hash ? "match" : "mismatch");
  };

  const rows: [string, string][] = [
    ["Type", labelFor(EVIDENCE_TYPES, item.type)],
    ["Importance", labelFor(IMPORTANCES, item.importance)],
    ["Created/captured", item.created_or_captured_at ? new Date(item.created_or_captured_at).toLocaleString() : "Not provided."],
    ["Uploaded", new Date(item.uploaded_at).toLocaleString()],
    ["Source", item.source || "Not provided."],
    ["Related event", item.related_event || "Not provided."],
    ["Original filename", item.file_name || "No file attached"],
    ["File size", item.file_size ? formatBytes(item.file_size) : "—"],
    ["File type", item.file_type || "—"],
  ];

  return (
    <div>
      <PageHeader
        title={item.title}
        subtitle={kase ? `Case: ${kase.title}` : "Evidence detail"}
        actions={
          <button
            className="btn-danger"
            onClick={() => {
              if (window.confirm("Delete this evidence item? This cannot be undone.")) {
                deleteEvidence([item.id]);
                router.replace("/evidence");
              }
            }}
          >
            <Trash2 size={15} /> Delete
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DemoBadge show={item.is_demo} />
        <ImportanceBadge importance={item.importance} />
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={item.include_in_export}
            onChange={(e) => updateEvidence(item.id, { include_in_export: e.target.checked })}
            className="accent-[#e9c176]"
          />
          Include in export packets
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="section-title mb-2">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-ivory/90">
              {item.description || "Not provided."}
            </p>
            {item.tags.length ? (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span key={t} className="rounded bg-navy-700 px-2 py-0.5 text-xs text-muted">
                    {t}
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          {item.file_data_url && item.file_type.startsWith("image/") ? (
            <div className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.file_data_url}
                alt={`Attachment: ${item.title}`}
                className="max-h-[480px] w-full object-contain"
              />
            </div>
          ) : null}

          {item.private_note ? (
            <div className="card p-5">
              <h2 className="section-title mb-2">Private note</h2>
              <p className="text-sm text-muted">{item.private_note}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="section-title mb-3">Metadata</h2>
            <dl className="space-y-3">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-gold p-5">
            <h2 className="section-title mb-2 flex items-center gap-2">
              <Fingerprint size={16} className="text-gold" /> File fingerprint
            </h2>
            {item.file_hash ? (
              <>
                <p className="break-all font-mono text-xs text-emeraldx">{item.file_hash}</p>
                <p className="mt-2 text-xs text-muted">
                  SHA-256 computed in your browser at upload time. Re-select the
                  original file to verify it hasn&apos;t changed:
                </p>
                <label className="btn-outline mt-3 w-full cursor-pointer">
                  Verify original file
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => void verifyFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {verify === "checking" ? (
                  <p className="mt-2 text-xs text-muted">Comparing fingerprints…</p>
                ) : verify === "match" ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-emeraldx">
                    <ShieldCheck size={14} /> Fingerprint match — file is unchanged.
                  </p>
                ) : verify === "mismatch" ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                    <ShieldX size={14} /> Fingerprint mismatch — this file differs
                    from the original upload.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-xs text-muted">
                No file attached, so no fingerprint was generated.
              </p>
            )}
          </div>

          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FileUp, Fingerprint } from "lucide-react";
import { createEvidence, useStore } from "@/lib/store";
import { useAppUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import {
  EVIDENCE_TYPES,
  IMPORTANCES,
  ORIGINALS_WARNING,
} from "@/lib/constants";
import type { EvidenceType, Importance } from "@/lib/types";
import { Field, PageHeader, WarningBanner } from "@/components/ui";
import { formatBytes, hashFile } from "@/lib/hash";

// Files up to this size are kept inline in local mode. Larger files keep
// metadata + hash only; in Supabase mode files go to the private bucket.
const INLINE_LIMIT = 2 * 1024 * 1024;

function NewEvidenceForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { user } = useAppUser();
  const { cases, evidence, subscription } = useStore();
  const plan = getPlan(subscription.plan);

  const [caseId, setCaseId] = useState(search.get("case") ?? "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EvidenceType>("photo");
  const [capturedAt, setCapturedAt] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [relatedEvent, setRelatedEvent] = useState("");
  const [importance, setImportance] = useState<Importance>("medium");
  const [tags, setTags] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [includeInExport, setIncludeInExport] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [hashing, setHashing] = useState(false);
  const [error, setError] = useState("");

  const atLimit = evidence.length >= plan.evidenceLimit;

  const onFile = async (f: File | null) => {
    setFile(f);
    setFileHash("");
    setFileDataUrl("");
    if (!f) return;
    setHashing(true);
    try {
      const hash = await hashFile(f);
      setFileHash(hash);
      if (f.size <= INLINE_LIMIT) {
        const reader = new FileReader();
        reader.onload = () => setFileDataUrl(String(reader.result ?? ""));
        reader.readAsDataURL(f);
      }
    } finally {
      setHashing(false);
    }
  };

  const submit = () => {
    if (!caseId) return setError("Choose a case for this evidence.");
    if (title.trim().length < 3) return setError("Give the evidence a short title.");
    setError("");
    const item = createEvidence({
      clerk_user_id: user?.id ?? "local-user",
      case_id: caseId,
      title: title.trim(),
      type,
      created_or_captured_at: capturedAt
        ? new Date(capturedAt).toISOString()
        : new Date().toISOString(),
      uploaded_at: new Date().toISOString(),
      description,
      source,
      related_event: relatedEvent,
      importance,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      file_name: file?.name ?? "",
      file_type: file?.type ?? "",
      file_size: file?.size ?? 0,
      file_hash: fileHash,
      file_data_url: fileDataUrl,
      file_url: "",
      private_note: privateNote,
      include_in_export: includeInExport,
      is_demo: false,
    });
    router.push(`/evidence/${item.id}`);
  };

  if (atLimit) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold">
          {plan.name} plan limit reached ({plan.evidenceLimit} evidence items).
        </p>
        <Link href="/billing" className="btn-primary mt-4">Upgrade plan</Link>
      </div>
    );
  }

  return (
    <div className="card space-y-5 p-6">
      <Field label="Case">
        <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
          <option value="">Select a case…</option>
          {cases
            .filter((c) => !c.is_archived)
            .map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
        </select>
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Evidence title">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Photo of damaged package"
          />
        </Field>
        <Field label="Evidence type">
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as EvidenceType)}
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Date/time evidence was created or captured">
          <input
            type="datetime-local"
            className="input"
            value={capturedAt}
            onChange={(e) => setCapturedAt(e.target.value)}
          />
        </Field>
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
      </div>

      <Field label="Attachment file (kept exactly as uploaded)">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-navy-900 px-4 py-8 text-center hover:border-gold/50">
          <FileUp size={22} className="text-gold" />
          <span className="text-sm">
            {file ? file.name : "Click to choose a file"}
          </span>
          {file ? (
            <span className="text-xs text-muted">
              {formatBytes(file.size)} · {file.type || "unknown type"}
            </span>
          ) : (
            <span className="text-xs text-muted">
              Photos, screenshots, PDFs, audio, video…
            </span>
          )}
          <input
            type="file"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {hashing ? (
          <p className="mt-2 text-xs text-muted">Computing SHA-256 fingerprint…</p>
        ) : fileHash ? (
          <p className="mt-2 flex items-center gap-1.5 break-all text-xs text-emeraldx">
            <Fingerprint size={13} className="shrink-0" /> {fileHash}
          </p>
        ) : null}
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Source / person / company">
          <input className="input" value={source} onChange={(e) => setSource(e.target.value)} />
        </Field>
        <Field label="Related event">
          <input
            className="input"
            value={relatedEvent}
            onChange={(e) => setRelatedEvent(e.target.value)}
            placeholder="e.g. Delivery day"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          className="input min-h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this evidence show?"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Tags (comma separated)">
          <input
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="damage, delivery"
          />
        </Field>
        <Field label="Private note (excluded from exports by default)">
          <input
            className="input"
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeInExport}
          onChange={(e) => setIncludeInExport(e.target.checked)}
          className="accent-[#e9c176]"
        />
        Include in export packets
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={() => router.back()}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={hashing}>
          Save evidence
        </button>
      </div>
    </div>
  );
}

export default function NewEvidencePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Add evidence"
        subtitle="The original file is never modified by this app."
      />
      <div className="mb-5">
        <WarningBanner>{ORIGINALS_WARNING}</WarningBanner>
      </div>
      <Suspense fallback={<div className="card p-6 text-sm text-muted">Loading…</div>}>
        <NewEvidenceForm />
      </Suspense>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Copy, MessageSquareText, Save, Trash2 } from "lucide-react";
import { deleteScript, saveScript, useStore } from "@/lib/store";
import { useAppUser } from "@/lib/auth";
import {
  generateScript,
  SCRIPT_TYPES,
  TONES,
  type ScriptType,
  type Tone,
} from "@/lib/scripts";
import { Field, PageHeader, WarningBanner } from "@/components/ui";

function ScriptsInner() {
  const search = useSearchParams();
  const { user } = useAppUser();
  const { cases, scripts } = useStore();
  const [caseId, setCaseId] = useState(search.get("case") ?? "");
  useEffect(() => {
    if (!caseId && cases.length > 0) setCaseId(cases[0].id);
  }, [cases.length, caseId]);
  const [type, setType] = useState<ScriptType>("ask_update");
  const [tone, setTone] = useState<Tone>("professional");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const kase = cases.find((c) => c.id === caseId);

  const generate = () => {
    setOutput(
      generateScript(type, tone, {
        caseTitle: kase?.title ?? "",
        organization: kase?.organization ?? "",
        desiredOutcome: kase?.desired_outcome ?? "",
      })
    );
    setCopied(false);
  };

  return (
    <div>
      <PageHeader
        title="Follow-up Script Generator"
        subtitle="Calm, professional messages. No threats, no false claims — ever."
      />
      <div className="mb-5">
        <WarningBanner>
          Scripts use placeholders like [date] and [Your name] — fill them with
          real details before sending. Never send anything untrue.
        </WarningBanner>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card space-y-4 p-5">
          <Field label="Case (optional — fills in details)">
            <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
              <option value="">No case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Message type">
            <select className="input" value={type} onChange={(e) => setType(e.target.value as ScriptType)}>
              {SCRIPT_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Tone">
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  className={tone === t.value ? "btn-primary flex-1" : "btn-ghost flex-1"}
                  onClick={() => setTone(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <button className="btn-primary w-full" onClick={generate}>
            <MessageSquareText size={16} /> Generate script
          </button>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="section-title mb-3">Draft</h2>
            {output ? (
              <>
                <textarea
                  className="input min-h-64 font-mono text-[13px] leading-relaxed"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn-outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(output);
                      setCopied(true);
                    }}
                  >
                    <Copy size={15} /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() =>
                      saveScript({
                        clerk_user_id: user?.id ?? "local-user",
                        case_id: caseId,
                        script_type: type,
                        tone,
                        body: output,
                        is_demo: false,
                      })
                    }
                  >
                    <Save size={15} /> Save script
                  </button>
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-muted">
                Choose a type and tone, then generate a draft you can edit.
              </p>
            )}
          </div>

          {scripts.length > 0 ? (
            <div className="card p-5">
              <h2 className="section-title mb-3">Saved scripts</h2>
              <ul className="divide-y divide-line">
                {scripts.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {SCRIPT_TYPES.find((t) => t.value === s.script_type)?.label ?? s.script_type}
                        <span className="ml-2 text-xs text-muted">({s.tone})</span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-xs text-muted">
                        {s.body}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        className="btn-ghost px-2 py-1"
                        onClick={() => void navigator.clipboard.writeText(s.body)}
                        title="Copy"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        className="btn-danger px-2 py-1"
                        onClick={() => deleteScript(s.id)}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ScriptsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <ScriptsInner />
    </Suspense>
  );
}

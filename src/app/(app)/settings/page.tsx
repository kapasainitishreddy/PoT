"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Download,
  KeyRound,
  Lock,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAppUser, clerkEnabled } from "@/lib/auth";
import { clearDemoData, exportAllData, useStore } from "@/lib/store";
import { removeLocalWorkspaceData } from "@/lib/local-data";
import { getPlan } from "@/lib/plans";
import { download } from "@/lib/packet";
import { clearPin, pinIsSet, setPin } from "@/components/PinLock";
import { Disclaimer, PageHeader, UsageMeter } from "@/components/ui";

export default function SettingsPage() {
  const { user, signOutLocal } = useAppUser();
  const { cases, evidence, subscription } = useStore();
  const plan = getPlan(subscription.plan);
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => setHasPin(pinIsSet()), []);

  const activeCases = cases.filter((c) => !c.is_archived && !c.is_demo).length;
  const realEvidence = evidence.filter((e) => !e.is_demo).length;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Profile, privacy, security, and your data." />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <UserRound size={17} className="text-gold" /> Profile
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Name</dt>
              <dd>{user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Email</dt>
              <dd>{user?.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Account mode</dt>
              <dd>
                {clerkEnabled
                  ? "Clerk account (manage profile & two-factor authentication in the Clerk user menu)"
                  : "Local device workspace — configure Clerk keys for cloud accounts and 2FA"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-3">Plan &amp; usage</h2>
          <p className="mb-4 text-sm">
            Current plan: <span className="font-semibold text-gold">{plan.name}</span>{" "}
            (${plan.price}/month) ·{" "}
            <Link href="/billing" className="text-gold hover:underline">Manage billing</Link>
          </p>
          <div className="space-y-4">
            <UsageMeter label="Active cases" used={activeCases} limit={plan.caseLimit} />
            <UsageMeter label="Evidence items" used={realEvidence} limit={plan.evidenceLimit} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Lock size={17} className="text-gold" /> App lock (PIN)
          </h2>
          <p className="text-sm text-muted">
            Add a 4-digit privacy screen on this device. Only a hash of the PIN
            is stored, and only on this device.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              className="input w-32 text-center tracking-[0.4em]"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            />
            <button
              className="btn-outline"
              disabled={newPin.length !== 4}
              onClick={async () => {
                await setPin(newPin);
                setNewPin("");
                setHasPin(true);
                setPinMsg("PIN set. Use “Lock app” in the sidebar to lock.");
              }}
            >
              <KeyRound size={15} /> {hasPin ? "Change PIN" : "Set PIN"}
            </button>
            {hasPin ? (
              <button
                className="btn-ghost"
                onClick={() => {
                  clearPin();
                  setHasPin(false);
                  setPinMsg("PIN removed.");
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
          {pinMsg ? <p className="mt-2 text-xs text-emeraldx">{pinMsg}</p> : null}
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <ShieldCheck size={17} className="text-gold" /> Privacy &amp; security
          </h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>• Every case belongs to your account only — no public evidence.</li>
            <li>• Case sharing is disabled in this version.</li>
            <li>• Local mode keeps all data in this browser; cloud mode uses Row Level Security.</li>
            <li>• Files are fingerprinted with SHA-256 and never modified.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-gold hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-3">Your data</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-outline"
              onClick={() =>
                download("prooftimeline-export.json", exportAllData(), "application/json")
              }
            >
              <Download size={15} /> Export all data (JSON)
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                if (window.confirm("Remove all demo cases and demo evidence?")) clearDemoData();
              }}
            >
              <Trash2 size={15} /> Remove demo data
            </button>
            {!clerkEnabled ? (
              <button
                className="btn-danger"
                onClick={() => {
                  if (!user) return;
                  const confirmed = window.confirm(
                    "Permanently delete this local workspace from this browser? This removes all cases, evidence, inline files, timelines, scripts, the local profile, and the app PIN. This cannot be undone. Export your data first if you need a copy."
                  );
                  if (!confirmed) return;

                  if (!removeLocalWorkspaceData(window.localStorage, user.id)) {
                    window.alert(
                      "ProofTimeline could not delete the local workspace. Your data was left in place."
                    );
                    return;
                  }

                  clearPin();
                  signOutLocal();
                  window.location.replace("/");
                }}
              >
                <Trash2 size={15} /> Delete local workspace
              </button>
            ) : (
              <button
                className="btn-danger cursor-not-allowed opacity-60"
                disabled
                aria-disabled="true"
                title="Cloud account deletion is not configured in this prototype"
              >
                <Trash2 size={15} /> Cloud deletion not configured
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted">
            {clerkEnabled
              ? "Cloud account deletion is not wired in this prototype, so ProofTimeline does not claim that pressing a control will remove Clerk, Supabase, or storage records. Production deletion must be verified end to end before this control is enabled."
              : "Delete local workspace removes this browser’s ProofTimeline data, local profile, and app-lock PIN. It does not affect exported copies you saved elsewhere."}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

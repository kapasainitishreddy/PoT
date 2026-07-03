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
import { getPlan } from "@/lib/plans";
import { download } from "@/lib/packet";
import { clearPin, pinIsSet, setPin } from "@/components/PinLock";
import { Disclaimer, PageHeader, UsageMeter } from "@/components/ui";

export default function SettingsPage() {
  const { user } = useAppUser();
  const { cases, evidence, subscription } = useStore();
  const plan = getPlan(subscription.plan);
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => setHasPin(pinIsSet()), []);

  const activeCases = cases.filter((c) => !c.is_archived).length;

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
            <UsageMeter label="Evidence items" used={evidence.length} limit={plan.evidenceLimit} />
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
            <button
              className="btn-danger"
              onClick={() =>
                window.alert(
                  "Account deletion: in cloud mode this removes your Clerk account and all Supabase rows. Coming with production setup."
                )
              }
            >
              <Trash2 size={15} /> Delete account
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { createDemoUser } from "@/lib/auth";

export default function LocalAuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(mode === "sign-in");

  return (
    <div className="card-gold w-full max-w-md p-7">
      <h1 className="font-display text-xl font-semibold">
        {mode === "sign-in" ? "Open your workspace" : "Create your workspace"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "sign-in"
          ? "Local mode: your data lives only in this browser."
          : "Create a secure place for proof, timelines, and evidence packets."}
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="label">Email (optional)</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {mode === "sign-up" ? (
          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#e9c176]"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-gold hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-gold hover:underline">
                Privacy Policy
              </Link>
              , and I will only upload truthful information.
            </span>
          </label>
        ) : null}
        <button
          className="btn-primary w-full"
          disabled={!agreed}
          onClick={() => {
            createDemoUser(name, email);
            // Full navigation so the auth provider re-reads the local user.
            window.location.assign("/dashboard");
          }}
        >
          {mode === "sign-in" ? "Continue" : "Create workspace"}
        </button>
        <p className="text-center text-[11px] text-muted">
          Clerk sign-in activates automatically once Clerk keys are configured
          — see .env.example.
        </p>
      </div>
    </div>
  );
}
